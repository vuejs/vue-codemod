import {
  arrayExpression,
  arrowFunctionExpression,
  blockStatement,
  booleanLiteral,
  callExpression,
  CallExpression,
  ClassDeclaration,
  ClassMethod,
  ClassProperty,
  Decorator,
  exportDefaultDeclaration,
  ExportDefaultDeclaration,
  expressionStatement,
  Identifier,
  identifier,
  ImportDeclaration,
  literal,
  memberExpression,
  ObjectExpression,
  objectExpression,
  ObjectMethod,
  objectMethod,
  ObjectProperty,
  objectProperty,
  Property,
  property,
  returnStatement,
  spreadElement,
  stringLiteral,
  thisExpression,
  tsAsExpression,
  tsTypeParameterInstantiation,
  tsTypeReference,
  VariableDeclaration
} from 'jscodeshift'
import type { ASTTransformation, Context } from '../src/wrapAstTransformation'
import wrap from '../src/wrapAstTransformation'
import { transformAST as addImport } from './add-import'

type VueClassProperty = ClassProperty & {
  optional: boolean;
  key: {
    name: string;
  };
  decorators: ({
    expression: {
      callee: Identifier,
      arguments: (({
        properties: Property[]
      } & ObjectExpression) | Identifier)[],
    } & CallExpression,
  } & Decorator)[];
}

type VuexMappingItem = { remoteName: string, localName: string }[]

export const transformAST: ASTTransformation = (context: Context) => {
  removeImports(context)
  classToOptions(context)
}

function removeImports(context: Context) {
  const removableModules = [
    'vue-class-component',
    'vue-property-decorator',
    'vue-mixin-decorator',
    'vuex-class',
    'vue',
    'vuex',
    'vue-q'
  ]

  context
    .root
    .find(ImportDeclaration, (node: ImportDeclaration) =>
      node.source?.value && removableModules.includes(String(node.source?.value))
    )
    .remove()
}

function importModule(name: string, source: string, context: Context) {
  addImport(context, {
    specifier: {
      type: 'named',
      imported: name
    },
    source: source
  })
}

const vueHooks = [
  // Vue
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  // Vue-router
  'beforeRouteEnter',
  'beforeRouteUpdate',
  'beforeRouteLeave'
]

const supportedDecorators = [
  'Prop',
  'Ref',
  'State',
  'Action',
  'Getter',
  'Mutation',
  'Provide',
  'Inject'
]

