import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl 
} from 'react-native';
import { ticketService } from '../services/api';
import { Ticket, TicketStatus } from '../types';
import { Search } from 'lucide-react-native';

export const TicketsScreen = ({ navigation }: any) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = async () => {
    try {
      const params: any = {};
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;
      const data = await ticketService.list(params);
      setTickets(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [selectedStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const statuses = [
    { label: 'Todos', value: '' },
    { label: 'Aberto', value: 'OPEN' },
    { label: 'Em Andamento', value: 'IN_PROGRESS' },
    { label: 'Resolvido', value: 'RESOLVED' },
    { label: 'Fechado', value: 'CLOSED' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search size={18} color="#64748B" style={{ marginRight: 8 }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={loadTickets}
          placeholder="Buscar chamado..."
          placeholderTextColor="#64748B"
          style={styles.searchInput}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterScroll}>
        {statuses.map((s) => (
          <TouchableOpacity
            key={s.value}
            onPress={() => setSelectedStatus(s.value)}
            style={[
              styles.filterPill,
              selectedStatus === s.value && styles.filterPillActive,
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedStatus === s.value && styles.filterPillTextActive,
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tickets List */}
      <FlatList
        data={tickets}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818CF8" />}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.code}>{item.code}</Text>
              <Text style={styles.statusBadge}>{item.status}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.meta}>{item.category?.name || 'Geral'}</Text>
              <Text style={styles.metaDate}>
                {new Date(item.created_at).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterPillText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  code: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818CF8',
    fontFamily: 'monospace',
  },
  statusBadge: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 8,
  },
  meta: {
    fontSize: 11,
    color: '#818CF8',
  },
  metaDate: {
    fontSize: 11,
    color: '#64748B',
  },
});
