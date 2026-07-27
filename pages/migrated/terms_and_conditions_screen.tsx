import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';

export default function TermsAndConditionsScreen(props: any) {
  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Terms of Services</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentCard}>
          <Text style={styles.htmlContent}>
            {`Terms and Conditions\n\n` +
              `Welcome to MightyFitness. By using our application, you agree to the following terms and conditions.\n\n` +
              `1. Acceptance of Terms\n` +
              `By accessing or using the MightyFitness application, you agree to be bound by these Terms and Conditions.\n\n` +
              `2. Use of the Application\n` +
              `You may use this application for personal, non-commercial purposes only.\n\n` +
              `3. User Accounts\n` +
              `You are responsible for maintaining the confidentiality of your account credentials.\n\n` +
              `4. Privacy\n` +
              `Your use of this application is also governed by our Privacy Policy.\n\n` +
              `5. Subscriptions\n` +
              `Paid subscriptions are billed in advance on a recurring basis. You may cancel at any time.`}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    gap: 12,
  },
  appBarTitle: { fontSize: 20, fontFamily: FONT.bold, color: C.white },
  scrollContent: { paddingHorizontal: 8, paddingBottom: 20 },
  contentCard: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 16,
  },
  htmlContent: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: C.gray10,
    lineHeight: 22,
  },
});
