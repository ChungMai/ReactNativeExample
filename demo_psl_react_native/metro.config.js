// Expo defaults, plus a redirect for sign-in security and a development proxy for the web app.
const path = require('path')
const { createDevProxy } = require('./dev-proxy')
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

// Web in development: see dev-proxy.js. The allowed servers come from .env.local, not from the repository.
const suffixes = (process.env.DEV_PROXY_ALLOWED_HOSTS ?? '').split(',').map(s => s.trim()).filter(Boolean)
const devProxy = createDevProxy({ suffixes })
const enhance = config.server.enhanceMiddleware
config.server.enhanceMiddleware = (middleware, server) => {
  const handle = enhance ? enhance(middleware, server) : middleware
  return (req, res, next) => devProxy(req, res, () => handle(req, res, next))
}

module.exports = config
