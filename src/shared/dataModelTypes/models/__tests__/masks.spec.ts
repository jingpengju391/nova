// import Mask from '../masks'
// import Variable from '../variables'
// import { createInheritedProperty, PropertyType } from '../helpers'

// describe('Masks Unit Tests', () => {
//   it('Masks can add variables', () => {
//     const maskA = new Mask()
//     expect(Object.keys(maskA.variables).length).toEqual(0)
//     maskA.addProperty(PropertyType.variables)
//     expect(Object.keys(maskA.variables).length).toEqual(1)
//     maskA.addProperty(PropertyType.variables)
//     expect(Object.keys(maskA.variables).length).toEqual(2)
//   })
//   it('Masks can add series', () => {
//     const maskA = new Mask()
//     expect(Object.keys(maskA.series).length).toEqual(0)
//     maskA.addProperty(PropertyType.series)
//     expect(Object.keys(maskA.series).length).toEqual(1)
//     maskA.addProperty(PropertyType.series)
//     expect(Object.keys(maskA.series).length).toEqual(2)
//   })
//   it('Masks can add links', () => {
//     const maskA = new Mask()
//     expect(Object.keys(maskA.links).length).toEqual(0)
//     maskA.addProperty(PropertyType.links)
//     expect(Object.keys(maskA.links).length).toEqual(1)
//     maskA.addProperty(PropertyType.links)
//     expect(Object.keys(maskA.links).length).toEqual(2)
//   })
//   it('Masks can add methods', () => {
//     const maskA = new Mask()
//     expect(Object.keys(maskA.methods).length).toEqual(0)
//     maskA.addProperty(PropertyType.methods)
//     expect(Object.keys(maskA.methods).length).toEqual(1)
//     maskA.addProperty(PropertyType.methods)
//     expect(Object.keys(maskA.methods).length).toEqual(2)
//   })

//   it('Masks can delete variables', () => {
//     const maskA = new Mask()
//     const variable1 = maskA.addProperty(PropertyType.variables)
//     const variable2 = maskA.addProperty(PropertyType.variables)
//     expect(Object.keys(maskA.variables).length).toEqual(2)
//     maskA.deleteProperty(PropertyType.variables, variable1.id)
//     expect(Object.keys(maskA.variables).length).toEqual(1)
//     expect(maskA.variables[variable2.id]).toEqual(variable2)
//   })

//   it('Masks can delete series', () => {
//     const maskA = new Mask()
//     const series1 = maskA.addProperty(PropertyType.series)
//     const series2 = maskA.addProperty(PropertyType.series)
//     expect(Object.keys(maskA.series).length).toEqual(2)
//     maskA.deleteProperty(PropertyType.series, series1.id)
//     expect(Object.keys(maskA.series).length).toEqual(1)
//     expect(maskA.series[series2.id]).toEqual(series2)
//   })

//   it('Masks can delete links', () => {
//     const maskA = new Mask()
//     const link1 = maskA.addProperty(PropertyType.links)
//     const link2 = maskA.addProperty(PropertyType.links)
//     expect(Object.keys(maskA.links).length).toEqual(2)
//     maskA.deleteProperty(PropertyType.links, link1.id)
//     expect(Object.keys(maskA.links).length).toEqual(1)
//     expect(maskA.links[link2.id]).toEqual(link2)
//   })

//   it('Masks can delete methods', () => {
//     const maskA = new Mask()
//     const method1 = maskA.addProperty(PropertyType.methods)
//     const method2 = maskA.addProperty(PropertyType.methods)
//     expect(Object.keys(maskA.methods).length).toEqual(2)
//     maskA.deleteProperty(PropertyType.methods, method1.id)
//     expect(Object.keys(maskA.methods).length).toEqual(1)
//     expect(maskA.methods[method2.id]).toEqual(method2)
//   })

//   // it('Masks can toggle override properties of variables', () => {
//   //   const maskA = new Mask()
//   //   const newVariable = maskA.addProperty(PropertyType.variables)
//   //   expect(newVariable.override).toEqual(false)
//   //   maskA.toggleOverrideForProperty(PropertyType.variables, newVariable.id)
//   //   expect(newVariable.override).toEqual(true)
//   // })
// })

// describe('Function createInheritedProperty() Unit Tests', () => {
//   it('inherited variable from a non-override ancestor cannot modify its isDefining & calcFormula', () => {
//     const varID = 'id_0'
//     const tempMask = new Mask()
//     tempMask.addProperty(PropertyType.variables, varID)
//     const inheritedVar = createInheritedProperty(PropertyType.variables, varID, tempMask) as Variable
//     expect(() => {
//       inheritedVar.isDefining = true
//     }).toThrow('Cannot assign to read only property \'isDefining\'')
//     expect(() => {
//       inheritedVar.calcFormula = 'another formula'
//     }).toThrow('Cannot assign to read only property \'calcFormula\'')
//   })

//   it('inherited variable from an allowing override ancestor can modify its isDefining & calcFormula', () => {
//     const varID = 'id_0'
//     const tempMask = new Mask()
//     tempMask.addProperty(PropertyType.variables, varID)
//     tempMask.variables[varID].override = true
//     const inheritedVar = createInheritedProperty(PropertyType.variables, varID, tempMask) as Variable
//     expect(() => {
//       inheritedVar.isDefining = true
//     }).not.toThrow('Cannot assign to read only property \'isDefining\'')
//     expect(inheritedVar.isDefining).toBe(true)
//     expect(() => {
//       inheritedVar.calcFormula = 'another formula'
//     }).not.toThrow('Cannot assign to read only property \'calcFormula\'')
//     expect(inheritedVar.calcFormula).toBe('another formula')
//   })
// })
