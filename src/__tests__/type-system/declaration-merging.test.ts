import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('declaration merging', jsdocRule, {
  valid: [
    {
      name: 'implementing merged interface',
      code: `
          interface MyInterface {
            prop: string;
          }
          interface MyInterface {
            anotherProp: number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
            anotherProp: number;
          }
        `,
    },
  ],
  invalid: [
    {
      name: 'missing property from merged interface',
      code: `
          interface MyInterface {
            prop: string;
          }
          interface MyInterface {
            anotherProp: number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
          }
        `,
      errors: [
        {
          messageId: 'missingProperty',
          data: {
            propertyName: 'anotherProp',
            typeName: 'MyType',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
