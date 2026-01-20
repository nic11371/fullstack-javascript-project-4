import { createRequire } from 'module';
import globals from 'globals'

const require = createRequire(import.meta.url);
const js = require('@eslint/js');

export default [
    js.configs.recommended,
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
