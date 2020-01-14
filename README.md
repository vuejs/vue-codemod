# vue-codemod

**Current status: pre-MVP, not usable**

This repository contains a collection of codemod scripts for use with [JSCodeshift](https://github.com/facebook/jscodeshift) that help update Vue.js APIs.

Inspired by [react-codemod](https://github.com/reactjs/react-codemod).

## Usage

`npx vue-codemod -t <transformation> -f <path> [...options]

- `transformation` - name of transformation, see available transformations below. Or you can provide a path to a custom transformation module.
- `path` - files or directory to transform
- use the `--dry` options for a dry-run

## TODOs

(Sort by priority)

- [ ] Basic testing setup and an MVP
- [ ] Define an interface for transformation of template blocks
- [ ] Automatically apply transformations to `.vue` file without explicitly depending on `vue-jscodeshift-adapter` (should open source this repo after finishing this one)
- [ ] A playground for writing transformations
- [ ] Implement more transformations for [active RFCs](https://github.com/vuejs/rfcs/tree/master/active-rfcs)
- [ ] Support `.ts` and `<script lang="ts">`

## Included Transformations

### rfc-0009

Alias of [`new-vue-to-create-app`](#new-vue-to-create-app)

### rfc-0013

**WIP**
Runs [`object-to-composition-api`](#object-to-composition-api)

### new-vue-to-create-app

Implements [RFC-0009 Global API Change](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0009-global-api-change.md).
Converts `new Vue(...).$mount('#app')` calls to `createApp(...).mount(App, '#app')`.

### object-to-composition-api

**WIP**
Implements [RFC-0013 Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0013-composition-api.md).
Migrated from https://github.com/vuejs/function-api-converter

## Custom Transformation

TODO

## Post Transformation

- Running transformations will generally ruin the formatting of your files. A recommended way to solve that problem is by using [Prettier](https://prettier.io/) or `eslint --fix`.
- Even after running prettier its possible to have unnecessary new lines added/removed. This can be solved by ignoring white spaces while staging the changes in git.

```sh
git diff --ignore-blank-lines | git apply --cached
```
