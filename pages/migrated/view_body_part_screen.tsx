import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { VStack } from '@components/ui/vstack';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Input, InputField, InputSlot } from '@components/ui/input';
import ScreenHeader from '@components/ScreenHeader';
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
// Bumped 0.56->0.66 (tope 560->660) -- pedido explicito: "Haz el body mas
// grande para que sea mas facil seleccionar grupos musculares" (zonas
// pequenas como antebrazos/gemelos eran dificiles de tocar con precision).
const BODY_MAP_HEIGHT = Math.min(660, Math.round(SCREEN_HEIGHT * 0.66));

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
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['bottom']}>
      <ScreenHeader title="Buscar por músculo" onBack={() => props.navigation.goBack()} />

      <VStack space="sm" className="mx-5" style={{ marginTop: 12 }}>
        <Input className="rounded-sm bg-card border-0 px-3.5 gap-2" size="md">
          <Icon name="search" size={16} className="text-muted-foreground" />
          <InputField
            placeholder="Buscar grupo muscular..."
            value={searchText}
            onChangeText={(v) => {
              setSearchText(v);
              if (v.length > 0) setListExpanded(true);
            }}
          />
          {searchText.length > 0 && (
            <InputSlot onPress={() => setSearchText('')}>
              <Icon name="close-circle" size={18} className="text-muted-foreground" />
            </InputSlot>
          )}
        </Input>

        <Pressable
          className="flex-row items-center justify-center gap-1.5 py-2"
          onPress={() => setListExpanded((prev) => !prev)}
        >
          <Text size="sm" weight="medium">Ver lista de grupos musculares</Text>
          <Icon name={listExpanded ? 'chevron-up' : 'chevron-down'} size={18} className="text-foreground" />
        </Pressable>
      </VStack>

      {listExpanded ? (
        <ScrollView className="flex-1 px-4">
          {filteredOptions.map((opt) => (
            <Pressable
              key={opt.id}
              className="flex-row items-center justify-between py-3.5 border-b border-border"
              onPress={() => goToExercises(opt.id)}
            >
              <Text size="sm" className="text-foreground">{opt.name}</Text>
              <Icon name="chevron-forward" size={16} className="text-muted-foreground" />
            </Pressable>
          ))}
          {filteredOptions.length === 0 && (
            <Text size="xs" muted className="text-center py-10">Ningún grupo muscular coincide con la búsqueda.</Text>
          )}
        </ScrollView>
      ) : (
        <>
          <Text size="xs" muted className="text-center px-4" style={{ marginBottom: 12 }}>
            Toca una zona del cuerpo para ver sus ejercicios
          </Text>
          <Box className="flex-1 items-center justify-center" style={{ paddingBottom: 40 }}>
            <MuscleBodyMap onMusclePress={handleMusclePress} height={BODY_MAP_HEIGHT} />
          </Box>
        </>
      )}
    </SafeAreaView>
  );
}
