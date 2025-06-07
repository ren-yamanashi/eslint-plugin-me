import { describe } from 'vitest';
import { jsdocRule } from '../rules/jsdoc';
import { createRuleTester } from './test-utils';

const ruleTester = createRuleTester();

describe('Basic Functionality', () => {
  // Interface not found
  ruleTester.run('interface not found', jsdocRule, {
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
  // Missing properties
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
    ],
  });

  // Basic type checking
  ruleTester.run('basic type checking', jsdocRule, {
    valid: [
      {
        name: 'matching types',
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
        name: 'literal type is assignable',
        code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: "literal";
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'incompatible types',
        code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop: number;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'prop',
              actualType: 'number',
              expectedType: 'string',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });
});
