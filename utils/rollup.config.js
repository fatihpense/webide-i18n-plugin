// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
    input: 'src/main.mjs',
    plugins: [
        resolve(),
        commonjs(),

      //  babel({
      //      exclude: 'node_modules/**'
       // })

    ],
    output: {
        file: 'bundle/i18nhelperutils.js',
        format: 'iife',
        name: 'i18nhelperutils',
        globals: {
            q: 'Q'
        }
    },

    external: [
        'q'
    ]

};