const vm = require('vm'), fs = require('fs'), assert = require('assert');
const ctx = {}; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + '/../exercises.js', 'utf8'), ctx);
const X = ctx.LX; let n = 0;
const t = (name, fn) => { try { fn(); n++; console.log('ok  ' + name); } catch (e) { console.log('FAIL ' + name + '\n  ' + e.message); process.exitCode = 1; } };
t('plain removes placeholders', () => { assert.equal(X.plain('get back to (someone)'), 'get back to'); assert.equal(X.plain('as far as I know ...'), 'as far as I know'); });
t('gapOf blanks the phrase', () => { assert.equal(X.gapOf({ text: 'hang out', example: 'Want to hang out later?' }), 'Want to _____ later?'); assert.equal(X.gapOf({ text: 'bummer', example: 'That was sad.' }), null); assert.equal(X.gapOf({ text: 'x', example: '' }), null); });
console.log(`${n} passed`);
