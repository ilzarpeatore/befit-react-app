import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import MuscleBodyMap from '../../components/MuscleBodyMap';
import { bodyPartIdForMuscle, BODY_PART_ID_TO_NAME } from '../../constants/bodyMusclesMap';

const MUSCLE_OPTIONS = Object.entries(BODY_PART_ID_TO_NAME)
  .map(([id, name]) => ({ id: Number(id), name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'));

// Este es el selector de grupo muscular (pantalla dedicada, no un mapa
// decorativo dentro de otra pantalla con más contenido alrededor) — pedido
// del usuario: "hazlo más grande para que sea más fácil seleccionar". Se
// calcula a partir del alto de pantalla (en vez de un fijo mayor) para no
// desbordar en dispositivos pequeños; en el resto de pantallas que usan
// MuscleBodyMap se deja el tamaño por defecto del componente tal cual.
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BODY_MAP_HEIGHT = Math.min(560, Math.round(SCREEN_HEIGHT * 0.56));

export default function ViewBodyPartScreen(props: any) {
  const [searchText, setSearchText] = useState('');
  const [listExpanded, setListExpanded] = useState(false);

  const goToExercises = (bodyPartId: number) => {
    props.navigation.navigate('MigratedSearch', {
      mTitle: BODY_PART_ID_TO_NAME[bodyPartId] ?? 'Ejercicios',
      isBodyPart: true,
      id: bodyPartId,
    });
  };

  const handleMusclePress = (muscleId: string) => {
    const bodyPartId = bodyPartIdForMuscle(muscleId);
    if (!bodyPartId) {
      Alert.alert('Sin ejercicios', 'Todavía no hay ejercicios clasificados para esta zona.');
      return;
    }
    goToExercises(bodyPartId);
  };

  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return MUSCLE_OPTIONS;
    const q = searchText.trim().toLowerCase();
    return MUSCLE_OPTIONS.filter((opt) => opt.name.toLowerCase().includes(q));
  }, [searchText]);

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Buscar por músculo</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={C.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar grupo muscular..."
          placeholderTextColor={C.textSecondary}
          value={searchText}
          onChangeText={(v) => {
            setSearchText(v);
            if (v.length > 0) setListExpanded(true);
          }}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={18} color={C.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.toggleRow} onPress={() => setListExpanded((prev) => !prev)}>
        <Text style={styles.toggleText}>Ver lista de grupos musculares</Text>
        <Ionicons name={listExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={C.textPrimary} />
      </TouchableOpacity>

      {listExpanded ? (
        <ScrollView style={styles.listWrap}>
          {filteredOptions.map((opt) => (
            <TouchableOpacity key={opt.id} style={styles.listRow} onPress={() => goToExercises(opt.id)}>
              <Text style={styles.listRowText}>{opt.name}</Text>
              <Ionicons name="chevron-forward" size={16} color={C.textSecondary} />
            </TouchableOpacity>
          ))}
          {filteredOptions.length === 0 && (
            <Text style={styles.emptyText}>Ningún grupo muscular coincide con la búsqueda.</Text>
          )}
        </ScrollView>
      ) : (
        <>
          <Text style={styles.hint}>Toca una zona del cuerpo para ver sus ejercicios</Text>
          <View style={styles.mapWrap}>
            <MuscleBodyMap onMusclePress={handleMusclePress} height={BODY_MAP_HEIGHT} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
  },
  appBarTitle: { fontSize: 17, fontFamily: FONT.bold, color: C.textPrimary },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.surfaceLight, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    marginHorizontal: 20, marginBottom: 10,
  },
  searchInput: { flex: 1, fontFamily: FONT.regular, fontSize: 14, color: C.textPrimary },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 8, marginHorizontal: 20, marginBottom: 8,
  },
  toggleText: { fontSize: 13, fontFamily: FONT.medium, color: C.textPrimary },
  listWrap: { flex: 1, paddingHorizontal: 20 },
  listRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  listRowText: { fontSize: 15, fontFamily: FONT.regular, color: C.textPrimary },
  emptyText: { fontSize: 13, fontFamily: FONT.regular, color: C.textSecondary, textAlign: 'center', paddingVertical: 40 },
  hint: { fontSize: 13, fontFamily: FONT.regular, color: C.textSecondary, textAlign: 'center', marginBottom: 12 },
  mapWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
});
