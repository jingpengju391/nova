import {
  PropertyDependency, isInstanceOfWorkerMessage,
  ACTION_ADD_PROPERTY_FOR_PARSING, ACTION_UPDATE_SYMBOL_MAP,
  PropertyForFormulaParsing, PropertyForPropertyNameMap
} from './utils'
// import { InputStream, CommonTokenStream } from 'antlr4'
import antlr4 from 'antlr4'
import FeiyanFormulaLexer from './.antlr/FeiyanFormulaLexer'
import FeiyanFormulaParser from './.antlr/FeiyanFormulaParser'
import VariablesAndSeriesVisitor from './VariablesAndSeriesVisitor'
import PropertyFingerPrint from './PropertyFingerPrint'

// let blockNameIdMap!: Map<string, number>
let parentChildIdMap!: Map<number, number[]>
let propertyNameMap!: Map<number, Map<string, PropertyForPropertyNameMap>>

onmessage = function (event) {
  if (isInstanceOfWorkerMessage(event.data)) {
    switch (event.data.action) {
      case ACTION_ADD_PROPERTY_FOR_PARSING:
        setTimeout(() => addPropertyForParsing(event.data.payload), 0)
        break
      default:
    }
  }
}

function addPropertyForParsing(payload: {
  properties: PropertyForFormulaParsing[],
  // blockNameIdMap?: Map<string, number>,
  parentChildIdMap?: Map<number, number[]>,
  propertyNameMap?: Map<number, Map<string, PropertyForPropertyNameMap>>
}) {
  // blockNameIdMap = payload.blockNameIdMap ?? blockNameIdMap
  parentChildIdMap = payload.parentChildIdMap ?? parentChildIdMap
  propertyNameMap = payload.propertyNameMap ?? propertyNameMap

  const symbolMap = new Map<string, PropertyDependency>()
  payload.properties.forEach((property: PropertyForFormulaParsing) => {
    buildSymbolDependencyForProperty(property, symbolMap)
  })
  postMessage({ action: ACTION_UPDATE_SYMBOL_MAP, payload: symbolMap })
}

function buildSymbolDependencyForProperty(
  property: PropertyForFormulaParsing,
  symbolMap: Map<string, PropertyDependency>) {
  const inputStream = new antlr4.InputStream(property.calcFormula, true)
  const lexer = new FeiyanFormulaLexer(inputStream)
  const parser = new FeiyanFormulaParser(new antlr4.CommonTokenStream(lexer))
  const tree = parser.formulaDefinition()
  const currentPropertyFP = new PropertyFingerPrint(property.id, property.name, property.type, property.modelBlockId)
  const visitor = new VariablesAndSeriesVisitor(
    property.modelBlockId, property.modelBlockName, currentPropertyFP, symbolMap, parentChildIdMap, propertyNameMap
  )
  visitor.visitFormulaDefinition(tree)
}
