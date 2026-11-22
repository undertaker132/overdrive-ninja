// Lint the game as the browser sees it (usage: node source/lint.js [rule,rule...]; needs ESLint 9+): every src/*.js (except the lazy dictionaries) concatenated into one classic script,
// with findings mapped back to the source file and line.
const fs = require('fs'), path = require('path');
let ES; try { ES = require('eslint'); } catch (e) { ES = require(process.env.ESLINT_PATH || '/opt/node-tools/node_modules/eslint'); } const { Linter } = ES;
const SRC = process.env.OD_SRC || path.join(__dirname, 'src'), LAZY = new Set();
const AAA = path.join(__dirname, 'aaa'); // the upgrade modules run after the core in the same page, so they are checked together
const files = fs.readdirSync(SRC).filter(f => f.endsWith('.js') && !LAZY.has(f)).sort().map(f => path.join(SRC, f)).concat(fs.readdirSync(AAA).filter(f => f.endsWith('.js')).sort().map(f => path.join(AAA, f)));
let code = '', map = [];
for (const fp of files) { const f = path.relative(__dirname, fp), s = fs.readFileSync(fp, 'utf8'); const start = code.split('\n').length; map.push([start, f]); code += s + '\n'; }
const where = ln => { let r = map[0]; for (const m of map) if (m[0] <= ln) r = m; else break; return [r[1], ln - r[0] + 1]; };
const globals = {}; for (const g of JSON.parse(fs.readFileSync(path.join(__dirname, 'browser_globals.json')))) globals[g] = 'readonly';
for (const g of ['firebase', 'webkitAudioContext', 'globalThis', 'structuredClone', 'queueMicrotask']) globals[g] = 'readonly';
const R = {
  'no-undef': 'error', 'no-dupe-keys': 'error', 'no-duplicate-case': 'error', 'no-unreachable': 'error', 'no-self-assign': 'error', 'no-self-compare': 'off' /* NaN checks in 05-dmath / 51-sim */,
  'no-dupe-else-if': 'error', 'no-cond-assign': ['error', 'except-parens'], 'use-isnan': 'error', 'valid-typeof': 'error', 'no-sparse-arrays': 'error', 'no-const-assign': 'error',
  'no-loss-of-precision': 'off' /* exact fdlibm constants in 05-dmath */, 'no-unsafe-negation': 'error', 'no-compare-neg-zero': 'error', 'no-empty-pattern': 'error', 'no-redeclare': ['error', { builtinGlobals: false }],
  'no-shadow-restricted-names': 'error', 'no-setter-return': 'error', 'getter-return': 'error', 'no-unsafe-finally': 'error', 'no-unmodified-loop-condition': 'warn',
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
console.log(JSON.stringify(cnt));
for (const r of rows) console.log(`${r.sev === 2 ? 'E' : 'w'} ${r.f}:${r.l}:${r.c} [${r.rule}] ${r.msg}`);
if (rows.some(r => r.sev === 2)) process.exitCode = 1; // errors fail the check (CI); warnings only print
