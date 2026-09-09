import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ticketService } from '../services/api';
import { Ticket, TicketStatus } from '../types';
import { Send, Building2, User, Clock } from 'lucide-react-native';

export const TicketDetailScreen = ({ route }: any) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getById(ticketId);
      setTicket(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      setSending(true);
      await ticketService.addComment(ticketId, commentText.trim());
      setCommentText('');
      await loadTicket();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      await ticketService.updateStatus(ticketId, status);
      await loadTicket();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !ticket) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#818CF8" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header Badges */}
        <View style={styles.header}>
          <Text style={styles.code}>{ticket.code}</Text>
          <Text style={styles.status}>{ticket.status}</Text>
        </View>

        <Text style={styles.title}>{ticket.title}</Text>
        
        {/* Description */}
        <View style={styles.box}>
          <Text style={styles.boxLabel}>Descrição</Text>
          <Text style={styles.boxContent}>{ticket.description}</Text>
        </View>

        {/* Status Switcher */}
        <View style={styles.statusRow}>
          {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as TicketStatus[]).map((st) => (
            <TouchableOpacity
              key={st}
              onPress={() => handleStatusChange(st)}
              style={[
                styles.statusBtn,
                ticket.status === st && styles.statusBtnActive
              ]}
            >
              <Text style={[styles.statusBtnText, ticket.status === st && styles.statusBtnTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Histórico de Respostas</Text>
        <View style={styles.commentsList}>
          {ticket.comments && ticket.comments.length > 0 ? (
            ticket.comments.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{c.user?.full_name || 'Sistema'}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(c.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.commentText}>{c.message}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyComments}>Nenhuma mensagem até o momento.</Text>
          )}
        </View>
      </ScrollView>

      {/* Reply Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Responder chamado..."
          placeholderTextColor="#64748B"
          style={styles.replyInput}
        />
        <TouchableOpacity 
          style={styles.sendBtn} 
          onPress={handleSendComment}
          disabled={sending || !commentText.trim()}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Send size={18} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  center: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  code: {
    fontSize: 14,
    fontWeight: '800',
    color: '#818CF8',
    fontFamily: 'monospace',
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  box: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  boxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  boxContent: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statusBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  statusBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  commentsList: {
    gap: 8,
  },
  commentItem: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818CF8',
  },
  commentDate: {
    fontSize: 10,
    color: '#64748B',
  },
  commentText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  emptyComments: {
    color: '#64748B',
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    alignItems: 'center',
    gap: 8,
  },
  replyInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#030712',
    borderRadius: 12,
    paddingHorizontal: 12,
    color: '#FFF',
    fontSize: 13,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
