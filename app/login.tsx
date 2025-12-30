import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { Lock, Mail, Shield } from "lucide-react-native";

export default function LoginScreen() {
  const { login, verify2FA, loginStep } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (!success) {
      setError("Invalid email or password");
    }
  };

  const handle2FAVerify = async () => {
    setError("");
    if (!twoFACode) {
      setError("Please enter the 2FA code");
      return;
    }

    setIsLoading(true);
    const success = await verify2FA(twoFACode);
    setIsLoading(false);

    if (success) {
      router.replace("/");
    } else {
      setError("Invalid 2FA code");
      setTwoFACode("");
    }
  };

  const renderEmailStep = () => (
    <>
      <View style={styles.iconContainer}>
        <Shield size={48} color={Colors.light.primary} />
      </View>

      <Text style={styles.title}>Admin Login</Text>
      <Text style={styles.subtitle}>
        Sign in to access the Kraftkonect admin dashboard
      </Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Mail size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="admin@kraftkonect.com"
              placeholderTextColor={Colors.light.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={Colors.light.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleEmailLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.demoCredentials}>
        <Text style={styles.demoTitle}>Demo Credentials:</Text>
        <Text style={styles.demoText}>Email: admin@kraftkonect.com</Text>
        <Text style={styles.demoText}>Password: admin123</Text>
      </View>
    </>
  );

  const render2FAStep = () => (
    <>
      <View style={styles.iconContainer}>
        <Shield size={48} color={Colors.light.primary} />
      </View>

      <Text style={styles.title}>Two-Factor Authentication</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code to complete your login
      </Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Authentication Code</Text>
          <View style={styles.inputWrapper}>
            <Shield size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor={Colors.light.textSecondary}
              value={twoFACode}
              onChangeText={setTwoFACode}
              keyboardType="number-pad"
              maxLength={6}
              editable={!isLoading}
            />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handle2FAVerify}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Verify & Login</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.demoCredentials}>
        <Text style={styles.demoTitle}>Demo 2FA Code:</Text>
        <Text style={styles.demoText}>123456</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.card}>
          {loginStep === "email" ? renderEmailStep() : render2FAStep()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 40,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    outlineStyle: "none" as const,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.error,
    textAlign: "center",
  },
  demoCredentials: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 8,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center",
  },
  demoText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: "center",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", web: "monospace" }),
  },
});
