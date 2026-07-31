import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import * as Font from "expo-font";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { enableScreens } from "react-native-screens";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@store/AuthContext";

import Home from "@pages/Home";
import Club from "@pages/Club";
import Stories from "@pages/Stories";
import Clubmap from "@pages/Clubmap";
import Cycling from "@pages/Cycling";
import Congratulation from "@pages/Congratulation";
import Result from "@pages/Result";
import Unboarding from "@pages/Unboarding";
import Weight from "@pages/Weight";
import Height from "@pages/Height";
import Name from "@pages/Name";
import Challenges from "@pages/Challenges";
import Today from "@pages/Today";
import Workout from "@pages/Workout";
import Profile from "@pages/Profile";
import NavigationTab from "@components/NavigationTab";

import WelcomeAuthScreen from "@pages/auth/WelcomeAuthScreen";
import LoginScreen from "@pages/auth/LoginScreen";
import ForgotPasswordOptionsScreen from "@pages/auth/ForgotPasswordOptionsScreen";
import ForgotPasswordEmailScreen from "@pages/auth/ForgotPasswordEmailScreen";
import PasswordResetSentScreen from "@pages/auth/PasswordResetSentScreen";
import RegisterScreen from "@pages/auth/RegisterScreen";
import ProfileEditScreen from "@pages/auth/ProfileEditScreen";
import ChangePasswordScreen from "@pages/auth/ChangePasswordScreen";

import WorkoutList from "@pages/WorkoutList";
import WorkoutDetail from "@pages/WorkoutDetail";
import WorkoutDayExercises from "@pages/WorkoutDayExercises";
import WorkoutSessionScreen from "@pages/WorkoutSessionScreen";
import WorkoutSummary from "@pages/WorkoutSummary";
import ExerciseList from "@pages/ExerciseList";
import ExerciseDetail from "@pages/ExerciseDetail";
import DietDashboard from "@pages/DietDashboard";
import DietList from "@pages/DietList";
import CommunityFeed from "@pages/CommunityFeed";
import PostDetail from "@pages/PostDetail";
import ProfileStats from "@pages/ProfileStats";
import SettingsScreen from "@pages/SettingsScreen";
import FavouriteWorkouts from "@pages/FavouriteWorkouts";
import ScreenExplorer from "@pages/ScreenExplorer";

// @ts-ignore
import AboutAppScreen from "@pages/migrated/about_app_screen";
// @ts-ignore
import AboutUsScreen from "@pages/migrated/about_us_screen";
// @ts-ignore
import ActivityTrackerScreen from "@pages/migrated/activity_tracker_screen";
// @ts-ignore
import AddPostScreen from "@pages/migrated/add_post_screen";
// @ts-ignore
import AddShoppingListScreen from "@pages/migrated/add_shopping_list_screen";
// @ts-ignore
import AssignScreen from "@pages/migrated/assign_screen";
// @ts-ignore
import BlogDetailScreen from "@pages/migrated/blog_detail_screen";
// @ts-ignore
import BlogScreen from "@pages/migrated/blog_screen";
// @ts-ignore
import BookmarkScreen from "@pages/migrated/bookmark_screen";
// @ts-ignore
import ChangePwdScreen from "@pages/migrated/change_pwd_screen";
// @ts-ignore
import ChattingImageScreen from "@pages/migrated/chatting_image_screen";
// @ts-ignore
import ChattingScreen from "@pages/migrated/chatting_screen";
// @ts-ignore
import ChewieScreen from "@pages/migrated/chewie_screen";
// @ts-ignore
import CommunityScreen from "@pages/migrated/community_screen";

// @ts-ignore
import DietDetailScreen from "@pages/migrated/diet_detail_screen";
// @ts-ignore
import AssignedMealsScreen from "@pages/migrated/assigned_meals_screen";
// @ts-ignore
import EditProfileScreen from "@pages/migrated/edit_profile_screen";
// @ts-ignore
import ExerciseDetailScreen from "@pages/migrated/exercise_detail_screen";
// @ts-ignore
import ExerciseInfoScreen from "@pages/migrated/exercise_info_screen";
// @ts-ignore
import ExerciseDurationScreen from "@pages/migrated/exercise_duration_screen";
// @ts-ignore
import ExerciseDurationScreencast from "@pages/migrated/exercise_duration_screencast";
// @ts-ignore
import ExerciseHistoryScreen from "@pages/migrated/exercise_history_screen";
// @ts-ignore
import ExerciseListScreen from "@pages/migrated/exercise_list_screen";
// @ts-ignore
import FavouriteRecipeScreen from "@pages/migrated/favourite_recipe_screen";
// @ts-ignore
import FavouriteScreen from "@pages/migrated/favourite_screen";
// @ts-ignore
import FilterWorkoutScreen from "@pages/migrated/filter_workout_screen";
// @ts-ignore
import ForgotPwdScreen from "@pages/migrated/forgot_pwd_screen";
// @ts-ignore
import FullWorkoutScreen from "@pages/migrated/full_workout_screen";
// @ts-ignore
import GoalCaloriesMacrosScreen from "@pages/migrated/goal_calories_macros_screen";
// @ts-ignore
import GoalSelectionScreen from "@pages/migrated/goal_selection_screen";

