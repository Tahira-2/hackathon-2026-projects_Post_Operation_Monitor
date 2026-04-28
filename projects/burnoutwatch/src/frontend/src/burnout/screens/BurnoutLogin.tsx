import { Mail, Lock, UserCircle, ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface BurnoutLoginProps {
  onLogin: (role: string) => void;
}

const roles = ['Nurse', 'Doctor', 'Resident', 'Supervisor'];

export function BurnoutLogin({ onLogin }: BurnoutLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = () => {
    if (email && password && role) {
      onLogin(role);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>

        {/* Title */}
        <Text style={styles.title}>Welcome to BurnoutWatch</Text>
        <Text style={styles.subtitle}>
          Sign in to start your check-in
        </Text>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Mail size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Lock size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>

        {/* Role (simple version for now) */}
        <View style={styles.roleContainer}>
          {roles.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRole(r)}
              style={[
                styles.roleButton,
                role === r && styles.roleSelected,
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  role === r && styles.roleTextSelected,
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Continue</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  roleSelected: {
    backgroundColor: '#6FAFB5',
  },
  roleText: {
    fontSize: 12,
    color: '#374151',
  },
  roleTextSelected: {
    color: '#FFFFFF',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#2C3E50',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});