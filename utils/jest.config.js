// jest.config.js
module.exports = {
    verbose: true,
    moduleFileExtensions: ["js", "json", "jsx", "node", "mjs"],
    testMatch: [
        '**/spec/**/*.js?(x)', '**/?(*.)(spec|test).js?(x)',
        '**/spec/**/*.mjs', '**/?(*.)(spec|test).mjs'
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/"
    ],
    transform: {
        '^.+\\.m?js$': 'babel-jest',
    },
};