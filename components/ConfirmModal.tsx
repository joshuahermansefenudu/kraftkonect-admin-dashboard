import { StyleSheet, Text, View, Modal,  } from "react-native";
import { Button } from "./Button";
import { Input } from "./Input";
import { AlertCircle } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useState } from "react";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  requireTypedConfirmation?: boolean;
  confirmationValue?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  requireTypedConfirmation = false,
  confirmationValue = "DELETE",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [typedValue, setTypedValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isConfirmDisabled =
    requireTypedConfirmation && typedValue !== confirmationValue;

  const handleConfirm = async () => {
    if (isConfirmDisabled) return;

    setIsLoading(true);
    try {
      await onConfirm();
      setTypedValue("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTypedValue("");
    onCancel();
  };

  const getConfirmButtonColor = () => {
    switch (variant) {
      case "danger":
        return Colors.light.error;
      case "warning":
        return Colors.light.warning;
      case "info":
      default:
        return Colors.light.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertCircle
              size={48}
              color={getConfirmButtonColor()}
              strokeWidth={2}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {requireTypedConfirmation && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Type <Text style={styles.inputLabelBold}>{confirmationValue}</Text>{" "}
                to confirm:
              </Text>
              <Input
                value={typedValue}
                onChangeText={setTypedValue}
                placeholder={confirmationValue}
                autoCapitalize="characters"
                editable={!isLoading}
              />
            </View>
          )}

          <View style={styles.buttons}>
            <Button
              title={cancelText}
              variant="outline"
              style={{ flex: 1, borderWidth: 1, borderColor: Colors.light.border, height: 48 }}
              textStyle={{ color: Colors.light.text, fontSize: 15 }}
              onPress={handleCancel}
              disabled={isLoading}
            />
            <Button
              title={confirmText}
              style={{ flex: 1, height: 48, backgroundColor: getConfirmButtonColor(), borderColor: getConfirmButtonColor() }}
              onPress={handleConfirm}
              disabled={isConfirmDisabled}
              loading={isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 450,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  inputLabelBold: {
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  confirmButton: {
    backgroundColor: Colors.light.primary,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
