import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
	{ ignores: ['build/', 'node_modules/', '.react-router/'] },
	js.configs.recommended,
	reactHooks.configs.flat.recommended,
	{
		files: ['**/*.{js,jsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: { ecmaFeatures: { jsx: true } },
			globals: { ...globals.browser, ...globals.node },
		},
		rules: {
			'no-unused-vars': ['error', { varsIgnorePattern: '^React$', ignoreRestSiblings: true }],
		},
	},
];
