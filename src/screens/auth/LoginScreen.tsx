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
  PageHeader,
  SurfaceCard,
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { palette, spacing } from '../../theme/theme';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please fill all fields');
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        (error?.message ? `Network error: ${error.message}` : 'Invalid credentials');
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={palette.primaryDark} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <PageHeader
            eyebrow="Noori Donation"
            title="Modern receipt workflow for your donation desk."
            subtitle="Sign in to manage entries, generate receipts, and share them from one clean dashboard."
            trailing={<Badge label="Secure sign in" tone="success" />}
          />

          <SurfaceCard style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Welcome back</Text>
              <Text style={styles.formSubtitle}>Use your registered email address to continue.</Text>
            </View>

            <FieldGroup label="Email Address">
              <InputField
                value={email}
                onChangeText={setEmail}
                placeholder="admin@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </FieldGroup>

            <FieldGroup label="Password">
              <InputField
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
              />
            </FieldGroup>

            <Button label="Sign in" loading={loading} onPress={handleLogin} style={styles.primaryButton} />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Register')}
              style={styles.linkButton}>
              <Text style={styles.linkText}>Create a new account</Text>
            </TouchableOpacity>
          </SurfaceCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: palette.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.screen,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  formCard: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  formHeader: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '800',
  },
  formSubtitle: {
    color: palette.textMuted,
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '700',
  },
});
