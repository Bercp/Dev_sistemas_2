import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatusChip({ present }: { present: boolean }) {
  const bg = present ? '#E6F4EA' : '#F2F3F5';
  const fg = present ? '#137333' : '#3C4043';
  return (
    <View style={[styles.chip, { backgroundColor: bg }]} accessibilityLabel={`Status: ${present ? 'Presente' : 'Ausente'}`}>
      <Text style={[styles.text, { color: fg }]}>{present ? 'Presente' : 'Ausente'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 }, text: { fontWeight: '600' } });
