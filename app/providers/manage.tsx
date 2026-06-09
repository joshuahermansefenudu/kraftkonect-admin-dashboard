import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Alert, useWindowDimensions,  } from "react-native";
import { PressableOpacity as TouchableOpacity } from "@/components/PressableOpacity";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import StatusChip from "@/components/StatusChip";
import ReasonModal from "@/components/ReasonModal";
import Colors from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  Play,
} from "lucide-react-native";
import { useState, useEffect, useCallback } from "react";
import { Provider, ProviderStatus } from "@/types/admin";
import {
  adminProvidersQuery,
  adminApproveProvider,
  adminRejectProvider,
  adminUpdateProviderStatus,
} from "@/services/adminApi";
import { useRouter } from "expo-router";

type ActionType = "approve" | "reject" | "suspend" | "unsuspend" | null;

export default function ProvidersManageScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProviderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [reasonModal, setReasonModal] = useState<{
    visible: boolean;
    actionType: ActionType;
    title: string;
    message: string;
  }>({
    visible: false,
    actionType: null,
    title: "",
    message: "",
  });

  const pageSize = 20;

  const loadProviders = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("[ProvidersManage] Loading providers with filters:", {
        search,
        statusFilter,
        page,
      });

      const response = await adminProvidersQuery({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        pageSize,
      });

      setProviders(response.providers);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("[ProvidersManage] Failed to load providers:", error);
      Alert.alert("Error", "Failed to load providers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, pageSize]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleViewProvider = (provider: Provider) => {
    console.log("[ProvidersManage] Viewing provider:", provider.id);
    router.push(`/providers/${provider.id}` as any);
  };

  const handleApprove = (provider: Provider) => {
    setSelectedProvider(provider);
    Alert.alert(
      "Approve Provider",
      `Are you sure you want to approve ${provider.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              await adminApproveProvider(provider.id);
              Alert.alert("Success", "Provider approved successfully");
              loadProviders();
            } catch (error) {
              console.error("[ProvidersManage] Approve failed:", error);
              Alert.alert("Error", "Failed to approve provider");
            }
          },
        },
      ]
    );
  };

  const handleReject = (provider: Provider) => {
    setSelectedProvider(provider);
    setReasonModal({
      visible: true,
      actionType: "reject",
      title: "Reject Provider",
      message: `Provide a reason for rejecting ${provider.name}:`,
    });
  };

  const handleSuspend = (provider: Provider) => {
    setSelectedProvider(provider);
    setReasonModal({
      visible: true,
      actionType: "suspend",
      title: "Suspend Provider",
      message: `Provide a reason for suspending ${provider.name}:`,
    });
  };

  const handleUnsuspend = (provider: Provider) => {
    setSelectedProvider(provider);
    Alert.alert(
      "Unsuspend Provider",
      `Are you sure you want to unsuspend ${provider.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unsuspend",
          onPress: async () => {
            try {
              await adminUpdateProviderStatus(provider.id, "approved");
              Alert.alert("Success", "Provider unsuspended successfully");
              loadProviders();
            } catch (error) {
              console.error("[ProvidersManage] Unsuspend failed:", error);
              Alert.alert("Error", "Failed to unsuspend provider");
            }
          },
        },
      ]
    );
  };

  const executeReasonAction = async (reason: string) => {
    if (!selectedProvider || !reasonModal.actionType) return;

    try {
      console.log(
        `[ProvidersManage] Executing action: ${reasonModal.actionType} for provider:`,
        selectedProvider.id
      );

      switch (reasonModal.actionType) {
        case "reject":
          await adminRejectProvider(selectedProvider.id, reason);
          Alert.alert("Success", "Provider rejected successfully");
          break;
        case "suspend":
          await adminUpdateProviderStatus(selectedProvider.id, "suspended", reason);
          Alert.alert("Success", "Provider suspended successfully");
          break;
      }

      loadProviders();
    } catch (error) {
      console.error("[ProvidersManage] Action failed:", error);
      Alert.alert("Error", "Failed to perform action. Please try again.");
    } finally {
      setReasonModal({ visible: false, actionType: null, title: "", message: "" });
      setSelectedProvider(null);
    }
  };

  const getStatusChipVariant = (status: ProviderStatus) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      case "suspended":
        return "error";
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
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, isMobile && styles.titleMobile]}>
                All Providers
              </Text>
              <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
                {total} total providers
              </Text>
            </View>
          </View>

          <View style={[styles.controls, isMobile && styles.controlsMobile]}>
            <Input
              placeholder="Search by name, email, category..."
              value={search}
              onChangeText={setSearch}
              icon={<Search size={18} color={Colors.light.textSecondary} />}
              containerStyle={{ flex: isMobile ? 0 : 1, width: isMobile ? "100%" : "auto" }}
            />

            <Button
              title="Status"
              variant="secondary"
              icon={<Filter size={18} color={Colors.light.primary} />}
              onPress={() => setShowFilterMenu(!showFilterMenu)}
              style={isMobile ? { width: "100%" } : undefined}
            />
          </View>

          {showFilterMenu && (
            <View style={styles.filterMenu}>
              <Text style={styles.filterLabel}>Provider Status</Text>
              <View style={styles.filterOptions}>
                {(["all", "pending", "approved", "rejected", "suspended"] as const).map(
                  (status) => (
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
                  )
                )}
              </View>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
          ) : providers.length === 0 ? (
            <View style={styles.emptyState}>
              <CheckCircle size={64} color={Colors.light.textSecondary} />
              <Text style={styles.emptyTitle}>No Providers Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <>
              {isMobile ? (
                <View style={styles.cardsList}>
                  {providers.map((provider) => (
                    <ProviderCardMobile
                      key={provider.id}
                      provider={provider}
                      onView={() => handleViewProvider(provider)}
                      getStatusChipVariant={getStatusChipVariant}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>Provider</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Category</Text>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>Location</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Created</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Actions</Text>
                  </View>

                  {providers.map((provider) => (
                    <View key={provider.id} style={styles.tableRow}>
                      <ProviderRow
                        provider={provider}
                        onView={() => handleViewProvider(provider)}
                        onApprove={() => handleApprove(provider)}
                        onReject={() => handleReject(provider)}
                        onSuspend={() => handleSuspend(provider)}
                        onUnsuspend={() => handleUnsuspend(provider)}
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

      <ReasonModal
        visible={reasonModal.visible}
        title={reasonModal.title}
        message={reasonModal.message}
        isRequired={true}
        onConfirm={executeReasonAction}
        onCancel={() =>
          setReasonModal({ visible: false, actionType: null, title: "", message: "" })
        }
      />
    </View>
  );
}

function ProviderRow({
  provider,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
  getStatusChipVariant,
}: {
  provider: Provider;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
  onSuspend: () => void;
  onUnsuspend: () => void;
  getStatusChipVariant: (status: ProviderStatus) => any;
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
        <View style={styles.providerAvatar}>
          <Text style={styles.providerInitials}>
            {provider.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Text>
        </View>
        <View>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerEmail}>{provider.email}</Text>
        </View>
      </View>

      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.providerCategory}>{provider.category}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 2 }]}>
        <Text style={styles.providerLocation}>{provider.location}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        <StatusChip label={provider.status} variant={getStatusChipVariant(provider.status)} />
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        <Text style={styles.providerDate}>{formatDate(provider.submittedAt)}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 1.5, gap: 6 }]}>
        <TouchableOpacity style={styles.viewButton} onPress={onView}>
          <Eye size={16} color={Colors.light.primary} />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>

        {provider.status === "pending" && (
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.approveQuickButton} onPress={onApprove}>
              <CheckCircle size={16} color={Colors.light.success} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectQuickButton} onPress={onReject}>
              <XCircle size={16} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
        )}

        {provider.status === "approved" && (
          <TouchableOpacity style={styles.suspendButton} onPress={onSuspend}>
            <Ban size={14} color={Colors.light.error} />
          </TouchableOpacity>
        )}

        {provider.status === "suspended" && (
          <TouchableOpacity style={styles.unsuspendButton} onPress={onUnsuspend}>
            <Play size={14} color={Colors.light.success} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

function ProviderCardMobile({
  provider,
  onView,
  getStatusChipVariant,
}: {
  provider: Provider;
  onView: () => void;
  getStatusChipVariant: (status: ProviderStatus) => any;
}) {
  return (
    <TouchableOpacity style={styles.providerCardMobile} onPress={onView} activeOpacity={0.85}>
      <View style={styles.providerCardTop}>
        <View style={styles.providerCardHeader}>
          <View style={styles.providerAvatar}>
            <Text style={styles.providerInitials}>
              {provider.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <View style={styles.providerCardInfo}>
            <Text style={styles.providerName} numberOfLines={1}>
              {provider.name}
            </Text>
            <Text style={styles.providerEmail} numberOfLines={1}>
              {provider.email}
            </Text>
            <Text style={styles.providerCategory} numberOfLines={1}>
              {provider.category}
            </Text>
            <Text style={styles.providerLocation} numberOfLines={1}>
              {provider.location}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewPill} onPress={onView}>
          <Eye size={14} color={Colors.light.primary} />
          <Text style={styles.viewPillText}>View</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.providerCardDivider} />

      <View style={styles.providerCardFooter}>
        <StatusChip label={provider.status} variant={getStatusChipVariant(provider.status)} />
      </View>
    </TouchableOpacity>
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
  providerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  providerInitials: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  providerName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  providerEmail: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  providerCategory: {
    fontSize: 13,
    color: Colors.light.text,
  },
  providerLocation: {
    fontSize: 13,
    color: Colors.light.text,
  },
  providerDate: {
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
  quickActions: {
    flexDirection: "row",
    gap: 6,
  },
  approveQuickButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: `${Colors.light.success}10`,
  },
  rejectQuickButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: `${Colors.light.error}10`,
  },
  suspendButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: `${Colors.light.error}10`,
  },
  unsuspendButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: `${Colors.light.success}10`,
  },
  providerCardMobile: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  providerCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  providerCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  providerCardInfo: {
    flex: 1,
    gap: 4,
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
  providerCardDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
  providerCardFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
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
});
