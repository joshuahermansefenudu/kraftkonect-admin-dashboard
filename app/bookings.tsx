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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import Colors from "@/constants/colors";
import { Search, Eye, X, DollarSign } from "lucide-react-native";
import { useState, useEffect } from "react";
import {
  adminBookingsQuery,
  adminCancelBooking,
  AdminBooking as Booking,
} from "@/services/adminApi";

export default function BookingManagementScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadBookings = () => {
    setLoading(true);
    setError(null);
    adminBookingsQuery({})
      .then((res) => setAllBookings(res.bookings))
      .catch((e) => setError(e.message ?? "Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = allBookings.filter(
    (b) =>
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Text style={[styles.title, isMobile && styles.titleMobile]}>Booking Management</Text>
              <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
                View and manage all service bookings
              </Text>
            </View>
          </View>

          {error && (
            <View style={{ padding: 16, backgroundColor: `${Colors.light.error}10`, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: Colors.light.error }}>{error}</Text>
              <TouchableOpacity onPress={loadBookings} style={{ marginTop: 8 }}>
                <Text style={{ color: Colors.light.primary, fontWeight: "600" }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.searchBar}>
            <Search size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search bookings..."
              placeholderTextColor={Colors.light.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={{ marginTop: 12, color: Colors.light.textSecondary }}>Loading bookings…</Text>
            </View>
          ) : isMobile ? (
            <View style={styles.cardsList}>
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={(b) => {
                    setSelectedBooking(b);
                    setShowDetailsModal(true);
                  }}
                />
              ))}

              {filteredBookings.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No bookings found</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>
                  Booking ID
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>
                  Customer
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>
                  Provider
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>
                  Service
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Amount</Text>
                <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Actions</Text>
              </View>

              {filteredBookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onViewDetails={(b) => {
                    setSelectedBooking(b);
                    setShowDetailsModal(true);
                  }}
                />
              ))}

              {filteredBookings.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No bookings found</Text>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </ScrollView>

      <Modal
        visible={showDetailsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isMobile && styles.modalContentMobile]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Booking ID</Text>
                  <Text style={styles.detailValue}>{selectedBooking.id}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Service</Text>
                  <Text style={styles.detailValue}>{selectedBooking.service}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Customer</Text>
                  <Text style={styles.detailValue}>{selectedBooking.userName}</Text>
                  <Text style={styles.detailSubvalue}>{selectedBooking.userId}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Provider</Text>
                  <Text style={styles.detailValue}>{selectedBooking.providerName}</Text>
                  <Text style={styles.detailSubvalue}>{selectedBooking.providerId}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailValue}>${selectedBooking.amount.toFixed(2)}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[styles.detailValue, { textTransform: "capitalize" as const }]}>
                    {selectedBooking.status}
                  </Text>
                </View>

                {selectedBooking.status !== "cancelled" &&
                  selectedBooking.status !== "completed" &&
                  selectedBooking.status !== "refunded" && (
                    <View style={styles.actionSection}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                          setShowDetailsModal(false);
                          setTimeout(() => {
                            setRefundAmount(selectedBooking.amount.toString());
                            setShowCancelModal(true);
                          }, 300);
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel & Refund</Text>
                      </TouchableOpacity>
                    </View>
                  )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isMobile && styles.modalContentMobile]}>
            <Text style={styles.modalTitle}>Cancel Booking & Issue Refund</Text>
            <Text style={styles.modalText}>
              Are you sure you want to cancel this booking and issue a refund?
            </Text>

            {selectedBooking && (
              <View style={styles.refundSection}>
                <Text style={styles.refundLabel}>Booking: {selectedBooking.id}</Text>
                <View style={styles.refundInputContainer}>
                  <DollarSign size={20} color={Colors.light.textSecondary} />
                  <TextInput
                    style={styles.refundInput}
                    placeholder="Refund amount"
                    placeholderTextColor={Colors.light.textSecondary}
                    value={refundAmount}
                    onChangeText={setRefundAmount}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text
                  style={[
                    styles.modalButtonSecondaryText,
                    isMobile && styles.modalButtonTextMobile,
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelConfirmButton, cancelLoading && { opacity: 0.6 }]}
                disabled={cancelLoading}
                onPress={async () => {
                  if (!selectedBooking) return;
                  setCancelLoading(true);
                  try {
                    await adminCancelBooking(selectedBooking._rawId, `Refund: ${refundAmount}`);
                    setAllBookings((prev) =>
                      prev.map((b) =>
                        b._rawId === selectedBooking._rawId ? { ...b, status: "cancelled" as const } : b
                      )
                    );
                    Alert.alert("Booking Cancelled", `Booking ${selectedBooking.id} has been cancelled.`);
                  } catch (e: any) {
                    Alert.alert("Error", e.message ?? "Failed to cancel booking");
                  } finally {
                    setCancelLoading(false);
                    setShowCancelModal(false);
                    setRefundAmount("");
                  }
                }}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    isMobile && styles.modalButtonTextMobile,
                  ]}
                >
                  Confirm Cancellation
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function BookingCard({
  booking,
  onViewDetails,
}: {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
}) {
  const getStatusStyle = () => {
    switch (booking.status) {
      case "completed":
        return {
          backgroundColor: `${Colors.light.success}15`,
          color: Colors.light.success,
        };
      case "in_progress":
        return {
          backgroundColor: `${Colors.light.primary}15`,
          color: Colors.light.primary,
        };
      case "cancelled":
        return {
          backgroundColor: `${Colors.light.error}15`,
          color: Colors.light.error,
        };
      default:
        return {
          backgroundColor: `${Colors.light.warning}15`,
          color: Colors.light.warning,
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => onViewDetails(booking)}
      activeOpacity={0.7}
    >
      <View style={styles.bookingCardHeader}>
        <View>
          <Text style={styles.bookingCardId}>{booking.id}</Text>
          <Text style={styles.bookingCardDate}>{formatDate(booking.date)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusStyle().backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusStyle().color }]}>
            {booking.status}
          </Text>
        </View>
      </View>

      <View style={styles.bookingCardRow}>
        <Text style={styles.bookingCardLabel}>Service:</Text>
        <Text style={styles.bookingCardValue}>{booking.service}</Text>
      </View>

      <View style={styles.bookingCardRow}>
        <Text style={styles.bookingCardLabel}>Customer:</Text>
        <Text style={styles.bookingCardValue}>{booking.userName}</Text>
      </View>

      <View style={styles.bookingCardRow}>
        <Text style={styles.bookingCardLabel}>Provider:</Text>
        <Text style={styles.bookingCardValue}>{booking.providerName}</Text>
      </View>

      <View style={styles.bookingCardFooter}>
        <Text style={styles.bookingCardAmount}>${booking.amount.toFixed(2)}</Text>
        <View style={styles.viewButtonMobile}>
          <Eye size={16} color={Colors.light.primary} />
          <Text style={styles.viewButtonTextMobile}>View Details</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function BookingRow({
  booking,
  onViewDetails,
}: {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
}) {
  const getStatusStyle = () => {
    switch (booking.status) {
      case "completed":
        return {
          backgroundColor: `${Colors.light.success}15`,
          color: Colors.light.success,
        };
      case "in_progress":
        return {
          backgroundColor: `${Colors.light.primary}15`,
          color: Colors.light.primary,
        };
      case "cancelled":
        return {
          backgroundColor: `${Colors.light.error}15`,
          color: Colors.light.error,
        };
      default:
        return {
          backgroundColor: `${Colors.light.warning}15`,
          color: Colors.light.warning,
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.tableRow}>
      <View style={[styles.tableCell, { flex: 1 }]}>
        <Text style={styles.bookingId}>{booking.id}</Text>
        <Text style={styles.cellSubtext}>{formatDate(booking.date)}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.cellText}>{booking.userName}</Text>
        <Text style={styles.cellSubtext}>{booking.userId}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.cellText}>{booking.providerName}</Text>
        <Text style={styles.cellSubtext}>{booking.providerId}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.cellText}>{booking.service}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusStyle().backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusStyle().color }]}>
            {booking.status}
          </Text>
        </View>
      </View>

      <View style={[styles.tableCell, { flex: 1 }]}>
        <Text style={styles.amountText}>${booking.amount.toFixed(2)}</Text>
      </View>

      <View style={[styles.tableCell, { flex: 0.8 }]}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => onViewDetails(booking)}
        >
          <Eye size={16} color={Colors.light.primary} />
          <Text style={styles.viewButtonText}>View</Text>
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
    outlineStyle: "none",
  },
  cardsList: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  bookingCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookingCardId: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 2,
  },
  bookingCardDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  bookingCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bookingCardLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  bookingCardValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
    flex: 2,
    textAlign: "right",
  },
  bookingCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  bookingCardAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  viewButtonMobile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonTextMobile: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
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
  },
  tableCell: {
    justifyContent: "center",
    paddingRight: 12,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    marginBottom: 4,
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
  amountText: {
    fontSize: 15,
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
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
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
    maxWidth: 500,
    maxHeight: "80%",
  },
  modalContentMobile: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalBody: {
    maxHeight: 400,
  },
  detailSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase" as const,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  detailSubvalue: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  actionSection: {
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: Colors.light.error,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  modalText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  refundSection: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  refundLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  refundInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  refundInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    paddingVertical: 12,
    outlineStyle: "none",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  modalButtonSecondary: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelConfirmButton: {
    backgroundColor: Colors.light.error,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    textAlign: "center" as const,
    flexShrink: 1,
    lineHeight: 18,
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center" as const,
    flexShrink: 1,
    lineHeight: 18,
  },
  modalButtonTextMobile: {
    fontSize: 14,
  },
});
