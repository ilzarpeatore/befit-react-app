import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const React = require('react');
  return {
    ...actual,
    useFocusEffect: (cb: () => void) => {
      React.useEffect(() => {
        cb();
      }, [cb]);
    },
  };
});

jest.mock('../../../store/AuthContext', () => ({
  useAuth: () => ({
    state: {
      user: {
        id: 1,
        first_name: 'Ana',
        display_name: 'Ana',
        profile_image: null,
        is_personal_client: false,
      },
    },
    logout: jest.fn(),
  }),
}));

jest.mock('../../../api/dashboard', () => ({
  dashboardApi: {
    getDashboard: jest.fn().mockResolvedValue({
      data: { data: { notification_data: { unread_total_count: 2 } } },
    }),
  },
}));

jest.mock('../../../api/workoutHistory', () => ({
  workoutHistoryApi: {
    getMyCalendar: jest.fn().mockResolvedValue({
      data: { data: { days: [] } },
    }),
  },
}));


jest.mock('../../../api/diet', () => ({
  dietApi: {
    getDailyPlan: jest.fn().mockResolvedValue({ data: { data: null } }),
  },
}));

jest.mock('../../../api/blog', () => ({
  blogApi: {
    getList: jest.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

jest.mock('../../../api/workoutTemplate', () => ({
  workoutTemplateApi: {
    getList: jest.fn().mockResolvedValue({
      data: {
        data: [
          { id: 1, title: 'Full Body', level_title: 'Intermedio', workout_image: null },
        ],
      },
    }),
  },
  WorkoutTemplateListItem: {},
}));

jest.mock('../../../api/checkins', () => ({
  checkinsApi: {
    getAssignedList: jest.fn().mockResolvedValue({ data: { data: [] } }),
  },
  checkinTypeLabel: jest.fn(),
}));

jest.mock('../../../api/habits', () => ({
  habitsApi: {
    getMyList: jest.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

jest.mock('../../../api/resources', () => ({
  resourcesApi: {
    getList: jest.fn().mockResolvedValue({ data: { data: [] } }),
  },
  ResourceListItem: {},
}));

jest.mock('@components/AppIcon', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: (props: any) => <Text>{props.name}</Text> };
});

jest.mock('@components/AnimatedRing', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: () => <View /> };
});

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: (props: any) => <View testID="expo-image" /> };
});

import HomeScreenModern from '../home_screen_modern';

describe('HomeScreenModern', () => {
  it('renderiza las secciones principales tras cargar los datos', async () => {
    render(<HomeScreenModern />);

    await waitFor(() => {
      expect(screen.getByText('Hola, Ana!')).toBeTruthy();
      expect(screen.getByText('Actividad de Hoy')).toBeTruthy();
      expect(screen.getByText('Actividad Semanal')).toBeTruthy();
      expect(screen.getByText('Mi plan')).toBeTruthy();
      expect(screen.getByText('Full Body')).toBeTruthy();
      expect(screen.getByText('Mi Progreso')).toBeTruthy();
    });
  });

  it('muestra el día de descanso cuando no hay workouts hoy', async () => {
    render(<HomeScreenModern />);

    await waitFor(() => {
      expect(screen.getByText('Día de descanso')).toBeTruthy();
    });
  });
});
