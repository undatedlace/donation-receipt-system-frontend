import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Error', 'Please fill all fields');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (e: any) {
      Alert.alert('Registration Failed', e?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.arabic}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.subtitle}>Noori Donation Centre</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#AAA" />

          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="admin@example.com"
            keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#AAA" />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword}
            placeholder="Min. 6 characters" secureTextEntry placeholderTextColor="#AAA" />

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#1B6B3A' },
  header: { alignItems: 'center', paddingTop: 70, paddingBottom: 30, paddingHorizontal: 24 },
  arabic: { color: '#C8963E', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  appName: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#A8D5BC', fontSize: 14, marginTop: 4 },
  divider: { width: 60, height: 3, backgroundColor: '#C8963E', borderRadius: 2, marginTop: 16 },
  form: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, marginTop: 20 },
  label: { color: '#1B6B3A', fontWeight: '600', fontSize: 13, marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: '#D0E8D8', borderRadius: 10, padding: 14, fontSize: 15, color: '#333', backgroundColor: '#FAFFF8' },
  btn: { backgroundColor: '#1B6B3A', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 28 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { alignItems: 'center', marginTop: 18 },
  linkText: { color: '#1B6B3A', fontSize: 14 },
});
