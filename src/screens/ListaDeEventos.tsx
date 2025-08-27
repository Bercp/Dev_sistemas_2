import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getEvents } from '../api/event';
import type { Event } from '../types/api';
import { fmtRange } from '../utils/format';
import { useNavigation } from '@react-navigation/native';

function EventsListScreen() {
  const nav = useNavigation<any>();
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const load = async () => {
    try {
      setLoading(true);
      const res = await getEvents();
      setData(res);
      setError(undefined);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error) return (
    <View style={styles.center}>
      <Text style={{ marginBottom: 8 }}>{error}</Text>
      <TouchableOpacity style={styles.retry} onPress={load}>
        <Text style={{ fontWeight: '600' }}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => nav.navigate('Event', { eventId: item.id })}
      accessibilityLabel={`Selecionar evento ${item.title}`}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.sub}>{fmtRange(item.startsAt, item.endsAt)}</Text>
      <Text style={styles.sub}>{item.location}</Text>
      <View style={styles.kpis}>
        <View style={styles.kpi}><Text style={styles.kpiVal}>{item.stats.total}</Text><Text style={styles.kpiLbl}>Total</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiVal}>{item.stats.checkedIn}</Text><Text style={styles.kpiLbl}>Presentes</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiVal}>{item.stats.absent}</Text><Text style={styles.kpiLbl}>Ausentes</Text></View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={data}
      keyExtractor={(e) => e.id}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListEmptyComponent={() => <View style={styles.center}><Text>Nenhum evento encontrado.</Text></View>}
    />
  );
}

export default React.memo(EventsListScreen);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  retry: { borderWidth: 1, borderColor: '#111', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  sub: { color: '#555' },
  kpis: { flexDirection: 'row', marginTop: 10, gap: 8 },
  kpi: { flex: 1, backgroundColor: '#F4F6F8', borderRadius: 10, padding: 10, alignItems: 'center' },
  kpiVal: { fontSize: 18, fontWeight: '700' },
  kpiLbl: { fontSize: 12, color: '#666' },
});
