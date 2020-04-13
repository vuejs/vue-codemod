# vue-codemod

**Current status: pre-MVP, not usable**

This repository contains a collection of codemod scripts for use with [JSCodeshift](https://github.com/facebook/jscodeshift) that help update Vue.js APIs.

Inspired by [react-codemod](https://github.com/reactjs/react-codemod).

## Command Line Usage

`npx vue-codemod <path> -t <transformation> --params [transformation params] [...additional options]`

- `transformation` (required) - name of transformation, see available transformations below; or you can provide a path to a custom transformation module.
- `path` (required) - files or directory to transform.
- `--params` (optional) - additional transformation specific args.
- use the `--dry` options for a dry-run.

## Programmatic API

TODO

## Roadmap

(Sort by priority)

- [x] Basic testing setup and a dummy CLI
- [x] Support applying `jscodeshift` codemods to `.vue` files
- [x] Provide a programmatic interface for usage in `vue-cli-plugin-vue-next`
- [ ] Define an interface for transformation of template blocks
- [ ] A playground for writing transformations
- [ ] Implement more transformations for [active RFCs](https://github.com/vuejs/rfcs/tree/master/active-rfcs)

## Included Transformations

TODO

## Custom Transformation

TODO

## Post Transformation

- Running transformations will generally ruin the formatting of your files. A recommended way to solve that problem is by using [Prettier](https://prettier.io/) or `eslint --fix`.
- Even after running prettier its possible to have unnecessary new lines added/removed. This can be solved by ignoring white spaces while staging the changes in git.

```sh
git diff --ignore-blank-lines | git apply --cached
```
