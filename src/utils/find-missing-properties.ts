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
  const implProps = extractTypePropertyNames(implementationType, checker);
  const requiredProps = extractTypePropertyNames(interfaceType, checker);

  return requiredProps.reduce<PropertyInfo[]>((acc, reqProp) => {
    if (!implProps.some(implProp => implProp.name === reqProp.name)) return [...acc, reqProp];
    return acc;
  }, []);
};

const extractTypePropertyNames = (type: Type, checker: TypeChecker): PropertyInfo[] => {
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
    return acc; // NOTE: If declaration is not found, skip this symbol
  }, []);
};
