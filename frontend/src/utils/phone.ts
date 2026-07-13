export const formatRussianPhoneInput = (value: string) => {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  }

  if (!digits.startsWith('7') && digits.length > 0) {
    digits = `7${digits}`
  }

  digits = digits.slice(0, 11)

  const parts = [
    digits.slice(1, 4),
    digits.slice(4, 7),
    digits.slice(7, 9),
    digits.slice(9, 11),
  ]

  if (digits.length <= 1) return digits ? '+7' : ''
  if (digits.length <= 4) return `+7 ${parts[0]}`
  if (digits.length <= 7) return `+7 ${parts[0]} ${parts[1]}`
  if (digits.length <= 9) return `+7 ${parts[0]} ${parts[1]}-${parts[2]}`
  return `+7 ${parts[0]} ${parts[1]}-${parts[2]}-${parts[3]}`
}

export const isCompleteRussianPhone = (value: string) => {
  const digits = value.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('7')
}
