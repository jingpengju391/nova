//
//  Variable.20200709.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2020/07/09.
//  Copyright © 2020年 陈曦. All rights reserved.
//

#ifndef Variable_20200709_hpp
#define Variable_20200709_hpp

#include <stdio.h>

#include "SuperString.hpp"
#include "ValueUnion.20200713.hpp"
#include "GeneralMemoryManager.hpp"
#include "Switcher.20200803.hpp"
#include "ErrorHandler.hpp"
#include "QuickList.20200803.hpp"
#include "Tank.20200710.hpp"
#include "RecordThread.hpp"

class Tank;
class TankIterator;
class DataRollRecord;
class TableBase;
class IterationUnit;
class OutputPoint;
class VariableBase {
    
    friend class IntegerVariableBase;
    friend class FloatVariableBase;
    friend class StringVariableBase;
    friend class Block;
    friend class BlockCluster;
    friend class TableBase;
    friend class IllegalConvertError;
    friend class GeneralException;
    friend class SeriesBase;
    friend class RecordThread;
    friend class Period;
    friend class OutputPoint;
    
public:

    enum Source{
        UNSPECIFIED                     = 0,
        DEFAULT                         = 1,
        ASSUMPTION                      = 2,
        DATA_RAW                        = 3,
        DATA_CONVERTED                  = 4,
        CALCULATED                      = 5,
        CHILD                           = 6,
        TO_DEFINE                       = 7,
    };
    
    enum ValueType {
        STRING                          = 0,
        INTEGER                         = 1,
        FLOAT                           = 2,
        TABLE_NAME                      = 3,
    };
    enum RebaseType {
        NO_REBASE                       = 0,
        REBASE                          = 1,
    };
    const Block *const _owner;                      //BC 20201209
    const VariableBase *const _ownerVariable;       //BC 20201209
    const VariableBase *const _baseVariable;        //BC 20201209
    const SuperString &_variableName;
    const long _copyId;
    const long _level;
    const SystemConstant::ItemType _itemType;              //BC 20201206
    const ValueType _valueType;

    inline bool _hasValue() const {
        
        if(this->_valueSource == VariableBase::Source::TO_DEFINE) {
            throw new ItemNotDefinedError(this);
        }
        
        return this->_hasV;
    }

    inline const SuperString &_linkage() const
    {return this->_linkageStr;}

    virtual inline void _setNumber(const double &) const
    {throw new VariableTypeError(this);}

    virtual inline void _setString(const SuperString &) const
    {throw new VariableTypeError(this);}

    /*virtual inline void _setString(StringNode *const &) const
    {throw new VariableTypeError(this);}*/
    
    virtual inline void _setString(const std::string &) const
    {throw new VariableTypeError(this);}
    
    virtual inline double _getNumber() const
    {throw new VariableTypeError(this);}

    virtual inline const std::string &_getString() const
    {throw new VariableTypeError(this);}

    virtual inline const SuperString &_getSuperString() const
    {throw new VariableTypeError(this);}

    virtual void _setValue(const VariableBase &) const = 0;

    void _removeValue() const;
    /*inline int _removeValue()
    {return this->_removeChildValue() + (this->_hasV && !this->_isSeparator ? (this->_valueSource == VariableBase::Source::CALCULATED || this->_valueSource == VariableBase::Source::DATA_RAW || this->_valueSource == VariableBase::Source::DATA_CONVERTED ? (1 - (this->_hasV = false)) : (this->_valueSource == VariableBase::Source::CHILD && (this->_baseVariable->_valueSource == VariableBase::Source::CALCULATED ||
    this->_baseVariable->_valueSource == VariableBase::Source::DATA_RAW ||
    this->_baseVariable->_valueSource == VariableBase::Source::DATA_CONVERTED) ? (1 - (this->_hasV = false)) : 0)) : this->_throwUndefinedMe()) + (this->_hasCopySize = false);}//senna update*/

    inline long _size() const {
        
        if(this->_valueSource == VariableBase::Source::TO_DEFINE) {
            throw new ItemNotDefinedError(this);
        }
        
        return this->_copySize();
    }
    
    inline long _usedSize() const           //BC 20201113
    {return this->_maxCopy;}
    
    virtual const VariableBase &operator () (const long &) const = 0;
    const VariableBase &operator () (const VariableBase &) const;
    virtual const VariableBase &operator [] (const long &) const = 0;
    
    void _convertToDefault(const SuperString &linkage);
    void _convertToDefault(const SuperString &linkage, const long &defaultCopySize);
    void _convertToAssumption(const SuperString &linkage);
    void _convertToAssumption(const SuperString &linkage, const long &defaultCopySize);
    void _convertToDataRaw(const SuperString &linkage);
    void _convertToDataRaw(const SuperString &linkage, const long &defaultCopySize);
    void _extendCopySize(const long &size) const;

