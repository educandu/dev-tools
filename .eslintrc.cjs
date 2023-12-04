module.exports = {
  extends: './src/eslint-config.cjs',
  overrides: [
    {
      files: ['**/*.js'],
      rules: {
        'no-console': ['off']
      }
    }
  ]
};
