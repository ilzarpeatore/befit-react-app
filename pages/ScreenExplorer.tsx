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
  file?: string;
}

const ALL_SCREENS: ScreenItem[] = [
  // === ORIGINAL INTEGRATED ===
  { name: 'Welcome Auth', route: 'WelcomeAuth', category: 'Original - Auth', file: 'WelcomeAuthScreen.tsx' },
  { name: 'Login', route: 'LoginAuth', category: 'Original - Auth', file: 'LoginScreen.tsx' },
  { name: 'Register Flow', route: 'RegisterFlow', category: 'Original - Auth', file: 'RegisterScreen.tsx' },
  { name: 'Forgot Password Options', route: 'ForgotOptions', category: 'Original - Auth', file: 'ForgotPasswordOptionsScreen.tsx' },
  { name: 'Forgot Password Email', route: 'ForgotEmail', category: 'Original - Auth', file: 'ForgotPasswordEmailScreen.tsx' },
  { name: 'Password Reset Sent', route: 'ResetSent', category: 'Original - Auth', file: 'PasswordResetSentScreen.tsx' },
  { name: 'Profile Edit', route: 'ProfileEdit', category: 'Original - Auth', file: 'ProfileEditScreen.tsx' },
  { name: 'Change Password', route: 'ChangePassword', category: 'Original - Auth', file: 'ChangePasswordScreen.tsx' },
  { name: 'Home', route: 'HomePage', category: 'Original - Tabs' },
  { name: 'Club', route: 'Club', category: 'Original - Tabs', file: 'Club.tsx' },
  { name: 'Challenges', route: 'Challenges', category: 'Original - Tabs', file: 'Challenges.tsx' },
  { name: 'Today', route: 'Today', category: 'Original - Tabs', file: 'Today.tsx' },
  { name: 'Profile', route: 'Profile', category: 'Original - Main', file: 'Profile.tsx' },
  { name: 'Unboarding', route: 'Unboard', category: 'Original - Onboarding', file: 'Unboarding.tsx' },
  { name: 'Name', route: 'Name', category: 'Original - Onboarding', file: 'Name.tsx' },
  { name: 'Weight', route: 'Weight', category: 'Original - Onboarding', file: 'Weight.tsx' },
  { name: 'Height', route: 'Height', category: 'Original - Onboarding', file: 'Height.tsx' },
  { name: 'Congratulation', route: 'Congratulation', category: 'Original - Main', file: 'Congratulation.tsx' },
  { name: 'Result', route: 'Result', category: 'Original - Main', file: 'Result.tsx' },
  { name: 'Workout List', route: 'WorkoutList', category: 'Original - Workout', file: 'WorkoutList.tsx' },
  { name: 'Workout Detail', route: 'WorkoutDetail', category: 'Original - Workout', file: 'WorkoutDetail.tsx' },
  { name: 'Workout Day Exercises', route: 'WorkoutDayExercises', category: 'Original - Workout', file: 'WorkoutDayExercises.tsx' },
  { name: 'Workout Session', route: 'WorkoutSession', category: 'Original - Workout', file: 'WorkoutSessionScreen.tsx' },
  { name: 'Workout Summary', route: 'WorkoutSummary', category: 'Original - Workout', file: 'WorkoutSummary.tsx' },
  { name: 'Exercise List', route: 'ExerciseList', category: 'Original - Exercise', file: 'ExerciseList.tsx' },
  { name: 'Exercise Detail', route: 'ExerciseDetail', category: 'Original - Exercise', file: 'ExerciseDetail.tsx' },
  { name: 'Diet Dashboard', route: 'DietDashboard', category: 'Original - Diet', file: 'DietDashboard.tsx' },
  { name: 'Diet List', route: 'DietList', category: 'Original - Diet', file: 'DietList.tsx' },
  { name: 'Community Feed', route: 'CommunityFeed', category: 'Original - Social', file: 'CommunityFeed.tsx' },
  { name: 'Post Detail', route: 'PostDetail', category: 'Original - Social', file: 'PostDetail.tsx' },
  { name: 'Profile Stats', route: 'ProfileStats', category: 'Original - Profile', file: 'ProfileStats.tsx' },
  { name: 'Settings', route: 'Settings', category: 'Original - Profile', file: 'SettingsScreen.tsx' },
  { name: 'Favourite Workouts', route: 'FavouriteWorkouts', category: 'Original - Profile', file: 'FavouriteWorkouts.tsx' },

  // === MIGRATED - ROOT ===
  { name: 'About App', route: 'MigratedAboutApp', category: 'Migrated - Info', file: 'about_app_screen.tsx' },
  { name: 'About Us', route: 'MigratedAboutUs', category: 'Migrated - Info', file: 'about_us_screen.tsx' },
  { name: 'Privacy Policy', route: 'MigratedPrivacyPolicy', category: 'Migrated - Info', file: 'privacy_policy_screen.tsx' },
  { name: 'Terms & Conditions', route: 'MigratedTermsAndConditions', category: 'Migrated - Info', file: 'terms_and_conditions_screen.tsx' },
  { name: 'Activity Tracker', route: 'MigratedActivityTracker', category: 'Migrated - Health', file: 'activity_tracker_screen.tsx' },
  { name: 'Sleep Monitoring', route: 'MigratedSleepMonitoring', category: 'Migrated - Health', file: 'sleep_monitoring_screen.tsx' },
  { name: 'Steps Count', route: 'MigratedStepsCount', category: 'Migrated - Health', file: 'steps_count_screen.tsx' },
  { name: 'Water Tracker', route: 'MigratedWaterTracker', category: 'Migrated - Health', file: 'water_tracker_screen.tsx' },
  { name: 'Water Reminders', route: 'MigratedWaterReminders', category: 'Migrated - Health', file: 'water_reminders_screen.tsx' },
  { name: 'Meals Reminders', route: 'MigratedMealsReminders', category: 'Migrated - Health', file: 'meals_reminders_screen.tsx' },
  { name: 'Meals Water Reminder', route: 'MigratedMealsWaterReminder', category: 'Migrated - Health', file: 'meals_water_reminder_screen.tsx' },
  { name: 'Set Reminder', route: 'MigratedSetReminder', category: 'Migrated - Health', file: 'set_reminder_screen.tsx' },
  { name: 'Reminder', route: 'MigratedReminder', category: 'Migrated - Health', file: 'reminder_screen.tsx' },
  { name: 'Home Modern', route: 'MigratedHomeModern', category: 'Migrated - Dashboard', file: 'home_screen_modern.tsx' },
  { name: 'Main Goal', route: 'MigratedMainGoal', category: 'Migrated - Onboarding', file: 'main_goal_screen.tsx' },
  { name: 'Exercise Duration', route: 'MigratedExerciseDuration', category: 'Migrated - Onboarding', file: 'exercise_duration_screen.tsx' },
  { name: 'Exercise Duration Cast', route: 'MigratedExerciseDurationCast', category: 'Migrated - Onboarding', file: 'exercise_duration_screencast.tsx' },
  { name: 'Splash', route: 'MigratedSplash', category: 'Migrated - Onboarding', file: 'splash_screen.tsx' },
  { name: 'Walk Through', route: 'MigratedWalkThrough', category: 'Migrated - Onboarding', file: 'walk_through_screen.tsx' },
  { name: 'Missing Details', route: 'MigratedMissingDetails', category: 'Migrated - Onboarding', file: 'missing_details_screen.tsx' },
  { name: 'Workout List (migrated)', route: 'MigratedViewWorkouts', category: 'Migrated - Workout', file: 'view_workouts_screen.tsx' },
  { name: 'Workout Detail (migrated)', route: 'MigratedWorkoutDetail', category: 'Migrated - Workout', file: 'workout_detail_screen.tsx' },
  { name: 'Filter Workout', route: 'MigratedFilterWorkout', category: 'Migrated - Workout', file: 'filter_workout_screen.tsx' },
  { name: 'Workout History', route: 'MigratedWorkoutHistory', category: 'Migrated - Workout', file: 'workout_history_screen.tsx' },
  { name: 'Session History Detail', route: 'MigratedSessionHistoryDetail', category: 'Migrated - Workout', file: 'session_history_detail_screen.tsx' },
  { name: 'Workout Preview', route: 'MigratedWorkoutPreview', category: 'Migrated - Workout', file: 'workout_preview_screen.tsx' },
  { name: 'Workout Session (migrated)', route: 'MigratedWorkoutSession', category: 'Migrated - Workout', file: 'workout_session_screen.tsx' },
  { name: 'Workout Feedback', route: 'MigratedWorkoutFeedback', category: 'Migrated - Workout', file: 'workout_feedback_screen.tsx' },
  { name: 'Workout Summary (migrated)', route: 'MigratedWorkoutSummary', category: 'Migrated - Workout', file: 'workout_summary_screen.tsx' },
  { name: 'Exercise List (migrated)', route: 'MigratedExerciseList', category: 'Migrated - Exercise', file: 'exercise_list_screen.tsx' },
  { name: 'Exercise Detail (migrated)', route: 'MigratedExerciseDetail', category: 'Migrated - Exercise', file: 'exercise_detail_screen.tsx' },
  { name: 'Exercise History', route: 'MigratedExerciseHistory', category: 'Migrated - Exercise', file: 'exercise_history_screen.tsx' },
  { name: 'View Body Parts', route: 'MigratedViewBodyPart', category: 'Migrated - Exercise', file: 'view_body_part_screen.tsx' },
  { name: 'View Equipment', route: 'MigratedViewEquipment', category: 'Migrated - Exercise', file: 'view_equipment_screen.tsx' },
  { name: 'View Level', route: 'MigratedViewLevel', category: 'Migrated - Exercise', file: 'view_level_screen.tsx' },
  { name: 'Search', route: 'MigratedSearch', category: 'Migrated - Exercise', file: 'search_screen.tsx' },
  { name: 'Diet Detail', route: 'MigratedDietDetail', category: 'Migrated - Diet', file: 'diet_detail_screen.tsx' },
  { name: 'View All Diet', route: 'MigratedViewAllDiet', category: 'Migrated - Diet', file: 'view_all_diet.tsx' },
  { name: 'View Diet Category', route: 'MigratedViewDietCategory', category: 'Migrated - Diet', file: 'view_diet_category_screen.tsx' },
  { name: 'Favourite Recipe', route: 'MigratedFavouriteRecipe', category: 'Migrated - Diet', file: 'favourite_recipe_screen.tsx' },
  { name: 'Plan Screen', route: 'MigratedPlan', category: 'Migrated - Diet', file: 'plan_screen.tsx' },
  { name: 'Recipe Main', route: 'MigratedRecipeMain', category: 'Migrated - Recipes', file: 'recipe_main_screen.tsx' },
  { name: 'Recipe List V2', route: 'MigratedRecipeListV2', category: 'Migrated - Recipes', file: 'recipe_list_screen_v2.tsx' },
  { name: 'Recipe Category List', route: 'MigratedRecipeCategoryList', category: 'Migrated - Recipes', file: 'recipe_category_list_screen.tsx' },
  { name: 'Recipe Tag List', route: 'MigratedRecipeTagList', category: 'Migrated - Recipes', file: 'recipe_tag_list_screen.tsx' },
  { name: 'Product Screen', route: 'MigratedProduct', category: 'Migrated - Products', file: 'product_screen.tsx' },
  { name: 'Product Detail', route: 'MigratedProductDetail', category: 'Migrated - Products', file: 'product_detail_screen.tsx' },
  { name: 'View All Product', route: 'MigratedViewAllProduct', category: 'Migrated - Products', file: 'view_all_product_screen.tsx' },
  { name: 'View Product Category', route: 'MigratedViewProductCategory', category: 'Migrated - Products', file: 'view_product_category_screen.tsx' },
  { name: 'Shopping List', route: 'MigratedShoppingList', category: 'Migrated - Shopping', file: 'shopping_list_screen.tsx' },
  { name: 'Shopping List Detail', route: 'MigratedShoppingListDetail', category: 'Migrated - Shopping', file: 'shopping_list_detail_screen.tsx' },
  { name: 'Add Shopping List', route: 'MigratedAddShoppingList', category: 'Migrated - Shopping', file: 'add_shopping_list_screen.tsx' },
  { name: 'Community (migrated)', route: 'MigratedCommunity', category: 'Migrated - Social', file: 'community_screen.tsx' },
  { name: 'Post Details', route: 'MigratedPostDetails', category: 'Migrated - Social', file: 'post_details_screen.tsx' },
  { name: 'Other User Profile', route: 'MigratedOtherUserProfile', category: 'Migrated - Social', file: 'other_user_profile_screen.tsx' },
  { name: 'Bookmark', route: 'MigratedBookmark', category: 'Migrated - Social', file: 'bookmark_screen.tsx' },
  { name: 'Add Post', route: 'MigratedAddPost', category: 'Migrated - Social', file: 'add_post_screen.tsx' },
  { name: 'Blog Screen', route: 'MigratedBlog', category: 'Migrated - Content', file: 'blog_screen.tsx' },
  { name: 'Blog Detail', route: 'MigratedBlogDetail', category: 'Migrated - Content', file: 'blog_detail_screen.tsx' },
  { name: 'View All Blog', route: 'MigratedViewAllBlog', category: 'Migrated - Content', file: 'view_all_blog_screen.tsx' },
  { name: 'Tips', route: 'MigratedTips', category: 'Migrated - Content', file: 'tips_screen.tsx' },
  { name: 'Video Screen', route: 'MigratedVideo', category: 'Migrated - Content', file: 'video_screen.tsx' },
  { name: 'Video Detail', route: 'MigratedVideoDetail', category: 'Migrated - Content', file: 'video_detail_screen.tsx' },
  { name: 'YouTube Player', route: 'MigratedYoutubePlayer', category: 'Migrated - Content', file: 'youtube_player_screen.tsx' },
  { name: 'Chewie Player', route: 'MigratedChewie', category: 'Migrated - Content', file: 'chewie_screen.tsx' },
  { name: 'Web View', route: 'MigratedWebView', category: 'Migrated - Content', file: 'web_view_screen.tsx' },
  { name: 'Assign', route: 'MigratedAssign', category: 'Migrated - Misc', file: 'assign_screen.tsx' },
  { name: 'Favourite Screen', route: 'MigratedFavourite', category: 'Migrated - Misc', file: 'favourite_screen.tsx' },
  { name: 'Progress', route: 'MigratedProgress', category: 'Migrated - Progress', file: 'progress_screen.tsx' },
  { name: 'Progress Detail', route: 'MigratedProgressDetail', category: 'Migrated - Progress', file: 'progress_detail_screen.tsx' },
  { name: 'Profile (migrated)', route: 'MigratedProfile', category: 'Migrated - Profile', file: 'profile_screen.tsx' },
  { name: 'Profile Sandow', route: 'MigratedProfileSandow', category: 'Migrated - Profile', file: 'profile_screen_sandow.tsx' },
  { name: 'Edit Profile', route: 'MigratedEditProfile', category: 'Migrated - Profile', file: 'edit_profile_screen.tsx' },
  { name: 'Language', route: 'MigratedLanguage', category: 'Migrated - Profile', file: 'language_screen.tsx' },
  { name: 'Notification', route: 'MigratedNotification', category: 'Migrated - Profile', file: 'notification_screen.tsx' },
  { name: 'Schedule', route: 'MigratedSchedule', category: 'Migrated - Schedule', file: 'schedule_screen.tsx' },
  { name: 'My Program Calendar', route: 'MigratedMyProgramCalendar', category: 'Migrated - Schedule', file: 'my_program_calendar_screen.tsx' },
  { name: 'Subscribe', route: 'MigratedSubscribe', category: 'Migrated - Payment', file: 'subscribe_screen.tsx' },
  { name: 'Subscription Detail', route: 'MigratedSubscriptionDetail', category: 'Migrated - Payment', file: 'subscription_detail_screen.tsx' },
  { name: 'Payment', route: 'MigratedPayment', category: 'Migrated - Payment', file: 'payment_screen.tsx' },
  { name: 'Payment Scheduled', route: 'MigratedPaymentScheduled', category: 'Migrated - Payment', file: 'payment_scheduled_screen.tsx' },
  { name: 'No Data', route: 'MigratedNoData', category: 'Migrated - Misc', file: 'no_data_screen.tsx' },
  { name: 'No Internet', route: 'MigratedNoInternet', category: 'Migrated - Misc', file: 'no_internet_screen.tsx' },

  // === MIGRATED - AUTH ===
  { name: 'Forgot Password', route: 'MigratedForgotPwd', category: 'Migrated - Auth', file: 'forgot_pwd_screen.tsx' },
  { name: 'OTP', route: 'MigratedOTP', category: 'Migrated - Auth', file: 'otp_screen.tsx' },
  { name: 'Verify OTP', route: 'MigratedVerifyOtp', category: 'Migrated - Auth', file: 'verify_otp_screen.tsx' },
  { name: 'Sign In Sandow', route: 'MigratedSignInSandow', category: 'Migrated - Auth', file: 'sign_in_screen_sandow.tsx' },
  { name: 'Sign Up Sandow', route: 'MigratedSignUpSandow', category: 'Migrated - Auth', file: 'sign_up_screen_sandow.tsx' },
  { name: 'Change Pwd', route: 'MigratedChangePwd', category: 'Migrated - Auth', file: 'change_pwd_screen.tsx' },

  // === MIGRATED - HOME (Health Tracking) ===
  { name: 'Home Empty', route: 'MigratedHomeEmpty', category: 'Migrated - Home', file: 'home_empty_screen.tsx' },
  { name: 'Emparejando', route: 'MigratedEmparejando', category: 'Migrated - Home', file: 'emparejando_screen.tsx' },
  { name: 'Device Connected', route: 'MigratedDeviceConnected', category: 'Migrated - Home', file: 'device_connected_screen.tsx' },
  { name: 'Link Device Choice', route: 'MigratedLinkDeviceChoice', category: 'Migrated - Home', file: 'link_device_choice_screen.tsx' },
  { name: 'Link Device List', route: 'MigratedLinkDeviceList', category: 'Migrated - Home', file: 'link_device_list_screen.tsx' },
  { name: 'Fitness Metrics', route: 'MigratedFitnessMetrics', category: 'Migrated - Home', file: 'fitness_metrics_screen.tsx' },
  { name: 'Health Metric Insight', route: 'MigratedHealthMetricInsight', category: 'Migrated - Home', file: 'health_metric_insight_screen.tsx' },
  { name: 'Manage Health Metrics', route: 'MigratedManageHealthMetrics', category: 'Migrated - Home', file: 'manage_health_metrics_screen.tsx' },
  { name: 'Heart Rate', route: 'MigratedHeartRate', category: 'Migrated - Heart Rate', file: 'heart_rate_screen.tsx' },
  { name: 'Heart Rate Details', route: 'MigratedHeartRateDetails', category: 'Migrated - Heart Rate', file: 'heart_rate_details_screen.tsx' },
  { name: 'Heart Rate History', route: 'MigratedHeartRateHistory', category: 'Migrated - Heart Rate', file: 'heart_rate_history_screen.tsx' },
  { name: 'Heart Rate Insight', route: 'MigratedHeartRateInsight', category: 'Migrated - Heart Rate', file: 'heart_rate_insight_screen.tsx' },
  { name: 'Heart Rate Zones', route: 'MigratedHeartRateZones', category: 'Migrated - Heart Rate', file: 'heart_rate_zones_screen.tsx' },
  { name: 'Sandow Score', route: 'MigratedSandowScore', category: 'Migrated - Sandow', file: 'sandow_score_screen.tsx' },
  { name: 'Score Breakdown', route: 'MigratedScoreBreakdown', category: 'Migrated - Sandow', file: 'score_breakdown_radar_screen.tsx' },
  { name: 'Steps', route: 'MigratedSteps', category: 'Migrated - Steps', file: 'steps_screen.tsx' },
  { name: 'Steps Details', route: 'MigratedStepsDetails', category: 'Migrated - Steps', file: 'steps_details_screen.tsx' },
  { name: 'Steps History', route: 'MigratedStepsHistory', category: 'Migrated - Steps', file: 'steps_history_screen.tsx' },
  { name: 'Steps Insight', route: 'MigratedStepsInsight', category: 'Migrated - Steps', file: 'steps_insight_screen.tsx' },
  { name: 'Steps Logged', route: 'MigratedStepsLogged', category: 'Migrated - Steps', file: 'steps_logged_screen.tsx' },
  { name: 'Step Goal', route: 'MigratedStepGoal', category: 'Migrated - Steps', file: 'step_goal_screen.tsx' },
  { name: 'Step Goal Completed', route: 'MigratedStepGoalCompleted', category: 'Migrated - Steps', file: 'step_goal_completed_screen.tsx' },
  { name: 'Log Steps Form', route: 'MigratedLogStepsForm', category: 'Migrated - Steps', file: 'log_steps_form_screen.tsx' },
  { name: 'Weight (migrated)', route: 'MigratedWeight', category: 'Migrated - Weight', file: 'weight_screen.tsx' },
  { name: 'Weight Details', route: 'MigratedWeightDetails', category: 'Migrated - Weight', file: 'weight_details_screen.tsx' },
  { name: 'Weight History', route: 'MigratedWeightHistory', category: 'Migrated - Weight', file: 'weight_history_screen.tsx' },
  { name: 'Weight Insight', route: 'MigratedWeightInsight', category: 'Migrated - Weight', file: 'weight_insight_screen.tsx' },
  { name: 'Weight Deadline', route: 'MigratedWeightDeadline', category: 'Migrated - Weight', file: 'weight_deadline_screen.tsx' },
  { name: 'Weight Goal Set', route: 'MigratedWeightSetGoal', category: 'Migrated - Weight', file: 'weight_set_goal_screen.tsx' },
  { name: 'Weight Goal Summary', route: 'MigratedWeightGoalSummary', category: 'Migrated - Weight', file: 'weight_goal_summary_screen.tsx' },
  { name: 'Weight Goal Completed', route: 'MigratedWeightGoalCompleted', category: 'Migrated - Weight', file: 'weight_goal_completed_screen.tsx' },
  { name: 'Weight Lose Gain Choice', route: 'MigratedWeightLoseGainChoice', category: 'Migrated - Weight', file: 'weight_lose_gain_choice_screen.tsx' },
  { name: 'Weight Reminder', route: 'MigratedWeightReminder', category: 'Migrated - Weight', file: 'weight_reminder_screen.tsx' },
  { name: 'Log Weight Form', route: 'MigratedLogWeightForm', category: 'Migrated - Weight', file: 'log_weight_form_screen.tsx' },
  { name: 'Log Weight Keyboard', route: 'MigratedLogWeightKeyboard', category: 'Migrated - Weight', file: 'log_weight_keyboard_screen.tsx' },

  // === MIGRATED - ONBOARDING ===
  { name: 'Onboarding (migrated)', route: 'MigratedOnboarding', category: 'Migrated - Onboard Flow', file: 'onboarding_screen.tsx' },
  { name: 'Profile Setup Intro', route: 'MigratedProfileSetupIntro', category: 'Migrated - Onboard Flow', file: 'profile_setup_intro_screen.tsx' },
  { name: 'Profile Setup Form', route: 'MigratedProfileSetupForm', category: 'Migrated - Onboard Flow', file: 'profile_setup_form_screen.tsx' },
  { name: 'Avatar Setup', route: 'MigratedAvatarSetup', category: 'Migrated - Onboard Flow', file: 'avatar_setup_screen.tsx' },
  { name: 'Choose Plan', route: 'MigratedChoosePlan', category: 'Migrated - Onboard Flow', file: 'choose_plan_screen.tsx' },
  { name: 'Privacy Policy (onboard)', route: 'MigratedPrivacyPolicyOnboard', category: 'Migrated - Onboard Flow', file: 'privacy_policy_screen.tsx' },
  { name: 'Notifications (onboard)', route: 'MigratedNotificationsOnboard', category: 'Migrated - Onboard Flow', file: 'notifications_screen.tsx' },
  { name: 'Assessment Result', route: 'MigratedAssessmentResult', category: 'Migrated - Onboard Flow', file: 'assessment_result_screen.tsx' },
  { name: 'Recommendations', route: 'MigratedRecommendations', category: 'Migrated - Onboard Flow', file: 'recommendations_screen.tsx' },
  { name: 'Health (onboard)', route: 'MigratedHealth', category: 'Migrated - Onboard Flow', file: 'health_screen.tsx' },
  { name: 'Articles', route: 'MigratedArticles', category: 'Migrated - Onboard Flow', file: 'articles_screen.tsx' },
  { name: 'Onboarding Complete', route: 'MigratedOnboardingComplete', category: 'Migrated - Onboard Flow', file: 'onboarding_complete_screen.tsx' },

  // === MIGRATED - AÑADIDAS (estaban registradas en App.tsx pero faltaban aquí) ===
  { name: 'Estadísticas', route: 'MigratedStatistics', category: 'Migrated - Estadísticas', file: 'statistics_screen.tsx' },
  { name: 'Distribución de los músculos', route: 'MigratedStatisticsMuscles', category: 'Migrated - Estadísticas', file: 'statistics_muscle_distribution_screen.tsx' },
  { name: 'Distribución del cuerpo', route: 'MigratedStatisticsBody', category: 'Migrated - Estadísticas', file: 'statistics_body_distribution_screen.tsx' },
  { name: 'Recuento de series', route: 'MigratedStatisticsSeriesCount', category: 'Migrated - Estadísticas', file: 'statistics_series_count_screen.tsx' },
  { name: 'Ejercicios principales', route: 'MigratedStatisticsTopExercises', category: 'Migrated - Estadísticas', file: 'statistics_top_exercises_screen.tsx' },
  { name: 'Marcas personales', route: 'MigratedStatisticsPersonalRecords', category: 'Migrated - Estadísticas', file: 'statistics_personal_records_screen.tsx' },
  { name: 'Informe mensual', route: 'MigratedStatisticsMonthlyReport', category: 'Migrated - Estadísticas', file: 'statistics_monthly_report_screen.tsx' },
  { name: 'Coming Soon (placeholder)', route: 'MigratedComingSoon', category: 'Migrated - Estadísticas', file: 'coming_soon_screen.tsx' },
  { name: 'Antropometría', route: 'MigratedBodyMetrics', category: 'Migrated - Estadísticas', file: 'body_metrics_screen.tsx' },
  { name: 'Progreso muscular', route: 'MigratedMuscleProgress', category: 'Migrated - Exercise', file: 'muscle_progress_screen.tsx' },
  { name: 'Exercise Info', route: 'MigratedExerciseInfo', category: 'Migrated - Exercise', file: 'exercise_info_screen.tsx' },
  { name: 'Workout Template List', route: 'MigratedWorkoutTemplateList', category: 'Migrated - Workout', file: 'workout_template_list_screen.tsx' },
  { name: 'Chatting', route: 'MigratedChatting', category: 'Migrated - Social', file: 'chatting_screen.tsx' },
  { name: 'Chatting Image', route: 'MigratedChattingImage', category: 'Migrated - Social', file: 'chatting_image_screen.tsx' },
  { name: 'Habits List', route: 'MigratedHabits', category: 'Migrated - Habits', file: 'habits_list_screen.tsx' },
  { name: 'Habit Detail', route: 'MigratedHabitDetail', category: 'Migrated - Habits', file: 'habit_detail_screen.tsx' },
  { name: 'Habit Add', route: 'MigratedHabitAdd', category: 'Migrated - Habits', file: 'habit_add_screen.tsx' },
  { name: 'Check-ins List', route: 'MigratedCheckIns', category: 'Migrated - Check-ins', file: 'checkins_list_screen.tsx' },
  { name: 'Check-in Fill', route: 'MigratedCheckInFill', category: 'Migrated - Check-ins', file: 'checkin_fill_screen.tsx' },
  { name: 'Resources List', route: 'MigratedResourcesList', category: 'Migrated - Resources', file: 'resources_list_screen.tsx' },
  { name: 'Resource Detail', route: 'MigratedResourceDetail', category: 'Migrated - Resources', file: 'resource_detail_screen.tsx' },
  { name: 'Assigned Meals', route: 'MigratedAssignedMeals', category: 'Migrated - Diet', file: 'assigned_meals_screen.tsx' },
  { name: 'Weight Goal Set', route: 'MigratedWeightGoalSet', category: 'Migrated - Weight', file: 'home/weight_goal_set_screen.tsx' },
  { name: 'Weight Logged', route: 'MigratedWeightLogged', category: 'Migrated - Weight', file: 'home/weight_logged_screen.tsx' },
];

export default function ScreenExplorer({ navigation }: any) {
  const [search, setSearch] = useState('');

  const sections = useMemo(() => {
    const filtered = search.trim()
      ? ALL_SCREENS.filter(
          (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.category.toLowerCase().includes(search.toLowerCase()) ||
            (s.file ?? '').toLowerCase().includes(search.toLowerCase())
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
              <Text style={styles.screenName} numberOfLines={1}>
                {item.name}
                {item.file ? <Text style={styles.screenFile}> ({item.file})</Text> : null}
              </Text>
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
  screenFile: { fontSize: 12, color: '#8A8CB2', fontFamily: 'Gilroy-Regular' },
});
