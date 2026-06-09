import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import Colors from "@/constants/colors";
import {
  adminGetSystemSettingsApi,
  adminUpdateSystemSettingApi,
} from "@/services/adminApi";

export default function SettingsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackEnabled, setFallbackEnabled] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const settings = await adminGetSystemSettingsApi();
      const fallbackSetting = settings.find(
        (s) => s.key === "ALLOW_NATIONAL_FALLBACK"
      );
      setFallbackEnabled(fallbackSetting?.value === "true");
    } catch (e: any) {
      setError(e.message ?? "Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleFallback = async (value: boolean) => {
    try {
      setSaving(true);
      setFallbackEnabled(value);
      await adminUpdateSystemSettingApi("ALLOW_NATIONAL_FALLBACK", value ? "true" : "false");
    } catch (e: any) {
      // Revert state if failed
      setFallbackEnabled(!value);
      Alert.alert("Error", e.message ?? "Failed to update system setting");
    } finally {
      setSaving(false);
    }
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
              <Text style={styles.title}>System Settings</Text>
              <Text style={styles.subtitle}>
                Configure global rules and parameters for the KraftKonect platform
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.loadingText}>Loading settings…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <View style={styles.retryButtonWrapper}>
                <Switch
                  value={false}
                  disabled
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.retryText} onPress={loadSettings}>
                  Tap here to retry
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Search & Location Settings</Text>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Allow National Fallback</Text>
                  <Text style={styles.settingDescription}>
                    When enabled, searches on the mobile app will fall back to showing approved
                    service providers from other states/regions when local search results are sparse or outside the radius.
                    If disabled, search results are strictly limited to local locations.
                  </Text>
                </View>
                <View style={styles.switchWrapper}>
                  {saving && (
                    <ActivityIndicator
                      size="small"
                      color={Colors.light.primary}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Switch
                    value={fallbackEnabled}
                    onValueChange={handleToggleFallback}
                    disabled={saving}
                    trackColor={{ false: "#E5E7EB", true: Colors.light.primary + "50" }}
                    thumbColor={fallbackEnabled ? Colors.light.primary : "#9CA3AF"}
                  />
                </View>
              </View>
            </View>
          )}
        </SafeAreaView>
      </ScrollView>
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
  loadingContainer: {
    padding: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  errorCard: {
    padding: 24,
    backgroundColor: `${Colors.light.error}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.light.error}30`,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 15,
    color: Colors.light.error,
    marginBottom: 16,
    fontWeight: "500",
  },
  retryButtonWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  retryText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.primary,
    textDecorationLine: "underline",
  },
  sectionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 24,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  switchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
});
