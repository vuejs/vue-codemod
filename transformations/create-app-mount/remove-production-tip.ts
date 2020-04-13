import { JSCodeshift } from 'jscodeshift'

export default function removeProductionTip(j: JSCodeshift, root: ReturnType<JSCodeshift>) {
  const productionTipAssignment = root.find(
    j.AssignmentExpression,
    n =>
      n.left.type === 'MemberExpression' &&
      n.left.property.name === 'productionTip' &&
      n.left.object.property.name === 'config' &&
      n.left.object.object.name === 'Vue'
  )
  productionTipAssignment.remove()

  return root
}
