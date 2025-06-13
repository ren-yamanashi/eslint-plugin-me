# `me/no-mutation-methods` rule

## Overview

Disallows array and object mutation methods to encourage immutable data patterns. This rule helps prevent bugs related to unexpected side effects and promotes functional programming practices.

## Rule Details

This rule reports when mutation methods are called on arrays, objects, Maps, or Sets. It provides suggestions for immutable alternatives for each detected mutation method.

### Detected Mutation Methods

#### Array Methods

- `push()` → Use `concat()`, `[...array, newItem]`, or `array.with()`
- `pop()` → Use `array.slice(0, -1)` or `array.toSpliced(-1, 1)`
- `shift()` → Use `array.slice(1)` or `array.toSpliced(0, 1)`
- `unshift()` → Use `[newItem, ...array]` or `array.toSpliced(0, 0, newItem)`
- `splice()` → Use `array.toSpliced()` or `array.slice()`
- `sort()` → Use `array.toSorted()`
- `reverse()` → Use `array.toReversed()`
- `fill()` → Use `array.map()` or `array.with()`
- `copyWithin()` → Use `array.map()` with custom logic

#### Object Methods

- `Object.assign()` → Use object spread syntax `{...obj, ...other}`
- `Object.defineProperty()` → Use object spread with new property
- `Object.defineProperties()` → Use object spread with new properties
- `Object.setPrototypeOf()` → Use `Object.create()` with desired prototype

#### Map/Set Methods

- `Map.prototype.set()` → Use `new Map([...map, [key, value]])`
- `Map.prototype.delete()` → Use `new Map([...map].filter(([k]) => k !== key))`
- `Map.prototype.clear()` → Use `new Map()`
- `Set.prototype.add()` → Use `new Set([...set, value])`
- `Set.prototype.delete()` → Use `new Set([...set].filter(v => v !== value))`
- `Set.prototype.clear()` → Use `new Set()`

#### Direct Property Mutations

- `array.length = x` → Use immutable array methods
- `obj[key] = value` → Use object spread or immutable update

## Configuration

The rule accepts an options object with the following properties:

```typescript
{
  "allowedMethods": string[], // Array of method names to allow
  "ignoredObjects": string[]  // Array of object names to ignore
}
```

### Default Configuration

```json
{
  "allowedMethods": [],
  "ignoredObjects": ["console", "process"]
}
```

## Examples

### ❌ Incorrect

```typescript
// Array mutations
const numbers = [1, 2, 3];
numbers.push(4);           // Mutates original array
numbers.pop();             // Mutates original array
numbers.sort();            // Mutates original array
numbers.reverse();         // Mutates original array
numbers.splice(1, 1, 99);  // Mutates original array

// Object mutations
const user = { name: 'John', age: 30 };
Object.assign(user, { age: 31 });  // Mutates original object

// Map/Set mutations
const map = new Map([['key', 'value']]);
map.set('newKey', 'newValue');  // Mutates original Map
map.delete('key');              // Mutates original Map

const set = new Set([1, 2, 3]);
set.add(4);     // Mutates original Set
set.delete(1);  // Mutates original Set

// Direct property mutations
const items = [1, 2, 3];
items.length = 0;    // Mutates original array
items[0] = 999;      // Mutates original array

const obj = { count: 0 };
obj.count++;         // Mutates original object
obj['newProp'] = 42; // Mutates original object
```

### ✅ Correct

```typescript
// Immutable array operations
const numbers = [1, 2, 3];
const withNew = [...numbers, 4];           // Creates new array
const withoutLast = numbers.slice(0, -1);  // Creates new array
const sorted = numbers.toSorted();         // Creates new array (ES2023)
const reversed = numbers.toReversed();     // Creates new array (ES2023)
const spliced = numbers.toSpliced(1, 1, 99); // Creates new array (ES2023)

// Legacy browser support
const sorted = [...numbers].sort();       // Creates new array
const reversed = [...numbers].reverse();  // Creates new array

// Immutable object operations
const user = { name: 'John', age: 30 };
const updatedUser = { ...user, age: 31 }; // Creates new object

// Immutable Map operations
const map = new Map([['key', 'value']]);
const withNew = new Map([...map, ['newKey', 'newValue']]);
const withoutKey = new Map([...map].filter(([k]) => k !== 'key'));

// Immutable Set operations
const set = new Set([1, 2, 3]);
const withNew = new Set([...set, 4]);
const withoutOne = new Set([...set].filter(v => v !== 1));

// Immutable property updates
const items = [1, 2, 3];
const empty = [];                    // New empty array
const updated = items.with(0, 999);  // Creates new array (ES2023)
const updated = [999, ...items.slice(1)]; // Legacy support

const obj = { count: 0 };
const incremented = { ...obj, count: obj.count + 1 };
const withNewProp = { ...obj, newProp: 42 };

// Allowed operations (console, process are ignored by default)
console.log('This is allowed');
process.exit(0);
```