import HomeScreenModern from "@pages/migrated/home_screen_modern";
// @ts-ignore
import LanguageScreen from "@pages/migrated/language_screen";
// @ts-ignore
import MainGoalScreen from "@pages/migrated/main_goal_screen";
// @ts-ignore
import MealsRemindersScreen from "@pages/migrated/meals_reminders_screen";
// @ts-ignore
import MealsWaterReminderScreen from "@pages/migrated/meals_water_reminder_screen";
// @ts-ignore
import MissingDetailsScreen from "@pages/migrated/missing_details_screen";
// @ts-ignore
import MyProgramCalendarScreen from "@pages/migrated/my_program_calendar_screen";
// @ts-ignore
import NoDataScreen from "@pages/migrated/no_data_screen";
// @ts-ignore
import NoInternetScreen from "@pages/migrated/no_internet_screen";
// @ts-ignore
import NotificationScreen from "@pages/migrated/notification_screen";
// @ts-ignore
import OnboardingScreen from "@pages/migrated/onboarding_screen";
// @ts-ignore
import OtherUserProfileScreen from "@pages/migrated/other_user_profile_screen";
// @ts-ignore
import OTPScreen from "@pages/migrated/otp_screen";
// @ts-ignore
import PaymentScheduledScreen from "@pages/migrated/payment_scheduled_screen";
// @ts-ignore
import PaymentScreen from "@pages/migrated/payment_screen";
// @ts-ignore
import PlanScreen from "@pages/migrated/plan_screen";
// @ts-ignore
import PostDetailsScreen from "@pages/migrated/post_details_screen";
// @ts-ignore
import PrivacyPolicyScreen from "@pages/migrated/privacy_policy_screen";
// @ts-ignore
import ProductDetailScreen from "@pages/migrated/product_detail_screen";
// @ts-ignore
import ProductScreen from "@pages/migrated/product_screen";
// @ts-ignore
import ProfileScreenMigrated from "@pages/migrated/profile_screen";
// @ts-ignore
import ProfileScreenSandow from "@pages/migrated/profile_screen_sandow";
// @ts-ignore
import ProgressDetailScreen from "@pages/migrated/progress_detail_screen";
// @ts-ignore
import ProgressScreen from "@pages/migrated/progress_screen";
// @ts-ignore
import ProgressSettingScreen from "@pages/migrated/progress_setting_screen";
// @ts-ignore
import RecipeCategoryListScreen from "@pages/migrated/recipe_category_list_screen";
// @ts-ignore
import RecipeListScreenV2 from "@pages/migrated/recipe_list_screen_v2";
// @ts-ignore
import RecipeMainScreen from "@pages/migrated/recipe_main_screen";
// @ts-ignore
import WorkoutTemplateListScreen from "@pages/migrated/workout_template_list_screen";
// @ts-ignore
import RecipeTagListScreen from "@pages/migrated/recipe_tag_list_screen";
// @ts-ignore
import ReminderScreen from "@pages/migrated/reminder_screen";
// @ts-ignore
import ScheduleScreen from "@pages/migrated/schedule_screen";
// @ts-ignore
import SearchScreen from "@pages/migrated/search_screen";
// @ts-ignore
import SetReminderScreen from "@pages/migrated/set_reminder_screen";
// @ts-ignore
import SettingScreen from "@pages/migrated/setting_screen";
// @ts-ignore
import ShoppingListDetailScreen from "@pages/migrated/shopping_list_detail_screen";
// @ts-ignore
import ShoppingListScreen from "@pages/migrated/shopping_list_screen";
// @ts-ignore
import SignInScreenSandow from "@pages/migrated/sign_in_screen_sandow";
// @ts-ignore
import SignUpScreenSandow from "@pages/migrated/sign_up_screen_sandow";

