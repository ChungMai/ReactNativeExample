// Expo defaults, plus one redirect for sign-in security.
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)
const secureRandom = path.resolve(__dirname, 'src/features/auth/data/sources/cognito-secure-random.js')

// On iOS and Android, amazon-cognito-identity-js falls back to Math.random() in development and has no
// random source at all in Expo Go. Give it the platform's secure generator instead.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const fromCognito = context.originModulePath.includes(`${path.sep}amazon-cognito-identity-js${path.sep}`)
  if (platform !== 'web' && fromCognito && moduleName === './getRandomValues') {
    return { type: 'sourceFile', filePath: secureRandom }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
