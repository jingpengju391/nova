//
//  SuperString.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2018/5/27.
//  Copyright © 2018年 陈曦. All rights reserved.
//

#ifndef SuperString_hpp
#define SuperString_hpp

#include <stdio.h>
#include <atomic>
#include <algorithm>
#include <string.h>
#include <string_view>
#ifdef __MINGW64__
    typedef unsigned long long __JZ__key;
#else
    typedef unsigned long __JZ__key;
#endif

#include "Definitions.hpp"
#include "GeneralMemoryManager.hpp"
#include "SuperLock.hpp"           //BC 20201126

class ValueUnion;

//class StringNode;
class StringManager;
class StringVariableBase;
//class StringNodeQuickFinder;

//_CODE_START_

class SuperString{
    
    friend class Beam;
    friend class StringManager;
    friend class ValueUnion;
    friend class VariableBase;
    friend class IntegerVariableBase;
    friend class FloatVariableBase;
    friend class StringVariableBase;
    friend class TableBase;
    friend class BlockCluster;
    friend class Block;
    friend class Navigator;
    friend class SuperTable;
    friend class StrSuperSwitcher;
    friend class Tank;
    friend class OutputPageNode;
    friend class OutputLine;
    friend class TXTConverter;
    friend class DataRoll;
    template <typename B> friend class BlockLink;
    //friend void _generateIndexSector(unsigned char *&, int &, const ValueUnion &);
    friend void _generateIndexSector(unsigned char *&, int &, const StringVariableBase &);
    
public:
    
    
    ~SuperString();
    SuperString();
    SuperString(const std::string &);
    SuperString(const char *);
    SuperString(const char *, int t);
    SuperString(const SuperString&);
    SuperString(GeneralMemoryChunk*);
    SuperString(const std::string &, GeneralMemoryChunk*);
    SuperString(const char *, GeneralMemoryChunk*);
    SuperString(const char *, int t ,GeneralMemoryChunk*);
    SuperString(const SuperString&, GeneralMemoryChunk*);
    //SuperString(StringNode *);
    
    SuperString &operator = (const std::string &);
    SuperString &operator = (const char *);
    SuperString &operator = (const char);
    SuperString &operator = (const SuperString &);
    
    //std::string operator + (StringVariableBase &var) const;

    inline std::string operator + (const SuperString &superString) const
    {return this->_getSenseString() + superString._getString();}
    
    inline std::string operator + (const char *chr) const
    {return this->_getSenseString() + chr;}

    inline std::string operator + (const std::string &str) const
    {return this->_getSenseString() + str;}
    bool operator == (const char *) const;
    inline bool operator == (const std::string &str) const { return this->operator==(str.c_str());};

    inline bool operator != (const char * chr) const{
        return !this->operator==(chr);
    };
    bool operator != (const std::string & str) const{
        return !this->operator==(str);
    };

    inline bool operator == (const SuperString &superString) const
    {return this->_key == superString._key && strcmp(this->rStr() , superString.rStr()) == 0;}

    inline bool operator != (const SuperString &superString) const
    {return this->_key != superString._key ? true : strcmp(this->rStr() , superString.rStr()) != 0;}

    inline bool operator <= (const SuperString &superString) const
    {return this->_key > superString._key ? false : strcmp(this->rStr() , superString.rStr()) <= 0;}
    inline bool operator <= (const std::string& str) const
    {return (*this) <= SuperString(str);}
    inline bool operator <= (const char* str) const
    {return (*this) <= SuperString(str);}

    inline bool operator >= (const SuperString &superString) const
    {return this->_key < superString._key ? false : strcmp(this->rStr() , superString.rStr()) >= 0;}
    inline bool operator >= (const std::string& str) const
    {return (*this) >= SuperString(str);}
    inline bool operator >= (const char* str) const
    {return (*this) >= SuperString(str);}
    
    inline bool operator < (const SuperString &superString) const
    {return this->_key < superString._key ? true : (this->_key == superString._key? strcmp(this->rStr() , superString.rStr()) < 0:false);}
    inline bool operator < (const std::string& str) const
    {return (*this) < SuperString(str);}
    inline bool operator < (const char* str) const
    {return (*this) < SuperString(str);}
    
