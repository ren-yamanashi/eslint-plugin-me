import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('special TypeScript types', jsdocRule, {
  valid: [
    {
      name: 'any type',
      code: `
          interface MyInterface {
            prop: any;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: any;
          }
        `,
    },
    {
      name: 'unknown type',
      code: `
          interface MyInterface {
            prop: unknown;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: unknown;
          }
        `,
    },
    {
      name: 'never type',
      code: `
          interface MyInterface {
            prop: never;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: never;
          }
        `,
    },
    {
      name: 'void type',
      code: `
          interface MyInterface {
            prop: void;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: void;
          }
        `,
    },
    {
      name: 'any is assignable to specific types (TypeScript behavior)',
      code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: any;
          }
        `,
    },
    {
      name: 'specific types are assignable to any (TypeScript behavior)',
      code: `
          interface MyInterface {
            prop: any;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
          }
        `,
    },
    {
      name: 'specific types are assignable to unknown (TypeScript behavior)',
      code: `
          interface MyInterface {
            prop: unknown;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
          }
        `,
    },
  ],
  invalid: [
    {
      name: 'never vs string incompatibility',
      code: `
          interface MyInterface {
            prop: never;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'prop',
            actualType: 'string',
            expectedType: 'never',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
