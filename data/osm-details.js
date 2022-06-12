import fetch from 'node-fetch';
import { format, formatDistance as fd } from "date-fns";
import { de as locale } from 'date-fns/locale/index.js'
import oh from "opening_hours";

export default async (osmid) => {
  try {
    const baseUrl = 'https://nominatim.openstreetmap.org/details.php'
    const params = new URLSearchParams({
      osmtype: 'N',
      format: 'json',
      osmid
    })

    const data = await fetch(`${baseUrl}?${params}`)
    const resJson = await data.json()

    return await adapter(resJson)
  }
  catch (e) {
    console.error(e);
    return e
  }
}

/**
 * Remodel the structure of node
 *
 * @param {object} a node
 * @returns {object} Remodled node
 */

const adapter = async (data) => {
  const extras = data.extratags || {}
  const [lat, lon] = data.geometry.coordinates

  const model = {
    placeId: data.place_id,
    type: data.type,
    name: data.localname,
    address: data.addresstags,
    countryCode: data.country_code,
    coordinates: [lat, lon]
  }

  if (extras.fax) model.address.fax = extras.fax
  if (extras.operator) model.operator = extras.operator
  if (extras.opening_hours) model.openingHours = await extendOpeningHours(model, extras.opening_hours)

  return model
}

const extendOpeningHours = async ({ coordinates, countryCode }, openingHours) => {
  const nominatim = {
    lat: coordinates[0],
    lon: coordinates[1],
    address: {
      country_code: countryCode
    }
  }

  try {
    const hours = new oh(openingHours, nominatim)
    const openNow = hours.getState()
    const nextChange = hours.getNextChange()

    return {
      raw: openingHours,
      localized: localiseOpeningHours(openingHours),
      openNow,
      nextChange: {
        raw: nextChange,
        formatted: format(nextChange, "EEEE 'um' p 'Uhr'", { locale }),
        distance: formatDistance(nextChange)
      }
    }
  }
  catch (error) {
    console.error(error);
    return null
  }
}

const localiseOpeningHours = (openingHours) => {
  return openingHours
    .replace(/Tu/g, "Di")
    .replace(/We/g, "Mi")
    .replace(/Th/g, "Do")
    .replace(/Su/g, "So")
    .replace(/off/g, "geschlossen")
    .replace(/PH/g, "Feiertags")
}

const formatDistance = (nextChange) => {
  const distance = 'in ' + fd(new Date(), nextChange, { locale })

  if (distance.includes('Tage')) {
    return distance + 'n'
  }

  return distance;
}