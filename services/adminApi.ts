import {
  User,
  AdminUsersResponse,
  AdminProvidersResponse,
  UserRole,
  UserStatus,
  ProviderStatus,
  ProviderUpdateInput,
} from "@/types/admin";
import { paginateData } from "@/utils/pagination";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "https://kraftkonnect-backend-230084714703.us-central1.run.app/graphql";

// ── Token management ─────────────────────────────────────────────────────────
let _authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  _authToken = token;
};

// ── Shared GraphQL client ────────────────────────────────────────────────────
interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

const makeGraphQLRequest = async <T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (_authToken) {
    headers["Authorization"] = `Bearer ${_authToken}`;
  }

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = (await response.json()) as GraphQLResponse<T>;

  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  if (!result.data) {
    throw new Error("No data returned from GraphQL");
  }

  return result.data;
};

// ── Auth ─────────────────────────────────────────────────────────────────────
export const adminLoginApi = async (
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; user: { id: string; email: string; name: string; role: string } }> => {
  const mutation = `
    mutation AdminLogin($email: String!, $password: String!) {
      adminLogin(email: $email, password: $password) {
        accessToken
        refreshToken
        user {
          id
          email
          name
          role
        }
      }
    }
  `;
  const result = await makeGraphQLRequest<{ adminLogin: any }>(mutation, { email, password });
  return result.adminLogin;
};

// Validates the stored access token by calling the `me` query.
// Throws if the token is expired or invalid.
export const adminValidateSessionApi = async (): Promise<{
  email: string;
  name: string | null;
  role: string;
}> => {
  const query = `
    query Me {
      me {
        id
        email
        name
        role
      }
    }
  `;
  const result = await makeGraphQLRequest<{ me: any }>(query);
  if (!result.me) throw new Error("Session invalid");
  return result.me;
};

// ── Users ────────────────────────────────────────────────────────────────────
export const adminUsersQuery = async (params: {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminUsersResponse> => {
  const query = `
    query AdminUsers($limit: Int, $offset: Int, $role: UserRole) {
      adminUsers(limit: $limit, offset: $offset, role: $role) {
        id
        name
        email
        phone
        role
        status
        createdAt
      }
    }
  `;

  const result = await makeGraphQLRequest<{ adminUsers: User[] }>(query, {
    limit: 500,
    offset: 0,
    role: params.role,
  });

  let filtered = result.adminUsers;
  if (params.status) filtered = filtered.filter((u) => u.status === params.status);
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
    );
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const paginated = paginateData(filtered, page, pageSize);
  return {
    users: paginated.data,
    total: paginated.total,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
  };
};

export const adminUpdateUserRole = async (userId: string, role: UserRole): Promise<User> => {
  const mutation = `
    mutation AdminUpdateUserRole($userId: ID!, $role: UserRole!) {
      adminUpdateUserRole(userId: $userId, role: $role) {
        id name email phone role status createdAt
      }
    }
  `;
  const result = await makeGraphQLRequest<{ adminUpdateUserRole: User }>(mutation, { userId, role });
  return result.adminUpdateUserRole;
};

export const adminUpdateUserStatus = async (userId: string, status: UserStatus): Promise<User> => {
  const mutation = `
    mutation AdminUpdateUserStatus($userId: ID!, $status: UserStatus!) {
      adminUpdateUserStatus(userId: $userId, status: $status) {
        id name email phone role status createdAt
      }
    }
  `;
  const result = await makeGraphQLRequest<{ adminUpdateUserStatus: User }>(mutation, { userId, status });
  return result.adminUpdateUserStatus;
};

export const adminDeleteUser = async (userId: string): Promise<boolean> => {
  const mutation = `mutation AdminDeleteUser($userId: ID!) { adminDeleteUser(userId: $userId) }`;
  const result = await makeGraphQLRequest<{ adminDeleteUser: boolean }>(mutation, { userId });
  return result.adminDeleteUser;
};

// ── Providers ────────────────────────────────────────────────────────────────

// Shape returned to screens (compatible with what providers.tsx expects)
export interface ProviderDocument {
  name: string;
  url: string;
}

export interface BackendProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  status: ProviderStatus;
  submittedAt: string;
  documents: ProviderDocument[];
  bio?: string;
  rating?: number;
  // AI pre-screen fields (null = check not yet run)
  aiPhotoQuality: boolean | null;
  aiIdReadable: boolean | null;
  aiFaceMatch: boolean | null;
  aiDuplicateFlag: boolean | null;
}

