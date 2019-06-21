module.exports = {
  extends: [
    // recommended rules from eslint-config-airbnb
    "airbnb-base",
    // recommended rules from eslint-plugin-prettier
    "plugin:prettier/recommended"
  ],
  env: {
    node: true,
    es6: true
  },
  rules: {
    // allow for a single named export without it being default
    "import/prefer-default-export": 0,
    // rules for prettier
    "prettier/prettier": [
      "error", 
      { 
        "arrowParens": "always",
        "semi": false,
        "singleQuote": true,
        "printWidth": 80,
        "tabWidth": 2
      }
    ]
  }
};
