import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingPageData {
  image: string;
  title: string;
  subtitle: string;
  showButtons?: boolean;
}

const PAGES: OnboardingPageData[] = [
  {
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    title: 'Welcome to the ultimate sandow UI Kit!',
    subtitle: 'Intelligent fitness to enhance and grow your endurance, anytime anywhere.',
    showButtons: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1552674605-4695232af341?w=800',
    title: 'Personalized Smart Fitness Score',
    subtitle: 'Get a fitness score tailored to your unique health and lifestyle.',
  },
  {
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    title: 'Daily Activity Recommendations',
    subtitle: 'Receive AI-powered suggestions to optimize your daily workouts.',
  },
  {
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    title: 'Fitness Metrics That Understands You',
    subtitle: 'Track progress with intelligent insights designed around your body and goals.',
  },
  {
    image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800',
    title: 'Meet Your Empowering AI Coach Companion',
    subtitle: 'Your AI-powered coach is here to guide, motivate, and support your journey.',
  },
  {
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800',
    title: 'Find Your Perfect Fitness Coach.',
    subtitle: 'Connect with expert coaches who match your fitness style and goals.',
  },
  {
    image: 'https://images.unsplash.com/photo-1576678927484-cc9070f47553?w=800',
    title: 'Browse Myriads Of Workout Libraries',
    subtitle: 'Access a vast collection of workouts suited for all levels and goals.',
  },
  {
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba22561?w=800',
    title: 'Nutrition & Meal Management For You',
    subtitle: 'Get personalized meal plans and nutrition insights to fuel your progress.',
  },
  {
    image: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=800',
    title: 'Track & Analyze Your Sleep Quality',
    subtitle: 'Monitor your sleep patterns and get insights to improve rest and recovery.',
  },
  {
    image: 'https://images.unsplash.com/photo-1552674605-4695232af341?w=800',
    title: 'Explore Fitness Community, Resources',
    subtitle: 'Join a supportive community and access valuable fitness content.',
  },
  {
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    title: 'Unlock Achievements & Health Challenges',
    subtitle: 'Stay motivated with rewards, challenges, and milestone achievements.',
  },
];

export default function WalkThroughScreen(props: any) {
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLastPage = currentPage === PAGES.length - 1;

  const nextPage = () => {
    if (currentPage < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      flatListRef.current?.scrollToIndex({ index: currentPage - 1, animated: true });
    }
  };

  const finishOnboarding = () => {
    // AsyncStorage.setItem(IS_FIRST_TIME, 'true');
    // if (userStore.loginRequired) {
    //   props.navigation?.navigate('WelcomeAuthScreen');
    // } else {
    //   props.navigation?.navigate('DashboardScreen');
    // }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].index);
    }
  }).current;

  const renderPage = ({ item }: { item: OnboardingPageData }) => (
    <View style={styles.pageContainer}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.pageImage} resizeMode="cover" />
      </View>
      <Text style={styles.pageTitle}>{item.title}</Text>
      <Text style={styles.pageSubtitle}>{item.subtitle}</Text>
      {item.showButtons && (
        <>
          <TouchableOpacity style={styles.getStartedBtn} onPress={finishOnboarding}>
            <LinearGradient
              colors={[C.orange || C.brand5, C.brand60]}
              style={styles.getStartedBtnInner}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={finishOnboarding}>
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInBold}>Sign In.</Text>
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <View />
        {!isLastPage && (
          <TouchableOpacity onPress={finishOnboarding}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.body}>
        <FlatList
          ref={flatListRef}
          data={PAGES}
          renderItem={renderPage}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navBtn, currentPage > 0 ? styles.navBtnActive : styles.navBtnInactive]}
          onPress={currentPage > 0 ? previousPage : undefined}
          disabled={currentPage === 0}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentPage > 0 ? C.orange || C.brand5 : C.gray30}
          />
        </TouchableOpacity>

        <View style={styles.pagination}>
          {PAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentPage === index ? styles.dotActive : styles.dotInactive,
                currentPage === index && { width: 20 },
              ]}
            />
          ))}
        </View>

        {isLastPage ? (
          <TouchableOpacity style={styles.getStartedFooterBtn} onPress={finishOnboarding}>
            <LinearGradient
              colors={[C.orange || C.brand5, C.brand60]}
              style={styles.getStartedFooterBtnInner}
            >
              <Text style={styles.getStartedFooterText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.navBtn, styles.navBtnActive]} onPress={nextPage}>
            <Ionicons name="chevron-forward" size={20} color={C.orange || C.brand5} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  skipText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: C.gray30,
  },
  body: { flex: 1 },
  pageContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    flex: 3,
    backgroundColor: C.surfaceLight,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  pageTitle: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: C.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  pageSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  getStartedBtn: {
    width: '100%',
    height: 56,
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  getStartedBtnInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  getStartedText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: C.white,
  },
  signInText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  signInBold: {
    fontFamily: FONT.bold,
    color: C.orange || C.brand5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnActive: {
    backgroundColor: C.surfaceLight,
  },
  navBtnInactive: {
    backgroundColor: C.surface,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: C.orange || C.brand5,
  },
  dotInactive: {
    width: 8,
    backgroundColor: C.gray70,
  },
  getStartedFooterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  getStartedFooterBtnInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedFooterText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: C.white,
  },
});
