import { rm, mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

async function cleanDirectory(directoryPath) {
  try {
    await rm(directoryPath, { recursive: true, force: true })
    await mkdir(directoryPath, { recursive: true })
    await writeFile(join(directoryPath, 'index.js'), 'console.log("Klickrhein API")')
  } catch (err) {
    throw new Error('Error: ' + err)
  }
}

cleanDirectory(join(process.cwd(), 'dist'))
