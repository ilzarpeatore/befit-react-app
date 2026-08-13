import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { checkinsApi, checkinTypeLabel, CheckInAssignment } from '../../api/checkins';

interface Props {
  navigation?: any;
}

export default function CheckInsListScreen(props: Props) {
  const { navigation } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [items, setItems] = useState<CheckInAssignment[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await checkinsApi.getAssignedList();
      setItems(res.data?.data ?? []);
    } catch (e) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const pending = useMemo(() => items.filter((a) => a.is_due), [items]);
  const completed = useMemo(() => items.filter((a) => !a.is_due), [items]);

  const openForm = (a: CheckInAssignment) => {
    navigation?.navigate('MigratedCheckInFill', { formAssignmentId: a.id, formId: a.form_id, title: a.form.title });
  };

  const renderCard = (a: CheckInAssignment) => (
    <TouchableOpacity key={a.id} style={styles.card} activeOpacity={0.75} onPress={() => openForm(a)}>
      <View style={[styles.iconWrap, a.is_due ? styles.iconWrapDue : styles.iconWrapDone]}>
        <Ionicons
          name={a.is_due ? 'alert-circle-outline' : 'checkmark-circle-outline'}
          size={20}
          color={a.is_due ? C.warning60 : C.success60}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle} numberOfLines={2}>{a.form.title}</Text>
        <Text style={styles.cardType}>{checkinTypeLabel(a)}</Text>
        {a.submitted_at && (
          <Text style={styles.cardMeta}>
            Última vez: {new Date(a.submitted_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-ins y formularios</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.textPrimary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No se pudieron cargar tus check-ins.</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="clipboard-outline" size={40} color={C.textSecondary} />
          <Text style={[styles.emptyText, { marginTop: 12 }]}>
            Tu coach no te ha asignado ningún check-in o formulario todavía.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {pending.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pendientes</Text>
              {pending.map(renderCard)}
            </View>
          )}
          {completed.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Al día</Text>
              {completed.map(renderCard)}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: FONT.bold, fontSize: 17, color: C.textPrimary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyText: { fontFamily: FONT.regular, fontSize: 14, color: C.textSecondary, textAlign: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  section: { marginBottom: 8 },
  sectionTitle: { fontFamily: FONT.bold, fontSize: 13, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10, marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDue: { backgroundColor: C.warning10 },
  iconWrapDone: { backgroundColor: C.success10 },
  cardTitle: { fontFamily: FONT.bold, fontSize: 14.5, color: C.textPrimary },
  cardType: { fontFamily: FONT.regular, fontSize: 11.5, color: C.textSecondary, marginTop: 3 },
  cardMeta: { fontFamily: FONT.regular, fontSize: 11, color: C.textTertiary, marginTop: 2 },
});
