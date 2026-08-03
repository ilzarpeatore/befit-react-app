import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT } from './theme';
import { subscriptionApi, PackageItem } from '../../api/subscription';
import { useAuth } from '../../store/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SubscribeScreen(props: any) {
  const { state } = useAuth();
  const isPersonalClient = !!state.user?.is_personal_client;
  const [subscriptionList, setSubscriptionList] = useState<PackageItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Defensa adicional: cliente 1:1 no debería llegar aquí (subscription_detail_screen
    // ya lo desvía antes), pero si algún futuro punto de entrada lo trae de todas
    // formas, no tiene sentido pedirle el catálogo de paquetes de pago.
    if (!isPersonalClient) {
      getPackageData();
    }
  }, [isPersonalClient]);

  const getPackageData = async () => {
    setIsLoading(true);
    try {
      const res = await subscriptionApi.getPackageList();
      setSubscriptionList(res.data?.data || []);
    } catch (e) {
      console.log('Failed to load packages', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fase 3 "Niveles de acceso" — sin pago real todavía (Fase 4): se suscribe
  // directamente vía subscribe-to-package (paid/active, sin pasar por
  // MigratedPayment) para validar el resto del flujo de punta a punta.
  const paymentConfirm = async (id: number) => {
    setIsLoading(true);
    try {
      await subscriptionApi.subscribeToPackage(id);
      Alert.alert('Listo', 'Te has suscrito correctamente.');
      props.navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo completar la suscripción.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (selectedIndex === -1) {
      Alert.alert('Please select a plan to continue');
      return;
    }
    const selected = subscriptionList[selectedIndex];
    paymentConfirm(selected.id);
  };

  const renderSubscriptionItem = ({ item, index }: { item: PackageItem; index: number }) => (
    <TouchableOpacity
      style={[
        styles.planCard,
        selectedIndex === index && styles.planCardActive,
      ]}
      activeOpacity={0.7}
      onPress={() => setSelectedIndex(selectedIndex === index ? -1 : index)}
    >
      <View style={styles.planCardContent}>
        <View style={styles.planCardLeft}>
          <Ionicons
            name={selectedIndex === index ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={C.textPrimary}
          />
          <Text style={styles.planName} numberOfLines={2}>{item.name || ''}</Text>
        </View>
        <View style={styles.planCardRight}>
          <Text style={styles.planPrice}>${Number(item.price ?? 0).toFixed(2)}</Text>
          <Text style={styles.planDuration}>
            / {item.duration} {item.duration_unit}{item.duration > 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      {(item.training_program_title || item.meal_plan_template_title) && (
        <View style={styles.includesRow}>
          {item.training_program_title && (
            <View style={styles.includesChip}>
              <Ionicons name="barbell-outline" size={12} color={C.textPrimary} />
              <Text style={styles.includesChipText}>Entrenamiento</Text>
            </View>
          )}
          {item.meal_plan_template_title && (
            <View style={styles.includesChip}>
              <Ionicons name="nutrition-outline" size={12} color={C.textPrimary} />
              <Text style={styles.includesChipText}>Nutrición</Text>
            </View>
          )}
        </View>
      )}
      <Text style={styles.planDescription}>{item.description || ''}</Text>
    </TouchableOpacity>
  );

  if (isPersonalClient) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => props.navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={C.white} />
        </TouchableOpacity>
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={56} color={C.success} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { textAlign: 'center', paddingHorizontal: 24 }]}>
            Ya tienes acceso completo como cliente de entrenamiento personal 1:1 — no necesitas comprar ningún plan.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View>
          <Image
            source={require('@assets/bg.png')}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.3)', C.bg]}
            style={styles.overlayGradient}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => props.navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Your{'\n'}Plan</Text>
        </View>

        <Text style={styles.subtitle}>Select the subscription that fits your fitness goals.</Text>

        {isLoading && subscriptionList.length === 0 ? (
          <ActivityIndicator size="large" color={C.orange} style={{ marginTop: 30 }} />
        ) : subscriptionList.length > 0 ? (
          <>
            {subscriptionList.map((item, index) => (
              <View key={item.id || index} style={{ marginHorizontal: 16, marginBottom: 16 }}>
                {renderSubscriptionItem({ item, index })}
              </View>
            ))}
            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
              <Text style={styles.subscribeButtonText}>Subscribe</Text>
            </TouchableOpacity>
            <View style={{ height: 16 }} />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 32 },
  headerImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT / 2.4 },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: { position: 'absolute', top: 50, left: 16 },
  headerTitle: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 100,
    fontSize: 26,
    fontFamily: FONT.bold,
    color: C.textPrimary,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: C.gray30,
    fontFamily: FONT.regular,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  planCard: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 16,
  },
  planCardActive: {
    borderColor: C.brand5,
  },
  planCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planCardLeft: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 },
  planCardRight: { flex: 2, alignItems: 'flex-end' },
  planName: { fontSize: 18, fontFamily: FONT.bold, color: C.white, flex: 1 },
  planPrice: { fontSize: 20, fontFamily: FONT.bold, color: C.textPrimary },
  planDuration: { fontSize: 13, color: C.gray30, fontFamily: FONT.regular },
  includesRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  includesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  includesChipText: { fontSize: 11, color: C.textPrimary, fontFamily: FONT.semiBold },
  planDescription: { fontSize: 13, color: C.gray30, marginTop: 10, fontFamily: FONT.regular, lineHeight: 20 },
  subscribeButton: {
    backgroundColor: C.brand5,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  subscribeButtonText: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontFamily: FONT.bold, color: C.gray30 },
});
