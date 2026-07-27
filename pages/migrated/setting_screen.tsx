import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface SettingOption {
  icon: string;
  title: string;
  onPress: () => void;
  requireLogin?: boolean;
  visible?: boolean;
}

export default function SettingScreen(props: any) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSocial, setIsSocial] = useState(false);
  const styles = useStyle();

  useEffect(() => {
    // Check login status and social status
    // setIsLoggedIn(userStore.isLoggedIn);
    // setIsSocial(getBoolAsync(IS_SOCIAL));
  }, []);

  const deleteAccount = async () => {
    try {
      // await deleteUserAccountApi();
      // await deleteUserFirebase();
      // await logout();
      // remove stored credentials
      // Navigate to DashboardScreen
      props.navigation.navigate('Home', { screen: 'HomePage' });
    } catch (e: any) {
      // toast(e.toString());
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteAccount,
        },
      ]
    );
  };

  const settings: SettingOption[] = [
    {
      icon: 'barbell-outline',
      title: 'Mi programa',
      onPress: () => props.navigation.navigate('MigratedMyProgramCalendar'),
      requireLogin: true,
    },
    {
      icon: 'settings-outline',
      title: 'Metrics Settings',
      onPress: () => props.navigation.navigate('MigratedProgressSetting'),
      requireLogin: true,
    },
    {
      icon: 'flame-outline',
      title: 'Goal Calories & Macros',
      onPress: () => props.navigation.navigate('MigratedGoalCaloriesMacros'),
      requireLogin: true,
    },
    {
      icon: 'globe-outline',
      title: 'Select Language',
      onPress: () => props.navigation.navigate('MigratedLanguage'),
    },
    {
      icon: 'color-palette-outline',
      title: 'App Themes',
      onPress: () => {
        // Show theme selection dialog
      },
    },
    {
      icon: 'key-outline',
      title: 'Change Password',
      onPress: () => props.navigation.navigate('MigratedChangePwd'),
      visible: !isSocial && isLoggedIn,
    },
    {
      icon: 'trash-outline',
      title: 'Delete Account',
      onPress: handleDeleteAccount,
      requireLogin: true,
    },
  ];

  const renderOption = (option: SettingOption) => {
    if (option.requireLogin && !isLoggedIn) return null;
    if (option.visible === false) return null;

    const isDelete = option.title === 'Delete Account';

    return (
      <TouchableOpacity key={option.title} style={s.optionRow} onPress={option.onPress} activeOpacity={0.6}>
        <View style={s.optionIconContainer}>
          <Ionicons
            name={option.icon as any}
            size={22}
            color={isDelete ? C.red : C.brand5}
          />
        </View>
        <Text style={[s.optionTitle, styles.fontRegular, isDelete && { color: C.red }]}>
          {option.title}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={C.gray50} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, styles.fontBold]}>Settings</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        {settings.map((option, index) => (
          <React.Fragment key={option.title}>
            {renderOption(option)}
            {index < settings.length - 1 && <View style={s.divider} />}
          </React.Fragment>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, color: C.white, flex: 1, textAlign: 'center' },
  scrollContent: { padding: 16 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTitle: { flex: 1, fontSize: 16, color: C.white },
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: 12 },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}
