import { readFileSync } from 'fs'
import { template } from 'lodash-es'
import fetch from 'node-fetch'

const TEMPLATE_FOLDER = process.cwd() + '/src/features/shop/templates'
const LOCALHOSTS_REGEX = /http(s?):\/\/localhost/

export class TemplateRepository {
  public static async getTemplate(file: string, path?: string) {
    let templateFile: string

    if (!path || LOCALHOSTS_REGEX.test(path.toString())) {
      templateFile = await readFileSync(TEMPLATE_FOLDER + '/' + file, 'utf-8')
    } else {
      const url = new URL('/templates/' + file, path)
      const request = await fetch(url)
      templateFile = await request.text()
    }

    return template(templateFile)
  }
}
