import { createRequire } from 'module';
import globals from 'globals';

const require = createRequire(import.meta.url);
const pluginJs = require('@eslint/js');

// Обработка разных вариантов экспорта (CJS/ESM interop)
const jsConfig = pluginJs.configs || pluginJs.default.configs;

export default [
    jsConfig.recommended,
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
    },
]
