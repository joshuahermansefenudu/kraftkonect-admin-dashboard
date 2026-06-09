import { StyleSheet, Text, View, ScrollView, useWindowDimensions, ActivityIndicator, Modal, Alert } from "react-native";
import { PressableOpacity as TouchableOpacity } from "@/components/PressableOpacity";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import Colors from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Search } from "lucide-react-native";
import { useState, useEffect } from "react";
import { adminTicketsQuery, adminReplyTicketApi, adminCloseTicketApi, AdminTicket as Ticket } from "@/services/adminApi";

export default function SupportCenterScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();

  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "in-progress" | "resolved">("all");

  // Reply modal state
  const [replyTicket, setReplyTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);
  const [closing, setClosing] = useState<string | null>(null);

  const loadTickets = () => {
    setLoading(true);
    setError(null);
    adminTicketsQuery({})
      .then((tickets) => setAllTickets(tickets))
      .catch((e) => setError(e.message ?? "Failed to load tickets"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = allTickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleReply = async () => {
    if (!replyTicket || !replyMessage.trim()) return;
    setReplying(true);
    try {
      await adminReplyTicketApi(replyTicket.id, replyMessage.trim());
      setAllTickets((prev) =>
        prev.map((t) =>
          t.id === replyTicket.id
            ? { ...t, status: "in-progress" as const, lastReply: new Date().toISOString() }
            : t,
        ),
      );
      setReplyTicket(null);
      setReplyMessage("");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  const handleClose = (ticket: Ticket) => {
    Alert.alert(
      "Close Ticket",
      `Mark "${ticket.subject}" as resolved?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close",
          style: "destructive",
          onPress: async () => {
            setClosing(ticket.id);
            try {
              await adminCloseTicketApi(ticket.id);
              setAllTickets((prev) =>
                prev.map((t) =>
                  t.id === ticket.id ? { ...t, status: "resolved" as const } : t,
                ),
              );
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Failed to close ticket");
            } finally {
              setClosing(null);
            }
          },
        },
      ],
    );
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
        <SafeAreaView edges={["right", "left"]} style={styles.safeArea}>
          <View style={[styles.header, isMobile && styles.headerMobile]}>
            <View>
              <Text style={styles.title}>Support Center</Text>
              <Text style={styles.subtitle}>Manage user support tickets</Text>
            </View>
          </View>

          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon={<Search size={20} color={Colors.light.textSecondary} />}
            containerStyle={{ marginBottom: 16 }}
          />

          {loading && (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={{ marginTop: 12, color: Colors.light.textSecondary }}>Loading tickets…</Text>
            </View>
          )}
          {error && !loading && (
            <View style={{ padding: 16, backgroundColor: `${Colors.light.error}10`, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: Colors.light.error, marginBottom: 8 }}>{error}</Text>
              <TouchableOpacity onPress={loadTickets}>
                <Text style={{ color: Colors.light.primary, fontWeight: "600" }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.filterBar, isMobile && styles.filterBarMobile]}>
            <FilterButton label="All" isActive={filter === "all"} onPress={() => setFilter("all")} />
            <FilterButton label="Open" isActive={filter === "open"} onPress={() => setFilter("open")} />
            <FilterButton label="In Progress" isActive={filter === "in-progress"} onPress={() => setFilter("in-progress")} />
            <FilterButton label="Resolved" isActive={filter === "resolved"} onPress={() => setFilter("resolved")} />
          </View>

          <View style={styles.ticketsList}>
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                closing={closing === ticket.id}
                onReply={() => { setReplyTicket(ticket); setReplyMessage(""); }}
                onClose={() => handleClose(ticket)}
              />
            ))}

            {filteredTickets.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No tickets found</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </ScrollView>

      {/* Reply Modal */}
      <Modal
        visible={!!replyTicket}
        transparent
        animationType="fade"
        onRequestClose={() => setReplyTicket(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => !replying && setReplyTicket(null)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.replyModal}>
            <Text style={styles.replyModalTitle}>Reply to Ticket</Text>
            {replyTicket && (
              <Text style={styles.replyModalSubject} numberOfLines={2}>
                {replyTicket.subject}
              </Text>
            )}
            <Input
              placeholder="Type your reply..."
              value={replyMessage}
              onChangeText={setReplyMessage}
              multiline
              containerStyle={{ marginTop: 16, marginBottom: 20 }}
              style={{ minHeight: 100 }}
            />
            <View style={styles.replyActions}>
              <Button
                title="Cancel"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => setReplyTicket(null)}
                disabled={replying}
              />
              <Button
                title={replying ? "Sending…" : "Send Reply"}
                style={{ flex: 1 }}
                onPress={handleReply}
                disabled={replying || !replyMessage.trim()}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function FilterButton({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) {
  return (
    <Button
      title={label}
      variant={isActive ? "primary" : "secondary"}
      onPress={onPress}
      style={{ height: 36, borderRadius: 18, paddingHorizontal: 16 }}
      textStyle={{ fontSize: 13 }}
    />
  );
}

function TicketCard({
  ticket,
  closing,
  onReply,
  onClose,
}: {
  ticket: Ticket;
  closing: boolean;
  onReply: () => void;
  onClose: () => void;
}) {
  const getPriorityStyle = () => {
    switch (ticket.priority) {
      case "high": return { backgroundColor: `${Colors.light.error}15`, color: Colors.light.error };
      case "medium": return { backgroundColor: `${Colors.light.warning}15`, color: Colors.light.warning };
      default: return { backgroundColor: `${Colors.light.textSecondary}15`, color: Colors.light.textSecondary };
    }
  };

  const getStatusStyle = () => {
    switch (ticket.status) {
      case "resolved": return { backgroundColor: `${Colors.light.success}15`, color: Colors.light.success };
      case "in-progress": return { backgroundColor: `${Colors.light.primary}15`, color: Colors.light.primary };
      default: return { backgroundColor: `${Colors.light.warning}15`, color: Colors.light.warning };
    }
  };

  const getCategoryStyle = () => {
    switch (ticket.category) {
      case "bug": return { backgroundColor: `${Colors.light.error}15`, color: Colors.light.error };
      case "payment": return { backgroundColor: `${Colors.light.primary}15`, color: Colors.light.primary };
      case "account": return { backgroundColor: `${Colors.light.warning}15`, color: Colors.light.warning };
      default: return { backgroundColor: `${Colors.light.textSecondary}15`, color: Colors.light.textSecondary };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <View style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <View style={styles.ticketHeaderTop}>
          <Text style={styles.ticketId}>{ticket.id}</Text>
        </View>
        <View style={styles.ticketHeaderBadges}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryStyle().backgroundColor }]}>
            <Text style={[styles.categoryText, { color: getCategoryStyle().color }]}>{ticket.category}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityStyle().backgroundColor }]}>
            <Text style={[styles.priorityText, { color: getPriorityStyle().color }]}>{ticket.priority}</Text>
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
        <View style={[styles.statusBadge, { backgroundColor: getStatusStyle().backgroundColor }]}>
          <Text style={[styles.statusText, { color: getStatusStyle().color }]}>{ticket.status}</Text>
        </View>
        {ticket.status !== "resolved" && ticket.status !== "closed" && (
          <View style={styles.actionButtons}>
            <Button
              title="Reply"
              onPress={onReply}
              style={{ height: 32, borderRadius: 16, paddingHorizontal: 12 }}
              textStyle={{ fontSize: 13 }}
            />
            <Button
              title={closing ? "Closing…" : "Close"}
              variant="secondary"
              onPress={onClose}
              disabled={closing}
              style={{ height: 32, borderRadius: 16, paddingHorizontal: 12 }}
              textStyle={{ fontSize: 13 }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: Colors.light.background },
  content: { flex: 1 },
  contentContainer: { padding: 32 },
  contentContainerMobile: { padding: 16, paddingTop: 92 },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  headerMobile: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "700" as const, color: Colors.light.text, marginBottom: 4 },
  subtitle: { fontSize: 16, color: Colors.light.textSecondary },
  filterBar: { flexDirection: "row", gap: 12, marginBottom: 24 },
  filterBarMobile: { flexWrap: "wrap" },
  ticketsList: { gap: 16 },
  ticketCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  ticketHeader: { flexDirection: "column", gap: 8, marginBottom: 12 },
  ticketHeaderTop: { flexDirection: "row", alignItems: "center" },
  ticketHeaderBadges: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  ticketId: { fontSize: 15, fontWeight: "600" as const, color: Colors.light.text },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  categoryText: { fontSize: 12, fontWeight: "600" as const, textTransform: "capitalize" as const },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  priorityText: { fontSize: 12, fontWeight: "600" as const, textTransform: "uppercase" as const },
  ticketSubject: { fontSize: 16, fontWeight: "600" as const, color: Colors.light.text, marginBottom: 16, lineHeight: 22 },
  ticketFooter: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  ticketInfoRow: { flexDirection: "row", gap: 20, flexWrap: "wrap" },
  ticketInfo: { gap: 4 },
  ticketLabel: { fontSize: 12, color: Colors.light.textSecondary },
  ticketValue: { fontSize: 13, fontWeight: "500" as const, color: Colors.light.text },
  ticketActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: "600" as const, textTransform: "capitalize" as const },
  actionButtons: { flexDirection: "row", gap: 8 },
  emptyState: { paddingVertical: 60, alignItems: "center" },
  emptyText: { fontSize: 15, color: Colors.light.textSecondary },

  // Reply modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  replyModal: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 480,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  replyModalTitle: { fontSize: 20, fontWeight: "700" as const, color: Colors.light.text, marginBottom: 8 },
  replyModalSubject: { fontSize: 14, color: Colors.light.textSecondary, lineHeight: 20 },
  replyActions: { flexDirection: "row", gap: 12 },
});
