//
//  ValueUnion.20200713.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2020/07/13.
//  Copyright © 2020年 陈曦. All rights reserved.
//

#ifndef ValueUnion_20200713_hpp
#define ValueUnion_20200713_hpp

#include <stdio.h>
#include <math.h>
#include <algorithm>

#include "Definitions.hpp"
#include "SuperString.hpp"
#include "GeneralMemoryManager.hpp"
#include "Functions.hpp"

//_CODE_START_

#ifdef __MINGW64__
    typedef unsigned long long __JZ__Other;
#else
    typedef unsigned long __JZ__Other;
#endif

class ValueUnion {
    
    friend class Block;
    friend class DataRollRecord;
    friend class Tank;
    friend class TankCell;
    friend class OutputPageNode;
    friend class DataRoll;
    friend class IntegerVariableBase;
    friend class FloatVariableBase;
    friend class StringVariableBase;
    friend class SuperString;
    friend class HypMapItem;
    friend class HypMapCore;
    friend class SuperTable;
    friend class BlockCluster;
    friend class QuickTable;
    //friend void _generateIndexSector(unsigned char *&, int &, const ValueUnion &);
    friend class BlockResult;
    friend class OutputFolderNode;
    friend class TXTSuperTable;
    friend class TXTDataRoll;
    friend class OutputFolder;
    friend class ExpressParser;                     //BC 20201206
    friend class ExpressNode;                       //BC 20201207
    friend class OutputPoint;
    friend class VariableBase;
    
public:
    
    union ValueHolder{
        
        double _number;
        void *_pointer;
        __JZ__Other _otherIndicator;
        SuperString* _sString;
    };
    
    enum Type{
        
        UNSPECIFIED             = 0,
        OTHER                   = 1,
        POINTER                 = 2,
        NUMBER                  = 4,
        STRING                  = 5,
        ERROR_TABLE_CELL        = 6,

    };

    ~ValueUnion();
    inline Type _valueType() const
    {return this->_type;}
    
    inline void _setType(ValueUnion::Type type)
    {this->_type = type;}
    
    void _setValue(const double &value);
    void _setValue(const SuperString &value);
    void _setValue(const std::string &value);
    void _setValue(const SuperString &value, const StringManager* stringManager);
    void _setValue(const std::string &value, const StringManager* stringManager);
    /*inline void _setValue(StringNode *const &charChunk) {
        
        if(this->_type == ValueUnion::Type::STRING || this->_type == ValueUnion::Type::UNSPECIFIED){
            
            this->_valueHolder._string = charChunk;
            
            if(this->_type == ValueUnion::Type::UNSPECIFIED){
                this->_type = ValueUnion::Type::STRING;
            }
        }
    }*/
    
    void _setPointer(void * p);

    inline double _getValue() const
    {return this->operator double();}

    inline const SuperString &_getSuperString() const
    {return this->operator const SuperString &();}

    inline const std::string& _getString() const
    {return this->operator const std::string&();}


    inline void *_getPointer() const
    {return this->_type == ValueUnion::Type::POINTER ? this->_valueHolder._pointer : nullptr;}
    
    void _setOtherIndicator(const __JZ__Other &indicator);
    
    inline __JZ__Other _getOtherIndicator() const
    {return this->_type == ValueUnion::Type::OTHER ? this->_valueHolder._otherIndicator : _ERROR_INTEGER;}
    
    inline bool operator == (const ValueUnion &value) const
    {return this->_type == value._type && (this->_type == ValueUnion::Type::STRING ? (*this->_valueHolder._sString) == (*value._valueHolder._sString): this->_valueHolder._otherIndicator == value._valueHolder._otherIndicator);}

