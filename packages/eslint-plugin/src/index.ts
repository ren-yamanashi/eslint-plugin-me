import { name, version } from '../package.json';
import { jsdocRule } from './rules/jsdoc';

const rules = {
  jsdoc: jsdocRule,
};

const configs = {
  all: {
    plugins: {
      'type-implements-interface': {
        meta: { name, version },
        rules,
      },
    },
    rules: {
      'type-implements-interface/jsdoc': 'error',
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