function classToOptions(context: Context) {
  const prevDefaultExportDeclaration = context.root.find(ExportDefaultDeclaration)
  const newDefaultExportDeclaration = exportDefaultDeclaration(identifier('default'))
  const prevClass = prevDefaultExportDeclaration.find(ClassDeclaration)
  const prevClassProperties = prevDefaultExportDeclaration.find(ClassProperty)
  const prevClassComputed = prevDefaultExportDeclaration.find(ClassMethod, {
    kind: 'get'
  })
  const prevClassMethods = prevDefaultExportDeclaration.find(ClassMethod, dec => dec.kind === 'method' && !vueHooks.includes(dec.key.name) && dec.decorators?.[0]?.expression?.callee?.name !== 'Watch')
  const prevClassHooks = prevDefaultExportDeclaration.find(ClassMethod, dec => dec.kind === 'method' && vueHooks.includes(dec.key.name))
  const prevClassWatches = prevDefaultExportDeclaration.find(ClassMethod, dec => dec.decorators?.[0]?.expression?.callee?.name === 'Watch')
  const componentDecorator = prevClass.get(0).node.decorators?.find(d => d.expression.callee?.name === 'Component' || d.expression.name === 'Component')
  const newClassProperties = componentDecorator?.expression?.arguments?.[0]?.properties || []
  const variableDeclarations = context.root.find(VariableDeclaration)

  const props: Property[] = []
  const data: Property[] = []
  const mixins: string[] = []
  const refs: VueClassProperty[] = []
  const provides: VueClassProperty[] = []
  const injects: VueClassProperty[] = []

  const vuex = {
    Action: new Map<string, VuexMappingItem>(),
    ActionAlias: new Map<string, VuexMappingItem>(),
    State: new Map<string, VuexMappingItem>(),
    StateAlias: new Map<string, VuexMappingItem>(),
    Getter: new Map<string, VuexMappingItem>(),
    GetterAlias: new Map<string, VuexMappingItem>(),
    Mutation: new Map<string, VuexMappingItem>(),
    MutationAlias: new Map<string, VuexMappingItem>()
  }
  // We need this object as a reference for vuex accessors (actions/getters/etc) class members decorators
  const vuexNamespaceMap: Record<string, string> = {}

  context.root.find(ClassDeclaration, dec => {
    if (dec.superClass?.callee?.name === 'Mixins') {
      mixins.push(dec.superClass.arguments[0].name)
    }
  })

  if (variableDeclarations.length) {
    context
      .root
      .get(0)
      .node
      .program
      .body
      .filter((item: VariableDeclaration) => item.type === 'VariableDeclaration')
      .forEach((vd: VariableDeclaration) => {
        // We assume there are no multiple declarations like "const a = 1, b = 2" __for vuex namespaces__
        const [declaration] = vd.declarations

        // We're interested in namespace('...') call expressions __only with arguments__
        if (
          declaration.init.type !== 'CallExpression'
          || !declaration.init.arguments?.[0]?.value
          || declaration.init.callee.name !== 'namespace'
        ) return

        vuexNamespaceMap[declaration.id.name] = declaration.init.arguments[0].value
        context.root.find(VariableDeclaration, (value => value.declarations?.[0].init?.callee?.name === 'namespace')).remove()
      })
  }

  prevClassProperties.forEach((p) => {
    const prop = p.node as VueClassProperty

    if (prop.decorators) {
      const accessorType = prop.decorators[0].expression.callee.property
        ? prop.decorators[0].expression.callee.property?.name
        : prop.decorators[0].expression.callee.name
      const decoratorName = prop.decorators[0].expression.callee.object?.name || 'global'
      const localName = prop.key.name

      const argumentValue = prop.decorators[0].expression.arguments?.[0]?.value || localName

      if (!supportedDecorators.includes(accessorType)) {
        // Temp condition
        if (accessorType === 'Consumer') {
          return
        }
        throw new Error(`Decorator ${accessorType} is not supported.`)
      }

      if (accessorType === 'Ref') {
        refs.push(prop)
        return
      } else if (accessorType === 'Provide') {
        provides.push(prop)
        return
      } else if (accessorType === 'Inject') {
        injects.push(prop)
        return
      }

      // Vuex
      const vuexAccessors = [
        'Action',
        'State',
        'Getter',
        'Mutation'
      ]

      if (vuexAccessors.includes(accessorType)) {
        const isAliased = localName !== argumentValue
        const accessor = `${accessorType}${isAliased ? 'Alias' : ''}` as 'Action' | 'State' | 'Getter' | 'Mutation' | 'ActionAlias' | 'StateAlias' | 'GetterAlias' | 'MutationAlias'

        if (vuex[accessor]) {
          const existingModule = vuex[accessor].get(decoratorName)
          if (existingModule) {
            existingModule.push({
              remoteName: argumentValue,
              localName
            })
          } else {
            vuex[accessor].set(decoratorName, [{
              remoteName: argumentValue,
              localName
            }])
          }
        }
      }

      // Prop
      const propDecorator = prop.decorators.find(d => d.expression.callee?.name === 'Prop')

      if (!propDecorator) return

      const decoratorPropArgument = propDecorator.expression?.arguments?.[0]!
      let rawType: any

      if (decoratorPropArgument?.type === 'Identifier') {
        rawType = decoratorPropArgument.name
      } else if (decoratorPropArgument?.type === 'ArrayExpression') {
        rawType = propDecorator.expression.arguments?.[0]
      } else {
        const typeKind = propDecorator.expression.arguments[0]?.properties?.find(p => p.key.name === 'type')
        if (typeKind) {
          rawType = typeKind.value.name
        } else {
          rawType = prop.typeAnnotation?.typeAnnotation?.type || 'Object'
        }
      }

      let type: any

      if (rawType.type === 'ArrayExpression') {
        type = rawType
      } else if (rawType.match(/^TS(.*)Keyword$/)) {
        const keywordMatch = rawType.match(/^TS(.*)Keyword$/)

        type = identifier(keywordMatch[1])
      } else if (rawType === 'TSUnionType') {
        const rawUnionTypes = prop.typeAnnotation?.typeAnnotation?.types || []
        type = arrayExpression(rawUnionTypes.map(raw => {
          const utKeywordMatch = raw.type.match(/^TS(.*)Keyword$/)
          let unionType = utKeywordMatch ? utKeywordMatch[1] : 'Object'

          if (raw.type === 'TSTypeReference') {
            unionType = raw.typeName.name
          }

          if (['Undefined', 'Null'].includes(unionType)) {
            unionType = unionType.toLowerCase()
          }

          return identifier(unionType)
        }))
      } else if (rawType === 'TSTypeReference') {
        type = identifier(prop.typeAnnotation?.typeAnnotation?.typeName?.name || 'Object')
      } else if (rawType.match(/^TS/)) {
        type = identifier('Object')
      } else {
        type = identifier(rawType)
      }

      const typedProp = tsAsExpression(
        type,
        tsTypeReference(
          identifier('PropType'),
          tsTypeParameterInstantiation([
            prop.typeAnnotation?.typeAnnotation
          ])
        )
      )

      const isRequired = !prop.optional

      const propProperties: Property[] = [
        property('init', identifier('type'), typedProp),
        property('init', identifier('required'), booleanLiteral(isRequired))
      ]

      if (propDecorator && propDecorator.expression.arguments.length) {
        const theDefault = propDecorator.expression.arguments[0].properties?.find(p => p.key.name === 'default')
        const theValidator = propDecorator.expression.arguments[0].properties?.find(p => p.key.name === 'validator')

        if (theDefault) {
          const theDefaultValue = theDefault?.value.type === 'ArrowFunctionExpression' ? theDefault?.value?.body?.value : theDefault?.value.value

          propProperties.push(
            property(
              'init',
              identifier('default'),
              arrowFunctionExpression(
                [],
                theDefaultValue ? literal(theDefaultValue) : objectExpression([])
              )
            )
          )
        }

        if (theValidator) {
          propProperties.push(
            property(
              'init',
              identifier('validator'),
              theValidator.value
            )
          )
        }
      }

      props.push(property('init', prop.key, objectExpression(propProperties)))
    } else if (prop.value) {
      data.push(property('init', prop.key, prop.value))
    }
  })

  // Mixins
  if (mixins.length) {
    newClassProperties.push(
      property('init', identifier('mixins'),
        arrayExpression(mixins.map(mixin => identifier(mixin)))
      )
    )
  }

  // Provide
  if (provides.length) {
    newClassProperties.push(
      objectMethod(
        'method',
        identifier('provide'),
        [],
        blockStatement([
          returnStatement(
            objectExpression(
              Array.from(provides)
                .map(provide => property(
                  'init',
                  provides[0].decorators[0].expression.arguments[0].value
                    ? identifier(provides[0].decorators[0].expression.arguments[0].value)
                    : provide.key,
                  memberExpression(
                    thisExpression(),
                    provide.key
                  )
                ))
            )
          )
        ])
      )
    )

    data.push(
      ...Array.from(provides)
        .map(provide => property(
            'init',
            provide.key,
            provide.value
          )
        )
    )
  }

  // Inject
  if (injects.length) {
    newClassProperties.push(
      property(
        'init',
        identifier('inject'),
        objectExpression(
          Array.from(injects)
            .map(inject => property(
              'init',
              inject.key,
              stringLiteral(inject.key.name)
            ))
        )
      )
    )
  }

  // Props
  newClassProperties.push(
    property('init', identifier('name'), stringLiteral(prevClass.get(0).node.id.name)),
    ...(props.length ? [property('init', identifier('props'), objectExpression(props))] : []),
    ...(data.length ? [property('init', identifier('data'), arrowFunctionExpression([], objectExpression(data)))] : [])
  )

  const computed: any[] = []
  const methods: any[] = []

  // Computed
  vuex.Action.forEach((actionArguments, actionName: string) => {
    if (!vuexNamespaceMap[actionName] && actionName !== 'global') {
      throw new Error(`Unknown decorator @${actionName}. Make sure you have "const ${actionName} = namespace('${actionName}'); specified`)
    }
    methods.push(
      spreadElement(callExpression(identifier('mapActions'), [
        ...(actionName === 'global' ? [] : [
          stringLiteral(vuexNamespaceMap[actionName])
        ]),
        arrayExpression(actionArguments.map(a => stringLiteral(a.remoteName)))
      ]))
    )
  })

  vuex.ActionAlias.forEach((actionArguments, actionName: string) => {
    if (!vuexNamespaceMap[actionName] && actionName !== 'global') {
      throw new Error(`Unknown decorator @${actionName}. Make sure you have "const ${actionName} = namespace('${actionName}'); specified`)
    }

    methods.push(
      spreadElement(callExpression(identifier('mapActions'), [
        ...(actionName === 'global' ? [] : [
          stringLiteral(vuexNamespaceMap[actionName])
        ]),
        objectExpression([
          ...actionArguments.map(arg => objectProperty(identifier(arg.localName), stringLiteral(arg.remoteName)))
        ])
      ]))
    )
  })

  vuex.Mutation.forEach((actionArguments, actionName: string) => {
    methods.push(
      spreadElement(callExpression(identifier('mapMutations'), [
        ...(actionName === 'global' ? [] : [
          stringLiteral(actionName)
        ]),
        arrayExpression(actionArguments.map(a => stringLiteral(a.remoteName)))
      ]))
    )
  })

  vuex.MutationAlias.forEach((actionArguments, actionName: string) => {
    methods.push(
      spreadElement(callExpression(identifier('mapMutations'), [
        ...(actionName === 'global' ? [] : [
          stringLiteral(actionName)
        ]),
        objectExpression([
          ...actionArguments.map(arg => objectProperty(identifier(arg.localName), stringLiteral(arg.remoteName)))
        ])
      ]))
    )
  })

  if (methods.length) {
    newClassProperties.push(property('init', identifier('methods'), objectExpression(methods)))
  }

  vuex.State.forEach((actionArguments, actionName: string) => {
    computed.push(
      spreadElement(callExpression(identifier('mapState'), [
        ...(actionName === 'global' ? [] : [
          stringLiteral(actionName)
        ]),
        arrayExpression(actionArguments.map(a => stringLiteral(a.remoteName)))
      ]))
    )
  })

  vuex.StateAlias.forEach((actionArguments, actionName: string) => {
    computed.push(
      spreadElement(callExpression(identifier('mapState'), [
        ...(actionName === 'global' ? [] : [
          stringLiteral(actionName)
        ]),
        objectExpression([
          ...actionArguments.map(arg => objectProperty(identifier(arg.localName), stringLiteral(arg.remoteName)))
        ])
      ]))
    )
  })

  vuex.Getter.forEach((actionArguments, actionName: string) => {
    computed.push(
      spreadElement(callExpression(identifier('mapGetters'), [
        ...(actionName === 'global' ? [] : [
          stringLiteral(actionName)
        ]),
        arrayExpression(actionArguments.map(a => stringLiteral(a.remoteName)))
      ]))
    )
  })

  vuex.GetterAlias.forEach((actionArguments, actionName: string) => {
    computed.push(
      spreadElement(callExpression(identifier('mapGetters'), [
        ...(actionName === 'global' ? [] : [
          stringLiteral(actionName)
        ]),
        objectExpression([
          ...actionArguments.map(arg => objectProperty(identifier(arg.localName), stringLiteral(arg.remoteName)))
        ])
      ]))
    )
  })

  prevClassComputed.forEach(c => {
    const method = objectMethod('method', c.node.key, [], c.node.body)

    method.async = c.node.async
    method.comments = c.node.comments
    computed.push(method)
  })

//   console.log(
//     context
//       .root
//       .get(0)
//       .node
//       .program
//       .body[0]
//     .declarations[0]
//     .init
//     .properties[0]
//     .body
//     .body[0]
//     .argument
// .typeAnnotation
//   )
  refs.forEach((ref) => {
    let statement: any = memberExpression(
      memberExpression(
        thisExpression(),
        identifier('$refs')
      ),
      ref.decorators[0].expression.arguments?.[0]?.value
        ? identifier(ref.decorators[0].expression.arguments?.[0]?.value)
        : ref.key
    )

    if (ref.typeAnnotation) {
      statement = tsAsExpression(
        statement,
        tsTypeReference(
          identifier('PropType')
        )
      )
    }
    const getter = objectMethod(
      'method',
      identifier('get'),
      [],
      blockStatement([
        returnStatement(
          statement
        )
      ])
    )

    const refExpression = property(
      'init',
      ref.key,
      objectExpression([
        property('init', identifier('cache'), booleanLiteral(false)),
        getter
      ])
    )

    // method.returnType = tsTypeAnnotation(
    //   tsTypeReference(identifier(ref.typeAnnotation.typeAnnotation.typeName.name))
    // )
    computed.push(refExpression)
  })

  if (computed.length) {
    newClassProperties.push(property('init', identifier('computed'), objectExpression(computed)))
  }

  // Watch
  const watches: (ObjectProperty | ObjectMethod)[] = []
  prevClassWatches.map(c => {
    const watchName = c.node.decorators[0].expression.arguments[0].value
    const watchOptions = c.node.decorators[0].expression.arguments[1]?.properties || []
    const key = watchName.includes('.') ? stringLiteral(watchName) : identifier(watchName)
    let watch

    // We need a object-style watcher
    if (watchOptions.length) {
      const method = objectMethod('method', identifier('handler'), c.node.params, c.node.body)

      method.async = c.node.async
      watch = objectProperty(
        key,
        objectExpression([
          ...watchOptions,
          method
        ])
      )
    } else {
      watch = objectMethod('method', key, c.node.params, c.node.body)
      watch.async = c.node.async
    }

    watches.push(watch)
  })

  if (watches.length) {
    newClassProperties.push(property('init', identifier('watch'), objectExpression(watches)))
  }

  // Hooks
  prevClassHooks.forEach(m => {
    const method = objectMethod('method', m.node.key, [], m.node.body)

    method.async = m.node.async
    newClassProperties.push(method)
  })

  // Methods
  prevClassMethods.forEach(m => {
    const method = objectMethod('method', m.node.key, m.node.params, m.node.body)

    method.async = m.node.async
    method.comments = m.node.comments
    methods.push(method)
  })

  if (vuex.Action.size || vuex.ActionAlias.size) {
    importModule('mapActions', 'vuex', context)
  }

  if (vuex.Getter.size || vuex.GetterAlias.size) {
    importModule('mapGetters', 'vuex', context)
  }

  if (vuex.State.size || vuex.StateAlias.size) {
    importModule('mapState', 'vuex', context)
  }

  if (vuex.Mutation.size || vuex.MutationAlias.size) {
    importModule('mapMutations', 'vuex', context)
  }

  importModule('Vue', 'vue', context)

  newDefaultExportDeclaration.declaration = expressionStatement(callExpression(
    memberExpression(
      identifier('Vue'),
      identifier('extend')
    ),
    [
      objectExpression(newClassProperties)
    ]
  ))
  prevDefaultExportDeclaration.replaceWith(newDefaultExportDeclaration)
}

export default wrap(transformAST)
