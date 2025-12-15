import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),

  // Regras customizadas:
  {
    rules: {
      // Ponto-e-vírgula obrigatório (regra core)
      'semi': ['error', 'always'],

      // Aspas simples, mas permitir template literals (``) (regra core)
      'quotes': ['error', 'single', { 'allowTemplateLiterals': true }]
    },
  },
]);

export default eslintConfig;
