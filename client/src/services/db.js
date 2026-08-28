import Dexie from 'dexie';

export const db = new Dexie('PureMilkBarOfflineDB');

db.version(1).stores({
  products: 'id, name, category, price, barcode',
  customers: 'id, name, phone, area, currentBalance, creditLimit',
  offlineSales: '++localId, invoiceNumber, createdAt, synced',
  syncQueue: '++id, endpoint, method, payload, createdAt, attempts',
});