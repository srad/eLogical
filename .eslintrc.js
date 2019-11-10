module.exports = {
  root: true,
  env: {
    node: true,
  },
  "extends": [
    "plugin:vue/essential",
    "eslint:recommended",
  ],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "indent": ["error", 2],
    "quotes": ["error", "double", {"avoidEscape": true, "allowTemplateLiterals": true}],
    "no-unused-vars": ["error", {"args": "none"}],
  },
  parserOptions: {
    parser: "babel-eslint",
  },
  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
      ],
      env: {
        mocha: true,
      },
    },
  ],
};
