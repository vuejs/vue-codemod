import wrap from '../src/wrapAstTransformation'
import type { ASTTransformation } from '../src/wrapAstTransformation'
import type { ObjectProperty } from 'jscodeshift'

export const transformAST: ASTTransformation = ({ j, root }) => {
  // find model option
  const modelCollection = root
    .find(j.ObjectProperty, node => node.key.name === 'model')
    .filter(path => path.parent.parent.node.type == 'ExportDefaultDeclaration')
  if (!modelCollection.length) return

  // find prop option which is in model
  const propPath = modelCollection
    .find(j.ObjectProperty, (node: ObjectProperty) => {
      // @ts-ignore
      return node.key.name === 'prop'
    })
    .get(0)

  // find event option which is in model
  const eventPath = modelCollection
    .find(j.ObjectProperty, (node: ObjectProperty) => {
      // @ts-ignore
      return node.key.name === 'event'
    })
    .get(0)

  const propName = propPath.node.value.value
  const propEvent = eventPath.node.value.value

  // find the props option
  const propsCollections = root
    .find(j.ObjectProperty, node => node.key.name === 'props')
    .filter(path => path.parent.parent.node.type === 'ExportDefaultDeclaration')
  if (!propsCollections.length) return

  // find the value which is in props
  const valueNode: ObjectProperty = propsCollections
    .find(j.ObjectProperty, node => node.key.name === 'value')
    .filter(path => path.parent.parent.node.key.name === 'props')
    .get(0).node

  // replace the value with modelValue
  // @ts-ignore
  valueNode?.key.name = 'modelValue'

  // remove model option
  modelCollection.remove()

  // find the methods option
  const methodsCollections = root
    .find(j.ObjectProperty, node => node.key.name === 'methods')
    .filter(
      nodePath =>
        nodePath.parent.parent.node.type === 'ExportDefaultDeclaration'
    )

  const methodName = `${propEvent}${propName[0]
    .toUpperCase()
    .concat(propName.slice(1))}`
  const methodBodyNode = j(`
  export default {
    ${methodName} (${propName}){
      this.$emit('update:modelValue', ${propName})
    }}`)
    .find(j.ObjectMethod)
    .get(0).node

  if (!methodsCollections.length) {
    //  method option dont exists ,push a method option
    propsCollections
      .get(0)
      .parent.value.properties.push(
        j.objectProperty(
          j.identifier('methods'),
          j.objectExpression([methodBodyNode])
        )
      )
  } else {
    // method option existed ,push method body
    methodsCollections.get(0).node.value.properties.push(methodBodyNode)
  }

  // replace all this.emit(eventName , prop) with ${methodName}(prop)
  const callMethods = root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'ThisExpression'
        },
        property: {
          type: 'Identifier',
          name: '$emit'
        }
      }
    })
    .filter(nodePath => {
      const methodArgs = nodePath.node.arguments
      return (
        methodArgs.length === 2 &&
        methodArgs[0].type === 'StringLiteral' &&
        methodArgs[0].value === propEvent &&
        methodArgs[1].type === 'Identifier'
      )
    })

  if (callMethods.length) {
    // get the second param name
    callMethods.forEach(nodePath => {
      // @ts-ignore
      const paramName = nodePath.node.arguments[1].name
      nodePath.parentPath.replace(
        j.expressionStatement(
          j.callExpression(j.identifier(methodName), [j.identifier(paramName)])
        )
      )
    })
  }
}

export default wrap(transformAST)
export const parser = 'babylon'
