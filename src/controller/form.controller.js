import { omit } from 'lodash-es'
import mailer from '#libs/mailer'
import { jsonToCSV, jsonToText } from '#helper/convert-json'
import { toFilenameWithDate } from '#libs/slugify'
import { from, bcc } from '#config/nodemailer'
import { getEmailAddress } from '#data/formmail'
import { catchHandler } from '#utils/controller'

/**
 * Return current cart contents
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const requiredFieldsController = ({ body }, response) => {
  const missing = body.required.filter((field) => !body[field]?.length) || []

  if (!missing.length) return

  response.code(200).send({
    error: 'Missing required fields',
    message: missing.join(',')
  })
}

/**
 * Return current cart contents
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} response
 */

export const formController = async ({ body, query }, response) => {
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
