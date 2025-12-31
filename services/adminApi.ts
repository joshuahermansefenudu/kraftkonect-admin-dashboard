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

  const query = `
    query AdminUsers($role: UserRole, $status: UserStatus, $search: String, $page: Int, $pageSize: Int) {
      adminUsers(role: $role, status: $status, search: $search, page: $page, pageSize: $pageSize) {
        users {
          id
          name
          email
          phone
          role
          status
          createdAt
          providerId
        }
        total
        page
        pageSize
        totalPages
      }
    }
  `;

  const result = await makeGraphQLRequest<{ adminUsers: AdminUsersResponse }>(
    query,
    params
  );
  return result.adminUsers;
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

  const query = `
    query AdminProviders($status: ProviderStatus, $search: String, $page: Int, $pageSize: Int) {
      adminProviders(status: $status, search: $search, page: $page, pageSize: $pageSize) {
        providers {
          id
          name
          email
          phone
          category
          location
          status
          submittedAt
          approvedAt
          documents
          businessName
          serviceArea
          description
          rating
          bookingsCount
          verificationDetails {
            idType
            idNumber
            businessAddress
            taxId
          }
        }
        total
        page
        pageSize
        totalPages
      }
    }
  `;

  const result = await makeGraphQLRequest<{
    adminProviders: AdminProvidersResponse;
  }>(query, params);
  return result.adminProviders;
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

  const mutation = `
    mutation AdminApproveProvider($providerId: ID!) {
      adminApproveProvider(providerId: $providerId) {
        id
        name
        status
        approvedAt
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

  const mutation = `
    mutation AdminUpdateProviderStatus($providerId: ID!, $status: ProviderStatus!, $reason: String) {
      adminUpdateProviderStatus(providerId: $providerId, status: $status, reason: $reason) {
        id
        name
        status
      }
    }
  `;

  const result = await makeGraphQLRequest<{
    adminUpdateProviderStatus: Provider;
  }>(mutation, { providerId, status, reason });
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

  const mutation = `
    mutation UpdateProvider($providerId: ID!, $input: ProviderUpdateInput!) {
      updateProvider(providerId: $providerId, input: $input) {
        id
        name
        email
        phone
        category
        location
        businessName
        serviceArea
        description
      }
    }
  `;

  const result = await makeGraphQLRequest<{ updateProvider: Provider }>(
    mutation,
    { providerId, input }
  );
  console.log(`[AdminAPI] Updated provider ${providerId} profile`);
  return result.updateProvider;
};
