import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('interface not found', jsdocRule, {
  valid: [],
  invalid: [
    {
      code: `
          /** @implements {MyInterface} */
          export type MyType = {
            prop: string;
          }
        `,
      errors: [
        {
          messageId: 'interfaceNotFound',
          data: {
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
