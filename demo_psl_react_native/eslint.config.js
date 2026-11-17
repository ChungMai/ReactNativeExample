// Flat ESLint config: Expo defaults + architecture boundaries.
const { defineConfig } = require('eslint/config')
const expo = require('eslint-config-expo/flat')

const FEATURES = ['rooms', 'devices', 'home', 'groups', 'more']
const LAYERS = ['domain', 'data', 'presentation']

// A feature's inside (domain/data/presentation) may only be reached through its index.ts.
const featureInternals = f => ({
  group: LAYERS.map(l => `**/${f}/${l}/**`),
  message: `Import "${f}" through its public API: src/features/${f}/index.ts`,
})
const rule = (patterns, paths = []) => ({ 'no-restricted-imports': ['error', { patterns, paths }] })

// UI code is split by device: shared/ (all), mobile/ (iPhone), desktop/ (iPad + Mac), web/ (browser).
// shared/ must not know about any of them, and mobile/, desktop/ and web/ must not know about each other.
// `base` repeats the other restrictions of that folder, because a later rule replaces an earlier one.
const VARIANTS = ['mobile', 'desktop', 'web']
const platformRules = (root, base = []) => [
  {
    files: [`${root}/shared/**/*.{ts,tsx}`],
    rules: rule([
      ...base,
      { group: VARIANTS.map(v => `**/${v}/**`), message: 'shared/ is used by every device: it must not import from mobile/, desktop/ or web/.' },
    ]),
  },
  ...VARIANTS.map(v => ({
    files: [`${root}/${v}/**/*.{ts,tsx}`],
    rules: rule([
      ...base,
      {
        group: VARIANTS.filter(x => x !== v).map(x => `**/${x}/**`),
        message: `${v}/ must not import from ${VARIANTS.filter(x => x !== v).join('/ or ')}/.`,
      },
    ]),
  })),
]

const UI_AND_FRAMEWORK = ['react', 'react-native', 'expo-router'].map(name => ({
  name,
  message: 'domain and data must not depend on React, React Native or Expo Router.',
}))

module.exports = defineConfig([
  expo,
  { ignores: ['dist/*', '.expo/*', 'node_modules/*', 'coverage/*'] },

  // Outside the features (routes, shared code): public APIs only. `src/di` and `tests/` are exempt:
  // the composition root has to know every concrete class, and tests reach into the code they test.
  { files: ['app/**/*.{ts,tsx}'], rules: rule(FEATURES.map(featureInternals)) },
  // shared code is generic: it must not know about any feature.
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: rule([{ group: ['**/features/**'], message: 'src/shared must not depend on features.' }]),
  },

  // Inside a feature: no deep imports into other features + clean architecture layer rules.
  ...FEATURES.flatMap(f => {
    const others = FEATURES.filter(x => x !== f).map(featureInternals)
    return [
      {
        files: [`src/features/${f}/domain/**/*.{ts,tsx}`],
        rules: rule(
          [...others, { group: ['**/data/**', '**/presentation/**'], message: 'domain must not depend on data or presentation.' }],
          UI_AND_FRAMEWORK,
        ),
      },
      {
        files: [`src/features/${f}/data/**/*.{ts,tsx}`],
        rules: rule(
          [...others, { group: ['**/presentation/**'], message: 'data must not depend on presentation.' }],
          UI_AND_FRAMEWORK,
        ),
      },
      {
        files: [`src/features/${f}/presentation/**/*.{ts,tsx}`, `src/features/${f}/*.ts`],
        rules: rule(others),
      },
      ...platformRules(`src/features/${f}/presentation`, others),
    ]
  }),

  // The navigation shell is split by platform too.
  ...platformRules('src/shared/navigation', [{ group: ['**/features/**'], message: 'src/shared must not depend on features.' }]),
])
