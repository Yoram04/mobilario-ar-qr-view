// Node.js polyfills for Three.js
import { Blob } from 'buffer';
globalThis.self         = globalThis;
globalThis.Blob         = Blob;
globalThis.URL          = (await import('url')).URL;
globalThis.createImageBitmap = async (blobOrBuffer) => {
  const isBlob = blobOrBuffer instanceof Blob;
  const buf = isBlob
    ? new Uint8Array(await blobOrBuffer.arrayBuffer())
    : new Uint8Array(blobOrBuffer);
  const mimeType = isBlob ? (blobOrBuffer.type || 'image/jpeg') : 'image/jpeg';
  return { width: 1, height: 1, _rawBytes: buf, _mimeType: mimeType };
};

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const [,, inputArg, outputArg] = process.argv;
if (!inputArg || !outputArg) {
  console.error('Usage: node glb_to_usdz.mjs <input.glb> <output.usdz>');
  process.exit(1);
}

const inputPath  = resolve(inputArg);
const outputPath = resolve(outputArg);
console.log('[usdz] Input: ', inputPath);
console.log('[usdz] Output:', outputPath);

const glbData = readFileSync(inputPath);

const loader = new GLTFLoader();
loader.parse(glbData.buffer, '', async (gltf) => {
  console.log('[usdz] GLB parsed OK');

  // Fix issues from SketchUp exports
  gltf.scene.updateMatrixWorld(true);
  let fixedScale = 0, fixedMat = 0;
  gltf.scene.traverse((obj) => {
    // Fix negative world-transform determinant → inverted face winding (looks black)
    if (obj.isMesh && obj.geometry) {
      if (obj.matrixWorld.determinant() < 0) {
        const geo = obj.geometry.clone();
        const idx = geo.index;
        if (idx) {
          // Swap winding: flip every triangle's b and c vertices
          for (let i = 0; i < idx.count; i += 3) {
            const b = idx.getX(i + 1);
            const c = idx.getX(i + 2);
            idx.setX(i + 1, c);
            idx.setX(i + 2, b);
          }
          idx.needsUpdate = true;
        }
        geo.computeVertexNormals();
        obj.geometry = geo;
        fixedScale++;
      }
    }
    // Normalize local scale to positive
    const s = obj.scale;
    if (s.x < 0 || s.y < 0 || s.z < 0) {
      s.set(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z));
    }

    // Fix SketchUp materials: metalness=1 looks black in Quick Look without HDR env
    if (obj.isMesh) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(mat => {
        if (!mat || !mat.isMeshStandardMaterial) return;
        const name = (mat.name || '').toLowerCase();
        const isWood = name.includes('wood') || name.includes('madera') || name.includes('timber');
        // Wood → non-metal, painted metal → low metalness
        mat.metalness = isWood ? 0.0 : Math.min(mat.metalness, 0.3);
        mat.roughness = isWood ? 0.85 : Math.min(Math.max(mat.roughness, 0.4), 0.8);
        // Quick Look doesn't support double-sided — set to front-face only
        mat.side = THREE.FrontSide;
        fixedMat++;
      });
    }
  });
  if (fixedScale > 0) console.log(`[usdz] Fixed ${fixedScale} negative-scale meshes`);
  if (fixedMat > 0) console.log(`[usdz] Fixed ${fixedMat} SketchUp materials`);

  // Suppress verbose object-dump warnings from USDZExporter
  const origWarn = console.warn;
  console.warn = (...args) => {
    const msg = String(args[0]);
    if (msg.includes('negative scales')) { process.stderr.write('[usdz] WARN: negative scale\n'); return; }
    if (msg.includes('double sided')) { process.stderr.write('[usdz] WARN: double sided material (ignored)\n'); return; }
    origWarn(...args);
  };

  const exporter = new USDZExporter();
  let usdz;
  try {
    usdz = await exporter.parseAsync(gltf.scene);
  } catch (e) {
    console.warn = origWarn;
    console.error('[usdz] Export error:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
  console.warn = origWarn;
  writeFileSync(outputPath, Buffer.from(usdz));
  console.log(`[usdz] Done! ${outputPath} (${usdz.byteLength} bytes)`);
}, (err) => {
  console.error('[usdz] GLB parse error:', err.message || err);
  console.error(err.stack);
  process.exit(1);
});
