module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['plugin:prettier/recommended', 'prettier'],
    rules: {
        '@typescript-eslint/no-inferrable-types': 'off',
    },
}
