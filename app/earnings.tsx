import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import Colors from "@/constants/colors";
import { mockPayouts, Payout } from "@/mocks/dashboard";
import { Search, Download, DollarSign } from "lucide-react-native";
import { useState, useMemo } from "react";

export default function EarningsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "processing" | "completed" | "failed">("all");
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);

  const filteredPayouts = mockPayouts.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.providerId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === "all" || p.status === filter;

    return matchesSearch && matchesFilter;
  });

  const stats = useMemo(() => {
    const totalPending = mockPayouts
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalProcessing = mockPayouts
      .filter((p) => p.status === "processing")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalCompleted = mockPayouts
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    return { totalPending, totalProcessing, totalCompleted };
  }, []);

  const handleProcessPayout = (payout: Payout) => {
    setSelectedPayout(payout);
    setShowProcessModal(true);
  };

  const confirmProcessPayout = () => {
    if (selectedPayout) {
      console.log(`Processing payout ${selectedPayout.id} for ${selectedPayout.providerName}`);
      Alert.alert(
        "Payout Processed",
        `Payout ${selectedPayout.id} for ${selectedPayout.providerName} has been marked as processing.`
      );
      setShowProcessModal(false);
      setSelectedPayout(null);
    }
  };

  const handleExportCSV = () => {
    console.log("Exporting payouts to CSV");
    Alert.alert("Export CSV", "Payouts data would be exported to CSV file.");
  };

  return (
    <View style={styles.container}>
      <Sidebar />
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          isMobile && {
            ...styles.contentContainerMobile,
            paddingTop: 60 + insets.top + 16,
          },
        ]}
      >
        <SafeAreaView edges={["top", "right"]} style={[styles.safeArea, isMobile && styles.safeAreaMobile]}>
          <View style={[styles.header, isMobile && styles.headerMobile]}>
            <View>
              <Text style={[styles.title, isMobile && styles.titleMobile]}>Earnings & Payouts</Text>
              <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
                Manage provider earnings and payment processing
              </Text>
            </View>
            <TouchableOpacity style={[styles.exportButton, isMobile && styles.exportButtonMobile]} onPress={handleExportCSV}>
              <Download size={18} color="#FFFFFF" />
              <Text style={styles.exportButtonText}>Export CSV</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Pending Payouts</Text>
              <Text style={styles.statValue}>${stats.totalPending.toLocaleString()}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Processing</Text>
              <Text style={[styles.statValue, { color: Colors.light.warning }]}>
                ${stats.totalProcessing.toLocaleString()}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Completed (This Month)</Text>
              <Text style={[styles.statValue, { color: Colors.light.success }]}>
                ${stats.totalCompleted.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Search size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by payout ID, provider..."
              placeholderTextColor={Colors.light.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterBar}
            contentContainerStyle={styles.filterBarContent}
          >
            <FilterButton
              label="All"
              isActive={filter === "all"}
              onPress={() => setFilter("all")}
            />
            <FilterButton
              label="Pending"
              isActive={filter === "pending"}
              onPress={() => setFilter("pending")}
            />
            <FilterButton
              label="Processing"
              isActive={filter === "processing"}
              onPress={() => setFilter("processing")}
            />
            <FilterButton
              label="Completed"
              isActive={filter === "completed"}
              onPress={() => setFilter("completed")}
            />
            <FilterButton
              label="Failed"
              isActive={filter === "failed"}
              onPress={() => setFilter("failed")}
            />
          </ScrollView>

          {isMobile || isTablet ? (
            <View style={styles.mobileCardsContainer}>
              {filteredPayouts.map((payout) => (
                <PayoutCard
                  key={payout.id}
                  payout={payout}
                  onProcess={handleProcessPayout}
                />
              ))}
              {filteredPayouts.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No payouts found</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Payout ID</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Provider</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Amount</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Bookings</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Payout Date</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Actions</Text>
              </View>

              {filteredPayouts.map((payout) => (
                <PayoutRow
                  key={payout.id}
                  payout={payout}
                  onProcess={handleProcessPayout}
                />
              ))}

              {filteredPayouts.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No payouts found</Text>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </ScrollView>

      <Modal
        visible={showProcessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProcessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Process Payout</Text>
            <Text style={styles.modalText}>
              Are you sure you want to process this payout?
            </Text>
            {selectedPayout && (
              <View style={styles.modalDetails}>
                <Text style={styles.modalDetailText}>
                  Provider: {selectedPayout.providerName}
                </Text>
                <Text style={styles.modalDetailText}>
                  Amount: ${selectedPayout.amount.toLocaleString()}
                </Text>
              </View>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowProcessModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={confirmProcessPayout}
              >
                <Text style={styles.modalButtonText}>Process</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FilterButton({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          isActive && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function PayoutCard({
  payout,
  onProcess,
}: {
  payout: Payout;
  onProcess: (payout: Payout) => void;
}) {
  const getStatusStyle = () => {
    switch (payout.status) {
      case "completed":
        return {
          backgroundColor: `${Colors.light.success}15`,
          color: Colors.light.success,
        };
      case "processing":
        return {
          backgroundColor: `${Colors.light.warning}15`,
          color: Colors.light.warning,
        };
      case "pending":
        return {
          backgroundColor: `${Colors.light.primary}15`,
          color: Colors.light.primary,
        };
      default:
        return {
          backgroundColor: `${Colors.light.error}15`,
          color: Colors.light.error,
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.payoutCard}>
      <View style={styles.payoutCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.payoutCardId}>{payout.id}</Text>
          <Text style={styles.payoutCardProvider}>{payout.providerName}</Text>
          <Text style={styles.payoutCardSubtext}>{payout.providerId}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusStyle().backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusStyle().color }]}>
            {payout.status}
          </Text>
        </View>
      </View>

      <View style={styles.payoutCardDetails}>
        <View style={styles.payoutCardDetailRow}>
          <Text style={styles.payoutCardDetailLabel}>Amount</Text>
          <Text style={styles.payoutCardAmount}>
            ${payout.amount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.payoutCardDetailRow}>
          <Text style={styles.payoutCardDetailLabel}>Bookings</Text>
          <Text style={styles.payoutCardDetailValue}>
            {payout.bookingsCount} bookings
          </Text>
        </View>
        <View style={styles.payoutCardDetailRow}>
          <Text style={styles.payoutCardDetailLabel}>Payout Date</Text>
          <Text style={styles.payoutCardDetailValue}>
            {formatDate(payout.payoutDate)}
          </Text>
        </View>
      </View>

      {payout.status === "pending" && (
        <TouchableOpacity
          style={styles.payoutCardButton}
          onPress={() => onProcess(payout)}
        >
          <DollarSign size={18} color="#FFFFFF" />
          <Text style={styles.payoutCardButtonText}>Process Payout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function PayoutRow({
  payout,
  onProcess,
}: {
  payout: Payout;
  onProcess: (payout: Payout) => void;
}) {
  const getStatusStyle = () => {
    switch (payout.status) {
      case "completed":
        return {
          backgroundColor: `${Colors.light.success}15`,
          color: Colors.light.success,
        };
      case "processing":
        return {
          backgroundColor: `${Colors.light.warning}15`,
          color: Colors.light.warning,
        };
      case "pending":
        return {
          backgroundColor: `${Colors.light.primary}15`,
          color: Colors.light.primary,
        };
      default:
        return {
          backgroundColor: `${Colors.light.error}15`,
          color: Colors.light.error,
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.tableRow}>
      <View style={[styles.tableCell, { flex: 1 }]}>
        <Text style={styles.payoutId}>{payout.id}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.cellText}>{payout.providerName}</Text>
        <Text style={styles.cellSubtext}>{payout.providerId}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        <Text style={styles.amountText}>${payout.amount.toLocaleString()}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        <Text style={styles.cellText}>{payout.bookingsCount} bookings</Text>
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        <Text style={styles.cellText}>{formatDate(payout.payoutDate)}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusStyle().backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusStyle().color }]}>
            {payout.status}
          </Text>
        </View>
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        {payout.status === "pending" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onProcess(payout)}
          >
            <DollarSign size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Process</Text>
          </TouchableOpacity>
        )}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 32,
  },
  contentContainerMobile: {
    padding: 16,
    paddingTop: 92,
  },
  safeArea: {
    flex: 1,
  },
  safeAreaMobile: {
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  headerMobile: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  titleMobile: {
    fontSize: 24,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  subtitleMobile: {
    fontSize: 14,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exportButtonMobile: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 24,
  },
  statsRowMobile: {
    flexDirection: "column",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    outlineStyle: "none",
  },
  filterBar: {
    marginBottom: 24,
    flexGrow: 0,
  },
  filterBarContent: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  tableContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.light.background,
    paddingVertical: 16,
    paddingHorizontal: 20,
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    alignItems: "center",
  },
  tableCell: {
    justifyContent: "center",
    paddingRight: 12,
  },
  payoutId: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  cellText: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  cellSubtext: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize" as const,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  modalDetails: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  modalDetailText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonSecondary: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  mobileCardsContainer: {
    gap: 16,
  },
  payoutCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 16,
    gap: 16,
  },
  payoutCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  payoutCardId: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  payoutCardProvider: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  payoutCardSubtext: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  payoutCardDetails: {
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  payoutCardDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payoutCardDetailLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  payoutCardDetailValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  payoutCardAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  payoutCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  payoutCardButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
