import { omit } from 'lodash-es'

import mailer from '#libs/mailer'
import { HEADER, MIME_TYPE_JSON } from '#utils/constants'
import { jsonToCSV, jsonToText, toFilenameWithDate } from '#utils/helper'
import { from, bcc } from '#config/nodemailer.config'
import { getEmailAddress } from '#data/formmail.data'

export default async (App) => {
  App.route({
    method: 'POST',
    url: '/form',

    schema: {
      body: {
        type: 'object',
        required: ['id', 'subject', 'required'],
        properties: {
          recipient: { type: 'number' },
          subject: { type: 'string' },
          required: { type: 'array' }
        }
      },
      query: {
        type: 'object',
        properties: {
          attach: { type: 'string' }
        }
      }
    },

    onRequest: async (_, response) => {
      // Make sure the response won't be cached
      response.headers({
        [HEADER.CONTENT_TYPE]: MIME_TYPE_JSON,
        [HEADER.CACHE_CONTROL]: [HEADER.PRIVATE, HEADER.NO_STORE].join(', ')
      })
    },

    preValidation: async (request, _) => {
      request.body = {
        ...request.body,
        id: request.body?.id.split(',').map((id) => +id),
        required: request.body?.required.split(',')
      }
    },

    preHandler: async ({ body }, response) => {
      const missing =
        body.required.filter((field) => !body[field]?.length) || []

      try {
        if (!missing.length) return

        response.code(200).send({
          error: 'Missing required fields',
          message: missing.join(',')
        })
      } catch (error) {
        console.error('[KR-API]', error)
        response.code(500).send({ error })
      }
    },

    handler: async ({ body, query }, response) => {
      try {
        const emailAddresses = await getEmailAddress(body.id)
        const content = omit(body, ['id', 'subject', 'required', 'honig'])

        if (emailAddresses.length === 0) {
          response
            .code(400)
            .send({ message: `No entry/s found for id ${body.id}` })
        }

        mailer.sendMail({
          from,
          bcc,
          to: emailAddresses.join(','),
          subject: body.subject.trim(),
          text: jsonToText(content),
          attachments:
            query.attach === 'csv'
              ? [
                {
                  filename: toFilenameWithDate(body.subject, 'csv'),
                  content: jsonToCSV(content),
                  contentType: 'text/csv'
                }
              ]
              : []
        })

        // Don't wait for email being send
        response.code(202).send({ message: 'success' })
      } catch (error) {
        console.error({ error })
        response.code(500).send({ error: 'Internal Server Error!' })
      }
    }
  })
}
