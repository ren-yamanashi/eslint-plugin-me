import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('optional properties', jsdocRule, {
  valid: [
    {
      name: 'interface optional, implementation required (allowed)',
      code: `
          interface MyInterface {
            prop?: string;
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
      name: 'interface required, implementation optional (not allowed)',
      code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop?: string;
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'prop',
            actualType: 'string | undefined',
            expectedType: 'string',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
