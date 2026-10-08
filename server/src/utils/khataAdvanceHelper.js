/**
 * Pure Milk Bar ERP - Khata & Advance Helper
 * Single source of truth for advance-first bill calculations and payment ledger accounting.
 */

/**
 * Calculates advance deduction and khata addition for a bill amount.
 * 
 * Logic:
 * 1. advanceAvailable = customer's current advance balance
 * 2. advanceUsed = min(billAmount, advanceAvailable)
 * 3. khataAmount = billAmount - advanceUsed (only this part is added to khata/due)
 * 4. advanceBalanceAfter = advanceAvailable - advanceUsed
 * 
 * @param {number} billAmount - Total order / delivery amount
 * @param {number} advanceAvailable - Customer's available advance balance
 * @param {number} currentKhataBalance - Customer's current khata due balance
 * @returns {{ advanceUsed: number, khataAmount: number, advanceBalanceAfter: number, newKhataBalance: number }}
 */
export function processBillAgainstAdvance(billAmount, advanceAvailable = 0, currentKhataBalance = 0) {
  const bill = Math.max(0, Number(billAmount) || 0);
  const advAvail = Math.max(0, Number(advanceAvailable) || 0);
  const khataCur = Math.max(0, Number(currentKhataBalance) || 0);

  const advanceUsed = Math.min(bill, advAvail);
  const khataAmount = Math.max(0, bill - advanceUsed);
  const advanceBalanceAfter = Math.max(0, advAvail - advanceUsed);
  const newKhataBalance = khataCur + khataAmount;

  return {
    advanceUsed,
    khataAmount,
    advanceBalanceAfter,
    newKhataBalance,
  };
}

/**
 * Calculates payment / deposit application against customer balance.
 * If customer has active khata dues, payment clears khata first.
 * Any surplus amount increases customer's advance balance.
 * 
 * @param {number} paymentAmount - Amount paid / deposited
 * @param {number} currentKhataBalance - Current khata dues
 * @param {number} currentAdvanceBalance - Current advance balance
 * @param {boolean} isExplicitAdvanceDeposit - If explicitly marked as advance deposit
 * @returns {{ khataReduced: number, surplusAdvance: number, newKhataBalance: number, newAdvanceBalance: number }}
 */
export function processPaymentAgainstKhata(
  paymentAmount,
  currentKhataBalance = 0,
  currentAdvanceBalance = 0,
  isExplicitAdvanceDeposit = false
) {
  const payment = Math.max(0, Number(paymentAmount) || 0);
  const khataCur = Math.max(0, Number(currentKhataBalance) || 0);
  const advCur = Math.max(0, Number(currentAdvanceBalance) || 0);

  if (isExplicitAdvanceDeposit) {
    return {
      khataReduced: 0,
      surplusAdvance: payment,
      newKhataBalance: khataCur,
      newAdvanceBalance: advCur + payment,
    };
  }

  const khataReduced = Math.min(payment, khataCur);
  const surplusAdvance = Math.max(0, payment - khataReduced);
  const newKhataBalance = Math.max(0, khataCur - khataReduced);
  const newAdvanceBalance = advCur + surplusAdvance;

  return {
    khataReduced,
    surplusAdvance,
    newKhataBalance,
    newAdvanceBalance,
  };
}

/**
 * Recalculates full chronological statement for a customer, assigning
 * advanceUsed, advanceBalanceAfter, khataAmount, and runningKhataBalance to each row.
 * 
 * Invariants:
 * - Opening Advance is NOT a sale/bill (Total Bill = 0).
 * - For Orders/Deliveries: advanceUsed = min(billAmount, runningAdvance), dueAdded = billAmount - advanceUsed - cashPaid.
 * - For Payments: Total Bill = 0. Payment reduces Due first, any excess creates new Advance.
 * - runningAdvance >= 0 and runningKhata >= 0 always.
 * 
 * @param {Array} rawEntries - Array of ledger transactions
 * @param {Object} customer - Customer document
 * @returns {{ entries: Array, summary: Object, rowMap: Map }}
 */
