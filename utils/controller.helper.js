import { HEADER, MIME_TYPE_TEXT } from './constants.js'

export const sendHandler = (response, request, data) => {
  if (!data) {
    sendNotFoundHandler(response)
    return
  }
  sendDataHandler(response, request, data)
}

export const sendDataHandler = (response, request, data) => {
  response.send(data)
  request.cache.data = data
  request.cache.shouldSave = true
}

export const sendNotFoundHandler = (response, message = 'No results found') => {
  response.header(HEADER.CONTENT_TYPE, MIME_TYPE_TEXT)
  response.code(404).send(message)
}

export const catchHandler = (response, error) => {
  response.log.error(error)
  response.code(500).send(error)
}
