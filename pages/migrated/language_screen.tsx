import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface LanguageData {
  languageCode: string;
  languageName: string;
  languageImage: string;
}

interface LanguageScreenProps {
  navigation?: any;
  route?: any;
}

const defaultLanguages: LanguageData[] = [
  { languageCode: 'en', languageName: 'English', languageImage: '' },
  { languageCode: 'es', languageName: 'Spanish', languageImage: '' },
  { languageCode: 'fr', languageName: 'French', languageImage: '' },
  { languageCode: 'ar', languageName: 'Arabic', languageImage: '' },
];

export default function LanguageScreen(props: LanguageScreenProps) {
  const { navigation } = props;
  const [selectedCode, setSelectedCode] = useState('en');
  const [languages] = useState<LanguageData[]>(defaultLanguages);

  const styles = useResponsiveStyleSheet({
    container: { flex: 1, backgroundColor: C.bg },
    header: { fontSize: '20@ratio', fontFamily: FONT.bold, color: C.white, padding: '16@ratio' },
    listContent: { padding: '16@ratio' },
    langCard: {
      paddingHorizontal: '16@ratio', paddingVertical: '12@ratio', borderRadius: '12@ratio',
      marginBottom: '16@ratio', borderWidth: 1,
    },
    langCardSelected: { backgroundColor: C.brand5, borderColor: C.brand5 },
    langCardUnselected: { backgroundColor: C.surface, borderColor: C.border },
    langRow: { flexDirection: 'row', alignItems: 'center' },
    langFlag: { width: '32@ratio', height: '32@ratio', borderRadius: '4@ratio', backgroundColor: C.gray70, marginRight: '16@ratio' },
    langName: { flex: 1, fontSize: '16@ratio', fontFamily: FONT.bold },
    langNameSelected: { color: C.white },
    langNameUnselected: { color: C.white },
  });

  const handleSelect = async (item: LanguageData) => {
    setSelectedCode(item.languageCode);
    // API/persist language selection
    // await setValue(SELECTED_LANGUAGE_CODE, item.languageCode);
    // await appStore.setLanguage(item.languageCode, context);
    navigation?.goBack();
  };

  const renderItem = ({ item }: { item: LanguageData }) => {
    const isSelected = selectedCode === item.languageCode;
    return (
      <TouchableOpacity
        style={[styles.langCard, isSelected ? styles.langCardSelected : styles.langCardUnselected]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.langRow}>
          {item.languageImage ? (
            <Image source={{ uri: item.languageImage }} style={styles.langFlag} resizeMode="cover" />
          ) : (
            <View style={styles.langFlag} />
          )}
          <Text style={[styles.langName, isSelected ? styles.langNameSelected : styles.langNameUnselected]}>
            {item.languageName.split(' ')[0]}
          </Text>
          {isSelected ? (
            <Ionicons name="radio-button-on" size={20} color={C.white} />
          ) : (
            <Ionicons name="radio-button-off" size={20} color={C.textPrimary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Select Language</Text>
      <FlatList
        data={languages}
        keyExtractor={(item) => item.languageCode}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}