### Configuration Examples

```typescript
// Allow specific mutation methods
{
  "rules": {
    "me/no-mutation-methods": ["error", {
      "allowedMethods": ["push", "pop"],
      "ignoredObjects": ["console", "process", "buffer"]
    }]
  }
}

// With allowed methods configuration
const array = [1, 2, 3];
array.push(4);  // Allowed due to configuration
array.sort();   // Still reports error

// Custom ignored objects
buffer.write('data');  // Allowed due to configuration
```

## Benefits

- **Predictability**: Immutable operations don't change existing data
- **Debugging**: Easier to track data flow without unexpected mutations
- **Concurrency**: Immutable data is safe to share between threads
- **Functional Programming**: Encourages pure functions and functional patterns
- **Performance**: Modern JavaScript engines optimize immutable operations
- **Testing**: Immutable data makes tests more reliable

## Modern JavaScript Support

This rule encourages the use of new ES2023 immutable array methods:

```typescript
// ES2023 immutable methods (preferred when supported)
const array = [1, 2, 3];

// Change methods
const changed = array.with(1, 999);  // [1, 999, 3]

// Mutating methods → Immutable equivalents
const sorted = array.toSorted();        // Instead of sort()
const reversed = array.toReversed();    // Instead of reverse()
const spliced = array.toSpliced(1, 1);  // Instead of splice()

// For older environments, use spread syntax
const sorted = [...array].sort();
const reversed = [...array].reverse();
```

## Advanced Patterns

### Immutable Update Utilities

```typescript
// Generic immutable update helper
const updateAt = <T>(array: T[], index: number, value: T): T[] => 
  array.map((item, i) => i === index ? value : item);

const removeAt = <T>(array: T[], index: number): T[] => 
  array.filter((_, i) => i !== index);

const insertAt = <T>(array: T[], index: number, value: T): T[] => [
  ...array.slice(0, index),
  value,
  ...array.slice(index)
];

// Object update helpers
const updateProperty = <T, K extends keyof T>(
  obj: T, 
  key: K, 
  value: T[K]
): T => ({ ...obj, [key]: value });

const removeProperty = <T, K extends keyof T>(
  obj: T, 
  key: K
): Omit<T, K> => {
  const { [key]: _, ...rest } = obj;
  return rest;
};
```

### Immutable Data Libraries

Consider using libraries for complex immutable operations:

```typescript
// Using Immer
import { produce } from 'immer';

const updatedState = produce(state, draft => {
  draft.users.push(newUser);  // Immer handles immutability
  draft.settings.theme = 'dark';
});

// Using Immutable.js
import { List, Map } from 'immutable';

const list = List([1, 2, 3]);
const newList = list.push(4);  // Returns new List

const map = Map({ key: 'value' });
const newMap = map.set('key2', 'value2');  // Returns new Map
```

## Performance Considerations

- **Memory**: Immutable operations create new objects, but modern engines optimize this
- **GC Pressure**: More objects created, but they're often short-lived
- **Structural Sharing**: Libraries like Immutable.js use structural sharing for efficiency
- **Bundle Size**: Native methods have no bundle size impact

## Migration Strategy

1. **Start with new code**: Apply the rule to new functions first
2. **Use configuration**: Temporarily allow specific methods during migration
3. **Update incrementally**: Convert one mutation at a time
4. **Add tests**: Ensure immutable updates work correctly
5. **Performance check**: Monitor performance after migration

## When Not To Use

Consider disabling this rule when:

- Working with performance-critical code where mutations are necessary
- Using libraries that expect mutable operations
- Dealing with very large datasets where copying is expensive
- Working with DOM APIs that require mutations

In such cases, consider using the configuration options to allow specific methods or ignore certain objects.
