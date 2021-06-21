import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import { transformAST as addImport } from './add-import'

export const transformAST: ASTTransformation = context => {
  const { root, j } = context
  // find render function
  const renderCollections = root
    .find(j.ObjectMethod, node => {
      return node.key.name === 'render' && node.params.length === 1
    })
    .filter(
      nodePath =>
        nodePath.parent.parent.node.type === 'ExportDefaultDeclaration'
    )
  if (!renderCollections.length) return

  // add import
  addImport(context, {
    specifier: { type: 'named', imported: 'resolveComponent' },
    source: 'vue'
  })

  renderCollections.forEach(({ node }) => {
    // @ts-ignore
    const paramName = node.params[0].name
    // remove render function param
    node.params = []
    const callExpressionCollection = j(node).find(j.CallExpression, node => {
      return node.callee.name === paramName && node.arguments.length === 1
    })

    if (!callExpressionCollection.length) return
    //  find the component name
    const componentName =
      callExpressionCollection.get(0).node.arguments[0].value
    //  remove non-letter for complying variable name rules
    const componentVariableName = removeNonLetter(componentName)
    callExpressionCollection
      .get(0)
      .parent.insertBefore(
        j(
          `const ${componentVariableName} = resolveComponent('${componentName}')`
        )
          .find(j.VariableDeclaration)
          .get().node
      )
    //  replace h('xxx') with resolveComponent('xxx')
    callExpressionCollection.replaceWith(
      // @ts-ignore
      nodePath => (nodePath.node.callee.name = componentVariableName)
    )
  })
}

/**
 * remove non-letter and uppercase the first letter after non-letter
 * button-component => buttonComponent
 * @param str
 */
function removeNonLetter(str: string): string | undefined {
  if (str) {
    let returnValue: string = ''
    for (let i = 0; i < str.length; i++) {
      // letter
      if (
        (str[i] >= 'a' && str[i] <= 'z') ||
        (str[i] >= 'A' && str[i] <= 'Z')
      ) {
        returnValue += str[i]
      } else {
        //  non-letter , remove and uppercase the first letter after non-letter
        i++
        if (str[i] >= 'a' && str[i] <= 'z') {
          returnValue += String.fromCharCode(str[i].charCodeAt(0) - 32)
        }
      }
    }
    return returnValue
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
