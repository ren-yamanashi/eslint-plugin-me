import { name, version } from '../package.json';
import { typeImplementsInterface } from './rules/type-implements-interface';
import { noForeach } from './rules/no-foreach';

const rules = {
  'type-implements-interface': typeImplementsInterface,
  'no-foreach': noForeach,
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
