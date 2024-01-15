module.exports = {
	"env": {
		"browser": true,
		"es2021": true,
	},
	"extends": [
		"eslint:recommended",
		"plugin:react/recommended",
	],
	"overrides": [
		{
			"env": {
				"node": true,
			},
			"files": [
				".eslintrc.{js,cjs}",
			],
			"parserOptions": {
				"sourceType": "script",
			},
		},
	],
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module",
	},
	"plugins": [
		"react",
	],
	"rules": {
		"indent": [
			"error",
			"tab",
		],
		"quotes": [
			"error",
			"double",
		],
		"semi": [
			"error",
			"always",
		],
		"comma-dangle": [
			"error",
			"only-multiline",
		],
		"no-unused-vars": [
			"warn",
		],
	},
};
