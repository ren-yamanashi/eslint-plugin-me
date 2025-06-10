import { typeImplementsInterface } from '../../../rules/type-implements-interface';
import { createRuleTester } from '../../create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('interface extends', typeImplementsInterface, {
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
