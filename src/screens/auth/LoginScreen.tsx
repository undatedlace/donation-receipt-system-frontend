import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import {
  Button,
  FieldGroup,
  InputField,
  Page,
  SurfaceCard,
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { fs, palette, shadows, spacing } from '../../theme/theme';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <StatusBar barStyle="light-content" backgroundColor={palette.primary} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Image
              source={require('../../assets/sdi_logo.png')}
              style={styles.sdiLogo}
              resizeMode="contain"
            />
          </View>

          <SurfaceCard style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Welcome Back</Text>
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
              <View style={styles.passwordWrapper}>
                <InputField
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => setShowPassword(v => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.eyeButton}>
                  <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </FieldGroup>

            <Button label="Sign In" loading={loading} onPress={handleLogin} style={styles.primaryButton} />

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
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 64,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  eyeText: {
    color: palette.primary,
    fontSize: fs(13),
    fontWeight: '700',
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
