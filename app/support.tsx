import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import Colors from "@/constants/colors";
import { mockTickets, Ticket } from "@/mocks/dashboard";
import { Search } from "lucide-react-native";
import { useState } from "react";

export default function SupportCenterScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "in-progress" | "resolved">(
    "all"
  );

  const filteredTickets = mockTickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === "all" || t.status === filter;

    return matchesSearch && matchesFilter;
  });

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
        <SafeAreaView edges={["right", "left"]} style={styles.safeArea}>
          <View style={[styles.header, isMobile && styles.headerMobile]}>
            <View>
              <Text style={styles.title}>Support Center</Text>
              <Text style={styles.subtitle}>Manage user support tickets</Text>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Search size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tickets..."
              placeholderTextColor={Colors.light.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={[styles.filterBar, isMobile && styles.filterBarMobile]}>
            <FilterButton
              label="All"
              isActive={filter === "all"}
              onPress={() => setFilter("all")}
            />
            <FilterButton
              label="Open"
              isActive={filter === "open"}
              onPress={() => setFilter("open")}
            />
            <FilterButton
              label="In Progress"
              isActive={filter === "in-progress"}
              onPress={() => setFilter("in-progress")}
            />
            <FilterButton
              label="Resolved"
              isActive={filter === "resolved"}
              onPress={() => setFilter("resolved")}
            />
          </View>

          <View style={styles.ticketsList}>
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}

            {filteredTickets.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No tickets found</Text>
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

function TicketCard({ ticket }: { ticket: Ticket }) {
  const getPriorityStyle = () => {
    switch (ticket.priority) {
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
    switch (ticket.status) {
      case "resolved":
        return {
          backgroundColor: `${Colors.light.success}15`,
          color: Colors.light.success,
        };
      case "in-progress":
        return {
          backgroundColor: `${Colors.light.primary}15`,
          color: Colors.light.primary,
        };
      default:
        return {
          backgroundColor: `${Colors.light.warning}15`,
          color: Colors.light.warning,
        };
    }
  };

  const getCategoryStyle = () => {
    switch (ticket.category) {
      case "bug":
        return { backgroundColor: `${Colors.light.error}15`, color: Colors.light.error };
      case "payment":
        return {
          backgroundColor: `${Colors.light.primary}15`,
          color: Colors.light.primary,
        };
      case "account":
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

  return (
    <TouchableOpacity style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <View style={styles.ticketHeaderTop}>
          <Text style={styles.ticketId}>{ticket.id}</Text>
        </View>
        <View style={styles.ticketHeaderBadges}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryStyle().backgroundColor },
            ]}
          >
            <Text style={[styles.categoryText, { color: getCategoryStyle().color }]}>
              {ticket.category}
            </Text>
          </View>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityStyle().backgroundColor },
            ]}
          >
            <Text
              style={[styles.priorityText, { color: getPriorityStyle().color }]}
            >
              {ticket.priority}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.ticketSubject}>{ticket.subject}</Text>

      <View style={styles.ticketFooter}>
        <View style={styles.ticketInfoRow}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketLabel}>User:</Text>
            <Text style={styles.ticketValue}>{ticket.userName}</Text>
          </View>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketLabel}>Created:</Text>
            <Text style={styles.ticketValue}>{formatDate(ticket.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketLabel}>Last Reply:</Text>
          <Text style={styles.ticketValue}>{formatDate(ticket.lastReply)}</Text>
        </View>
      </View>

      <View style={styles.ticketActions}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusStyle().backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusStyle().color }]}>
            {ticket.status}
          </Text>
        </View>
        {ticket.status !== "resolved" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
            >
              <Text style={styles.actionButtonSecondaryText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
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
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
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
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  filterBarMobile: {
    flexWrap: "wrap",
  },
  filterButton: {
    paddingHorizontal: 14,
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
  ticketsList: {
    gap: 16,
  },
  ticketCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  ticketHeader: {
    flexDirection: "column",
    gap: 8,
    marginBottom: 12,
  },
  ticketHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  ticketHeaderBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  ticketId: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize" as const,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  ticketFooter: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  ticketInfoRow: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
  },
  ticketInfo: {
    gap: 4,
  },
  ticketLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  ticketValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  ticketActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
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
    paddingHorizontal: 14,
    paddingVertical: 7,
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
});
