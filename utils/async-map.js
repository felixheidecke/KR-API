export default function (arrayIn, callback) {
  if (!Array.isArray(arrayIn)) {
    throw new Error('attribute is not of type array');
  }

  return new Promise((resolve) => {
    const arrayOut = [];

    arrayIn.forEach(async (element, index) => {
      arrayOut.push(await callback(element));
      if (arrayIn.length === index + 1) {
        resolve(arrayOut);
      }
    });
  });
}
