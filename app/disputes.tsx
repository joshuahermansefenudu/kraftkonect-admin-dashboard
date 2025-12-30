import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import Colors from "@/constants/colors";
import { mockDisputes, Dispute } from "@/mocks/dashboard";
import { useState, useMemo } from "react";

type FilterType = "all" | "pending" | "high" | "medium" | "low" | "resolved";
type SortType = "date" | "urgency";

export default function DisputeCenterScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();
  
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("date");
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);

  const filteredAndSortedDisputes = useMemo(() => {
    let filtered = disputes;
    
    if (filter === "pending") {
      filtered = disputes.filter((d) => d.status === "open");
    } else if (filter === "high") {
      filtered = disputes.filter((d) => d.status === "escalated" && d.severity === "high");
    } else if (filter === "medium") {
      filtered = disputes.filter((d) => d.status === "escalated" && d.severity === "medium");
    } else if (filter === "low") {
      filtered = disputes.filter((d) => d.status === "escalated" && d.severity === "low");
    } else if (filter === "resolved") {
      filtered = disputes.filter((d) => d.status === "resolved");
    }

    const sorted = [...filtered];
    if (sortBy === "date") {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "urgency") {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      sorted.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
    }

    return sorted;
  }, [disputes, filter, sortBy]);

  const handleResolve = (disputeId: string) => {
    setDisputes(prev => prev.map(d => 
      d.id === disputeId ? { ...d, status: "resolved" as const } : d
    ));
  };

  const handleEscalate = (disputeId: string, severity: "high" | "medium" | "low") => {
    setDisputes(prev => prev.map(d => 
      d.id === disputeId ? { ...d, status: "escalated" as const, severity } : d
    ));
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
              <Text style={[styles.title, isMobile && styles.titleMobile]}>Dispute Center</Text>
              <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
                Manage and resolve customer disputes
              </Text>
            </View>
          </View>

          <View style={styles.filtersContainer}>
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
                label="High"
                isActive={filter === "high"}
                onPress={() => setFilter("high")}
              />
              <FilterButton
                label="Medium"
                isActive={filter === "medium"}
                onPress={() => setFilter("medium")}
              />
              <FilterButton
                label="Low"
                isActive={filter === "low"}
                onPress={() => setFilter("low")}
              />
              <FilterButton
                label="Resolved"
                isActive={filter === "resolved"}
                onPress={() => setFilter("resolved")}
              />
            </ScrollView>
            
            <View style={styles.sortContainer}>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === "date" && styles.sortButtonActive]}
                onPress={() => setSortBy("date")}
              >
                <Text style={[styles.sortButtonText, sortBy === "date" && styles.sortButtonTextActive]}>
                  Date
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === "urgency" && styles.sortButtonActive]}
                onPress={() => setSortBy("urgency")}
              >
                <Text style={[styles.sortButtonText, sortBy === "urgency" && styles.sortButtonTextActive]}>
                  Urgency
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.disputesList}>
            {filteredAndSortedDisputes.map((dispute) => (
              <DisputeCard 
                key={dispute.id} 
                dispute={dispute}
                onResolve={handleResolve}
                onEscalate={handleEscalate}
              />
            ))}

            {filteredAndSortedDisputes.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No disputes found</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </ScrollView>
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
        style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DisputeCard({ 
  dispute, 
  onResolve, 
  onEscalate 
}: { 
  dispute: Dispute;
  onResolve: (id: string) => void;
  onEscalate: (id: string, severity: "high" | "medium" | "low") => void;
}) {
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const getSeverityStyle = () => {
    switch (dispute.severity) {
      case "high":
        return { backgroundColor: `${Colors.light.error}15`, color: Colors.light.error };
      case "medium":
        return {
          backgroundColor: `${Colors.light.warning}15`,
          color: Colors.light.warning,
        };
      default:
        return {
          backgroundColor: `${Colors.light.textSecondary}15`,
          color: Colors.light.textSecondary,
        };
    }
  };

  const getStatusStyle = () => {
    switch (dispute.status) {
      case "resolved":
        return {
          backgroundColor: `${Colors.light.success}15`,
          color: Colors.light.success,
        };
      case "escalated":
        return { backgroundColor: `${Colors.light.error}15`, color: Colors.light.error };
      default:
        return {
          backgroundColor: `${Colors.light.primary}15`,
          color: Colors.light.primary,
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return `${hours}h ago`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleResolveConfirm = () => {
    onResolve(dispute.id);
    setShowResolveModal(false);
  };

  const handleEscalateSelect = (severity: "high" | "medium" | "low") => {
    onEscalate(dispute.id, severity);
    setShowEscalateModal(false);
  };

  return (
    <View>
      <TouchableOpacity style={styles.disputeCard}>
      <View style={styles.disputeHeader}>
        <View style={styles.disputeHeaderLeft}>
          <Text style={styles.disputeId}>{dispute.id}</Text>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: `${Colors.light.primary}15` },
            ]}
          >
            <Text style={[styles.typeText, { color: Colors.light.primary }]}>
              {dispute.type}
            </Text>
          </View>
        </View>
        <View style={styles.disputeHeaderRight}>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: getSeverityStyle().backgroundColor },
            ]}
          >
            <Text style={[styles.severityText, { color: getSeverityStyle().color }]}>
              {dispute.severity}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.disputeDescription}>{dispute.description}</Text>

      <View style={styles.disputeFooter}>
        <View style={styles.disputeInfo}>
          <Text style={styles.disputeLabel}>Booking:</Text>
          <Text style={styles.disputeValue}>{dispute.bookingId}</Text>
        </View>
        <View style={styles.disputeInfo}>
          <Text style={styles.disputeLabel}>Reporter:</Text>
          <Text style={styles.disputeValue}>{dispute.reporter}</Text>
        </View>
        <View style={styles.disputeInfo}>
          <Text style={styles.disputeLabel}>Created:</Text>
          <Text style={styles.disputeValue}>{formatDate(dispute.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.disputeActions}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusStyle().backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusStyle().color }]}>
            {dispute.status}
          </Text>
        </View>
        {dispute.status === "open" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowResolveModal(true)}
            >
              <Text style={styles.actionButtonText}>Resolve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => setShowEscalateModal(true)}
            >
              <Text style={styles.actionButtonSecondaryText}>Escalate</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      </TouchableOpacity>

      <Modal
        visible={showResolveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResolveModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowResolveModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Resolve Dispute</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to mark this dispute as resolved?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowResolveModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleResolveConfirm}
              >
                <Text style={styles.modalButtonConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showEscalateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEscalateModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEscalateModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Escalate Dispute</Text>
            <Text style={styles.modalMessage}>
              Select priority level for escalation:
            </Text>
            <View style={styles.escalateOptions}>
              <TouchableOpacity
                style={[styles.escalateOption, styles.escalateHigh]}
                onPress={() => handleEscalateSelect("high")}
              >
                <Text style={styles.escalateOptionText}>High Priority</Text>
                <Text style={styles.escalateOptionDescription}>Urgent attention required</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.escalateOption, styles.escalateMedium]}
                onPress={() => handleEscalateSelect("medium")}
              >
                <Text style={styles.escalateOptionText}>Medium Priority</Text>
                <Text style={styles.escalateOptionDescription}>Attention needed soon</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.escalateOption, styles.escalateLow]}
                onPress={() => handleEscalateSelect("low")}
              >
                <Text style={styles.escalateOptionText}>Low Priority</Text>
                <Text style={styles.escalateOptionDescription}>Can be handled later</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowEscalateModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  filtersContainer: {
    marginBottom: 24,
    gap: 16,
  },
  filterBar: {
    marginBottom: 0,
  },
  filterBarContent: {
    flexDirection: "row",
    gap: 12,
  },
  sortContainer: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sortButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  sortButtonTextActive: {
    color: "#FFFFFF",
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
  disputesList: {
    gap: 16,
  },
  disputeCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  disputeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  disputeHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  disputeHeaderRight: {
    flexDirection: "row",
    gap: 8,
  },
  disputeId: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize" as const,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  disputeDescription: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  disputeFooter: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  disputeInfo: {
    gap: 4,
  },
  disputeLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  disputeValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  disputeActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize" as const,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  actionButtonSecondaryText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  modalButtonConfirm: {
    backgroundColor: Colors.light.primary,
  },
  modalButtonConfirmText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  escalateOptions: {
    gap: 12,
    marginBottom: 16,
  },
  escalateOption: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
  },
  escalateHigh: {
    borderColor: Colors.light.error,
    backgroundColor: `${Colors.light.error}08`,
  },
  escalateMedium: {
    borderColor: Colors.light.warning,
    backgroundColor: `${Colors.light.warning}08`,
  },
  escalateLow: {
    borderColor: Colors.light.textSecondary,
    backgroundColor: `${Colors.light.textSecondary}08`,
  },
  escalateOptionText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  escalateOptionDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  modalCancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
});
