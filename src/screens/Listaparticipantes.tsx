import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl,
  TouchableOpacity, Alert, ToastAndroid, Platform,
} from 'react-native';
import { getAttendees, postCheckin } from '../api/event';
import type { Attendee } from '../types/api';
import SearchBar from '../components/SearchBar';
import StatusChip from '../components/Status';
import { fmtHHmm, normalize } from '../utils/format';
import { useRoute } from '@react-navigation/native';

const PAGE_SIZE = 20;
const UNDO_WINDOW_MS = 10000; // 10s

export default function AttendeesScreen() {
  const route = useRoute<any>();
  const eventId = route.params?.eventId as string;
  const onCheckedIn = route?.params?.onCheckedIn as (() => void) | undefined;

  const [items, setItems] = useState<Attendee[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState(''); 

  
  const [undoId, setUndoId] = useState<string | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  
  const reqIdRef = useRef(0);

  
  const load = async (p = 1, append = false, q = query) => {
    const myId = ++reqIdRef.current;
    try {
      if (!append) setLoading(true);
      const res = await getAttendees(eventId, q, p, PAGE_SIZE);
      if (myId !== reqIdRef.current) return; // descarta resposta antiga
      setTotal(res.total);
      setItems(prev => (append ? [...prev, ...res.data] : res.data));
      setError(undefined);
    } catch (e: any) {
      if (myId !== reqIdRef.current) return;
      setError(e?.message || 'Erro ao carregar participantes');
    } finally {
      if (myId === reqIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  
  useEffect(() => {
    load(1, false, '');
    return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current); };
  }, [eventId]);

  
  
  useEffect(() => {
    const h = setTimeout(() => setQuery(normalize(search)), 300);
    return () => clearTimeout(h);
  }, [search]);

  
  useEffect(() => {
    setPage(1);
    load(1, false, query);
    
  }, [query, eventId]);

  const onChangeSearch = (t: string) => setSearch(t);

  const onRefresh = () => { setRefreshing(true); setPage(1); load(1, false, query); };
  const loadMore = () => {
    if (items.length < total && !loading) {
      const n = page + 1;
      setPage(n);
      load(n, true, query);
    }
  };

  const toast = (m: string) =>
    Platform.OS === 'android' ? ToastAndroid.show(m, ToastAndroid.SHORT) : undefined;

  const doCheckin = (a: Attendee) => {
    if (a.checkedInAt) {
      Alert.alert('Já presente', `Já presente desde ${fmtHHmm(a.checkedInAt)}`);
      return;
    }
    Alert.alert('Confirmar', `Marcar ${a.name} como presente?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            const res = await postCheckin(eventId, a.id);
            setItems(prev => prev.map(x => (x.id === a.id ? { ...x, checkedInAt: res.checkedInAt } : x)));

            // Se havia um timer pendente, comita o anterior (atualiza KPIs) antes de abrir nova janela
            if (undoTimerRef.current) {
              clearTimeout(undoTimerRef.current);
              undoTimerRef.current = null;
              onCheckedIn?.();
            }

            setUndoId(a.id);
            undoTimerRef.current = setTimeout(() => {
              onCheckedIn?.(); // atualiza KPIs quando a janela expira
              setUndoId(null);
              undoTimerRef.current = null;
            }, UNDO_WINDOW_MS);

            toast('Check-in realizado (você pode desfazer)');
          } catch (e: any) {
            if (e?.response?.status === 409) {
              const when = e?.response?.data?.checkedInAt;
              Alert.alert('Já presente', when ? `Já presente desde ${fmtHHmm(when)}` : 'Já presente');
            } else {
              Alert.alert('Erro', 'Não foi possível fazer o check-in.');
            }
          }
        },
      },
    ]);
  };

  const row = ({ item }: { item: Attendee }) => (
    <TouchableOpacity style={styles.row} onPress={() => doCheckin(item)} accessibilityLabel={`Participante ${item.name}`}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>{item.email || item.document || '—'}</Text>
      </View>
      <StatusChip present={!!item.checkedInAt} />
    </TouchableOpacity>
  );

  if (loading && items.length === 0)
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  if (error && items.length === 0)
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 8 }}>{error}</Text>
        <TouchableOpacity style={styles.retry} onPress={() => load(1, false, query)} accessibilityLabel="Tentar novamente">
          <Text style={{ color: '#111', fontWeight: '600' }}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <SearchBar value={search} onChangeText={onChangeSearch} />

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={row}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#EEE' }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text>{search ? `Nada encontrado para “${search}”.` : 'Nenhum participante.'}</Text>
          </View>
        )}
      />

      {undoId && (
        <View style={styles.undoBar} accessibilityLabel="Check-in realizado. Toque em desfazer para reverter localmente.">
          <Text style={styles.undoText}>Check-in realizado</Text>
          <TouchableOpacity
            onPress={() => {
              if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); undoTimerRef.current = null; }
              setItems(prev => prev.map(x => (x.id === undoId ? { ...x, checkedInAt: null } : x)));
              setUndoId(null);
              toast('Desfeito (apenas neste app)');
            }}
            accessibilityLabel="Desfazer check-in"
          >
            <Text style={styles.undoBtn}>Desfazer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '600' },
  sub: { color: '#555', marginTop: 2 },
  retry: { borderWidth: 1, borderColor: '#111', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  undoBar: {
    position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: '#111',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.2,
    shadowRadius: 6, elevation: 6,
  },
  undoText: { color: '#fff', fontWeight: '600' },
  undoBtn: { color: '#fff', textDecorationLine: 'underline', fontWeight: '700' },
});
