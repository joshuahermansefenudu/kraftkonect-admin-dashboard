import {
  User,
  Provider,
  AdminUsersResponse,
  AdminProvidersResponse,
  UserRole,
  UserStatus,
  ProviderStatus,
  ProviderUpdateInput,
} from "@/types/admin";
import {
  mockUsers,
  mockProvidersList,
  filterUsers,
  filterProviders,
  paginateData,
} from "@/mocks/users";

const API_BASE_URL = "https://api.kraftkonect.com/graphql";
const USE_MOCK_DATA = true;

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

const makeGraphQLRequest = async <T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> => {
  console.log("[AdminAPI] Making GraphQL request:", { query, variables });

  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    if (!result.data) {
      throw new Error("No data returned from GraphQL");
    }

    return result.data;
  } catch (error) {
    console.error("[AdminAPI] GraphQL request failed:", error);
    throw error;
  }
};

export const adminUsersQuery = async (params: {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminUsersResponse> => {
  if (USE_MOCK_DATA) {
    console.log("[AdminAPI] Using mock data for users query");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filtered = filterUsers(mockUsers, {
      search: params.search,
      role: params.role,
      status: params.status,
    });

    const paginated = paginateData(
      filtered,
      params.page || 1,
      params.pageSize || 20
    );

    return {
      users: paginated.data,
      total: paginated.total,
      page: paginated.page,
      pageSize: paginated.pageSize,
      totalPages: paginated.totalPages,
    };
  }

  // Backend returns [User!]! — fetch all and paginate client-side
  const limit = 500;
  const offset = ((params.page || 1) - 1) * (params.pageSize || 20);

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
        deletedAt
      }
    }
  `;

  const result = await makeGraphQLRequest<{ adminUsers: User[] }>(query, {
    limit,
    offset: 0,
    role: params.role,
  });

  // Client-side filter for status and search (backend doesn't support these yet)
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

export const adminProvidersQuery = async (params: {
  status?: ProviderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminProvidersResponse> => {
  if (USE_MOCK_DATA) {
    console.log("[AdminAPI] Using mock data for providers query");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filtered = filterProviders(mockProvidersList, {
      search: params.search,
      status: params.status,
    });

    const paginated = paginateData(
      filtered,
      params.page || 1,
      params.pageSize || 20
    );

    return {
      providers: paginated.data,
      total: paginated.total,
      page: paginated.page,
      pageSize: paginated.pageSize,
      totalPages: paginated.totalPages,
    };
  }

  // Backend returns [Provider!]! — fetch all and paginate client-side
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
        ratingCount
        verified
        createdAt
        serviceAreas
        avatar
        experience
      }
    }
  `;

  const result = await makeGraphQLRequest<{ adminProviders: Provider[] }>(
    query,
    { limit: 500, offset: 0, status: params.status }
  );

  // Client-side search (backend doesn't support it yet)
  let filtered = result.adminProviders;
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const paginated = paginateData(filtered, page, pageSize);
  return {
    providers: paginated.data,
    total: paginated.total,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
  };
};

