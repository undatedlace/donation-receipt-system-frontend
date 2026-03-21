import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Badge,
  Button,
  FieldGroup,
  InputField,
  Page,
  SurfaceCard,
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { fs, palette, shadows, spacing } from '../../theme/theme';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      return Alert.alert('Error', 'Please fill all fields');
    }

    if (password.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      await register(firstName.trim(), lastName.trim(), email.trim(), password);
    } catch (error: any) {
      Alert.alert('Registration Failed', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={palette.primary} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Badge label="New Workspace" tone="success" />
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>ND</Text>
            </View>
            <Text style={styles.heroTitle}>Create Account</Text>
            <Text style={styles.heroSubtitle}>
              Set up access for your collection team and keep donation operations inside one consistent workflow.
            </Text>
          </View>

          <SurfaceCard style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Register</Text>
              <Text style={styles.formSubtitle}>Keep it simple: name, email, and a secure password.</Text>
            </View>

            <FieldGroup label="First Name">
              <InputField value={firstName} onChangeText={setFirstName} placeholder="First name" />
            </FieldGroup>

            <FieldGroup label="Last Name">
              <InputField value={lastName} onChangeText={setLastName} placeholder="Last name" />
            </FieldGroup>

            <FieldGroup label="Email Address">
              <InputField
                value={email}
                onChangeText={setEmail}
                placeholder="admin@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </FieldGroup>

            <FieldGroup label="Password" hint="At least 6 characters">
              <InputField
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
              />
            </FieldGroup>

            <Button label="Create Account" loading={loading} onPress={handleRegister} style={styles.primaryButton} />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
              style={styles.linkButton}>
              <Text style={styles.linkText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </SurfaceCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: palette.primary,
  },
  flex: {
    flex: 1,
    backgroundColor: palette.primary,
  },
  content: {
    flexGrow: 1,
    padding: spacing.screen,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  brandMark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: fs(30),
    fontWeight: '700',
    letterSpacing: -1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: fs(28),
    fontWeight: '700',
    letterSpacing: -0.8,
    marginTop: spacing.lg,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: fs(14),
    lineHeight: 21,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  formCard: {
    ...shadows.lg,
  },
  formHeader: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    color: palette.text,
    fontSize: fs(24),
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  formSubtitle: {
    color: palette.textMuted,
    fontSize: fs(14),
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  linkText: {
    color: palette.primary,
    fontSize: fs(14),
    fontWeight: '700',
  },
});
