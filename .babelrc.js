module.exports = {
  presets: [
    [
      '@babel/env',
      {
        target: {
          browsers: [
            'ie >= 11',
            'last 2 Edge versions',
            'last 4 Chrome versions',
            'last 4 Firefox versions',
            'last 2 Safari versions',
          ],
        },
        loose: true,
        modules: process.env.BABEL_ENV === 'esm' ? false : "commonjs"
      },
    ],
    '@babel/react',
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-class-properties',
  ],
};
