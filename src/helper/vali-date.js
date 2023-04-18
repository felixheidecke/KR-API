export function valiDate(string) {
  return new Date(string).toString() !== 'Invalid Date'
}