export const adminProvidersQuery = async (params: {
  status?: ProviderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminProvidersResponse> => {
  const query = `
    query AdminProviders($limit: Int, $offset: Int, $status: ProviderStatus) {
      adminProviders(limit: $limit, offset: $offset, status: $status) {
        id
        name
        status
        category
        categories
        bio
        rating
        verified
        createdAt
        serviceAreas
        avatar
        experience
        aiPhotoQuality
        aiIdReadable
        aiFaceMatch
        aiDuplicateFlag
        verificationDocs {
          idUrl
          selfieUrl
        }
        user {
          email
          phone
        }
      }
    }
  `;

  const result = await makeGraphQLRequest<{ adminProviders: any[] }>(query, {
    limit: 500,
    offset: 0,
    status: params.status,
  });

  const mapped: BackendProvider[] = result.adminProviders.map((p) => ({
    id: p.id,
    name: p.name || "Unknown",
    email: p.user?.email || "",
    phone: p.user?.phone || "",
    category: p.categories?.[0] || p.category || "General",
    location: p.serviceAreas?.join(", ") || "Lagos",
    status: p.status as ProviderStatus,
    submittedAt: p.createdAt || new Date().toISOString(),
    documents: [
      p.verificationDocs?.idUrl && { name: "Government ID", url: p.verificationDocs.idUrl },
      p.verificationDocs?.selfieUrl && { name: "Selfie", url: p.verificationDocs.selfieUrl },
    ].filter(Boolean) as ProviderDocument[],
    bio: p.bio || "",
    rating: p.rating ? parseFloat(p.rating) : undefined,
    aiPhotoQuality: p.aiPhotoQuality ?? null,
    aiIdReadable: p.aiIdReadable ?? null,
    aiFaceMatch: p.aiFaceMatch ?? null,
    aiDuplicateFlag: p.aiDuplicateFlag ?? null,
  }));

  let filtered = mapped;
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = mapped.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const paginated = paginateData(filtered as any[], page, pageSize);
  return {
    providers: paginated.data as any[],
    total: paginated.total,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
  };
};

export const adminApproveProvider = async (providerId: string): Promise<BackendProvider> => {
  const mutation = `
    mutation AdminApproveProvider($providerId: ID!) {
      adminApproveProvider(providerId: $providerId) {
        id name status verified
      }
    }
  `;
  const result = await makeGraphQLRequest<{ adminApproveProvider: any }>(mutation, { providerId });
  return result.adminApproveProvider;
};

export const adminRejectProvider = async (providerId: string, reason?: string): Promise<BackendProvider> => {
  const mutation = `
    mutation AdminRejectProvider($providerId: ID!, $reason: String) {
      adminRejectProvider(providerId: $providerId, reason: $reason) {
        id name status
      }
    }
  `;
  const result = await makeGraphQLRequest<{ adminRejectProvider: any }>(mutation, { providerId, reason });
  return result.adminRejectProvider;
};

export const adminUpdateProviderStatus = async (
  providerId: string,
  status: ProviderStatus,
  reason?: string
): Promise<BackendProvider> => {
  const mutation = `
    mutation AdminUpdateProviderStatus($providerId: ID!, $status: ProviderStatus!) {
      adminUpdateProviderStatus(providerId: $providerId, status: $status) {
        id name status
      }
    }
  `;
  const result = await makeGraphQLRequest<{ adminUpdateProviderStatus: any }>(mutation, { providerId, status });
  return result.adminUpdateProviderStatus;
};

export const updateProvider = async (
  providerId: string,
  input: ProviderUpdateInput
): Promise<BackendProvider> => {
  const mutation = `
    mutation UpdateProvider($id: ID!, $input: UpdateProviderInput!) {
      updateProvider(id: $id, input: $input) {
        id
        name
        status
        category
        bio
        verified
      }
    }
  `;
  const result = await makeGraphQLRequest<{ updateProvider: any }>(mutation, {
    id: providerId,
    input,
  });
  const p = result.updateProvider;
  return {
    id: p.id,
    name: p.name || "Unknown",
    email: "",
    phone: "",
    category: p.category || "",
    location: "",
    status: p.status,
    submittedAt: "",
    documents: [],
    bio: p.bio || "",
    aiPhotoQuality: null,
    aiIdReadable: null,
    aiFaceMatch: null,
    aiDuplicateFlag: null,
  };
};

export const adminAiPreScreenApi = async (providerId: string): Promise<BackendProvider> => {
  const mutation = `
    mutation AiPreScreen($providerId: ID!) {
      aiPreScreen(providerId: $providerId) {
        id
        name
        status
        aiPhotoQuality
        aiIdReadable
        aiFaceMatch
        aiDuplicateFlag
      }
    }
  `;
  const result = await makeGraphQLRequest<{ aiPreScreen: any }>(mutation, { providerId });
  const p = result.aiPreScreen;
  return {
    id: p.id,
    name: p.name || "Unknown",
    email: "",
    phone: "",
    category: "",
    location: "",
    status: p.status,
    submittedAt: "",
    documents: [],
    aiPhotoQuality: p.aiPhotoQuality ?? null,
    aiIdReadable: p.aiIdReadable ?? null,
    aiFaceMatch: p.aiFaceMatch ?? null,
    aiDuplicateFlag: p.aiDuplicateFlag ?? null,
  };
};

// ── Dashboard metrics ────────────────────────────────────────────────────────
export interface DashboardData {
  metrics: Array<{ label: string; value: string; change: number; icon: string }>;
  revenue: Array<{ month: string; bookings: number; revenue: number }>;
  categories: Array<{ name: string; value: number }>;
}

export const adminGetDashboard = async (): Promise<DashboardData> => {
  const query = `
    query AdminDashboard {
      adminDashboardMetrics {
        label value change icon
      }
      adminRevenueChart {
        month bookings revenue
      }
      adminCategoryDistribution {
        name value
      }
    }
  `;
  const result = await makeGraphQLRequest<{
    adminDashboardMetrics: DashboardData["metrics"];
    adminRevenueChart: DashboardData["revenue"];
    adminCategoryDistribution: DashboardData["categories"];
  }>(query);

  return {
    metrics: result.adminDashboardMetrics,
    revenue: result.adminRevenueChart,
    categories: result.adminCategoryDistribution,
  };
};

// ── Bookings ─────────────────────────────────────────────────────────────────
export interface AdminBooking {
  _rawId: string;
  id: string;
  userId: string;
  userName: string;
  providerId: string;
  providerName: string;
  service: string;
  status: "pending" | "in_progress" | "confirmed" | "completed" | "cancelled" | "refunded";
  amount: number;
  currency: string;
  date: string;
}

export const adminBookingsQuery = async (params: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ bookings: AdminBooking[]; total: number; totalPages: number }> => {
  const query = `
    query AdminBookings($status: BookingStatus, $page: Int, $pageSize: Int, $search: String) {
      adminBookings(status: $status, page: $page, pageSize: $pageSize, search: $search) {
        id
        bookingRef
        listing { title }
        customer { id name }
        provider { id name }
        bookingDate
        totalPriceCents
        currency
        status
        description
        createdAt
      }
    }
  `;

  const result = await makeGraphQLRequest<{ adminBookings: any[] }>(query, {
    status: params.status || null,
    page: params.page || 1,
    pageSize: params.pageSize || 50,
    search: params.search || null,
  });

  let mapped: AdminBooking[] = result.adminBookings.map((b) => ({
    _rawId: b.id,
    id: b.bookingRef || b.id,
    userId: b.customer?.id || "",
    userName: b.customer?.name || "Unknown",
    providerId: b.provider?.id || "",
    providerName: b.provider?.name || "Unknown",
    service: b.listing?.title || b.description || "Service",
    status: b.status as AdminBooking["status"],
    amount: (b.totalPriceCents || 0) / 100,
    currency: b.currency || "ngn",
    date: b.bookingDate || b.createdAt,
  }));

  if (params.search) {
    const q = params.search.toLowerCase();
    mapped = mapped.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.providerName.toLowerCase().includes(q) ||
        b.service.toLowerCase().includes(q)
    );
  }

  return { bookings: mapped, total: mapped.length, totalPages: 1 };
};

export const adminCancelBooking = async (bookingId: string, reason?: string): Promise<void> => {
  const mutation = `
    mutation AdminCancelBooking($bookingId: ID!, $reason: String) {
      adminCancelBooking(bookingId: $bookingId, reason: $reason) { id status }
    }
  `;
  await makeGraphQLRequest(mutation, { bookingId, reason });
};

// ── Disputes ─────────────────────────────────────────────────────────────────
export interface AdminDispute {
  id: string;
  bookingId: string;
  type: "payment" | "quality" | "cancellation" | "other";
  severity: "low" | "medium" | "high";
  status: "open" | "resolved" | "escalated";
  description: string;
  createdAt: string;
  reporter: string;
  refundAmountCents: number;
}

export const adminDisputesQuery = async (params: {
  status?: string;
  severity?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminDispute[]> => {
  const query = `
    query AdminDisputes($status: String, $severity: String, $page: Int, $pageSize: Int) {
      adminDisputes(status: $status, severity: $severity, page: $page, pageSize: $pageSize) {
        id
        booking { id }
        reporter { id name }
        reason
        status
        severity
        refundAmountCents
        createdAt
      }
    }
  `;

  const result = await makeGraphQLRequest<{ adminDisputes: any[] }>(query, {
    status: params.status || null,
    severity: params.severity || null,
    page: params.page || 1,
    pageSize: params.pageSize || 50,
  });

  return result.adminDisputes.map((d) => ({
    id: d.id,
    bookingId: d.booking?.id || "Unknown",
    type: "other" as const,
    severity: (d.severity || "medium") as AdminDispute["severity"],
    status: (d.status || "open") as AdminDispute["status"],
    description: d.reason || "",
    createdAt: d.createdAt || new Date().toISOString(),
    reporter: d.reporter?.name || "Unknown",
    refundAmountCents: d.refundAmountCents || 0,
  }));
};

export const adminResolveDisputeApi = async (
  disputeId: string,
  resolution: string,
  refundAmount?: number
): Promise<void> => {
  const mutation = `
    mutation AdminResolveDispute($disputeId: ID!, $resolution: String!, $refundAmount: Int) {
      adminResolveDispute(disputeId: $disputeId, resolution: $resolution, refundAmount: $refundAmount) {
        id status
      }
    }
  `;
  await makeGraphQLRequest(mutation, { disputeId, resolution, refundAmount });
};

export const adminEscalateDisputeApi = async (disputeId: string, note: string): Promise<void> => {
  const mutation = `
    mutation AdminEscalateDispute($disputeId: ID!, $note: String!) {
      adminEscalateDispute(disputeId: $disputeId, note: $note) {
        id status severity
      }
    }
  `;
  await makeGraphQLRequest(mutation, { disputeId, note });
};

// ── Payouts / Earnings ───────────────────────────────────────────────────────
export interface AdminPayout {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  payoutDate: string;
  bookingsCount: number;
}

export const adminPayoutsQuery = async (params: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminPayout[]> => {
  const query = `
    query AdminPayouts($status: String, $page: Int, $pageSize: Int) {
      adminPayouts(status: $status, page: $page, pageSize: $pageSize) {
        id
        provider { id name }
        amountCents
        status
        createdAt
        updatedAt
      }
    }
  `;

  const result = await makeGraphQLRequest<{ adminPayouts: any[] }>(query, {
    status: params.status || null,
    page: params.page || 1,
    pageSize: params.pageSize || 50,
  });

  return result.adminPayouts.map((p) => ({
    id: p.id,
    providerId: p.provider?.id || "",
    providerName: p.provider?.name || "Unknown",
    amount: (p.amountCents || 0) / 100,
    status: (p.status || "pending") as AdminPayout["status"],
    payoutDate: p.createdAt || new Date().toISOString(),
    bookingsCount: 0,
  }));
};

export const adminProcessPayoutApi = async (payoutId: string): Promise<void> => {
  const mutation = `
    mutation AdminProcessPayout($payoutId: ID!) {
      adminProcessPayout(payoutId: $payoutId) { id status }
    }
  `;
  await makeGraphQLRequest(mutation, { payoutId });
};

// ── Categories ───────────────────────────────────────────────────────────────
export interface AdminCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconUri?: string;
  active: boolean;
  providerCount: number;
  bookingsCount: number;
}

const slugToIcon: Record<string, string> = {
  plumbing: "wrench",
  electrical: "zap",
  carpentry: "hammer",
  painting: "paintbrush",
  cleaning: "sparkles",
  beauty: "scissors",
  handyman: "wrench",
  landscaping: "leaf",
};

const mapCategoryIcon = (slug: string, name: string): string =>
  slugToIcon[slug?.toLowerCase()] ||
  slugToIcon[name?.toLowerCase()] ||
  "wrench";

export const adminCategoriesQuery = async (): Promise<AdminCategory[]> => {
  const query = `
    query AdminCategories {
      adminCategories {
        id slug name description active createdAt
      }
    }
  `;
  const result = await makeGraphQLRequest<{ adminCategories: any[] }>(query);
  return result.adminCategories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description || "",
    icon: mapCategoryIcon(c.slug, c.name),
    iconUri: undefined,
    active: c.active ?? true,
    providerCount: 0,
    bookingsCount: 0,
  }));
};

