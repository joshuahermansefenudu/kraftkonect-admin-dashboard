import { StyleSheet, Text, View, ScrollView, useWindowDimensions, ActivityIndicator,  } from "react-native";
import { PressableOpacity as TouchableOpacity } from "@/components/PressableOpacity";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import Colors from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Search, FileText, Download } from "lucide-react-native";
import { useState, useEffect } from "react";
import { adminAuditLogsQuery, AdminAuditLog as AuditLog } from "@/services/adminApi";

export default function AuditLogsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();

  const [allLogs, setAllLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResource, setFilterResource] = useState<
    "all" | "provider" | "booking" | "dispute" | "ticket" | "category"
  >("all");
  const [filterAction, setFilterAction] = useState<
    "all" | "approve" | "reject" | "resolve" | "cancel" | "create" | "update" | "delete" | "close"
  >("all");

  const loadLogs = () => {
    setLoading(true);
    setError(null);
    adminAuditLogsQuery({})
      .then(setAllLogs)
      .catch((e) => setError(e.message ?? "Failed to load audit logs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = allLogs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesResource = filterResource === "all" || log.resource === filterResource;
    const matchesAction = filterAction === "all" || log.action === filterAction;

    return matchesSearch && matchesResource && matchesAction;
  });

  const handleExportLogs = () => {
    console.log("Exporting audit logs to CSV");
  };

  return (
    <View style={styles.container}>
      <Sidebar />
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          isMobile && { paddingTop: 60 + insets.top + 16 },
        ]}
      >
        <SafeAreaView edges={["top", "right"]} style={styles.safeArea}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Audit Logs</Text>
              <Text style={styles.subtitle}>
                View all admin actions and system events
              </Text>
            </View>
            <Button
              title="Export Logs"
              icon={<Download size={18} color="#FFFFFF" />}
              onPress={handleExportLogs}
            />
          </View>

          {loading && (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={{ marginTop: 12, color: Colors.light.textSecondary }}>Loading audit logs…</Text>
            </View>
          )}
          {error && !loading && (
            <View style={{ padding: 16, backgroundColor: `${Colors.light.error}10`, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: Colors.light.error, marginBottom: 8 }}>{error}</Text>
              <TouchableOpacity onPress={loadLogs}>
                <Text style={{ color: Colors.light.primary, fontWeight: "600" }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          <Input
            placeholder="Search logs by admin, action, resource..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon={<Search size={20} color={Colors.light.textSecondary} />}
            containerStyle={{ marginBottom: 24 }}
          />

          <View style={styles.filtersRow}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Resource Type</Text>
              <View style={styles.filterButtons}>
                <FilterButton
                  label="All"
                  isActive={filterResource === "all"}
                  onPress={() => setFilterResource("all")}
                />
                <FilterButton
                  label="Provider"
                  isActive={filterResource === "provider"}
                  onPress={() => setFilterResource("provider")}
                />
                <FilterButton
                  label="Booking"
                  isActive={filterResource === "booking"}
                  onPress={() => setFilterResource("booking")}
                />
                <FilterButton
                  label="Dispute"
                  isActive={filterResource === "dispute"}
                  onPress={() => setFilterResource("dispute")}
                />
                <FilterButton
                  label="Ticket"
                  isActive={filterResource === "ticket"}
                  onPress={() => setFilterResource("ticket")}
                />
                <FilterButton
                  label="Category"
                  isActive={filterResource === "category"}
                  onPress={() => setFilterResource("category")}
                />
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Action Type</Text>
              <View style={styles.filterButtons}>
                <FilterButton
                  label="All"
                  isActive={filterAction === "all"}
                  onPress={() => setFilterAction("all")}
                />
                <FilterButton
                  label="Approve"
                  isActive={filterAction === "approve"}
                  onPress={() => setFilterAction("approve")}
                />
                <FilterButton
                  label="Reject"
                  isActive={filterAction === "reject"}
                  onPress={() => setFilterAction("reject")}
                />
                <FilterButton
                  label="Resolve"
                  isActive={filterAction === "resolve"}
                  onPress={() => setFilterAction("resolve")}
                />
                <FilterButton
                  label="Cancel"
                  isActive={filterAction === "cancel"}
                  onPress={() => setFilterAction("cancel")}
                />
                <FilterButton
                  label="Create"
                  isActive={filterAction === "create"}
                  onPress={() => setFilterAction("create")}
                />
              </View>
            </View>
          </View>

          <View style={styles.logsContainer}>
            {filteredLogs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}

            {filteredLogs.length === 0 && (
              <View style={styles.emptyState}>
                <FileText size={48} color={Colors.light.textSecondary} />
                <Text style={styles.emptyText}>No audit logs found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your filters or search query
                </Text>
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
    <Button
      title={label}
      variant={isActive ? "primary" : "secondary"}
      onPress={onPress}
      style={{
        height: 36,
        borderRadius: 18,
        paddingHorizontal: 16,
      }}
      textStyle={{
        fontSize: 13,
      }}
    />
  );
}

function LogCard({ log }: { log: AuditLog }) {
  const getActionStyle = () => {
    switch (log.action) {
      case "approve":
        return { backgroundColor: `${Colors.light.success}15`, color: Colors.light.success };
      case "reject":
      case "delete":
      case "cancel":
        return { backgroundColor: `${Colors.light.error}15`, color: Colors.light.error };
      case "resolve":
      case "close":
        return { backgroundColor: `${Colors.light.primary}15`, color: Colors.light.primary };
      case "create":
      case "update":
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.logHeaderLeft}>
          <Text style={styles.logId}>{log.id}</Text>
          <View
            style={[
              styles.actionBadge,
              { backgroundColor: getActionStyle().backgroundColor },
            ]}
          >
            <Text style={[styles.actionText, { color: getActionStyle().color }]}>
              {log.action}
            </Text>
          </View>
          <View style={styles.resourceBadge}>
            <Text style={styles.resourceText}>{log.resource}</Text>
          </View>
        </View>
        <Text style={styles.timestamp}>{formatTimestamp(log.timestamp)}</Text>
      </View>

      <Text style={styles.logDetails}>{log.details}</Text>

      <View style={styles.logFooter}>
        <View style={styles.logFooterItem}>
          <Text style={styles.logFooterLabel}>Admin User:</Text>
          <Text style={styles.logFooterValue}>{log.adminUser}</Text>
        </View>
        <View style={styles.logFooterItem}>
          <Text style={styles.logFooterLabel}>Resource ID:</Text>
          <Text style={styles.logFooterValue}>{log.resourceId}</Text>
        </View>
        <View style={styles.logFooterItem}>
          <Text style={styles.logFooterLabel}>IP Address:</Text>
          <Text style={styles.logFooterValue}>{log.ip}</Text>
        </View>
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
    padding: 16,
    paddingTop: 92,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
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
    marginBottom: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    outlineStyle: "none" as any,
  },
  filtersRow: {
    gap: 20,
    marginBottom: 24,
  },
  filterGroup: {
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  logsContainer: {
    gap: 16,
  },
  logCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  logHeader: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 12,
  },
  logHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  logId: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  resourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: `${Colors.light.textSecondary}15`,
  },
  resourceText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
    textTransform: "capitalize" as const,
  },
  timestamp: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  logDetails: {
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  logFooter: {
    flexDirection: "column",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  logFooterItem: {
    gap: 4,
  },
  logFooterLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  logFooterValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});
