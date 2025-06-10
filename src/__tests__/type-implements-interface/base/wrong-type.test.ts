import { typeImplementsInterface } from '../../../rules/type-implements-interface';
import { createRuleTester } from '../../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('basic type checking', typeImplementsInterface, {
  valid: [
    {
      name: 'matching types',
      code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
          }
        `,
    },
    {
      name: 'literal type is assignable',
      code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: "literal";
          }
        `,
    },
    {
      name: 'different property order',
      code: `
            interface MyInterface {
              first: string;
              second: number;
              third: boolean;
            }
            /** @implements {MyInterface} */
            type MyType = {
              third: boolean;
              first: string;
              second: number;
            }
          `,
    },
  ],
  invalid: [
    {
      name: 'incompatible types',
      code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: number;
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'prop',
            actualType: 'number',
            expectedType: 'string',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
