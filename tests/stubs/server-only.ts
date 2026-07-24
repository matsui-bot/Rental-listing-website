// Vitest stub for the "server-only" package marker.
// The real package throws unless resolved under the "react-server" export
// condition, which Vitest's SSR module loader does not set. Since our tests
// run library/data-layer code directly (not through Next's bundler), we
// alias "server-only" to this no-op module (see vitest.config.ts).
export {};
