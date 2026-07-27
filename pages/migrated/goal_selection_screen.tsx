import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface GoalSelectionScreenProps {
  navigation?: any;
  route?: any;
}

export default function GoalSelectionScreen(props: GoalSelectionScreenProps) {
  const { navigation, route } = props;
  const step = route?.params?.step || 5;

  const [isLoading, setIsLoading] = useState(false);

  const styles = useResponsiveStyleSheet({
    container: { flex: 1, backgroundColor: C.bg },
    header: { fontSize: '20@ratio', fontFamily: FONT.bold, color: C.white, padding: '16@ratio' },
    content: { flex: 1, padding: '16@ratio' },
    placeholder: { fontSize: '16@ratio', fontFamily: FONT.regular, color: C.textSecondary, textAlign: 'center', marginTop: '40@ratio' },
    loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  });

  const getTitle = () => {
    if (step === 5) return 'Goal';
    if (step === 6) return 'Activity Level';
    if (step === 7) return 'Macros Diet Type';
    return '';
  };

  const confirmAndUpdate = async (data: Record<string, any>) => {
    Alert.alert(
      'Recalculate',
      'Do you want us to recalculate your calories and macros according to your new information?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            setIsLoading(true);
            try {
              // API call placeholder: updateProfileApi(req)
              // await getUSerDetail(...)
              Alert.alert('Success', 'Updated successfully');
              navigation?.goBack();
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Something went wrong');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderStep5 = () => (
    <View style={styles.content}>
      <Text style={styles.placeholder}>Step 5 - Goal Selection Component</Text>
      {/* SignUpStep5Component would be rendered here */}
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.content}>
      <Text style={styles.placeholder}>Step 6 - Activity Level Component</Text>
      {/* SignUpStep6Component would be rendered here */}
    </View>
  );

  const renderStep7 = () => (
    <View style={styles.content}>
      <Text style={styles.placeholder}>Step 7 - Macros Diet Type Component</Text>
      {/* SignUpStep7Component would be rendered here */}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>{getTitle()}</Text>
      {step === 5 && renderStep5()}
      {step === 6 && renderStep6()}
      {step === 7 && renderStep7()}
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.brand5} />
        </View>
      )}
    </SafeAreaView>
  );
}