    inline bool operator > (const SuperString &superString) const
    {return this->_key > superString._key ? true : (this->_key == superString._key? strcmp(this->rStr() , superString.rStr()) > 0:false);}
    inline bool operator > (const std::string& str) const
    {return (*this) > SuperString(str);}
    inline bool operator > (const char* str) const
    {return (*this) > SuperString(str);}

    SuperString &operator = (const StringVariableBase &);
    std::string operator + (const StringVariableBase &str) const;
    bool operator == (const StringVariableBase &superString) const;
    bool operator != (const StringVariableBase &superString) const;
    bool operator >= (const StringVariableBase &superString) const;
    bool operator <= (const StringVariableBase &superString) const;
    bool operator > (const StringVariableBase &superString) const;
    bool operator < (const StringVariableBase &superString) const;
    
    inline const SuperString *operator -> () const
    {return this;}
    
    
    inline const std::size_t _length() const {return this->_str.length();};
    const std::string& _getString() const{return this->_str;};
    const std::string& _getSenseString() const{return this->_senseStr;};
    
    operator const std::string& () const{return this->_senseStr;};
    //operator const char *() const{return this->_str.c_str();};
    inline char operator()(const std::size_t &index) const{return this->_senseStr[index];};
    std::string operator() (const std::size_t &s, const std::size_t &l) {return this->_senseStr.substr(s,l);};
    
    long _findLast(const char *) const;
    long _findFirst(const char *) const;
    long _find(const char *) const;
    long _rFind(const char *) const;
    long _findLast(const StringVariableBase& strVar) const;
    long _findFirst(const StringVariableBase& strVar) const;
    long _find(const StringVariableBase& strVar) const;
    long _rFind(const StringVariableBase& strVar) const;
    void _trim() const;
    
    inline long _findLast(const SuperString & str) const {return this->_findLast(str._str);};
    inline long _findFirst(const SuperString & str) const {return this->_findFirst(str._str);};
    inline long _find(const SuperString & str) const {return this->_find(str._str);};
    inline long _rFind(const SuperString & str) const {return this->_rFind(str._str);};
    inline long _findLast(const std::string & str) const {return this->_findLast(str.c_str());};
    inline long _findFirst(const std::string & str) const {return this->_findFirst(str.c_str());};
    inline long _find(const std::string & str) const {return this->_find(str.c_str());};
    inline long _rFind(const std::string & str) const {return this->_rFind(str.c_str());};

    const std::string& _replace(const std::string&, const std::string&) const;

    inline std::string _subString(const std::size_t& pos) const {return this->_senseStr.substr(pos);}
    inline std::string _subString(const std::size_t& pos, const std::size_t& n) const {return this->_senseStr.substr(pos, n);}


    // inline void _copy(char* p, const std::size_t& n) const {this->_str.copy(p, n);};
    // inline void _copy(char* p) const {this->_str.copy(p, this->_length() + 1);};
    void _assign(const char* p, const std::size_t& n);
    void _assign(const char* p);
    void _clear();
    
    inline int offset() const {return this->_offset;};
    void setOffset(int newOffset) const;
    
    // inline const char* rStr() const{return this->_rStr ?  this->_rStr : this->_emptyStr;};
    inline const char* rStr() const{return this->_rStr;};
    inline const char* rStr(int myOffset) const{return myOffset < this->_length()? this->_str.c_str() + myOffset : "\0";};
    // inline const char* rStr(int myOffset) const{return myOffset < this->_length()? this->_str.c_str() + myOffset : nullptr;};
protected:

    //StringNode *_stringNodeValue = nullptr;
    mutable const char* _rStr = nullptr;
    mutable int _offset = 0;
    
private:

    mutable std::string _str;
    mutable std::string _senseStr;
    
    mutable __JZ__key _key = 0;
    
    void _updateKey() const;
    
    void returnMemory();
    //static const StringManager *_stringManager;
    GeneralMemoryChunk* _chunk = nullptr;
    // static const char* _emptyStr;
};

class StringManager {
  