export const adminUpdateUserRole = async (
  userId: string,
  role: UserRole
): Promise<User> => {
  if (USE_MOCK_DATA) {
    console.log(`[AdminAPI] Mock: Updated user ${userId} role to ${role}`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = { ...user, role };
    const index = mockUsers.findIndex((u) => u.id === userId);
    if (index !== -1) {
      mockUsers[index] = updatedUser;
    }

    return updatedUser;
  }

  const mutation = `
    mutation AdminUpdateUserRole($userId: ID!, $role: UserRole!) {
      adminUpdateUserRole(userId: $userId, role: $role) {
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

  const result = await makeGraphQLRequest<{ adminUpdateUserRole: User }>(
    mutation,
    { userId, role }
  );
  console.log(`[AdminAPI] Updated user ${userId} role to ${role}`);
  return result.adminUpdateUserRole;
};

export const adminUpdateUserStatus = async (
  userId: string,
  status: UserStatus
): Promise<User> => {
  if (USE_MOCK_DATA) {
    console.log(`[AdminAPI] Mock: Updated user ${userId} status to ${status}`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = { ...user, status };
    const index = mockUsers.findIndex((u) => u.id === userId);
    if (index !== -1) {
      mockUsers[index] = updatedUser;
    }

    return updatedUser;
  }

  const mutation = `
    mutation AdminUpdateUserStatus($userId: ID!, $status: UserStatus!) {
      adminUpdateUserStatus(userId: $userId, status: $status) {
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

  const result = await makeGraphQLRequest<{ adminUpdateUserStatus: User }>(
    mutation,
    { userId, status }
  );
  console.log(`[AdminAPI] Updated user ${userId} status to ${status}`);
  return result.adminUpdateUserStatus;
};

export const adminDeleteUser = async (userId: string): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    console.log(`[AdminAPI] Mock: Deleted user ${userId}`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockUsers.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new Error("User not found");
    }

    mockUsers.splice(index, 1);
    return true;
  }

  const mutation = `
    mutation AdminDeleteUser($userId: ID!) {
      adminDeleteUser(userId: $userId)
    }
  `;

  const result = await makeGraphQLRequest<{ adminDeleteUser: boolean }>(
    mutation,
    { userId }
  );
  console.log(`[AdminAPI] Deleted user ${userId}`);
  return result.adminDeleteUser;
};

export const adminApproveProvider = async (
  providerId: string
): Promise<Provider> => {
  if (USE_MOCK_DATA) {
    console.log(`[AdminAPI] Mock: Approved provider ${providerId}`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const provider = mockProvidersList.find((p) => p.id === providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    const updatedProvider = {
      ...provider,
      status: "approved" as ProviderStatus,
      approvedAt: new Date().toISOString(),
    };
    const index = mockProvidersList.findIndex((p) => p.id === providerId);
    if (index !== -1) {
      mockProvidersList[index] = updatedProvider;
    }

    return updatedProvider;
  }

  // approvedAt does not exist on the Provider type — removed
  const mutation = `
    mutation AdminApproveProvider($providerId: ID!) {
      adminApproveProvider(providerId: $providerId) {
        id
        name
        status
        verified
      }
    }
  `;

  const result = await makeGraphQLRequest<{ adminApproveProvider: Provider }>(
    mutation,
    { providerId }
  );
  console.log(`[AdminAPI] Approved provider ${providerId}`);
  return result.adminApproveProvider;
};

export const adminRejectProvider = async (
  providerId: string,
  reason?: string
): Promise<Provider> => {
  if (USE_MOCK_DATA) {
    console.log(
      `[AdminAPI] Mock: Rejected provider ${providerId} with reason: ${reason}`
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    const provider = mockProvidersList.find((p) => p.id === providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    const updatedProvider = {
      ...provider,
      status: "rejected" as ProviderStatus,
    };
    const index = mockProvidersList.findIndex((p) => p.id === providerId);
    if (index !== -1) {
      mockProvidersList[index] = updatedProvider;
    }

    return updatedProvider;
  }

  const mutation = `
    mutation AdminRejectProvider($providerId: ID!, $reason: String) {
      adminRejectProvider(providerId: $providerId, reason: $reason) {
        id
        name
        status
      }
    }
  `;

  const result = await makeGraphQLRequest<{ adminRejectProvider: Provider }>(
    mutation,
    { providerId, reason }
  );
  console.log(
    `[AdminAPI] Rejected provider ${providerId} with reason: ${reason}`
  );
  return result.adminRejectProvider;
};

export const adminUpdateProviderStatus = async (
  providerId: string,
  status: ProviderStatus,
  reason?: string
): Promise<Provider> => {
  if (USE_MOCK_DATA) {
    console.log(
      `[AdminAPI] Mock: Updated provider ${providerId} status to ${status} with reason: ${reason}`
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    const provider = mockProvidersList.find((p) => p.id === providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    const updatedProvider = { ...provider, status };
    const index = mockProvidersList.findIndex((p) => p.id === providerId);
    if (index !== -1) {
      mockProvidersList[index] = updatedProvider;
    }

    return updatedProvider;
  }

  // Backend adminUpdateProviderStatus does not accept a reason argument
  const mutation = `
    mutation AdminUpdateProviderStatus($providerId: ID!, $status: ProviderStatus!) {
      adminUpdateProviderStatus(providerId: $providerId, status: $status) {
        id
        name
        status
      }
    }
  `;

  const result = await makeGraphQLRequest<{
    adminUpdateProviderStatus: Provider;
  }>(mutation, { providerId, status });
  console.log(
    `[AdminAPI] Updated provider ${providerId} status to ${status} with reason: ${reason}`
  );
  return result.adminUpdateProviderStatus;
};

export const updateProvider = async (
  providerId: string,
  input: ProviderUpdateInput
): Promise<Provider> => {
  if (USE_MOCK_DATA) {
    console.log(`[AdminAPI] Mock: Updated provider ${providerId} profile`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const provider = mockProvidersList.find((p) => p.id === providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    const updatedProvider = { ...provider, ...input };
    const index = mockProvidersList.findIndex((p) => p.id === providerId);
    if (index !== -1) {
      mockProvidersList[index] = updatedProvider;
    }

    return updatedProvider;
  }

  // Backend arg is `id` (not `providerId`); UpdateProviderInput only accepts status/category/bio
  // location, businessName, serviceArea, email, phone do not exist on Provider type
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

  const result = await makeGraphQLRequest<{ updateProvider: Provider }>(
    mutation,
    { id: providerId, input }
  );
  console.log(`[AdminAPI] Updated provider ${providerId} profile`);
  return result.updateProvider;
};
