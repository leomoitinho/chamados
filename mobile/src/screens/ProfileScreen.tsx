import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { User, Building2, LogOut, Shield } from 'lucide-react-native';

export const ProfileScreen = () => {
  const { user, logout, isSuperAdmin, isCompanyAdmin } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.full_name?.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.badge}>
          <Shield size={14} color="#818CF8" />
          <Text style={styles.badgeText}>
            {isSuperAdmin ? 'Super Administrador' : isCompanyAdmin ? 'Admin Empresa' : 'Usuário'}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Building2 size={18} color="#64748B" />
          <Text style={styles.infoLabel}>Empresa:</Text>
          <Text style={styles.infoValue}>{user?.company?.name || 'Global'}</Text>
        </View>
        <View style={styles.infoRow}>
          <User size={18} color="#64748B" />
          <Text style={styles.infoLabel}>Departamento:</Text>
          <Text style={styles.infoValue}>{user?.department || 'Geral'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <LogOut size={18} color="#EF4444" />
        <Text style={styles.logoutText}>Encerrar Sessão</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    padding: 20,
  },
  avatarCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  email: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  badgeText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 14,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
