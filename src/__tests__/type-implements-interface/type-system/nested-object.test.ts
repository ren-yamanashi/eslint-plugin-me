import { typeImplementsInterface } from '../../../rules/type-implements-interface';
import { createRuleTester } from '../../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('nested object types', typeImplementsInterface, {
  valid: [
    {
      name: 'matching nested objects',
      code: `
          interface MyInterface {
            nested: {
              prop: string;
            };
          }
          /** @implements {MyInterface} */
          type MyType = {
            nested: {
              prop: string;
            };
          }
        `,
    },
  ],
  invalid: [
    {
      name: 'incompatible nested property',
      code: `
          interface MyInterface {
            nested: {
              prop: string;
            };
          }
          /** @implements {MyInterface} */
          type MyType = {
            nested: {
              prop: number;
            };
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'nested',
            actualType: '{ prop: number; }',
            expectedType: '{ prop: string; }',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