    inline bool operator == (const SuperString &value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) == value : false;}
    inline bool operator == (const std::string &value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) == value : false;}
    inline bool operator == (const char* value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) == value : false;}

    inline bool operator == (const double &value) const
    {return this->_type == ValueUnion::Type::NUMBER && this->_valueHolder._number == value;}
    inline bool operator == (const long &value) const
    {return this->_type == ValueUnion::Type::NUMBER && this->_valueHolder._number == value;}
    inline bool operator == (const int &value) const
    {return this->_type == ValueUnion::Type::NUMBER && this->_valueHolder._number == value;}
    
    inline bool operator != (const ValueUnion &value) const
    {return this->_type != value._type || (this->_type == ValueUnion::Type::STRING ? (*this->_valueHolder._sString) != (*value._valueHolder._sString):this->_valueHolder._otherIndicator != value._valueHolder._otherIndicator);}

    inline bool operator != (const SuperString &value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) != value : true;}
    inline bool operator != (const std::string &value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) != value : true;}
    inline bool operator != (const char* value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) != value : true;}

    inline bool operator != (const double &value) const
    {return this->_type != ValueUnion::Type::NUMBER || this->_valueHolder._number != value;}
    inline bool operator != (const long &value) const
    {return this->_type != ValueUnion::Type::NUMBER || this->_valueHolder._number != value;}
    inline bool operator != (const int &value) const
    {return this->_type != ValueUnion::Type::NUMBER || this->_valueHolder._number != value;}

    inline bool operator > (const ValueUnion &value) const
    {return this->_type > value._type ? true : (this->_type == ValueUnion::Type::NUMBER ? this->_valueHolder._number > value._valueHolder._number : (this->_type == ValueUnion::Type::STRING ? (*this->_valueHolder._sString)> (*value._valueHolder._sString):this->_valueHolder._otherIndicator > value._valueHolder._otherIndicator));}
    inline bool operator > (const SuperString &value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) > value :false;}
    inline bool operator > (const std::string &value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) > value :false;}
    inline bool operator > (const char* value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) > value :false;}
    
    bool operator > (const double &value) const
    {return this->_type == ValueUnion::Type::STRING || (this->_type == ValueUnion::Type::NUMBER && this->_valueHolder._number > value);}
    bool operator > (const long &value) const
    {return this->_type == ValueUnion::Type::STRING || (this->_type == ValueUnion::Type::NUMBER && this->_valueHolder._number > value);}
    bool operator > (const int &value) const
    {return this->_type == ValueUnion::Type::STRING || (this->_type == ValueUnion::Type::NUMBER && this->_valueHolder._number > value);}
    
    inline bool operator >= (const ValueUnion &value) const
    {return this->_type > value._type ? true : (this->_type == ValueUnion::Type::NUMBER ? this->_valueHolder._number >= value._valueHolder._number : (this->_type == ValueUnion::Type::STRING ?(*this->_valueHolder._sString) >= (*value._valueHolder._sString):this->_valueHolder._otherIndicator >= value._valueHolder._otherIndicator));}

    inline bool operator >= (const SuperString &value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) >= value : false;}
    inline bool operator >= (const std::string &value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) >= value : false;}
    inline bool operator >= (const char* value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) >= value : false;}
    
    inline bool operator >= (const double &value) const
    {return this->_type == ValueUnion::Type::STRING || (this->_type == ValueUnion::Type::NUMBER && this->_valueHolder._number >= value);}
    inline bool operator >= (const long &value) const
    {return this->_type == ValueUnion::Type::STRING || (this->_type == ValueUnion::Type::NUMBER && this->_valueHolder._number >= value);}
    inline bool operator >= (const int &value) const
    {return this->_type == ValueUnion::Type::STRING || (this->_type == ValueUnion::Type::NUMBER && this->_valueHolder._number >= value);}
    
    inline bool operator < (const ValueUnion &value) const
    {return this->_type < value._type ? true : (this->_type == ValueUnion::Type::NUMBER ? this->_valueHolder._number < value._valueHolder._number : (this->_type == ValueUnion::Type::STRING ?(*this->_valueHolder._sString) < (*value._valueHolder._sString):this->_valueHolder._otherIndicator < value._valueHolder._otherIndicator));}

    inline bool operator < (const SuperString &value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) < value :false;}
    inline bool operator < (const std::string& value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) < value :false;}
    inline bool operator < (const char* value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) < value :false;}

    inline bool operator < (const double &value) const
    {return this->_type != ValueUnion::Type::STRING && (this->_type != ValueUnion::Type::NUMBER || this->_valueHolder._number < value);}
    inline bool operator < (const long &value) const
    {return this->_type != ValueUnion::Type::STRING && (this->_type != ValueUnion::Type::NUMBER || this->_valueHolder._number < value);}
    inline bool operator < (const int &value) const
    {return this->_type != ValueUnion::Type::STRING && (this->_type != ValueUnion::Type::NUMBER || this->_valueHolder._number < value);}
    
    inline bool operator <= (const ValueUnion &value) const
    {return this->_type < value._type ? true : (this->_type == ValueUnion::Type::NUMBER ? this->_valueHolder._number <= value._valueHolder._number : (this->_type == ValueUnion::Type::STRING ?(*this->_valueHolder._sString) <= (*value._valueHolder._sString):this->_valueHolder._otherIndicator <= value._valueHolder._otherIndicator));}

    inline bool operator <= (const SuperString &value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) <= value :false;}
    inline bool operator <= (const std::string &value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) <= value :false;}
    inline bool operator <= (const char* value) const
    {return this->_type == ValueUnion::Type::STRING? (*this->_valueHolder._sString) <= value :false;}
    
    inline bool operator <= (const double &value) const
    {return this->_type != ValueUnion::Type::STRING && (this->_type != ValueUnion::Type::NUMBER || this->_valueHolder._number <= value);}
    inline bool operator <= (const long &value) const
    {return this->_type != ValueUnion::Type::STRING && (this->_type != ValueUnion::Type::NUMBER || this->_valueHolder._number <= value);}
    inline bool operator <= (const int &value) const
    {return this->_type != ValueUnion::Type::STRING && (this->_type != ValueUnion::Type::NUMBER || this->_valueHolder._number <= value);}
    
    inline std::string operator + (const SuperString &value) const
    {return this->_getString() + value._getString();}
    inline std::string operator + (const std::string &value) const
    {return this->_getString() + value;}
    inline std::string operator + (const char* value) const
    {return this->_getString() + value;}
    
    inline operator double () const
    {return this->_type == ValueUnion::Type::NUMBER ? this->_valueHolder._number : _ERROR_INTEGER;}
    
    inline operator const SuperString &() const
    { return this->_type == ValueUnion::Type::STRING ? (*this->_valueHolder._sString) : ValueUnion::_errorString;}
    
    inline operator const std::string& () const//senna update
    {return this->_type == ValueUnion::Type::STRING ? this->_valueHolder._sString->_getSenseString() : ValueUnion::_errorString._getString();};

    inline operator const char* () const//senna update
    {return this->_type == ValueUnion::Type::STRING ? this->_valueHolder._sString->_getString().c_str() :  ValueUnion::_errorString._getString().c_str();}
    inline double operator / (const int &value) const
    {return this->_type != ValueUnion::Type::NUMBER? 0 : (this->_valueHolder._number/value);}
    inline double operator / (const long &value) const
    {return this->_type != ValueUnion::Type::NUMBER? 0 : (this->_valueHolder._number/value);}
    inline double operator / (const double &value) const
    {return this->_type != ValueUnion::Type::NUMBER? 0 : (this->_valueHolder._number/value);}
    inline double operator / (const ValueUnion &value) const
    {return (this->_type != ValueUnion::Type::NUMBER || value._type != this->_type)? 0 : (this->_valueHolder._number / value._valueHolder._number);}
    
    inline double operator * (const int &value) const
    {return this->_type != ValueUnion::Type::NUMBER? 0 : (this->_valueHolder._number * value);}
    inline double operator * (const long &value) const
    {return this->_type != ValueUnion::Type::NUMBER? 0 : (this->_valueHolder._number * value);}
    inline double operator * (const double &value) const
    {return this->_type != ValueUnion::Type::NUMBER? 0 : (this->_valueHolder._number * value);}
    inline double operator * (const ValueUnion &value) const
    {return (this->_type != ValueUnion::Type::NUMBER || value._type != this->_type)? 0 : (this->_valueHolder._number * value._valueHolder._number);}
    
    inline double operator - (const int &value) const
    {return this->_type != ValueUnion::Type::NUMBER? 0 : (this->_valueHolder._number - value);}
    inline double operator - (const long &value) const
    {return this->_type != ValueUnion::Type::NUMBER? 0 : (this->_valueHolder._number - value);}
    inline double operator - (const double &value) const
    {return this->_type != ValueUnion::Type::NUMBER? 0 : (this->_valueHolder._number - value);}
    inline double operator - (const ValueUnion &value) const
    {return (this->_type != ValueUnion::Type::NUMBER || value._type != this->_type)? 0 : (this->_valueHolder._number - value._valueHolder._number);}
    
    inline double operator + (const int &value) const
    {return this->_type != ValueUnion::Type::NUMBER? 0 : (this->_valueHolder._number + value);}
    inline double operator + (const long &value) const
    {return this->_type != ValueUnion::Type::NUMBER? 0 : (this->_valueHolder._number + value);}
    inline double operator + (const double &value) const
    {return this->_type != ValueUnion::Type::NUMBER? 0 : (this->_valueHolder._number+ value);}
    inline ValueUnion operator + (const ValueUnion &value) const
    {return (this->_type == ValueUnion::Type::NUMBER && value._type == this->_type)? ValueUnion(this->_valueHolder._number + value._valueHolder._number):
        ((this->_type == ValueUnion::Type::STRING && value._type == this->_type)? ValueUnion(SuperString(this->_getString() + value._getString())): ValueUnion(0));}

