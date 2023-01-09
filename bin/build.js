import { exec } from 'child_process';
import { build } from 'esbuild';

const entryPoints = ['src/index.ts'];

build({
  entryPoints,
  logLevel: 'info',
  bundle: true,
  outbase: './src',
  outdir: './dist',
  format: 'esm',
});

exec(`tsc --emitDeclarationOnly --declaration --project tsconfig.build.json`);
