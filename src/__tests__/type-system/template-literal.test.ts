import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('template literal types', jsdocRule, {
  valid: [
    {
      name: 'simple template literal',
      code: `
          interface MyInterface {
            prop: \`hello-\${string}\`;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: \`hello-\${string}\`;
          }
        `,
    },
  ],
  invalid: [
    {
      name: 'incompatible template literal',
      code: `
          interface MyInterface {
            prop: \`hello-\${string}\`;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: \`goodbye-\${string}\`;
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'prop',
            actualType: '`goodbye-${string}`',
            expectedType: '`hello-${string}`',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
