export default function valiDate(string) {
  return new Date(string).toString() !== 'Invalid Date'
}
