declare module 'vue-sfc-descriptor-to-string' {
  import { SFCDescriptor } from '@vue/compiler-sfc'

  interface Options {
    indents?: {
      template?: number
      script?: number
      style?: number
    }
  }

  function toString(sfcDescriptor: SFCDescriptor, options?: Options): string

  export = toString
}
