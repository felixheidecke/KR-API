import { host } from '#config/paypal'
import { HEADER, TOKEN, MIME_TYPE_JSON } from '#utils/constants';
import fetch from 'node-fetch'

export const generateAccessToken = async (module) => {
  const { clientId, secret } = await getCredentials(module)
  const basicAuth = Buffer.from(clientId + ":" + secret).toString("base64")
  const response = await fetch(`${host}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      [HEADER.AUTHORIZATION]: TOKEN.BASIC(basicAuth)
    },
  });

  const { access_token } = await response.json();
  return access_token;
}

export const generateClientToken = async (module) => {
  const accessToken = await generateAccessToken(module);
  const response = await fetch(`${host}/v1/identity/generate-token`, {
    method: "POST",
    headers: {
      [HEADER.AUTHORIZATION]: TOKEN.BEARER(accessToken),
      [HEADER.CONTENT_TYPE]: MIME_TYPE_JSON,
      [HEADER.ACCEPT_LANGUAGE]: 'de_DE'
    },
  });

  const { client_token } = await response.json();
  return client_token;
}
