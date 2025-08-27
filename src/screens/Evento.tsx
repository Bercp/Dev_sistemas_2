import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getEvent } from '../api/event';
import { fmtRange } from '../utils/format';
import type { Event } from '../types/api';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function EventScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const eventId = route.params?.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const load = async () => {
    try {
      setLoading(true);
      setEvent(await getEvent(eventId));
      setError(undefined);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar evento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [eventId]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error || !event) return (
    <View style={styles.center}>
      <Text style={{ marginBottom: 8 }}>{error || 'Falha ao carregar.'}</Text>
      <TouchableOpacity style={styles.btn} onPress={load}><Text style={styles.btnText}>Tentar novamente</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityLabel={`Título: ${event.title}`}>{event.title}</Text>
      <Text style={styles.line}>{fmtRange(event.startsAt, event.endsAt)}</Text>
      <Text style={styles.line}>{event.location}</Text>

      <View style={styles.kpis}>
        <View style={styles.kpi}><Text style={styles.kpiVal}>{event.stats.total}</Text><Text style={styles.kpiLbl}>Total</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiVal}>{event.stats.checkedIn}</Text><Text style={styles.kpiLbl}>Presentes</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiVal}>{event.stats.absent}</Text><Text style={styles.kpiLbl}>Ausentes</Text></View>
      </View>

      <TouchableOpacity
        style={[styles.btn, { marginTop: 16 }]}
        onPress={() => nav.navigate('Attendees', { eventId, onCheckedIn: () => load() })}
        accessibilityLabel="Ver participantes"
      >
        <Text style={styles.btnText}>Ver participantes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  line: { color: '#444', marginBottom: 2 },
  kpis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  kpi: { flex: 1, backgroundColor: '#F4F6F8', borderRadius: 12, padding: 12, alignItems: 'center', marginHorizontal: 4 },
  kpiVal: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  kpiLbl: { fontSize: 12, color: '#555', marginTop: 2 },
  btn: { backgroundColor: '#111', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});