    template <typename B>
    inline void _convertToDataRaw(const SuperString &linkage, long (B::*copySizeFunc)(const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_RAW;
            this->_linkageStr = linkage;
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;          //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    template <typename B>
    inline void _convertToAssumption(const SuperString &linkage, long (B::*copySizeFunc)(const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::ASSUMPTION;
            this->_linkageStr = linkage;
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;          //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDefault(const SuperString &linkage, long (B::*copySizeFunc)(const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::DEFAULT;
            this->_linkageStr = linkage;
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;          //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }    
    
protected:
    
    VariableBase(const Block *const &, const SuperString &, const ValueType &, const Source &, const SystemConstant::ItemType &, const long &, const long &, const VariableBase *const &, const VariableBase *const &);              //BC 20201206

    Source _valueSource = Source::UNSPECIFIED;
    mutable bool _hasV = false;
    //mutable bool _hasStrNode =  false;
    SuperString _linkageStr;
    mutable const TankIterator *_tankForChild = nullptr;
    
    bool _allowManualResize = false;        //BC 20201113
    /*int*/long _defaultCopySize = 0;               //BC 20201113
    mutable long _maxCopy = 0;
    ConstFormulaHolder</*int*/long, const VariableBase &> _copySizeFunc;        //BC 20201113
    bool _hasCopySizeFunc = false;
    bool _useCopySizeFunc = false;
    HypList copyChildren = HypList(nullptr, nullptr, nullptr);
    //mutable unsigned char *_copyChildren = nullptr;
    mutable long _copyLength = 0;
    
    mutable int _loopControl = 0;
    mutable int _copyLoopControl = 0;
    bool _isSeparator = false;
    bool _isSignature = false;
    GeneralMemoryChunk *_chunk = nullptr;
    
    virtual void _setValue(const ValueUnion *const &) const = 0;
    virtual void _resize(const /*int*/long &) const = 0;            //BC 20201113
    
    virtual VariableBase *_getCopy(const long &) const = 0;
    void _returnMemory(bool);
    
private:
    
    mutable long _copySizeValue = 0;
    mutable bool _hasCopySize = false;
    mutable IterationUnit* _iterationValue = nullptr;
    
    long _getCopySize(const VariableBase &variable) const;
    
    /*int*/long _copySize() const;                  //BC 20201113
    void _removeChildValue() const;
    void _throwUndefinedMe() const;
    mutable bool _iterationStart = false;
    void _setRebaseTime() const;
    mutable RebaseType _rebaseType = RebaseType::NO_REBASE;
    mutable OutputPoint* _bindPoint = nullptr;
    void _accOutput();
};

class IntegerVariableBase: public VariableBase {
    
public:

    template <typename B>
    IntegerVariableBase(const B *const &, const SuperString &, long (B::*)(const VariableBase &) const);
    template <typename B>
    IntegerVariableBase(const B *const &, const SuperString &, const /*int*/long &, long (B::*)(const VariableBase &) const);
    template <typename B>
    IntegerVariableBase(const B *const &, const SuperString &, /*int*/long (B::*)(const VariableBase &) const, long (B::*)(const VariableBase &) const);        //BC 20201113
    template <typename B>
    IntegerVariableBase(const B *const &, const SuperString &, const SuperString &, const VariableBase::Source &);
    template <typename B>
    IntegerVariableBase(const B *const &, const SuperString &, const long &, const SuperString &, const VariableBase::Source &);
    template <typename B>
    IntegerVariableBase(const B *const &, const SuperString &, long (B::*)(const VariableBase &) const, const SuperString &, const VariableBase::Source &);
    template <typename B>
    IntegerVariableBase(const B *const &, const SuperString &, long (B::*)(const DataRollRecord &, const VariableBase &) const);
    template <typename B>
    IntegerVariableBase(const B *const &, const SuperString &, const long &, long (B::*)(const DataRollRecord &, const VariableBase &) const);
    template <typename B>
    IntegerVariableBase(const B *const &, const SuperString &, long (B::*)(const VariableBase &) const, long (B::*)(const DataRollRecord &, const VariableBase &) const);
    template <typename B>
    IntegerVariableBase(const B *const &, const SuperString &);
    
    inline operator long () const
    {return this->_hasV ? this->_value : this->_getCalculatedResult();}
    
    inline long _setValue(const long &value) const {
        
        if(this->_valueSource == VariableBase::Source::TO_DEFINE) {
            throw new ItemNotDefinedError(this);
        }
        
        this->_hasV = true;
        return this->_value = value;
    }
    
    virtual inline double _getNumber() const override
    {return this->operator long();}

    virtual inline void _setNumber(const double &value) const override
    {this->_setValue(value);}

    virtual inline void _setValue(const VariableBase &variable) const override
    {this->_setValue(variable._getNumber());}

    virtual inline const IntegerVariableBase &operator () (const long &copy) const override {
        
        this->_throwUndefinedMe();
        return *(this->_getCopy(copy));
    }

    virtual inline IntegerVariableBase &operator [] (const long &copy) const override {
        
        this->_throwUndefinedMe();
        return *static_cast<IntegerVariableBase *>(this->_getCopy(copy));
    }
    
    template <typename B>
    inline void _convertToCalculated(long (B::*valueFunc)(const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::CALCULATED;
            this->_valueFunc.getFormula(this->_owner, valueFunc);
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToCalculated(long (B::*valueFunc)(const VariableBase &) const, const long &defaultCopySize) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::CALCULATED;
            this->_valueFunc.getFormula(this->_owner, valueFunc);
            this->_defaultCopySize = defaultCopySize;
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToCalculated(long (B::*valueFunc)(const VariableBase &) const, long (B::*copySizeFunc)(const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::CALCULATED;
            this->_valueFunc.getFormula(this->_owner, valueFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;          //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDataConverted(long (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_CONVERTED;
            this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDataConverted(long (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &), const long &defaultCopySize) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_CONVERTED;
            this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
            this->_defaultCopySize = defaultCopySize;
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDataConverted(long (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &), long (B::*copySizeFunc)(const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_CONVERTED;
            this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;          //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    inline void _convertToValue(const long &value) {
        
        this->_convertToDefault(_FIXED_VALUE);
        this->_setValue(value);
    }

    long _getSumFromOwnCopy() const;
    
protected:

    IntegerVariableBase(const IntegerVariableBase *const &, const long &, GeneralMemoryChunk *&);
    
    virtual inline void _setValue(const ValueUnion *const &value) const override {
        
        if(value->_type == ValueUnion::Type::NUMBER) {
            this->_setValue(value->_valueHolder._number);
        }
        
        throw new VariableTypeError(this);
    }
    
    virtual IntegerVariableBase *_getCopy(const long &) const override;
    
    long _getResult(const IntegerVariableBase &) const;
    virtual void _resize(const long &) const override;
    
private:
    
    mutable long _value = 0;

    ConstFormulaHolder<long, const VariableBase &> _valueFunc;
    ConstFormulaHolder<long, const DataRollRecord &, const VariableBase &> _dataConvFunc;
    
    long _getCalculatedResult() const;
};

class FloatVariableBase: public VariableBase {
    
public:

    template <typename B>
    FloatVariableBase(const B *const &, const SuperString &, double (B::*)(const VariableBase &) const);
    template <typename B>
    FloatVariableBase(const B *const &, const SuperString &, const long &, double (B::*)(const VariableBase &) const);
    template <typename B>
    FloatVariableBase(const B *const &, const SuperString &, long (B::*)(const VariableBase &) const, double (B::*)(const VariableBase &) const);
    template <typename B>
    FloatVariableBase(const B *const &, const SuperString &, const SuperString &, const VariableBase::Source &);
    template <typename B>
    FloatVariableBase(const B *const &, const SuperString &, const long &, const SuperString &, const VariableBase::Source &);
    template <typename B>
    FloatVariableBase(const B *const &, const SuperString &, long (B::*)(const VariableBase &) const, const SuperString &, const VariableBase::Source &);
    template <typename B>
    FloatVariableBase(const B *const &, const SuperString &, double (B::*)(const DataRollRecord &, const VariableBase &) const);
    template <typename B>
    FloatVariableBase(const B *const &, const SuperString &, const long &, double (B::*)(const DataRollRecord &, const VariableBase &) const);
    template <typename B>
    FloatVariableBase(const B *const &, const SuperString &, long (B::*)(const VariableBase &) const, double (B::*)(const DataRollRecord &, const VariableBase &) const);
    template <typename B>
    FloatVariableBase(const B *const &, const SuperString &);
    
    inline operator double () const
    {return this->_hasV ? this->_value : this->_getCalculatedResult();}
    
    inline /*long*/double _setValue(const double &value) const {            //BC 20201117
        
        if(this->_valueSource == VariableBase::Source::TO_DEFINE) {
            throw new ItemNotDefinedError(this);
        }
        
        this->_hasV = true;
        return this->_value = value;
    }

    virtual inline double _getNumber() const override
    {return this->operator double();}

    virtual inline void _setNumber(const double &value) const override
    {this->_setValue(value);}

    virtual inline void _setValue(const VariableBase &variable) const override
    {this->_setValue(variable._getNumber());}
    
    virtual inline const FloatVariableBase &operator () (const long &copy) const override {
        
        this->_throwUndefinedMe();
        return *this->_getCopy(copy);
    }

    virtual inline FloatVariableBase &operator [] (const long &copy) const override {
        
        this->_throwUndefinedMe();
        return *this->_getCopy(copy);
    }
    
    template <typename B>
    inline void _convertToCalculated(double (B::*valueFunc)(const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::CALCULATED;
            this->_valueFunc.getFormula(this->_owner, valueFunc);
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToCalculated(double (B::*valueFunc)(const VariableBase &) const, const long &defaultCopySize) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::CALCULATED;
            this->_valueFunc.getFormula(this->_owner, valueFunc);
            this->_defaultCopySize = defaultCopySize;
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToCalculated(double (B::*valueFunc)(const VariableBase &) const, long (B::*copySizeFunc)(const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::CALCULATED;
            this->_valueFunc.getFormula(this->_owner, valueFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;          //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDataConverted(double (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &)) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_CONVERTED;
            this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDataConverted(double (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &), const long &defaultCopySize) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_CONVERTED;
            this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
            this->_defaultCopySize = defaultCopySize;
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDataConverted(double (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &), long (B::*copySizeFunc)(const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_CONVERTED;
            this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;          //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    inline void _convertToValue(const double &value) {
        
        this->_convertToDefault(_FIXED_VALUE);
        this->_setValue(value);
    }

    double _getSumFromOwnCopy() const;
    
protected:

    FloatVariableBase(const FloatVariableBase *const &, const long &, GeneralMemoryChunk *&);

    virtual inline void _setValue(const ValueUnion *const &value) const override {
        
        if(value->_type == ValueUnion::Type::NUMBER) {
            this->_setValue(value->_valueHolder._number);
        }
        
        throw new VariableTypeError(this);
    }

    virtual FloatVariableBase *_getCopy(const long &) const override;
    
    double _getResult(const FloatVariableBase &) const;
    virtual void _resize(const long &) const override;
    
private:
    
    mutable double _value = 0;
    
    ConstFormulaHolder<double, const VariableBase &> _valueFunc;
    ConstFormulaHolder<double, const DataRollRecord &, const VariableBase &> _dataConvFunc;

    //mutable bool _iterationStart = false;
   
    double _getCalculatedResult() const;
};

class StringVariableBase: public VariableBase {
    
    friend class TableBase;
    friend class VariableBase;
    friend class Block;
public:

    template <typename B>
    StringVariableBase(const B *const &, const SuperString &, std::string (B::*)(const VariableBase &) const);
    template <typename B>
    StringVariableBase(const B *const &, const SuperString &, const long &, std::string (B::*)(const VariableBase &) const);
    template <typename B>
    StringVariableBase(const B *const &, const SuperString &, long (B::*)(const VariableBase &) const, std::string (B::*)(const VariableBase &) const);
    template <typename B>
    StringVariableBase(const B *const &, const SuperString &, const SuperString &, const VariableBase::Source &);
    template <typename B>
    StringVariableBase(const B *const &, const SuperString &, const long &, const SuperString &, const VariableBase::Source &);
    template <typename B>
    StringVariableBase(const B *const &, const SuperString &, long (B::*)(const VariableBase &) const, const SuperString &, const VariableBase::Source &);
    template <typename B>
    StringVariableBase(const B *const &, const SuperString &, std::string (B::*)(const DataRollRecord &, const VariableBase &) const);
    template <typename B>
    StringVariableBase(const B *const &, const SuperString &, const long &, std::string (B::*)(const DataRollRecord &, const VariableBase &) const);
    template <typename B>
    StringVariableBase(const B *const &, const SuperString &, long (B::*)(const VariableBase &) const, std::string (B::*)(const DataRollRecord &, const VariableBase &) const);
    template <typename B>
    StringVariableBase(const B *const &, const SuperString &);
    StringVariableBase(const TableBase *const &);
    
    inline std::string operator + (const StringVariableBase &stringVar) const
    {return this->_getSuperString()._getSenseString() + stringVar._getSuperString()._getSenseString();};

    inline std::string operator + (const std::string &stringVar) const
    {return this->_getSuperString()._getSenseString() + stringVar;};

    inline std::string operator + (const SuperString &stringVar) const
    {return this->_getSuperString()._getSenseString() + stringVar._getSenseString();};

    inline std::string operator + (const char* stringVar) const
    {return this->_getSuperString()._getSenseString()  + stringVar;};

    inline operator const SuperString &() const
    {return this->_hasV ? this->_value : this->_getCalculatedValue();};
    
    inline const SuperString &_setValue(const SuperString &value) const {
        
        if(this->_valueSource == VariableBase::Source::TO_DEFINE) {
            throw new ItemNotDefinedError(this);
        }
        
        //this->_hasStrNode = true;
        if(!this->_hasV){
            this->_hasV = true;
            this->_value = value;
            return this->_value;
        }
        //if(this->_value != value)
        //    return this->_value = value;
        this->_value = value;
        return this->_value;
    }
    const SuperString & _setValue(const std::string& str) const {
        this->_hasV = true;
        if(this->_value == str)
            return this->_value;
        this->_value = str;
        return this->_value;
    }
    inline operator const std::string& () const
    {return this->operator const SuperString &()._getSenseString();}
    
    virtual inline const std::string &_getString() const override
    {return this->operator const std::string&();}

    virtual inline const SuperString &_getSuperString() const override
    {return this->operator const SuperString &();}

    inline const SuperString *operator -> () const
    {return &this->operator const SuperString &();}
    
    virtual inline void _setString(const SuperString &value) const override
    {this->_setValue(value);}

    /*virtual inline void _setString(StringNode *const &value) const override
    {this->_setValue(value);}*/

    virtual inline void _setString(const std::string &value) const override
    {this->_setValue(value);}
    
    virtual inline void _setValue(const VariableBase &variable) const override
    {this->_setValue(variable._getString());}
    inline void _setValue(const StringVariableBase &variable) const
    {this->_setValue(variable._getString());}
    virtual inline const StringVariableBase &operator () (const long &copy) const override {
        
        this->_throwUndefinedMe();
        return *this->_getCopy(copy);
    }

    virtual inline StringVariableBase &operator [] (const long &copy) const override {
        
        this->_throwUndefinedMe();
        return *this->_getCopy(copy);
    }
    
    template <typename B>
    inline void _convertToCalculated(std::string (B::*valueFunc)(const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::CALCULATED;
            this->_valueFunc.getFormula(this->_owner, valueFunc);
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToCalculated(std::string (B::*valueFunc)(const VariableBase &) const, const long &defaultCopySize) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::CALCULATED;
            this->_valueFunc.getFormula(this->_owner, valueFunc);
            this->_defaultCopySize = defaultCopySize;
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToCalculated(std::string (B::*valueFunc)(const VariableBase &) const, long (B::*copySizeFunc)(const VariableBase &) const) {
        
        //f(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::CALCULATED;
            this->_valueFunc.getFormula(this->_owner, valueFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;          //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDataConverted(std::string (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &)) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_CONVERTED;
            this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDataConverted(std::string (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &), const long &defaultCopySize) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_CONVERTED;
            this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
            this->_defaultCopySize = defaultCopySize;
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDataConverted(std::string (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &), long (B::*copySizeFunc)(const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_CONVERTED;
            this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;          //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    inline void _convertToValue(const SuperString &value) {
        
        this->_convertToDefault(_FIXED_VALUE);
        this->_setValue(value);
    }
    
    inline void _convertToValue(std::string value) {
        
        this->_convertToDefault(_FIXED_VALUE);
        this->_setValue(getSuperString(value));
    }
    
    inline void _convertToValue(const char *value) {
        
        this->_convertToDefault(_FIXED_VALUE);
        this->_setValue(getSuperString(value));
    }

    long _findLast(const char *) const;
    long _findFirst(const char *) const;
    long _find(const char *) const;
    long _rFind(const char *) const;
    inline long _findLast(const std::string& str) const{return this->_findLast(str.c_str());};
    inline long _findFirst(const std::string& str)  const{return this->_findFirst(str.c_str());};
    inline long _find(const std::string& str)  const{return this->_find(str.c_str());};
    inline long _rFind(const std::string& str)  const{return this->_rFind(str.c_str());};
    inline long _findLast(const SuperString &str) const{return this->_findLast(str._getString());};
    inline long _findFirst(const SuperString &str) const{return this->_findFirst(str._getString());};
    inline long _find(const SuperString &str) const{return this->_find(str._getString());};
    inline long _rfind(const SuperString &str) const{return this->_rFind(str._getString());};
/*
    inline bool operator == (const char * str) const{ return this->_getSuperString() == str;};
    inline bool operator == (const std::string &str) const { return this->operator==(str.c_str());};

    inline bool operator != (const char * chr) const{
        return !this->operator==(chr);
    };
    bool operator != (const std::string & str) const{
        return !this->operator==(str);
    };

    inline bool operator == (const SuperString &superString) const
    {return this->_getSuperString() == superString;}

    inline bool operator != (const SuperString &superString) const
    {return this->_getSuperString() != superString;}
*/
    
protected:

    StringVariableBase(const StringVariableBase *const &, const long &, GeneralMemoryChunk *&);

    virtual inline void _setValue(const ValueUnion *const &value) const override {
        
        if(value->_type == ValueUnion::Type::STRING){
            this->_setValue(*value->_valueHolder._sString);
        }
        
        throw new VariableTypeError(this);
    }

    StringVariableBase *_getCopy(const long &) const override;
    
    const SuperString &_getResult(const StringVariableBase &) const;
    virtual void _resize(const long &) const override;
    
private:
    
    
    mutable SuperString _value;

    
    ConstFormulaHolder<std::string, const VariableBase &> _valueFunc;
    ConstFormulaHolder<std::string, const DataRollRecord &, const VariableBase &> _dataConvFunc;
    //const std::string &_getCalculatedValue() const;
    const SuperString &_getCalculatedValue() const;
    /*
    inline const SuperString &_setValue(StringNode *const &value) const {
        this->_hasStrNode = true;
        //this->_hasV = true;
        if(!this->_hasV){
            this->_hasV = true;
            this->_strValue = value->_getString();
        }
        return (this->_value = value)->superString;
    }*/

};

template <typename B>
IntegerVariableBase::IntegerVariableBase(const B *const &oBlock, const SuperString &vName, long (B::*valueFunc)(const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::INTEGER, VariableBase::Source::CALCULATED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_valueFunc.getFormula(this->_owner, valueFunc);
}

template <typename B>
IntegerVariableBase::IntegerVariableBase(const B *const &oBlock, const SuperString &vName, const long &defaultSize, long (B::*valueFunc)(const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::INTEGER, VariableBase::Source::CALCULATED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_valueFunc.getFormula(this->_owner, valueFunc);
    this->_defaultCopySize = defaultSize;
}

template <typename B>
IntegerVariableBase::IntegerVariableBase(const B *const &oBlock, const SuperString &vName, long (B::*copySizeFunc)(const VariableBase &) const, long (B::*valueFunc)(const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::INTEGER, VariableBase::Source::CALCULATED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_valueFunc.getFormula(this->_owner, valueFunc);
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
    this->_hasCopySizeFunc = true;
    this->_useCopySizeFunc = true;          //BC 20201204
}

template <typename B>
IntegerVariableBase::IntegerVariableBase(const B *const &oBlock, const SuperString &vName, const SuperString &linkage, const VariableBase::Source &source):
VariableBase(oBlock, vName, VariableBase::ValueType::INTEGER, source, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206
        
    this->_linkageStr = linkage;
}

template <typename B>
IntegerVariableBase::IntegerVariableBase(const B *const &oBlock, const SuperString &vName, const long &defaultSize, const SuperString &linkage, const VariableBase::Source &source):
VariableBase(oBlock, vName, VariableBase::ValueType::INTEGER, source, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_linkageStr = linkage;
    this->_defaultCopySize = defaultSize;
}

template <typename B>
IntegerVariableBase::IntegerVariableBase(const B *const &oBlock, const SuperString &vName, long (B::*copySizeFunc)(const VariableBase &) const, const SuperString &linkage, const VariableBase::Source &source):
VariableBase(oBlock, vName, VariableBase::ValueType::INTEGER, source, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206
        
    this->_linkageStr = linkage;
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
    this->_hasCopySizeFunc = true;
    this->_useCopySizeFunc = true;          //BC 20201204
}

template <typename B>
IntegerVariableBase::IntegerVariableBase(const B *const &oBlock, const SuperString &vName, long (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::INTEGER, VariableBase::Source::DATA_CONVERTED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
}

template <typename B>
IntegerVariableBase::IntegerVariableBase(const B *const &oBlock, const SuperString &vName, const long &defaultCopySize, long (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::INTEGER, VariableBase::Source::DATA_CONVERTED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
    this->_defaultCopySize = defaultCopySize;
}

template <typename B>
IntegerVariableBase::IntegerVariableBase(const B *const &oBlock, const SuperString &vName, long (B::*copySizeFunc)(const VariableBase &) const, long (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::INTEGER, VariableBase::Source::DATA_CONVERTED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
    this->_hasCopySizeFunc = true;
    this->_useCopySizeFunc = true;          //BC 20201204
}

template <typename B>
IntegerVariableBase::IntegerVariableBase(const B *const &oBlock, const SuperString &vName):
VariableBase(oBlock, vName, VariableBase::ValueType::INTEGER, VariableBase::Source::TO_DEFINE, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) { }              //BC 20201206

template <typename B>
FloatVariableBase::FloatVariableBase(const B *const &oBlock, const SuperString &vName, double (B::*valueFunc)(const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::FLOAT, VariableBase::Source::CALCULATED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_valueFunc.getFormula(this->_owner, valueFunc);
}

template <typename B>
FloatVariableBase::FloatVariableBase(const B *const &oBlock, const SuperString &vName, const long &defaultSize, double (B::*valueFunc)(const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::FLOAT, VariableBase::Source::CALCULATED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_valueFunc.getFormula(this->_owner, valueFunc);
    this->_defaultCopySize = defaultSize;
}

template <typename B>
FloatVariableBase::FloatVariableBase(const B *const &oBlock, const SuperString &vName, long (B::*copySizeFunc)(const VariableBase &) const, double (B::*valueFunc)(const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::FLOAT, VariableBase::Source::CALCULATED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_valueFunc.getFormula(this->_owner, valueFunc);
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
    this->_hasCopySizeFunc = true;
    this->_useCopySizeFunc = true;          //BC 20201204
}

template <typename B>
FloatVariableBase::FloatVariableBase(const B *const &oBlock, const SuperString &vName, const SuperString &linkage, const VariableBase::Source &source):
VariableBase(oBlock, vName, VariableBase::ValueType::FLOAT, source, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206
        
    this->_linkageStr = linkage;
}

template <typename B>
FloatVariableBase::FloatVariableBase(const B *const &oBlock, const SuperString &vName, const long &defaultCopySize, const SuperString &linkage, const VariableBase::Source &source):
VariableBase(oBlock, vName, VariableBase::ValueType::FLOAT, source, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_linkageStr = linkage;
    this->_defaultCopySize = defaultCopySize;
}

template <typename B>
FloatVariableBase::FloatVariableBase(const B *const &oBlock, const SuperString &vName, long (B::*copySizeFunc)(const VariableBase &) const, const SuperString &linkage, const VariableBase::Source &source):
VariableBase(oBlock, vName, VariableBase::ValueType::FLOAT, source, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206
        
    this->_linkageStr = linkage;
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
    this->_hasCopySizeFunc = true;
    this->_useCopySizeFunc = true;          //BC 20201204
}

template <typename B>
FloatVariableBase::FloatVariableBase(const B *const &oBlock, const SuperString &vName, double (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::FLOAT, VariableBase::Source::DATA_CONVERTED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
}

template <typename B>
FloatVariableBase::FloatVariableBase(const B *const &oBlock, const SuperString &vName, const long &defaultCopySize, double (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::FLOAT, VariableBase::Source::DATA_CONVERTED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
    this->_defaultCopySize = defaultCopySize;
}

template <typename B>
FloatVariableBase::FloatVariableBase(const B *const &oBlock, const SuperString &vName, long (B::*copySizeFunc)(const VariableBase &) const, double (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::FLOAT, VariableBase::Source::DATA_CONVERTED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
    this->_hasCopySizeFunc = true;
    this->_useCopySizeFunc = true;          //BC 20201204
}

template <typename B>
FloatVariableBase::FloatVariableBase(const B *const &oBlock, const SuperString &vName):
VariableBase(oBlock, vName, VariableBase::ValueType::FLOAT, VariableBase::Source::TO_DEFINE, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) { }              //BC 20201206

template <typename B>
StringVariableBase::StringVariableBase(const B *const &oBlock, const SuperString &vName, std::string (B::*valueFunc)(const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::STRING, VariableBase::Source::CALCULATED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_valueFunc.getFormula(this->_owner, valueFunc);
}

template <typename B>
StringVariableBase::StringVariableBase(const B *const &oBlock, const SuperString &vName, const long &defaultCopySize, std::string (B::*valueFunc)(const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::STRING, VariableBase::Source::CALCULATED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_valueFunc.getFormula(this->_owner, valueFunc);
    this->_defaultCopySize = defaultCopySize;
}

template <typename B>
StringVariableBase::StringVariableBase(const B *const &oBlock, const SuperString &vName, long (B::*copySizeFunc)(const VariableBase &) const, std::string (B::*valueFunc)(const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::STRING, VariableBase::Source::CALCULATED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_valueFunc.getFormula(this->_owner, valueFunc);
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
    this->_hasCopySizeFunc = true;
    this->_useCopySizeFunc = true;          //BC 20201204
}

template <typename B>
StringVariableBase::StringVariableBase(const B *const &oBlock, const SuperString &vName, const SuperString &linkage, const VariableBase::Source &source):
VariableBase(oBlock, vName, VariableBase::ValueType::STRING, source, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_linkageStr = linkage;
}

template <typename B>
StringVariableBase::StringVariableBase(const B *const &oBlock, const SuperString &vName, const long &defaultCopySize, const SuperString &linkage, const VariableBase::Source &source):
VariableBase(oBlock, vName, VariableBase::ValueType::STRING, source, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_linkageStr = linkage;
    this->_defaultCopySize = defaultCopySize;
}

template <typename B>
StringVariableBase::StringVariableBase(const B *const &oBlock, const SuperString &vName, long (B::*copySizeFunc)(const VariableBase &) const, const SuperString &linkage, const VariableBase::Source &source):
VariableBase(oBlock, vName, VariableBase::ValueType::STRING, source, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206
        
    this->_linkageStr = linkage;
    this-_copySizeFunc.getFormula(this->_owner, copySizeFunc);
    this->_hasCopySizeFunc = true;
    this->_useCopySizeFunc = true;          //BC 20201204
}

template <typename B>
StringVariableBase::StringVariableBase(const B *const &oBlock, const SuperString &vName, std::string (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::STRING, VariableBase::Source::DATA_CONVERTED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
}

template <typename B>
StringVariableBase::StringVariableBase(const B *const &oBlock, const SuperString &vName, const long &defaultCopySize, std::string (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::STRING, VariableBase::Source::DATA_CONVERTED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
    this->_defaultCopySize = defaultCopySize;
}

template <typename B>
StringVariableBase::StringVariableBase(const B *const &oBlock, const SuperString &vName, long (B::*copySizeFunc)(const VariableBase &) const, std::string (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const):
VariableBase(oBlock, vName, VariableBase::ValueType::STRING, VariableBase::Source::DATA_CONVERTED, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) {              //BC 20201206

    this->_dataConvFunc.getFormula(this->_owner, dataConvFunc);
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
    this->_hasCopySizeFunc = true;
    this->_useCopySizeFunc = true;          //BC 20201204
}

template <typename B>
StringVariableBase::StringVariableBase(const B *const &oBlock, const SuperString &vName):
VariableBase(oBlock, vName, VariableBase::ValueType::STRING, VariableBase::Source::TO_DEFINE, SystemConstant::ItemType::BASE, 0, 0, nullptr, this) { }              //BC 20201206

bool operator == (const StringVariableBase &var, const char *str);

inline bool operator == (const StringVariableBase &var, const std::string& str)
{return var._getSuperString() == str.c_str();}

inline bool operator == (const StringVariableBase &var, const StringVariableBase &another)
{return var._getSuperString() == another.operator const std::string &().c_str();}

inline bool operator == (const StringVariableBase &var, const SuperString& str)
{return  str == var.operator const std::string &();}

inline bool operator != (const StringVariableBase &var, const char *str)
{return !(var._getSuperString() == str);}

inline bool operator != (const StringVariableBase &var, const std::string& str)
{return !(var._getSuperString() == str);}

inline bool operator != (const StringVariableBase &var, const StringVariableBase &another)
{return var._getSuperString() != another._getSuperString();}

inline bool operator != (const StringVariableBase &var, const SuperString& str)
{return str != var.operator const std::string &();}

inline bool operator == (const char *str, const StringVariableBase &var)
{return var._getSuperString() == str;}

inline bool operator == (const std::string& str, const StringVariableBase &var)
{return var._getSuperString() == str;}

inline bool operator != (const char *str, const StringVariableBase &var)
{return var._getSuperString() != str;}

inline bool operator != (const std::string& str, const StringVariableBase &var)
{return var._getSuperString() != str;}
/*
inline std::string operator + (const SuperString &value1, const StringVariableBase &value2)
{return value1._getString() + value2._getString();}

inline std::string operator + (const std::string &value1, const StringVariableBase &value2)
{return value1 + value2._getString();}

inline std::string operator + (const char* const &value1, const StringVariableBase &value2)
{return value1 + value2._getString();}
*/
inline std::string operator + (const SuperString &value1, const StringVariableBase &value2)
{return value1._getSenseString() + value2._getSuperString()._getSenseString();}

inline std::string operator + (const std::string &value1, const StringVariableBase &value2)
{return value1 + value2._getSuperString()._getSenseString();}

inline std::string operator + (const char* const &value1, const StringVariableBase &value2)
{return value1 + value2._getSuperString()._getSenseString();}

inline std::ostream &operator << (std::ostream &out, const StringVariableBase &superString){

    out << superString._getString();
    return out;
}

#endif //Variable_20200709_hpp
