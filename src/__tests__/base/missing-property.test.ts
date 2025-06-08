import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('missing properties', jsdocRule, {
  valid: [
    {
      name: 'empty interface and type',
      code: `
          interface MyInterface {}
          /** @implements {MyInterface} */
          type MyType = {}
        `,
    },
    {
      name: 'matching properties',
      code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
          }
        `,
    },
    {
      name: 'implementation with extra properties (allowed)',
      code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: string;
            extraProp: number;
          }
        `,
    },
    {
      name: 'numeric property names',
      code: `
          interface MyInterface {
            0: string;
            123: number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            0: string;
            123: number;
          }
        `,
    },
    {
      name: 'quoted property names',
      code: `
          interface MyInterface {
            "special-prop": string;
            "with spaces": number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            "special-prop": string;
            "with spaces": number;
          }
        `,
    },
  ],
  invalid: [
    {
      name: 'missing required property',
      code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
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
    {
      name: 'missing numeric property',
      code: `
          interface MyInterface {
            0: string;
            prop: number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: number;
          }
        `,
      errors: [
        {
          messageId: 'missingProperty',
          data: {
            propertyName: '0',
            typeName: 'MyType',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
    {
      name: 'missing quoted property',
      code: `
          interface MyInterface {
            "special-prop": string;
            "with spaces": number;
          }
          /** @implements {MyInterface} */
          type MyType = {}
        `,
      errors: [
        {
          messageId: 'missingProperty',
          data: {
            propertyName: 'special-prop',
            typeName: 'MyType',
            interfaceName: 'MyInterface',
          },
        },
        {
          messageId: 'missingProperty',
          data: {
            propertyName: 'with spaces',
            typeName: 'MyType',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
