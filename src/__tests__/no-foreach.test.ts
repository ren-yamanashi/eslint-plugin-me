import { noForeach } from '../rules/no-foreach';
import { createRuleTester } from './create-rule-tester';

const ruleTester = createRuleTester();

ruleTester.run('no-foreach', noForeach, {
  valid: [
    {
      name: 'for...of loop',
      code: `
        const arr = [1, 2, 3];
        for (const item of arr) {
          console.log(item);
        }
      `,
    },
    {
      name: 'for loop',
      code: `
        const arr = [1, 2, 3];
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `,
    },
    {
      name: 'map method',
      code: `
        const arr = [1, 2, 3];
        const result = arr.map(x => x * 2);
      `,
    },
    {
      name: 'filter method',
      code: `
        const arr = [1, 2, 3];
        const result = arr.filter(x => x > 1);
      `,
    },
    {
      name: 'other method named forEach on non-array',
      code: `
        const obj = {
          forEach: () => {}
        };
        obj.forEach();
      `,
    },
  ],
  invalid: [
    {
      name: 'array forEach',
      code: `
        const arr = [1, 2, 3];
        arr.forEach(item => console.log(item));
      `,
      errors: [
        {
          messageId: 'noForeach',
        },
      ],
    },
    {
      name: 'forEach with function',
      code: `
        const arr = [1, 2, 3];
        arr.forEach(function(item) {
          console.log(item);
        });
      `,
      errors: [
        {
          messageId: 'noForeach',
        },
      ],
    },
    {
      name: 'chained forEach',
      code: `
        [1, 2, 3].forEach(item => console.log(item));
      `,
      errors: [
        {
          messageId: 'noForeach',
        },
      ],
    },
    {
      name: 'forEach with complex expression',
      code: `
        const arr: number[] = [1, 2, 3];
        arr.forEach((item, index) => {
          console.log(index, item);
        });
      `,
      errors: [
        {
          messageId: 'noForeach',
        },
      ],
    },
  ],
});
