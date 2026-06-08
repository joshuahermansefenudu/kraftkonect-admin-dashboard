import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Polyline, Circle, Line, Text as SvgText } from "react-native-svg";
import { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart2, Sparkles, MapPin, RefreshCw, TrendingUp } from "lucide-react-native";
import Sidebar from "@/components/Sidebar";
import Colors from "@/constants/colors";
import {
  adminAnalyticsQuery,
  adminDemandForecastQuery,
  SkillDistribution,
  MonthlyVolume,
  DemandForecastItem,
} from "@/services/adminApi";

// ── Skill colour palette ──────────────────────────────────────────────────────

const SKILL_COLORS = [
  Colors.light.chart1,
  Colors.light.chart2,
  Colors.light.chart3,
  Colors.light.chart4,
  "#F97316",
  "#06B6D4",
  "#84CC16",
  "#A855F7",
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <View style={sectionStyles.card}>
      <View style={sectionStyles.header}>
        <View style={sectionStyles.titleRow}>
          {icon}
          <Text style={sectionStyles.title}>{title}</Text>
        </View>
        {badge ? (
          <View style={sectionStyles.badge}>
            <Text style={sectionStyles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 16, fontWeight: "700" as const, color: Colors.light.text },
  badge: {
    backgroundColor: `${Colors.light.primary}12`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: "600" as const, color: Colors.light.primary },
});

// ── Horizontal bar chart ──────────────────────────────────────────────────────

function SkillBarChart({ data }: { data: SkillDistribution[] }) {
  if (!data.length) {
    return <Text style={styles.emptyText}>No skill data yet</Text>;
  }
  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, 8);
  const max = Math.max(1, sorted[0].value);

  return (
    <View style={{ gap: 10 }}>
      {sorted.map((item, i) => {
        const pct = (item.value / max) * 100;
        const color = SKILL_COLORS[i % SKILL_COLORS.length];
        return (
          <View key={item.name} style={barStyles.row}>
            <Text style={barStyles.label} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={barStyles.track}>
              <View style={[barStyles.fill, { width: `${Math.max(pct, 3)}%`, backgroundColor: color }]} />
            </View>
            <Text style={[barStyles.value, { color }]}>{item.value}</Text>
          </View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { width: 90, fontSize: 12, color: Colors.light.textSecondary, textAlign: "right" as const },
  track: {
    flex: 1,
    height: 14,
    backgroundColor: Colors.light.background,
    borderRadius: 7,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 7 },
  value: { width: 36, fontSize: 12, fontWeight: "700" as const, textAlign: "right" as const },
});

// ── SVG sparkline (monthly volume) ────────────────────────────────────────────

function MonthlySparkline({ data, width }: { data: MonthlyVolume[]; width: number }) {
  if (data.length < 2) {
    return <Text style={styles.emptyText}>Not enough data to plot</Text>;
  }

  const H = 120;
  const PAD_X = 32;
  const PAD_Y = 16;
  const W = width - PAD_X * 2;
  const maxBookings = Math.max(1, ...data.map((d) => d.bookings));

  const pts = data.map((d, i) => ({
    x: PAD_X + (W / Math.max(data.length - 1, 1)) * i,
    y: PAD_Y + (H - PAD_Y * 2) - ((d.bookings / maxBookings) * (H - PAD_Y * 2)),
    ...d,
  }));

  const polyPoints = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View>
      <Svg width={width} height={H}>
        {/* Grid lines */}
        {[0, 0.5, 1].map((t) => {
          const y = PAD_Y + (H - PAD_Y * 2) * (1 - t);
          return (
            <Line
              key={t}
              x1={PAD_X}
              y1={y}
              x2={width - PAD_X}
              y2={y}
              stroke={Colors.light.border}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Line */}
        <Polyline
          points={polyPoints}
          fill="none"
          stroke={Colors.light.primary}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {pts.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3.5}
            fill={Colors.light.surface}
            stroke={Colors.light.primary}
            strokeWidth={2}
          />
        ))}

        {/* Month labels — show every other on small widths */}
        {pts
          .filter((_, i) => data.length <= 6 || i % 2 === 0)
          .map((p) => (
            <SvgText
              key={p.month}
              x={p.x}
              y={H - 2}
              textAnchor="middle"
              fontSize={9}
              fill={Colors.light.textSecondary}
            >
              {p.month.slice(0, 3)}
            </SvgText>
          ))}
      </Svg>

      {/* Bookings legend below chart */}
      <View style={sparkStyles.legendRow}>
        {pts.slice(-3).map((p) => (
          <View key={p.month} style={sparkStyles.legendItem}>
            <Text style={sparkStyles.legendMonth}>{p.month.slice(0, 3)}</Text>
            <Text style={sparkStyles.legendValue}>{p.bookings}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const sparkStyles = StyleSheet.create({
  legendRow: { flexDirection: "row", justifyContent: "flex-end", gap: 16, marginTop: 4 },
  legendItem: { alignItems: "center" },
  legendMonth: { fontSize: 10, color: Colors.light.textSecondary },
  legendValue: { fontSize: 13, fontWeight: "700" as const, color: Colors.light.text },
});

// ── Area demand list ──────────────────────────────────────────────────────────

function AreaDemandList({ forecasts }: { forecasts: DemandForecastItem[] }) {
  const areaMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const f of forecasts) {
      if (f.area) m[f.area] = (m[f.area] ?? 0) + 1;
    }
    return Object.entries(m)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [forecasts]);

  if (!areaMap.length) {
    return <Text style={styles.emptyText}>No area data — forecast cron has not run yet</Text>;
  }

  const maxCount = areaMap[0][1];

  return (
    <View style={{ gap: 10 }}>
      {areaMap.map(([area, count], i) => {
        const pct = (count / maxCount) * 100;
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        return (
          <View key={area} style={areaStyles.row}>
            <Text style={areaStyles.rank}>{medal}</Text>
            <Text style={areaStyles.area} numberOfLines={1}>{area}</Text>
            <View style={areaStyles.track}>
              <View
                style={[
                  areaStyles.fill,
                  { width: `${Math.max(pct, 3)}%`, backgroundColor: Colors.light.chart4 },
                ]}
              />
            </View>
            <Text style={areaStyles.count}>{count}</Text>
          </View>
        );
      })}
      <Text style={areaStyles.note}>Count = skill categories with demand forecast in that area</Text>
    </View>
  );
}

const areaStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  rank: { width: 26, fontSize: 13, textAlign: "center" as const },
  area: { width: 96, fontSize: 13, color: Colors.light.text, fontWeight: "500" as const },
  track: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 5 },
  count: {
    width: 28,
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.light.chart4,
    textAlign: "right" as const,
  },
  note: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 4 },
});

// ── Forecast list ─────────────────────────────────────────────────────────────

function ForecastList({ forecasts }: { forecasts: DemandForecastItem[] }) {
  if (!forecasts.length) {
    return (
      <View style={forecastStyles.empty}>
        <Sparkles size={28} color={Colors.light.border} strokeWidth={1.5} />
        <Text style={forecastStyles.emptyTitle}>Forecast cron has not run yet</Text>
        <Text style={forecastStyles.emptyBody}>
          The AI demand forecast runs every Monday morning. Check back then.
        </Text>
      </View>
    );
  }

  // Group by weekStart
  const groups: Record<string, DemandForecastItem[]> = {};
  for (const f of forecasts) {
    const key = f.weekStart;
    if (!groups[key]) groups[key] = [];
    groups[key].push(f);
  }

  const sortedWeeks = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <View style={{ gap: 20 }}>
      {sortedWeeks.map((week) => (
        <View key={week}>
          <View style={forecastStyles.weekHeader}>
            <Text style={forecastStyles.weekLabel}>
              Week of{" "}
              {new Date(week).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
            <Text style={forecastStyles.weekCount}>
              {groups[week].length} insight{groups[week].length !== 1 ? "s" : ""}
            </Text>
          </View>

          {groups[week].map((f, idx) => (
            <View
              key={f.id}
              style={[forecastStyles.row, idx < groups[week].length - 1 && forecastStyles.rowBorder]}
            >
              <View style={forecastStyles.chips}>
                {f.skill ? (
                  <View style={[forecastStyles.chip, { backgroundColor: `${Colors.light.chart2}15` }]}>
                    <Text style={[forecastStyles.chipText, { color: Colors.light.chart2 }]}>
                      {f.skill}
                    </Text>
                  </View>
                ) : null}
                {f.area ? (
                  <View style={forecastStyles.areaChip}>
                    <MapPin size={10} color={Colors.light.chart4} strokeWidth={2.5} />
                    <Text style={[forecastStyles.chipText, { color: Colors.light.chart4 }]}>
                      {f.area}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={forecastStyles.text}>{f.forecastText}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const forecastStyles = StyleSheet.create({
  empty: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyTitle: { fontSize: 14, fontWeight: "600" as const, color: Colors.light.textSecondary },
  emptyBody: { fontSize: 13, color: Colors.light.textSecondary, textAlign: "center" as const, lineHeight: 18 },
  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  weekLabel: { fontSize: 13, fontWeight: "700" as const, color: Colors.light.text },
  weekCount: { fontSize: 12, color: Colors.light.textSecondary },
  row: { paddingVertical: 10, gap: 6 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  areaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${Colors.light.chart4}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  chipText: { fontSize: 11, fontWeight: "600" as const },
  text: { fontSize: 14, color: Colors.light.text, lineHeight: 20 },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();

  const [skillData, setSkillData] = useState<SkillDistribution[]>([]);
  const [volumeData, setVolumeData] = useState<MonthlyVolume[]>([]);
  const [forecasts, setForecasts] = useState<DemandForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      const [analytics, forecastRows] = await Promise.all([
        adminAnalyticsQuery(),
        adminDemandForecastQuery(),
      ]);
      setSkillData(analytics.skillDistribution);
      setVolumeData(analytics.monthlyVolume);
      setForecasts(forecastRows);
    } catch (e: any) {
      setError(e.message ?? "Failed to load analytics");
    }
  }, []);

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, [loadAll]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  const contentWidth = isMobile ? width - 48 : width - 260 - 48;

  const latestWeek = forecasts[0]?.weekStart
    ? new Date(forecasts[0].weekStart).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <View style={styles.container}>
      <Sidebar />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          isMobile && { paddingTop: 60 + insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.primary}
          />
        }
      >
        <SafeAreaView edges={isMobile ? [] : ["top", "right"]}>
          {/* Page header */}
          <View style={[styles.header, isMobile && styles.headerMobile]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.pageTitle, isMobile && styles.pageTitleMobile]}>
                Analytics
              </Text>
              <Text style={styles.pageSubtitle}>
                Real-time platform insights and AI demand forecast
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              activeOpacity={0.7}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                color={refreshing ? Colors.light.textSecondary : Colors.light.primary}
                strokeWidth={2}
              />
              <Text style={[styles.refreshText, refreshing && { color: Colors.light.textSecondary }]}>
                {refreshing ? "Refreshing…" : "Refresh"}
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.loadingText}>Loading analytics…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* ── Jobs by skill ─────────────────────────────────────────── */}
              <SectionCard
                title="Jobs by Skill Category"
                icon={<BarChart2 size={16} color={Colors.light.primary} strokeWidth={2} />}
                badge={skillData.length ? `${skillData.length} categories` : undefined}
              >
                <SkillBarChart data={skillData} />
              </SectionCard>

              {/* ── Monthly job volume ────────────────────────────────────── */}
              <SectionCard
                title="Monthly Job Volume"
                icon={<TrendingUp size={16} color={Colors.light.chart2} strokeWidth={2} />}
                badge={volumeData.length ? `${volumeData.length} months` : undefined}
              >
                {volumeData.length >= 2 ? (
                  <MonthlySparkline data={volumeData} width={contentWidth} />
                ) : (
                  <Text style={styles.emptyText}>Not enough data to plot</Text>
                )}
              </SectionCard>

              {/* ── Area demand ───────────────────────────────────────────── */}
              <SectionCard
                title="Area Demand Ranking"
                icon={<MapPin size={16} color={Colors.light.chart4} strokeWidth={2} />}
                badge="Current week"
              >
                <AreaDemandList forecasts={forecasts} />
              </SectionCard>

              {/* ── AI demand forecast ────────────────────────────────────── */}
              <SectionCard
                title="Weekly AI Demand Forecast"
                icon={<Sparkles size={16} color={Colors.light.chart3} strokeWidth={2} />}
                badge={latestWeek ? `Latest: ${latestWeek}` : undefined}
              >
                <ForecastList forecasts={forecasts} />
              </SectionCard>
            </>
          )}
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: Colors.light.background },
  content: { flex: 1 },
  contentContainer: { padding: 24 },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerMobile: { flexDirection: "column", gap: 12 },
  headerLeft: { gap: 4 },
  pageTitle: { fontSize: 26, fontWeight: "700" as const, color: Colors.light.text },
  pageTitleMobile: { fontSize: 22 },
  pageSubtitle: { fontSize: 14, color: Colors.light.textSecondary },

  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  refreshText: { fontSize: 13, fontWeight: "600" as const, color: Colors.light.primary },

  loadingContainer: { alignItems: "center", paddingVertical: 80, gap: 12 },
  loadingText: { fontSize: 15, color: Colors.light.textSecondary },
  errorContainer: { alignItems: "center", paddingVertical: 60, gap: 12 },
  errorText: { fontSize: 15, color: Colors.light.error, textAlign: "center" as const },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
  },
  retryButtonText: { color: "#fff", fontWeight: "600" as const, fontSize: 14 },

  emptyText: { fontSize: 14, color: Colors.light.textSecondary, textAlign: "center" as const, paddingVertical: 16 },
});
