import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import Colors from "@/constants/colors";
import Svg, { Line, Circle } from "react-native-svg";
import { useMemo, useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { adminGetDashboard, DashboardData } from "@/services/adminApi";
import { Calendar, ChevronDown } from "lucide-react-native";

type DateRange = {
  start: Date;
  end: Date;
  label: string;
};

const dateRangeOptions: DateRange[] = [
  {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: "Last 7 days",
  },
  {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: "Last 30 days",
  },
  {
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: "Last 3 months",
  },
  {
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(),
    label: "Year to date",
  },
  {
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: "Last 12 months",
  },
];

export default function DashboardOverview() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const insets = useSafeAreaInsets();

  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(
    dateRangeOptions[1]
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetDashboard()
      .then(setDashboard)
      .catch((e) => setError(e.message ?? "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const chartWidth = isMobile ? width - 80 : isTablet ? width - 340 : 600;
  const chartHeight = isMobile ? 180 : 200;

  const revenueData = dashboard?.revenue ?? [];

  const maxRevenue = useMemo(
    () => Math.max(1, ...revenueData.map((d) => d.revenue)),
    [revenueData]
  );

  const points = useMemo(() => {
    if (!revenueData.length) return [];
    const paddingX = 40;
    const paddingY = 20;
    const w = chartWidth - paddingX * 2;
    const h = chartHeight - paddingY * 2;

    return revenueData.map((item, index) => {
      const x = paddingX + (w / Math.max(revenueData.length - 1, 1)) * index;
      const y = paddingY + h - (item.revenue / maxRevenue) * h;
      return { x, y, ...item };
    });
  }, [chartWidth, chartHeight, maxRevenue, revenueData]);

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
            <View style={styles.headerTextContainer}>
              <Text style={[styles.title, isMobile && styles.titleMobile]}>Dashboard Overview</Text>
              <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
                Welcome back! Here&apos;s what&apos;s happening
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.dateRangeButton, isMobile && styles.dateRangeButtonMobile]}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={isMobile ? 16 : 18} color={Colors.light.primary} />
              <Text style={[styles.dateRangeText, isMobile && styles.dateRangeTextMobile]}>{selectedDateRange.label}</Text>
              <ChevronDown size={isMobile ? 16 : 18} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>

          <Modal
            visible={showDatePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            >
              <View style={styles.datePickerModal}>
                <Text style={styles.modalTitle}>Select Date Range</Text>
                {dateRangeOptions.map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateOption,
                      selectedDateRange.label === range.label &&
                        styles.dateOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedDateRange(range);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dateOptionText,
                        selectedDateRange.label === range.label &&
                          styles.dateOptionTextSelected,
                      ]}
                    >
                      {range.label}
                    </Text>
                    <Text style={styles.dateOptionSubtext}>
                      {range.start.toLocaleDateString()} -{" "}
                      {range.end.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {loading && (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
          )}
          {error && !loading && (
            <View style={{ padding: 24, backgroundColor: `${Colors.light.error}10`, borderRadius: 8, marginBottom: 24 }}>
              <Text style={{ color: Colors.light.error, fontSize: 14 }}>{error}</Text>
            </View>
          )}

          <View style={[styles.metricsGrid, isMobile && styles.metricsGridMobile]}>
            {(dashboard?.metrics ?? []).map((metric, index) => (
              <MetricCard
                key={index}
                label={metric.label}
                value={metric.value}
                change={metric.change}
                icon={metric.icon}
                isMobile={isMobile}
              />
            ))}
          </View>

          <View style={[styles.chartsRow, isMobile && styles.chartsRowMobile]}>
            <View style={[styles.chartCard, isMobile && styles.chartCardMobile]}>
              <Text style={[styles.chartTitle, isMobile && styles.chartTitleMobile]}>Revenue Growth</Text>
              <Text style={[styles.chartSubtitle, isMobile && styles.chartSubtitleMobile]}>Last 6 months</Text>

              <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
                {points.map((point, index) => {
                  if (index === 0) return null;
                  const prevPoint = points[index - 1];
                  return (
                    <Line
                      key={`line-${index}`}
                      x1={prevPoint.x}
                      y1={prevPoint.y}
                      x2={point.x}
                      y2={point.y}
                      stroke={Colors.light.primary}
                      strokeWidth="3"
                    />
                  );
                })}

                {points.map((point, index) => (
                  <Circle
                    key={`point-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill={Colors.light.primary}
                  />
                ))}
              </Svg>

              <View style={styles.chartLabels}>
                {revenueData.map((item) => (
                  <Text key={item.month} style={styles.chartLabel}>
                    {item.month}
                  </Text>
                ))}
              </View>
            </View>

            <View style={[styles.categoryCard, isMobile && styles.categoryCardMobile]}>
              <Text style={[styles.chartTitle, isMobile && styles.chartTitleMobile]}>Top Categories</Text>
              <Text style={[styles.chartSubtitle, isMobile && styles.chartSubtitleMobile]}>By booking volume</Text>

              <View style={styles.categoryList}>
                {(dashboard?.categories ?? []).map((cat, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      <Text style={styles.categoryValue}>{cat.value}%</Text>
                    </View>
                    <View style={styles.categoryBarBg}>
                      <View
                        style={[
                          styles.categoryBar,
                          {
                            width: `${cat.value}%`,
                            backgroundColor: Colors.light.chart1,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.activityCard, isMobile && styles.activityCardMobile]}>
            <Text style={[styles.chartTitle, isMobile && styles.chartTitleMobile]}>Recent Activity</Text>
            <View style={styles.activityList}>
              <ActivityItem
                title="New provider approved"
                description="Sarah Johnson - Electrical Services"
                time="2 minutes ago"
              />
              <ActivityItem
                title="Booking completed"
                description="BKG-4723 • $450.00"
                time="15 minutes ago"
              />
              <ActivityItem
                title="Dispute resolved"
                description="DSP-102 • Payment issue"
                time="1 hour ago"
              />
              <ActivityItem
                title="Support ticket opened"
                description="TKT-892 • Account verification"
                time="2 hours ago"
              />
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

function ActivityItem({
  title,
  description,
  time,
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <View style={styles.activityItem}>
      <View style={styles.activityDot} />
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDescription}>{description}</Text>
      </View>
      <Text style={styles.activityTime}>{time}</Text>
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
    paddingTop: 32,
  },
  safeArea: {
    flex: 1,
  },
  safeAreaMobile: {
    paddingTop: 0,
  },
  header: {
    marginBottom: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
  },
  headerMobile: {
    marginBottom: 20,
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
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
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 32,
  },
  metricsGridMobile: {
    gap: 12,
    marginBottom: 20,
  },
  chartsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 32,
  },
  chartsRowMobile: {
    gap: 16,
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flex: 1,
    minWidth: 300,
  },
  chartCardMobile: {
    padding: 16,
    minWidth: "100%",
    width: "100%",
  },
  categoryCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minWidth: 300,
  },
  categoryCardMobile: {
    padding: 16,
    minWidth: "100%",
    width: "100%",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  chartTitleMobile: {
    fontSize: 16,
  },
  chartSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 20,
  },
  chartSubtitleMobile: {
    fontSize: 13,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 20,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  chartLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  categoryList: {
    gap: 16,
  },
  categoryItem: {
    gap: 8,
  },
  categoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryName: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  categoryValue: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: "600" as const,
  },
  categoryBarBg: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  categoryBar: {
    height: "100%",
    borderRadius: 4,
  },
  activityCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activityCardMobile: {
    padding: 16,
  },
  activityList: {
    gap: 20,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  activityDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  activityTime: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  dateRangeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateRangeButtonMobile: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  dateRangeTextMobile: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  datePickerModal: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  dateOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateOptionSelected: {
    backgroundColor: `${Colors.light.primary}10`,
    borderColor: Colors.light.primary,
  },
  dateOptionText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  dateOptionTextSelected: {
    color: Colors.light.primary,
  },
  dateOptionSubtext: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
});
