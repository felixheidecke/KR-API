// @ts-ignore
import { fromUnixTime } from 'date-fns'
import { toUrlSlug } from '#utils/slugify.js'
import { isNumber } from 'lodash-es'
import { handleText } from '../utils/handle-text.js'

import type { ArticleContent } from './article-content.js'
import type { Image } from '#common/entities/image.js'
import type { PDF } from '#common/entities/pdf.js'

export class Article {
  constructor(readonly module: number) {}

  public id = 0
  protected _title = ''
  protected _slug = ''
  protected _date = new Date()
  public teaser = ''
  public image?: Image | null
  public pdf?: PDF | null
  public web?: string | null
  public author?: string | null
  public content?: ArticleContent[] | null

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
      date: this._date.toISOString(),
      teaser: handleText(this.teaser),
      image: this.image?.display() || null,
      content: this.content?.map(item => item.display()),
      pdf: this.pdf?.display() || null,
      website: this.web,
      author: this.author
    })
  }
}