export const adminCreateCategoryApi = async (
  name: string,
  description?: string
): Promise<AdminCategory> => {
  const mutation = `
    mutation AdminCreateCategory($name: String!, $description: String, $icon: String) {
      adminCreateCategory(name: $name, description: $description, icon: $icon) {
        id slug name description active createdAt
      }
    }
  `;
  const result = await makeGraphQLRequest<{ adminCreateCategory: any }>(mutation, {
    name,
    description,
    icon: null,
  });
  const c = result.adminCreateCategory;
  return {
    id: c.id,
    name: c.name,
    description: c.description || "",
    icon: mapCategoryIcon(c.slug, c.name),
    iconUri: undefined,
    active: c.active ?? true,
    providerCount: 0,
    bookingsCount: 0,
  };
};

export const adminUpdateCategoryApi = async (
  categoryId: string,
  input: { name?: string; description?: string }
): Promise<AdminCategory> => {
  const mutation = `
    mutation AdminUpdateCategory($categoryId: ID!, $input: AdminUpdateCategoryInput!) {
      adminUpdateCategory(categoryId: $categoryId, input: $input) {
        id slug name description active createdAt
      }
    }
  `;
  const result = await makeGraphQLRequest<{ adminUpdateCategory: any }>(mutation, {
    categoryId,
    input,
  });
  const c = result.adminUpdateCategory;
  return {
    id: c.id,
    name: c.name,
    description: c.description || "",
    icon: mapCategoryIcon(c.slug, c.name),
    iconUri: undefined,
    active: c.active ?? true,
    providerCount: 0,
    bookingsCount: 0,
  };
};

