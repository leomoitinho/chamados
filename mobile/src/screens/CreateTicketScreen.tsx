import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { ticketService, categoryService } from '../services/api';
import { Category, TicketPriority } from '../types';

export const CreateTicketScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryService.list().then(cats => {
      setCategories(cats);
      if (cats.length > 0) setSelectedCategory(cats[0].id);
    }).catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Atenção', 'Preencha o título e a descrição do chamado.');
      return;
    }
    try {
      setLoading(true);
      await ticketService.create({
        title: title.trim(),
        description: description.trim(),
        priority,
        category_id: selectedCategory,
      });
      Alert.alert('Sucesso', 'Chamado aberto com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.detail || 'Não foi possível criar o chamado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>Novo Chamado</Text>
      <Text style={styles.headerSubtitle}>Descreva a sua solicitação técnica</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Título do Chamado</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Problema com emissão de nota"
          placeholderTextColor="#64748B"
          style={styles.input}
        />

        <Text style={styles.label}>Prioridade</Text>
        <View style={styles.priorityRow}>
          {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TicketPriority[]).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPriority(p)}
              style={[
                styles.priorityBtn,
                priority === p && styles.priorityBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.priorityBtnText,
                  priority === p && styles.priorityBtnTextActive,
                ]}
              >
                {p === 'LOW' && 'Baixa'}
                {p === 'MEDIUM' && 'Média'}
                {p === 'HIGH' && 'Alta'}
                {p === 'URGENT' && 'Urgente'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Descrição Detalhada</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Explique o que está ocorrendo..."
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={[styles.input, { height: 120, paddingTop: 10 }]}
        />

        <TouchableOpacity 
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>Criar Chamado</Text>
          )}
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 20,
  },
  form: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#030712',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    height: 48,
    color: '#FFF',
    fontSize: 13,
    marginBottom: 16,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#030712',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  priorityBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  priorityBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  priorityBtnTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
