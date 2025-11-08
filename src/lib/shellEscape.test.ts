import { escapeSingleQuotes } from './shellEscape'

describe('shellEscape', () => {
  describe('escapeSingleQuotes', () => {
    it('wraps simple strings in single quotes', () => {
      expect(escapeSingleQuotes('simple/path')).toBe("'simple/path'")
      expect(escapeSingleQuotes('hello world')).toBe("'hello world'")
      expect(escapeSingleQuotes('file.txt')).toBe("'file.txt'")
    })

    it('escapes single quotes using the shell escape pattern', () => {
      // Single quote becomes: '\''
      expect(escapeSingleQuotes("path/with'quote")).toBe("'path/with'\\''quote'")
    })

    it('handles multiple single quotes', () => {
      expect(escapeSingleQuotes("complex'path'with'quotes")).toBe(
        "'complex'\\''path'\\''with'\\''quotes'",
      )
    })

    it('handles strings with only single quotes', () => {
      expect(escapeSingleQuotes("'")).toBe("''\\'''")
      expect(escapeSingleQuotes("''")).toBe("''\\'''\\'''")
    })

    it('handles empty strings', () => {
      expect(escapeSingleQuotes('')).toBe("''")
    })

    it('handles strings with special characters but no quotes', () => {
      expect(escapeSingleQuotes('path/with spaces and $pecial *chars')).toBe(
        "'path/with spaces and $pecial *chars'",
      )
    })

    it('handles strings starting or ending with single quotes', () => {
      expect(escapeSingleQuotes("'start")).toBe("''\\''start'")
      expect(escapeSingleQuotes("end'")).toBe("'end'\\'''")
      expect(escapeSingleQuotes("'both'")).toBe("''\\''both'\\'''")
    })

    it('preserves double quotes and other characters', () => {
      expect(escapeSingleQuotes('path/with"double"quotes')).toBe('\'path/with"double"quotes\'')
      expect(escapeSingleQuotes('path\\with\\backslashes')).toBe("'path\\with\\backslashes'")
    })
  })
})
