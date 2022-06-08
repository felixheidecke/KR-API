import fetch from 'node-fetch';

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

    return adapter(resJson)
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

const adapter = (data) => {
  return {
    placeId: data.place_id,
    type: data.type,
    names: data.names,
    address: {
      ...data.addresstags,
      fax: data.extratags?.fax || null,
      countryCode: data.country_code,
    },
    operator: data.extratags?.operator || null,
    openingHours: data.extratags?.opening_hours || null,
    geometry: data.geometry
  }
}