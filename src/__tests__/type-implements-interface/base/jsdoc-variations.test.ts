import { typeImplementsInterface } from '../../../rules/type-implements-interface';
import { createRuleTester } from '../../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('JSDoc comment variations', typeImplementsInterface, {
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