export function recalculateCustomerStatementChronological(rawEntries = [], customer = {}) {
  const isCustomerAdvanceOpening =
    Number(customer?.advanceBalance) > 0 ||
    String(customer?.openingPaymentMethod || '').toUpperCase().includes('ADVANCE') ||
    customer?.openingPaymentMethod === 'CASH' ||
    customer?.openingPaymentMethod === 'ONLINE';

  const customerOpeningBal = Number(customer?.openingBalance || customer?.advanceBalance || 0);

  // Chronological sort: Opening entries strictly first, then by date and exact createdAt timestamp
  const chronological = [...rawEntries].sort((a, b) => {
    const isOpeningA = a.isOpening || a.type === 'OPENING' || a.transactionType === 'OPENING' || /^KV-OP-/i.test(a.voucherNumber || '') || /^OP-/i.test(a.referenceTransactionId || '') || (/opening/i.test(a.description || '') && !/payment/i.test(a.description || ''));
    const isOpeningB = b.isOpening || b.type === 'OPENING' || b.transactionType === 'OPENING' || /^KV-OP-/i.test(b.voucherNumber || '') || /^OP-/i.test(b.referenceTransactionId || '') || (/opening/i.test(b.description || '') && !/payment/i.test(b.description || ''));
    if (isOpeningA && !isOpeningB) return -1;
    if (!isOpeningA && isOpeningB) return 1;

    const dateA = new Date(a.date || a.createdAt || 0).getTime();
    const dateB = new Date(b.date || b.createdAt || 0).getTime();
    if (dateA !== dateB) return dateA - dateB;

    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    if (timeA && timeB && timeA !== timeB) return timeA - timeB;

    return String(a.voucherNumber || a.referenceTransactionId || a._id || a.id || '').localeCompare(
      String(b.voucherNumber || b.referenceTransactionId || b._id || b.id || '')
    );
  });

  let runningAdvance = 0;
  let runningKhata = 0;
  let totalAdvanceDeposited = 0;
  let totalAdvanceUsed = 0;
  let totalDebits = 0;
  let totalCredits = 0;

  const rowMap = new Map();

  const processed = chronological.map((entry) => {
    const isOpening =
      entry.isOpening ||
      entry.type === 'OPENING' ||
      entry.transactionType === 'OPENING' ||
      /^KV-OP-/i.test(entry.voucherNumber || '') ||
      /^OP-/i.test(entry.referenceTransactionId || '') ||
      (/opening/i.test(entry.description || '') && !/payment/i.test(entry.description || ''));

    const rawDebit = Number(entry.debitAmount !== undefined ? entry.debitAmount : (entry.debit || 0));
    const rawCredit = Number(entry.creditAmount !== undefined ? entry.creditAmount : (entry.credit || 0));

    // Determine if this is a payment / credit entry
    const isExplicitPayment =
      !isOpening &&
      (
        entry.transactionType === 'CREDIT' ||
        entry.type === 'CREDIT' ||
        (rawCredit > 0 && rawDebit === 0) ||
        /payment|received|settlement|clearance|recovery/i.test(entry.description || '') ||
        /payment|collection/i.test(entry.fulfillmentType || '')
      );

    let advanceUsed = 0;
    let khataAmount = 0;
    let advanceReceived = 0;
    let cashPaid = 0;
    let computedRow = null;

    if (isOpening) {
      const isEntryAdvance = isCustomerAdvanceOpening || rawCredit > 0 || /advance/i.test(entry.description || '') || /advance/i.test(entry.fulfillmentType || '');
      const openingAmount = Math.max(rawCredit, rawDebit, customerOpeningBal);

      if (isEntryAdvance) {
        runningAdvance += openingAmount;
        totalAdvanceDeposited += openingAmount;
        advanceReceived = openingAmount;
      } else {
        runningKhata += openingAmount;
        totalDebits += openingAmount;
        khataAmount = openingAmount;
      }

      computedRow = {
        ...entry,
        isOpening: true,
        isPayment: false,
        orderTotal: isEntryAdvance ? 0 : openingAmount,
        debit: isEntryAdvance ? 0 : openingAmount,
        credit: isEntryAdvance ? openingAmount : 0,
        advanceUsed: 0,
        advanceReceived,
        khataAmount,
        advanceBalanceAfter: runningAdvance,
        runningBalance: runningKhata,
        runningKhataBalance: runningKhata,
      };
    } else if (isExplicitPayment) {
      // Payment received from customer
      const paymentAmount = rawCredit > 0 ? rawCredit : (Number(entry.paidAmount) || Number(entry.amount) || 0);
      totalCredits += paymentAmount;

      const isExplicitAdvance =
        /advance/i.test(entry.description || '') ||
        /advance/i.test(entry.paymentMethod || '') ||
        /advance/i.test(entry.fulfillmentType || '');

      const calc = processPaymentAgainstKhata(paymentAmount, runningKhata, runningAdvance, isExplicitAdvance);
      advanceReceived = calc.surplusAdvance;
      const dueReduced = calc.khataReduced;
      runningKhata = calc.newKhataBalance;
      runningAdvance = calc.newAdvanceBalance;

      if (advanceReceived > 0) {
        totalAdvanceDeposited += advanceReceived;
      }

      computedRow = {
        ...entry,
        isOpening: false,
        isPayment: true,
        orderTotal: 0, // A payment is NOT a bill
        debit: 0,
        credit: paymentAmount,
        paidAmount: paymentAmount,
        advanceUsed: 0,
        advanceReceived,
        dueReduced,
        khataAmount: 0,
        advanceBalanceAfter: runningAdvance,
        runningBalance: runningKhata,
        runningKhataBalance: runningKhata,
      };
    } else {
      // DEBIT / Order / Delivery Bill
      const rawBill = Number(entry.orderTotal !== undefined && Number(entry.orderTotal) > 0 ? entry.orderTotal : (rawDebit > 0 ? rawDebit : (entry.amount || 0)));
      const billAmount = Math.max(0, rawBill);
      const directCash = Math.max(0, Number(entry.paidAmount || 0));

      totalDebits += billAmount;

      const calc = processBillAgainstAdvance(billAmount, runningAdvance, runningKhata);
      advanceUsed = calc.advanceUsed;
      const uncoveredAfterAdv = calc.khataAmount;

      // If customer also paid direct cash at delivery/checkout, apply cash against the remaining uncovered part
      cashPaid = Math.min(uncoveredAfterAdv, directCash);
      khataAmount = Math.max(0, uncoveredAfterAdv - cashPaid);

      runningAdvance = calc.advanceBalanceAfter;
      runningKhata = runningKhata + khataAmount;

      totalAdvanceUsed += advanceUsed;
      if (cashPaid > 0) {
        totalCredits += cashPaid;
      }

      computedRow = {
        ...entry,
        isOpening: false,
        isPayment: false,
        orderTotal: billAmount,
        debit: billAmount,
        credit: 0,
        advanceUsed,
        cashPaid,
        paidAmount: advanceUsed + cashPaid,
        khataAmount,
        advanceReceived: 0,
        advanceBalanceAfter: runningAdvance,
        runningBalance: runningKhata,
        runningKhataBalance: runningKhata,
      };
    }

    rowMap.set(entry, computedRow);
    if (entry._id) rowMap.set(String(entry._id), computedRow);
    if (entry.id) rowMap.set(String(entry.id), computedRow);
    if (entry.voucherNumber) rowMap.set(String(entry.voucherNumber), computedRow);

    return computedRow;
  });

  return {
    entries: processed,
    rowMap,
    summary: {
      totalAdvanceDeposited,
      totalAdvanceUsed,
      advanceRemaining: runningAdvance,
      totalDebits,
      totalCredits,
      closingDueBalance: runningKhata,
    },
  };
}
