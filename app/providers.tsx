import { StyleSheet, Text, View, ScrollView, Alert, Modal, useWindowDimensions, ActivityIndicator, Image, Linking,  } from "react-native";
import { PressableOpacity as TouchableOpacity } from "@/components/PressableOpacity";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import Colors from "@/constants/colors";
import { Button } from "@/components/Button";
import {
  CheckCircle,
  XCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  X,
  Download,
  RefreshCw,
  AlertTriangle,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import {
  adminProvidersQuery,
  adminApproveProvider,
  adminRejectProvider,
  adminAiPreScreenApi,
  BackendProvider,
} from "@/services/adminApi";

type Provider = BackendProvider;

export default function ProviderApprovalsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [viewingDocument, setViewingDocument] = useState<{ name: string; url: string; provider: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadProviders = () => {
    setLoading(true);
    setError(null);
    adminProvidersQuery({ status: "pending" })
      .then((res) => setProviders(res.providers as unknown as Provider[]))
      .catch((e) => setError(e.message ?? "Failed to load providers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const pendingProviders = providers.filter((p) => p.status === "pending");

  const handleAction = (provider: Provider, action: "approve" | "reject") => {
    setSelectedProvider(provider);
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedProvider || !actionType || actionLoading) return;

    setActionLoading(true);
    try {
      if (actionType === "approve") {
        await adminApproveProvider(selectedProvider.id);
      } else {
        await adminRejectProvider(selectedProvider.id);
      }
      Alert.alert(
        actionType === "approve" ? "Provider Approved" : "Provider Rejected",
        `${selectedProvider.name} has been ${actionType === "approve" ? "approved" : "rejected"}.`
      );
      setProviders((prev) =>
        prev.map((p) =>
          p.id === selectedProvider.id
            ? { ...p, status: (actionType === "approve" ? "approved" : "rejected") as Provider["status"] }
            : p
        )
      );
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
      setShowModal(false);
      setSelectedProvider(null);
      setActionType(null);
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
            <View style={styles.headerText}>
              <Text style={styles.title}>Provider Approvals</Text>
              <Text style={styles.subtitle}>
                Review and approve provider applications
              </Text>
            </View>
            <View style={styles.statsChip}>
              <Text style={styles.statsChipText}>
                {pendingProviders.length} Pending
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={{ padding: 60, alignItems: "center" }}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={{ marginTop: 12, color: Colors.light.textSecondary }}>Loading providers…</Text>
            </View>
          ) : error ? (
            <View style={{ padding: 24, backgroundColor: `${Colors.light.error}10`, borderRadius: 8 }}>
              <Text style={{ color: Colors.light.error, marginBottom: 12 }}>{error}</Text>
              <Button
                title="Retry"
                onPress={loadProviders}
                style={{ alignSelf: "flex-start" }}
              />
            </View>
          ) : pendingProviders.length === 0 ? (
            <View style={styles.emptyState}>
              <CheckCircle size={64} color={Colors.light.success} />
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptySubtitle}>
                There are no pending provider applications to review
              </Text>
            </View>
          ) : (
            <View style={styles.providersList}>
              {pendingProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onApprove={() => handleAction(provider, "approve")}
                  onReject={() => handleAction(provider, "reject")}
                  onDocumentPress={(doc) => setViewingDocument({ name: doc.name, url: doc.url, provider: provider.name })}
                  onRerunAi={async () => {
                    try {
                      const updated = await adminAiPreScreenApi(provider.id);
                      setProviders((prev) =>
                        prev.map((p) =>
                          p.id === provider.id
                            ? {
                                ...p,
                                aiPhotoQuality: updated.aiPhotoQuality,
                                aiIdReadable: updated.aiIdReadable,
                                aiFaceMatch: updated.aiFaceMatch,
                                aiDuplicateFlag: updated.aiDuplicateFlag,
                              }
                            : p
                        )
                      );
                    } catch {
                      Alert.alert("Error", "AI re-check failed. Please try again.");
                    }
                  }}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === "approve" ? "Approve Provider" : "Reject Provider"}
            </Text>
            <Text style={styles.modalText}>
              Are you sure you want to {actionType} this provider application?
            </Text>
            {selectedProvider && (
              <View style={styles.modalDetails}>
                <Text style={styles.modalDetailText}>
                  Provider: {selectedProvider.name}
                </Text>
                <Text style={styles.modalDetailText}>
                  Category: {selectedProvider.category}
                </Text>
                <Text style={styles.modalDetailSubtext}>
                  An automated email notification will be sent to the provider.
                </Text>
              </View>
            )}
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowModal(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={actionType === "approve" ? "Approve" : "Reject"}
                variant="primary"
                onPress={confirmAction}
                disabled={actionLoading}
                loading={actionLoading}
                style={{
                  flex: 1,
                  backgroundColor: actionType === "approve" ? Colors.light.success : Colors.light.error,
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <DocumentViewerModal
        document={viewingDocument}
        onClose={() => setViewingDocument(null)}
      />
    </View>
  );
}

function DocumentViewerModal({
  document,
  onClose,
}: {
  document: { name: string; url: string; provider: string } | null;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (!document) return null;

  const handleOpenExternal = () => {
    Linking.openURL(document.url).catch(() =>
      Alert.alert("Couldn't open", "Unable to open the document in a new tab."),
    );
  };

  return (
    <Modal
      visible={!!document}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.documentModalOverlay}>
        <View style={[styles.documentModalContent, isMobile && styles.documentModalContentMobile]}>
          <View style={styles.documentModalHeader}>
            <View style={styles.documentModalHeaderText}>
              <Text style={styles.documentModalTitle}>{document.name}</Text>
              <Text style={styles.documentModalSubtitle}>{document.provider}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.documentModalCloseButton}
            >
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.documentModalBody}
            contentContainerStyle={styles.documentModalBodyContent}
          >
            <Image
              source={{ uri: document.url }}
              style={styles.documentImage}
              resizeMode="contain"
            />
          </ScrollView>

          <View style={styles.documentModalFooter}>
            <Button
              title="Open Full Size"
              icon={<Download size={18} color="#FFFFFF" />}
              onPress={handleOpenExternal}
              style={{ width: "100%" }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── AI verdict helpers ────────────────────────────────────────────────────────

function AiCheckBadge({
  label,
  value,
}: {
  label: string;
  value: boolean | null;
}) {
  const isPending = value === null;
  const passed = value === true;

  const bg = isPending
    ? "#F3F4F6"
    : passed
    ? `${Colors.light.success}18`
    : `${Colors.light.error}18`;

  const textColor = isPending
    ? Colors.light.textSecondary
    : passed
    ? Colors.light.success
    : Colors.light.error;

  const icon = isPending ? "·" : passed ? "✓" : "✗";

  return (
    <View style={[styles.aiBadge, { backgroundColor: bg }]}>
      <Text style={[styles.aiBadgeIcon, { color: textColor }]}>{icon}</Text>
      <Text style={[styles.aiBadgeLabel, { color: textColor }]}>{label}</Text>
    </View>
  );
}

function AiPreScreenPanel({
  provider,
  onRerunAi,
}: {
  provider: Provider;
  onRerunAi: () => Promise<void>;
}) {
  const [rerunLoading, setRerunLoading] = useState(false);

  const allNull =
    provider.aiPhotoQuality === null &&
    provider.aiIdReadable === null &&
    provider.aiFaceMatch === null &&
    provider.aiDuplicateFlag === null;

  const handleRerun = async () => {
    setRerunLoading(true);
    await onRerunAi();
    setRerunLoading(false);
  };

  return (
    <View style={styles.aiPanel}>
      <View style={styles.aiPanelHeader}>
        <Text style={styles.aiPanelTitle}>AI Pre-Screen</Text>
        <Button
          title="Re-run"
          variant="secondary"
          icon={<RefreshCw size={13} color={Colors.light.primary} strokeWidth={2.5} />}
          onPress={handleRerun}
          disabled={rerunLoading}
          loading={rerunLoading}
          style={{ height: 32, borderRadius: 16, paddingHorizontal: 10 }}
          textStyle={{ fontSize: 12, color: Colors.light.primary }}
        />
      </View>

      {allNull ? (
        <View style={styles.aiPendingBadge}>
          <Text style={styles.aiPendingText}>AI check pending</Text>
        </View>
      ) : (
        <View style={styles.aiBadgesRow}>
          <AiCheckBadge label="Photo quality" value={provider.aiPhotoQuality} />
          <AiCheckBadge label="ID readable" value={provider.aiIdReadable} />
          <AiCheckBadge label="Face match" value={provider.aiFaceMatch} />
        </View>
      )}

      {provider.aiDuplicateFlag === true && (
        <View style={styles.aiDuplicateWarning}>
          <AlertTriangle size={14} color="#92400E" strokeWidth={2} />
          <Text style={styles.aiDuplicateText}>
            Possible duplicate — another provider with this name exists
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Provider card ─────────────────────────────────────────────────────────────

function ProviderCard({
  provider,
  onApprove,
  onReject,
  onDocumentPress,
  onRerunAi,
}: {
  provider: Provider;
  onApprove: () => void;
  onReject: () => void;
  onDocumentPress: (doc: { name: string; url: string }) => void;
  onRerunAi: () => Promise<void>;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View style={styles.providerCard}>
      <View style={styles.providerHeader}>
        <View style={styles.providerInfo}>
          <View style={styles.providerAvatar}>
            <Text style={styles.providerInitials}>
              {provider.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{provider.category}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.submittedText}>
          Submitted {formatDate(provider.submittedAt)}
        </Text>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Mail size={16} color={Colors.light.textSecondary} />
          <Text style={styles.contactText}>{provider.email}</Text>
        </View>
        <View style={styles.contactItem}>
          <Phone size={16} color={Colors.light.textSecondary} />
          <Text style={styles.contactText}>{provider.phone}</Text>
        </View>
        <View style={styles.contactItem}>
          <MapPin size={16} color={Colors.light.textSecondary} />
          <Text style={styles.contactText}>{provider.location}</Text>
        </View>
      </View>

      {/* AI pre-screen verdict */}
      <AiPreScreenPanel provider={provider} onRerunAi={onRerunAi} />

      <View style={styles.documentsSection}>
        <Text style={styles.documentsTitle}>Submitted Documents</Text>
        {provider.documents.length === 0 ? (
          <Text style={styles.noDocumentsText}>No documents uploaded</Text>
        ) : (
          <View style={styles.documentsList}>
            {provider.documents.map((doc, index) => (
              <TouchableOpacity
                key={index}
                style={styles.documentChip}
                onPress={() => onDocumentPress(doc)}
                activeOpacity={0.7}
              >
                <FileText size={14} color={Colors.light.primary} />
                <Text style={styles.documentText}>{doc.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        <Button
          title="Reject"
          variant="primary"
          icon={<XCircle size={18} color="#FFFFFF" />}
          onPress={onReject}
          style={{ flex: 1, backgroundColor: Colors.light.error }}
        />
        <Button
          title="Approve"
          variant="primary"
          icon={<CheckCircle size={18} color="#FFFFFF" />}
          onPress={onApprove}
          style={{ flex: 1, backgroundColor: Colors.light.success }}
        />
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
    flexDirection: "column",
    gap: 16,
    marginBottom: 24,
  },
  headerText: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  statsChip: {
    backgroundColor: `${Colors.light.warning}20`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statsChipText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.warning,
  },
  providersList: {
    gap: 20,
  },
  providerCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  providerHeader: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 16,
  },
  providerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  providerInitials: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  providerDetails: {
    gap: 6,
    flex: 1,
  },
  providerName: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  categoryBadge: {
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  submittedText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  contactInfo: {
    gap: 10,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contactText: {
    fontSize: 13,
    color: Colors.light.text,
    flex: 1,
  },
  // AI panel
  aiPanel: {
    backgroundColor: "#F8FAFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  aiPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  aiPanelTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.light.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  aiRerunButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: `${Colors.light.primary}12`,
  },
  aiRerunText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  aiBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  aiBadgeIcon: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  aiBadgeLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  aiPendingBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  aiPendingText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: "500" as const,
  },
  aiDuplicateWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  aiDuplicateText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "500" as const,
    flex: 1,
  },

  documentsSection: {
    marginBottom: 16,
  },
  documentsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  documentsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  documentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${Colors.light.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  documentText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  rejectButtonAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.error,
    paddingVertical: 14,
    borderRadius: 8,
  },
  approveButtonAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.success,
    paddingVertical: 14,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    maxWidth: 400,
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
  modalDetailSubtext: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 8,
    fontStyle: "italic" as const,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonSecondary: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  approveButton: {
    backgroundColor: Colors.light.success,
  },
  rejectButton: {
    backgroundColor: Colors.light.error,
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
  documentModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  documentModalContent: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    width: "90%",
    maxWidth: 700,
    maxHeight: "90%",
    overflow: "hidden",
  },
  documentModalContentMobile: {
    width: "95%",
    maxHeight: "95%",
  },
  documentModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  documentModalHeaderText: {
    flex: 1,
    gap: 4,
  },
  documentModalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  documentModalSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  documentModalCloseButton: {
    padding: 8,
    marginLeft: 12,
  },
  documentModalBody: {
    flex: 1,
  },
  documentModalBodyContent: {
    padding: 20,
  },
  documentImage: {
    width: "100%",
    height: 420,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
  },
  noDocumentsText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
  },
  documentPreview: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    minHeight: 200,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: "dashed" as const,
  },
  documentPreviewText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  documentPreviewSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    maxWidth: 400,
    lineHeight: 20,
  },
  documentInfo: {
    gap: 16,
  },
  documentInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  documentInfoLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  documentInfoValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  documentStatusBadge: {
    backgroundColor: `${Colors.light.success}15`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  documentStatusText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.success,
  },
  documentModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 8,
  },
  downloadButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
