import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import logger from '@helper/logger';

interface PaymentGateway {
  type: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const PAYMENT_GATEWAYS: PaymentGateway[] = [
  { type: 'stripe', label: 'Stripe', icon: 'card-outline' },
  { type: 'razorpay', label: 'Razorpay', icon: 'flash-outline' },
  { type: 'paystack', label: 'Paystack', icon: 'wallet-outline' },
  { type: 'paypal', label: 'PayPal', icon: 'logo-paypal' as any },
  { type: 'flutterwave', label: 'Flutterwave', icon: 'trending-up-outline' },
  { type: 'paytabs', label: 'PayTabs', icon: 'document-text-outline' },
  { type: 'myfatoorah', label: 'MyFatoorah', icon: 'receipt-outline' },
  { type: 'paytm', label: 'Paytm', icon: 'phone-portrait-outline' },
  { type: 'orange_money', label: 'Orange Money', icon: 'color-fill-outline' },
];

function getRandomString(length: number): string {
  const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function PaymentScheduledScreen(props: any) {
  const subscriptionModel = props.route?.params?.mSubscriptionModel ?? null;
  const price = props.route?.params?.price ?? '0';
  const scheduledId = props.route?.params?.sceduledId ?? '';

  const [paymentList, setPaymentList] = useState<PaymentGateway[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    paymentListApiCall();
  }, []);

  const paymentListApiCall = async () => {
    setIsLoading(true);
    try {
      // API call placeholder: getPaymentApi()
      // const value = await getPaymentApi();
      // setPaymentList(value.data);
    } catch (e) {
      logger.error('Payment list error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const paymentConfirm = async () => {
    setIsLoading(true);
    try {
      const req = { class_schedule_id: scheduledId };
      // API call placeholder: getClassSchedulePlan(req)
      // const value = await getClassSchedulePlan(req);
      Alert.alert('Success', 'Payment confirmed successfully');
      props.navigation?.goBack();
    } catch (e) {
      Alert.alert('Error', 'Payment confirmation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async () => {
    if (!selectedPaymentType) {
      Alert.alert('Select Payment', 'Please select a payment method');
      return;
    }
    setIsLoading(true);
    try {
      // Dispatch to appropriate payment handler based on selectedPaymentType
      // Each payment method has its own SDK integration
      await paymentConfirm();
    } catch (e) {
      Alert.alert('Error', 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle}>Payments</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={s.body}>
        {isLoading ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        ) : paymentList.length > 0 ? (
          <ScrollView contentContainerStyle={s.paymentList}>
            {paymentList.map((gw, index) => (
              <TouchableOpacity
                key={index}
                style={[s.paymentItem, selectedPaymentType === gw.type && s.paymentItemSelected]}
                onPress={() => setSelectedPaymentType(gw.type)}
              >
                <Ionicons name={gw.icon} size={24} color={selectedPaymentType === gw.type ? C.orange : C.gray30} />
                <Text style={[s.paymentLabel, selectedPaymentType === gw.type && s.paymentLabelSelected]}>{gw.label}</Text>
                {selectedPaymentType === gw.type && <Ionicons name="checkmark-circle" size={22} color={C.success} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={s.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color={C.gray50} />
            <Text style={s.emptyText}>No payment methods available</Text>
          </View>
        )}
      </View>
      {paymentList.length > 0 && (
        <View style={s.footer}>
          <TouchableOpacity style={s.payBtn} onPress={handlePay} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <Text style={s.payBtnText}>Pay</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, backgroundColor: C.surface },
  backBtn: { padding: 4 },
  appBarTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  body: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  paymentList: { padding: 16 },
  paymentItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: C.surface, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  paymentItemSelected: { borderColor: C.brand5, backgroundColor: C.surfaceLight },
  paymentLabel: { flex: 1, fontSize: 16, fontFamily: FONT.medium, color: C.gray40, marginLeft: 16 },
  paymentLabelSelected: { color: C.white },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, fontFamily: FONT.medium, color: C.gray40, marginTop: 16 },
  footer: { padding: 16 },
  payBtn: { backgroundColor: C.brand5, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  payBtnText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
});