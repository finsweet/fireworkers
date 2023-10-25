---
'fireworkers': minor
---

**This release deliberately contains backwards-incompatible changes**. To avoid automatically picking up releases like this, you should either be pinning the exact version of `fireworkers` in your `package.json` file (recommended) or be using a version range syntax that only accepts patch upgrades such as `^0.2.0` or `~0.2.0`. See npm's documentation about [semver](https://docs.npmjs.com/cli/v6/using-npm/semver/) for more information.

- feat: add new `Firestore.set()` method that matches the behavior of the SDK's [setDoc](https://firebase.google.com/docs/reference/js/firestore_.md#setdoc).
- fix: update `Firestore.update()` to match the behavior of the SDK's [updateDoc](https://firebase.google.com/docs/reference/js/firestore_.md#updatedoc):
  - Fields will be merged instead of overriding the entire document.
  - Operations will fail if the document doesn't exist.
