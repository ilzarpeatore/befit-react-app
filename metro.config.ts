import { getDefaultConfig } from 'expo/metro-config';

const config = getDefaultConfig(__dirname);
//@ts-ignore
config.resolver.sourceExts.push('mjs');
//@ts-ignore
config.resolver.sourceExts.push('cjs');

module.exports = config;
