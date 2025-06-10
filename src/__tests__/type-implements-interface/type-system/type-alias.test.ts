import { typeImplementsInterface } from '../../../rules/type-implements-interface';
import { createRuleTester } from '../../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('type aliases', typeImplementsInterface, {
  valid: [
    {
      name: 'exact type alias match',
      code: `
          type SampleTypeAlias = {
            prop: string;
          }
          interface MyInterface {
            prop: SampleTypeAlias;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: SampleTypeAlias;
          }
        `,
    },
    {
      name: 'structurally equivalent type aliases',
      code: `
          type SampleTypeAlias = {
            prop: string;
          }
          type SampleTypeAlias2 = {
            prop: string;
          }
          interface MyInterface {
            prop: SampleTypeAlias;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: SampleTypeAlias2;
          }
        `,
    },
  ],
  invalid: [
    {
      name: 'incompatible type aliases',
      code: `
          type SampleTypeAlias = {
            prop: string;
          }
          type SampleTypeAlias2 = {
            prop: number;
          }
          interface MyInterface {
            prop: SampleTypeAlias;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: SampleTypeAlias2;
          }
        `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'prop',
            actualType: 'SampleTypeAlias2',
            expectedType: 'SampleTypeAlias',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
