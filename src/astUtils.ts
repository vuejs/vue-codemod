import type {
  ASTNode,
  ASTPath,
  Collection,
  ObjectProperty,
  ObjectMethod,
  CallExpression,
  Identifier,
  Expression,
  ObjectExpression,
  FunctionExpression,
  ArrowFunctionExpression,
} from 'jscodeshift'
import type { Context } from './wrapAstTransformation'

type VueOptionsType =
  | ObjectExpression
  | ArrowFunctionExpression
  | FunctionExpression
  | ObjectMethod

// TODO: for simplicity of implementation, we've skipped all `{ ...expr }` cases
export function getVueOptions(context: Context): Collection<VueOptionsType> {
  const paths: ASTPath<VueOptionsType>[] = []
  const { j, root, filename } = context

  function wrapOptionsInPaths<T>(
    nodes: VueOptionsType
  ): ASTPath<VueOptionsType>[] {
    return j(nodes).paths()
  }

  function getConstDeclarationInit(id: Identifier) {
    const declarator = root.findVariableDeclarators(id.name)

    if (!declarator.length) {
      return null
    }

    if (!j.Identifier.check(declarator.nodes()[0].id)) {
      // TODO: check destructuring
      return null
    }

    const declarationKind = declarator.closest(j.VariableDeclaration).nodes()[0]
      .kind

    if (declarationKind !== 'const') {
      // TODO: check reassignments (=, for in)
      return null
    }

    return declarator.nodes()[0].init
  }

  function hasRenderOrTemplateProps(obj: ObjectExpression) {
    return obj.properties.some((prop) => {
      // skip spread properties
      if (j.SpreadElement.check(prop) || j.SpreadProperty.check(prop)) {
        return false
      }

      if (j.StringLiteral.check(prop.key)) {
        return prop.key.value === 'render' || prop.key.value === 'template'
      }

      if (j.Identifier.check(prop.key)) {
        return prop.key.name === 'render' || prop.key.name === 'template'
      }
    })
  }

  function isPromiseExpression(expr: Expression): boolean {
    if (j.SequenceExpression.check(expr)) {
      const lastExpr = expr.expressions[expr.expressions.length - 1]
      return isPromiseExpression(lastExpr)
    }

    if (j.CallExpression.check(expr)) {
      // import('./)
      if (j.Import.check(expr.callee)) {
        return true
      }

      // there are a lot other possible scenarios here
      // but for simplicity let's just wait for user feedback to add them
      return false
    }

    // new Promise()
    if (j.NewExpression.check(expr)) {
      return j.Identifier.check(expr.callee) && expr.callee.name === 'Promise'
    }

    return false
  }

  function isPromiseReturningFunction(
    fn: ASTNode
  ): fn is FunctionExpression | ArrowFunctionExpression | ObjectMethod {
    if (
      !j.FunctionExpression.check(fn) &&
      !j.ArrowFunctionExpression.check(fn) &&
      !j.ObjectMethod.check(fn)
    ) {
      return false
    }

    if (fn.async) {
      return true
    }

    if (
      j.ArrowFunctionExpression.check(fn) &&
      !j.BlockStatement.check(fn.body)
    ) {
      return isPromiseExpression(fn.body)
    }

    // check every return statements
    // luckily, in Vue 2, an async component function is allowed to return undefined
    // so empty returns are fine
    const returnStatements = j(fn.body).find(j.ReturnStatement)

    return (
      returnStatements.length > 0 &&
      returnStatements.every((path) =>
        !!path.node.argument ? isPromiseExpression(path.node.argument) : true
      )
    )
  }

  // TODO:
  // Vue.component('async-example', function (resolve, reject) {
  //   setTimeout(function () {
  //     resolve({
  //       template: '<div>I am async!</div>'
  //     })
  //   }, 1000)
  // })

  // TODO:
  // <https://vuejs.org/v2/guide/components-dynamic-async.html#Handling-Loading-State>

  function isLikelyVueOptions(
    comp: ASTNode | null,
    {
      mayBeAsyncComponent = false,
      shouldCheckProps = false,
    }: {
      mayBeAsyncComponent?: boolean
      shouldCheckProps?: boolean
    } = {}
  ): comp is VueOptionsType {
    if (!comp) {
      return false
    }

    if (j.ObjectExpression.check(comp)) {
      return shouldCheckProps ? hasRenderOrTemplateProps(comp) : true
    }

    if (mayBeAsyncComponent) {
      return isPromiseReturningFunction(comp)
    }

    return false
  }

  const isInSFC = filename.endsWith('.vue')

  // export default {}
  const defaultObjectExport = root
    .find(j.ExportDefaultDeclaration)
    .map((path) => {
      const decl = path.node.declaration

      if (
        isLikelyVueOptions(decl, {
          shouldCheckProps: !isInSFC,
          mayBeAsyncComponent: !isInSFC,
        })
      ) {
        return wrapOptionsInPaths(decl)
      }

      if (j.Identifier.check(decl)) {
        const init = getConstDeclarationInit(decl)
        return isLikelyVueOptions(init, {
          shouldCheckProps: !isInSFC,
          mayBeAsyncComponent: !isInSFC,
        })
          ? wrapOptionsInPaths(init)
          : null
      }

      return null
    })

  paths.push(...defaultObjectExport.paths())

  // defineComponent({})
  // Vue.defineComponent({})
  const defineComponentOptions = root
    .find(j.CallExpression, (node: CallExpression) => {
      if (
        j.Identifier.check(node.callee) &&
        node.callee.name === 'defineComponent'
      ) {
        return true
      }

      if (
        j.MemberExpression.check(node.callee) &&
        j.Identifier.check(node.callee.property) &&
        node.callee.property.name === 'defineComponent'
      ) {
        return true
      }

      return false
    })
    .map((path) => {
      const arg = path.node.arguments[0]
      if (isLikelyVueOptions(arg)) {
        return wrapOptionsInPaths(arg)
      }

      if (j.Identifier.check(arg)) {
        const init = getConstDeclarationInit(arg)
        if (init && isLikelyVueOptions(init)) {
          return wrapOptionsInPaths(init)
        }
      }

      return null
    })
  paths.push(...defineComponentOptions.paths())

  // new Vue({})
  const newVueOptions = root
    .find(j.NewExpression, {
      callee: {
        type: 'Identifier',
        name: 'Vue',
      },
    })
    .map((path) => {
      const arg = path.node.arguments[0]
      if (isLikelyVueOptions(arg)) {
        return wrapOptionsInPaths(arg)
      }

      if (j.Identifier.check(arg)) {
        const init = getConstDeclarationInit(arg)
        if (init && isLikelyVueOptions(init)) {
          return wrapOptionsInPaths(init)
        }
      }

      return null
    })
  paths.push(...newVueOptions.paths())

  // Vue.component('name', {})
  // Vue.component('name', function() { return aPromise })
  // Vue.component('name', () => aPromise)
  const vueDotComponentOptions = root
    .find(j.CallExpression, (node: CallExpression) => {
      return (
        j.MemberExpression.check(node.callee) &&
        j.Identifier.check(node.callee.object) &&
        node.callee.object.name === 'Vue' &&
        j.Identifier.check(node.callee.property) &&
        node.callee.property.name === 'component'
      )
    })
    .map((path) => {
      if (path.node.arguments.length !== 2) {
        return null
      }

      const arg = path.node.arguments[1]

      if (isLikelyVueOptions(arg, { mayBeAsyncComponent: true })) {
        return wrapOptionsInPaths(arg)
      }

      if (j.Identifier.check(arg)) {
        const init = getConstDeclarationInit(arg)
        if (init && isLikelyVueOptions(init, { mayBeAsyncComponent: true })) {
          return wrapOptionsInPaths(init)
        }
      }

      return null
    })
  paths.push(...vueDotComponentOptions.paths())

  // Extracted from the above paths:
  // components: {
  //   HelloWorld: {
  //     render() {}
  //   },
  // },

  for (const p of paths) {
    const { node } = p
    if (!j.ObjectExpression.check(node)) {
      continue
    }

    const componentsProp = node.properties.find(
      (prop) =>
        j.ObjectProperty.check(prop) &&
        ((j.Identifier.check(prop.key) && prop.key.name === 'components') ||
          (j.StringLiteral.check(prop.key) && prop.key.value === 'components'))
    ) as ObjectProperty

    if (!componentsProp) {
      continue
    }

    let componentsObject: ObjectExpression | undefined
    if (j.Identifier.check(componentsProp.value)) {
      const init = getConstDeclarationInit(componentsProp.value)
      if (j.ObjectExpression.check(init)) {
        componentsObject = init
      }
    } else if (j.ObjectExpression.check(componentsProp.value)) {
      componentsObject = componentsProp.value
    }

    // skip spread properties

    if (!componentsObject) {
      continue
    }

    const subComponentDefinitions = componentsObject.properties
      .map((prop) => {
        if (j.ObjectProperty.check(prop)) {
          if (isLikelyVueOptions(prop.value, { mayBeAsyncComponent: true })) {
            return prop.value
          }

          if (j.Identifier.check(prop.value)) {
            const init = getConstDeclarationInit(prop.value)
            if (
              init &&
              isLikelyVueOptions(init, { mayBeAsyncComponent: true })
            ) {
              return init
            }
          }
        } else if (j.ObjectMethod.check(prop)) {
          if (isPromiseReturningFunction(prop)) {
            return prop
          }
        }

        // skip spread properties
        return false
      })
      .filter(Boolean)

    for (const subComp of subComponentDefinitions) {
      paths.push(...wrapOptionsInPaths(subComp as VueOptionsType))
    }
  }

  return j(paths)
}
