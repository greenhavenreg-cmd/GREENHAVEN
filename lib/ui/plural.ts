/** English count label: plural(1, "comment") → "1 comment", plural(2, "comment") → "2 comments". */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  const n = Number.isFinite(count) ? count : 0
  return `${n} ${n === 1 ? singular : pluralForm}`
}
