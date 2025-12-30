import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

type ChipVariant = "success" | "warning" | "error" | "info" | "neutral";

interface StatusChipProps {
  label: string;
  variant: ChipVariant;
}

export default function StatusChip({ label, variant }: StatusChipProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          bg: `${Colors.light.success}15`,
          text: Colors.light.success,
        };
      case "warning":
        return {
          bg: `${Colors.light.warning}15`,
          text: Colors.light.warning,
        };
      case "error":
        return {
          bg: `${Colors.light.error}15`,
          text: Colors.light.error,
        };
      case "info":
        return {
          bg: `${Colors.light.primary}15`,
          text: Colors.light.primary,
        };
      case "neutral":
      default:
        return {
          bg: `${Colors.light.textSecondary}15`,
          text: Colors.light.textSecondary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.chip, { backgroundColor: variantStyles.bg }]}>
      <Text style={[styles.label, { color: variantStyles.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 13,
    fontWeight: "600" as const,
    textTransform: "capitalize" as const,
  },
});
