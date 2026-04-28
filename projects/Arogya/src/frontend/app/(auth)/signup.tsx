import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { API_BASE_URL } from "@/services/config";
import { authStorage } from "@/services/storage";

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);

  const handleBackNavigation = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  };

  const handleSignup = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!password) {
      Alert.alert("Error", "Please enter a password");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!agreedToTerms) {
      Alert.alert("Error", "You must agree to the Terms of Service");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email.trim(),
          email: email.trim(),
          password: password,
          first_name: fullName.trim(),
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from backend
        let errorMessage = "Registration failed";

        if (data.username) {
          errorMessage = Array.isArray(data.username)
            ? data.username[0]
            : data.username;
        } else if (data.email) {
          errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.password) {
          errorMessage = Array.isArray(data.password)
            ? data.password[0]
            : data.password;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }

        Alert.alert("Registration Failed", errorMessage);
        setLoading(false);
        return;
      }

      // Registration successful
      // Store token and user data if provided
      if (data.token) {
        await authStorage.setToken(data.token);
      }

      if (data.user) {
        await authStorage.setUserData(data.user);
      }

      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => {
            setLoading(false);
            handleBackNavigation();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Signup error:", error);

      let errorMessage = "Network error. Please check your connection.";

      if (error.message === "Network request failed") {
        errorMessage =
          `Cannot connect to server at ${API_BASE_URL}.\n\n` +
          "Please ensure:\n" +
          "1. The backend server is running\n" +
          "2. The IP address is correct in config.ts\n" +
          "3. Your device is on the same network";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Connection Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.shieldBadge}>
            <MaterialIcons name="security" size={32} color="#ffffff" />
          </View>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeSection}>
          <Text style={styles.heading}>Create an account</Text>
          <Text style={styles.subheading}>
            Join CareLoop to manage your health{"\n"}journey.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Role Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>I am a</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "patient" && styles.roleButtonActive,
                ]}
                onPress={() => setRole("patient")}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === "patient" && styles.roleButtonTextActive,
                  ]}
                >
                  Patient
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "doctor" && styles.roleButtonActive,
                ]}
                onPress={() => setRole("doctor")}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === "doctor" && styles.roleButtonTextActive,
                  ]}
                >
                  Doctor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#aaa"
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={18}
                  color="#888"
                  style={styles.eyeIcon}
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <MaterialIcons
                  name={showConfirmPassword ? "visibility" : "visibility-off"}
                  size={18}
                  color="#888"
                  style={styles.eyeIcon}
                />
              </Pressable>
            </View>
          </View>

          {/* Terms Checkbox */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
              disabled={loading}
            >
              {agreedToTerms && (
                <MaterialIcons name="check" size={14} color="#fff" />
              )}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.signupButton,
              loading && styles.signupButtonDisabled,
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleBackNavigation} disabled={loading}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  shieldBadge: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#2A7B88",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeSection: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#000000",
  },
  eyeIcon: {
    padding: 8,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  roleButtonActive: {
    borderColor: "#2A7B88",
    backgroundColor: "#EAF3FA",
  },
  roleButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  roleButtonTextActive: {
    color: "#2A7B88",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#2A7B88",
    borderColor: "#2A7B88",
  },
  termsText: {
    fontSize: 13,
    color: "#666666",
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: "#2A7B88",
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "#2A7B88",
    borderRadius: 8,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 13,
    color: "#666666",
  },
  loginLink: {
    fontSize: 13,
    color: "#2A7B88",
    fontWeight: "600",
  },
});
