import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Modal, Pressable } from "react-native";
import { Button } from "./Button";
import Colors from "@/constants/colors";

export type CustomAlertButton = {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

export type CustomAlertConfig = {
  title: string;
  message?: string;
  buttons?: CustomAlertButton[];
  options?: { cancelable?: boolean };
};

// Global listener interface
let alertListener: ((config: CustomAlertConfig | null) => void) | null = null;

/**
 * Global trigger to display a custom alert modal
 */
export const triggerCustomAlert = (
  title: string,
  message?: string,
  buttons?: CustomAlertButton[],
  options?: { cancelable?: boolean }
) => {
  if (alertListener) {
    alertListener({ title, message, buttons, options });
  } else {
    console.warn("[CustomAlert] Alert triggered but CustomAlertModal is not mounted:", title);
  }
};

export default function CustomAlertModal() {
  const [alert, setAlert] = useState<CustomAlertConfig | null>(null);

  useEffect(() => {
    alertListener = (config) => {
      setAlert(config);
    };
    return () => {
      alertListener = null;
    };
  }, []);

  if (!alert) return null;

  const handleDismiss = () => {
    setAlert(null);
  };

  const handleButtonPress = (btn: CustomAlertButton) => {
    handleDismiss();
    if (btn.onPress) {
      btn.onPress();
    }
  };

  // If no buttons, default to a single OK button
  const buttonsList = alert.buttons && alert.buttons.length > 0
    ? alert.buttons
    : [{ text: "OK" }];

  // Stack vertically if 3 or more options, otherwise layout horizontally
  const isVertical = buttonsList.length > 2;

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={alert.options?.cancelable !== false ? handleDismiss : undefined}
    >
      <Pressable 
        style={styles.overlay} 
        onPress={alert.options?.cancelable !== false ? handleDismiss : undefined}
      >
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{alert.title}</Text>
          </View>
          
          {alert.message ? (
            <Text style={styles.message}>{alert.message}</Text>
          ) : null}

          <View style={[
            styles.buttonsContainer, 
            isVertical ? styles.buttonsVertical : styles.buttonsHorizontal
          ]}>
            {buttonsList.map((btn, idx) => {
              const isCancel = btn.style === "cancel";
              const isDestructive = btn.style === "destructive";

              let btnBg = Colors.light.primary;
              let btnBorder = Colors.light.primary;
              let btnTextCol = "#FFFFFF";
              let btnVar: "primary" | "secondary" | "outline" = "primary";

              if (isCancel) {
                btnBg = Colors.light.surface;
                btnBorder = Colors.light.border;
                btnTextCol = Colors.light.textSecondary;
                btnVar = "secondary";
              } else if (isDestructive) {
                btnBg = Colors.light.error;
                btnBorder = Colors.light.error;
                btnTextCol = "#FFFFFF";
                btnVar = "primary";
              }

              return (
                <Button
                  key={idx}
                  title={btn.text || "OK"}
                  variant={btnVar}
                  style={StyleSheet.flatten([
                    isVertical ? styles.verticalBtn : styles.horizontalBtn,
                    isCancel && { 
                      borderWidth: 1, 
                      borderColor: btnBorder, 
                      backgroundColor: btnBg, 
                      shadowOpacity: 0, 
                      elevation: 0 
                    },
                    isDestructive && { 
                      backgroundColor: btnBg, 
                      borderColor: btnBorder,
                      shadowColor: Colors.light.error 
                    },
                  ])}
                  textStyle={{ color: btnTextCol, fontSize: 14, fontWeight: "600" }}
                  onPress={() => handleButtonPress(btn)}
                />
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)", // Dark slate backdrop opacity
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    textAlign: "left",
  },
  message: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: "left",
  },
  buttonsContainer: {
    width: "100%",
    gap: 8,
  },
  buttonsHorizontal: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  buttonsVertical: {
    flexDirection: "column",
  },
  horizontalBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
  },
  verticalBtn: {
    width: "100%",
    height: 40,
    borderRadius: 8,
  },
});
