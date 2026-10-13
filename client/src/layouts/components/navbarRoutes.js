import {
  LayoutGrid,
  Tractor,
  Beef,
  Droplets,
  Receipt,
  TrendingUp,
  Calendar,
  ShoppingCart,
  Package,
  Layers,
  Users,
  Wallet,
  Truck,
  ShieldCheck,
} from 'lucide-react';

export const APP_ROUTES = [
  { label: 'Dashboard Overview', path: '/dashboard', icon: LayoutGrid, category: 'Pages', keywords: ['home', 'overview', 'main', 'summary'] },
  { label: 'Farm Operations & Shed', path: '/farm', icon: Tractor, category: 'Pages', keywords: ['shed', 'cattle', 'livestock', 'dairy'] },
  { label: 'Animals Herd Register', path: '/farm/animals', icon: Beef, category: 'Pages', keywords: ['cows', 'buffalo', 'herd', 'tag', 'animals'] },
  { label: 'Milking Production Register', path: '/farm/milking', icon: Droplets, category: 'Pages', keywords: ['morning', 'evening', 'yield', 'liters', 'milk'] },
  { label: 'Farm Operating Expenses', path: '/farm/expenses', icon: Receipt, category: 'Pages', keywords: ['costs', 'feed', 'silage', 'wanda', 'expense', 'bills'] },
  { label: 'Farm Profit & Loss (P&L)', path: '/farm/pl', icon: TrendingUp, category: 'Pages', keywords: ['profit', 'loss', 'p&l', 'margin', 'financial', 'earnings', 'rupee', 'bachat'] },
  { label: 'Farm Daily Sheet Audit', path: '/farm/dailysheet', icon: Calendar, category: 'Pages', keywords: ['daily', 'audit', 'reconciliation', 'sheet'] },
  { label: 'POS Terminal (Point of Sale)', path: '/pos', icon: ShoppingCart, category: 'Pages', keywords: ['pos', 'sales', 'billing', 'counter', 'cart', 'invoice'] },
  { label: 'Product Inventory & Catalog', path: '/products', icon: Package, category: 'Pages', keywords: ['products', 'inventory', 'stock', 'items', 'catalog'] },
  { label: 'Dahi Processing Hub', path: '/dahi', icon: Layers, category: 'Pages', keywords: ['dahi', 'yogurt', 'curd', 'batch', 'processing', 'fermentation'] },
  { label: 'Milk Suppliers Directory', path: '/supplier', icon: Users, category: 'Pages', keywords: ['suppliers', 'intake', 'procurement', 'dairy farmers'] },
  { label: 'Supplier Procurement Sheet', path: '/supplier/procurement', icon: Receipt, category: 'Pages', keywords: ['procurement', 'supplier rates', 'milk fat', 'lr'] },
  { label: 'Staff Management & Payroll', path: '/staff', icon: Users, category: 'Pages', keywords: ['staff', 'employees', 'salary', 'payroll', 'attendance', 'wages'] },
  { label: 'Customers Directory', path: '/customer', icon: Users, category: 'Pages', keywords: ['customers', 'clients', 'directory', 'phone'] },
  { label: 'Customer Khata Ledger', path: '/customer-khata-ledger', icon: Wallet, category: 'Pages', keywords: ['khata', 'ledger', 'balance', 'udhar', 'receivables'] },
  { label: 'Doorstep Deliveries & Fleet', path: '/delivery', icon: Truck, category: 'Pages', keywords: ['delivery', 'riders', 'drop points', 'fleet', 'fuel'] },
  { label: 'Daily Closing & Audit', path: '/finance/daily-closing', icon: ShieldCheck, category: 'Pages', keywords: ['closing', 'cash audit', 'counter summary', 'shift'] },
];

