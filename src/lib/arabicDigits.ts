
export function toArabicDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) =>
    '٠١٢٣٤٥٦٧٨٩'[Number(digit)]
  )
}