// @ts-ignore
import SleepMonitoringScreen from "@pages/migrated/sleep_monitoring_screen";
// @ts-ignore
import SplashScreenMigrated from "@pages/migrated/splash_screen";
// @ts-ignore
import StepsCountScreen from "@pages/migrated/steps_count_screen";
// @ts-ignore
import SubscribeScreen from "@pages/migrated/subscribe_screen";
// @ts-ignore
import SubscriptionDetailScreen from "@pages/migrated/subscription_detail_screen";
// @ts-ignore
import TermsAndConditionsScreen from "@pages/migrated/terms_and_conditions_screen";
// @ts-ignore
import TipsScreen from "@pages/migrated/tips_screen";
// @ts-ignore
import VerifyOtpScreen from "@pages/migrated/verify_otp_screen";
// @ts-ignore
import VideoDetailScreen from "@pages/migrated/video_detail_screen";
// @ts-ignore
import VideoScreen from "@pages/migrated/video_screen";
// @ts-ignore
import ViewAllBlogScreen from "@pages/migrated/view_all_blog_screen";
// @ts-ignore
import ViewAllDiet from "@pages/migrated/view_all_diet";
// @ts-ignore
import ViewAllProductScreen from "@pages/migrated/view_all_product_screen";
// @ts-ignore
import ViewBodyPartScreen from "@pages/migrated/view_body_part_screen";
// @ts-ignore
import ViewDietCategoryScreen from "@pages/migrated/view_diet_category_screen";
// @ts-ignore
import ViewEquipmentScreen from "@pages/migrated/view_equipment_screen";
// @ts-ignore
import ViewLevelScreen from "@pages/migrated/view_level_screen";
// @ts-ignore
import ViewProductCategoryScreen from "@pages/migrated/view_product_category_screen";
// @ts-ignore
import ViewWorkoutsScreen from "@pages/migrated/view_workouts_screen";
// @ts-ignore
import WalkThroughScreen from "@pages/migrated/walk_through_screen";
// @ts-ignore
import WaterRemindersScreen from "@pages/migrated/water_reminders_screen";
// @ts-ignore
import WaterTrackerScreen from "@pages/migrated/water_tracker_screen";
// @ts-ignore
import WebViewScreen from "@pages/migrated/web_view_screen";
// @ts-ignore
import WorkoutDetailScreenMig from "@pages/migrated/workout_detail_screen";
// @ts-ignore
import WorkoutHistoryScreen from "@pages/migrated/workout_history_screen";
// @ts-ignore
import WorkoutPreviewScreen from "@pages/migrated/workout_preview_screen";
// @ts-ignore
import WorkoutSessionScreenMig from "@pages/migrated/workout_session_screen";
// @ts-ignore
import YoutubePlayerScreen from "@pages/migrated/youtube_player_screen";



// @ts-ignore
import DeviceConnectedScreen from "@pages/migrated/home/device_connected_screen";
// @ts-ignore
import EmparejandoScreen from "@pages/migrated/home/emparejando_screen";
// @ts-ignore
import FitnessMetricsScreen from "@pages/migrated/home/fitness_metrics_screen";
// @ts-ignore
import HealthMetricInsightScreen from "@pages/migrated/home/health_metric_insight_screen";
// @ts-ignore
import HeartRateDetailsScreen from "@pages/migrated/home/heart_rate_details_screen";
// @ts-ignore
import HeartRateHistoryScreen from "@pages/migrated/home/heart_rate_history_screen";
// @ts-ignore
import HeartRateInsightScreen from "@pages/migrated/home/heart_rate_insight_screen";
// @ts-ignore
import HeartRateScreen from "@pages/migrated/home/heart_rate_screen";
// @ts-ignore
import HeartRateZoneScreen from "@pages/migrated/home/heart_rate_zones_screen";
// @ts-ignore
import HomeEmptyScreen from "@pages/migrated/home/home_empty_screen";
// @ts-ignore
import LinkDeviceChoiceScreen from "@pages/migrated/home/link_device_choice_screen";
// @ts-ignore
import LinkDeviceListScreen from "@pages/migrated/home/link_device_list_screen";
// @ts-ignore
import LogStepsFormScreen from "@pages/migrated/home/log_steps_form_screen";
// @ts-ignore
import LogWeightFormScreen from "@pages/migrated/home/log_weight_form_screen";
// @ts-ignore
import LogWeightKeyboardScreen from "@pages/migrated/home/log_weight_keyboard_screen";
// @ts-ignore
import ManageHealthMetricsScreen from "@pages/migrated/home/manage_health_metrics_screen";
// @ts-ignore
import SandowScoreScreenHome from "@pages/migrated/home/sandow_score_screen";
// @ts-ignore
import ScoreBreakdownRadarScreenHome from "@pages/migrated/home/score_breakdown_radar_screen";
// @ts-ignore
import StepGoalCompletedScreen from "@pages/migrated/home/step_goal_completed_screen";
// @ts-ignore
import StepGoalScreen from "@pages/migrated/home/step_goal_screen";
// @ts-ignore
import StepsDetailsScreen from "@pages/migrated/home/steps_details_screen";
// @ts-ignore
import StepsHistoryScreen from "@pages/migrated/home/steps_history_screen";
// @ts-ignore
import StepsInsightScreenHome from "@pages/migrated/home/steps_insight_screen";
// @ts-ignore
import StepsLoggedScreen from "@pages/migrated/home/steps_logged_screen";
// @ts-ignore
import StepsScreen from "@pages/migrated/home/steps_screen";
// @ts-ignore
import WeightDeadlineScreen from "@pages/migrated/home/weight_deadline_screen";
// @ts-ignore
import WeightDetailsScreen from "@pages/migrated/home/weight_details_screen";
// @ts-ignore
import WeightGoalCompletedScreen from "@pages/migrated/home/weight_goal_completed_screen";
// @ts-ignore
import WeightGoalSetScreenHome from "@pages/migrated/home/weight_goal_set_screen";
// @ts-ignore
import WeightGoalSummaryScreen from "@pages/migrated/home/weight_goal_summary_screen";
// @ts-ignore
import WeightHistoryScreen from "@pages/migrated/home/weight_history_screen";
// @ts-ignore
import WeightInsightScreenHome from "@pages/migrated/home/weight_insight_screen";
// @ts-ignore
import WeightLoggedScreenHome from "@pages/migrated/home/weight_logged_screen";
// @ts-ignore
import WeightLoseGainChoiceScreen from "@pages/migrated/home/weight_lose_gain_choice_screen";
// @ts-ignore
import WeightReminderScreen from "@pages/migrated/home/weight_reminder_screen";
// @ts-ignore
import WeightScreenMigrated from "@pages/migrated/home/weight_screen";
// @ts-ignore
import WeightSetGoalScreen from "@pages/migrated/home/weight_set_goal_screen";

