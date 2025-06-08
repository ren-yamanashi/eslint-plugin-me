# eslint-plugin-type-implements-interface

## Unsupported

### Generics

```ts
interface GenericInterface<T> {
  prop: T;
}

/**
 * @implements {GenericInterface<string>} // ❌ Unsupported
 */
type MyType = {
  prop: string;
};
```

### Interface binding

```ts
interface FirstInterface {
  firstProp: string;
}
interface SecondInterface {
  secondProp: number;
}
/**
 * @implements {FirstInterface & SecondInterface} // ❌ Unsupported
 */
type MyType = {
  firstProp: string;
  secondProp: number;
};
```
