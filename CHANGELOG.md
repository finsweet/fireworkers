# fireworkers

## 0.4.1

### Patch Changes

- c942c2b: fix: remove global flag on timestamp regex

## 0.4.0

### Minor Changes

- 013e768: feat: export all types

## 0.3.2

### Patch Changes

- a664a3e: fix: include missing `OR` operator for structured queries.

## 0.3.1

### Patch Changes

- b157152: fix: expose `Fireworkers.set` method

## 0.3.0

### Minor Changes

- 945dc3c: **This release deliberately contains backwards-incompatible changes**. To avoid automatically picking up releases like this, you should either be pinning the exact version of `fireworkers` in your `package.json` file (recommended) or be using a version range syntax that only accepts patch upgrades such as `^0.2.0` or `~0.2.0`. See npm's documentation about [semver](https://docs.npmjs.com/cli/v6/using-npm/semver/) for more information.

  - feat: add new `Firestore.set()` method that matches the behavior of the SDK's [setDoc](https://firebase.google.com/docs/reference/js/firestore_.md#setdoc).
  - fix: update `Firestore.update()` to match the behavior of the SDK's [updateDoc](https://firebase.google.com/docs/reference/js/firestore_.md#updatedoc):
    - Fields will be merged instead of overriding the entire document.
    - Operations will fail if the document doesn't exist.

### Patch Changes

- 9d619ba: - fix: process numbers as `double` instead of `integer`.

## 0.2.1

### Patch Changes

- 395d097: fix: wrong firestore endpoint URL constructor

## 0.2.0

### Minor Changes

- e6a9bf5: - added support for querying sub-collections
  - (internal) refactored endpoints constructor

## 0.1.2

### Patch Changes

- f2846f9: set pkg.sideEffects to false

## 0.1.1

### Patch Changes

- 94bf58c: added pkg.exports info

## 0.1.0

### Minor Changes

- 45ad92f: refactored firestore methods, added support for nested paths

## 0.0.4

### Patch Changes

- 6de0a21: docs: small fixes

## 0.0.3

### Patch Changes

- 09a0329: docs: fix invalid url

## 0.0.2

### Patch Changes

- 37e4e14: docs: fix example import
- 02046a6: docs: fix invalid example import (again)

## 0.0.1

### Patch Changes

- ae834aa: Initial release
