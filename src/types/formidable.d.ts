declare module 'formidable' {
  import type { IncomingMessage } from 'http'
  import type { EventEmitter } from 'events'

  export interface Part {
    originalFilename?: string | null
  }

  export interface File {
    filepath?: string
    newFilename?: string
    originalFilename?: string | null
    mimetype?: string | null
    size?: number
  }

  export interface Fields {
    [key: string]: undefined | string | string[]
  }

  export interface Files {
    [key: string]: File | File[] | undefined
  }

  export interface Options {
    multiples?: boolean
    uploadDir?: string
    keepExtensions?: boolean
    maxFileSize?: number
    filename?: (name: string, ext: string, part: Part) => string
  }

  export interface IncomingForm extends EventEmitter {
    parse: (
      req: IncomingMessage,
      callback: (err: Error | null, fields: Fields, files: Files) => void
    ) => void
  }

  const formidable: (options?: Options) => IncomingForm

  export { formidable as default }
}

