//
//  QuickList.20200803.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 20200803/08/03.
//  Copyright © 2020年 陈曦. All rights reserved.
//

#ifndef QuickList_20200803_hpp
#define QuickList_20200803_hpp

#include <stdio.h>

#include "ValueUnion.20200713.hpp"
#include "SuperLock.hpp"           //BC 20201126

class HypList;
class SuperTable;
class SuperTableRow;
class TableRowLookupError;
class TableColLookupError;
class RecordThread;
class ThreadResourceManager;

//_CODE_START_

class HypListItem: public ValueUnion{
    
    friend class VariableBase;
    friend class IntegerVariableBase;
    friend class FloatVariableBase;
    friend class StringVariableBase;
    friend class SeriesBase;
    friend class LinkBase;
    friend class BlockCluster;
    friend class Block;
    friend class Navigator;
    friend class HypMapCore;
    friend class OutputFolder;
    friend class TXTSuperTable;
    friend class TableBase;
    friend class OutputPageNode;
    friend class HypList;
    friend class SuperTable;
    friend class Target;
    friend class OutputFolderNode;
    template <typename M> friend class BlockLink;
    friend class BlockResult;
    friend class DataRoll;
    friend class TXTDataRoll;
    friend class OutputPageNode;
    friend class OutputLine;
    friend class TolerantTable;                         //BC 20201113
    friend class ExpressNode;                           //BC 20201207
    //friend class AssumptionLoader;

public:
    
    inline HypListItem *next()
    {return this->_next;}
    
    inline HypListItem *previous()
    {return this->_previous;}
    
    inline int itemId()
    {return this->_itemId;}

    
protected:
    
    HypListItem();
    
    HypListItem(const double &);
    HypListItem(const SuperString &);
    HypListItem(const SuperString &, const StringManager* stringManager);
    HypListItem(const ValueUnion::Type &);
    HypListItem(ValueUnion *const &);
    HypListItem(ValueUnion *const &, const StringManager* stringManager);
    HypListItem(char * &, const char&, const ValueUnion::Type &);
    HypListItem(char * &, const char&, const ValueUnion::Type &, const StringManager* stringManager);
    HypListItem(byte * &);
    
    int _itemId = 0;
    HypListItem *_next = nullptr;
    HypListItem *_previous = nullptr;
};

class ListCore {
  
    friend class HypList;
    
protected:
    
    ListCore(GeneralMemoryChunk *const &);
    
    GeneralMemoryChunk *_chunk;
    size_t _localSize = 0;
    
    unsigned char _localListItems[_QUICK_LIST_DEFAULT_SIZE * sizeof(HypListItem)];
    HypListItem *_itemHead = nullptr;
    
    ListCore *_next = nullptr;
    ListCore *_previous = nullptr;
};

class HypList {
    
    friend class Block;
    friend class SeriesBase;
    friend class Navigator;
    friend class BlockCluster;
    friend class OutputFolder;
    friend class DataRollRecord;
    friend class BlockResult;
    friend class TableRowLookupError;
    friend class TableColLookupError;
    friend class TableColDimLookupError;
    friend class TableRowIllegalNumError;
    friend class TableIllegalNumberError;
    friend class VariableBase;
    friend class IntegerVariableBase;
    friend class FloatVariableBase;
    friend class StringVariableBase;
    friend class LinkBase;
    friend class TableBase;
    template <typename M> friend class BlockLink;
    friend class RecordThread;
    friend class SuperTableRow;
    friend class TableBase;
    friend class TXTSuperTable;
    friend class DataRoll;
    friend class TXTDataRoll;
    friend class OutputPageNode;
    friend class Target;
    friend class ExpressParser;             //BC 20201207
    friend class ExpressNode;               //BC 20201207
    friend class OutputLine;
    friend class OutputPoint;
    friend class SuperTable;
    friend class Period;

public:
    
    HypList();
    HypList(const int &);
    HypList(RecordThread *);
    HypList(RecordThread *, const StringManager* stringManager);
    HypList(RecordThread *, const int &);
    HypList(GeneralMemoryChunk *const &);
    HypList(const int &, GeneralMemoryChunk *const &);
    HypList(RecordThread *, GeneralMemoryChunk *const &);
    HypList(RecordThread *, GeneralMemoryChunk *const &, const StringManager* stringManager);
    HypList(RecordThread *, const int &, GeneralMemoryChunk *const &);
    HypList(RecordThread *, const int &, GeneralMemoryChunk *const &, const StringManager* stringManager);
    HypList(const HypList &);
    
    long _size() const;
    
    void _pushNumber(const double &) const;
    void _pushString(const SuperString &) const;
    void _pushValueUnion(ValueUnion *const &) const;
    void _pushPointer(void *) const;
    void _pushItemWithType(const ValueUnion::Type &) const;
    void _pushItemFromString(char * &, const char &, const ValueUnion::Type &) const;
    void _pushItemFromString(byte * &) const;
    
