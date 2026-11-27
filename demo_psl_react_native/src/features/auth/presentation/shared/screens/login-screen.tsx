// Login. Same UI on every device, centred and capped in width on big screens.
import Ionicons from '@expo/vector-icons/Ionicons'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../../../../shared/theme'
import { useLoginScreen } from '../hooks/use-login-screen'

function Link({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={label} hitSlop={8}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  )
}

export default function LoginScreen() {
  const vm = useLoginScreen()

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <View style={styles.end}>
              <Link label="Choose another server?" onPress={vm.chooseServer} />
              <Text style={styles.server}>Server: {vm.serverLabel}</Text>
            </View>
            <Text role="heading" style={styles.title}>Login</Text>

            <View style={styles.terms}>
              <Text style={styles.text}>By logging into an account you are agreeing with our</Text>
              <View style={styles.inline}>
                <Link label="Terms Of Service" onPress={() => vm.notPorted('Terms Of Service')} />
                <Text style={styles.text}> and </Text>
                <Link label="Privacy Policy" onPress={() => vm.notPorted('Privacy Policy')} />
              </View>
            </View>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={vm.email}
              onChangeText={vm.setEmail}
              accessibilityLabel="Email"
              placeholder="Email address"
              placeholderTextColor={colors.muted}
              maxLength={vm.emailMaxLength}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              // No autofill hint on iOS: with one, the simulator lost the last letters typed into this field.
              autoComplete={Platform.OS === 'ios' ? undefined : 'email'}
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={vm.password}
                onChangeText={vm.setPassword}
                accessibilityLabel="Password"
                placeholder="Password"
                placeholderTextColor={colors.muted}
                secureTextEntry={!vm.passwordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                onSubmitEditing={vm.submit}
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
              />
              <Pressable
                onPress={vm.togglePasswordVisible}
                accessibilityRole="button"
                accessibilityLabel={vm.passwordVisible ? 'Hide password' : 'Show password'}
                hitSlop={8}
                style={{ paddingHorizontal: 12 }}
              >
                <Ionicons name={vm.passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.muted} />
              </Pressable>
            </View>

            <View style={styles.between}>
              <Pressable
                onPress={vm.toggleKeepSignedIn}
                accessibilityRole="checkbox"
                accessibilityLabel="Keep me signed in"
                accessibilityState={{ checked: vm.keepSignedIn }}
                aria-checked={vm.keepSignedIn}
                style={styles.inline}
              >
                <Ionicons name={vm.keepSignedIn ? 'checkbox' : 'square-outline'} size={22} color={colors.primary} />
                <Text style={[styles.text, { marginLeft: 8 }]}>Keep me signed in</Text>
              </Pressable>
              <Link label="Forgot your password?" onPress={() => vm.notPorted('Forgot your password')} />
            </View>

            {vm.alert ? (
              <View accessibilityRole="alert" accessible style={styles.alert}>
                <Text style={styles.alertTitle}>{vm.alert.title}</Text>
                <Text style={styles.text}>{vm.alert.message}</Text>
                {vm.alert.detail ? <Text selectable style={styles.detail}>{vm.alert.detail}</Text> : null}
              </View>
            ) : null}

            <View style={styles.actions}>
              <Pressable
                onPress={vm.submit}
                disabled={vm.submitting}
                accessibilityRole="button"
                accessibilityLabel="Login"
                accessibilityState={{ disabled: vm.submitting, busy: vm.submitting }}
                style={({ pressed }) => [styles.login, (pressed || vm.submitting) && { opacity: 0.7 }]}
              >
                {vm.submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Login</Text>}
              </Pressable>
              <Pressable
                onPress={() => vm.notPorted('Biometric login')}
                accessibilityRole="button"
                accessibilityLabel="Login with biometrics"
                style={styles.biometric}
              >
                <Ionicons name="finger-print" size={26} color="#fff" />
              </Pressable>
            </View>

            <View style={[styles.inline, { justifyContent: 'center' }]}>
              <Text style={styles.text}>{"Don't have an account? "}</Text>
              <Link label="Register" onPress={() => vm.notPorted('Register')} />
            </View>

            {vm.demoHint ? <Text style={styles.hint}>{vm.demoHint}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.card },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  form: { width: '100%', maxWidth: 420, gap: 12 },
  end: { alignItems: 'flex-end', gap: 4 },
  server: { color: colors.muted, fontSize: 12 },
  title: { fontSize: 36, fontWeight: '700', color: colors.text },
  terms: { gap: 2, marginBottom: 8 },
  inline: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  text: { color: colors.text, fontSize: 14 },
  link: { color: colors.primary, fontSize: 14, textDecorationLine: 'underline' },
  label: { color: colors.muted, fontSize: 13, marginBottom: -6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, height: 46, color: colors.text, fontSize: 16 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
  alert: { backgroundColor: '#FDECEA', borderRadius: 8, padding: 12, gap: 2 },
  detail: { color: colors.muted, fontSize: 11, marginTop: 6 },
  alertTitle: { color: colors.danger, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  login: { flex: 1, height: 48, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  loginText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  biometric: { width: 48, height: 48, borderRadius: 5, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  hint: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 16 },
})
