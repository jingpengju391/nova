import { createDataInputName, getDataInputSizeString } from '../dataInputsAPIs'

describe('Data inputs APIs util functions tests', () => {
  describe('createDataInputName():', () => {
    it('For Unix like path /usr/documents/dataInputs.csv should return "dataInputs"', () => {
      const filePath = '/usr/documents/dataInputs.csv'
      expect(createDataInputName(filePath)).toBe('dataInputs')
    })
  })
  describe('getDataInputSizeString():', () => {
    it('when size is 123, the size string is 123B', () => {
      const size = 123
      expect(getDataInputSizeString(size)).toBe('123B')
    })
    it('when size is 123456, the size string is 123KB', () => {
      const size = 123456
      expect(getDataInputSizeString(size)).toBe('123KB')
    })
    it('when size is 123456789, the size string is 123MB', () => {
      const size = 123456789
      expect(getDataInputSizeString(size)).toBe('123MB')
    })
    it('when size is 123456789789, the size string is 123GB', () => {
      const size = 123456789789
      expect(getDataInputSizeString(size)).toBe('123GB')
    })
    it('when size is 123456789789789, the size string is 123TB', () => {
      const size = 123456789789789
      expect(getDataInputSizeString(size)).toBe('123TB')
    })
    it('when size is 123456789789789789, the size string is 123457TB', () => {
      const size = 123456789789789789
      expect(getDataInputSizeString(size)).toBe('123457TB')
    })
  })
})
