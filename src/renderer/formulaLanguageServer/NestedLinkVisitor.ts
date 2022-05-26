import FeiyanFormulaParserVisitor from './.antlr/FeiyanFormulaParserVisitor'
import type { ParserRuleContext } from 'antlr4'
import antlr4 from 'antlr4'
import BlockSelectorVisitor from './BlockSelectorVisitor'
import LinkNameVisitor from './LinkNameVisitor'
import { LinkExpression } from './PropertyFingerPrint'

export default class NestLinkVisitor extends FeiyanFormulaParserVisitor {
  #nestedLinkExpressions: LinkExpression[]

  constructor() {
    super()
    this.#nestedLinkExpressions = []
  }

  getParsedNestedLinkExpressions() {
    return this.#nestedLinkExpressions.reverse()
  }

  visitUnaryExpression(ctx: ParserRuleContext) {
    // @ts-ignore
    return this.visitChildren(ctx)
  }

  visitPostfixExpression(ctx: ParserRuleContext) {
    if (ctx.getChildCount() === 4) {
      const terminalNode1 = ctx.getChild(1)
      // console.log(terminalNode1)
      // console.log(typeof terminalNode1)
      const terminalNode3 = ctx.getChild(3)
      // console.log(terminalNode3)
      // console.log(typeof terminalNode3)
      // if (terminalNode1.children) console.log(terminalNode1)
      // if (terminalNode3.children) console.log(terminalNode3)
      if ((!terminalNode1.children) && (!terminalNode3.children) && terminalNode1.getText() === '(' && terminalNode3.getText() === ')') {
        const blockSelectorVisitor = new BlockSelectorVisitor()
        blockSelectorVisitor.visitExpressionList(ctx.getChild(2))
        const blockSelectorIdentifiers = blockSelectorVisitor.getParsedIdentifiers()
        this.#nestedLinkExpressions.push({ linkName: '', blockSelectorIdentifiers })

        this.visitPostfixExpression(ctx.getChild(0))
      } else {
        // @ts-ignore
        return this.visitChildren(ctx)
      }
    } else if (ctx.getChildCount() === 3) {
      const terminalNode1 = ctx.getChild(1)
      // if (terminalNode1.children) console.log(terminalNode1)
      // console.log(typeof terminalNode1)
      if ((!terminalNode1.children) && terminalNode1.getText() === '->') {
        this.parseLinkName(ctx.getChild(2))
        this.visitPostfixExpression(ctx.getChild(0))
      } else {
        // @ts-ignore
        return this.visitChildren(ctx)
      }
    } else if (ctx.getChildCount() === 1) {
      this.parseLinkName(ctx)
    } else {
      // @ts-ignore
      return this.visitChildren(ctx)
    }
  }

  parseLinkName(ctx: ParserRuleContext) {
    const linkNameVisitor = new LinkNameVisitor()
    linkNameVisitor.visitPostfixExpression(ctx)
    if (linkNameVisitor.getParsedIdentifiers().length !== 1) {
      console.log('parseLinkName ctx:', ctx.getText(), ctx)
      console.log('linkNameVisitor.getParsedIdentifiers():', linkNameVisitor.getParsedIdentifiers())
      // throw new Error('Nested Link Parsing Error')
    }
    const linkName = linkNameVisitor.getParsedIdentifiers()[0]

    if (this.#nestedLinkExpressions.length <= 0) {
      this.#nestedLinkExpressions.push({ linkName, blockSelectorIdentifiers: [] })
    } else if (this.#nestedLinkExpressions[this.#nestedLinkExpressions.length - 1].linkName !== '') {
      this.#nestedLinkExpressions.push({ linkName, blockSelectorIdentifiers: [] })
    } else {
      this.#nestedLinkExpressions[this.#nestedLinkExpressions.length - 1].linkName = linkName
    }
  }
}
