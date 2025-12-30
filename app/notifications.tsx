import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import Sidebar from "@/components/Sidebar";
import Colors from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Send, Users, MapPin, Star } from "lucide-react-native";
import { useState } from "react";

type SegmentType = "all" | "users" | "providers" | "location" | "rating";

interface Segment {
  type: SegmentType;
  label: string;
  value?: string;
}

export default function NotificationsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedSegments, setSelectedSegments] = useState<Segment[]>([
    { type: "all", label: "All Users" },
  ]);
  const [locationValue, setLocationValue] = useState("");

  const handleAddSegment = (type: SegmentType, label: string, value?: string) => {
    if (type === "all") {
      setSelectedSegments([{ type, label }]);
      return;
    }

    const newSegments = selectedSegments.filter((s) => s.type !== "all");

    const exists = newSegments.find((s) => s.type === type && s.value === value);
    if (!exists) {
      setSelectedSegments([...newSegments, { type, label, value }]);
    }
  };

  const handleRemoveSegment = (index: number) => {
    const newSegments = selectedSegments.filter((_, i) => i !== index);
    if (newSegments.length === 0) {
      setSelectedSegments([{ type: "all", label: "All Users" }]);
    } else {
      setSelectedSegments(newSegments);
    }
  };

  const handleSendNotification = () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in both title and message");
      return;
    }

    const segmentText = selectedSegments.map((s) => s.label).join(", ");
    console.log("Sending notification:", { title, message, segments: segmentText });

    Alert.alert(
      "Notification Sent",
      `Your notification has been sent to: ${segmentText}`,
      [
        {
          text: "OK",
          onPress: () => {
            setTitle("");
            setMessage("");
            setSelectedSegments([{ type: "all", label: "All Users" }]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Sidebar />
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          isMobile && { paddingTop: 60 + insets.top + 32 },
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notifications Manager</Text>
            <Text style={styles.subtitle}>
              Send targeted messages to users and providers
            </Text>
          </View>
        </View>

          <View style={styles.mainContent}>
            <View style={styles.composeSection}>
              <Text style={styles.sectionTitle}>Compose Notification</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Notification title"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Message</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Type your message here..."
                  placeholderTextColor={Colors.light.textSecondary}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={5}
                />
              </View>

              <View style={styles.selectedSegments}>
                <Text style={styles.label}>Target Audience</Text>
                <View style={styles.segmentsList}>
                  {selectedSegments.map((segment, index) => (
                    <View key={`${segment.type}-${index}`} style={styles.segmentChip}>
                      <Text style={styles.segmentChipText}>{segment.label}</Text>
                      {selectedSegments.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveSegment(index)}>
                          <Text style={styles.removeChip}>×</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendNotification}
              >
                <Send size={18} color="#FFFFFF" />
                <Text style={styles.sendButtonText}>Send Notification</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.segmentSection}>
              <Text style={styles.sectionTitle}>Segmentation Options</Text>

              <View style={styles.segmentCard}>
                <View style={styles.segmentCardHeader}>
                  <View style={styles.segmentIcon}>
                    <Users size={20} color={Colors.light.primary} />
                  </View>
                  <Text style={styles.segmentCardTitle}>User Type</Text>
                </View>
                <View style={styles.segmentOptions}>
                  <SegmentButton
                    label="All Users"
                    onPress={() => handleAddSegment("all", "All Users")}
                    isSelected={selectedSegments.some((s) => s.type === "all")}
                  />
                  <SegmentButton
                    label="Customers Only"
                    onPress={() => handleAddSegment("users", "Customers Only")}
                    isSelected={selectedSegments.some(
                      (s) => s.type === "users" && s.label === "Customers Only"
                    )}
                  />
                  <SegmentButton
                    label="Providers Only"
                    onPress={() => handleAddSegment("providers", "Providers Only")}
                    isSelected={selectedSegments.some(
                      (s) => s.type === "providers"
                    )}
                  />
                </View>
              </View>

              <View style={styles.segmentCard}>
                <View style={styles.segmentCardHeader}>
                  <View style={styles.segmentIcon}>
                    <MapPin size={20} color={Colors.light.primary} />
                  </View>
                  <Text style={styles.segmentCardTitle}>By Location</Text>
                </View>
                <View style={styles.locationInput}>
                  <TextInput
                    style={styles.segmentInput}
                    placeholder="Enter city or state"
                    placeholderTextColor={Colors.light.textSecondary}
                    value={locationValue}
                    onChangeText={setLocationValue}
                  />
                  <TouchableOpacity
                    style={styles.addSegmentButton}
                    onPress={() => {
                      if (locationValue.trim()) {
                        handleAddSegment(
                          "location",
                          `Location: ${locationValue}`,
                          locationValue
                        );
                        setLocationValue("");
                      }
                    }}
                  >
                    <Text style={styles.addSegmentButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.segmentCard}>
                <View style={styles.segmentCardHeader}>
                  <View style={styles.segmentIcon}>
                    <Star size={20} color={Colors.light.primary} />
                  </View>
                  <Text style={styles.segmentCardTitle}>By Rating</Text>
                </View>
                <View style={styles.segmentOptions}>
                  <SegmentButton
                    label="5 Stars"
                    onPress={() =>
                      handleAddSegment("rating", "Rating: 5 Stars", "5")
                    }
                    isSelected={selectedSegments.some(
                      (s) => s.type === "rating" && s.value === "5"
                    )}
                  />
                  <SegmentButton
                    label="4+ Stars"
                    onPress={() =>
                      handleAddSegment("rating", "Rating: 4+ Stars", "4+")
                    }
                    isSelected={selectedSegments.some(
                      (s) => s.type === "rating" && s.value === "4+"
                    )}
                  />
                  <SegmentButton
                    label="Below 4 Stars"
                    onPress={() =>
                      handleAddSegment("rating", "Rating: Below 4 Stars", "<4")
                    }
                    isSelected={selectedSegments.some(
                      (s) => s.type === "rating" && s.value === "<4"
                    )}
                  />
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Notification Tips</Text>
                <Text style={styles.infoText}>
                  • Keep messages clear and concise
                  {"\n"}• Include a clear call-to-action
                  {"\n"}• Use segmentation to target specific users
                  {"\n"}• Test notifications before sending to large groups
                </Text>
              </View>
            </View>
          </View>
      </ScrollView>
    </View>
  );
}

function SegmentButton({
  label,
  onPress,
  isSelected,
}: {
  label: string;
  onPress: () => void;
  isSelected: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.segmentButton, isSelected && styles.segmentButtonSelected]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.segmentButtonText,
          isSelected && styles.segmentButtonTextSelected,
        ]}
      >
        {label}
      </Text>
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
    padding: Platform.OS === "web" ? 32 : 16,
    paddingTop: 32,
    paddingBottom: Platform.OS === "web" ? 32 : 24,
  },
  header: {
    marginBottom: Platform.OS === "web" ? 32 : 24,
  },
  title: {
    fontSize: Platform.OS === "web" ? 32 : 26,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Platform.OS === "web" ? 16 : 14,
    color: Colors.light.textSecondary,
    lineHeight: Platform.OS === "web" ? 24 : 20,
  },
  mainContent: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: Platform.OS === "web" ? 24 : 16,
  },
  composeSection: {
    flex: Platform.OS === "web" ? 2 : 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Platform.OS === "web" ? 24 : 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  segmentSection: {
    flex: 1,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
    outlineStyle: "none",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  selectedSegments: {
    marginBottom: 24,
  },
  segmentsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  segmentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  segmentChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  removeChip: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    lineHeight: 20,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  segmentCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Platform.OS === "web" ? 20 : 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  segmentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  segmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentCardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  segmentOptions: {
    gap: 8,
  },
  segmentButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  segmentButtonSelected: {
    backgroundColor: `${Colors.light.primary}15`,
    borderColor: Colors.light.primary,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  segmentButtonTextSelected: {
    color: Colors.light.primary,
  },
  locationInput: {
    flexDirection: "row",
    gap: 8,
  },
  segmentInput: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.light.text,
    outlineStyle: "none",
  },
  addSegmentButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  addSegmentButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  infoCard: {
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 12,
    padding: Platform.OS === "web" ? 16 : 14,
    borderWidth: 1,
    borderColor: `${Colors.light.primary}30`,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 20,
  },
});
