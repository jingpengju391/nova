import UnqualifiedIdVisitor from './UnqualifiedIdVisitor'
import type { ParserRuleContext } from 'antlr4'
import antlr4 from 'antlr4'

export default class LinkNameVisitor extends UnqualifiedIdVisitor {
  visitPrimaryExpression(ctx: ParserRuleContext) {
    if (ctx.getChildCount() === 1) {
      const terminalNode = ctx.getChild(0)
      // if (terminalNode.children) console.log(terminalNode)
      // console.log(typeof terminalNode)
      if ((!terminalNode.children) && terminalNode.getText() === 'this') {
        this.addIdentifier('this')
        return
      } else {
        // @ts-ignore
        return this.visitChildren(ctx)
      }
    }
    // } else if (ctx.getChildCount() === 3) {
    //   // TODO: parsing EVRESULTMASK -> series -> cross_ev_tax_exempt_rate
    //   // TODO: return ((TIMETABLEMASK::TAXTABLE*)tax_table._getTarget())->tax_exempt_rate[t];
    //   const terminalNode0 = ctx.getChild(0)
    //   const terminalNode2 = ctx.getChild(2)
    //   // console.log(terminalNode0)
    //   // console.log(typeof terminalNode0)
    //   // console.log(terminalNode2)
    //   // console.log(typeof terminalNode2)
    //   if ((!terminalNode0.children) && (!terminalNode2.children) && terminalNode0.getText() === '(' && terminalNode2.getText() === ')') {
    //     console.log(ctx.getChild(1).getText())
    //     this.addIdentifier('tax_table._getTarget()')
    //     return
    //   } else {
    //     // @ts-ignore
    //     return this.visitChildren(ctx)
    //   }
    // }
    // @ts-ignore
    return this.visitChildren(ctx)
  }
}
