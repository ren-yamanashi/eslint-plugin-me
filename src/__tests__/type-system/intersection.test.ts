import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('intersection types', jsdocRule, {
  valid: [
    {
      name: 'matching intersection types',
      code: `
          interface A {
            propA: string;
          }
          interface B {
            propB: number;
          }
          interface MyInterface {
            prop: A & B;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: A & B;
          }
        `,
    },
    {
      name: 'matching intersection types. but different order',
      code: `
          interface A {
            propA: string;
          }
          interface B {
            propB: number;
          }
          interface MyInterface {
            prop: A & B;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: B & A;
          }
        `,
    },
  ],
  invalid: [
    {
      name: 'incompatible intersection types',
      code: `
          interface A {
            propA: string;
          }
          interface B {
            propB: number;
          }
          interface MyInterface {
            prop: A & B;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: A & { propC: boolean };
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'prop',
            actualType: 'A & { propC: boolean; }',
            expectedType: 'A & B',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
