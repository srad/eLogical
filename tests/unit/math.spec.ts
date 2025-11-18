import { describe, it, expect } from 'vitest'
import { truthTable } from '@/lib/math'

describe('math.ts', () => {
  it('Create truth table of size 2^3', () => {
    const table = truthTable(2, 3)
    expect(table).toEqual([
      [false, false, false],
      [false, false, true],
      [false, true, false],
      [false, true, true],
      [true, false, false],
      [true, false, true],
      [true, true, false],
      [true, true, true],
    ])
  })

  it('Create truth table of size 2^2', () => {
    const table = truthTable(2, 2)
    expect(table).toEqual([
      [false, false],
      [false, true],
      [true, false],
      [true, true],
    ])
  })

  it('Create truth table of size 2^1', () => {
    const table = truthTable(2, 1)
    expect(table).toEqual([[false], [true]])
  })

  it('Create truth table of size 2^0', () => {
    const table = truthTable(2, 0)
    expect(table).toEqual([[]])
  })
})
