import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';

interface Props {
  navigation?: any;
  route?: any;
}

export default function ComingSoonScreen(props: Props) {
  const { navigation, route } = props;
  const title: string = route?.params?.title || 'Próximamente';

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
      </View>
      <View style={s.body}>
        <View style={s.iconWrap}>
          <Ionicons name="construct-outline" size={30} color={C.textSecondary} />
        </View>
        <Text style={s.title}>{title}</Text>
        <Text style={s.subtitle}>Estamos trabajando en esta pantalla. Vuelve pronto.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { fontFamily: FONT.bold, fontSize: 18, color: C.textPrimary, textAlign: 'center' },
  subtitle: { fontFamily: FONT.regular, fontSize: 13.5, color: C.textSecondary, textAlign: 'center', marginTop: 8 },
});
