module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: ["plugin:@typescript-eslint/recommended", "prettier"],
  env: { node: true, es2022: true },
  rules: {
    "prettier/prettier": "warn"
  }
};