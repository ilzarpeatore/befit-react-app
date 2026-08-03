import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface MissingDetailsScreenProps {
  navigation?: any;
  route?: any;
}

export default function MissingDetailsScreen(props: MissingDetailsScreenProps) {
  const { navigation } = props;
  const [signUpIndex, setSignUpIndex] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  const styles = useResponsiveStyleSheet({
    container: { flex: 1, backgroundColor: C.bg },
    header: { fontSize: '20@ratio', fontFamily: FONT.bold, color: C.white, padding: '16@ratio' },
    content: { flex: 1, padding: '16@ratio' },
    placeholder: { fontSize: '16@ratio', fontFamily: FONT.regular, color: C.textSecondary, textAlign: 'center', marginTop: '40@ratio' },
    loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  });

  useEffect(() => {
    setSignUpIndex(4);
  }, []);

  const updateProfile = async () => {
    setIsLoading(true);
    try {
      // API call placeholder: updateProfileApi(req)
      navigation?.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Add Details</Text>
      <View style={styles.content}>
        {signUpIndex === 4 && (
          <View style={{ flex: 1 }}>
            <Text style={styles.placeholder}>Step 5 - Goal Selection (SignUpStep5Component)</Text>
            {/* SignUpStep5Component would be rendered here */}
          </View>
        )}
        {signUpIndex === 5 && (
          <View style={{ flex: 1 }}>
            <Text style={styles.placeholder}>Step 6 - Activity Level (SignUpStep6Component)</Text>
            {/* SignUpStep6Component would be rendered here */}
          </View>
        )}
        {signUpIndex === 6 && (
          <View style={{ flex: 1 }}>
            <Text style={styles.placeholder}>Step 7 - Macros Diet (SignUpStep7Component)</Text>
            {/* SignUpStep7Component with onSave={updateProfile} would be rendered here */}
          </View>
        )}
      </View>
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      )}
    </SafeAreaView>
  );
}
