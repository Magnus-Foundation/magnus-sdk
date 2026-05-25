import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'chain/index': 'src/chain/index.ts',
    'transaction/index': 'src/transaction/index.ts',
    'precompiles/index': 'src/precompiles/index.ts',
    'rpc/index': 'src/rpc/index.ts',
    'utils/index': 'src/utils/index.ts',
    'bridge/index': 'src/bridge/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  outDir: 'dist',
  // Force the ESM build to use .mjs and CJS to use .cjs. Without this, tsup
  // would emit .js for one of them — and consumers that don't set
  // "type": "module" (like wallet-stack under TS Node16 resolution) would
  // mis-classify our package's interop. Explicit extensions = no ambiguity.
  outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.cjs' }),
})
