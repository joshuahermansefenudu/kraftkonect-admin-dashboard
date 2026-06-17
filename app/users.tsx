import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Alert, useWindowDimensions, RefreshControl } from "react-native";
import { PressableOpacity as TouchableOpacity } from "@/components/PressableOpacity";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import StatusChip from "@/components/StatusChip";
import ConfirmModal from "@/components/ConfirmModal";
import Drawer from "@/components/Drawer";
import Colors from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserX,
  Shield,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Eye,
} from "lucide-react-native";
import { useState, useEffect, useCallback } from "react";
import { User, UserRole, UserStatus } from "@/types/admin";
import {
  adminUsersQuery,
  adminUpdateUserRole,
  adminUpdateUserStatus,
  adminDeleteUser,
} from "@/services/adminApi";
import { useRouter } from "expo-router";

type ActionType = "changeRole" | "changeStatus" | "delete" | null;

export default function UsersManagementScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    actionType: ActionType;
    title: string;
    message: string;
    newValue?: any;
  }>({
    visible: false,
    actionType: null,
    title: "",
    message: "",
  });

  const pageSize = 20;

  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      console.log("[UsersManagement] Loading users with filters:", {
        search,
        roleFilter,
        statusFilter,
        page,
      });

      const response = await adminUsersQuery({
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        pageSize,
      });

      setUsers(response.users);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("[UsersManagement] Failed to load users:", error);
      Alert.alert("Error", "Failed to load users. Please try again.");
    } finally {
      if (!isRefresh) setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter, page, pageSize]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUsers(true);
    setRefreshing(false);
  }, [loadUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleViewUser = (user: User) => {
    console.log("[UsersManagement] Viewing user:", user.id);
    setSelectedUser(user);
    setShowDrawer(true);
  };

  const handleChangeRole = (user: User, newRole: UserRole) => {
    setSelectedUser(user);
    setConfirmModal({
      visible: true,
      actionType: "changeRole",
      title: "Change User Role",
      message: `Are you sure you want to change ${user.name}'s role to ${newRole}?`,
      newValue: newRole,
    });
  };

  const handleChangeStatus = (user: User, newStatus: UserStatus) => {
    setSelectedUser(user);
    setConfirmModal({
      visible: true,
      actionType: "changeStatus",
      title: "Change User Status",
      message: `Are you sure you want to change ${user.name}'s status to ${newStatus}?`,
      newValue: newStatus,
    });
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setConfirmModal({
      visible: true,
      actionType: "delete",
      title: "Delete User",
      message: `This action cannot be undone. The user ${user.name} and all associated data will be permanently deleted.`,
    });
  };

  const executeAction = async () => {
    if (!selectedUser || !confirmModal.actionType) return;

    try {
      console.log(
        `[UsersManagement] Executing action: ${confirmModal.actionType} for user:`,
        selectedUser.id
      );

      switch (confirmModal.actionType) {
        case "changeRole":
          await adminUpdateUserRole(selectedUser.id, confirmModal.newValue);
          Alert.alert("Success", "User role updated successfully");
          break;
        case "changeStatus":
          await adminUpdateUserStatus(selectedUser.id, confirmModal.newValue);
          Alert.alert("Success", "User status updated successfully");
          break;
        case "delete":
          await adminDeleteUser(selectedUser.id);
          Alert.alert("Success", "User deleted successfully");
          break;
      }

      loadUsers();
      setShowDrawer(false);
    } catch (error) {
      console.error("[UsersManagement] Action failed:", error);
      Alert.alert("Error", "Failed to perform action. Please try again.");
    } finally {
      setConfirmModal({ visible: false, actionType: null, title: "", message: "" });
      setSelectedUser(null);
    }
  };

  const getRoleChipVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "error";
      case "provider":
        return "info";
      case "customer":
        return "neutral";
    }
  };

  const getStatusChipVariant = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "success";
      case "blocked":
        return "error";
      case "frozen":
        return "warning";
    }
  };

  return (
    <View style={styles.container}>
      <Sidebar />
      <SafeAreaView edges={["top", "right", "bottom"]} style={styles.safeArea}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            isMobile && { paddingTop: 60 + insets.top + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.primary}
            />
          }
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, isMobile && styles.titleMobile]}>
                Users Management
              </Text>
              <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
                {total} total users
              </Text>
            </View>
          </View>

          <View style={[styles.controls, isMobile && styles.controlsMobile]}>
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChangeText={setSearch}
              icon={<Search size={18} color={Colors.light.textSecondary} />}
              containerStyle={{ flex: isMobile ? 0 : 1, width: isMobile ? "100%" : "auto" }}
            />

            <Button
              title="Filters"
              variant="secondary"
              icon={<Filter size={18} color={Colors.light.primary} />}
              onPress={() => setShowFilterMenu(!showFilterMenu)}
              style={isMobile ? { width: "100%" } : undefined}
            />
          </View>

          {showFilterMenu && (
            <View style={styles.filterMenu}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Role</Text>
                <View style={styles.filterOptions}>
                  {(["all", "admin", "provider", "customer"] as const).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.filterOption,
                        roleFilter === role && styles.filterOptionActive,
                      ]}
                      onPress={() => {
                        setRoleFilter(role);
                        setPage(1);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          roleFilter === role && styles.filterOptionTextActive,
                        ]}
                      >
                        {role === "all" ? "All Roles" : role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Status</Text>
                <View style={styles.filterOptions}>
                  {(["all", "active", "blocked", "frozen"] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterOption,
                        statusFilter === status && styles.filterOptionActive,
                      ]}
                      onPress={() => {
                        setStatusFilter(status);
                        setPage(1);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          statusFilter === status && styles.filterOptionTextActive,
                        ]}
                      >
                        {status === "all" ? "All Statuses" : status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
          ) : users.length === 0 ? (
            <View style={styles.emptyState}>
              <UserIcon size={64} color={Colors.light.textSecondary} />
              <Text style={styles.emptyTitle}>No Users Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <>
              {isMobile ? (
                <View style={styles.cardsList}>
                  {users.map((user) => (
                    <UserCardMobile
                      key={user.id}
                      user={user}
                      onView={() => handleViewUser(user)}
                      getRoleChipVariant={getRoleChipVariant}
                      getStatusChipVariant={getStatusChipVariant}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>User</Text>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>Contact</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Role</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Created</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Actions</Text>
                  </View>

                  {users.map((user) => (
                    <View key={user.id} style={styles.tableRow}>
                      <UserRow
                        user={user}
                        onView={() => handleViewUser(user)}
                        onShowActions={() => setShowActionMenu(user.id)}
                        showActionMenu={showActionMenu === user.id}
                        onCloseActionMenu={() => setShowActionMenu(null)}
                        onChangeRole={handleChangeRole}
                        onChangeStatus={handleChangeStatus}
                        onDelete={handleDeleteUser}
                        getRoleChipVariant={getRoleChipVariant}
                        getStatusChipVariant={getStatusChipVariant}
                      />
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.pagination}>
                <Button
                  title="Previous"
                  onPress={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="secondary"
                  icon={<ChevronLeft size={18} color={page === 1 ? Colors.light.border : Colors.light.text} />}
                  style={{ height: 40, borderRadius: 20 }}
                />

                <Text style={styles.paginationInfo}>
                  Page {page} of {totalPages}
                </Text>

                <Button
                  title="Next"
                  onPress={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  variant="secondary"
                  icon={<ChevronRight size={18} color={page === totalPages ? Colors.light.border : Colors.light.text} />}
                  style={{ height: 40, borderRadius: 20 }}
                />
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <Drawer visible={showDrawer} onClose={() => setShowDrawer(false)}>
        {selectedUser && (
          <UserDetailView
            user={selectedUser}
            onChangeRole={handleChangeRole}
            onChangeStatus={handleChangeStatus}
            onDelete={handleDeleteUser}
            onViewProvider={() => {
              if (selectedUser.providerId) {
                setShowDrawer(false);
                router.push(`/providers/${selectedUser.providerId}` as any);
              }
            }}
          />
        )}
      </Drawer>

      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.actionType === "delete" ? "danger" : "warning"}
        requireTypedConfirmation={confirmModal.actionType === "delete"}
        confirmationValue="DELETE"
        onConfirm={executeAction}
        onCancel={() =>
          setConfirmModal({ visible: false, actionType: null, title: "", message: "" })
        }
      />
    </View>
  );
}

function UserRow({
  user,
  onView,
  onShowActions,
  showActionMenu,
  onCloseActionMenu,
  onChangeRole,
  onChangeStatus,
  onDelete,
  getRoleChipVariant,
  getStatusChipVariant,
}: {
  user: User;
  onView: () => void;
  onShowActions: () => void;
  showActionMenu: boolean;
  onCloseActionMenu: () => void;
  onChangeRole: (user: User, role: UserRole) => void;
  onChangeStatus: (user: User, status: UserStatus) => void;
  onDelete: (user: User) => void;
  getRoleChipVariant: (role: UserRole) => any;
  getStatusChipVariant: (status: UserStatus) => any;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <View style={[styles.tableCell, { flex: 2 }]}>
        <View style={styles.userAvatar}>
          <Text style={styles.userInitials}>
            {(user.name || "User")
              .split(" ")
              .filter(Boolean)
              .map((n) => n[0])
              .join("")}
          </Text>
        </View>
        <View>
          <Text style={styles.userName}>{user.name || "Unnamed User"}</Text>
          <Text style={styles.userId}>ID: {user.id}</Text>
        </View>
      </View>

      <View style={[styles.tableCell, { flex: 2 }]}>
        <View>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
        </View>
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        <StatusChip label={user.role} variant={getRoleChipVariant(user.role)} />
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        <StatusChip label={user.status} variant={getStatusChipVariant(user.status)} />
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        <Text style={styles.userDate}>{formatDate(user.createdAt)}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        <TouchableOpacity style={styles.viewButton} onPress={onView}>
          <Eye size={16} color={Colors.light.primary} />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        <View style={styles.actionsWrapper}>
          <TouchableOpacity style={styles.moreButton} onPress={onShowActions}>
            <MoreVertical size={18} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          {showActionMenu && (
            <>
              <TouchableOpacity
                style={styles.actionMenuOverlay}
                onPress={onCloseActionMenu}
              />
              <View style={styles.actionMenu}>
                <Text style={styles.actionMenuTitle}>Change Role</Text>
                {(["admin", "provider", "customer"] as UserRole[]).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={styles.actionMenuItem}
                    onPress={() => {
                      onChangeRole(user, role);
                      onCloseActionMenu();
                    }}
                    disabled={user.role === role}
                  >
                    <Text
                      style={[
                        styles.actionMenuItemText,
                        user.role === role && styles.actionMenuItemTextDisabled,
                      ]}
                    >
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.actionMenuDivider} />
                <Text style={styles.actionMenuTitle}>Change Status</Text>
                {(["active", "blocked", "frozen"] as UserStatus[]).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={styles.actionMenuItem}
                    onPress={() => {
                      onChangeStatus(user, status);
                      onCloseActionMenu();
                    }}
                    disabled={user.status === status}
                  >
                    <Text
                      style={[
                        styles.actionMenuItemText,
                        user.status === status && styles.actionMenuItemTextDisabled,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.actionMenuDivider} />
                <TouchableOpacity
                  style={styles.actionMenuItem}
                  onPress={() => {
                    onDelete(user);
                    onCloseActionMenu();
                  }}
                >
                  <UserX size={16} color={Colors.light.error} />
                  <Text style={[styles.actionMenuItemText, { color: Colors.light.error }]}>
                    Delete User
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </>
  );
}

function UserCardMobile({
  user,
  onView,
  getRoleChipVariant,
  getStatusChipVariant,
}: {
  user: User;
  onView: () => void;
  getRoleChipVariant: (role: UserRole) => any;
  getStatusChipVariant: (status: UserStatus) => any;
}) {
  return (
    <TouchableOpacity style={styles.userCardMobile} onPress={onView} activeOpacity={0.85}>
      <View style={styles.userCardTop}>
        <View style={styles.userCardHeader}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitials}>
              {(user.name || "User")
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <View style={styles.userCardInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user.name || "Unnamed User"}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
            <Text style={styles.userMeta} numberOfLines={1}>
              ID: {user.id}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewPill} onPress={onView}>
          <Eye size={14} color={Colors.light.primary} />
          <Text style={styles.viewPillText}>View</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userCardDivider} />

      <View style={styles.userCardChips}>
        <StatusChip label={user.role} variant={getRoleChipVariant(user.role)} />
        <StatusChip label={user.status} variant={getStatusChipVariant(user.status)} />
      </View>
    </TouchableOpacity>
  );
}

function UserDetailView({
  user,
  onChangeRole,
  onChangeStatus,
  onDelete,
  onViewProvider,
}: {
  user: User;
  onChangeRole: (user: User, role: UserRole) => void;
  onChangeStatus: (user: User, status: UserStatus) => void;
  onDelete: (user: User) => void;
  onViewProvider: () => void;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.detailView}>
      <Text style={styles.detailTitle}>User Details</Text>

      <View style={styles.detailAvatar}>
        <Text style={styles.detailAvatarText}>
          {(user.name || "User")
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")}
        </Text>
      </View>

      <Text style={styles.detailName}>{user.name || "Unnamed User"}</Text>
      <Text style={styles.detailId}>ID: {user.id}</Text>

      <View style={styles.detailSection}>
        <View style={styles.detailRow}>
          <Mail size={18} color={Colors.light.textSecondary} />
          <View style={styles.detailRowContent}>
            <Text style={styles.detailRowLabel}>Email</Text>
            <Text style={styles.detailRowValue}>{user.email}</Text>
          </View>
        </View>

        {user.phone && (
          <View style={styles.detailRow}>
            <Phone size={18} color={Colors.light.textSecondary} />
            <View style={styles.detailRowContent}>
              <Text style={styles.detailRowLabel}>Phone</Text>
              <Text style={styles.detailRowValue}>{user.phone}</Text>
            </View>
          </View>
        )}

        <View style={styles.detailRow}>
          <Shield size={18} color={Colors.light.textSecondary} />
          <View style={styles.detailRowContent}>
            <Text style={styles.detailRowLabel}>Role</Text>
            <Text style={styles.detailRowValue}>{user.role}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <UserIcon size={18} color={Colors.light.textSecondary} />
          <View style={styles.detailRowContent}>
            <Text style={styles.detailRowLabel}>Status</Text>
            <Text style={styles.detailRowValue}>{user.status}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Calendar size={18} color={Colors.light.textSecondary} />
          <View style={styles.detailRowContent}>
            <Text style={styles.detailRowLabel}>Created At</Text>
            <Text style={styles.detailRowValue}>{formatDate(user.createdAt)}</Text>
          </View>
        </View>
      </View>

      {user.providerId && (
        <TouchableOpacity style={styles.providerLinkButton} onPress={onViewProvider}>
          <Text style={styles.providerLinkButtonText}>View Provider Profile</Text>
        </TouchableOpacity>
      )}

      <View style={styles.detailActions}>
        <Text style={styles.detailActionsTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.detailActionButton}
          onPress={() => {
            Alert.alert("Change Role", "Select new role:", [
              { text: "Cancel", style: "cancel" },
              { text: "Admin", onPress: () => onChangeRole(user, "admin") },
              { text: "Provider", onPress: () => onChangeRole(user, "provider") },
              { text: "Customer", onPress: () => onChangeRole(user, "customer") },
            ]);
          }}
        >
          <Shield size={18} color={Colors.light.primary} />
          <Text style={styles.detailActionButtonText}>Change Role</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailActionButton}
          onPress={() => {
            Alert.alert("Change Status", "Select new status:", [
              { text: "Cancel", style: "cancel" },
              { text: "Active", onPress: () => onChangeStatus(user, "active") },
              { text: "Blocked", onPress: () => onChangeStatus(user, "blocked") },
              { text: "Frozen", onPress: () => onChangeStatus(user, "frozen") },
            ]);
          }}
        >
          <UserIcon size={18} color={Colors.light.primary} />
          <Text style={styles.detailActionButtonText}>Change Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.detailActionButton, styles.detailActionButtonDanger]}
          onPress={() => onDelete(user)}
        >
          <UserX size={18} color={Colors.light.error} />
          <Text style={[styles.detailActionButtonText, { color: Colors.light.error }]}>
            Delete User
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.light.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 80,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  titleMobile: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  subtitleMobile: {
    fontSize: 14,
  },
  controls: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  controlsMobile: {
    flexDirection: "column",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  searchBarMobile: {
    flex: 0,
    width: "100%",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    paddingVertical: 0,
    textAlignVertical: "center" as const,
    outlineStyle: "none" as any,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 48,
  },
  filterButtonMobile: {
    justifyContent: "center",
    width: "100%",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  filterMenu: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 16,
  },
  filterSection: {
    gap: 10,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
    textTransform: "uppercase" as const,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterOptionActive: {
    backgroundColor: `${Colors.light.primary}15`,
    borderColor: Colors.light.primary,
  },
  filterOptionText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
    textTransform: "capitalize" as const,
  },
  filterOptionTextActive: {
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  table: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  cardsList: {
    gap: 12,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
    textTransform: "uppercase" as const,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tableCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  userInitials: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  userId: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.light.text,
  },
  userPhone: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  userDate: {
    fontSize: 13,
    color: Colors.light.text,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: `${Colors.light.primary}10`,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  actionsWrapper: {
    position: "relative" as const,
  },
  moreButton: {
    padding: 6,
    borderRadius: 6,
  },
  actionMenuOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  actionMenu: {
    position: "absolute" as const,
    right: 0,
    top: 35,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 8,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  actionMenuTitle: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
    textTransform: "uppercase" as const,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actionMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionMenuItemText: {
    fontSize: 14,
    color: Colors.light.text,
    textTransform: "capitalize" as const,
  },
  actionMenuItemTextDisabled: {
    color: Colors.light.textSecondary,
    opacity: 0.5,
  },
  actionMenuDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 8,
  },
  userCardMobile: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  userCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  userCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  userCardInfo: {
    flex: 1,
    gap: 4,
  },
  userMeta: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  viewPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: `${Colors.light.primary}10`,
  },
  viewPillText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  userCardDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
  userCardChips: {
    flexDirection: "row",
    gap: 8,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  paginationButtonTextDisabled: {
    color: Colors.light.border,
  },
  paginationInfo: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  detailView: {
    gap: 20,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  detailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  detailAvatarText: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  detailName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    textAlign: "center",
  },
  detailId: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  detailSection: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  detailRowContent: {
    flex: 1,
    gap: 4,
  },
  detailRowLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  detailRowValue: {
    fontSize: 15,
    color: Colors.light.text,
  },
  providerLinkButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  providerLinkButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  detailActions: {
    gap: 12,
  },
  detailActionsTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  detailActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  detailActionButtonDanger: {
    borderColor: `${Colors.light.error}30`,
    backgroundColor: `${Colors.light.error}05`,
  },
  detailActionButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
});
