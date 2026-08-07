const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('mjs');
config.resolver.sourceExts.push('cjs');

// Lazy bundling: enable async import() splitting for the 190 screens.
// The screens themselves are loaded via React.lazy() in App.tsx.
config.experiments = {
  ...config.experiments,
  asyncImport: true,
  inlineRequires: true,
};

module.exports = withNativewind(config, { inlineRem: 16 });
