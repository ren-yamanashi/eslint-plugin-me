import { createRuleTester } from './create-rule-tester';
import { noSideEffectInArrayMethods } from '../rules/no-side-effect-in-array-methods';

const ruleTester = createRuleTester();

ruleTester.run('no-side-effect-in-array-methods', noSideEffectInArrayMethods, {
  valid: [
    {
      code: 'const result = arr.map(x => x * 2);',
    },
    {
      code: 'const result = arr.filter(x => x > 0);',
    },
    {
      code: 'const result = arr.reduce((acc, x) => acc + x, 0);',
    },
    {
      code: 'const result = arr.find(x => x.id === targetId);',
    },
    {
      code: 'arr.forEach(x => console.log(x));',
    },
    {
      code: 'const result = arr.map(x => ({ ...x, doubled: x.value * 2 }));',
    },
  ],
  invalid: [
    {
      code: 'const result = arr.map(x => { console.log(x); return x * 2; });',
      errors: [{ messageId: 'noSideEffect' }],
    },
    {
      code: 'const result = arr.filter(x => { sideVar = x; return x > 0; });',
      errors: [{ messageId: 'noSideEffect' }],
    },
    {
      code: 'const result = arr.reduce((acc, x) => { acc.push(x); return acc; }, []);',
      errors: [{ messageId: 'noSideEffect' }],
    },
    {
      code: 'const result = arr.map(x => { x++; return x; });',
      errors: [{ messageId: 'noSideEffect' }],
    },
    {
      code: 'const result = arr.find(x => { throw new Error("test"); });',
      errors: [{ messageId: 'noSideEffect' }],
    },
  ],
});
