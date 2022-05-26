//
//  ExpressParser.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2020/12/06.
//  Copyright © 2020年 陈曦. All rights reserved.
//

#ifndef ExpressParser_hpp
#define ExpressParser_hpp

//_CODE_START

#include <string>
#include <cmath>
#include "ValueUnion.20200713.hpp"
#include "SuperMap.20200728.hpp"
#include "QuickList.20200803.hpp"

class ExpressParser;

class ExpressFunctionMap {

    friend class ExpressParser;
    
public: 

    class ExpressFunction {

        friend class ExpressFunctionMap;
        friend class ExpressParser;
        friend class ExpressNode;

    protected:

        ExpressFunction(unsigned char);

        const ValueUnion *_tokenId = nullptr;
        unsigned char _order = 0;
        unsigned char _closing = 0;
        bool _allowSingleInput = false;
        bool _isUserDefinedFunction = false;
        int _userDefinedInputCount = 0;
    
        bool inputIsValue(HypList *, const int &);
        const SuperString &getInputString(HypList *, const int &);
        double getInputValue(HypList *, const int &);

        virtual void calculate(ValueUnion *, HypList *) = 0;
    };

    class PlusFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        PlusFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class MinusFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        MinusFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class MultiplyFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        MultiplyFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class DivideFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        DivideFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class PowerFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        PowerFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class ModFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        ModFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class BracketFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        BracketFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class LargerFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        LargerFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class LargerOrEqualFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        LargerOrEqualFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class SmallerFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        SmallerFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class SmallerOrEqualFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        SmallerOrEqualFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class EqualFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        EqualFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class NotEqualFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        NotEqualFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class NotFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        NotFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class AndFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        AndFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class OrFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;

    protected:

        OrFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class ReadFunction: public ExpressFunctionMap::ExpressFunction {

        friend class ExpressFunctionMap;
        friend class ExpressParser;

    protected:

        ReadFunction();
        virtual void calculate(ValueUnion *, HypList *) override;

    private:

        ValueUnion *_target = nullptr;
    };

    class UserDefinedFunction: public ExpressFunctionMap::ExpressFunction {

    protected:
        UserDefinedFunction(const int &);
    };

    class PreDefinedFunctionNames {

        friend class ExpressFunctionMap;

    public:

        const SuperString _left;
        const SuperString _right;
        const SuperString _find;
        const SuperString _mid;
        const SuperString _replace;
        const SuperString _if;

    private:

        PreDefinedFunctionNames();
    };

    class LeftFunction: public ExpressFunctionMap::UserDefinedFunction {

        friend class ExpressFunctionMap;
        friend class ExpressParser;

    protected:

        LeftFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class RightFunction: public ExpressFunctionMap::UserDefinedFunction {

        friend class ExpressFunctionMap;
        friend class ExpressParser;

    protected:

        RightFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class FindFunction: public ExpressFunctionMap::UserDefinedFunction {

        friend class ExpressFunctionMap;
        friend class ExpressParser;

    protected:

        FindFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class ReplaceFunction: public ExpressFunctionMap::UserDefinedFunction {

        friend class ExpressFunctionMap;
        friend class ExpressParser;

    protected:

        ReplaceFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class MidFunction: public ExpressFunctionMap::UserDefinedFunction {

        friend class ExpressFunctionMap;
        friend class ExpressParser;

    protected:

        MidFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

    class IfFunction: public ExpressFunctionMap::UserDefinedFunction {

        friend class ExpressFunctionMap;
        friend class ExpressParser;

    protected:

        IfFunction();
        virtual void calculate(ValueUnion *, HypList *) override;
    };

protected:

    ExpressFunctionMap();

    void addFunction(int, ExpressFunction *);
    void addFunction(const SuperString &, ExpressFunction *);

    inline void addParameter(const SuperString &paramName, const double &value)
    {this->_parameters._getItem(paramName, true)->_setValue(value);}

    inline void addParameter(const SuperString &paramName, const SuperString &str)
    {this->_parameters._getItem(paramName, true)->_setString(str);}

private:
    
    HypMap _functions;
    HypMap _parameters;

    PlusFunction _plusFunction;
    BracketFunction _bracketFunction;
    MultiplyFunction _multiplyFunction;
    DivideFunction _divideFunction;
    PowerFunction _powerFunction;
    ModFunction _modFunction;
    LargerFunction _largerFunction;
    LargerOrEqualFunction _largerOrEqualFunction;
    SmallerFunction _smallerFunction;
    SmallerOrEqualFunction _smallerOrEqualFunction;
    EqualFunction _equalFunction;
    NotEqualFunction _notEqualFunction;
    NotFunction _notFunction;
    AndFunction _andFunction;
    OrFunction _orFunction;
    ReadFunction _readFunction;
    LeftFunction _leftFunction;
    RightFunction _rightFunction;
    MidFunction _midFunction;
    FindFunction _findFunction;
    ReplaceFunction _replaceFunction;
    IfFunction _ifFunction;
    
    ExpressFunction *getFunction(const int &);
    ExpressFunction *getFunction(const SuperString &);
    ValueUnion *getParameter(const SuperString &);

    PreDefinedFunctionNames _systemFunctions;
};

class ExpressNode {

    friend class ExpressFunctionMap::ExpressFunction;
    friend class ExpressParser;

private:

    ExpressNode();
    
    ExpressNode *_parent = nullptr;
    ExpressFunctionMap::ExpressFunction *_operator;
    HypList _inputs;
    ValueUnion _resultUnion;

    bool _calculated = false;

    void calculate();
    void clear();
};

class ExpressParser {

    friend class ExpressFunctionMap;
    friend class DataRoll;
    friend class Beam;
    friend class TXTDataRoll;
    friend class Block;

private:

    enum TokenType {
        PLUS                    = '+',
        MINUS                   = '-',
        MULTIPLY                = '*',
        DIVIDE                  = '/',
        POWER                   = '^',
        MOD                     = '%',
        LEFT_BRACKET            = '(',
        RIGHT_BRACKET           = ')',
        LEFT_BOX                = '[',
        RIGHT_BOX               = ']',
        SEPERATOR               = ',',
        EQUAL                   = '=',
        LARGER                  = '>',
        LARGER_OR_EQUAL         = 'L',
        SMALLER                 = '<',
        SMALLER_OR_EQUAL        = 'S',
        NOT                     = '!',
        NOT_EQUAL               = 'N',
        AND                     = '&',
        OR                      = '|',
        UNSPECIFIED             = 300,
        TRUE_TOKEN              = 301,
        FALSE_TOKEN             = 302,
        IDENTIFIER              = 303,
        NUMBER                  = 304,
        STRING                  = 305,
        READER                  = 306,
        COMPLETE                = 307,
    };

    enum OperationOrder {
        LOGIC                   = 10,
        COMPARE                 = 20,
        PLUS_MINUS              = 30,
        MULTIPLY_DIVIDE         = 40,
        MOD_POWER               = 50,
        TOP                     = 200,
    };

    ExpressParser(ExpressFunctionMap *);
    ExpressParser(ExpressFunctionMap *, const SuperString &);

    ExpressNode *_rootNode = nullptr;
    ExpressFunctionMap *_functionsAndInputs = nullptr;
    bool _expressParsed = false;

    void parseExpress(const SuperString &);

    double getValue();
    const SuperString &getString();
    void clear();
};

//_CODE_END_

#endif /* ExpressParser_hpp */
