// metro.config.cjs (Expo SDK 53+)
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true,
});

// Add additional extensions and configurations
config.resolver.sourceExts.push('cjs', 'mjs');
config.resolver.unstable_enablePackageExports = false;

// Support both ESM and CommonJS
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config; 