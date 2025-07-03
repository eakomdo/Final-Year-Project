const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add any custom configuration here if needed
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure proper resolution for React Native modules
config.resolver.alias = {
  ...config.resolver.alias,
};

// Add asset extensions if needed
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg'
];

module.exports = config;
