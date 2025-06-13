import { createRuleTester } from './create-rule-tester';
import { preferReadonlyParams } from '../rules/prefer-readonly-params';

const ruleTester = createRuleTester();

ruleTester.run('prefer-readonly-params', preferReadonlyParams, {
  valid: [
    // Primitive types are allowed without readonly
    {
      code: 'function test(value: string) { return value; }',
    },
    {
      code: 'const fn = (count: number) => count + 1;',
    },
    {
      code: 'function test(flag: boolean) { return !flag; }',
    },
    // Parameters without type annotations
    {
      code: 'function test(value) { return value; }',
    },
    // Rest parameters (ignored)
    {
      code: 'function test(...args: string[]) { return args; }',
    },
    // Destructuring parameters (ignored)
    {
      code: 'function test({ name, age }: { name: string; age: number }) { return name; }',
    },
  ],
  invalid: [
    // Object type parameters should have readonly
    {
      code: 'function test(user: { name: string; age: number }) { return user.name; }',
      errors: [{ messageId: 'preferReadonlyParam' }],
    },
    // Array type parameters should have readonly
    {
      code: 'function test(items: string[]) { return items.length; }',
      errors: [{ messageId: 'preferReadonlyParam' }],
    },
    // Tuple type parameters should have readonly
    {
      code: 'function test(coords: [number, number]) { return coords[0]; }',
      errors: [{ messageId: 'preferReadonlyParam' }],
    },
    // Arrow functions
    {
      code: 'const processUser = (user: { name: string }) => user.name;',
      errors: [{ messageId: 'preferReadonlyParam' }],
    },
    // Function expressions
    {
      code: 'const fn = function(items: number[]) { return items.length; };',
      errors: [{ messageId: 'preferReadonlyParam' }],
    },
    // Multiple parameters
    {
      code: 'function test(user: { name: string }, items: string[]) { return user.name; }',
      errors: [{ messageId: 'preferReadonlyParam' }, { messageId: 'preferReadonlyParam' }],
    },
  ],
});
