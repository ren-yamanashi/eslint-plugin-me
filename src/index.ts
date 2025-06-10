import { name, version } from '../package.json';
import { typeImplementsInterface } from './rules/type-implements-interface';

const rules = {
  'type-implements-interface': typeImplementsInterface,
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
