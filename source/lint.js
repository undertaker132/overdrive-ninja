// Lint the game as the browser sees it (usage: node tools/lint.js [rule,rule...]; needs ESLint 9+): every src/*.js (except the lazy dictionaries) concatenated into one classic script,
// with findings mapped back to the source file and line.
const fs = require('fs'), path = require('path');
let ES; try { ES = require('eslint'); } catch (e) { ES = require(process.env.ESLINT_PATH || '/opt/node-tools/node_modules/eslint'); } const { Linter } = ES;
const SRC = process.env.OD_SRC || path.join(__dirname, '..', 'src'), LAZY = new Set(['13c-ar.js', '13d-ru.js']);
const files = fs.readdirSync(SRC).filter(f => f.endsWith('.js') && !LAZY.has(f)).sort();
let code = '', map = [];
for (const f of files) { const s = fs.readFileSync(path.join(SRC, f), 'utf8'); const start = code.split('\n').length; map.push([start, f]); code += s + '\n'; }
const where = ln => { let r = map[0]; for (const m of map) if (m[0] <= ln) r = m; else break; return [r[1], ln - r[0] + 1]; };
const globals = {}; for (const g of JSON.parse(fs.readFileSync(path.join(__dirname, 'browser_globals.json')))) globals[g] = 'readonly';
for (const g of ['webkitAudioContext', 'globalThis', 'structuredClone', 'queueMicrotask']) globals[g] = 'readonly';
const R = {
  'no-undef': 'error', 'no-dupe-keys': 'error', 'no-duplicate-case': 'error', 'no-unreachable': 'error', 'no-self-assign': 'error', 'no-self-compare': 'error',
  'no-dupe-else-if': 'error', 'no-cond-assign': ['error', 'except-parens'], 'use-isnan': 'error', 'valid-typeof': 'error', 'no-sparse-arrays': 'error', 'no-const-assign': 'error',
  'no-loss-of-precision': 'error', 'no-unsafe-negation': 'error', 'no-compare-neg-zero': 'error', 'no-empty-pattern': 'error', 'no-redeclare': ['error', { builtinGlobals: false }],
  'no-shadow-restricted-names': 'error', 'no-setter-return': 'error', 'getter-return': 'error', 'no-unsafe-finally': 'error', 'no-unmodified-loop-condition': 'error',
  'no-constant-binary-expression': 'error', 'no-async-promise-executor': 'error', 'no-unused-vars': ['warn', { vars: 'all', args: 'none', caughtErrors: 'none' }],
  'no-unused-expressions': ['warn', { allowShortCircuit: true, allowTernary: true }], 'no-dupe-class-members': 'error', 'no-misleading-character-class': 'error',
  'no-constant-condition': ['warn', { checkLoops: false }], 'array-callback-return': 'warn', 'no-unused-labels': 'warn', 'no-useless-catch': 'warn', 'no-unneeded-ternary': 'off',
  'no-global-assign': 'error', 'no-invalid-regexp': 'error', 'no-irregular-whitespace': 'warn', 'no-empty-character-class': 'error', 'no-obj-calls': 'error', 'no-inner-declarations': 'off',
  'no-case-declarations': 'warn', 'no-fallthrough': 'warn', 'no-prototype-builtins': 'off', 'no-control-regex': 'off', 'no-useless-escape': 'off', 'no-extra-boolean-cast': 'off',
  'no-import-assign': 'error', 'no-new-native-nonconstructor': 'error', 'no-this-before-super': 'error', 'no-class-assign': 'error'
};
const linter = new Linter({ configType: 'flat' });
const out = linter.verify(code, [{ languageOptions: { ecmaVersion: 2023, sourceType: 'script', globals }, rules: R }]);
const only = process.argv[2];
const rows = out.filter(m => !only || only.split(',').includes(m.ruleId)).map(m => { const [f, l] = where(m.line); return { f, l, c: m.column, rule: m.ruleId, sev: m.severity, msg: m.message }; });
const cnt = {}; for (const r of rows) cnt[r.rule] = (cnt[r.rule] || 0) + 1;
console.log(JSON.stringify(cnt)); // (no-self-compare hits in 05-dmath / 51-sim are NaN checks on purpose)
for (const r of rows) console.log(`${r.sev === 2 ? 'E' : 'w'} ${r.f}:${r.l}:${r.c} [${r.rule}] ${r.msg}`);
