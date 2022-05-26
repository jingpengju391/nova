import type { PropertyDependency, PropertyForPropertyNameMap } from './utils'
import FeiyanFormulaParserVisitor from './.antlr/FeiyanFormulaParserVisitor'
import PropertyFingerPrint, { generatePropertyFingerPrintString, LinkExpression, getLinkExpressionsString } from './PropertyFingerPrint'
import type { ParserRuleContext } from 'antlr4'
import UnqualifiedIdVisitor from './UnqualifiedIdVisitor'
import NestedLinkVisitor from './NestedLinkVisitor'
import LambdaIntroducerVisitor from './LambdaIntroducerVisitor'

export default class VariablesAndSeriesVisitor extends FeiyanFormulaParserVisitor {
  #currentModelBlockId: number
  #currentModelBlockName: string
  #currentPropertyFP: PropertyFingerPrint
  #symbolMap: Map<string, PropertyDependency>
  // #blockNameIdMap: Map<string, number>
  // remove blockNameIdMap
  #parentChildIdMap: Map<number, number[]>
  #propertyNameMap: Map<number, Map<string, PropertyForPropertyNameMap>>
  #excludedIdentifiers: string[]
  #currentPropertyFPString: string
  #currentPropertyReferringProperties: Set<String>

  constructor(currentModelBlockId: number, currentModelBlockName: string, currentPropertyFP: PropertyFingerPrint, symbolMap: Map<string, PropertyDependency>, parentChildIdMap: Map<number, number[]>, propertyNameMap: Map<number, Map<string, PropertyForPropertyNameMap>>) {
    super()
    this.#currentModelBlockId = currentModelBlockId
    this.#currentModelBlockName = currentModelBlockName
    this.#currentPropertyFP = currentPropertyFP
    this.#symbolMap = symbolMap
    // this.#blockNameIdMap = blockNameIdMap
    // remove blockNameIdMap
    this.#parentChildIdMap = parentChildIdMap
    this.#propertyNameMap = propertyNameMap
    this.#excludedIdentifiers = []
    this.#currentPropertyFPString = generatePropertyFingerPrintString(this.#currentPropertyFP)
    const referringProperties = new Set<string>()
    this.#symbolMap.set(this.#currentPropertyFPString, {
      referredProperties: new Set<string>(),
      referringProperties
    })
    this.#currentPropertyReferringProperties = referringProperties
  }

  visitUnqualifiedId(ctx: ParserRuleContext) {
    const identifier = ctx.getText()
    if (this.#excludedIdentifiers.includes(identifier)) return
    this.configDependency(identifier, this.#currentModelBlockName, this.#currentModelBlockId)
  }

  visitPostfixExpression(ctx: ParserRuleContext) {
    if (ctx.getChildCount() === 3) {
      const terminalNode = ctx.getChild(1)
      if (terminalNode) {
        // if (terminalNode.children) console.log(terminalNode)
        // console.log(typeof terminalNode)
        // @ts-ignore
        if ((!terminalNode.children) && terminalNode.getText() === '->') {
          const linkedIdentifies = this.parseIdentifierFromIdExpression(ctx.getChild(2))
          const linkExpressions = this.parseNestedLinksFromPostfixExpression(ctx.getChild(0))
          linkExpressions.forEach(exp => {
            exp.blockSelectorIdentifiers.forEach(identifier => {
              this.configDependency(identifier, this.#currentModelBlockName, this.#currentModelBlockId)
            })
          })
          const linkedMask = this.getLinkedMaskFromLinkExpressions(linkExpressions)
          linkedIdentifies.forEach(identifier => {
            this.configDependency(identifier, linkedMask.name, linkedMask.id, getLinkExpressionsString(linkExpressions))
          })
          return
        }
      }
    }
    // @ts-ignore
    return this.visitChildren(ctx)
  }

  visitLambdaDeclarator(ctx: ParserRuleContext) {
    const unqualifiedIdVisitor = new UnqualifiedIdVisitor()
    unqualifiedIdVisitor.visitIdExpression(ctx)
    this.#excludedIdentifiers.push(...unqualifiedIdVisitor.getParsedIdentifiers())
  }

  visitLambdaIntroducer(ctx: ParserRuleContext) {
    const lambdaIntroducerVisitor = new LambdaIntroducerVisitor()
    lambdaIntroducerVisitor.visitLambdaIntroducer(ctx)
    lambdaIntroducerVisitor.getParsedIdentifiers().forEach(identifier => {
      this.configDependency(identifier, this.#currentModelBlockName, this.#currentModelBlockId)
    })
  }

  parseIdentifierFromIdExpression(ctx: ParserRuleContext): string[] {
    const unqualifiedIdVisitor = new UnqualifiedIdVisitor()
    unqualifiedIdVisitor.visitIdExpression(ctx)
    return unqualifiedIdVisitor.getParsedIdentifiers()
  }

  parseNestedLinksFromPostfixExpression(ctx: ParserRuleContext): LinkExpression[] {
    const nestedLinkVisitor = new NestedLinkVisitor()
    nestedLinkVisitor.visitPostfixExpression(ctx)
    return nestedLinkVisitor.getParsedNestedLinkExpressions()
  }

  configDependency(propertyName: string, fromBlockName: string, fromBlockId: number, linkExpressionString?: string) {
    const property = this.#propertyNameMap.get(fromBlockId as number)?.get(propertyName)
    if (!property) return // to do need tell user sytax error
    const newPropertyFPString = generatePropertyFingerPrintString(new PropertyFingerPrint(
      property.id, propertyName, property.type, fromBlockId, linkExpressionString
    ))

    this.#currentPropertyReferringProperties.add(newPropertyFPString)

    const configReferredProperty = (blockId: number) => {
      // all keys in the symbol map contain no link expression
      const newPropertyFPStringWithoutLinkInfo = generatePropertyFingerPrintString(new PropertyFingerPrint(
        property.id, propertyName, property.type, blockId
      ))
      let currentDep: PropertyDependency | undefined = this.#symbolMap.get(newPropertyFPStringWithoutLinkInfo)
      if (!this.#symbolMap.get(newPropertyFPStringWithoutLinkInfo)) {
        currentDep = {
          referredProperties: new Set<string>(),
          referringProperties: new Set<string>()
        }
        this.#symbolMap.set(newPropertyFPStringWithoutLinkInfo, currentDep)
      }
      currentDep?.referredProperties.add(this.#currentPropertyFPString)
    }

    configReferredProperty(fromBlockId)
    // todo should update when we reach to product
    if (linkExpressionString) {
      const blockIds = this.#parentChildIdMap.get(fromBlockId)
      blockIds?.forEach(blockId => {
        configReferredProperty(blockId)
        const childBlockIds = this.#parentChildIdMap.get(blockId)
        childBlockIds?.forEach(childBlockId => configReferredProperty(childBlockId))
      })
    }
  }

  getLinkedMaskFromLinkExpressions(linkExpressions: LinkExpression[]): { name: string, id: number } {
    let currentModelBlockName = this.#currentModelBlockName
    let blockId: number | undefined = this.#currentModelBlockId
    linkExpressions.forEach(exp => {
      if (exp.linkName === 'this' || exp.linkName === '_getCopy' || exp.linkName === '_parent') {
        blockId = this.#currentModelBlockId
        return
      }
      // TODO: parse method parameters
      // TODO: E.g. get_fund_adj of CROSSRESULTMASK
      if (exp.linkName === 'cf1' || exp.linkName === 'cf2') {
        currentModelBlockName = 'CASHFLOWMASK'
        blockId = undefined
        return
      }
      // TODO: parse EVRESULTMASK -> series -> cross_ev_tax_exempt_rate
      if (exp.linkName === 'tax_table._getTarget()') {
        currentModelBlockName = 'TAXTABLE'
        blockId = undefined
        return
      }
      const currentLink = this.#propertyNameMap.get(blockId as number)?.get(exp.linkName)
      if (!currentLink) {
        // console.log('currentModelBlockName:', currentModelBlockName)
        // console.log('linkExpressions:', linkExpressions)
        // console.log('current exp:', exp)
        // throw new Error('Link Not Found When Parsing Link Expression')
        blockId = undefined
        return
      }
      const nextModelBlockName = currentLink?.target?.maskName
      if (!nextModelBlockName) {
        blockId = undefined
        // console.log('Link Has No Valid Target When Parsing Link Expression', exp)
        // throw new Error('Link Has No Valid Target When Parsing Link Expression')
        return
      }
      currentModelBlockName = nextModelBlockName
      blockId = currentLink.target?.id
    })
    const id = blockId ?? 0
    return { name: currentModelBlockName, id }
  }
}
