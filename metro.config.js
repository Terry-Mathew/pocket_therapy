const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Minimal configuration for stability
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'ts', 'tsx'],
};

// Use default transformer configuration
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

module.exports = config;
