import { createRequire } from 'module';
import globals from 'globals'

const require = createRequire(import.meta.url);
const pluginJs = require('@eslint/js');

export default [
    pluginJs.configs.recommended,
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
