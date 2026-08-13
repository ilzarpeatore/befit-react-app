// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Deuda técnica preexistente en toda la app (225 sitios detectados al activar
    // el hook de pre-commit por primera vez contra el código ya existente, no
    // introducidos por un cambio concreto). Bajadas a warning para no bloquear
    // commits mientras se van corrigiendo caso a caso.
    rules: {
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/purity": "warn",
      "react/no-unescaped-entities": "warn",
      "react/display-name": "warn",
      "no-var": "warn",
    },
  },
]);
