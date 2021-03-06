module.exports = {
    "extends": ["airbnb-base", "plugin:mocha/recommended"],
    "parserOptions": {
    	"ecmaVersion": 2018,
    },
    "env": {
    },
    "plugins": ["mocha"],
    "rules": {
        "semi": ["warn", "never"],
        "no-underscore-dangle": "off",
        "arrow-parens": "off",
        "comma-dangle": "off",
        "mocha/no-mocha-arrows": "off",
        "mocha/max-top-level-suites": "off"
    }
};
