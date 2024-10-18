export default function detectHTML(value?: string) {
  return value ? !/<[^>]*>/.test(value) : false
}
