const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('mjs');
config.resolver.sourceExts.push('cjs');

module.exports = withNativewind(config, { inlineRem: 16 });
