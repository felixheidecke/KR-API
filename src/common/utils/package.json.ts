import { readFileSync } from 'fs'

export default JSON.parse(readFileSync(process.cwd() + '/package.json', 'utf-8'))
