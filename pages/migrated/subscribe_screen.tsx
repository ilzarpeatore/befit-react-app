import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SubscribeScreen(props: any) {
  const [subscriptionList, setSubscriptionList] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getPackageData();
  }, []);

  const getPackageData = async () => {
    setIsLoading(true);
    try {
      // const value = await getSubscription();
      // setNumPage(value.pagination.totalPages);
      // if (page === 1) setSubscriptionList([]);
      // setSubscriptionList(prev => [...prev, ...value.data]);
      setIsLoading(false);
    } catch (e) {
      setIsLastPage(true);
      setIsLoading(false);
    }
  };

  const paymentConfirm = async (id?: number) => {
    setIsLoading(true);
    const req = {
      package_id: id,
      payment_status: 'paid',
      payment_type: 'free',
      txn_id: '',
      transaction_detail: '',
    };
    try {
      // await subscribePackageApi(req);
      // await getUSerDetail(...);
      setIsLoading(false);
      props.navigation.goBack();
    } catch (e) {
      setIsLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (selectedIndex === -1) {
      Alert.alert('Please select a plan to continue');
      return;
    }
    const selected = subscriptionList[selectedIndex];
    if (selected.price === 0) {
      paymentConfirm(selected.id);
    } else {
      props.navigation.navigate('MigratedPayment', { mSubscriptionModel: selected });
    }
  };

  const renderSubscriptionItem = ({ item, index }: { item: any; index: number }) => (
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
            color={C.brand5}
          />
          <Text style={styles.planName} numberOfLines={2}>{item.name || ''}</Text>
        </View>
        <View style={styles.planCardRight}>
          <Text style={styles.planPrice}>${item.price?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.planDuration}>
            / {item.duration} {item.durationUnit === 'monthly' ? 'month' : 'year'}
          </Text>
        </View>
      </View>
      <Text style={styles.planDescription}>{item.description || ''}</Text>
    </TouchableOpacity>
  );

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
          <ActivityIndicator size="large" color={C.brand5} style={{ marginTop: 30 }} />
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
    color: C.brand5,
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
  planPrice: { fontSize: 20, fontFamily: FONT.bold, color: C.brand5 },
  planDuration: { fontSize: 13, color: C.gray30, fontFamily: FONT.regular },
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
