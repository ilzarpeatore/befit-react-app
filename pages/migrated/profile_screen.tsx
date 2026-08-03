import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppIcon from '@components/AppIcon';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  iconColor?: string;
  iconBg?: string;
  textColor?: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'person-outline', title: 'Edit Profile', iconBg: C.brand10, route: 'MigratedEditProfile' },
  { icon: 'heart-outline', title: 'Favorites', iconBg: C.destructive10, route: 'Favourites' },
  { icon: 'time-outline', title: 'Workout History', iconBg: C.blue10, route: 'WorkoutHistory' },
  { icon: 'trending-up', title: 'Progress', iconBg: C.success10, route: 'Progress' },
  { icon: 'notifications-outline', title: 'Notifications', iconBg: C.warning10, route: 'Notifications' },
  { icon: 'language-outline', title: 'Language', iconBg: C.brand10, route: 'Language' },
  { icon: 'information-circle-outline', title: 'About', iconBg: C.brand10, route: 'AboutApp' },
  { icon: 'log-out-outline', title: 'Sign Out', iconColor: C.destructive, iconBg: C.destructive10, textColor: C.destructive, route: 'Logout' },
];

interface StatTileProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function StatTile({ label, value, icon }: StatTileProps) {
  return (
    <View style={s.statTile}>
      <AppIcon name={icon} size={20} color={C.orange} bg="rgba(255,107,53,0.15)" containerSize={40} style={{ marginBottom: 8 }} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen(props: any) {

  const [userName] = useState('User');
  const [userEmail] = useState('user@example.com');
  const [userWeight] = useState('70');
  const [userHeight] = useState('175');
  const [userAge] = useState('25');
  const [profileImage] = useState('');

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.route === 'Logout') {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            props.navigation?.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]);
      return;
    }
    props.navigation?.navigate(item.route);
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerRow}>
            <Text style={s.headerTitle}>Profile</Text>
            <TouchableOpacity style={s.settingsBtn} onPress={() => props.navigation?.navigate('MigratedSetting')}>
              <Ionicons name="settings-outline" size={22} color={C.gray30} />
            </TouchableOpacity>
          </View>
          <View style={s.avatarSection}>
            <View style={s.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={s.avatarImage} />
              ) : (
                <Ionicons name="person" size={40} color={C.gray30} />
              )}
            </View>
            <TouchableOpacity style={s.editAvatarBtn} onPress={() => props.navigation?.navigate('MigratedEditProfile')}>
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={s.profileName}>{userName}</Text>
          <Text style={s.profileEmail}>{userEmail}</Text>
        </View>

        <View style={s.statsRow}>
          <StatTile label="Weight" value={`${userWeight} kg`} icon="scale-outline" />
          <StatTile label="Height" value={`${userHeight} cm`} icon="resize-outline" />
          <StatTile label="Age" value={userAge} icon="calendar-outline" />
        </View>

        <View style={s.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity key={index} style={s.menuItem} onPress={() => handleMenuItemPress(item)}>
              <AppIcon
                name={item.icon}
                size={22}
                color={item.iconColor ?? C.textPrimary}
                bg={item.iconBg ?? C.brand10}
                containerSize={40}
                borderRadius={12}
              />
              <Text style={[s.menuLabel, item.textColor ? { color: item.textColor } : null]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={C.gray50} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 32 },
  header: { backgroundColor: C.gray80, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24, alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 24 },
  headerTitle: { fontSize: 22, fontFamily: FONT.bold, color: C.white },
  settingsBtn: { padding: 10, backgroundColor: C.surfaceLight, borderRadius: 12 },
  avatarSection: { position: 'relative', marginBottom: 16 },
  avatarContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.surfaceLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.gray80 },
  profileName: { fontSize: 20, fontFamily: FONT.bold, color: C.white },
  profileEmail: { fontSize: 14, color: C.gray30, marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 24 },
  statTile: { flex: 1, alignItems: 'center', backgroundColor: C.gray80, borderRadius: 14, paddingVertical: 16, marginHorizontal: 4 },
  statValue: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  statLabel: { fontSize: 12, color: C.gray30, marginTop: 4 },
  menuSection: { paddingHorizontal: 20, marginTop: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.gray80, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8 },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: FONT.medium, color: C.white, marginLeft: 16 },
});
