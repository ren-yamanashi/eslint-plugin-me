import { typeImplementsInterface } from '../../../rules/type-implements-interface';
import { createRuleTester } from '../../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('optional properties', typeImplementsInterface, {
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
