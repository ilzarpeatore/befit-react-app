import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import Home from './Home';

jest.mock('@store/AuthContext', () => ({
  useAuth: () => ({
    state: {
      user: {
        display_name: 'Test User',
        id: 1,
        is_personal_client: false,
      },
    },
    logout: jest.fn(),
  }),
}));

jest.mock('@api/dashboard', () => ({
  dashboardApi: {
    getDashboard: jest.fn().mockResolvedValue({
      data: {
        data: {
          steps: { total: 7500, goal: 8000 },
          workout: { totalCalories: 350, totalDuration: 45 },
          diet: { daily_kcal: 1800, eaten: 1200, left: 600, protein: 90, carbs: 200, fats: 50 },
          water: { total: 2000, goal: 3000 },
          weekly_activity: [],
        },
      },
    }),
  },
}));

jest.mock('@components/Navigation', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: () => <View /> };
});

describe('Home component', () => {
  const navigationMock = { navigate: jest.fn() } as any;

  it('renderiza correctamente con los datos del dashboard', async () => {
    render(<Home navigation={navigationMock} />);
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy();
      expect(screen.getByText('Let\'s Have')).toBeTruthy();
      expect(screen.getByText('Some Activity!')).toBeTruthy();
    });
  });

  it('renderiza las cajas de actividad para pasos, calorías y duración', async () => {
    render(<Home navigation={navigationMock} />);
    await waitFor(() => {
      expect(screen.getByText('7500')).toBeTruthy();
      expect(screen.getByText('8000')).toBeTruthy();
      expect(screen.getByText('350')).toBeTruthy();
      expect(screen.getByText('45')).toBeTruthy();
    });
  });

  it('renderiza el menú desplegable correctamente', async () => {
    render(<Home navigation={navigationMock} />);
    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeTruthy();
      expect(screen.getByText('My Favorite')).toBeTruthy();
      expect(screen.getByText('General Setting')).toBeTruthy();
      expect(screen.getByText('Community')).toBeTruthy();
      expect(screen.getByText('Logout')).toBeTruthy();
    });
  });
});