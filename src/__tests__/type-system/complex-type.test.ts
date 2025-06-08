import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('complex type combinations', jsdocRule, {
  valid: [
    {
      name: 'union of intersections',
      code: `
          interface A { a: string; }
          interface B { b: number; }
          interface C { c: boolean; }
          interface MyInterface {
            prop: (A & B) | (A & C);
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: (A & B) | (A & C);
          }
        `,
    },
    {
      name: 'nested function types',
      code: `
          interface MyInterface {
            prop: (fn: (x: string) => number) => boolean;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: (fn: (x: string) => number) => boolean;
          }
        `,
    },
  ],
  invalid: [
    {
      name: 'complex type mismatch',
      code: `
          interface A { a: string; }
          interface B { b: number; }
          interface C { c: boolean; }
          interface MyInterface {
            prop: A & B;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: A & C;
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'prop',
            actualType: 'A & C',
            expectedType: 'A & B',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