// @ts-ignore
import ArticlesScreen from "@pages/migrated/onboarding/articles_screen";
// @ts-ignore
import AssessmentResultScreen from "@pages/migrated/onboarding/assessment_result_screen";
// @ts-ignore
import AvatarSetupScreen from "@pages/migrated/onboarding/avatar_setup_screen";
// @ts-ignore
import ChoosePlanScreen from "@pages/migrated/onboarding/choose_plan_screen";
// @ts-ignore
import HealthScreen from "@pages/migrated/onboarding/health_screen";
// @ts-ignore
import NotificationsScreen from "@pages/migrated/onboarding/notifications_screen";
// @ts-ignore
import OnboardingCompleteScreen from "@pages/migrated/onboarding/onboarding_complete_screen";
// @ts-ignore
import PrivacyPolicyScreenOnboard from "@pages/migrated/onboarding/privacy_policy_screen";
// @ts-ignore
import ProfileSetupFormScreen from "@pages/migrated/onboarding/profile_setup_form_screen";
// @ts-ignore
import ProfileSetupIntroScreen from "@pages/migrated/onboarding/profile_setup_intro_screen";
// @ts-ignore
import RecommendationsScreen from "@pages/migrated/onboarding/recommendations_screen";

enableScreens();
const Stack = createStackNavigator();

function Unboardingnavigator() {
  const UnboardingStack = createStackNavigator();
  return (
    <UnboardingStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Unboard">
      <UnboardingStack.Screen name="Unboard" component={Unboarding} />
      <UnboardingStack.Screen name="Name" component={Name} />
      <UnboardingStack.Screen name="Weight" component={Weight} />
      <UnboardingStack.Screen name="Height" component={Height} />
    </UnboardingStack.Navigator>
  );
}

function Clubnavigator() {
  const ClubStack = createStackNavigator();
  return (
    <ClubStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Clubmap">
      <ClubStack.Screen name="Stories" component={Stories} />
      <ClubStack.Screen name="Clubmap" component={Clubmap} />
      <ClubStack.Screen name="Cycling" component={Cycling} />
      <ClubStack.Screen name="Congratulation" component={Congratulation} />
      <ClubStack.Screen name="Result" component={Result} />
    </ClubStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function Homenavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomePage"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <NavigationTab {...props} />}
      backBehavior="order"
    >
      <Tab.Screen
        name="HomePage"
        component={MigratedNavigator}
        options={{
          //@ts-ignore
          icon: require("@assets/icons/nav1.png"),
          tabBarVisible: false,
          tabBarStyle: { display: 'none' }
        }}
      />
      <Tab.Screen
        name="Club"
        component={Club}
        options={{
          //@ts-ignore
          icon: require("@assets/icons/nav2.png")
        }}
      />
      <Tab.Screen
        name="Challenges"
        component={Challenges}
        options={{
          //@ts-ignore
          icon: require("@assets/icons/nav3.png")
        }}
      />
      <Tab.Screen
        name="Today"
        component={Today}
        options={{
          //@ts-ignore
          icon: require("@assets/icons/nav4.png")
        }}
      />
    </Tab.Navigator>
  );
}

