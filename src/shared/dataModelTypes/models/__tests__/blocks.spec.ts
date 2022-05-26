// import Block from '../blocks'
// import Mask from '../masks'
// import { PropertyType } from '../helpers'

// describe('Block Unit Tests', () => {
//   it('Block should have their own properties', () => {
//     const tempMask = new Mask()
//     tempMask.id = 10
//     tempMask.description = 'hello'
//     const tempBlock = new Block(tempMask)
//     expect(tempBlock.name).toBe('New Block')
//     expect(tempBlock.description).toBe('')
//     expect(tempBlock.id).toBe(0)
//   })
//   it('Block should be able to inherit variables from the ancestor', () => {
//     const tempMask = new Mask()
//     tempMask.addProperty(PropertyType.variables, 'va')
//     const tempBlock = new Block(tempMask)
//     expect(tempBlock.variables.va.id).toBe('va')
//     expect(tempBlock.variables.va.isDirect).toBe(false)
//     tempMask.addProperty(PropertyType.variables, 'vb')
//     expect(tempBlock.variables.vb.id).toBe('vb')
//     expect(tempBlock.variables.vb.isDirect).toBe(false)
//   })
//   it('Block\'s child should be able to inherit variables from block and block\'s ancestor', () => {
//     const tempMask = new Mask()
//     tempMask.addProperty(PropertyType.variables, 'va')
//     const tempBlock = new Block(tempMask)
//     const tempChildBlock = new Block(tempBlock)
//     expect(tempChildBlock.variables.va.id).toBe('va')
//     expect(tempChildBlock.variables.va.isDirect).toBe(false)
//     tempMask.addProperty(PropertyType.variables, 'vb')
//     expect(tempChildBlock.variables.vb.id).toBe('vb')
//     expect(tempChildBlock.variables.vb.isDirect).toBe(false)
//     tempBlock.addProperty(PropertyType.variables, 'vc')
//     expect(tempChildBlock.variables.vc.id).toBe('vc')
//     expect(tempChildBlock.variables.vc.isDirect).toBe(false)
//   })
//   it('Delete a variable should also delete the inherited one from descendent', () => {
//     const tempMask = new Mask()
//     tempMask.addProperty(PropertyType.variables, 'va')
//     const tempBlock = new Block(tempMask)
//     const tempChildBlock = new Block(tempBlock)
//     expect(tempChildBlock.variables.va.id).toBe('va')
//     tempBlock.addProperty(PropertyType.variables, 'vc')
//     expect(tempChildBlock.variables.vc.id).toBe('vc')
//     tempMask.deleteProperty(PropertyType.variables, 'va')
//     expect(tempBlock.variables.va).toBe(undefined)
//     expect(tempChildBlock.variables.va).toBe(undefined)
//     tempBlock.deleteProperty(PropertyType.variables, 'vc')
//     expect(tempChildBlock.variables.vc).toBe(undefined)
//   })
// })
