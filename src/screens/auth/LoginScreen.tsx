import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
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
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { fs, palette, spacing } from '../../theme/theme';

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
    // <ImageBackground
    //   source={require('../../assets/bg_watermark.png')}
    //   style={styles.page}
    //   resizeMode="cover">
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={{flex: 1, height: Dimensions.get('window').height}}>
          <View style={styles.hero}>
            <Image
              source={require('../../assets/sdi_logo.png')}
              style={styles.sdiLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formCard}>
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
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    height: Dimensions.get('window').height
  },
  flex: {
    flex: 1,
    height: Dimensions.get('window').height
  },
  content: {
    flexGrow: 1,
    padding: spacing.screen,
    paddingTop: 0,
    justifyContent: 'flex-start',
    height: Dimensions.get('window').height

  },
  hero: {
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: spacing.xl,
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44,
  },
  sdiLogo: {
    width: 88,
    height: 88,
  },
  formCard: {
    paddingTop: spacing.sm,
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
});