function MigratedNavigator() {
  const MStack = createStackNavigator();
  return (
    <MStack.Navigator initialRouteName="MigratedHomeModern" screenOptions={{ headerShown: false }}>
      <MStack.Screen name="MigratedAboutApp" component={AboutAppScreen} />
      <MStack.Screen name="MigratedAboutUs" component={AboutUsScreen} />
      <MStack.Screen name="MigratedActivityTracker" component={ActivityTrackerScreen} />
      <MStack.Screen name="MigratedAddPost" component={AddPostScreen} />
      <MStack.Screen name="MigratedAddShoppingList" component={AddShoppingListScreen} />
      <MStack.Screen name="MigratedAssign" component={AssignScreen} />
      <MStack.Screen name="MigratedBlogDetail" component={BlogDetailScreen} />
      <MStack.Screen name="MigratedBlog" component={BlogScreen} />
      <MStack.Screen name="MigratedBookmark" component={BookmarkScreen} />
      <MStack.Screen name="MigratedChangePwd" component={ChangePwdScreen} />
      <MStack.Screen name="MigratedChattingImage" component={ChattingImageScreen} />
      <MStack.Screen name="MigratedChatting" component={ChattingScreen} />
      <MStack.Screen name="MigratedChewie" component={ChewieScreen} />
      <MStack.Screen name="MigratedCommunity" component={CommunityScreen} />
      <MStack.Screen name="MigratedDietDetail" component={DietDetailScreen as any} />
      <MStack.Screen name="MigratedAssignedMeals" component={AssignedMealsScreen} />
      <MStack.Screen name="MigratedEditProfile" component={EditProfileScreen} />
      <MStack.Screen name="MigratedExerciseDetail" component={ExerciseDetailScreen as any} />
      <MStack.Screen name="MigratedExerciseInfo" component={ExerciseInfoScreen} />
      <MStack.Screen name="MigratedExerciseDuration" component={ExerciseDurationScreen as any} />
      <MStack.Screen name="MigratedExerciseDurationCast" component={ExerciseDurationScreencast as any} />
      <MStack.Screen name="MigratedExerciseHistory" component={ExerciseHistoryScreen} />
      <MStack.Screen name="MigratedExerciseList" component={ExerciseListScreen as any} />
      <MStack.Screen name="MigratedFavouriteRecipe" component={FavouriteRecipeScreen} />
      <MStack.Screen name="MigratedFavourite" component={FavouriteScreen as any} />
      <MStack.Screen name="MigratedFilterWorkout" component={FilterWorkoutScreen} />
      <MStack.Screen name="MigratedForgotPwd" component={ForgotPwdScreen} />
      <MStack.Screen name="MigratedFullWorkout" component={FullWorkoutScreen} />
      <MStack.Screen name="MigratedGoalCaloriesMacros" component={GoalCaloriesMacrosScreen} />
      <MStack.Screen name="MigratedGoalSelection" component={GoalSelectionScreen} />
      <MStack.Screen name="MigratedHomeModern" component={HomeScreenModern} />
      <MStack.Screen name="MigratedLanguage" component={LanguageScreen} />
      <MStack.Screen name="MigratedMainGoal" component={MainGoalScreen} />
      <MStack.Screen name="MigratedMealsReminders" component={MealsRemindersScreen} />
      <MStack.Screen name="MigratedMealsWaterReminder" component={MealsWaterReminderScreen} />
      <MStack.Screen name="MigratedMissingDetails" component={MissingDetailsScreen} />
      <MStack.Screen name="MigratedMyProgramCalendar" component={MyProgramCalendarScreen} />
      <MStack.Screen name="MigratedNoData" component={NoDataScreen} />
      <MStack.Screen name="MigratedNoInternet" component={NoInternetScreen} />
      <MStack.Screen name="MigratedNotification" component={NotificationScreen} />
      <MStack.Screen name="MigratedOnboarding" component={OnboardingScreen} />
      <MStack.Screen name="MigratedOtherUserProfile" component={OtherUserProfileScreen} />
      <MStack.Screen name="MigratedOTP" component={OTPScreen} />
      <MStack.Screen name="MigratedPaymentScheduled" component={PaymentScheduledScreen} />
      <MStack.Screen name="MigratedPayment" component={PaymentScreen} />
      <MStack.Screen name="MigratedPlan" component={PlanScreen} />
      <MStack.Screen name="MigratedPostDetails" component={PostDetailsScreen} />
      <MStack.Screen name="MigratedPrivacyPolicy" component={PrivacyPolicyScreen} />
      <MStack.Screen name="MigratedProductDetail" component={ProductDetailScreen} />
      <MStack.Screen name="MigratedProduct" component={ProductScreen} />
      <MStack.Screen name="MigratedProfile" component={ProfileScreenMigrated as any} />
      <MStack.Screen name="MigratedProfileSandow" component={ProfileScreenSandow as any} />
      <MStack.Screen name="MigratedProgressDetail" component={ProgressDetailScreen} />
      <MStack.Screen name="MigratedProgress" component={ProgressScreen} />
      <MStack.Screen name="MigratedProgressSetting" component={ProgressSettingScreen} />
      <MStack.Screen name="MigratedRecipeCategoryList" component={RecipeCategoryListScreen} />
      <MStack.Screen name="MigratedRecipeListV2" component={RecipeListScreenV2} />
      <MStack.Screen name="MigratedRecipeMain" component={RecipeMainScreen} />
      <MStack.Screen name="MigratedRecipeTagList" component={RecipeTagListScreen} />
      <MStack.Screen name="MigratedReminder" component={ReminderScreen} />
      <MStack.Screen name="MigratedSchedule" component={ScheduleScreen} />
      <MStack.Screen name="MigratedSearch" component={SearchScreen} />
      <MStack.Screen name="MigratedSetReminder" component={SetReminderScreen} />
      <MStack.Screen name="MigratedSetting" component={SettingScreen} />
      <MStack.Screen name="MigratedShoppingListDetail" component={ShoppingListDetailScreen} />
      <MStack.Screen name="MigratedShoppingList" component={ShoppingListScreen} />
      <MStack.Screen name="MigratedSignInSandow" component={SignInScreenSandow} />
      <MStack.Screen name="MigratedSignUpSandow" component={SignUpScreenSandow} />
      <MStack.Screen name="MigratedSleepMonitoring" component={SleepMonitoringScreen} />
      <MStack.Screen name="MigratedSplash" component={SplashScreenMigrated} />
      <MStack.Screen name="MigratedStepsCount" component={StepsCountScreen} />
      <MStack.Screen name="MigratedSubscribe" component={SubscribeScreen} />
      <MStack.Screen name="MigratedSubscriptionDetail" component={SubscriptionDetailScreen} />
      <MStack.Screen name="MigratedTermsAndConditions" component={TermsAndConditionsScreen} />
      <MStack.Screen name="MigratedTips" component={TipsScreen} />
      <MStack.Screen name="MigratedVerifyOtp" component={VerifyOtpScreen} />
      <MStack.Screen name="MigratedVideoDetail" component={VideoDetailScreen} />
      <MStack.Screen name="MigratedVideo" component={VideoScreen} />
      <MStack.Screen name="MigratedViewAllBlog" component={ViewAllBlogScreen} />
      <MStack.Screen name="MigratedViewAllDiet" component={ViewAllDiet} />
      <MStack.Screen name="MigratedViewAllProduct" component={ViewAllProductScreen} />
      <MStack.Screen name="MigratedViewBodyPart" component={ViewBodyPartScreen} />
      <MStack.Screen name="MigratedViewDietCategory" component={ViewDietCategoryScreen} />
      <MStack.Screen name="MigratedViewEquipment" component={ViewEquipmentScreen} />
      <MStack.Screen name="MigratedViewLevel" component={ViewLevelScreen} />
      <MStack.Screen name="MigratedViewProductCategory" component={ViewProductCategoryScreen} />
      <MStack.Screen name="MigratedViewWorkouts" component={ViewWorkoutsScreen} />
      <MStack.Screen name="MigratedWalkThrough" component={WalkThroughScreen} />
      <MStack.Screen name="MigratedWaterReminders" component={WaterRemindersScreen} />
      <MStack.Screen name="MigratedWaterTracker" component={WaterTrackerScreen} />
      <MStack.Screen name="MigratedWebView" component={WebViewScreen} />
      <MStack.Screen name="MigratedWorkoutDetail" component={WorkoutDetailScreenMig} />
      <MStack.Screen name="MigratedWorkoutHistory" component={WorkoutHistoryScreen} />
      <MStack.Screen name="MigratedWorkoutPreview" component={WorkoutPreviewScreen} />
      <MStack.Screen name="MigratedWorkoutSession" component={WorkoutSessionScreenMig} />
      <MStack.Screen name="MigratedWorkoutTemplateList" component={WorkoutTemplateListScreen} />
      <MStack.Screen name="MigratedYoutubePlayer" component={YoutubePlayerScreen} />
      <MStack.Screen name="MigratedDeviceConnected" component={DeviceConnectedScreen} />
      <MStack.Screen name="MigratedEmparejando" component={EmparejandoScreen} />
      <MStack.Screen name="MigratedFitnessMetrics" component={FitnessMetricsScreen} />
      <MStack.Screen name="MigratedHealthMetricInsight" component={HealthMetricInsightScreen} />
      <MStack.Screen name="MigratedHeartRateDetails" component={HeartRateDetailsScreen} />
      <MStack.Screen name="MigratedHeartRateHistory" component={HeartRateHistoryScreen} />
      <MStack.Screen name="MigratedHeartRateInsight" component={HeartRateInsightScreen} />
      <MStack.Screen name="MigratedHeartRate" component={HeartRateScreen} />
      <MStack.Screen name="MigratedHeartRateZones" component={HeartRateZoneScreen} />
      <MStack.Screen name="MigratedHomeEmpty" component={HomeEmptyScreen} />
      <MStack.Screen name="MigratedLinkDeviceChoice" component={LinkDeviceChoiceScreen} />
      <MStack.Screen name="MigratedLinkDeviceList" component={LinkDeviceListScreen} />
      <MStack.Screen name="MigratedLogStepsForm" component={LogStepsFormScreen} />
      <MStack.Screen name="MigratedLogWeightForm" component={LogWeightFormScreen} />
      <MStack.Screen name="MigratedLogWeightKeyboard" component={LogWeightKeyboardScreen} />
      <MStack.Screen name="MigratedManageHealthMetrics" component={ManageHealthMetricsScreen} />
      <MStack.Screen name="MigratedSandowScore" component={SandowScoreScreenHome} />
      <MStack.Screen name="MigratedScoreBreakdown" component={ScoreBreakdownRadarScreenHome} />
      <MStack.Screen name="MigratedStepGoalCompleted" component={StepGoalCompletedScreen} />
      <MStack.Screen name="MigratedStepGoal" component={StepGoalScreen} />
      <MStack.Screen name="MigratedStepsDetails" component={StepsDetailsScreen} />
      <MStack.Screen name="MigratedStepsHistory" component={StepsHistoryScreen} />
      <MStack.Screen name="MigratedStepsInsight" component={StepsInsightScreenHome} />
      <MStack.Screen name="MigratedStepsLogged" component={StepsLoggedScreen} />
      <MStack.Screen name="MigratedSteps" component={StepsScreen} />
      <MStack.Screen name="MigratedWeightDeadline" component={WeightDeadlineScreen} />
      <MStack.Screen name="MigratedWeightDetails" component={WeightDetailsScreen} />
      <MStack.Screen name="MigratedWeightGoalCompleted" component={WeightGoalCompletedScreen} />
      <MStack.Screen name="MigratedWeightGoalSet" component={WeightGoalSetScreenHome} />
      <MStack.Screen name="MigratedWeightGoalSummary" component={WeightGoalSummaryScreen} />
      <MStack.Screen name="MigratedWeightHistory" component={WeightHistoryScreen} />
      <MStack.Screen name="MigratedWeightInsight" component={WeightInsightScreenHome} />
      <MStack.Screen name="MigratedWeightLogged" component={WeightLoggedScreenHome} />
      <MStack.Screen name="MigratedWeightLoseGainChoice" component={WeightLoseGainChoiceScreen} />
      <MStack.Screen name="MigratedWeightReminder" component={WeightReminderScreen} />
      <MStack.Screen name="MigratedWeight" component={WeightScreenMigrated} />
      <MStack.Screen name="MigratedWeightSetGoal" component={WeightSetGoalScreen} />
      <MStack.Screen name="MigratedArticles" component={ArticlesScreen} />
      <MStack.Screen name="MigratedAssessmentResult" component={AssessmentResultScreen} />
      <MStack.Screen name="MigratedAvatarSetup" component={AvatarSetupScreen} />
      <MStack.Screen name="MigratedChoosePlan" component={ChoosePlanScreen} />
      <MStack.Screen name="MigratedHealth" component={HealthScreen} />
      <MStack.Screen name="MigratedNotificationsOnboard" component={NotificationsScreen} />
      <MStack.Screen name="MigratedOnboardingComplete" component={OnboardingCompleteScreen} />
      <MStack.Screen name="MigratedPrivacyPolicyOnboard" component={PrivacyPolicyScreenOnboard} />
      <MStack.Screen name="MigratedProfileSetupForm" component={ProfileSetupFormScreen} />
      <MStack.Screen name="MigratedProfileSetupIntro" component={ProfileSetupIntroScreen} />
      <MStack.Screen name="MigratedRecommendations" component={RecommendationsScreen} />
    </MStack.Navigator>
  );
}

