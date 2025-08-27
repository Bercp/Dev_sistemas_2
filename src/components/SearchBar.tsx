import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function SearchBar({ value, onChangeText }: { value: string; onChangeText: (t: string) => void }) {
  return (
    <View style={styles.box}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar por nome, e-mail ou documento"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Campo de busca"
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { paddingHorizontal: 16, paddingBottom: 8 },
  input: { backgroundColor: '#F4F6F8', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 }
});
