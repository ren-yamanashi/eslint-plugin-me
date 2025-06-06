import { Type, TypeChecker } from 'typescript';

type PropertyInfo = {
  name: string;
  type: Type;
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
      if (checker.isTypeAssignableTo(implProp.type, reqProp.type)) return acc; // skip reqProps type equal to implProp type
      return [
        ...acc,
        {
          name: reqProp.name,
          expected: checker.typeToString(reqProp.type),
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
        },
      ];
    }
    return acc; // skip if no declaration found
  }, []);
};
