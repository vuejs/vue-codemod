interface FileInfo {
  /** The absolute path to the current file. */
  path: string
  /** The source code of the current file. */
  source: string
}

interface Options {
  [option: string]: any
}

export default interface VueTransformation {
  (file: FileInfo, options: Options): string | null | undefined | void
  type: string
}