export const adminToggleCategoryStatusApi = async (
  categoryId: string,
  active: boolean
): Promise<AdminCategory> => {
  const mutation = `
    mutation AdminToggleCategoryStatus($categoryId: ID!, $active: Boolean!) {
      adminToggleCategoryStatus(categoryId: $categoryId, active: $active) {
        id slug name description active createdAt
      }
    }
  `;
  const result = await makeGraphQLRequest<{ adminToggleCategoryStatus: any }>(mutation, {
    categoryId,
    active,
  });
  const c = result.adminToggleCategoryStatus;
  return {
    id: c.id,
    name: c.name,
    description: c.description || "",
    icon: mapCategoryIcon(c.slug, c.name),
    iconUri: undefined,
    active: c.active ?? true,
    providerCount: 0,
    bookingsCount: 0,
  };
};

// ── Analytics ────────────────────────────────────────────────────────────────

export interface SkillDistribution {
  name: string;
  value: number;
}

export interface MonthlyVolume {
  month: string;
  bookings: number;
  revenue: number;
}

export interface DemandForecastItem {
  id: string;
  forecastText: string;
  skill: string | null;
  area: string | null;
  weekStart: string;
}

export const adminAnalyticsQuery = async (): Promise<{
  skillDistribution: SkillDistribution[];
  monthlyVolume: MonthlyVolume[];
}> => {
  const query = `
    query AdminAnalytics {
      adminCategoryDistribution { name value }
      adminRevenueChart { month bookings revenue }
    }
  `;
  const result = await makeGraphQLRequest<{
    adminCategoryDistribution: SkillDistribution[];
    adminRevenueChart: MonthlyVolume[];
  }>(query);
  return {
    skillDistribution: result.adminCategoryDistribution ?? [],
    monthlyVolume: result.adminRevenueChart ?? [],
  };
};

