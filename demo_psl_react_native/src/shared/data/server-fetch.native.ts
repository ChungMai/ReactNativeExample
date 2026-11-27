// iOS and Android have no CORS: call the server directly.
export const serverFetch: typeof fetch = (input, init) => fetch(input, init)
