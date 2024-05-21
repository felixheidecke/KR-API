// @ts-ignore
import textile from 'textile-js'
import { fromUnixTime } from 'date-fns'
import { toUrlSlug } from '../../../common/utils/slugify.js'
import { isNumber } from 'lodash-es'

import type { ArticleContent } from './ArticleContent.js'
import type { Image } from '../../../common/entities/Image.js'
import type { PDF } from '../../shop/entities/PDF.js'

export class Article {
  constructor(readonly module: number) {}

  public id = 0
  protected _title = ''
  protected _slug = ''
  protected _date = new Date()
  public text?: string
  public image?: Image
  public pdf?: PDF
  public web?: string
  public author?: string
  public content?: ArticleContent[]

  // --- [ Getter ] --------------------------------------------------------------------------------

  public get title(): string {
    return this._title
  }

  public get slug(): string {
    return this._slug
  }

  public get date(): Date {
    return this._date
  }

  // --- [ Setter ] --------------------------------------------------------------------------------

  public set title(title: string) {
    this._title = title?.trim()
    this._slug = toUrlSlug(title.trim(), 75)
  }

  public set date(date: Date | number | string) {
    this._date = isNumber(date) ? fromUnixTime(date) : new Date(date)
  }

  public addContent(content: ArticleContent) {
    if (!this.content) {
      this.content = []
    }

    this.content.push(content)
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  display() {
    return Object.freeze({
      id: +this.id,
      module: +this.module,
      slug: this._slug,
      title: this._title,
      date: this._date.toString(),
      text: this.text ? textile.parse(this.text) : undefined,
      image: this.image?.display(),
      content: this.content?.map(item => item.display()),
      pdf: this.pdf?.display(),
      website: this.web,
      author: this.author
    })
  }
}
