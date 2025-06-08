import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('exported interface and type', jsdocRule, {
  valid: [
    {
      name: 'exported interface and type',
      code: `
          export interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          export type MyType = {
            prop: string;
          }
        `,
    },
  ],
  invalid: [
    {
      name: 'exported interface with missing property in exported type',
      code: `
          export interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          export type MyType = {
            _prop: string;
          }
        `,
      errors: [
        {
          messageId: 'missingProperty',
          data: {
            propertyName: 'prop',
            typeName: 'MyType',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