    friend class Beam;
    friend class StringNode;
    friend class StringTree;
    friend class StringNodeQuickFinder;
    friend class ValueUnion;
    friend class ThreadResourceManager;
public:
    

    
    StringManager();
    StringManager(bool);
    static const StringManager STRING_MANAGER;
    
private:
    
    GeneralMemoryManager _stringNodeManager = GeneralMemoryManager(_MEM_ID_STRING_NODE, sizeof(SuperString), _INITIAL_STRING_NODE_LENGTH, _REALLOC_STRING_NODE_LENGTH, true);
    
    SuperString *newSuperString() const;
    SuperString *newSuperString(const std::string & str) const;
    SuperString *newSuperString(const SuperString & str) const;
    SuperString *newSuperString(const char* str) const;
    SuperString *newSuperString(const char* str, int n) const;
    inline void setMultiThread(bool multiThread) {this->_stringNodeManager.setMultiThread(multiThread);};
};


inline std::string operator + (const std::string &value1, const SuperString &value2)
{return value1 + value2._getSenseString();}

inline std::string operator + (const char *const &value1, const SuperString &value2)
{return value1 + value2._getSenseString();}

inline std::string operator + (const char &value1, const SuperString &value2)
{return value1 + value2._getSenseString();}

//inline std::string operator + (char value1[], SuperString &value2)
//{return value1 + value2._getSenseString();}

inline SuperString getSuperString(const std::string& str) {
    return SuperString(str);
}
inline SuperString getSuperString(const char *str) {
    return SuperString(str);
}
inline std::ostream &operator << (std::ostream &out, const SuperString &superString){

    out << superString._getSenseString();
    return out;
}
inline bool operator == (const std::string &value1, const SuperString &value2)
{return SuperString(value1) == value2._getString();}

inline bool operator != (const std::string &value1, const SuperString &value2)
{return SuperString(value1) != value2._getString();}

inline bool operator > (const std::string &value1, const SuperString &value2)
{return SuperString(value1) > value2._getString();}

inline bool operator < (const std::string &value1, const SuperString &value2)
{return SuperString(value1) < value2._getString();}

inline bool operator >= (const std::string &value1, const SuperString &value2)
{return SuperString(value1) >= value2._getString();}

inline bool operator <= (const std::string &value1, const SuperString &value2)
{return SuperString(value1) <= value2._getString();}

inline bool operator == (const char* value1, const SuperString &value2)
{return SuperString(value1) == value2._getString();}

inline bool operator != (const char* value1, const SuperString &value2)
{return SuperString(value1) != value2._getString();}

inline bool operator > (const char* value1, const SuperString &value2)
{return SuperString(value1) > value2._getString();}

inline bool operator < (const char* value1, const SuperString &value2)
{return SuperString(value1) < value2._getString();}

inline bool operator >= (const char* value1, const SuperString &value2)
{return SuperString(value1) >= value2._getString();}

inline bool operator <= (const char* value1, const SuperString &value2)
{return SuperString(value1) <= value2._getString();}


bool inCollection(const char* chr, const char* chrSet);
bool inCollection(const SuperString& str, const char* chrSet);
bool inCollection(const SuperString& str, const SuperString& strSet);
inline bool inCollection(const std::string& chr, const char* chrSet){return inCollection(chr.c_str(), chrSet);};
inline bool inCollection(const std::string& chr, const std::string& chrSet){return inCollection(chr.c_str(), chrSet.c_str());};
inline bool inCollection(const char* chr, const std::string& chrSet){return inCollection(chr, chrSet.c_str());};
bool inCollection(const SuperString& str, const std::string& chrSet);
bool inCollection(const char* chr, const SuperString& strSet);
bool inCollection(const std::string& chr, const SuperString& strSet);
std::string enhenced_to_string(const double& value);
inline std::string enhenced_to_string(const int& value) {return std::to_string(value);};
inline std::string enhenced_to_string(const long& value) {return std::to_string(value);};
std::string enhenced_to_string(const ValueUnion& value);

inline SuperString getSuperString(const double &v) {
    return SuperString(enhenced_to_string(v));
}
std::string& trim(std::string &s);
//_CODE_END_

#endif /* SuperString_hpp */
