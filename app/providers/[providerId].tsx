import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Alert, useWindowDimensions, Image, Modal, Linking } from "react-native";
import { PressableOpacity as TouchableOpacity } from "@/components/PressableOpacity";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import StatusChip from "@/components/StatusChip";
import ConfirmModal from "@/components/ConfirmModal";
import ReasonModal from "@/components/ReasonModal";
import Colors from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Ban,
  Play,
  Download,
  Edit,
  Save,
  X as CloseIcon,
} from "lucide-react-native";
import { useState, useEffect, useCallback } from "react";
import { Provider, ProviderStatus, ProviderUpdateInput } from "@/types/admin";
import {
  adminProvidersQuery,
  adminApproveProvider,
  adminRejectProvider,
  adminUpdateProviderStatus,
  updateProvider,
} from "@/services/adminApi";
import { useLocalSearchParams, useRouter } from "expo-router";

type TabType = "overview" | "verification" | "profile";
type ActionType = "approve" | "reject" | "suspend" | "unsuspend" | null;

export default function ProviderDetailScreen() {
  const router = useRouter();
  const { providerId } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editForm, setEditForm] = useState<ProviderUpdateInput>({});
  const [viewingDocument, setViewingDocument] = useState<{ name: string; url: string; provider: string } | null>(null);

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

  const [confirmModal, setConfirmModal] = useState<{
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

  const loadProvider = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("[ProviderDetail] Loading provider:", providerId);

      const response = await adminProvidersQuery({
        page: 1,
        pageSize: 100,
      });

      const foundProvider = response.providers.find((p) => p.id === providerId);

      if (foundProvider) {
        setProvider(foundProvider);
        setEditForm({
          name: foundProvider.name,
          email: foundProvider.email,
          phone: foundProvider.phone,
          category: foundProvider.category,
          location: foundProvider.location,
          businessName: foundProvider.businessName,
          serviceArea: foundProvider.serviceArea,
          description: foundProvider.description,
        });
      } else {
        Alert.alert("Error", "Provider not found");
        router.back();
      }
    } catch (error) {
      console.error("[ProviderDetail] Failed to load provider:", error);
      Alert.alert("Error", "Failed to load provider details");
    } finally {
      setIsLoading(false);
    }
  }, [providerId, router]);

  useEffect(() => {
    loadProvider();
  }, [loadProvider]);

  const handleApprove = () => {
    setConfirmModal({
      visible: true,
      actionType: "approve",
      title: "Approve Provider",
      message: `Are you sure you want to approve ${provider?.name}?`,
    });
  };

  const handleReject = () => {
    setReasonModal({
      visible: true,
      actionType: "reject",
      title: "Reject Provider",
      message: `Provide a reason for rejecting ${provider?.name}:`,
    });
  };

  const handleSuspend = () => {
    setReasonModal({
      visible: true,
      actionType: "suspend",
      title: "Suspend Provider",
      message: `Provide a reason for suspending ${provider?.name}:`,
    });
  };

  const handleUnsuspend = () => {
    setConfirmModal({
      visible: true,
      actionType: "unsuspend",
      title: "Unsuspend Provider",
      message: `Are you sure you want to unsuspend ${provider?.name}?`,
    });
  };

  const executeConfirmAction = async () => {
    if (!provider || !confirmModal.actionType) return;

    try {
      switch (confirmModal.actionType) {
        case "approve":
          await adminApproveProvider(provider.id);
          Alert.alert("Success", "Provider approved successfully");
          break;
        case "unsuspend":
          await adminUpdateProviderStatus(provider.id, "approved");
          Alert.alert("Success", "Provider unsuspended successfully");
          break;
      }

      loadProvider();
    } catch (error) {
      console.error("[ProviderDetail] Action failed:", error);
      Alert.alert("Error", "Failed to perform action");
    } finally {
      setConfirmModal({ visible: false, actionType: null, title: "", message: "" });
    }
  };

  const executeReasonAction = async (reason: string) => {
    if (!provider || !reasonModal.actionType) return;

    try {
      switch (reasonModal.actionType) {
        case "reject":
          await adminRejectProvider(provider.id, reason);
          Alert.alert("Success", "Provider rejected successfully");
          break;
        case "suspend":
          await adminUpdateProviderStatus(provider.id, "suspended", reason);
          Alert.alert("Success", "Provider suspended successfully");
          break;
      }

      loadProvider();
    } catch (error) {
      console.error("[ProviderDetail] Action failed:", error);
      Alert.alert("Error", "Failed to perform action");
    } finally {
      setReasonModal({ visible: false, actionType: null, title: "", message: "" });
    }
  };

  const handleSaveProfile = async () => {
    if (!provider) return;

    setIsSaving(true);
    try {
      await updateProvider(provider.id, editForm);
      Alert.alert("Success", "Provider profile updated successfully");
      setIsEditing(false);
      loadProvider();
    } catch (error) {
      console.error("[ProviderDetail] Save failed:", error);
      Alert.alert("Error", "Failed to update provider profile");
    } finally {
      setIsSaving(false);
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Sidebar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </View>
    );
  }

  if (!provider) {
    return null;
  }

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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color={Colors.light.primary} />
            <Text style={styles.backButtonText}>Back to Providers</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.providerInfo}>
              <View style={styles.providerAvatar}>
                {provider.selfieUrl ? (
                  <Image 
                    source={{ uri: provider.selfieUrl }} 
                    style={styles.providerAvatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.providerInitials}>
                    {(provider.name || "Provider")
                      .split(" ")
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join("")}
                  </Text>
                )}
              </View>
              <View>
                <Text style={[styles.providerName, isMobile && styles.providerNameMobile]}>
                  {provider.name || "Unnamed Provider"}
                </Text>
                <Text style={styles.providerId}>ID: {provider.id}</Text>
              </View>
            </View>
            <StatusChip label={provider.status} variant={getStatusChipVariant(provider.status)} />
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "overview" && styles.tabActive]}
              onPress={() => setActiveTab("overview")}
            >
              <Text style={[styles.tabText, activeTab === "overview" && styles.tabTextActive]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "verification" && styles.tabActive]}
              onPress={() => setActiveTab("verification")}
            >
              <Text
                style={[styles.tabText, activeTab === "verification" && styles.tabTextActive]}
              >
                Verification
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "profile" && styles.tabActive]}
              onPress={() => setActiveTab("profile")}
            >
              <Text style={[styles.tabText, activeTab === "profile" && styles.tabTextActive]}>
                Profile
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "overview" && (
            <OverviewTab
              provider={provider}
              onApprove={handleApprove}
              onReject={handleReject}
              onSuspend={handleSuspend}
              onUnsuspend={handleUnsuspend}
            />
          )}

          {activeTab === "verification" && (
            <VerificationTab 
              provider={provider} 
              onDocumentPress={(doc) => setViewingDocument({ name: doc.name, url: doc.url, provider: provider.name })}
            />
          )}

          {activeTab === "profile" && (
            <ProfileTab
              provider={provider}
              editForm={editForm}
              setEditForm={setEditForm}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              isSaving={isSaving}
              onSave={handleSaveProfile}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="info"
        onConfirm={executeConfirmAction}
        onCancel={() =>
          setConfirmModal({ visible: false, actionType: null, title: "", message: "" })
        }
      />

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

      <DocumentViewerModal
        document={viewingDocument}
        onClose={() => setViewingDocument(null)}
      />
    </View>
  );
}

