import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle, TextStyle, Platform, StyleProp } from "react-native";
import Colors from "@/constants/colors";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  touched?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  touched,
  containerStyle,
  inputStyle,
  icon,
  style,
  ...rest
}) => {
  const hasError = !!(touched && error);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, hasError && styles.inputContainerError, style]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={Colors.light.textSecondary}
          {...rest}
        />
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: "100%",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 27, // Highly rounded / capsule shape
    paddingHorizontal: 20,
    height: 54,
  },
  inputContainerError: {
    borderColor: Colors.light.error,
  },
  iconContainer: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: Colors.light.text,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }) as any,
  },
  errorText: {
    fontSize: 13,
    color: Colors.light.error,
    marginTop: 2,
    paddingHorizontal: 12,
  },
});
