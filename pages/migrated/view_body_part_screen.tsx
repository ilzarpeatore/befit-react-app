import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import MuscleBodyMap from '../../components/MuscleBodyMap';
import { bodyPartIdForMuscle, BODY_PART_ID_TO_NAME } from '../../constants/bodyMusclesMap';

export default function ViewBodyPartScreen(props: any) {
  const handleMusclePress = (muscleId: string) => {
    const bodyPartId = bodyPartIdForMuscle(muscleId);
    if (!bodyPartId) {
      Alert.alert('Sin ejercicios', 'Todavía no hay ejercicios clasificados para esta zona.');
      return;
    }
    props.navigation.navigate('MigratedExerciseList', {
      mTitle: BODY_PART_ID_TO_NAME[bodyPartId] ?? 'Ejercicios',
      isBodyPart: true,
      id: bodyPartId,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Buscar por músculo</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.hint}>Toca una zona del cuerpo para ver sus ejercicios</Text>
      <View style={styles.mapWrap}>
        <MuscleBodyMap onMusclePress={handleMusclePress} height={420} />
      </View>
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
  hint: { fontSize: 13, fontFamily: FONT.regular, color: C.textSecondary, textAlign: 'center', marginBottom: 12 },
  mapWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
});
