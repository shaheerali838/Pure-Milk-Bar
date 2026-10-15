import DailyClosing from '../models/DailyClosing.model.js';
import { getPktDayRange, getPktTodayString } from '../utils/dateUtils.js';

/**
 * Middleware to enforce that daily business operations (POS Sales, Supplier Procurement,
 * Dahi Processing, Farm Milking, Expenses) are blocked when the day is CLOSED.
 */
export const checkDayNotClosed = async (req, res, next) => {
  try {
    // Only block mutating requests (POST, PUT, PATCH, DELETE)
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Determine target date from body, query, or PKT today
    const dateInput = req.body?.date || req.query?.date || req.body?.closingDate || getPktTodayString();
    const { startOfDay, endOfDay, dateStr } = getPktDayRange(dateInput);

    const closedRecord = await DailyClosing.findOne({
      closingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['CLOSED', 'LOCKED', 'APPROVED', 'RECONCILED'] },
    }).lean();

    if (closedRecord) {
      return res.status(403).json({
        success: false,
        isDayClosed: true,
        closedDate: dateStr,
        closingId: closedRecord._id,
        message: `Daily business operations for ${dateStr} are currently CLOSED. Please reopen the day from Daily Closing to perform new transactions.`,
      });
    }

    next();
  } catch (err) {
    console.error('checkDayNotClosed error:', err.message);
    next();
  }
};

export default checkDayNotClosed;
