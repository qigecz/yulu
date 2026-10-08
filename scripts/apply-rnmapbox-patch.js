/**
 * Apply the rnmapbox codegen patch directly to node_modules.
 *
 * Why: RN 0.74's TurboModule codegen rejects `EventEmitter<T>` properties in
 * specs (that syntax landed in RN 0.76). @rnmapbox/maps 10.1.39 uses it in
 * NativeRNMBXLocationModule, so `generateCodegenSchemaFromJavaScript` fails on
 * the new architecture. The pnpm patchedDependencies entry in
 * pnpm-workspace.yaml applies locally, but EAS's install runner ignored it —
 * this postinstall script is the transport-independent fallback. It is
 * idempotent: files already patched are detected and skipped.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MAPS = path.join(ROOT, 'node_modules', '@rnmapbox', 'maps');

let touched = 0;

function tryPatch(rel, { replace, patched }) {
  const file = path.join(MAPS, rel);
  if (!fs.existsSync(file)) {
    console.log(`[rnmapbox-patch] SKIP (missing) ${rel}`);
    return;
  }
  const raw = fs.readFileSync(file, 'utf8');
  // The package ships CRLF line endings; normalize so LF templates match either way.
  const s = raw.replace(/\r\n/g, '\n');
  if (patched(s)) {
    console.log(`[rnmapbox-patch] already patched: ${rel}`);
    return;
  }
  const out = replace(s);
  if (out === s) {
    console.log(`[rnmapbox-patch] WARN pattern not found: ${rel}`);
    return;
  }
  fs.writeFileSync(file, out);
  touched++;
  console.log(`[rnmapbox-patch] patched: ${rel}`);
}

// 1. Codegen spec sources (src/ is what codegenConfig.jsSrcsDir points to).
tryPatch('src/specs/NativeRNMBXLocationModule.ts', {
  patched: (s) => !s.includes('EventEmitter'),
  replace: (s) =>
    s
      .replace("import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';\n", '')
      .replace('\n  readonly onLocationUpdate: EventEmitter<LocationEvent>\n', '\n'),
});

// 2. Compiled locationManager outputs (what the app actually runs).
const libPatcher = (ind) => ({
  patched: (s) => s.includes("DeviceEventEmitter.addListener('onLocationUpdate'"),
  replace: (s) =>
    s.replace(
      `      } else {\n` +
        `${ind}this.subscription = MapboxGLLocationManager.onLocationUpdate(location => {\n` +
        `${ind}  this._onUpdate(location.payload);\n` +
        `${ind}});\n` +
        `      }`,
      `      } else if (typeof MapboxGLLocationManager.onLocationUpdate === 'function') {\n` +
        `${ind}this.subscription = MapboxGLLocationManager.onLocationUpdate(location => {\n` +
        `${ind}  this._onUpdate(location.payload);\n` +
        `${ind}});\n` +
        `      } else {\n` +
        `${ind}const { DeviceEventEmitter } = require('react-native');\n` +
        `${ind}this.subscription = DeviceEventEmitter.addListener('onLocationUpdate', location => {\n` +
        `${ind}  this._onUpdate(location === null || location === void 0 ? void 0 : location.payload);\n` +
        `${ind});\n` +
        `      }`,
    ),
});
tryPatch('lib/commonjs/modules/location/locationManager.js', libPatcher('        '));
tryPatch('lib/module/modules/location/locationManager.js', libPatcher('        '));

console.log(`[rnmapbox-patch] done (${touched} file(s) modified)`);