export const adminDemandForecastQuery = async (): Promise<DemandForecastItem[]> => {
  const query = `
    query AdminDemandForecast {
      getDemandForecast(limit: 30) {
        id forecastText skill area weekStart
      }
    }
  `;
  const result = await makeGraphQLRequest<{ getDemandForecast: DemandForecastItem[] }>(query);
  return result.getDemandForecast ?? [];
};

// ── Audit logs ───────────────────────────────────────────────────────────────
export interface AdminAuditLog {
  id: string;
  adminUser: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  details: string;
  ip: string;
}

export const adminAuditLogsQuery = async (params: {
  adminUser?: string;
  resource?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminAuditLog[]> => {
  const query = `
    query AdminAuditLogs($adminUser: ID, $resource: String, $page: Int, $pageSize: Int) {
      adminAuditLogs(adminUser: $adminUser, resource: $resource, page: $page, pageSize: $pageSize) {
        id
        adminUser { id email name }
        action
        targetType
        targetId
        createdAt
      }
    }
  `;
  const result = await makeGraphQLRequest<{ adminAuditLogs: any[] }>(query, {
    adminUser: params.adminUser || null,
    resource: params.resource || null,
    page: params.page || 1,
    pageSize: params.pageSize || 50,
  });

  return result.adminAuditLogs.map((l) => ({
    id: l.id,
    adminUser: l.adminUser?.email || "admin",
    action: l.action,
    resource: l.targetType || "system",
    resourceId: l.targetId || "",
    timestamp: l.createdAt,
    details: `${l.action} ${l.targetType || ""} ${l.targetId || ""}`.trim(),
    ip: "",
  }));
};

// ── Support tickets ──────────────────────────────────────────────────────────
export interface AdminTicket {
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

export const adminTicketsQuery = async (params: {
  status?: string;
  priority?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<AdminTicket[]> => {
  const query = `
    query AdminTickets($status: String, $priority: String, $page: Int, $pageSize: Int, $search: String) {
      adminTickets(status: $status, priority: $priority, page: $page, pageSize: $pageSize, search: $search) {
        id
        user { id name email }
        subject
        status
        priority
        createdAt
        updatedAt
      }
    }
  `;
  const result = await makeGraphQLRequest<{ adminTickets: any[] }>(query, {
    status: params.status || null,
    priority: params.priority || null,
    page: params.page || 1,
    pageSize: params.pageSize || 50,
    search: params.search || null,
  });

  return result.adminTickets.map((t) => ({
    id: t.id,
    userId: t.user?.id || "",
    userName: t.user?.name || t.user?.email || "Unknown",
    subject: t.subject,
    category: "other" as const,
    status: (t.status || "open") as AdminTicket["status"],
    priority: (t.priority || "medium") as AdminTicket["priority"],
    createdAt: t.createdAt || new Date().toISOString(),
    lastReply: t.updatedAt || t.createdAt || new Date().toISOString(),
  }));
};

export const adminReplyTicketApi = async (ticketId: string, message: string): Promise<void> => {
  const mutation = `
    mutation AdminReplyTicket($ticketId: ID!, $message: String!) {
      adminReplyTicket(ticketId: $ticketId, message: $message) { id status }
    }
  `;
  await makeGraphQLRequest(mutation, { ticketId, message });
};

export const adminCloseTicketApi = async (ticketId: string): Promise<void> => {
  const mutation = `
    mutation AdminCloseTicket($ticketId: ID!) {
      adminCloseTicket(ticketId: $ticketId) { id status }
    }
  `;
  await makeGraphQLRequest(mutation, { ticketId });
};
