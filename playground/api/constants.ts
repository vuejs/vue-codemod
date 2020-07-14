import path from "path"

export const API_PORT = process.env.API_PORT || process.env.PORT || 3002
export const ROOT_DIR = path.resolve(__dirname, '../..')
export const TRANS_DIR = path.resolve(ROOT_DIR, 'transformations')
