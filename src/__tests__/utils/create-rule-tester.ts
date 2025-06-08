import { RuleTester } from '@typescript-eslint/rule-tester';

export const createRuleTester = () =>
  new RuleTester({
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.ts*'],
        },
      },
    },
  });
