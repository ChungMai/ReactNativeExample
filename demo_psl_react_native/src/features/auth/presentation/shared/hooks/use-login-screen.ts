// View model of the login screen. Swift: LoginViewController + LoginViewPresenter.
import { router } from 'expo-router'
import { useRef, useState, useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { AuthError, type AuthErrorCode } from '../../../domain/auth-error'
import { EMAIL_MAX_LENGTH } from '../../../domain/credentials'
import { routes } from '../../../../../shared/routes'
import { serverLabel } from './server-label'

export interface LoginAlert {
  title: string
  message: string
  detail?: string
}

const failed = (message: string): LoginAlert => ({ title: 'Login failed', message })

const ALERTS: Record<AuthErrorCode, LoginAlert> = {
  emailRequired: failed('Please enter the registered email address'),
  emailInvalid: failed('Please enter a valid Email'),
  passwordRequired: failed('Please enter password'),
  invalidCredentials: { title: 'Not able to login', message: 'Invalid email or password' },
  notConfirmed: failed('Your email is not verified yet. Verification is not part of this demo.'),
  challengeRequired: failed('This account needs another step (new password or verification code), which is not part of this demo.'),
  tooManyAttempts: failed('Too many attempts. Please wait and try again.'),
  flowNotEnabled: failed('The server does not allow SRP sign-in for this app client (USER_SRP_AUTH).'),
  noServer: failed('Please choose a server first'),
}
const SERVER_ALERT: LoginAlert = { title: 'Oops!', message: 'Internal server error' }

export function useLoginScreen() {
  const { login, getSession, getServerSettings, hasDefaultServer } = container
  const { selected } = useSyncExternalStore(getServerSettings.subscribe, getServerSettings.execute, getServerSettings.execute)
  const [email, setEmail] = useState(() => getSession.lastEmail() ?? '')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState<LoginAlert | null>(null)
  const busy = useRef(false) // state updates too late to stop a second tap

  const submit = async () => {
    if (busy.current) return
    busy.current = true
    setSubmitting(true)
    setAlert(null)
    try {
      // On success the session changes and the root layout leaves this screen.
      await login.execute({ email, password, keepSignedIn })
    } catch (e) {
      if (!(e instanceof AuthError)) setAlert(SERVER_ALERT)
      // Development builds also say which server answered, and what it said.
      else setAlert({ ...ALERTS[e.code], detail: __DEV__ ? e.detail : undefined })
    } finally {
      busy.current = false
      setSubmitting(false)
    }
  }

  return {
    email, password, passwordVisible, keepSignedIn, submitting, alert,
    emailMaxLength: EMAIL_MAX_LENGTH,
    serverLabel: selected || hasDefaultServer ? serverLabel(selected) : 'Not chosen',
    chooseServer: () => {
      setAlert(null)
      router.push(routes.selectServer)
    },
    setEmail,
    setPassword,
    togglePasswordVisible: () => setPasswordVisible(v => !v),
    toggleKeepSignedIn: () => setKeepSignedIn(v => !v),
    submit,
    /** For the links whose screens are not part of this demo. */
    notPorted: (what: string) => setAlert({ title: what, message: 'This is not part of this demo yet.' }),
  }
}
