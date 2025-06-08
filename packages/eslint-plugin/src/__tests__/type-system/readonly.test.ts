import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('readonly properties', jsdocRule, {
  valid: [
    {
      name: 'readonly property in interface',
      code: `
          interface MyInterface {
            readonly prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            readonly prop: string;
          }
    `,
    },
    {
      name: 'readonly property in type (interface property is not readonly)',
      code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            readonly prop: string;
          }
    `,
    },
  ],
  invalid: [
    {
      name: 'readonly property in interface',
      code: `
          interface MyInterface {
            readonly prop: string;
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
            expectedType: 'readonly string',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