protected:

    ValueUnion();
    
    ValueUnion(const SuperString &);
    ValueUnion(const int &);
    ValueUnion(const long&);
    ValueUnion(const std::string &);
    ValueUnion(const double &);    
    ValueUnion(GeneralMemoryChunk *const &);
    ValueUnion(const double &, GeneralMemoryChunk *const &);
    ValueUnion(const SuperString &, GeneralMemoryChunk *const &);
    ValueUnion(const SuperString &, GeneralMemoryChunk *const &, const StringManager* stringManager);
    ValueUnion(const ValueUnion::Type &, GeneralMemoryChunk *const&);
    ValueUnion(char * &, const char &, int &, const ValueUnion::Type &, GeneralMemoryChunk *const &);
    ValueUnion(char * &, const char &, int &, const ValueUnion::Type &, GeneralMemoryChunk *const &, const StringManager* stringManager);
    //ValueUnion(char * &, const char &, int &, const ValueUnion::Type &, StringNodeQuickFinder *const &, GeneralMemoryChunk *const &);
    ValueUnion(char * &, const char &, const ValueUnion::Type &, GeneralMemoryChunk *const &, const StringManager* stringManager);
    ValueUnion(char * &, const char &, const ValueUnion::Type &, GeneralMemoryChunk *const &);
    //ValueUnion(char * &, const char &, const ValueUnion::Type &, StringNodeQuickFinder *const &, GeneralMemoryChunk *const &);
    ValueUnion(byte * &, GeneralMemoryChunk *const &);
    ValueUnion(const ValueUnion *, GeneralMemoryChunk *const &);
    ValueUnion(const ValueUnion *, GeneralMemoryChunk *const &, const StringManager* stringManager);
    
    mutable ValueHolder _valueHolder;
    mutable GeneralMemoryChunk *_chunk = nullptr;
    Type _type = ValueUnion::Type::UNSPECIFIED;

    void returnMemory() const;
    void clearString() const;
    
    void copyValueUnion(const ValueUnion *value);
    void copyValueUnion(const ValueUnion *value, const StringManager* stringManager);
    const std::size_t valueSize() const;
    void archive(byte * &);
    
    inline void readJSON(char *&p, bool isField) {
        
        int offset = 0;
        
        if(isField) {
            this->readValue(p, _JSON_FIELD, offset, true);
        }
        else {
            this->readValue(p, _JSON_SEP, offset, true);
        }
    }
    
    void readValue(char *&, const char &, int &, bool);
    void readValue(char *&, const char &, int &, bool, const StringManager*);
    //SuperString _sString;
    const static SuperString _errorString;
};

