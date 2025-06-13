import { createRuleTester } from './create-rule-tester';
import { preferArrowFunction } from '../rules/prefer-arrow-function';

const ruleTester = createRuleTester();

ruleTester.run('prefer-arrow-function', preferArrowFunction, {
  valid: [
    {
      code: 'const add = (a: number, b: number) => a + b;',
    },
    {
      code: 'const users = data.map(item => item.user);',
    },
    {
      code: 'export function exportedFunction() { return "allowed"; }',
    },
    {
      code: 'const obj = { method: function() { return "allowed"; } };',
    },
    {
      code: 'const obj = { method() { return "allowed"; } };',
    },
    {
      code: 'const asyncFn = async () => { return await fetch("/api"); };',
    },
  ],
  invalid: [
    {
      code: 'function add(a: number, b: number) { return a + b; }',
      errors: [{ messageId: 'preferArrowFunction' }],
    },
    {
      code: 'const calculate = function(x: number) { return x * 2; };',
      errors: [{ messageId: 'preferArrowFunction' }],
    },
    {
      code: `
        function helper() {
          return "helper";
        }
      `,
      errors: [{ messageId: 'preferArrowFunction' }],
    },
    {
      code: 'setTimeout(function() { console.log("timeout"); }, 1000);',
      errors: [{ messageId: 'preferArrowFunction' }],
    },
  ],
});
