# vue-codemod

**Current status: experimental**

This repository contains a collection of codemod scripts for use with [JSCodeshift](https://github.com/facebook/jscodeshift) that help update Vue.js APIs.

Inspired by [react-codemod](https://github.com/reactjs/react-codemod).

## Command Line Usage

`npx vue-codemod <path> -t <transformation> --params [transformation params] [...additional options]`

- `transformation` (required) - name of transformation, see available transformations below; or you can provide a path to a custom transformation module.
- `path` (required) - files or directory to transform.
- `--params` (optional) - additional transformation specific args.
<!-- - use the `--dry` options for a dry-run. -->

## Programmatic API

- `runTransformation(fileInfo, transformation, params)`

## Roadmap

- [x] Basic testing setup and a dummy CLI
- [x] Support applying `jscodeshift` codemods to `.vue` files
- [x] Provide a programmatic interface for usage in `vue-cli-plugin-vue-next`
- [x] Set up tests
- [ ] (WIP) Implement the transformations described below for migration usage
- [ ] Built-in transformations need to support TypeScript
- [ ] Built-in transformations need to support module systems other than ES module, and those without modules
- [ ] Define an interface for transformation of template blocks (may use [`vue-eslint-parser`](https://github.com/mysticatea/vue-eslint-parser/) for this)
- [x] A playground for writing transformations - `yarn playground` and visit http://localhost:3000

## Included Transformations

### Migrating from Vue 2 to Vue 3

The migration path (to be integrated in a new version of [`vue-migration-helper`](https://github.com/vuejs/vue-migration-helper)):

1. Install eslint-plugin-vue@7, turn on the `vue3-essential` category (maybe a few exceptions like `vue/no-deprecated-dollar-scopedslots-api`)
2. Run `eslint --fix` to fix all auto-fixable issues; if there are any remaining errors, fix them manually
3. Run the codemods below
4. Install vue@3, vue-loader@16, etc.
5. Make sure to use the compat build of vue@3
6. Serve the app in development mode, fix the runtime deprecation warnings

> Note: even though most of the migration process can be automated, please be aware there might still be subtle differences between Vue 3 and Vue 2 runtime, and the codemods may have uncovered edge cases. Please double check before deploying your Vue 3 app into production.

Legend of annotations:

| Mark | Description                                          |
| ---- | ---------------------------------------------------- |
| 🔴   | work not started                                     |
| 🔵   | needs to or can be implemented in the compat runtime |

#### Fixable in ESLint

- [RFC05: Replace `v-bind`'s `.sync` with a `v-model` argument](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0005-replace-v-bind-sync-with-v-model-argument.md)
  - Can be detected and fixed by the [`vue/no-deprecated-v-bind-sync`](https://eslint.vuejs.org/rules/no-deprecated-v-bind-sync.html) ESLint rule
- [RFC14: Remove `keyCode` support in `v-on`](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0014-drop-keycode-support.md)
  - Can be detected and fixed by the [`vue/no-deprecated-v-on-number-modifiers`](https://eslint.vuejs.org/rules/no-deprecated-v-on-number-modifiers.html) ESLint rule
  - `config.keyCode` can be supported in the compat build. It is also detectable with the [`vue/no-deprecated-vue-config-keycodes`](https://eslint.vuejs.org/rules/no-deprecated-vue-config-keycodes.html) ESLint rule
- [RFC19: Remove `data` object declaration](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0019-remove-data-object-declaration.md)
  - Can be detected and fixed by the [`vue/no-shared-component-data`](https://eslint.vuejs.org/rules/no-shared-component-data.html) and the [`vue/no-deprecated-data-object-declaration`](https://eslint.vuejs.org/rules/no-deprecated-data-object-declaration.html) ESLint rules

#### Codemods

- [RFC01: New slot syntax](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-new-slot-syntax.md) and [RFC06: Slots unification](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0006-slots-unification.md)
  - Can be detected and partially fixed by the [`vue/no-deprecated-slot-attribute`](https://eslint.vuejs.org/rules/no-deprecated-slot-attribute.html) and [`vue/no-deprecated-slot-scope-attribute`](https://eslint.vuejs.org/rules/no-deprecated-slot-scope-attribute.html)
  - During the transition period, with the 2 ESLint rules enabled, it will warn users when they use `this.$slots`, recommending `this.$scopedSlots` as a replacement
  - When upgrading to Vue 3, replace all `.$scopedSlots` occurrences with `.$slots` (should pass the abovementioned ESLint checks before running this codemod) (implemented as `scoped-slots-to-slots`)
- [RFC04: Global API treeshaking](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0004-global-api-treeshaking.md) & [RFC09: Global mounting/configuration API change](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0009-global-api-change.md)
  - **implemented as `new-global-api`**
  - `import Vue from 'vue'` -> `import * as Vue from 'vue'` (implemented as `vue-as-namespace-import`)
  - `Vue.extend` -> `defineComponent` (implemented as `define-component`)
  - `new Vue()` -> `Vue.createApp()` (implemented as `new-vue-to-create-app`)
    - `new Vue({ el })`, `new Vue().$mount` -> `Vue.createApp().mount`
    - `new HelloWorld({ el })`, `new HelloWorld().$mount` -> `createApp(HelloWorld).mount`
  - `render(h)` -> `render()` and `import { h } from 'vue'` (implemented as `remove-contextual-h-from-render`)
  - `Vue.config.productionTip` -> removed (implemented as `remove-production-tip`)
  - 🔴 Some global APIs now can only be used on the app instances, while it's possible to support the legacy usage in a compat build, we will provide a codemod to help migration. (`global-to-per-app-api`)
    - `Vue.config`, `Vue.use`, `Vue.mixin`, `Vue.component`, `Vue.directive`, etc -> `app.**` (It's possible to provide a runtime compatibility layer for single-root apps)
    - `Vue.prototype.customProperty` -> `app.config.globalProperties.customProperty`
    - `Vue.config.ignoredElements` -> `app.config.isCustomElement`
    - The migration path would be a two-pass approach:
      1. Scan the entire project to collect all the usages of the abovementioned global properties / methods
      2. Depending on the result of the first scan:
         1. If there's only one entry file using these global APIs, then transform it;
         2. If there's exactly one entry file and one root instance, but several other files are also using `Vue.*`, then transform the entry file to export the root instance, import it in other files and transform them with the imported root instance;
         3. If there are more than one entry file or root instances, then the user needs to manually export the root instances, re-apply this codemod to those non-entry files with an argument designating the root instance.
  - 🔵 Detect and warn on `optionMergeStrategies` behavior change
- [RFC07: Functional and async components API change](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0007-functional-async-api-change.md)
  - 🔵 a compatibility mode can be provided for functional components for one-at-a-time migration
  - Can be detected by the [`vue/no-deprecated-functional-template`](https://eslint.vuejs.org/rules/no-deprecated-functional-template.html) ESLint rule
  - 🔴 SFCs using `<template functional>` should be converted to normal SFCs
- [RFC08: Render function API change](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0008-render-function-api-change.md)
  - Template users won't be affected
  - JSX plugin will be rewritten to cover most use cases (work-in-progress, available at https://github.com/vueComponent/jsx/)
  - 🔴 For Users who manually write render functions using `h`
    - 🔵 It's possible to provide a compat plugin that patches render functions and make them expose a 2.x compatible arguments, and can be turned off in each component for a one-at-a-time migration process.
    - 🔴 It's also possible to provide a codemod that auto-converts `h` calls to use the new VNode data format, since the mapping is pretty mechanical.
  - 🔴 Functional components using context will likely have to be manually migrated, but a similar adaptor can be provided.
- [RFC12: Custom directive API change](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0012-custom-directive-api-change.md)
  - `bind` -> `beforeMount`
  - `inserted` -> `mounted`
  - remove `update` hook and insert a comment to note the user about the change
  - `componentUpdated` -> `updated`
  - `unbind` -> `unmounted`
  - 🔴 VNode interface change (a runtime compat plugin is also possible, see the notes for RFC08)
- [RFC13: Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0013-composition-api.md)
  - `import ... from '@vue/composition-api'` -> `import ... from 'vue'` (implemented as `import-composition-api-from-vue`)
  - There are some subtle differences between the plugin and Vue 3 implementation, see https://github.com/vuejs/composition-api#limitations for more details.
- [RFC16: Remove `inline-template`](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0016-remove-inline-templates.md)
  - Can be detected by the [`vue/no-deprecated-inline-template`](https://eslint.vuejs.org/rules/no-deprecated-inline-template.html) ESLint rule
  - 🔴 Possible alternatives are addressed [in the RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0016-remove-inline-templates.md#adoption-strategy)
- [RFC25: Built-in `<Teleport>` component](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0025-teleport.md)
  - Can be detected by the [`vue/no-reserved-component-names`](https://eslint.vuejs.org/rules/no-reserved-component-names.html) ESLint rule
  - 🔴 A codemod can be implemented to rename all `<Teleport>` components to some other name like `<TeleportComp>`.
- 🔴 [RFC26: New async component API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0026-async-component-api.md)
  - 🔵 In the compat build, it is possible to check the return value of functional components and warn legacy async components usage. This should cover all Promise-based use cases.
  - 🔴 The syntax conversion is mechanical and can be performed via a codemod. The challenge is in determining which plain functions should be considered async components. Some basic heuristics can be used (note this may not cover 100% of the existing usage):
    - Arrow functions that returns dynamic `import` call to `.vue` files
    - Arrow functions that returns an object with the `component` property being a dynamic `import` call.
  - The only case that cannot be easily detected is 2.x async components using manual `resolve/reject` instead of returning promises. Manual upgrade will be required for such cases but they should be relatively rare.
- 🔴 [RFC30: Add `emits` component option](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0030-emits-option.md)
  - There could be potential naming conflicts with existing component-level `emits` options, so we need to scan and warn on such usages
  - To better utilize the new `emits` option, we can provide a codemod that automatically scans all instances of `$emit` calls in a component and generate the `emits` option
- [Vuex 3.x to 4](https://github.com/vuejs/vuex/tree/4.0)
  - **implemented as in combination of `new-global-api` and `vuex-v4`**
  - `Vue.use(Vuex)` & `new Vue({ store })` -> `app.use(store)`
  - `new Store()` -> `createStore()`
- [Vue Router 3.x to 4](https://github.com/vuejs/vue-router-next)
  - **implemented as in combination of `new-global-api` and `vue-router-v4`**
  - `Vue.use(VueRouter)` & `new Vue({ router })` -> `app.use(router)`
  - `new VueRouter()` -> `createRouter()`
  - `mode: 'history', base: BASE_URL` etc. -> `history: createWebHistory(BASE_URL)` etc.
  - 🔴 [RFC21: Scoped slot API for `router-link`](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0021-router-link-scoped-slot.md)
  - 🔴 [RFC28: Change active and exact-active behavior for `router-link`](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0028-router-active-link.md)
- [`vue-class-component` 7.x to 8](https://github.com/vuejs/vue-class-component/issues/406)
  - `import { Component } from 'vue-class-component'` -> `import { Options as Component } from 'vue-class-component'`
  - 🔴 `import Vue from 'vue'` -> `import { Vue } from 'vue-class-component'` (Need to avoid name collision if there's any reference to `Vue` besides `extends Vue`)
  - 🔴 `Component.registerHooks` -> `Vue.registerHooks`

#### Breaking Changes that Can Only Be Manually Migrated

- [RFC17: Changed behavior when using `transition` as root](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0017-transition-as-root.md)
  - Can be detected by the [`vue/require-toggle-inside-transition`](https://eslint.vuejs.org/rules/require-toggle-inside-transition.html) ESLint rule
- [RFC22: Merge `meta` fields from parent to child in `RouteLocation`](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0022-router-merge-meta-routelocation.md)
  - Seems no codemod or ESLint rule is applicable to this breaking change
- [RFC24: Attribute coercion behavior change](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0024-attribute-coercion-behavior.md)
  - Codemod is not likely to help in this case
- [RFC31: Attribute Fallthrough + Functional Component Updates](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0031-attr-fallthrough.md)
  - Warn of every `$listeners` and `.native` usage
- Subtle differences between `@vue/composition-api` and the Vue 3 implementation are listed in the [`@vue/composition-api` README](https://github.com/vuejs/composition-api#limitations)
- [The precedence of `v-if` and `v-for` have been flipped when using both on the same element.](https://github.com/vuejs/vue-next/issues/1165)
- Warn for [mixing `v-for` and `ref`](https://github.com/vuejs/vue-next/issues/1166).
- Warn about deprecated instance methods and properties: `$destroy`, `$children`

#### RFCs that May Need Amendments to Simplify the Migration

> Note: there are just rough ideas. Amendments may or may not be proposed, depending on the implementation progress of this repo.

- 🔵 [RFC04: Global API treeshaking](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0004-global-api-treeshaking.md) & [RFC09: Global mounting/configuration API change](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0009-global-api-change.md)
  - `Vue.extend` can be supported in a compat runtime as an alias to `defineComponent`
- 🔵 [RFC11: Component `v-model` API change](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0011-v-model-api-change.md)
  - I don't have a clear idea on how to progressively migrate the `v-model` API because both the author and consumer of the components need to change their ways to use this API, according to the current RFC. So we might need a compatibility layer in the runtime.

#### Other Opt-In Changes

These features are only deprecated but still supported in the compatiblity builds.
There will be runtime warnings and ESLint rules to detect their usages.
Some of them can be automatically migrated with the help of codemods.

- [RFC15: Remove filters](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0015-remove-filters.md)
  - Can be detected by the [`vue/no-deprecated-filter`](https://eslint.vuejs.org/rules/no-deprecated-filter.html) ESLint rule
- 🔴 [RFC18: Transition class name adjustments](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0018-transition-class-change.md)
  - For `<transition>` components with custom `enter-class` or `leave-class`:
    - `enter-class` -> `enter-from-class`
    - `leave-class` -> `leave-from-class`
  - Otherwise, there are two possible solutions:
    - Change every `.v-enter` and `.v-leave` selector in the stylesheets to `.v-enter-from` and `.v-leave-from`
    - Or, attach `enter-from-class="v-enter v-enter-from" leave-from-class="v-leave v-leave-from"` to these `<transition>` components. Users can delete these attributes after they updated the corresponding stylesheets
- [RFC20: Events API Change](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0020-events-api-change.md)
  - Can be detected by the [`vue/no-deprecated-events-api`](https://eslint.vuejs.org/rules/no-deprecated-events-api.html) ESLint rule
  - 🔴 A codemod can be implemented to use other libraries like [tiny-emitter](https://github.com/scottcorgan/tiny-emitter) for the events API
- [RFC23-scoped-styles-changes](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0023-scoped-styles-changes.md)
  - The new behavior should be opt-in
- [RFC27: Custom Elements Interop Improvements](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0027-custom-elements-interop.md)
  - (Covered by the Global API RFCs): `Vue.config.ignoredElements` -> `app.config.isCustomElement`
  - 🔴 Vue 2 non-`<component>` tags with `is` usage ->
    - `<component is>` (for SFC templates).
    - `v-is` (for in-DOM templates).
  - The [`vue/no-deprecated-html-element-is`](https://eslint.vuejs.org/rules/no-deprecated-html-element-is.html) ESLint rule can be used to detect usage for `is` usage on built-in HTML tags.
- `set` and `delete` instance or global methods [will be supported only in IE compat builds](https://github.com/vuejs/vue-next/issues/2026).
  - implemented as `remove-vue-set-and-delete`

### Generic Transformations

Aside from migrating Vue 2 apps to Vue 3, this repository also includes some generic transformations that can help clean up your codebase.

- `remove-trivial-root`
  - this transformation removes trivial root components like `{ render: () => h(App) }` and use `App` as the direct root
- `define-component`
  - `--params.useCompositionApi`: `false` by default. When set to `true`, it will import the `defineComponent` helper from `@vue/composition-api` instead of `vue`
  - this transformation adds `defineComponent()` wrapper to `.vue` file exports, and replaces `Vue.extend` calls to `defineComponent`

## Custom Transformation

See https://github.com/facebook/jscodeshift#transform-module

## Post Transformation

- Running transformations will generally ruin the formatting of your files. A recommended way to solve that problem is by using [Prettier](https://prettier.io/) or `eslint --fix`.
- Even after running prettier its possible to have unnecessary new lines added/removed. This can be solved by ignoring white spaces while staging the changes in git.

```sh
git diff --ignore-blank-lines | git apply --cached
```
