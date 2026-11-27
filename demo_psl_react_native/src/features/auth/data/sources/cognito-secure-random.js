// Stands in for amazon-cognito-identity-js's own getRandomValues on iOS and Android (see metro.config.js).
import 'react-native-get-random-values'

export default function getRandomValues(array) {
  return globalThis.crypto.getRandomValues(array)
}
