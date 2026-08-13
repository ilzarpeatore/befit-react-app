import { configure } from '@testing-library/react-native';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

configure({
  asyncUtilTimeout: 5000,
});