std::ostream &operator << (std::ostream &, const ValueUnion &);

inline std::string operator + (const ValueUnion &value, const char *str)
{return value._getString() + str;}

inline std::string operator + (const char *str, const ValueUnion &value)
{return str + value._getString();}

inline bool operator == (const SuperString &str, const ValueUnion &value)
{return value == str;}
inline bool operator == (const std::string &str, const ValueUnion &value)
{return value == str;}
inline bool operator == (const char* str, const ValueUnion &value)
{return value == str;}

inline bool operator == (const double &num, const ValueUnion &value)
{return value == num;}
inline bool operator == (const int &num, const ValueUnion &value)
{return value == num;}
inline bool operator == (const long &num, const ValueUnion &value)
{return value == num;}

inline bool operator != (const SuperString &str, const ValueUnion &value)
{return value != str;}
inline bool operator != (const std::string &str, const ValueUnion &value)
{return value != str;}
inline bool operator != (const char* str, const ValueUnion &value)
{return value != str;}

inline bool operator != (const double &num, const ValueUnion &value)
{return value != num;}
inline bool operator != (const int &num, const ValueUnion &value)
{return value != num;}
inline bool operator != (const long &num, const ValueUnion &value)
{return value != num;}

inline bool operator > (const SuperString &str, const ValueUnion &value)
{return value < str;}
inline bool operator > (const std::string &str, const ValueUnion &value)
{return value < str;}
inline bool operator > (const char* str, const ValueUnion &value)
{return value < str;}

