/**
 * Tests for type helper utilities
 */

import type { RemScale, PxScale, PxScaleSmall } from '../lib/unitTypes'
import type { ExtractUnitKeys, InferUnitKeys, UnitValue } from './helpers'

// Type-level assertion helpers
type Expect<T extends true> = T
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

describe('Helper type utilities', () => {
  describe('ExtractUnitKeys', () => {
    it('should extract unit keys correctly', () => {
      type Config = { rem: [0, 0.25, 4]; px: [0, 4, 16] }
      type Keys = ExtractUnitKeys<Config>

      // Keys['rem'] should be RemScale
      // Keys['px'] should be PxScaleSmall
      type _RemKeysTest = Expect<Equal<Keys['rem'], RemScale>>
      type _PxKeysTest = Expect<Equal<Keys['px'], PxScaleSmall>>

      const config: Config = { rem: [0, 0.25, 4], px: [0, 4, 16] }
      expect(config).toBeDefined()
    })
  })

  describe('InferUnitKeys', () => {
    it('should infer unit keys based on config', () => {
      type RemKeys = InferUnitKeys<[0, 0.25, 4], 'rem'>
      type PxKeys = InferUnitKeys<[0, 4, 64], 'px'>
      type CustomKeys = InferUnitKeys<[0, 1, 10], 'rem'>

      type _Test1 = Expect<Equal<RemKeys, RemScale>>
      type _Test2 = Expect<Equal<PxKeys, PxScale>>
      type _Test3 = Expect<Equal<CustomKeys, number>>

      expect(true).toBe(true)
    })
  })

  describe('UnitValue', () => {
    it('should extract unit values', () => {
      type Config = { rem: [0, 0.25, 4] }
      type RemValues = UnitValue<Config, 'rem'>

      // RemValues should be the literal union of rem scale values
      type _Test = Expect<Equal<RemValues, RemScale>>

      const validValue: RemValues = 0.5
      expect(validValue).toBe(0.5)
    })

    it('should handle multiple unit types', () => {
      type Config = {
        rem: [0, 0.25, 4]
        px: [0, 4, 16]
      }

      type RemVals = UnitValue<Config, 'rem'>
      type PxVals = UnitValue<Config, 'px'>

      type _RemTest = Expect<Equal<RemVals, RemScale>>
      type _PxTest = Expect<Equal<PxVals, PxScaleSmall>>

      const remVal: RemVals = 1
      const pxVal: PxVals = 8

      expect(remVal).toBe(1)
      expect(pxVal).toBe(8)
    })
  })
})
