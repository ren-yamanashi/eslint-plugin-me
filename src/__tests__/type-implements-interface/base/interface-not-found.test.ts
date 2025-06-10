import { typeImplementsInterface } from '../../../rules/type-implements-interface';
import { createRuleTester } from '../../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('interface not found', typeImplementsInterface, {
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
