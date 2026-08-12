import { AppRegistry } from 'react-native';
import App from './src/App';

// Surface any error thrown during module load (before registerComponent runs)
// to native logcat instead of the generic "AppRegistry not registered (n=0)"
// message, so cold-start crashes remain diagnosable.
const origHandler = global.ErrorUtils?.getGlobalHandler?.();
global.ErrorUtils?.setGlobalHandler?.((err, isFatal) => {
  try {
    // eslint-disable-next-line no-console
    console.error('YULU_GLOBAL_ERROR:', err?.stack || err);
  } catch {}
  if (origHandler) origHandler(err, isFatal);
});

AppRegistry.registerComponent('main', () => App);
