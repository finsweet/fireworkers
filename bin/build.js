import { execSync } from 'child_process';
import { build } from 'esbuild';

const entryPoints = ['src/index.ts'];

await build({
  entryPoints,
  logLevel: 'info',
  bundle: true,
  outbase: './src',
  outdir: './dist',
  format: 'esm',
});

execSync('tsc --emitDeclarationOnly --declaration --project tsconfig.build.json', {
  stdio: 'inherit',
});
