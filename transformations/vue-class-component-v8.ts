import {
  arrayExpression,
  arrowFunctionExpression, blockStatement,
  booleanLiteral, callExpression,
  CallExpression,
  ClassDeclaration,
  ClassMethod,
  ClassProperty,
  Decorator,
  exportDefaultDeclaration,
  ExportDefaultDeclaration, expressionStatement,
  Identifier,
  identifier,
  ImportDeclaration,
  literal,
  ObjectExpression,
  objectExpression,
  objectMethod,
  objectProperty,
  Property,
  property,
  spreadElement,
  stringLiteral, variableDeclaration,
  VariableDeclaration, variableDeclarator
} from 'jscodeshift'
import type { ASTTransformation, Context } from '../src/wrapAstTransformation'
import wrap from '../src/wrapAstTransformation'
import { transformAST as removeExtraneousImport } from './remove-extraneous-import'

type VueClassProperty = ClassProperty & {
  optional: boolean;
  key: {
    name: string;
  };
  decorators: ({
    expression: {
      callee: Identifier,
      arguments: ({
        properties: Property[]
      } & ObjectExpression)[],
    } & CallExpression,
  } & Decorator)[];
}

type VuexMappingItem = {remoteName: string, localName: string}[]

export const transformAST: ASTTransformation = (context: Context) => {
  removeImports(context)
  classToOptions(context)
}

function removeImports(context: Context) {
  const removableModules = [
    'vue-class-component',
    'vue-property-decorator',
    'vuex-class'
  ]

  context
    .root
    .find(ImportDeclaration, (node: ImportDeclaration) =>
      node.source?.value && removableModules.includes(String(node.source?.value))
    )
    .remove()

  removeExtraneousImport(context, {
    localBinding: 'Vue',
    ignoreExtend: true
  })
}

const vueHooks = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
]

