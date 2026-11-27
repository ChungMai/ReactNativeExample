// Web, development only: go through the dev server (dev-proxy.js) because of CORS.
export const serverFetch: typeof fetch = (input, init) =>
  fetch(__DEV__ ? `/__dev-proxy?url=${encodeURIComponent(String(input))}` : input, init)
