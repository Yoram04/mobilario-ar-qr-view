import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

const files = ['paso-gato.glb'];

for (const file of files) {
  console.log(`Procesando: ${file}`);
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const doc = await io.read(`./${file}`);

  // Eliminar extensiones de compresión del asset
  const root = doc.getRoot();
  const used = root.listExtensionsUsed();
  for (const ext of used) {
    const name = ext.extensionName;
    if (name === 'EXT_meshopt_compression' || name === 'KHR_mesh_quantization') {
      ext.dispose();
      console.log(`  ✓ Extensión eliminada: ${name}`);
    }
  }

  const outFile = file.replace('.glb', '-fixed.glb');
  await io.write(`./${outFile}`, doc);
  console.log(`  ✓ Guardado: ${outFile}`);
}
