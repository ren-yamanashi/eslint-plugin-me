import { describe } from 'vitest';
import { jsdocRule } from '../rules/jsdoc';
import { createRuleTester } from './test-utils';

const ruleTester = createRuleTester();

describe('TypeScript Language Features', () => {
  // Optional properties
  ruleTester.run('optional properties', jsdocRule, {
    valid: [
      {
        name: 'interface optional, implementation required (allowed)',
        code: `
          interface MyInterface {
            prop?: string;
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
        name: 'interface required, implementation optional (not allowed)',
        code: `
          interface MyInterface {
            prop: string;
          }
          /** @implements {MyInterface} */
          type MyType = {
            prop?: string;
          }
        `,
        errors: [
          {
            messageId: 'wrongType',
            data: {
              propertyName: 'prop',
              actualType: 'string | undefined',
              expectedType: 'string',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Interface inheritance
  ruleTester.run('interface inheritance', jsdocRule, {
    valid: [
      {
        name: 'implementing extended interface',
        code: `
          interface BaseInterface {
            baseProp: string;
          }
          interface MyInterface extends BaseInterface {
            prop: number;
          }
          /** @implements {MyInterface} */
          type MyType = {
            baseProp: string;
            prop: number;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'missing inherited property',
        code: `
          interface BaseInterface {
            baseProp: string;
          }
          interface MyInterface extends BaseInterface {
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
              propertyName: 'baseProp',
              typeName: 'MyType',
              interfaceName: 'MyInterface',
            },
          },
        ],
      },
    ],
  });

  // Declaration merging
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

  // Export/Import scenarios
  ruleTester.run('module system', jsdocRule, {
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
});
