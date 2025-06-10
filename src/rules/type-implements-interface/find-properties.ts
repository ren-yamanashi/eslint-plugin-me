import { Declaration, Type, TypeChecker } from 'typescript';
import { SYNTAX_KINDS, TYPE_FLAGS } from '../../shared/constants/ts-internal-flags';

type PropertyInfo = {
  name: string;
  type: Type;
  isReadonly: boolean;
};

/**
 * Find for properties defined in the interface but not implemented in Type
 * @param implementationType target type that should implement the interface
 * @param interfaceType interface type that should be implemented
 * @param checker TypeScript type checker
 * @returns array of property names that are required by the interface but not implemented in the type
 */
export const findMissingProperties = (
  implementationType: Type,
  interfaceType: Type,
  checker: TypeChecker,
): PropertyInfo[] => {
  const implProps = extractTypeProperties(implementationType, checker);
  const requiredProps = extractTypeProperties(interfaceType, checker);

  return requiredProps.reduce<PropertyInfo[]>((acc, reqProp) => {
    if (!implProps.some(implProp => implProp.name === reqProp.name)) return [...acc, reqProp];
    return acc;
  }, []);
};

/**
 * Find for properties that are defined in the interface but have different type in the implementation
 * @param implementationType target type that should implement the interface
 * @param interfaceType interface type that should be implemented
 * @param checker TypeScript type checker
 * @returns array of properties that are required by the interface but have different types in the implementation
 */
export const findIncompatibleProperties = (
  implementationType: Type,
  interfaceType: Type,
  checker: TypeChecker,
): readonly { name: string; expected: string; actual: string }[] => {
  const implProps = extractTypeProperties(implementationType, checker);
  const requiredProps = extractTypeProperties(interfaceType, checker);
  return requiredProps.reduce<{ name: string; expected: string; actual: string }[]>(
    (acc, reqProp) => {
      const implProp = implProps.find(({ name }) => name === reqProp.name);
      if (!implProp) return acc; // skip if property is not implemented

      const isCompatible = (() => {
        if (reqProp.isReadonly && !implProp.isReadonly) return false;
        if (isInterfaceUnion(reqProp.type)) {
          // NOTE: For Union types, allow partial matches (implementation can be a subset)
          return (
            checker.isTypeAssignableTo(implProp.type, reqProp.type) ||
            checker.isTypeAssignableTo(reqProp.type, implProp.type)
          );
        }
        // NOTE: For non-Union types, use standard assignability check
        return checker.isTypeAssignableTo(implProp.type, reqProp.type);
      })();

      if (isCompatible) return acc; // skip if types are compatible

      return [
        ...acc,
        {
          name: reqProp.name,
          expected: `${reqProp.isReadonly ? 'readonly ' : ''}${checker.typeToString(reqProp.type)}`,
          actual: checker.typeToString(implProp.type),
        },
      ];
    },
    [],
  );
};

const extractTypeProperties = (type: Type, checker: TypeChecker): PropertyInfo[] => {
  return type.getProperties().reduce<PropertyInfo[]>((acc, symbol) => {
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    if (declaration) {
      return [
        ...acc,
        {
          name: symbol.getName(),
          type: checker.getTypeOfSymbolAtLocation(symbol, declaration),
          isReadonly: isReadonlyProperty(declaration),
        },
      ];
    }
    return acc; // skip if no declaration found
  }, []);
};

const isReadonlyProperty = (declaration: Declaration): boolean => {
  const modifier: unknown =
    'modifiers' in declaration &&
    Array.isArray(declaration.modifiers) &&
    declaration.modifiers.length
      ? declaration.modifiers[0]
      : null;
  return (
    typeof modifier === 'object' &&
    modifier !== null &&
    'kind' in modifier &&
    typeof modifier.kind === 'number' &&
    modifier.kind === SYNTAX_KINDS.READONLY_KEYWORD
  );
};

const isInterfaceUnion = (type: Type): boolean => {
  // NOTE: In order not to make it dependent on the typescript library, it defines its own unions.
  //       Therefore, the type information structures do not match.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  return type.flags === TYPE_FLAGS.UNION;
};
