import FeiyanFormulaParserVisitor from './.antlr/FeiyanFormulaParserVisitor'
import type { ParserRuleContext } from 'antlr4'

export default class UnqualifiedIdVisitor extends FeiyanFormulaParserVisitor {
  #identifiers: string[]

  constructor() {
    super()
    this.#identifiers = []
  }

  addIdentifier(i: string) {
    this.#identifiers.push(i)
  }

  getParsedIdentifiers(): string[] {
    return this.#identifiers
  }

  visitLiteralOperatorId(ctx: ParserRuleContext) {
    // TODO: need to parse this
    const identifier = ctx.getText()
    this.#identifiers.push(identifier)
  }

  visitIdExpression(ctx: ParserRuleContext) {
    // @ts-ignore
    return this.visitChildren(ctx)
  }

  visitUnqualifiedId(ctx: ParserRuleContext) {
    const terminalNode = ctx.getChild(0)
    // if (terminalNode.children) console.log(terminalNode)
    // console.log(typeof terminalNode)
    if (!terminalNode.children) {
      // @ts-ignore
      const identifier = ctx.getChild(0).getText()
      this.#identifiers.push(identifier)
      return
    }
    // @ts-ignore
    return this.visitChildren(ctx)
    // this.configDependency(identifierName, this.#currentModelBlock)
  }
}
