import { createRuleTester } from './create-rule-tester';
import { noClass } from '../rules/no-class';

const ruleTester = createRuleTester();

ruleTester.run('no-class', noClass, {
  valid: [
    {
      code: 'const obj = { name: "test", getValue: () => "value" };',
    },
    {
      code: 'function createUser(name: string) { return { name, getName: () => name }; }',
    },
    {
      code: 'const UserFactory = (name: string) => ({ name, getName: () => name });',
    },
    {
      code: 'interface User { name: string; }',
    },
    {
      code: 'type User = { name: string; };',
    },
  ],
  invalid: [
    {
      code: 'class User { constructor(public name: string) {} }',
      errors: [{ messageId: 'noClass' }],
    },
    {
      code: `
        class Calculator {
          add(a: number, b: number) {
            return a + b;
          }
        }
      `,
      errors: [{ messageId: 'noClass' }],
    },
    {
      code: 'export class UserService { getUser() { return null; } }',
      errors: [{ messageId: 'noClass' }],
    },
  ],
});