    inline HypListItem &operator [] (const long &index) const
    {return *this->_getItem(index);}
    
    HypListItem *_getItem(const long &) const;
    void _resize(const long &) const;
    void _pop() const;
    //inline HypListItem *itemHead() const{return this->_itemHead;};
    ~HypList();
    

    
protected:
    
    bool _multiThread = false;
    SingleLock _lock;
    
    mutable long _sizeValue = 0;
    mutable ListCore *_coreHead = nullptr;
    mutable ListCore *_coreTail = nullptr;
    mutable HypListItem *_itemHead = nullptr;
    mutable HypListItem *_itemTail = nullptr;
    
    const GeneralMemoryManager *_listCoreManager = nullptr;
    const StringManager *_stringManager = nullptr;
    GeneralMemoryChunk *_chunk = nullptr;
    
    void _initialiseList(const ThreadResourceManager *const &);
    void _changeThread(RecordThread *const &);
    void _initialiseList(const ThreadResourceManager *const &, const StringManager* stringManager);
    void _changeThread(RecordThread *const &, const StringManager* stringManager);
    ListCore *_checkTail() const;
    void _appendItem(HypListItem *const &) const;
    void _returnMemory() const;
};

class NumHypList: public HypList{
    
public:
    
    NumHypList();
    NumHypList(const int &);
    NumHypList(RecordThread *);
    NumHypList(RecordThread *, const int &);
    NumHypList(GeneralMemoryChunk *const &);
    NumHypList(const int &, GeneralMemoryChunk *&);
    NumHypList(RecordThread *, GeneralMemoryChunk *&);
    NumHypList(RecordThread *, const int &, GeneralMemoryChunk *&);
    NumHypList(const NumHypList &);
    
    inline double operator [] (const int &index) const
    {return this->_getItem(index)->_getValue();}
    
    inline void _push(const double &v) const
    {this->_pushNumber(v);}
    
    ~NumHypList();
};

class StrHypList: public HypList {
    
public:
    
    StrHypList();
    StrHypList(const int &);
    StrHypList(RecordThread *);
    StrHypList(RecordThread *, const int &);
    StrHypList(GeneralMemoryChunk *const &);
    StrHypList(const int &, GeneralMemoryChunk *&);
    StrHypList(RecordThread *, GeneralMemoryChunk *&);
    StrHypList(RecordThread *, const int &, GeneralMemoryChunk *&);
    StrHypList(const StrHypList &);
    
    inline const SuperString &operator [] (const int &index) const
    {return this->_getItem(index)->_getSuperString();}
    
    inline void _push(const SuperString &v) const
    {this->_pushString(v);}
    
    ~StrHypList();
};

template <typename T>
class PtrHypList: public HypList {
    
public:
    
    PtrHypList();
    PtrHypList(const int &);
    PtrHypList(RecordThread *);
    PtrHypList(RecordThread *, const int &);
    PtrHypList(GeneralMemoryChunk *const &);
    PtrHypList(const int &, GeneralMemoryChunk *&);
    PtrHypList(RecordThread *, GeneralMemoryChunk *&);
    PtrHypList(RecordThread *, const int &, GeneralMemoryChunk *&);
    PtrHypList(const PtrHypList<T> &);
    
    inline T *operator [] (const int &index) const
    {return (T *)this->_getItem(index)->_getPointer();}
    
    inline void _push(void *const &v) const
    {this->_pushPointer(v);}
    
    ~PtrHypList();
};

std::ostream &operator << (std::ostream &, const HypList &);

template <typename T>
PtrHypList<T>::PtrHypList():
HypList() {}

template <typename T>
PtrHypList<T>::PtrHypList(const int &lockId):
HypList(lockId) { }

template <typename T>
PtrHypList<T>::PtrHypList(RecordThread *recordThread):
HypList(recordThread) { }

template <typename T>
PtrHypList<T>::PtrHypList(RecordThread *recordThread, const int &lockId):
HypList(recordThread, lockId) {}

template <typename T>
PtrHypList<T>::PtrHypList(GeneralMemoryChunk *const &chunk):
HypList(chunk) {}

template <typename T>
PtrHypList<T>::PtrHypList(const int &lockId, GeneralMemoryChunk *&chunk):
HypList(lockId, chunk) {}

template <typename T>
PtrHypList<T>::PtrHypList(RecordThread *recordThread, GeneralMemoryChunk *&chunk):
HypList(recordThread, chunk) {}

template <typename T>
PtrHypList<T>::PtrHypList(RecordThread *recordThread, const int &lockId, GeneralMemoryChunk *&chunk):
HypList(recordThread, lockId, chunk) {}

template <typename T>
PtrHypList<T>::PtrHypList(const PtrHypList<T> &target):
HypList(target) {}

template <typename T>
PtrHypList<T>::~PtrHypList() {
    this->_returnMemory();
}

//_CODE_END_

#endif /* QuickList_20200803_hpp */