inline bool operator > (const double &num, const ValueUnion &value)
{return value < num;}
inline bool operator > (const int &num, const ValueUnion &value)
{return value < num;}
inline bool operator > (const long &num, const ValueUnion &value)
{return value < num;}

inline bool operator >= (const SuperString &str, const ValueUnion &value)
{return value <= str;}
inline bool operator >= (const std::string &str, const ValueUnion &value)
{return value <= str;}
inline bool operator >= (const char* str, const ValueUnion &value)
{return value <= str;}

inline bool operator >= (const double &num, const ValueUnion &value)
{return value <= num;}
inline bool operator >= (const long &num, const ValueUnion &value)
{return value <= num;}
inline bool operator >= (const int &num, const ValueUnion &value)
{return value <= num;}

inline bool operator < (const SuperString &str, const ValueUnion &value)
{return value > str;}
inline bool operator < (const std::string &str, const ValueUnion &value)
{return value > str;}
inline bool operator < (const char* str, const ValueUnion &value)
{return value > str;}

inline bool operator < (const double &num, const ValueUnion &value)
{return value > num;}
inline bool operator < (const int &num, const ValueUnion &value)
{return value > num;}
inline bool operator < (const long &num, const ValueUnion &value)
{return value > num;}

inline bool operator <= (const SuperString &str, const ValueUnion &value)
{return value >= str;}
inline bool operator <= (const std::string &str, const ValueUnion &value)
{return value >= str;}
inline bool operator <= (const char* str, const ValueUnion &value)
{return value >= str;}

inline bool operator <= (const double &num, const ValueUnion &value)
{return value >= num;}
inline bool operator <= (const int &num, const ValueUnion &value)
{return value >= num;}
inline bool operator <= (const long &num, const ValueUnion &value)
{return value >= num;}

inline bool operator + (const long &num, const ValueUnion &value)
{return value._valueType() != ValueUnion::Type::NUMBER? 0 : (num + value._getValue());}
inline bool operator - (const long &num, const ValueUnion &value)
{return value._valueType() != ValueUnion::Type::NUMBER? 0 : (num - value._getValue());}
inline bool operator * (const long &num, const ValueUnion &value)
{return value._valueType() != ValueUnion::Type::NUMBER? 0 : (num * value._getValue());}
inline bool operator / (const long &num, const ValueUnion &value)
{return value._valueType() != ValueUnion::Type::NUMBER? 0 : (num / value._getValue());}

inline bool operator + (const int &num, const ValueUnion &value)
{return value._valueType() != ValueUnion::Type::NUMBER? 0 : (num + value._getValue());}
inline bool operator - (const int &num, const ValueUnion &value)
{return value._valueType() != ValueUnion::Type::NUMBER? 0 : (num - value._getValue());}
inline bool operator * (const int &num, const ValueUnion &value)
{return value._valueType() != ValueUnion::Type::NUMBER? 0 : (num * value._getValue());}
inline bool operator / (const int &num, const ValueUnion &value)
{return value._valueType() != ValueUnion::Type::NUMBER? 0 : (num / value._getValue());}

inline double operator + (const double &num, const ValueUnion &value)
{return value._valueType() != ValueUnion::Type::NUMBER? 0 : (num + value._getValue());}
inline double operator - (const double &num, const ValueUnion &value)
{return value._valueType() != ValueUnion::Type::NUMBER? 0 : (num - value._getValue());}
inline double operator * (const double &num, const ValueUnion &value)
{return value._valueType() != ValueUnion::Type::NUMBER? 0 : (num * value._getValue());}
inline double operator / (const double &num, const ValueUnion &value)
{return value._valueType() != ValueUnion::Type::NUMBER? 0 : (num / value._getValue());}

//_CODE_END_

#endif /* ValueUnion_20200713_hpp */
