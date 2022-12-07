import { omit } from 'lodash-es'
import { cacheNoStore as cacheNoStoreHandler } from '#hooks/header'
import mailer from '#libs/mailer'
import { jsonToCSV, jsonToText } from '#helper/convert-json'
import { toFilenameWithDate } from '#libs/slugify'
import { from, bcc } from '#config/nodemailer'
import { getEmailAddress } from '#data/formmail'
import { catchHandler } from '#utils/controller'

const formController = {
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

  onRequest: cacheNoStoreHandler,

  /**
   * @param {import("fastify").FastifyRequest} request
   */
  preValidation: async (request) => {
    request.body = {
      ...request.body,
      id: request.body?.id.split(',').map((id) => +id),
      required: request.body?.required.split(',')
    }
  },

  /**
   * @param {import("fastify").FastifyRequest} request
   * @param {import("fastify").FastifyReply} response
   */
  preHandler: ({ body }, response) => {
    const missing = body.required.filter((field) => !body[field]?.length) || []

    if (!missing.length) return

    response.code(200).send({
      error: 'Missing required fields',
      message: missing.join(',')
    })
  },

  /**
   * Return current cart contents
   *
   * @param {import("fastify").FastifyRequest} request
   * @param {import("fastify").FastifyReply} response
   */
  handler: async ({ body, query }, response) => {
    try {
      const emailAddresses = await getEmailAddress(body.id)
      const content = omit(body, ['id', 'subject', 'required', 'honig'])

      if (emailAddresses.length === 0) {
        sendNotFoundHandler(response, `No entry/s found for id ${body.id}`)
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
      catchHandler(response, error)
    }
  }
}

export default async (App) => {
  App.route(formController)
}
