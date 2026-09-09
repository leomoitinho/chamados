import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/api';
import { Ticket } from '../types';
import { Plus, Ticket as TicketIcon, Clock, CheckCircle2, CircleDot, AlertTriangle } from 'lucide-react-native';

export const HomeScreen = ({ navigation }: any) => {
  const { user, isSuperAdmin } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await ticketService.list();
      setTickets(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818CF8" />}
    >
      {/* Top Banner */}
      <View style={styles.topCard}>
        <Text style={styles.greeting}>Olá, {user?.full_name?.split(' ')[0]} 👋</Text>
        <Text style={styles.companyInfo}>
          {isSuperAdmin ? '🌐 Super Administrador (Global)' : (user?.company?.name || 'Minha Empresa')}
        </Text>

        <TouchableOpacity 
          style={styles.newTicketBtn}
          onPress={() => navigation.navigate('CreateTicket')}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.newTicketText}>Abrir Novo Chamado</Text>
        </TouchableOpacity>
      </View>

      {/* Counters Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Visão Geral</Text>
      </View>

      <View style={styles.countersRow}>
        <View style={[styles.counterCard, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
          <CircleDot size={18} color="#10B981" />
          <Text style={[styles.counterValue, { color: '#10B981' }]}>{openCount}</Text>
          <Text style={styles.counterLabel}>Abertos</Text>
        </View>

        <View style={[styles.counterCard, { borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
          <Clock size={18} color="#3B82F6" />
          <Text style={[styles.counterValue, { color: '#3B82F6' }]}>{inProgressCount}</Text>
          <Text style={styles.counterLabel}>Em Andamento</Text>
        </View>

        <View style={[styles.counterCard, { borderColor: 'rgba(99, 102, 241, 0.3)' }]}>
          <CheckCircle2 size={18} color="#818CF8" />
          <Text style={[styles.counterValue, { color: '#818CF8' }]}>{resolvedCount}</Text>
          <Text style={styles.counterLabel}>Resolvidos</Text>
        </View>
      </View>

      {/* Recent Tickets Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chamados Recentes</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TicketsTab')}>
          <Text style={styles.seeAll}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ticketsList}>
        {tickets.slice(0, 5).map((t) => (
          <TouchableOpacity 
            key={t.id}
            style={styles.ticketCard}
            onPress={() => navigation.navigate('TicketDetail', { ticketId: t.id })}
          >
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketCode}>{t.code}</Text>
              <Text style={styles.ticketStatus}>{t.status}</Text>
            </View>
            <Text style={styles.ticketTitle} numberOfLines={1}>{t.title}</Text>
            <Text style={styles.ticketDesc} numberOfLines={2}>{t.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    padding: 16,
  },
  topCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  companyInfo: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 16,
  },
  newTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  newTicketText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  seeAll: {
    fontSize: 12,
    color: '#818CF8',
    fontWeight: '600',
  },
  countersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  counterCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  counterValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
  },
  counterLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  ticketsList: {
    gap: 10,
    marginBottom: 40,
  },
  ticketCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818CF8',
    fontFamily: 'monospace',
  },
  ticketStatus: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ticketDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
});
