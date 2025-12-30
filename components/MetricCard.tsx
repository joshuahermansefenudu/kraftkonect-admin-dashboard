import { StyleSheet, Text, View } from "react-native";
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";
import Colors from "@/constants/colors";

interface MetricCardProps {
  label: string;
  value: string;
  change: number;
  icon: string;
  isMobile?: boolean;
}

export default function MetricCard({
  label,
  value,
  change,
  icon,
  isMobile = false,
}: MetricCardProps) {
  const isPositive = change >= 0;

  const getIcon = () => {
    const iconProps = { size: isMobile ? 20 : 24, color: Colors.light.primary };
    switch (icon) {
      case "users":
        return <Users {...iconProps} />;
      case "briefcase":
        return <Briefcase {...iconProps} />;
      case "calendar":
        return <Calendar {...iconProps} />;
      case "dollar-sign":
        return <DollarSign {...iconProps} />;
      default:
        return <Users {...iconProps} />;
    }
  };

  return (
    <View style={[styles.card, isMobile && styles.cardMobile]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <View style={styles.changeContainer}>
          {isPositive ? (
            <TrendingUp size={isMobile ? 14 : 16} color={Colors.light.success} />
          ) : (
            <TrendingDown size={isMobile ? 14 : 16} color={Colors.light.error} />
          )}
          <Text
            style={[
              styles.changeText,
              { color: isPositive ? Colors.light.success : Colors.light.error },
            ]}
          >
            {isPositive ? "+" : ""}
            {change}%
          </Text>
        </View>
      </View>
      <Text style={[styles.value, isMobile && styles.valueMobile]}>{value}</Text>
      <Text style={[styles.label, isMobile && styles.labelMobile]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minWidth: 200,
    flex: 1,
  },
  cardMobile: {
    padding: 16,
    minWidth: "48%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  value: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  valueMobile: {
    fontSize: 22,
  },
  label: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  labelMobile: {
    fontSize: 12,
  },
});
