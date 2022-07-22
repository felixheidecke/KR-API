export default function (arrayIn, callback) {
  if (!Array.isArray(arrayIn)) {
    throw new Error('attribute is not of type array')
  }

  return new Promise((resolve) => {
    const arrayOut = []

    let i = 0
    arrayIn.forEach(async (element) => {
      arrayOut.push(await callback(element))
      i++
      if (arrayIn.length === i) {
        resolve(arrayOut)
      }
    })
  })
}
