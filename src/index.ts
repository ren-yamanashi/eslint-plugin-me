import { name, version } from '../package.json';
import { typeImplementsInterface } from './rules/type-implements-interface';
import { noForeach } from './rules/no-foreach';
import { noSideEffectInArrayMethods } from './rules/no-side-effect-in-array-methods';
import { noNestedIf } from './rules/no-nested-if';
import { noClass } from './rules/no-class';
import { noThrow } from './rules/no-throw';
import { preferArrowFunction } from './rules/prefer-arrow-function';
import { preferReadonlyParams } from './rules/prefer-readonly-params';
import { noMutationMethods } from './rules/no-mutation-methods';

const rules = {
  'type-implements-interface': typeImplementsInterface,
  'no-foreach': noForeach,
  'no-side-effect-in-array-methods': noSideEffectInArrayMethods,
  'no-nested-if': noNestedIf,
  'no-class': noClass,
  'no-throw': noThrow,
  'prefer-arrow-function': preferArrowFunction,
  'prefer-readonly-params': preferReadonlyParams,
  'no-mutation-methods': noMutationMethods,
};

const configs = {
  all: {
    plugins: {
      me: {
        meta: { name, version },
        rules,
      },
    },
    rules: {
      'me/type-implements-interface': 'error',
      'me/no-foreach': 'error',
      'me/no-side-effect-in-array-methods': 'error',
      'me/no-nested-if': 'error',
      'me/no-class': 'error',
      'me/no-throw': 'error',
      'me/prefer-arrow-function': 'error',
      'me/prefer-readonly-params': 'error',
      'me/no-mutation-methods': 'error',
    },
  },
};

export interface Plugin {
  rules: typeof rules;
  configs: typeof configs;
}

const plugin: Plugin = {
  rules,
  configs,
};

export default plugin;
