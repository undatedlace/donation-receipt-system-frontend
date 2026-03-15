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
      <StatusBar barStyle="light-content" backgroundColor={palette.primaryDark} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <PageHeader
            eyebrow="New account"
            title="Create access for your donation operations team."
            subtitle="Register once, then manage donations, receipts, and WhatsApp delivery from the app."
            trailing={<Badge label="Green workspace" tone="primary" />}
          />

          <SurfaceCard style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Create your account</Text>
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

            <Button label="Create account" loading={loading} onPress={handleRegister} style={styles.primaryButton} />

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
