export type ClassNameValue = string | false | null | undefined

/**
 * Joins conditional class names without pulling a runtime dependency into the UI kit.
 */
export function classNames(...values: ClassNameValue[]): string {
  return values.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ')
}
