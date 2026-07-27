import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ScreenItem {
  name: string;
  route: string | null;
  category: string;
}

const ALL_SCREENS: ScreenItem[] = [
  // === ORIGINAL INTEGRATED ===
  { name: 'Welcome Auth', route: 'WelcomeAuth', category: 'Original - Auth' },
  { name: 'Login', route: 'LoginAuth', category: 'Original - Auth' },
  { name: 'Register Flow', route: 'RegisterFlow', category: 'Original - Auth' },
  { name: 'Forgot Password Options', route: 'ForgotOptions', category: 'Original - Auth' },
  { name: 'Forgot Password Email', route: 'ForgotEmail', category: 'Original - Auth' },
  { name: 'Password Reset Sent', route: 'ResetSent', category: 'Original - Auth' },
  { name: 'Profile Edit', route: 'ProfileEdit', category: 'Original - Auth' },
  { name: 'Change Password', route: 'ChangePassword', category: 'Original - Auth' },
  { name: 'Home', route: 'HomePage', category: 'Original - Tabs' },
  { name: 'Club', route: 'Club', category: 'Original - Tabs' },
  { name: 'Challenges', route: 'Challenges', category: 'Original - Tabs' },
  { name: 'Today', route: 'Today', category: 'Original - Tabs' },
  { name: 'Workout', route: 'Workout', category: 'Original - Main' },
  { name: 'Profile', route: 'Profile', category: 'Original - Main' },
  { name: 'Unboarding', route: 'Unboard', category: 'Original - Onboarding' },
  { name: 'Name', route: 'Name', category: 'Original - Onboarding' },
  { name: 'Weight', route: 'Weight', category: 'Original - Onboarding' },
  { name: 'Height', route: 'Height', category: 'Original - Onboarding' },
  { name: 'Congratulation', route: 'Congratulation', category: 'Original - Main' },
  { name: 'Result', route: 'Result', category: 'Original - Main' },
  { name: 'Workout List', route: 'WorkoutList', category: 'Original - Workout' },
  { name: 'Workout Detail', route: 'WorkoutDetail', category: 'Original - Workout' },
  { name: 'Workout Day Exercises', route: 'WorkoutDayExercises', category: 'Original - Workout' },
  { name: 'Exercise List', route: 'ExerciseList', category: 'Original - Exercise' },
  { name: 'Exercise Detail', route: 'ExerciseDetail', category: 'Original - Exercise' },
  { name: 'Diet Dashboard', route: 'DietDashboard', category: 'Original - Diet' },
  { name: 'Diet List', route: 'DietList', category: 'Original - Diet' },
  { name: 'Recipe Detail', route: 'RecipeDetail', category: 'Original - Diet' },
  { name: 'Daily Plan', route: 'DailyPlan', category: 'Original - Diet' },
  { name: 'Community Feed', route: 'CommunityFeed', category: 'Original - Social' },
  { name: 'Post Detail', route: 'PostDetail', category: 'Original - Social' },
  { name: 'Profile Stats', route: 'ProfileStats', category: 'Original - Profile' },
  { name: 'Settings', route: 'Settings', category: 'Original - Profile' },
  { name: 'Favourite Workouts', route: 'FavouriteWorkouts', category: 'Original - Profile' },

  // === MIGRATED - ROOT ===
  { name: 'About App', route: 'MigratedAboutApp', category: 'Migrated - Info' },
  { name: 'About Us', route: 'MigratedAboutUs', category: 'Migrated - Info' },
  { name: 'Privacy Policy', route: 'MigratedPrivacyPolicy', category: 'Migrated - Info' },
  { name: 'Terms & Conditions', route: 'MigratedTermsAndConditions', category: 'Migrated - Info' },
  { name: 'Activity Tracker', route: 'MigratedActivityTracker', category: 'Migrated - Health' },
  { name: 'Sleep Monitoring', route: 'MigratedSleepMonitoring', category: 'Migrated - Health' },
  { name: 'Steps Count', route: 'MigratedStepsCount', category: 'Migrated - Health' },
  { name: 'Water Tracker', route: 'MigratedWaterTracker', category: 'Migrated - Health' },
  { name: 'Water Reminders', route: 'MigratedWaterReminders', category: 'Migrated - Health' },
  { name: 'Meals Reminders', route: 'MigratedMealsReminders', category: 'Migrated - Health' },
  { name: 'Meals Water Reminder', route: 'MigratedMealsWaterReminder', category: 'Migrated - Health' },
  { name: 'Set Reminder', route: 'MigratedSetReminder', category: 'Migrated - Health' },
  { name: 'Reminder', route: 'MigratedReminder', category: 'Migrated - Health' },
  { name: 'Home Modern', route: 'MigratedHomeModern', category: 'Migrated - Dashboard' },
  { name: 'Main Goal', route: 'MigratedMainGoal', category: 'Migrated - Onboarding' },
  { name: 'Goal Selection', route: 'MigratedGoalSelection', category: 'Migrated - Onboarding' },
  { name: 'Goal Calories Macros', route: 'MigratedGoalCaloriesMacros', category: 'Migrated - Onboarding' },
  { name: 'Exercise Duration', route: 'MigratedExerciseDuration', category: 'Migrated - Onboarding' },
  { name: 'Exercise Duration Cast', route: 'MigratedExerciseDurationCast', category: 'Migrated - Onboarding' },
  { name: 'Splash', route: 'MigratedSplash', category: 'Migrated - Onboarding' },
  { name: 'Walk Through', route: 'MigratedWalkThrough', category: 'Migrated - Onboarding' },
  { name: 'Missing Details', route: 'MigratedMissingDetails', category: 'Migrated - Onboarding' },
  { name: 'Workout List (migrated)', route: 'MigratedViewWorkouts', category: 'Migrated - Workout' },
  { name: 'Workout Detail (migrated)', route: 'MigratedWorkoutDetail', category: 'Migrated - Workout' },
  { name: 'Full Workout', route: 'MigratedFullWorkout', category: 'Migrated - Workout' },
  { name: 'Filter Workout', route: 'MigratedFilterWorkout', category: 'Migrated - Workout' },
  { name: 'Workout History', route: 'MigratedWorkoutHistory', category: 'Migrated - Workout' },
  { name: 'Exercise List (migrated)', route: 'MigratedExerciseList', category: 'Migrated - Exercise' },
  { name: 'Exercise Detail (migrated)', route: 'MigratedExerciseDetail', category: 'Migrated - Exercise' },
  { name: 'Exercise History', route: 'MigratedExerciseHistory', category: 'Migrated - Exercise' },
  { name: 'View Body Parts', route: 'MigratedViewBodyPart', category: 'Migrated - Exercise' },
  { name: 'View Equipment', route: 'MigratedViewEquipment', category: 'Migrated - Exercise' },
  { name: 'View Level', route: 'MigratedViewLevel', category: 'Migrated - Exercise' },
  { name: 'Search', route: 'MigratedSearch', category: 'Migrated - Exercise' },
  { name: 'Diet Screen', route: 'MigratedDiet', category: 'Migrated - Diet' },
  { name: 'Diet Screen Sandow', route: 'MigratedDietSandow', category: 'Migrated - Diet' },
  { name: 'Diet Detail', route: 'MigratedDietDetail', category: 'Migrated - Diet' },
  { name: 'View All Diet', route: 'MigratedViewAllDiet', category: 'Migrated - Diet' },
  { name: 'View Diet Category', route: 'MigratedViewDietCategory', category: 'Migrated - Diet' },
  { name: 'Favourite Recipe', route: 'MigratedFavouriteRecipe', category: 'Migrated - Diet' },
  { name: 'Daily Plan Recipe List', route: 'MigratedDailyPlanRecipeList', category: 'Migrated - Diet' },
  { name: 'Plan Screen', route: 'MigratedPlan', category: 'Migrated - Diet' },
  { name: 'Recipe Main', route: 'MigratedRecipeMain', category: 'Migrated - Recipes' },
  { name: 'Recipe List V2', route: 'MigratedRecipeListV2', category: 'Migrated - Recipes' },
  { name: 'Recipe Category List', route: 'MigratedRecipeCategoryList', category: 'Migrated - Recipes' },
  { name: 'Recipe Tag List', route: 'MigratedRecipeTagList', category: 'Migrated - Recipes' },
  { name: 'Product Screen', route: 'MigratedProduct', category: 'Migrated - Products' },
  { name: 'Product Detail', route: 'MigratedProductDetail', category: 'Migrated - Products' },
  { name: 'View All Product', route: 'MigratedViewAllProduct', category: 'Migrated - Products' },
  { name: 'View Product Category', route: 'MigratedViewProductCategory', category: 'Migrated - Products' },
  { name: 'Shopping List', route: 'MigratedShoppingList', category: 'Migrated - Shopping' },
  { name: 'Shopping List Detail', route: 'MigratedShoppingListDetail', category: 'Migrated - Shopping' },
  { name: 'Add Shopping List', route: 'MigratedAddShoppingList', category: 'Migrated - Shopping' },
  { name: 'Community (migrated)', route: 'MigratedCommunity', category: 'Migrated - Social' },
  { name: 'Post Details', route: 'MigratedPostDetails', category: 'Migrated - Social' },
  { name: 'Other User Profile', route: 'MigratedOtherUserProfile', category: 'Migrated - Social' },
  { name: 'Bookmark', route: 'MigratedBookmark', category: 'Migrated - Social' },
  { name: 'Add Post', route: 'MigratedAddPost', category: 'Migrated - Social' },
  { name: 'Blog Screen', route: 'MigratedBlog', category: 'Migrated - Content' },
  { name: 'Blog Detail', route: 'MigratedBlogDetail', category: 'Migrated - Content' },
  { name: 'View All Blog', route: 'MigratedViewAllBlog', category: 'Migrated - Content' },
  { name: 'Tips', route: 'MigratedTips', category: 'Migrated - Content' },
  { name: 'Video Screen', route: 'MigratedVideo', category: 'Migrated - Content' },
  { name: 'Video Detail', route: 'MigratedVideoDetail', category: 'Migrated - Content' },
  { name: 'YouTube Player', route: 'MigratedYoutubePlayer', category: 'Migrated - Content' },
  { name: 'Chewie Player', route: 'MigratedChewie', category: 'Migrated - Content' },
  { name: 'Web View', route: 'MigratedWebView', category: 'Migrated - Content' },
  { name: 'Assign', route: 'MigratedAssign', category: 'Migrated - Misc' },
  { name: 'Favourite Screen', route: 'MigratedFavourite', category: 'Migrated - Misc' },
  { name: 'Progress', route: 'MigratedProgress', category: 'Migrated - Progress' },
  { name: 'Progress Detail', route: 'MigratedProgressDetail', category: 'Migrated - Progress' },
  { name: 'Progress Setting', route: 'MigratedProgressSetting', category: 'Migrated - Progress' },
  { name: 'Profile (migrated)', route: 'MigratedProfile', category: 'Migrated - Profile' },
  { name: 'Profile Sandow', route: 'MigratedProfileSandow', category: 'Migrated - Profile' },
  { name: 'Edit Profile', route: 'MigratedEditProfile', category: 'Migrated - Profile' },
  { name: 'Setting (migrated)', route: 'MigratedSetting', category: 'Migrated - Profile' },
  { name: 'Language', route: 'MigratedLanguage', category: 'Migrated - Profile' },
  { name: 'Notification', route: 'MigratedNotification', category: 'Migrated - Profile' },
  { name: 'Schedule', route: 'MigratedSchedule', category: 'Migrated - Schedule' },
  { name: 'My Program Calendar', route: 'MigratedMyProgramCalendar', category: 'Migrated - Schedule' },
  { name: 'Subscribe', route: 'MigratedSubscribe', category: 'Migrated - Payment' },
  { name: 'Subscription Detail', route: 'MigratedSubscriptionDetail', category: 'Migrated - Payment' },
  { name: 'Payment', route: 'MigratedPayment', category: 'Migrated - Payment' },
  { name: 'Payment Scheduled', route: 'MigratedPaymentScheduled', category: 'Migrated - Payment' },
  { name: 'No Data', route: 'MigratedNoData', category: 'Migrated - Misc' },
  { name: 'No Internet', route: 'MigratedNoInternet', category: 'Migrated - Misc' },

  // === MIGRATED - AUTH ===
  { name: 'Forgot Password', route: 'MigratedForgotPwd', category: 'Migrated - Auth' },
  { name: 'OTP', route: 'MigratedOTP', category: 'Migrated - Auth' },
  { name: 'Verify OTP', route: 'MigratedVerifyOtp', category: 'Migrated - Auth' },
  { name: 'Sign In Sandow', route: 'MigratedSignInSandow', category: 'Migrated - Auth' },
  { name: 'Sign Up Sandow', route: 'MigratedSignUpSandow', category: 'Migrated - Auth' },
  { name: 'Change Pwd', route: 'MigratedChangePwd', category: 'Migrated - Auth' },

  // === MIGRATED - HOME (Health Tracking) ===
  { name: 'Home Empty', route: 'MigratedHomeEmpty', category: 'Migrated - Home' },
  { name: 'Emparejando', route: 'MigratedEmparejando', category: 'Migrated - Home' },
  { name: 'Device Connected', route: 'MigratedDeviceConnected', category: 'Migrated - Home' },
  { name: 'Link Device Choice', route: 'MigratedLinkDeviceChoice', category: 'Migrated - Home' },
  { name: 'Link Device List', route: 'MigratedLinkDeviceList', category: 'Migrated - Home' },
  { name: 'Fitness Metrics', route: 'MigratedFitnessMetrics', category: 'Migrated - Home' },
  { name: 'Health Metric Insight', route: 'MigratedHealthMetricInsight', category: 'Migrated - Home' },
  { name: 'Manage Health Metrics', route: 'MigratedManageHealthMetrics', category: 'Migrated - Home' },
  { name: 'Heart Rate', route: 'MigratedHeartRate', category: 'Migrated - Heart Rate' },
  { name: 'Heart Rate Details', route: 'MigratedHeartRateDetails', category: 'Migrated - Heart Rate' },
  { name: 'Heart Rate History', route: 'MigratedHeartRateHistory', category: 'Migrated - Heart Rate' },
  { name: 'Heart Rate Insight', route: 'MigratedHeartRateInsight', category: 'Migrated - Heart Rate' },
  { name: 'Heart Rate Zones', route: 'MigratedHeartRateZones', category: 'Migrated - Heart Rate' },
  { name: 'Sandow Score', route: 'MigratedSandowScore', category: 'Migrated - Sandow' },
  { name: 'Score Breakdown', route: 'MigratedScoreBreakdown', category: 'Migrated - Sandow' },
  { name: 'Steps', route: 'MigratedSteps', category: 'Migrated - Steps' },
  { name: 'Steps Details', route: 'MigratedStepsDetails', category: 'Migrated - Steps' },
  { name: 'Steps History', route: 'MigratedStepsHistory', category: 'Migrated - Steps' },
  { name: 'Steps Insight', route: 'MigratedStepsInsight', category: 'Migrated - Steps' },
  { name: 'Steps Logged', route: 'MigratedStepsLogged', category: 'Migrated - Steps' },
  { name: 'Step Goal', route: 'MigratedStepGoal', category: 'Migrated - Steps' },
  { name: 'Step Goal Completed', route: 'MigratedStepGoalCompleted', category: 'Migrated - Steps' },
  { name: 'Log Steps Form', route: 'MigratedLogStepsForm', category: 'Migrated - Steps' },
  { name: 'Weight (migrated)', route: 'MigratedWeight', category: 'Migrated - Weight' },
  { name: 'Weight Details', route: 'MigratedWeightDetails', category: 'Migrated - Weight' },
  { name: 'Weight History', route: 'MigratedWeightHistory', category: 'Migrated - Weight' },
  { name: 'Weight Insight', route: 'MigratedWeightInsight', category: 'Migrated - Weight' },
  { name: 'Weight Deadline', route: 'MigratedWeightDeadline', category: 'Migrated - Weight' },
  { name: 'Weight Goal Set', route: 'MigratedWeightSetGoal', category: 'Migrated - Weight' },
  { name: 'Weight Goal Summary', route: 'MigratedWeightGoalSummary', category: 'Migrated - Weight' },
  { name: 'Weight Goal Completed', route: 'MigratedWeightGoalCompleted', category: 'Migrated - Weight' },
  { name: 'Weight Lose Gain Choice', route: 'MigratedWeightLoseGainChoice', category: 'Migrated - Weight' },
  { name: 'Weight Reminder', route: 'MigratedWeightReminder', category: 'Migrated - Weight' },
  { name: 'Log Weight Form', route: 'MigratedLogWeightForm', category: 'Migrated - Weight' },
  { name: 'Log Weight Keyboard', route: 'MigratedLogWeightKeyboard', category: 'Migrated - Weight' },

  // === MIGRATED - ONBOARDING ===
  { name: 'Onboarding (migrated)', route: 'MigratedOnboarding', category: 'Migrated - Onboard Flow' },
  { name: 'Profile Setup Intro', route: 'MigratedProfileSetupIntro', category: 'Migrated - Onboard Flow' },
  { name: 'Profile Setup Form', route: 'MigratedProfileSetupForm', category: 'Migrated - Onboard Flow' },
  { name: 'Avatar Setup', route: 'MigratedAvatarSetup', category: 'Migrated - Onboard Flow' },
  { name: 'Choose Plan', route: 'MigratedChoosePlan', category: 'Migrated - Onboard Flow' },
  { name: 'Privacy Policy (onboard)', route: 'MigratedPrivacyPolicyOnboard', category: 'Migrated - Onboard Flow' },
  { name: 'Notifications (onboard)', route: 'MigratedNotificationsOnboard', category: 'Migrated - Onboard Flow' },
  { name: 'Assessment Result', route: 'MigratedAssessmentResult', category: 'Migrated - Onboard Flow' },
  { name: 'Recommendations', route: 'MigratedRecommendations', category: 'Migrated - Onboard Flow' },
  { name: 'Health (onboard)', route: 'MigratedHealth', category: 'Migrated - Onboard Flow' },
  { name: 'Articles', route: 'MigratedArticles', category: 'Migrated - Onboard Flow' },
  { name: 'Onboarding Complete', route: 'MigratedOnboardingComplete', category: 'Migrated - Onboard Flow' },
];