function classToOptions(context: Context) {
  const prevDefaultExportDeclaration = context.root.find(ExportDefaultDeclaration)
  const newDefaultExportDeclaration = exportDefaultDeclaration(identifier('default'))
  const prevClass = prevDefaultExportDeclaration.find(ClassDeclaration)
  const prevClassProperties = prevDefaultExportDeclaration.find(ClassProperty)
  const prevClassComputed = prevDefaultExportDeclaration.find(ClassMethod, {
    kind: 'get'
  })
  const prevClassMethods = prevDefaultExportDeclaration.find(ClassMethod, dec => dec.kind === 'method' && !vueHooks.includes(dec.key.name))
  const prevClassHooks = prevDefaultExportDeclaration.find(ClassMethod, dec => dec.kind === 'method' && vueHooks.includes(dec.key.name))
  const componentDecorator = prevClass.get(0).node.decorators.find(d => d.expression.callee?.name === 'Component' || d.expression.name === 'Component')
  const newClassProperties = componentDecorator.expression?.arguments?.[0]?.properties || []
  const variableDeclarations = context.root.find(VariableDeclaration)

  const props: Property[] = []
  const data: Property[] = []

  const vuex = {
    Action: new Map<string, VuexMappingItem>(),
    ActionAlias: new Map<string, VuexMappingItem>(),
    State: new Map<string, VuexMappingItem>(),
    StateAlias: new Map<string, VuexMappingItem>(),
    Getter: new Map<string, VuexMappingItem>(),
    GetterAlias: new Map<string, VuexMappingItem>(),
  }
  // We need this object as a reference for vuex accessors (actions/getters/etc) class members decorators
  const vuexNamespaceMap: Record<string, string> = {}

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
        const [declaration] = vd.declarations;

        // We're interested in namespace('...') call expressions __only with arguments__
        if (
          declaration.init.type !== 'CallExpression'
          || !declaration.init.arguments?.[0]?.value
          || declaration.init.callee.name !== 'namespace'
        ) return;

        vuexNamespaceMap[declaration.id.name] = declaration.init.arguments[0].value;
        context.root.find(VariableDeclaration, (value => value.declarations?.[0].init?.callee?.name === 'namespace')).remove();
      })
  }

  prevClassProperties.forEach((p) => {
    const prop = p.node as VueClassProperty
    const isRequired = !prop.optional
    const propName = prop.key.name

    if (prop.decorators) {
      const propDecorator = prop.decorators.find(d => d.expression.callee.name === 'Prop')
      const type = prop.typeAnnotation?.typeAnnotation?.type.replace(/^TS(.*)Keyword$/, '$1') || 'Object'

      if (prop.decorators[0].expression.arguments?.[0]?.type as string === 'StringLiteral') {
        const accessorType = prop.decorators[0].expression.callee.property
          ? prop.decorators[0].expression.callee.property?.name
          : prop.decorators[0].expression.callee.name;
        const decoratorName = prop.decorators[0].expression.callee.object?.name || 'global';
        const localName = prop.key.name;
        const argumentValue = prop.decorators[0].expression.arguments[0].value;
        const isAliased = localName !== argumentValue;
        const accessor = `${accessorType}${isAliased ? 'Alias' : ''}` as 'Action' | 'State' | 'Getter' | 'ActionAlias' | 'StateAlias' | 'GetterAlias';

        const existingModule = vuex[accessor].get(decoratorName);
        if (existingModule) {
          existingModule.push({
            remoteName: argumentValue,
            localName,
          });
        } else {
          vuex[accessor].set(decoratorName, [{
            remoteName: argumentValue,
            localName,
          }])
        }
      }

      if (!propDecorator) return;

      const propProperties: Property[] = [
        property('init', identifier('type'), identifier(type.match(/^TS/) ? 'Object' : type)),
        property('init', identifier('required'), booleanLiteral(isRequired))
      ]

      if (propDecorator && propDecorator.expression.arguments.length) {
        const theDefault = propDecorator.expression.arguments[0].properties.find(p => p.key.name === 'default')
        const theValidator = propDecorator.expression.arguments[0].properties.find(p => p.key.name === 'validator')

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

      props.push(property('init', identifier(propName), objectExpression(propProperties)))
    } else if (prop.value) {
      data.push(property('init', identifier(prop.key.name), prop.value))
    }
  })

  // Props
  newClassProperties.push(
    property('init', identifier('name'), stringLiteral(prevClass.get(0).node.id.name)),
    property('init', identifier('props'), objectExpression(props)),
    property('init', identifier('data'), arrowFunctionExpression([], objectExpression(data)))
  )

  const computed: any[] = [];
  const methods: any[] = [];

  vuex.Action.forEach((actionArguments, actionName: string) => {
    if (!vuexNamespaceMap[actionName] && actionName !== 'global') {
      throw new Error(`Unknown decorator @${actionName}. Make sure you have "const ${actionName} = namespace('${actionName}'); specified`)
    }
    methods.push(
      spreadElement(callExpression(identifier('mapActions'), [
        ...(actionName === 'global' ? [] : [
          stringLiteral(vuexNamespaceMap[actionName])
        ]),
        arrayExpression(actionArguments.map(a => stringLiteral(a.remoteName))),
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


  vuex.State.forEach((actionArguments, actionName: string) => {
    computed.push(
      spreadElement(callExpression(identifier('mapState'), [
        ...(actionName === 'global' ? [] : [
          stringLiteral(actionName)
        ]),
        arrayExpression(actionArguments.map(a => stringLiteral(a.remoteName))),
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
        arrayExpression(actionArguments.map(a => stringLiteral(a.remoteName))),
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

  // Computed
  prevClassComputed.forEach(c => {
    // console.log(objectMethod('method', c.node.key, [], c.node.body))
    computed.push(objectMethod('method', c.node.key, [], c.node.body))
  })
  newClassProperties.push(property('init', identifier('computed'), objectExpression(computed)));

  // Methods
  prevClassMethods.forEach(m => {
    methods.push(objectMethod('method', m.node.key, [], m.node.body))
  })
  newClassProperties.push(property('init', identifier('methods'), objectExpression(methods)))

  // Hooks
  prevClassHooks.forEach(m => {
    newClassProperties.push(objectMethod('method', m.value.key, [], m.value.body));
  })

  newDefaultExportDeclaration.declaration = objectExpression(newClassProperties)
  prevDefaultExportDeclaration.replaceWith(newDefaultExportDeclaration)
}

export default wrap(transformAST)
