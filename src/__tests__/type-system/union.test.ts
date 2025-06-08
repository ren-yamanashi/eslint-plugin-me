import { jsdocRule } from '../../rules/jsdoc';
import { createRuleTester } from '../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('Union Type Tests', jsdocRule, {
  valid: [
    {
      name: 'implementation is subset of union',
      code: `
            interface MyInterface {
              prop: string | number;
            }
            /** @implements {MyInterface} */
            type MyType = {
              prop: string;
            }
          `,
    },
    {
      name: 'implementation is subset of larger union',
      code: `
            interface MyInterface {
              prop: string | number | boolean;
            }
            /** @implements {MyInterface} */
            type MyType = {
              prop: string | number;
            }
          `,
    },
    {
      name: 'string literal types',
      code: `
          interface MyInterface {
            status: "pending" | "completed";
          }
          /** @implements {MyInterface} */
          type MyType = {
            status: "pending" | "completed";
          }
        `,
    },
    {
      name: 'string literal types. but only one literal',
      code: `
          interface MyInterface {
            status: "pending" | "completed";
          }
          /** @implements {MyInterface} */
          type MyType = {
            status: "pending";
          }
        `,
    },
    {
      name: 'number literal types',
      code: `
          interface MyInterface {
            code: 200 | 404 | 500;
          }
          /** @implements {MyInterface} */
          type MyType = {
            code: 200 | 404 | 500;
          }
        `,
    },
    {
      name: 'number literal types. but only one literal',
      code: `
          interface MyInterface {
            code: 200 | 404 | 500;
          }
          /** @implements {MyInterface} */
          type MyType = {
            code: 200;
          }
        `,
    },
    {
      name: 'boolean literal types. but only one literal',
      code: `
          interface MyInterface {
            flag: true | false;
          }
          /** @implements {MyInterface} */
          type MyType = {
            flag: true;
          }
        `,
    },
  ],
  invalid: [
    {
      name: 'implementation extends beyond interface union',
      code: `
            interface MyInterface {
              prop: string;
            }
            /** @implements {MyInterface} */
            type MyType = {
              prop: string | number;
            }
          `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'prop',
            actualType: 'string | number',
            expectedType: 'string',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
    {
      name: 'implementation extends beyond interface union (string literal)',
      code: `
            interface MyInterface {
              prop: "pending";
            }
            /** @implements {MyInterface} */
            type MyType = {
              prop: "pending" | "completed";
            }
          `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'prop',
            actualType: '"pending" | "completed"',
            expectedType: '"pending"',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
    {
      name: 'implementation extends beyond interface union (number literal)',
      code: `
            interface MyInterface {
              prop: 200;
            }
            /** @implements {MyInterface} */
            type MyType = {
              prop: 200 | 404;
            }
          `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'prop',
            actualType: '200 | 404',
            expectedType: '200',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
    {
      name: 'implementation extends beyond interface union (boolean literal)',
      code: `
            interface MyInterface {
              prop: true;
            }
            /** @implements {MyInterface} */
            type MyType = {
              prop: true | false;
            }
          `,
      errors: [
        {
          messageId: 'wrongType',
          data: {
            propertyName: 'prop',
            actualType: 'boolean',
            expectedType: 'true',
            interfaceName: 'MyInterface',
          },
        },
      ],
    },
  ],
});
