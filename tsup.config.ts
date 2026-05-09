import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'chain/index': 'src/chain/index.ts',
    'transaction/index': 'src/transaction/index.ts',
    'precompiles/index': 'src/precompiles/index.ts',
    'rpc/index': 'src/rpc/index.ts',
    'utils/index': 'src/utils/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  outDir: 'dist',
})
