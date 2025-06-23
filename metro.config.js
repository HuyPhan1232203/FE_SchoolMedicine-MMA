// metro.config.js (Expo SDK 53+)
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Ensure Metro knows about .cjs files (Firebase uses these)
config.resolver.sourceExts.push('cjs');
// Disable Metro's ESM export resolution for now (use legacy resolution)
config.resolver.unstable_enablePackageExports = false;

module.exports = config; 