export default function ScreenExplorer({ navigation }: any) {
  const [search, setSearch] = useState('');

  const sections = useMemo(() => {
    const filtered = search.trim()
      ? ALL_SCREENS.filter(
          (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.category.toLowerCase().includes(search.toLowerCase())
        )
      : ALL_SCREENS;

    const grouped: Record<string, ScreenItem[]> = {};
    filtered.forEach((screen) => {
      if (!grouped[screen.category]) grouped[screen.category] = [];
      grouped[screen.category].push(screen);
    });

    return Object.keys(grouped)
      .sort()
      .map((category) => ({
        title: category,
        data: grouped[category],
        count: grouped[category].length,
      }));
  }, [search]);

  const totalCount = ALL_SCREENS.length;
  const navigableCount = ALL_SCREENS.filter((s) => s.route).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Screen Explorer</Text>
          <Text style={styles.subtitle}>
            {navigableCount}/{totalCount} screens
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8A8CB2" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search screens..."
          placeholderTextColor="#8A8CB2"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#8A8CB2" />
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.name + index}
        stickySectionHeadersEnabled={true}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.count}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.screenItem}
            onPress={() => {
              if (item.route) {
                if (item.route.startsWith("Migrated")) {
                  navigation.navigate("Migrated", { screen: item.route });
                } else {
                  navigation.navigate(item.route);
                }
              }
            }}
            disabled={!item.route}
          >
            <View style={styles.screenInfo}>
              <View style={[styles.statusDot, item.route ? styles.statusDotGreen : styles.statusDotGray]} />
              <Text style={styles.screenName}>{item.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8A8CB2" />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1735' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1 },
  title: { fontSize: 22, color: '#fff', fontFamily: 'Gilroy-Bold' },
  subtitle: { fontSize: 13, color: '#8A8CB2', fontFamily: 'Gilroy-Regular', marginTop: 2 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1C3A',
    marginHorizontal: 16, marginBottom: 8, borderRadius: 12, paddingHorizontal: 12, height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, fontFamily: 'Gilroy-Regular' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#141227', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#2A2844',
  },
  sectionTitle: { fontSize: 13, color: '#7773FA', fontFamily: 'Gilroy-Bold', textTransform: 'uppercase', letterSpacing: 1 },
  sectionCount: { fontSize: 12, color: '#8A8CB2', fontFamily: 'Gilroy-Regular' },
  listContent: { paddingBottom: 40 },
  screenItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2A2844',
  },
  screenInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  statusDotGreen: { backgroundColor: '#34D399' },
  statusDotGray: { backgroundColor: '#4A4868' },
  screenName: { fontSize: 14, color: '#fff', fontFamily: 'Gilroy-Regular', flex: 1 },
});