export function getBreadcrumbs(pathname, search, { animals = [], staffList = [], deliveries = [] } = {}) {
  const searchParams = new URLSearchParams(search);
  const tabParam = searchParams.get('tab');
  const viewParam = searchParams.get('view');
  const idParam = searchParams.get('id');

  const crumbs = [
    {
      label: 'Pure Milk Bar',
      to: '/dashboard',
      isRoot: true,
    },
  ];

  if (pathname.startsWith('/delivery')) {
    crumbs.push({
      label: 'Doorstep Deliveries',
      to: '/delivery',
    });

    if (tabParam === 'fleet') {
      crumbs.push({
        label: 'Fleet & Staff',
        to: '/delivery?tab=fleet',
      });
      if (viewParam === 'registerStaff') {
        crumbs.push({ label: 'Register New Staff', to: null });
      } else if (viewParam === 'viewStaff') {
        const matchedStaff = staffList.find((s) => String(s.id) === String(idParam));
        crumbs.push({
          label: matchedStaff ? `${matchedStaff.name}` : 'Staff Details',
          to: null,
        });
      }
    } else if (tabParam === 'fuel') {
      crumbs.push({
        label: 'Fuel Log',
        to: '/delivery?tab=fuel',
      });
      if (viewParam === 'logFuel') {
        crumbs.push({ label: 'Log Fuel Receipt', to: null });
      }
    } else {
      crumbs.push({
        label: 'Drop Points',
        to: '/delivery?tab=drop-points',
      });
      if (viewParam === 'bookDelivery') {
        crumbs.push({ label: 'Book New Delivery', to: null });
      } else if (viewParam === 'viewDelivery') {
        const matchedDelivery = deliveries.find((d) => String(d.id) === String(idParam));
        crumbs.push({
          label: matchedDelivery
            ? `${matchedDelivery.runCode} (${matchedDelivery.customerName})`
            : 'Delivery Details',
          to: null,
        });
      }
    }
    return crumbs;
  }

  if (pathname.startsWith('/farm')) {
    crumbs.push({
      label: 'Farm Operations',
      to: '/farm',
    });

    if (pathname.includes('/animals/detail/')) {
      const animalId = pathname.split('/animals/detail/')[1];
      const matchedAnimal = animals.find(
        (a) => String(a.id) === String(animalId) || String(a.tag).toLowerCase() === String(animalId).toLowerCase()
      );
      crumbs.push({ label: 'Animals Herd', to: '/farm/animals' });
      crumbs.push({
        label: matchedAnimal ? `${matchedAnimal.tag} (${matchedAnimal.species})` : 'Animal Details',
        to: null,
      });
    } else if (pathname.includes('/animals')) {
      crumbs.push({ label: 'Animals Herd', to: '/farm/animals' });
    } else if (pathname.includes('/expenses/new')) {
      crumbs.push({ label: 'Farm Expenses', to: '/farm/expenses' });
      crumbs.push({ label: 'Record New Expense', to: null });
    } else if (pathname.includes('/expenses/edit/')) {
      crumbs.push({ label: 'Farm Expenses', to: '/farm/expenses' });
      crumbs.push({ label: 'Edit Expense', to: null });
    } else if (pathname.includes('/expenses/detail/')) {
      crumbs.push({ label: 'Farm Expenses', to: '/farm/expenses' });
      crumbs.push({ label: 'Expense Details', to: null });
    } else if (pathname.includes('/expenses')) {
      crumbs.push({ label: 'Farm Expenses', to: '/farm/expenses' });
    } else if (pathname.includes('/milking')) {
      crumbs.push({ label: 'Milking Register', to: '/farm/milking' });
    } else if (pathname.includes('/processing')) {
      crumbs.push({ label: 'Dahi Processing', to: '/farm/processing' });
    } else if (pathname.includes('/pl')) {
      crumbs.push({ label: 'Farm P&L', to: '/farm/pl' });
    } else if (pathname.includes('/dailysheet')) {
      crumbs.push({ label: 'Daily Sheet', to: '/farm/dailysheet' });
    } else {
      crumbs.push({ label: 'Farm Dashboard', to: '/farm' });
    }
    return crumbs;
  }

  if (pathname.startsWith('/customer-khata-ledger')) {
    crumbs.push({ label: 'Customer Management', to: '/customer' });
    crumbs.push({ label: 'Customer Khata Ledger', to: '/customer-khata-ledger' });
    return crumbs;
  }

  if (pathname.startsWith('/customer')) {
    crumbs.push({ label: 'Customer Management', to: '/customer' });
    crumbs.push({ label: 'Customers Directory', to: '/customer' });
    return crumbs;
  }

  if (pathname.startsWith('/finance/delivery')) {
    crumbs.push({ label: 'Finance & Accounts', to: '/finance/customer' });
    crumbs.push({ label: 'Rider & Delivery Finance', to: '/finance/delivery' });
    return crumbs;
  }

  if (pathname.startsWith('/finance/customer')) {
    crumbs.push({ label: 'Finance & Accounts', to: '/finance/customer' });
    crumbs.push({ label: 'Customer Finance Ledger', to: '/finance/customer' });
    return crumbs;
  }

  if (pathname.startsWith('/finance/daily-closing')) {
    crumbs.push({ label: 'Finance & Accounts', to: '/finance/daily-closing' });
    crumbs.push({ label: 'Daily Closing & Audit', to: '/finance/daily-closing' });
    return crumbs;
  }

  if (pathname.startsWith('/finance/staff') || pathname.startsWith('/staff')) {
    crumbs.push({ label: 'Staff Management', to: '/staff' });
    crumbs.push({ label: 'Staff Directory & Payroll', to: '/staff' });
    return crumbs;
  }

  if (pathname.startsWith('/supplier')) {
    crumbs.push({ label: 'Supplier Sourcing', to: '/supplier' });
    crumbs.push({ label: 'Milk Suppliers', to: '/supplier' });
    return crumbs;
  }

  if (pathname.startsWith('/proccessing') || pathname.startsWith('/dahi') || pathname.startsWith('/processing')) {
    crumbs.push({ label: 'Processing & Batching', to: '/dahi' });
    crumbs.push({ label: 'Dahi Processing', to: '/dahi' });
    return crumbs;
  }

  if (pathname.startsWith('/pos')) {
    crumbs.push({ label: 'Sales & Billing', to: '/pos' });
    crumbs.push({ label: 'Counter Point of Sale', to: '/pos' });
    return crumbs;
  }

  if (pathname.startsWith('/products')) {
    crumbs.push({ label: 'Product Inventory', to: '/products' });
    crumbs.push({ label: 'Dairy Catalog', to: '/products' });
    return crumbs;
  }

  crumbs.push({ label: 'Dashboard Overview', to: '/dashboard' });
  return crumbs;
}

export function getDefaultModule(pathname) {
  if (pathname.includes('/farm/animals') || pathname.includes('/farm/milking')) return 'animals';
  if (pathname.includes('/farm/expenses')) return 'expenses';
  if (pathname.startsWith('/farm')) return 'daily_closing';
  if (pathname.startsWith('/pos')) return 'pos_sales';
  if (pathname.startsWith('/delivery')) return 'deliveries';
  if (pathname.startsWith('/customer-khata-ledger') || pathname.startsWith('/finance/customer')) return 'khata_ledger';
  if (pathname.startsWith('/customer')) return 'customers';
  if (pathname.startsWith('/products') || pathname.startsWith('/proccessing')) return 'products';
  if (pathname.startsWith('/staff') || pathname.startsWith('/finance/staff')) return 'users';
  if (pathname.startsWith('/supplier')) return 'suppliers';
  if (pathname.startsWith('/finance/daily-closing')) return 'daily_closing';
  return 'all';
}
