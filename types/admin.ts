export type UserRole = "admin" | "provider" | "customer";
export type UserStatus = "active" | "blocked" | "frozen";
export type ProviderStatus = "pending" | "approved" | "rejected" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  providerId?: string;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  status: ProviderStatus;
  submittedAt: string;
  approvedAt?: string;
  selfieUrl?: string;
  documents: { name: string; url: string }[];
  businessName?: string;
  serviceArea?: string;
  description?: string;
  rating?: number;
  bookingsCount?: number;
  verificationDetails?: {
    idType?: string;
    idNumber?: string;
    businessAddress?: string;
    taxId?: string;
  };
}

export interface AdminUsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminProvidersResponse {
  providers: Provider[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProviderUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  location?: string;
  businessName?: string;
  serviceArea?: string;
  description?: string;
}
