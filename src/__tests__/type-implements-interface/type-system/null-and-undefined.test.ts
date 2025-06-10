import { typeImplementsInterface } from '../../../rules/type-implements-interface';
import { createRuleTester } from '../../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('null and undefined handling', typeImplementsInterface, {
  valid: [
    {
      name: 'explicit null type',
      code: `
          interface MyInterface {
            prop: null;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: null;
          }
        `,
    },
    {
      name: 'explicit undefined type',
      code: `
          interface MyInterface {
            prop: undefined;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: undefined;
          }
        `,
    },
    {
      name: 'nullable type',
      code: `
          interface MyInterface {
            prop: string | null;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string | null;
          }
        `,
    },
  ],
  invalid: [
    {
      name: 'null vs undefined incompatibility',
      code: `
          interface MyInterface {
            prop: null;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: undefined;
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'prop',
            actualType: 'undefined',
            expectedType: 'null',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
