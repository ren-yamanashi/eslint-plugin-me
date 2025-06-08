import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('array and tuple types', jsdocRule, {
  valid: [
    {
      name: 'matching array types',
      code: `
          interface MyInterface {
            items: string[];
          }
          /** @implements {MyInterface} */
          type MyType = {
            items: string[];
          }
        `,
    },
    {
      name: 'matching tuple types',
      code: `
          interface MyInterface {
            tuple: [string, number];
          }
          /** @implements {MyInterface} */
          type MyType = {
            tuple: [string, number];
          }
        `,
    },
  ],
  invalid: [
    {
      name: 'incompatible array element types',
      code: `
          interface MyInterface {
            items: string[];
          }
          /** @implements {MyInterface} */
          type MyType = {
            items: number[];
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'items',
            actualType: 'number[]',
            expectedType: 'string[]',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
    {
      name: 'wrong tuple order',
      code: `
          interface MyInterface {
            tuple: [string, number];
          }
          /** @implements {MyInterface} */
          type MyType = {
            tuple: [number, string];
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'tuple',
            actualType: '[number, string]',
            expectedType: '[string, number]',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
