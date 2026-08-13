import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppIcon from '@components/AppIcon';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { useAuth } from '../../store/AuthContext';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  iconColor?: string;
  iconBg?: string;
  textColor?: string;
  route: string;
  params?: Record<string, any>;
  visible?: boolean;
}

// Fusionado desde MigratedSetting (2026-08-06): esa pantalla intermedia solo
// tenía 2 opciones reales ('Mi programa' y 'Change Password'), el resto era
// placeholder sin persistencia real (Metrics Settings, Goal Calories & Macros,
// App Themes) — se eliminaron en vez de arrastrarlos aquí. Un solo menú en
// vez de Profile → engranaje → Settings → item.
function buildMenuItems(isSocial: boolean): MenuItem[] {
  return [
    { icon: 'person-outline', title: 'Edit Profile', iconBg: C.brand10, route: 'MigratedEditProfile' },
    { icon: 'barbell-outline', title: 'Mi programa', iconBg: 'rgba(255,107,53,0.15)', route: 'MigratedMyProgramCalendar' },
    { icon: 'time-outline', title: 'Workout History', iconBg: C.blue10, route: 'MigratedWorkoutHistory' },
    { icon: 'trending-up', title: 'Progress', iconBg: C.success10, route: 'MigratedProgress' },
    { icon: 'heart-outline', title: 'Favorites', iconBg: C.destructive10, route: 'MigratedFavourite' },
    // Todavía no hay integración real con wearables (backend pendiente) —
    // entrada visible ya, pantalla honesta "Próximamente" en vez de fingir
    // datos, mismo criterio que se aplicó a "Sueño" en el Informe.
    { icon: 'watch-outline', title: 'Dispositivos', iconBg: C.blue10, route: 'MigratedComingSoon', params: { title: 'Dispositivos' } },
    { icon: 'notifications-outline', title: 'Notifications', iconBg: C.warning10, route: 'MigratedNotification' },
    { icon: 'language-outline', title: 'Language', iconBg: C.brand10, route: 'MigratedLanguage' },
    { icon: 'key-outline', title: 'Change Password', iconBg: C.brand10, route: 'MigratedChangePwd', visible: !isSocial },
    { icon: 'information-circle-outline', title: 'About', iconBg: C.brand10, route: 'MigratedAboutApp' },
    { icon: 'log-out-outline', title: 'Sign Out', iconColor: C.destructive, iconBg: C.destructive10, textColor: C.destructive, route: 'Logout' },
  ];
}

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
  const { state, logout } = useAuth();
  const user = state.user;
  const profile = user?.user_profile;

  const userName = user?.display_name || user?.first_name || 'Usuario';
  const userEmail = user?.email || '';
  const userWeight = profile?.weight ? `${profile.weight}` : '--';
  const userHeight = profile?.height ? `${profile.height}` : '--';
  const userAge = profile?.age ? `${profile.age}` : '--';
  const profileImage = user?.profile_image || '';
  const isSocial = user?.login_type != null;
  const menuItems = buildMenuItems(isSocial).filter((item) => item.visible !== false);

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.route === 'Logout') {
      Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres cerrar sesión?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => logout() },
      ]);
      return;
    }
    props.navigation?.navigate(item.route, item.params);
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerRow}>
            <Text style={s.headerTitle}>Profile</Text>
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
          {menuItems.map((item, index) => (
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
  headerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24 },
  headerTitle: { fontSize: 22, fontFamily: FONT.bold, color: C.white },
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
