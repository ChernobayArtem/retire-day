import type { ComponentType } from 'react'
import Day1 from './Day1'
import Day2 from './Day2'
import Day3 from './Day3'
import Day4 from './Day4'
import Day5 from './Day5'
import Day6 from './Day6'
import Day7 from './Day7'
import Day8 from './Day8'
import Day9 from './Day9'
import Day10 from './Day10'
import Day11 from './Day11'
import Day12 from './Day12'
import Day13 from './Day13'
import Day14 from './Day14'
import Day15 from './Day15'
import Day16 from './Day16'
import Day17 from './Day17'
import Day18 from './Day18'
import Day19 from './Day19'
import Day20 from './Day20'
import Day21 from './Day21'
import Day22 from './Day22'
import Day23 from './Day23'
import Day24 from './Day24'
import Day25 from './Day25'
import Day26 from './Day26'
import Day27 from './Day27'
import Day28 from './Day28'
import Day29 from './Day29'

// Days not listed fall back to the meadow (Day1) until their own scene lands.
const registry: Record<number, ComponentType> = {
  1: Day1,
  2: Day2,
  3: Day3,
  4: Day4,
  5: Day5,
  6: Day6,
  7: Day7,
  8: Day8,
  9: Day9,
  10: Day10,
  11: Day11,
  12: Day12,
  13: Day13,
  14: Day14,
  15: Day15,
  16: Day16,
  17: Day17,
  18: Day18,
  19: Day19,
  20: Day20,
  21: Day21,
  22: Day22,
  23: Day23,
  24: Day24,
  25: Day25,
  26: Day26,
  27: Day27,
  28: Day28,
  29: Day29,
}

export function sceneForDay(day: number): ComponentType {
  return registry[day] ?? Day1
}
