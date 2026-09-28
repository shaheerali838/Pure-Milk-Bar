export const ROLE_OPTIONS = [
  "Dairy Manager",
  "Cashier",
  "Farm Supervisor",
  "Delivery Rider",
  "Milking Staff",
  "Farm Worker",
  "Accountant",
  "Security Guard",
];

export const SHIFT_OPTIONS = ["Morning", "Evening", "Both"];

export const STATUS_OPTIONS = ["Active", "On Leave", "Inactive"];

// Helper to generate a random strong password for onboarding
export const generateRandomPassword = (length = 10) => {
  const chars =
    "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let pwd = "Pmb@";
  for (let i = 0; i < length - 4; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

export const initialStaffForm = {
  id: "",
  name: "",
  role: "Dairy Manager",
  shift: "Morning",
  mobile: "",
  email: "",
  cnic: "",
  monthlySalary: "",
  status: "Active",
  joinedDate: new Date().toISOString().split("T")[0],
  route: "",
  address: "",
  emergencyContact: "",
  notes: "",
  image: "",
  // Portal account & credentials options
  createLoginAccount: true,
  username: "",
  password: "",
  sendEmailCredentials: true,
  // Dynamic fields
  vehicleNumber: "",
  licenseNumber: "",
  vehicleType: "Motorcycle",
  assignedBarn: "",
  milkingShiftSpecialization: "Morning & Evening",
  assignedCattleCount: "",
  guardPost: "Main Gate",
  weaponLicense: "",
  posRegisterId: "Counter 1",
  khataAuthLimit: "",
  departmentSupervised: "Livestock & Milking",
};
