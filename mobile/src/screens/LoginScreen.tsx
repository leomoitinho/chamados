import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Headphones, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react-native';

export const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Headphones size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>DeskMaster</Text>
          <Text style={styles.subtitle}>Help Desk & Chamados Mobile</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail Corporativo</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="usuario@empresa.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                secureTextEntry
                style={styles.input}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Acessar Conta</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Demo Accounts */}
          <View style={styles.demoSection}>
            <View style={styles.demoHeader}>
              <Sparkles size={14} color="#818CF8" />
              <Text style={styles.demoTitle}>TESTAR COM CONTAS DEMO</Text>
            </View>

            <TouchableOpacity 
              style={styles.demoBtn} 
              onPress={() => handleDemo('superadmin@chamados.com', 'admin123')}
            >
              <Text style={styles.demoRole}>👑 Super Admin Geral</Text>
              <Text style={styles.demoEmail}>superadmin@chamados.com</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.demoBtn} 
              onPress={() => handleDemo('admin.tech@empresa1.com', 'admin123')}
            >
              <Text style={styles.demoRole}>🏢 Admin Tech Solutions (Empresa 1)</Text>
              <Text style={styles.demoEmail}>admin.tech@empresa1.com</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.demoBtn} 
              onPress={() => handleDemo('mariana.vendas@empresa1.com', 'user123')}
            >
              <Text style={styles.demoRole}>👤 Usuário Solicitante (Empresa 1)</Text>
              <Text style={styles.demoEmail}>mariana.vendas@empresa1.com</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#030712',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#F8FAFC',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818CF8',
    letterSpacing: 0.5,
  },
  demoBtn: {
    backgroundColor: '#030712',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  demoRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  demoEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
