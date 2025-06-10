import { typeImplementsInterface } from '../../../rules/type-implements-interface';
import { createRuleTester } from '../../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('generic features', typeImplementsInterface, {
  valid: [],
  invalid: [
    {
      name: 'generic interface usage',
      code: `
          interface MyInterface<T> {
            prop: T;
          }
          /** @implements {MyInterface<string>} */
          type MyType = {
            prop: string;
          }
        `,
      errors: [
        {
          messageId: 'unsupportedGeneric',
          data: {
            interfaceName: 'MyInterface<string>',
          },
        },
      ],
    },
    {
      name: 'generic interface definition',
      code: `
          interface MyInterface<T> {
            prop: T;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
          }
        `,
      errors: [
        {
          messageId: 'unsupportedGeneric',
          data: {
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
