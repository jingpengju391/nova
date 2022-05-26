import UnqualifiedIdVisitor from './UnqualifiedIdVisitor'
import type { ParserRuleContext } from 'antlr4'

export default class BlockSelectorVisitor extends UnqualifiedIdVisitor {
  visitExpressionList(ctx: ParserRuleContext) {
    // @ts-ignore
    return this.visitChildren(ctx)
  }
}
