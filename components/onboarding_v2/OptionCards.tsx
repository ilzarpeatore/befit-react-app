import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingOption } from '../../types/onboardingV2';
import { C, FONT } from '../../pages/migrated/theme';

interface Props {
  options: OnboardingOption[];
  value: string | undefined;
  onChange: (value: string) => void;
}

// Tarjetas de selección única, apiladas a ancho completo -- mismo patrón
// tanto para preguntas PAR-Q (2 opciones Sí/No) como para preguntas con
// icono+subtítulo (tipo de dieta, estilo de vida), según las capturas de
// referencia del usuario.
export default function OptionCards({ options, value, onChange }: Props) {
  return (
    <View style={styles.list}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.card, selected && styles.cardSelected]}
          >
            {option.icon ? (
              option.emoji ? (
                <Text style={styles.emoji}>{option.icon}</Text>
              ) : (
                <Ionicons name={option.icon as any} size={22} color={selected ? '#FFFFFF' : C.textPrimary} style={styles.icon} />
              )
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
              {option.subtitle ? (
                <Text style={[styles.subtitle, selected && styles.subtitleSelected]}>{option.subtitle}</Text>
              ) : null}
            </View>
            {selected && <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  cardSelected: { backgroundColor: C.accentBlack, borderColor: C.accentBlack },
  icon: { marginRight: 2 },
  emoji: { fontSize: 22, marginRight: 2 },
  label: { fontSize: 15.5, fontFamily: FONT.bold, color: C.textPrimary },
  labelSelected: { color: '#FFFFFF' },
  subtitle: { fontSize: 13, fontFamily: FONT.regular, color: C.textSecondary, marginTop: 2 },
  subtitleSelected: { color: 'rgba(255,255,255,0.75)' },
});
