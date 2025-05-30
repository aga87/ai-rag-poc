module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
    tsconfigRootDir: __dirname, // Fix error: "cannot read file tsconfig.json"
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/coverage/**/*", // Ignore coverage reports.
    "jest.config.js", // jest
    "/coverage/**/*", // jest
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    quotes: ["error", "double"],
    "import/no-unresolved": 0,
    indent: ["error", 2, { SwitchCase: 1 }],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { vars: "all", args: "after-used", ignoreRestSiblings: true },
    ],
  },
};
