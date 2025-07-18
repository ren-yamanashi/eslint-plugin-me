import { typeImplementsInterface } from '../../../rules/type-implements-interface';
import { createRuleTester } from '../../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('intersection types', typeImplementsInterface, {
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
    {
      name: 'union of intersections',
      code: `
          interface A { a: string; }
          interface B { b: number; }
          interface C { c: boolean; }
          interface MyInterface {
            prop: (A & B) | (A & C);
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: (A & B) | (A & C);
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
