export function join() {
  const args = Array.from(arguments)

  if (Array.isArray(args[0])) {
    return args[0].join(args[1] || ',')
  } else {
    return args.join('')
  }
}
