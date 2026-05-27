import { defineConfig } from 'tsup';

// Dual-build config: produces both ESM (.mjs) and CJS (.cjs) from the
// single TypeScript entry, with matching .d.ts / .d.mts declarations.
//
// Resulting dist/ layout:
//   dist/index.cjs     CommonJS bundle  (require('tafgeet-arabic'))
//   dist/index.mjs     ESM bundle       (import from 'tafgeet-arabic')
//   dist/index.d.ts    types for CJS    (TS resolving "require")
//   dist/index.d.mts   types for ESM    (TS resolving "import")
//
// The package.json `exports` map maps consumers to the right pair based
// on their module system. CJS files retain `require`, ESM files use
// `import`. No runtime overlap, no dual-package hazard.

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  target: 'es2018',
  // No bundling of the entry's imports — this is a leaf package with
  // zero runtime deps, and inlining wouldn't change anything. Keeping
  // splitting off produces cleaner single-file outputs.
  splitting: false,
  // Don't include the original .ts source in source maps the way the
  // raw tsc setup didn't either; consumers' debuggers wouldn't have
  // the source to point at.
  sourcemap: false,
  clean: true,
  // Treeshakable downstream.
  treeshake: true,
  // Force explicit .cjs / .mjs extensions. tsup defaults the CJS output
  // to `.js`, which is ambiguous (a `.js` file could be ESM if
  // `"type": "module"` is set on the consumer's package). Using `.cjs`
  // is unambiguous and matches what the package.json `exports` map
  // declares.
  outExtension: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.mjs' }),
});
