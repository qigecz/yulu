const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(monorepoRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

// Force a single copy of react-native / react across the whole monorepo. In a
// pnpm workspace, a nested node_modules copy (e.g. left inside packages/ui)
// would otherwise be resolved for @yulu/ui's `import 'react-native'`, bundling
// a second AppRegistry instance that native can't see — which surfaces as
// "AppRegistry.runApplication not registered (n=0)" on release cold start.
config.resolver.extraNodeModules = {
  'react-native': path.resolve(monorepoRoot, 'node_modules/react-native'),
  react: path.resolve(monorepoRoot, 'node_modules/react'),
};

module.exports = config;
