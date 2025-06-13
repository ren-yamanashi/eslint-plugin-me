import { createRuleTester } from './create-rule-tester';
import { noThrow } from '../rules/no-throw';

const ruleTester = createRuleTester();

ruleTester.run('no-throw', noThrow, {
  valid: [
    {
      code: 'function getUser() { return { error: "User not found" }; }',
    },
    {
      code: 'const result = success ? { data: value } : { error: "Failed" };',
    },
    {
      code: 'function divide(a: number, b: number) { return b === 0 ? null : a / b; }',
    },
    {
      code: 'const parseNumber = (str: string) => isNaN(Number(str)) ? undefined : Number(str);',
    },
  ],
  invalid: [
    {
      code: 'function getUser() { throw new Error("User not found"); }',
      errors: [{ messageId: 'noThrow' }],
    },
    {
      code: 'if (condition) { throw new TypeError("Invalid type"); }',
      errors: [{ messageId: 'noThrow' }],
    },
    {
      code: `
        function divide(a: number, b: number) {
          if (b === 0) {
            throw new Error("Division by zero");
          }
          return a / b;
        }
      `,
      errors: [{ messageId: 'noThrow' }],
    },
  ],
});
