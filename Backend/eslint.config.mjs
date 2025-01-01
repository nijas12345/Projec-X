import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["Controllers/**/*.{js,mjs,cjs,ts}"],  // Apply this to all JS and TS files in the backend folder
  },
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" },
  },
  {
    languageOptions: { globals: globals.node },  // Use Node.js globals for backend code
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
