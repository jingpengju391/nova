import UnqualifiedIdVisitor from './UnqualifiedIdVisitor'
import type { ParserRuleContext } from 'antlr4'

export default class LambdaIntroducerVisitor extends UnqualifiedIdVisitor {
  visitLambdaIntroducer(ctx: ParserRuleContext) {
    // @ts-ignore
    this.visitChildren(ctx)
  }
}
