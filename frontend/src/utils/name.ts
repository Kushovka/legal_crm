const patronymicPattern = /(вич|вна|ич|ична)$/i
const surnamePattern = /(ов|ова|ев|ева|ёв|ёва|ин|ина|ын|ына|ский|ская|цкий|цкая)$/i

const initial = (value: string) => {
  const firstLetter = value.trim().slice(0, 1)
  return firstLetter ? firstLetter.toUpperCase() : ''
}

export const formatClientDisplayName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) return name.trim()

  const [first, second, third] = parts
  const hasPatronymic = Boolean(third && patronymicPattern.test(third))
  const secondLooksLikeSurname = surnamePattern.test(second)
  const firstLooksLikeSurname = surnamePattern.test(first)

  if (parts.length >= 3 && hasPatronymic && secondLooksLikeSurname && !firstLooksLikeSurname) {
    return [second, initial(first), initial(third)].filter(Boolean).join(' ')
  }

  const [surname, ...rest] = parts
  return [surname, ...rest.map(initial)].filter(Boolean).join(' ')
}
