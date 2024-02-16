/**
 * Turn hours, minutes and seconds into milliseconds
 *
 * @param {object} param h = hours, m = minutes, s = seconds
 * @returns {number} calculated milliseconds
 */

export function toMilliseconds({
  hours,
  minutes,
  seconds
}: {
  hours?: number
  minutes?: number
  seconds?: number
}) {
  let milliseconds = 0

  if (hours) {
    milliseconds += hours * 3600000
  }

  if (minutes) {
    milliseconds += minutes * 60000
  }

  if (seconds) {
    milliseconds += seconds * 1000
  }

  return milliseconds
}

export function toSeconds({ hours, minutes }: { hours?: number; minutes?: number }) {
  let seconds = 0

  if (hours) {
    seconds += hours * 3600
  }

  if (minutes) {
    seconds += minutes * 60
  }

  return seconds
}
