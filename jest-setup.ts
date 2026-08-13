globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { configure } from '@testing-library/react-native';

configure({
  asyncUtilTimeout: 5000,
});
