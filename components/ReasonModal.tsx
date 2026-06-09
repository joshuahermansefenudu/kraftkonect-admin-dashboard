import { StyleSheet, Text, View, Modal,  } from "react-native";
import { Button } from "./Button";
import { Input } from "./Input";
import { MessageSquare } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useState } from "react";

interface ReasonModalProps {
  visible: boolean;
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  isRequired?: boolean;
  onConfirm: (reason: string) => void | Promise<void>;
  onCancel: () => void;
}

export default function ReasonModal({
  visible,
  title,
  message,
  placeholder = "Enter reason...",
  confirmText = "Submit",
  cancelText = "Cancel",
  isRequired = false,
  onConfirm,
  onCancel,
}: ReasonModalProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isConfirmDisabled = isRequired && reason.trim().length === 0;

  const handleConfirm = async () => {
    if (isConfirmDisabled) return;

    setIsLoading(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setReason("");
    onCancel();
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
            <MessageSquare size={40} color={Colors.light.primary} strokeWidth={2} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.inputContainer}>
            <Input
              value={reason}
              onChangeText={setReason}
              placeholder={placeholder}
              multiline
              numberOfLines={4}
              editable={!isLoading}
              style={{ minHeight: 100, borderRadius: 20 }}
              inputStyle={{ textAlignVertical: "top", paddingTop: 10 }}
            />
            {isRequired && (
              <Text style={styles.requiredText}>* Required field</Text>
            )}
          </View>

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
              style={{ flex: 1, height: 48 }}
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
    maxWidth: 500,
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
    marginBottom: 20,
    lineHeight: 22,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  textarea: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
    minHeight: 100,
  },
  requiredText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 6,
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
