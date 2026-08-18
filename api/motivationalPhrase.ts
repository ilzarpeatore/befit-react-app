import apiClient from './client';

export interface MotivationalPhrase {
  text: string | null;
  condition_type?: 'workouts_this_week' | 'habits_streak' | 'general';
}

export const motivationalPhraseApi = {
  getPhrase: () => apiClient.get<{ data: MotivationalPhrase }>('motivational-phrase'),
};
