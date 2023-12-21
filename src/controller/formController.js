import * as Sentry from '@sentry/node'
import { omit, pick } from 'lodash-es'
import { transportConfig, createTransport } from '#libs/mailer'
import { jsonToCSV, jsonToText } from '#utils/convert-json'
import { toFilenameWithDate } from '#libs/slugify'
import { from, bcc } from '../config/nodemailer.config.js'
import { getEmailAddress } from '../data/formmail.data.js'
import { cacheNoStoreHook } from '#hooks/headerHooks'

export default async (App) => {
  App.addHook('onRequest', cacheNoStoreHook)

  App.post('/form', {
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

    /**
     * Remodel parts of the body, to match the expected types
     *
     * @param {import("fastify").FastifyRequest} request
     */
    preValidation: async (request) => {
      request.body = {
        ...request.body,
        id: request.body?.id?.split(',').map((id) => +id),
        required: request.body?.required.split(',')
      }
    },

    /**
     * @param {import("fastify").FastifyRequest} request
     * @param {import("fastify").FastifyReply} response
     */
    preHandler: async ({ body }, response) => {
      const missing =
        body.required.filter((field) => !body[field]?.length) || []

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
    handler: async (request, response) => {
      const { body, query } = request
      const scope = new Sentry.Scope()

      scope.setTag('origin', request.headers.origin || 'unknown')
      scope.setContext('context', { url: request.url })

      try {
        const mailer = createTransport(transportConfig)
        const emailAddresses = await getEmailAddress(body.id)
        const content = omit(body, ['id', 'subject', 'required', 'honig'])

        if (emailAddresses.length === 0) {
          App.notFoundHandler(response, `No entry/s found for id ${body.id}`)
        }

        await mailer.sendMail({
          from,
          bcc,
          to: emailAddresses.join(','),
          replyTo: body.Email?.trim() || body.email?.trim() || undefined,
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
        response.code(200).send({ message: 'success' })
      } catch (error) {
        App.catchHandler(response, error)
        Sentry.captureException(error, scope)
      }
    }
  })
}
