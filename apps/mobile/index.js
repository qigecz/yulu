import { registerRootComponent } from 'expo';

import App from './src/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately — and handles the New Architecture
// registration protocol that Expo's prebuilt MainActivity expects. Calling
// AppRegistry.registerComponent('main', ...) by hand left callable-modules
// empty (n=0) in the release build.
registerRootComponent(App);
