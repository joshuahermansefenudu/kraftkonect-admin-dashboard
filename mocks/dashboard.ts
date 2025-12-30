export interface Metric {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export interface Provider {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  location: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  documents: string[];
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  providerId: string;
  providerName: string;
  service: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  amount: number;
  date: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  type: "payment" | "quality" | "cancellation" | "other";
  severity: "low" | "medium" | "high";
  status: "open" | "resolved" | "escalated";
  description: string;
  createdAt: string;
  reporter: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: "bug" | "payment" | "account" | "other";
  status: "open" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastReply: string;
}

export const mockMetrics: Metric[] = [
  { label: "Total Users", value: "12,459", change: 12.5, icon: "users" },
  { label: "Active Providers", value: "3,847", change: 8.2, icon: "briefcase" },
  { label: "Total Bookings", value: "8,392", change: 15.3, icon: "calendar" },
  { label: "Revenue", value: "$284,590", change: 23.1, icon: "dollar-sign" },
];

export const mockProviders: Provider[] = [
  {
    id: "PRV001",
    name: "John Smith",
    category: "Plumbing",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    status: "pending",
    submittedAt: "2025-01-15T10:30:00Z",
    documents: ["ID Proof", "Trade License", "Insurance"],
  },
  {
    id: "PRV002",
    name: "Sarah Johnson",
    category: "Electrical",
    email: "sarah.j@email.com",
    phone: "+1 (555) 234-5678",
    location: "Los Angeles, CA",
    status: "pending",
    submittedAt: "2025-01-14T14:20:00Z",
    documents: ["ID Proof", "Certification"],
  },
  {
    id: "PRV003",
    name: "Michael Chen",
    category: "Carpentry",
    email: "m.chen@email.com",
    phone: "+1 (555) 345-6789",
    location: "Chicago, IL",
    status: "pending",
    submittedAt: "2025-01-13T09:15:00Z",
    documents: ["ID Proof", "Portfolio", "References"],
  },
];

export const mockBookings: Booking[] = [
  {
    id: "BKG001",
    userId: "USR123",
    userName: "Emily Davis",
    providerId: "PRV045",
    providerName: "Robert Wilson",
    service: "Kitchen Plumbing Repair",
    status: "in-progress",
    amount: 250,
    date: "2025-01-20T14:00:00Z",
  },
  {
    id: "BKG002",
    userId: "USR456",
    userName: "James Brown",
    providerId: "PRV032",
    providerName: "Lisa Anderson",
    service: "Electrical Wiring",
    status: "completed",
    amount: 450,
    date: "2025-01-18T10:30:00Z",
  },
  {
    id: "BKG003",
    userId: "USR789",
    userName: "Maria Garcia",
    providerId: "PRV021",
    providerName: "David Lee",
    service: "Cabinet Installation",
    status: "pending",
    amount: 800,
    date: "2025-01-22T09:00:00Z",
  },
  {
    id: "BKG004",
    userId: "USR003",
    userName: "Michael Chen",
    providerId: "PRV001",
    providerName: "Sarah Johnson",
    service: "Bathroom Plumbing Fix",
    status: "completed",
    amount: 320,
    date: "2025-01-15T11:00:00Z",
  },
  {
    id: "BKG005",
    userId: "USR007",
    userName: "David Lee",
    providerId: "PRV002",
    providerName: "Emily Davis",
    service: "Outlet Installation",
    status: "completed",
    amount: 180,
    date: "2025-01-14T09:30:00Z",
  },
  {
    id: "BKG006",
    userId: "USR009",
    userName: "James Taylor",
    providerId: "PRV005",
    providerName: "Kevin Harris",
    service: "Deep House Cleaning",
    status: "in-progress",
    amount: 220,
    date: "2025-01-21T13:00:00Z",
  },
  {
    id: "BKG007",
    userId: "USR010",
    userName: "Amanda Brown",
    providerId: "PRV008",
    providerName: "Christopher King",
    service: "Custom Bookshelf",
    status: "pending",
    amount: 650,
    date: "2025-01-23T10:00:00Z",
  },
  {
    id: "BKG008",
    userId: "USR014",
    userName: "Jessica White",
    providerId: "PRV010",
    providerName: "Gregory Hill",
    service: "Living Room Painting",
    status: "completed",
    amount: 580,
    date: "2025-01-12T08:30:00Z",
  },
  {
    id: "BKG009",
    userId: "USR016",
    userName: "Patricia Moore",
    providerId: "PRV009",
    providerName: "Nicole Adams",
    service: "Office Cleaning",
    status: "completed",
    amount: 150,
    date: "2025-01-17T14:00:00Z",
  },
  {
    id: "BKG010",
    userId: "USR018",
    userName: "Angela Scott",
    providerId: "PRV011",
    providerName: "Melissa Campbell",
    service: "Emergency Pipe Repair",
    status: "completed",
    amount: 420,
    date: "2025-01-16T16:00:00Z",
  },
  {
    id: "BKG011",
    userId: "USR021",
    userName: "Brandon Wright",
    providerId: "PRV012",
    providerName: "Kimberly Evans",
    service: "Panel Upgrade",
    status: "in-progress",
    amount: 890,
    date: "2025-01-20T10:00:00Z",
  },
  {
    id: "BKG012",
    userId: "USR025",
    userName: "Justin Phillips",
    providerId: "PRV014",
    providerName: "Eric Rogers",
    service: "Move-out Cleaning",
    status: "pending",
    amount: 280,
    date: "2025-01-24T09:00:00Z",
  },
];

export const mockDisputes: Dispute[] = [
  {
    id: "DSP001",
    bookingId: "BKG145",
    type: "quality",
    severity: "high",
    status: "open",
    description: "Work not completed as promised, multiple issues found",
    createdAt: "2025-01-19T16:45:00Z",
    reporter: "Alice Thompson",
  },
  {
    id: "DSP002",
    bookingId: "BKG198",
    type: "payment",
    severity: "medium",
    status: "open",
    description: "Overcharged for materials, requesting refund",
    createdAt: "2025-01-18T11:20:00Z",
    reporter: "Mark Johnson",
  },
  {
    id: "DSP003",
    bookingId: "BKG203",
    type: "cancellation",
    severity: "low",
    status: "resolved",
    description: "Provider cancelled last minute",
    createdAt: "2025-01-15T08:30:00Z",
    reporter: "Tom Harris",
  },
  {
    id: "DSP004",
    bookingId: "BKG004",
    type: "quality",
    severity: "medium",
    status: "open",
    description: "Leak still present after repair, need return visit",
    createdAt: "2025-01-17T14:30:00Z",
    reporter: "Michael Chen",
  },
  {
    id: "DSP005",
    bookingId: "BKG008",
    type: "other",
    severity: "low",
    status: "resolved",
    description: "Wrong paint color used, resolved with repaint",
    createdAt: "2025-01-13T10:00:00Z",
    reporter: "Jessica White",
  },
  {
    id: "DSP006",
    bookingId: "BKG011",
    type: "payment",
    severity: "high",
    status: "escalated",
    description: "Charged double the quoted price without explanation",
    createdAt: "2025-01-20T11:45:00Z",
    reporter: "Brandon Wright",
  },
  {
    id: "DSP007",
    bookingId: "BKG005",
    type: "quality",
    severity: "low",
    status: "resolved",
    description: "Minor cosmetic issue on faceplate",
    createdAt: "2025-01-14T16:00:00Z",
    reporter: "David Lee",
  },
  {
    id: "DSP008",
    bookingId: "BKG232",
    type: "cancellation",
    severity: "medium",
    status: "open",
    description: "Service cancelled without prior notice, need refund",
    createdAt: "2025-01-19T09:15:00Z",
    reporter: "Sandra Martinez",
  },
];

export const mockTickets: Ticket[] = [
  {
    id: "TKT001",
    userId: "USR567",
    userName: "Jennifer Wilson",
    subject: "Unable to complete payment",
    category: "payment",
    status: "in-progress",
    priority: "high",
    createdAt: "2025-01-20T09:15:00Z",
    lastReply: "2025-01-20T10:30:00Z",
  },
  {
    id: "TKT002",
    userId: "USR892",
    userName: "Kevin Martinez",
    subject: "Account verification issue",
    category: "account",
    status: "open",
    priority: "medium",
    createdAt: "2025-01-19T14:20:00Z",
    lastReply: "2025-01-19T14:20:00Z",
  },
  {
    id: "TKT003",
    userId: "USR234",
    userName: "Rachel Green",
    subject: "App crashes on booking",
    category: "bug",
    status: "open",
    priority: "high",
    createdAt: "2025-01-18T16:45:00Z",
    lastReply: "2025-01-18T16:45:00Z",
  },
  {
    id: "TKT004",
    userId: "USR003",
    userName: "Michael Chen",
    subject: "Can't update profile picture",
    category: "account",
    status: "resolved",
    priority: "low",
    createdAt: "2025-01-17T11:00:00Z",
    lastReply: "2025-01-17T14:30:00Z",
  },
  {
    id: "TKT005",
    userId: "USR014",
    userName: "Jessica White",
    subject: "Booking history not loading",
    category: "bug",
    status: "in-progress",
    priority: "medium",
    createdAt: "2025-01-19T10:00:00Z",
    lastReply: "2025-01-19T15:20:00Z",
  },
  {
    id: "TKT006",
    userId: "USR025",
    userName: "Justin Phillips",
    subject: "Refund not received",
    category: "payment",
    status: "open",
    priority: "high",
    createdAt: "2025-01-20T12:30:00Z",
    lastReply: "2025-01-20T12:30:00Z",
  },
  {
    id: "TKT007",
    userId: "USR018",
    userName: "Angela Scott",
    subject: "How to change password?",
    category: "account",
    status: "resolved",
    priority: "low",
    createdAt: "2025-01-16T09:00:00Z",
    lastReply: "2025-01-16T09:45:00Z",
  },
  {
    id: "TKT008",
    userId: "USR021",
    userName: "Brandon Wright",
    subject: "Notification settings not saving",
    category: "bug",
    status: "open",
    priority: "low",
    createdAt: "2025-01-18T13:15:00Z",
    lastReply: "2025-01-18T13:15:00Z",
  },
  {
    id: "TKT009",
    userId: "USR027",
    userName: "Raymond Parker",
    subject: "Payment declined but amount deducted",
    category: "payment",
    status: "in-progress",
    priority: "high",
    createdAt: "2025-01-19T16:00:00Z",
    lastReply: "2025-01-20T08:30:00Z",
  },
];

export interface Payout {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  payoutDate: string;
  bookingsCount: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconUri?: string;
  active: boolean;
  providerCount: number;
  bookingsCount: number;
}

export interface AuditLog {
  id: string;
  adminUser: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  details: string;
  ip: string;
}

export const mockChartData = {
  monthly: [
    { month: "Aug", bookings: 420, revenue: 18500 },
    { month: "Sep", bookings: 580, revenue: 24200 },
    { month: "Oct", bookings: 650, revenue: 28900 },
    { month: "Nov", bookings: 720, revenue: 32400 },
    { month: "Dec", bookings: 890, revenue: 38700 },
    { month: "Jan", bookings: 1050, revenue: 45800 },
  ],
  categories: [
    { name: "Plumbing", value: 32 },
    { name: "Electrical", value: 28 },
    { name: "Carpentry", value: 18 },
    { name: "Painting", value: 12 },
    { name: "Other", value: 10 },
  ],
};

export const mockPayouts: Payout[] = [
  {
    id: "PAY001",
    providerId: "PRV045",
    providerName: "Robert Wilson",
    amount: 2450,
    status: "pending",
    payoutDate: "2025-01-25T00:00:00Z",
    bookingsCount: 12,
  },
  {
    id: "PAY002",
    providerId: "PRV032",
    providerName: "Lisa Anderson",
    amount: 3890,
    status: "processing",
    payoutDate: "2025-01-23T00:00:00Z",
    bookingsCount: 18,
  },
  {
    id: "PAY003",
    providerId: "PRV021",
    providerName: "David Lee",
    amount: 1750,
    status: "completed",
    payoutDate: "2025-01-20T00:00:00Z",
    bookingsCount: 8,
  },
  {
    id: "PAY004",
    providerId: "PRV058",
    providerName: "Michelle Chen",
    amount: 4200,
    status: "completed",
    payoutDate: "2025-01-20T00:00:00Z",
    bookingsCount: 22,
  },
  {
    id: "PAY005",
    providerId: "PRV001",
    providerName: "Sarah Johnson",
    amount: 3240,
    status: "completed",
    payoutDate: "2025-01-20T00:00:00Z",
    bookingsCount: 16,
  },
  {
    id: "PAY006",
    providerId: "PRV002",
    providerName: "Emily Davis",
    amount: 4580,
    status: "processing",
    payoutDate: "2025-01-23T00:00:00Z",
    bookingsCount: 21,
  },
  {
    id: "PAY007",
    providerId: "PRV005",
    providerName: "Kevin Harris",
    amount: 2890,
    status: "pending",
    payoutDate: "2025-01-25T00:00:00Z",
    bookingsCount: 14,
  },
  {
    id: "PAY008",
    providerId: "PRV008",
    providerName: "Christopher King",
    amount: 1920,
    status: "completed",
    payoutDate: "2025-01-18T00:00:00Z",
    bookingsCount: 9,
  },
  {
    id: "PAY009",
    providerId: "PRV009",
    providerName: "Nicole Adams",
    amount: 5430,
    status: "completed",
    payoutDate: "2025-01-20T00:00:00Z",
    bookingsCount: 28,
  },
  {
    id: "PAY010",
    providerId: "PRV010",
    providerName: "Gregory Hill",
    amount: 2670,
    status: "pending",
    payoutDate: "2025-01-25T00:00:00Z",
    bookingsCount: 11,
  },
  {
    id: "PAY011",
    providerId: "PRV011",
    providerName: "Melissa Campbell",
    amount: 3150,
    status: "processing",
    payoutDate: "2025-01-23T00:00:00Z",
    bookingsCount: 15,
  },
  {
    id: "PAY012",
    providerId: "PRV012",
    providerName: "Kimberly Evans",
    amount: 4890,
    status: "completed",
    payoutDate: "2025-01-20T00:00:00Z",
    bookingsCount: 24,
  },
  {
    id: "PAY013",
    providerId: "PRV014",
    providerName: "Eric Rogers",
    amount: 3560,
    status: "pending",
    payoutDate: "2025-01-25T00:00:00Z",
    bookingsCount: 17,
  },
];

export const mockCategories: Category[] = [
  {
    id: "CAT001",
    name: "Plumbing",
    description: "All plumbing services including repairs and installations",
    icon: "wrench",
    active: true,
    providerCount: 342,
    bookingsCount: 2847,
  },
  {
    id: "CAT002",
    name: "Electrical",
    description: "Electrical repairs, wiring, and installations",
    icon: "zap",
    active: true,
    providerCount: 289,
    bookingsCount: 2134,
  },
  {
    id: "CAT003",
    name: "Carpentry",
    description: "Woodwork, furniture assembly, and custom builds",
    icon: "hammer",
    active: true,
    providerCount: 156,
    bookingsCount: 1567,
  },
  {
    id: "CAT004",
    name: "Painting",
    description: "Interior and exterior painting services",
    icon: "paintbrush",
    active: true,
    providerCount: 198,
    bookingsCount: 1289,
  },
  {
    id: "CAT005",
    name: "Cleaning",
    description: "Home and office cleaning services",
    icon: "sparkles",
    active: true,
    providerCount: 445,
    bookingsCount: 3892,
  },
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: "LOG001",
    adminUser: "admin@kraftkonect.com",
    action: "approve",
    resource: "provider",
    resourceId: "PRV045",
    timestamp: "2025-01-20T14:32:00Z",
    details: "Approved provider: Robert Wilson",
    ip: "192.168.1.100",
  },
  {
    id: "LOG002",
    adminUser: "admin@kraftkonect.com",
    action: "resolve",
    resource: "dispute",
    resourceId: "DSP003",
    timestamp: "2025-01-20T12:15:00Z",
    details: "Resolved dispute with refund",
    ip: "192.168.1.100",
  },
  {
    id: "LOG003",
    adminUser: "support@kraftkonect.com",
    action: "close",
    resource: "ticket",
    resourceId: "TKT015",
    timestamp: "2025-01-20T10:45:00Z",
    details: "Closed support ticket",
    ip: "192.168.1.102",
  },
  {
    id: "LOG004",
    adminUser: "admin@kraftkonect.com",
    action: "cancel",
    resource: "booking",
    resourceId: "BKG145",
    timestamp: "2025-01-19T16:20:00Z",
    details: "Force cancelled booking with refund",
    ip: "192.168.1.100",
  },
  {
    id: "LOG005",
    adminUser: "admin@kraftkonect.com",
    action: "create",
    resource: "category",
    resourceId: "CAT005",
    timestamp: "2025-01-19T09:30:00Z",
    details: "Created new category: Cleaning",
    ip: "192.168.1.100",
  },
  {
    id: "LOG006",
    adminUser: "admin@kraftkonect.com",
    action: "update",
    resource: "user",
    resourceId: "USR006",
    timestamp: "2025-01-19T15:20:00Z",
    details: "Updated user status: Lisa Anderson to blocked",
    ip: "192.168.1.100",
  },
  {
    id: "LOG007",
    adminUser: "support@kraftkonect.com",
    action: "resolve",
    resource: "ticket",
    resourceId: "TKT004",
    timestamp: "2025-01-17T14:30:00Z",
    details: "Resolved ticket: Profile picture issue",
    ip: "192.168.1.102",
  },
  {
    id: "LOG008",
    adminUser: "admin@kraftkonect.com",
    action: "approve",
    resource: "provider",
    resourceId: "PRV012",
    timestamp: "2025-01-16T10:00:00Z",
    details: "Approved provider: Kimberly Evans",
    ip: "192.168.1.100",
  },
  {
    id: "LOG009",
    adminUser: "admin@kraftkonect.com",
    action: "suspend",
    resource: "provider",
    resourceId: "PRV003",
    timestamp: "2025-01-15T11:45:00Z",
    details: "Suspended provider: Lisa Anderson for policy violation",
    ip: "192.168.1.100",
  },
  {
    id: "LOG010",
    adminUser: "admin@kraftkonect.com",
    action: "update",
    resource: "category",
    resourceId: "CAT002",
    timestamp: "2025-01-14T09:15:00Z",
    details: "Updated category: Electrical description",
    ip: "192.168.1.100",
  },
  {
    id: "LOG011",
    adminUser: "support@kraftkonect.com",
    action: "escalate",
    resource: "dispute",
    resourceId: "DSP006",
    timestamp: "2025-01-20T13:00:00Z",
    details: "Escalated dispute to high priority",
    ip: "192.168.1.102",
  },
  {
    id: "LOG012",
    adminUser: "admin@kraftkonect.com",
    action: "reject",
    resource: "provider",
    resourceId: "PRV006",
    timestamp: "2025-01-13T16:30:00Z",
    details: "Rejected provider: Thomas Clark - Insufficient documentation",
    ip: "192.168.1.100",
  },
  {
    id: "LOG013",
    adminUser: "admin@kraftkonect.com",
    action: "delete",
    resource: "user",
    resourceId: "USR048",
    timestamp: "2025-01-12T10:20:00Z",
    details: "Deleted spam user account",
    ip: "192.168.1.100",
  },
  {
    id: "LOG014",
    adminUser: "support@kraftkonect.com",
    action: "update",
    resource: "booking",
    resourceId: "BKG008",
    timestamp: "2025-01-12T15:00:00Z",
    details: "Updated booking status to completed",
    ip: "192.168.1.102",
  },
  {
    id: "LOG015",
    adminUser: "admin@kraftkonect.com",
    action: "approve",
    resource: "provider",
    resourceId: "PRV011",
    timestamp: "2025-01-11T11:30:00Z",
    details: "Approved provider: Melissa Campbell",
    ip: "192.168.1.100",
  },
];
