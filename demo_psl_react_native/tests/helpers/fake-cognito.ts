// The server half of Cognito's SRP, written independently of the client library: it accepts a
// sign-in only if the client's signature proves it knows the password. Made-up values only.
import { Sha256 } from '@aws-crypto/sha256-js'

// RFC 5054, 3072-bit group (the one Cognito uses).
const N = BigInt('0x' + [
  'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DD',
  'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED',
  'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F',
  '83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B',
  'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA0510',
  '15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7',
  'ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200C',
  'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF',
].join(''))
const g = BigInt(2)

const bytes = (hex: string) => Uint8Array.from(hex.match(/../g)!.map(h => parseInt(h, 16)))
const utf8 = (text: string) => Uint8Array.from(Buffer.from(text, 'utf8'))
const join = (...parts: Uint8Array[]) => Uint8Array.from(parts.flatMap(p => Array.from(p)))

function sha(data: Uint8Array, key?: Uint8Array): Uint8Array {
  const hash = new Sha256(key)
  hash.update(data)
  return hash.digestSync()
}
const num = (data: Uint8Array) => BigInt('0x' + Buffer.from(data).toString('hex'))
/** Two's-complement style padding, as Cognito expects before hashing a big number. */
function pad(value: bigint): Uint8Array {
  let hex = value.toString(16)
  if (hex.length % 2) hex = '0' + hex
  else if (/^[89a-f]/.test(hex)) hex = '00' + hex
  return bytes(hex)
}
function power(base: bigint, exponent: bigint): bigint {
  let result = BigInt(1)
  for (let b = base % N, e = exponent; e > 0; e >>= BigInt(1), b = (b * b) % N) {
    if (e & BigInt(1)) result = (result * b) % N
  }
  return result
}

export function fakeCognito(userPoolId: string, password: string) {
  const poolName = userPoolId.split('_')[1]
  const userId = 'user-1234'
  const salt = num(sha(utf8('salt')))
  const x = num(sha(join(pad(salt), sha(utf8(`${poolName}${userId}:${password}`)))))
  const v = power(g, x)
  const k = num(sha(join(pad(N), pad(g))))
  const b = num(sha(utf8('server secret')))
  const B = (k * v + power(g, b)) % N
  const secretBlock = Buffer.from('secret block').toString('base64')
  let A = BigInt(0)

  const jwt = `x.${Buffer.from(JSON.stringify({ exp: 4102444800, iat: 0 })).toString('base64').replace(/=+$/, '')}.x`

  /** Answers one Cognito request body. */
  return function answer(body: any): { status: number; data: any } {
    if (body.AuthFlow === 'USER_SRP_AUTH') {
      A = BigInt('0x' + body.AuthParameters.SRP_A)
      return {
        status: 200,
        data: {
          ChallengeName: 'PASSWORD_VERIFIER',
          ChallengeParameters: { SRP_B: B.toString(16), SALT: salt.toString(16), SECRET_BLOCK: secretBlock, USER_ID_FOR_SRP: userId },
        },
      }
    }
    const sent = body.ChallengeResponses
    const u = num(sha(join(pad(A), pad(B))))
    const S = power((A * power(v, u)) % N, b)
    const prk = sha(pad(S), pad(u))
    const key = sha(join(utf8('Caldera Derived Key'), Uint8Array.of(1)), prk).slice(0, 16)
    const message = join(utf8(poolName + userId), Uint8Array.from(Buffer.from(secretBlock, 'base64')), utf8(sent.TIMESTAMP))
    const expected = Buffer.from(sha(message, key)).toString('base64')

    return expected === sent.PASSWORD_CLAIM_SIGNATURE
      ? { status: 200, data: { AuthenticationResult: { AccessToken: jwt, IdToken: jwt, RefreshToken: 'r' }, ChallengeParameters: {} } }
      : { status: 400, data: { __type: 'NotAuthorizedException', message: 'Incorrect username or password.' } }
  }
}