function OverviewTab({
  provider,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
}: {
  provider: Provider;
  onApprove: () => void;
  onReject: () => void;
  onSuspend: () => void;
  onUnsuspend: () => void;
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
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Provider Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Mail size={18} color={Colors.light.textSecondary} />
            <View style={styles.infoRowContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{provider.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone size={18} color={Colors.light.textSecondary} />
            <View style={styles.infoRowContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{provider.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={18} color={Colors.light.textSecondary} />
            <View style={styles.infoRowContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{provider.location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={18} color={Colors.light.textSecondary} />
            <View style={styles.infoRowContent}>
              <Text style={styles.infoLabel}>Submitted At</Text>
              <Text style={styles.infoValue}>{formatDate(provider.submittedAt)}</Text>
            </View>
          </View>

          {provider.approvedAt && (
            <View style={styles.infoRow}>
              <CheckCircle size={18} color={Colors.light.success} />
              <View style={styles.infoRowContent}>
                <Text style={styles.infoLabel}>Approved At</Text>
                <Text style={styles.infoValue}>{formatDate(provider.approvedAt)}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {(provider.bookingsCount !== undefined || provider.rating !== undefined) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            {provider.bookingsCount !== undefined && (
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{provider.bookingsCount}</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
              </View>
            )}
            {provider.rating !== undefined && (
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{provider.rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          {provider.status === "pending" && (
            <>
              <Button
                title="Approve Provider"
                icon={<CheckCircle size={18} color="#FFFFFF" />}
                onPress={onApprove}
                style={{ backgroundColor: Colors.light.success }}
              />
              <Button
                title="Reject Provider"
                icon={<XCircle size={18} color="#FFFFFF" />}
                onPress={onReject}
                style={{ backgroundColor: Colors.light.error }}
              />
            </>
          )}

          {provider.status === "approved" && (
            <Button
              title="Suspend Provider"
              icon={<Ban size={18} color="#FFFFFF" />}
              onPress={onSuspend}
              style={{ backgroundColor: Colors.light.error }}
            />
          )}

          {provider.status === "suspended" && (
            <Button
              title="Unsuspend Provider"
              icon={<Play size={18} color="#FFFFFF" />}
              onPress={onUnsuspend}
              style={{ backgroundColor: Colors.light.success }}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function VerificationTab({ 
  provider, 
  onDocumentPress 
}: { 
  provider: Provider; 
  onDocumentPress: (doc: { name: string; url: string }) => void;
}) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submitted Documents</Text>
        {provider.documents && provider.documents.length > 0 ? (
          <View style={styles.documentsGrid}>
            {provider.documents.map((doc, index) => (
              <TouchableOpacity
                key={index}
                style={styles.documentCard}
                onPress={() => onDocumentPress(doc)}
              >
                <FileText size={32} color={Colors.light.primary} />
                <Text style={styles.documentName}>{doc.name}</Text>
                <View style={styles.downloadIconButton}>
                  <Download size={16} color={Colors.light.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noDataText}>No documents submitted</Text>
        )}
      </View>

      {provider.verificationDetails && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Details</Text>
          <View style={styles.verificationGrid}>
            {provider.verificationDetails.idType && (
              <View style={styles.verificationRow}>
                <Text style={styles.verificationLabel}>ID Type</Text>
                <Text style={styles.verificationValue}>
                  {provider.verificationDetails.idType}
                </Text>
              </View>
            )}
            {provider.verificationDetails.idNumber && (
              <View style={styles.verificationRow}>
                <Text style={styles.verificationLabel}>ID Number</Text>
                <Text style={styles.verificationValue}>
                  {String(provider.verificationDetails.idNumber).replace(/\d(?=\d{4})/g, "*")}
                </Text>
              </View>
            )}
            {provider.verificationDetails.businessAddress && (
              <View style={styles.verificationRow}>
                <Text style={styles.verificationLabel}>Business Address</Text>
                <Text style={styles.verificationValue}>
                  {provider.verificationDetails.businessAddress}
                </Text>
              </View>
            )}
            {provider.verificationDetails.taxId && (
              <View style={styles.verificationRow}>
                <Text style={styles.verificationLabel}>Tax ID</Text>
                <Text style={styles.verificationValue}>
                  {provider.verificationDetails.taxId}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function ProfileTab({
  provider,
  editForm,
  setEditForm,
  isEditing,
  setIsEditing,
  isSaving,
  onSave,
}: {
  provider: Provider;
  editForm: ProviderUpdateInput;
  setEditForm: (form: ProviderUpdateInput) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isSaving: boolean;
  onSave: () => void;
}) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.profileHeader}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        {!isEditing ? (
          <Button
            title="Edit"
            variant="secondary"
            icon={<Edit size={16} color={Colors.light.primary} />}
            onPress={() => setIsEditing(true)}
            style={{ height: 40, borderRadius: 20 }}
          />
        ) : (
          <View style={styles.editActions}>
            <Button
              title="Cancel"
              variant="secondary"
              icon={<CloseIcon size={16} color={Colors.light.text} />}
              onPress={() => {
                setIsEditing(false);
                setEditForm({
                  name: provider.name,
                  email: provider.email,
                  phone: provider.phone,
                  category: provider.category,
                  location: provider.location,
                  businessName: provider.businessName,
                  serviceArea: provider.serviceArea,
                  description: provider.description,
                });
              }}
              style={{ height: 40, borderRadius: 20 }}
            />
            <Button
              title="Save"
              icon={<Save size={16} color="#FFFFFF" />}
              onPress={onSave}
              disabled={isSaving}
              loading={isSaving}
              style={{ height: 40, borderRadius: 20 }}
            />
          </View>
        )}
      </View>

      <View style={styles.form}>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Full Name</Text>
          {isEditing ? (
            <Input
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
              style={{ height: 44, borderRadius: 22 }}
            />
          ) : (
            <Text style={styles.formValue}>{provider.name}</Text>
          )}
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Email</Text>
          {isEditing ? (
            <Input
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
              keyboardType="email-address"
              style={{ height: 44, borderRadius: 22 }}
            />
          ) : (
            <Text style={styles.formValue}>{provider.email}</Text>
          )}
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Phone</Text>
          {isEditing ? (
            <Input
              value={editForm.phone}
              onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
              keyboardType="phone-pad"
              style={{ height: 44, borderRadius: 22 }}
            />
          ) : (
            <Text style={styles.formValue}>{provider.phone}</Text>
          )}
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Category</Text>
          {isEditing ? (
            <Input
              value={editForm.category}
              onChangeText={(text) => setEditForm({ ...editForm, category: text })}
              style={{ height: 44, borderRadius: 22 }}
            />
          ) : (
            <Text style={styles.formValue}>{provider.category}</Text>
          )}
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Location</Text>
          {isEditing ? (
            <Input
              value={editForm.location}
              onChangeText={(text) => setEditForm({ ...editForm, location: text })}
              style={{ height: 44, borderRadius: 22 }}
            />
          ) : (
            <Text style={styles.formValue}>{provider.location}</Text>
          )}
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Business Name</Text>
          {isEditing ? (
            <Input
              value={editForm.businessName}
              onChangeText={(text) => setEditForm({ ...editForm, businessName: text })}
              style={{ height: 44, borderRadius: 22 }}
            />
          ) : (
            <Text style={styles.formValue}>{provider.businessName || "N/A"}</Text>
          )}
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Service Area</Text>
          {isEditing ? (
            <Input
              value={editForm.serviceArea}
              onChangeText={(text) => setEditForm({ ...editForm, serviceArea: text })}
              style={{ height: 44, borderRadius: 22 }}
            />
          ) : (
            <Text style={styles.formValue}>{provider.serviceArea || "N/A"}</Text>
          )}
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Description</Text>
          {isEditing ? (
            <Input
              value={editForm.description}
              onChangeText={(text) => setEditForm({ ...editForm, description: text })}
              multiline
              numberOfLines={4}
              style={{ height: 100, borderRadius: 12 }}
              inputStyle={{ textAlignVertical: "top", paddingTop: 12, paddingBottom: 12 }}
            />
          ) : (
            <Text style={styles.formValue}>{provider.description || "N/A"}</Text>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 16,
  },
  providerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  providerAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  providerInitials: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  providerName: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  providerNameMobile: {
    fontSize: 22,
  },
  providerId: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  tabContent: {
    gap: 24,
  },
  section: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoRowContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.light.text,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  actionButtons: {
    gap: 12,
  },
  approveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.success,
    paddingVertical: 14,
    borderRadius: 8,
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.error,
    paddingVertical: 14,
    borderRadius: 8,
  },
  suspendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.error,
    paddingVertical: 14,
    borderRadius: 8,
  },
  unsuspendButton: {
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
  documentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  documentCard: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    minWidth: 120,
    gap: 8,
    position: "relative" as const,
  },
  documentName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center",
  },
  downloadIconButton: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    padding: 4,
  },
  noDataText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: "italic" as const,
  },
  verificationGrid: {
    gap: 12,
  },
  verificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  verificationLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  verificationValue: {
    fontSize: 14,
    color: Colors.light.text,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: `${Colors.light.primary}10`,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelEditButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelEditButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
    minWidth: 80,
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  form: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  formRow: {
    gap: 8,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  formValue: {
    fontSize: 15,
    color: Colors.light.text,
  },
  formInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  formTextarea: {
    minHeight: 100,
    textAlignVertical: "top",
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
  documentModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});

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
              <CloseIcon size={24} color={Colors.light.text} />
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
