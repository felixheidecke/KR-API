export function handleText(text: string) {
  let _text = text.trim()
  _text = newlineToBr(text)
  _text = formatBold(_text)

  return _text
}

function newlineToBr(text: string): string {
  return text.replace(/\r\n/g, '<br />')
}

function formatBold(text: string): string {
  const regex = /\*([^\s*][^*]*?)\*/g
  return text.replace(regex, '<b>$1</b>')
}
