import { server } from './app'
import './watcher'
import { API_PORT } from './constants'


console.log(`Vue Codemode Playground API Started at http://localhost:${API_PORT}`)
server.listen(API_PORT)
