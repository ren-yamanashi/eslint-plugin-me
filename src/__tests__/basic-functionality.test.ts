import { describe } from 'vitest';
import { jsdocRule } from '../rules/jsdoc';
import { createRuleTester } from './utils/create-rule-tester';

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

  // JSDoc comment variations
  ruleTester.run('JSDoc comment variations', jsdocRule, {
    valid: [
      {
        name: 'multiline JSDoc comment',
        code: `
          interface MyInterface {
            prop: string;
          }
          /**
           * @implements {MyInterface}
           */
          type MyType = {
            prop: string;
          }
        `,
      },
      {
        name: 'JSDoc with additional tags',
        code: `
          interface MyInterface {
            prop: string;
          }
          /**
           * This is a type alias
           * @implements {MyInterface}
           * @example MyType = { prop: "hello" }
           */
          type MyType = {
            prop: string;
          }
        `,
      },
    ],
    invalid: [],
  });

  // Property name variations
  ruleTester.run('property name variations', jsdocRule, {
    valid: [
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
      {
        name: 'wrong numeric property type',
        code: `
          interface MyInterface {
            0: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            0: number;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: '0',
              actualType: 'number',
              expectedType: 'string',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
      {
        name: 'wrong quoted property names',
        code: `
          interface MyInterface {
            "special-prop": string;
            "with spaces": number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            "special-prop": number;
            "with spaces": string;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'special-prop',
              actualType: 'number',
              expectedType: 'string',
              interfaceName: 'MyInterface',
            },
          },
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'with spaces',
              actualType: 'string',
              expectedType: 'number',
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

  // Unsupported features (should report errors)
  ruleTester.run('unsupported features', jsdocRule, {
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
});