function RootNavigator() {
  const { state } = useAuth();

  if (state.isLoading) return null;

  return (
    <Stack.Navigator
      key={state.isAuthenticated ? (state.onboardingCompleted ? 'main' : 'onboarding') : 'auth'}
      initialRouteName={!state.isAuthenticated ? 'WelcomeAuth' : !state.onboardingCompleted ? 'MigratedOnboarding' : 'Home'}
      screenOptions={{ headerShown: false }}
    >
      {!state.isAuthenticated ? (
        <>
          <Stack.Screen name="WelcomeAuth" component={WelcomeAuthScreen} />
          <Stack.Screen name="LoginAuth" component={LoginScreen} />
          <Stack.Screen name="RegisterFlow" component={RegisterScreen} />
          <Stack.Screen name="ForgotOptions" component={ForgotPasswordOptionsScreen} />
          <Stack.Screen name="ForgotEmail" component={ForgotPasswordEmailScreen} />
          <Stack.Screen name="ResetSent" component={PasswordResetSentScreen} />
        </>
      ) : !state.onboardingCompleted ? (
        <>
          <Stack.Screen name="MigratedOnboarding" component={OnboardingScreen} />
          <Stack.Screen name="MigratedProfileSetupIntro" component={ProfileSetupIntroScreen} />
          <Stack.Screen name="MigratedProfileSetupForm" component={ProfileSetupFormScreen} />
          <Stack.Screen name="MigratedAvatarSetup" component={AvatarSetupScreen} />
          <Stack.Screen name="MigratedChoosePlan" component={ChoosePlanScreen} />
          <Stack.Screen name="MigratedPrivacyPolicyOnboard" component={PrivacyPolicyScreenOnboard} />
          <Stack.Screen name="MigratedNotificationsOnboard" component={NotificationsScreen} />
          <Stack.Screen name="MigratedAssessmentResult" component={AssessmentResultScreen} />
          <Stack.Screen name="MigratedRecommendations" component={RecommendationsScreen} />
          <Stack.Screen name="MigratedHealth" component={HealthScreen} />
          <Stack.Screen name="MigratedArticles" component={ArticlesScreen} />
          <Stack.Screen name="MigratedOnboardingComplete" component={OnboardingCompleteScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={Homenavigator} />
          <Stack.Screen name="Unboarding" component={Unboardingnavigator} />
          <Stack.Screen name="Clubnav" component={Clubnavigator} />
          <Stack.Screen name="Workout" component={Workout} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Congratulation" component={Congratulation} />
          <Stack.Screen name="Result" component={Result} />

          {/* Workout flow */}
          <Stack.Screen name="WorkoutList" component={WorkoutList} />
          <Stack.Screen name="WorkoutDetail" component={WorkoutDetail} />
          <Stack.Screen name="WorkoutDayExercises" component={WorkoutDayExercises} />
          <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
          <Stack.Screen name="WorkoutSummary" component={WorkoutSummary} />

          {/* Exercise */}
          <Stack.Screen name="ExerciseList" component={ExerciseList} />
          <Stack.Screen name="ExerciseDetail" component={ExerciseDetail} />
          <Stack.Screen name="ExerciseInfo" component={ExerciseInfoScreen} />

          {/* Diet */}
          <Stack.Screen name="DietDashboard" component={DietDashboard} />
          <Stack.Screen name="DietList" component={DietList} />

          {/* Community */}
          <Stack.Screen name="CommunityFeed" component={CommunityFeed} />
          <Stack.Screen name="PostDetail" component={PostDetail} />

          {/* Profile */}
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="ProfileStats" component={ProfileStats} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="FavouriteWorkouts" component={FavouriteWorkouts} />

          {/* Migrated screens (nested navigator) */}
          <Stack.Screen name="Migrated" component={MigratedNavigator} />

          <Stack.Screen name="ScreenExplorer" component={ScreenExplorer} />
        </>
      )}
    </Stack.Navigator>
  );
}

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          "Gilroy-Light": {
            uri: require("@assets/font/Gilroy-Light.ttf"),
            display: Font.FontDisplay.FALLBACK,
          },
          "Gilroy-Lightitalic": {
            uri: require("@assets/font/Gilroy-LightItalic.ttf"),
            display: Font.FontDisplay.FALLBACK,
          },
          "Gilroy-ExtraBold": {
            uri: require("@assets/font/Gilroy-ExtraBold.ttf"),
            display: Font.FontDisplay.FALLBACK,
          },
          "Gilroy-Bold": {
            uri: require("@assets/font/Gilroy-Bold.ttf"),
            display: Font.FontDisplay.FALLBACK,
          },
          "Gilroy-SemiBold": {
            uri: require("@assets/font/Gilroy-SemiBold.ttf"),
            display: Font.FontDisplay.FALLBACK,
          },
          "Gilroy-Regular": {
            uri: require("@assets/font/Gilroy-Regular.ttf"),
            display: Font.FontDisplay.FALLBACK,
          },
          "Gilroy-Black": {
            uri: require("@assets/font/Gilroy-Black.ttf"),
            display: Font.FontDisplay.FALLBACK,
          },
          "Gilroy-Medium": {
            uri: require("@assets/font/Gilroy-Medium.ttf"),
            display: Font.FontDisplay.FALLBACK,
          },
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AuthProvider>
        <NavigationContainer
          theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: "#1A1735" } }}
          onReady={onLayoutRootView}
        >
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
