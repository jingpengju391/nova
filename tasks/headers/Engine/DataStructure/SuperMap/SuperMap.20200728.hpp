//
//  SuperMap.20200728.hpp
//  jinShaJiang
//
//  Created by 陈曦 on 2020/7/28.
//  Copyright © 2020 陈曦. All rights reserved.
//

#ifndef SuperMap_20200728_hpp
#define SuperMap_20200728_hpp

#include <stdio.h>
#include <functional>

#include "Definitions.hpp"
#include "GeneralMemoryManager.hpp"
#include "ErrorHandler.hpp"
#include "SuperLock.hpp"           //BC 20201126
#include "ValueUnion.20200713.hpp"

class ThreadResourceManager;
class RecordThread;
class HypMapItem;
class HypMapCore;
class HypMap;

enum MissingMapKey {
    FIRST               = 1,
    LAST                = 2,
    PREVIOUS            = 3,
    NEXT                = 4,
    MISSING             = 5,
    WRONG               = 6,
};

class HypMapOperators {
    friend class OutputFolder;
public:
    
    virtual double _getValue() const = 0;
    virtual const SuperString &_getSuperString() const = 0;
    virtual void *_getPointer() const = 0;
    virtual void _setValue(const double &) const = 0;
    virtual void _setString(const SuperString &) const = 0;
    virtual void _setPointer(void *const &) const = 0;
    
    virtual void _turnOnExactSearch() = 0;
    virtual void _turnOffExactSearch() = 0;
    virtual void _turnOnAutoAddMissing() = 0;
    virtual void _turnOffAutoAddMissing() = 0;
    virtual long _size() const = 0;
    virtual int _level() const = 0;
    virtual bool _hasNext() const = 0;
    
    virtual HypMapItem &operator [] (const double &) const = 0;
    virtual HypMapItem &operator [] (const SuperString &) const = 0;
    virtual HypMapItem &operator [] (const ValueUnion *const &) const = 0;
    
    virtual HypMapItem *_getItem(const double &, const bool &) const = 0;
    virtual HypMapItem *_getItem(const SuperString &, const bool &) const = 0;
    virtual HypMapItem *_getItem(const ValueUnion *const &, const bool &) const = 0;
    //virtual HypMapItem *_getItem(const StringNode *const &, const bool &) const = 0;
    
    virtual HypMapItem *_getItem(const double &, const std::function<void (HypMapItem &, const bool &)>&) const = 0;
    virtual HypMapItem *_getItem(const SuperString &, const std::function<void (HypMapItem &, const bool &)>&) const = 0;
    virtual HypMapItem *_getItem(const ValueUnion *const &, const std::function<void (HypMapItem &, const bool &)>&) const = 0;
    //virtual HypMapItem *_getItem(const StringNode *const &, const std::function<void (HypMapItem &, const bool &)>&) const = 0;
    virtual HypMapItem *_getItem(const double &, const std::function<void (HypMapItem &, const bool &)>&, const bool&) const = 0;
    virtual HypMapItem *_getItem(const SuperString &, const std::function<void (HypMapItem &, const bool &)>&, const bool&) const = 0;
    virtual HypMapItem *_getItem(const ValueUnion *const &, const std::function<void (HypMapItem &, const bool &)>&, const bool&) const = 0;
    //virtual HypMapItem *_getItem(const StringNode *const &, const std::function<void (HypMapItem &, const bool &)>&, const bool&) const = 0;
    
    virtual void _setSkipValue(const double &) const = 0;
    virtual void _setSkipString(const SuperString &) const = 0;
    virtual void _setSkipPointer(void *) const = 0;
    
    virtual void _setMissingValue(const double &) const = 0;
    virtual void _setMissingString(const SuperString &) const = 0;
    virtual void _setMissingPointer(void *) const = 0;
    
    virtual double _getSkipValue() const = 0;
    virtual const SuperString &_getSkipString() const = 0;
    virtual void *_getSkipPointer() const = 0;
    
    virtual double _getMissingValue() const = 0;
    virtual const SuperString &_getMissingString() const = 0;
    virtual void *_getMissingPointer() const = 0;
    
    virtual void _setMissingKey(const MissingMapKey &) = 0;
    virtual void _setBeforeFirst(const MissingMapKey &) = 0;
    virtual void _setAfterLast(const MissingMapKey &) = 0;
    
    virtual void _remove (const double &) const = 0;
    virtual void _remove (const SuperString &) const = 0;
    virtual void _remove (const ValueUnion *const &) const = 0;
    
    
    virtual void _forEachItem(const std::function<void (HypMapItem &)>&) const = 0;
    
    virtual HypMapItem *_skipItem() const = 0;
    virtual HypMapItem *_missingItem() const = 0;
    
    virtual void _displayMe() const = 0;
    
    const static int _errorInteger;
    const static SuperString _errorString;
    
protected:
    
    virtual HypMapItem *headItem() const = 0;
    virtual HypMapItem *tailItem() const = 0;
};

class HypMapItem: public HypMapOperators {
  
    friend class NumHypMapItem;
    friend class StrHypMapItem;
    template <typename T> friend class PtrHypMapItem;
    friend class HypMapCore;
    friend class NumHypMap;
    friend class StrHypMap;
    template <typename T> friend class PtrHypMap;
    friend class HypMap;
    friend class SuperTable;
    friend class TXTSuperTable;
    friend class TableBase;
    friend class BlockCluster;
    friend class Block;
    friend class Tank;
    friend class QuickTable;
    friend class RecordThread;
    friend class BlockResult;
    friend class SeriesBase;
    friend class OutputFolder;
    friend class OutputPageNode;
    friend class OutputFolderNode;
    friend class DataRoll;
    friend class LinkBase;
    
public:
    
    const ValueUnion key;
    mutable ValueUnion content;
    const HypMapOperators &map;
    const HypMap &root;
    
    virtual int _level() const override;
    HypMapItem *_upItem() const;
    
    virtual inline bool _hasNext() const override
    {return this->_nextMap != nullptr;}
    
    virtual inline double _getValue() const override
    {return this->content._getValue();}
    
    virtual inline const SuperString &_getSuperString() const override
    {return this->content._getSuperString();}
    
    virtual inline void *_getPointer() const override
    {return this->content._getPointer();}
    
    virtual inline void _setValue(const double &v) const override
    {this->content._setValue(v);}
    
    virtual inline void _setString(const SuperString &v) const override
    {this->content._setValue(v);}
    
    virtual inline void _setPointer(void *const &v) const override
    {this->content._setPointer(v);}
    
    virtual inline operator double () const
    {throw new MapDataTypeError();}
    
    virtual inline operator const SuperString & () const
    {throw new MapDataTypeError();}
    
    virtual inline operator void * () const
    {throw new MapDataTypeError();}
    
    virtual inline HypMapItem &operator = (const double &v) {
        this->_setValue(v);
        return *this;
    }
    
    virtual inline HypMapItem &operator = (const SuperString &v) {
        this->_setString(v);
        return *this;
    }
    
    virtual inline HypMapItem &operator = (void *v) {
        this->_setPointer(v);
        return *this;
    }
    
    virtual void _turnOnExactSearch() override;
    virtual void _turnOffExactSearch() override;
    virtual void _turnOnAutoAddMissing() override;
    virtual void _turnOffAutoAddMissing() override;
    virtual long _size() const override;
    
    virtual inline HypMapItem &operator [] (const double &k) const override
    {return *this->_getItem(k, false);}
    
    virtual inline HypMapItem &operator [] (const SuperString &k) const override
    {return *this->_getItem(k, false);}
    
    virtual inline HypMapItem &operator [] (const ValueUnion *const &k) const override
    {return *this->_getItem(k, false);}
    
    
    virtual HypMapItem *_getItem(const double &, const bool &) const override;
    virtual HypMapItem *_getItem(const SuperString &, const bool &) const override;
    virtual HypMapItem *_getItem(const ValueUnion *const &, const bool &) const override;
    //virtual HypMapItem *_getItem(const StringNode *const &, const bool &) const override;
    
    virtual HypMapItem *_getItem(const double &, const std::function<void (HypMapItem &, const bool &)>&) const override;
    virtual HypMapItem *_getItem(const SuperString &, const std::function<void (HypMapItem &, const bool &)>&) const override;
    virtual HypMapItem *_getItem(const ValueUnion *const &, const std::function<void (HypMapItem &, const bool &)>&) const override;
    //virtual HypMapItem *_getItem(const StringNode *const &, const std::function<void (HypMapItem &, const bool &)>&) const override;

    virtual HypMapItem *_getItem(const double &, const std::function<void (HypMapItem &, const bool &)>&,const bool& contentCreate) const override;
    virtual HypMapItem *_getItem(const SuperString &, const std::function<void (HypMapItem &, const bool &)>&,const bool& contentCreate) const override;
    virtual HypMapItem *_getItem(const ValueUnion *const &, const std::function<void (HypMapItem &, const bool &)>&,const bool& contentCreate) const override;
    //virtual HypMapItem *_getItem(const StringNode *const &, const std::function<void (HypMapItem &, const bool &)>&,const bool& contentCreate) const override;   

    virtual void _setSkipValue(const double &) const override;
    virtual void _setSkipString(const SuperString &) const override;
    virtual void _setSkipPointer(void *) const override;
    
    virtual void _setMissingValue(const double &) const override;
    virtual void _setMissingString(const SuperString &) const override;
    virtual void _setMissingPointer(void *) const override;
    
    virtual double _getSkipValue() const override;
    virtual const SuperString &_getSkipString() const override;
    virtual void *_getSkipPointer() const override;
    
    virtual double _getMissingValue() const override;
    virtual const SuperString &_getMissingString() const override;
    virtual void *_getMissingPointer() const override;
    
    virtual void _setMissingKey(const MissingMapKey &) override;
    virtual void _setBeforeFirst(const MissingMapKey &) override;
    virtual void _setAfterLast(const MissingMapKey &) override;
    
    void _remove (const double &, const bool &) const;
    void _remove (const SuperString &, const bool &) const;
    void _remove (const ValueUnion *const &, const bool &) const;
    
    virtual void inline _remove(const double &k) const override
    {this->_remove(k, false);}
    
    virtual void inline _remove(const SuperString &k) const override
    {this->_remove(k, false);}
    
    virtual void inline _remove(const ValueUnion *const &k) const override
    {this->_remove(k, false);}
    
    virtual HypMapItem *_skipItem() const override;
    virtual HypMapItem *_missingItem() const override;
    
    virtual void _forEachItem(const std::function<void (HypMapItem &)>& itemFunc) const override;
    
    virtual void _displayMe() const override;

    template <typename T1, typename ...T2>
    HypMapItem  &operator()(const T1&firstKey, const T2&... secondKey) const;
    template <typename T>
    HypMapItem  &operator()(const T&) const;
    
protected:
    
    HypMapItem(const int &, const HypMapCore &);
    HypMapItem(const double &, const HypMapCore &, GeneralMemoryChunk *&);
    HypMapItem(const SuperString &, const HypMapCore &, GeneralMemoryChunk *&);
    HypMapItem(const ValueUnion *const &, const HypMapCore &, GeneralMemoryChunk *&);
    HypMapItem(const double &, const HypMapCore &, GeneralMemoryChunk *&, const StringManager*);
    HypMapItem(const SuperString &, const HypMapCore &, GeneralMemoryChunk *&, const StringManager*);
    HypMapItem(const ValueUnion *const &, const HypMapCore &, GeneralMemoryChunk *&, const StringManager*);

    SingleLock _lock;
    GeneralMemoryChunk *_chunk = nullptr;
    const HypMapCore &ownerMap;
    
    HypMapItem *_left = nullptr;
    HypMapItem *_right = nullptr;
    HypMapItem *_next = nullptr;
    HypMapItem *_previous = nullptr;
    mutable HypMapCore *_nextMap = nullptr;
    
    int _height = 1;

    virtual HypMapItem *headItem() const override;
    virtual HypMapItem *tailItem() const override;
    
    virtual inline HypMapItem *next() const
    {return this->_next;}
    
    virtual inline HypMapItem *previous() const
    {return this->_previous;}
    
    HypMapCore *nextMap() const;
    void returnMemory();
    void inOrderDispaly() const;
};

class HypMapCore {
    
    friend class NumHypMapItem;
    friend class StrHypMapItem;
    template <typename T> friend class PtrHypMapItem;
    friend class HypMapItem;
    friend class NumHypMap;
    friend class StrHypMap;
    template <typename T> friend class PtrHypMap;
    friend class HypMap;
    friend class SuperTable;
    friend class TXTSuperTable;
    friend class BlockCluster;
    friend class Block;
    friend class BlockResult;
    friend class OutputFolderNode;
    friend class OutputFolder;
    friend class OutputPageNode;
public:

    inline HypMapItem* skipItem() const {return &this->_skipItem;};

protected:
    
    HypMapCore(HypMap *, HypMapItem *const &, GeneralMemoryChunk *&);
    HypMapCore(HypMap *, HypMapItem *const &, const MissingMapKey &, const MissingMapKey &, const MissingMapKey &, GeneralMemoryChunk *&);
    
    HypMap *_rootMap = nullptr;
    const int level;
    
    HypMapItem &maximum () const;
    HypMapItem &minimum () const;
    
    HypMapItem *getItem(const double &, const bool &) const;
    HypMapItem *getItem(const SuperString &, const bool &) const;
    HypMapItem *getItem(const ValueUnion *const &, const bool &) const;
    //HypMapItem *getItem(const StringNode *const &, const bool &) const;
    
    inline HypMapItem *getItem(const double &key, const std::function<void (HypMapItem &, const bool &)>& newItemFunc) const {return this->getItem(key, newItemFunc,true);};
    inline HypMapItem *getItem(const SuperString &key, const std::function<void (HypMapItem &, const bool &)>& newItemFunc) const {return this->getItem(key, newItemFunc,true);};
    inline HypMapItem *getItem(const ValueUnion *const &key, const std::function<void (HypMapItem &, const bool &)>& newItemFunc) const {return this->getItem(key, newItemFunc,true);};
    //inline HypMapItem *getItem(const StringNode *const &key, const std::function<void (HypMapItem &, const bool &)>& newItemFunc) const {return this->getItem(key, newItemFunc,true);};
    HypMapItem *getItem(const double &, const std::function<void (HypMapItem &, const bool &)>&, const bool&) const;
    HypMapItem *getItem(const SuperString &, const std::function<void (HypMapItem &, const bool &)>&, const bool&) const;
    HypMapItem *getItem(const ValueUnion *const &, const std::function<void (HypMapItem &, const bool &)>&, const bool&) const;
    //HypMapItem *getItem(const StringNode *const &, const std::function<void (HypMapItem &, const bool &)>&, const bool&) const;    
    void inline remove (const double &key) const{this->remove(key,true);};
    void inline remove (const SuperString &key) const{this->remove(key,true);};
    void inline remove (const ValueUnion *const &key) const{this->remove(key,true);};
    void remove (const double &, bool) const;
    void remove (const SuperString &, bool) const;
    void remove (const ValueUnion *const &, bool) const;
    
    
    mutable HypMapItem *_upItem = nullptr;
    bool _skipMe = false;
    bool _autoAddMissing = false;
    bool _exactSearch = true;
    MissingMapKey _missingKey = MissingMapKey::WRONG;
    MissingMapKey _beforeFirst = MissingMapKey::WRONG;
    MissingMapKey _afterLast = MissingMapKey::WRONG;
    
    GeneralMemoryChunk *_chunk = nullptr;
    mutable long _size = 0;
    
    void returnMemory() const;
    void displayMap() const;
    void _remove() const;
    
private:
    
    mutable HypMapItem *_rootItem = nullptr;
    
    mutable HypMapItem *_maxItem = nullptr;
    mutable HypMapItem *_minItem = nullptr;
    mutable HypMapItem *_headItem = nullptr;
    mutable HypMapItem *_tailItem = nullptr;
    mutable HypMapItem _skipItem = HypMapItem(_OTHER_INDICATOR_SKIP, *this);
    mutable HypMapItem _missingItem = HypMapItem(_OTHER_INDICATOR_MISSING, *this);
    
    SuperLock _lock;
    
    inline int height(HypMapItem *const &item) const
    {return item ? item->_height : 0;}
    
    virtual HypMapItem *minimum(HypMapItem *) const;
    virtual HypMapItem *maximum(HypMapItem *) const;
    
    HypMapItem *leftRotation(HypMapItem *const &) const;
    HypMapItem *rightRotation(HypMapItem *const &) const;
    
    HypMapItem *rightLeftRotation(HypMapItem *const &item) const;
    HypMapItem *leftRightRotation(HypMapItem *const &item) const;
    
    void addItemToList(HypMapItem *&item) const;
    void removeItemFromList(HypMapItem *&item) const;
    
    void updateMapInfo(HypMapItem *const &item) const;
    
    HypMapItem *search(HypMapItem *&, const double &, HypMapItem *&, HypMapItem *&) const;
    HypMapItem *search(HypMapItem *&, const SuperString &, HypMapItem *&, HypMapItem *&) const;
    HypMapItem *search(HypMapItem *&, const ValueUnion *const &, HypMapItem *&, HypMapItem *&) const;
    //HypMapItem *search(HypMapItem *&, const StringNode *const &, HypMapItem *&, HypMapItem *&) const;
    
    HypMapItem *insert(HypMapItem *&, const double &, HypMapItem *&, bool &) const;
    HypMapItem *insert(HypMapItem *&, const SuperString &, HypMapItem *&, bool &) const;
    HypMapItem *insert(HypMapItem *&, const ValueUnion *const &, HypMapItem *&, bool &) const;
    //HypMapItem *insert(HypMapItem *&, const StringNode *const &, HypMapItem *&, bool &) const;
    
    HypMapItem *remove(HypMapItem *&, const double &) const;
    HypMapItem *remove(HypMapItem *&, const SuperString &) const;
    HypMapItem *remove(HypMapItem *&, const ValueUnion *const &) const;
};

class HypMap: public HypMapOperators {
    
    friend class HypMapItem;
    friend class HypMapCore;
    friend class Block;
    friend class BlockCluster;
    friend class TableBase;
    friend class QuickTable;
    friend class Tank;
    friend class RecordThread;
    friend class OutputPageNode;
    friend class OutputFolderNode;
    friend class OutputFolder;
    friend class BlockResult;
    friend class SuperTable;
    friend class DataRoll;
    friend class DataRollRecord;
    friend class VariableBase;
    
public:
    
    HypMap();
    HypMap(const int &);
    HypMap(RecordThread *);
    HypMap(RecordThread *, const int &);
    HypMap(HypMapCore *&);
    HypMap(GeneralMemoryChunk *&);
    HypMap(const int &, GeneralMemoryChunk *&);
    HypMap(RecordThread *, GeneralMemoryChunk *&);
    HypMap(RecordThread *, const int &, GeneralMemoryChunk *&);
    HypMap(HypMapCore *&, GeneralMemoryChunk *&);
    HypMap(const HypMap &);
    
    virtual inline bool _hasNext() const override
    {return true;}
    
    inline virtual double _getValue() const override
    {return HypMapOperators::_errorInteger;}
    
    inline virtual const SuperString& _getSuperString() const override
    {return HypMapOperators::_errorString;}
    
    inline virtual void *_getPointer() const override
    {return nullptr;}
    
    inline virtual void _setValue(const double &) const override { }
    inline virtual void _setString(const SuperString &) const override { }
    inline virtual void _setPointer(void *const &) const override { }
    
    inline bool forceExactSearch() const {return this->_forceExactSearch;};
    inline bool exactSearch() const {return this->_exactSearch;};
    
    inline void _turnOnForceExactSearch ()
    {this->_forceExactSearch = true;}
    
    inline void _turnOffForceExactSearch ()
    {this->_forceExactSearch = false;}
    
    inline void _turnOnBaseExactSearch()
    {this->_rootMap->_exactSearch = true;}
    
    void _turnOffBaseExactSearch();
    
    inline void _turnOnBaseAutoAddMissing()
    {this->_rootMap->_autoAddMissing = true;}
    
    inline void _turnOffBaseAutoAddMissing()
    {this->_rootMap->_autoAddMissing = false;}

    inline void _turnOffMultiThread()
    {this->_multiThread = false;}    

    inline MissingMapKey _baseMissingKey() const
    {return this->_rootMap->_missingKey;}
    
    inline MissingMapKey _baseBeforeFirst() const
    {return this->_rootMap->_beforeFirst;}
        
    inline MissingMapKey _baseAfterLast() const
    {return this->_rootMap->_afterLast;}
    
    inline void _setBaseMissingKey(const MissingMapKey &m) {
        this->_rootMap->_missingKey = m;
        this->_rootMap->_exactSearch = (this->_rootMap->_missingKey == MissingMapKey::WRONG && this->_rootMap->_beforeFirst == MissingMapKey::WRONG && this->_rootMap->_afterLast == MissingMapKey::WRONG);
    }
    
    inline void _setBaseBeforeFirst(const MissingMapKey &m) {
        this->_rootMap->_beforeFirst = m;
        this->_rootMap->_exactSearch = (this->_rootMap->_missingKey == MissingMapKey::WRONG && this->_rootMap->_beforeFirst == MissingMapKey::WRONG && this->_rootMap->_afterLast == MissingMapKey::WRONG);
    }
    
    inline void _setBaseAfterLast(const MissingMapKey &m) {
        this->_rootMap->_afterLast = m;
        this->_rootMap->_exactSearch = (this->_rootMap->_missingKey == MissingMapKey::WRONG && this->_rootMap->_beforeFirst == MissingMapKey::WRONG && this->_rootMap->_afterLast == MissingMapKey::WRONG);
    }
    
    virtual inline int _level() const override
    {return 0;}
    
    virtual inline void _turnOnExactSearch() override
    {this->_exactSearch = true;}
    
    virtual void _turnOffExactSearch() override;
    
    virtual inline void _turnOnAutoAddMissing() override
    {this->_autoAddMissing = true;}
    
    virtual inline void _turnOffAutoAddMissing() override
    {this->_autoAddMissing = false;}
    
    virtual inline long _size() const override
    {return this->_rootMap->_size;}
    
    virtual inline HypMapItem &operator [] (const double &key) const override
    {return *this->_rootMap->getItem(key, false);}
    
    virtual inline HypMapItem &operator [] (const SuperString &key) const override
    {return *this->_rootMap->getItem(key, false);}
       
    virtual inline HypMapItem &operator [] (const ValueUnion *const &key) const override
    {return *this->_rootMap->getItem(key, false);}
       
    
    virtual inline HypMapItem *_getItem(const double &key, const bool &create) const override
    {return this->_rootMap->getItem(key, create);}
    
    virtual inline HypMapItem *_getItem(const SuperString &key, const bool &create) const override
    {return this->_rootMap->getItem(key, create);}
       
    virtual inline HypMapItem *_getItem(const ValueUnion *const &key, const bool &create) const override
    {return this->_rootMap->getItem(key, create);}
    
    //virtual inline HypMapItem *_getItem(const StringNode *const &key, const bool &create) const override
    //{return this->_rootMap->getItem(key, create);}
    
    virtual inline HypMapItem *_getItem(const double &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return this->_rootMap->getItem(key, itemFunc);}
       
    virtual inline HypMapItem *_getItem(const SuperString &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return this->_rootMap->getItem(key, itemFunc);}
    
    virtual inline HypMapItem *_getItem(const ValueUnion *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return this->_rootMap->getItem(key, itemFunc);}
    
    //virtual inline HypMapItem *_getItem(const StringNode *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    //{return this->_rootMap->getItem(key, itemFunc);}

    virtual inline HypMapItem *_getItem(const double &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return this->_rootMap->getItem(key, itemFunc,contentCreate);}
       
    virtual inline HypMapItem *_getItem(const SuperString &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreat) const override
    {return this->_rootMap->getItem(key, itemFunc, contentCreat);}
    
    virtual inline HypMapItem *_getItem(const ValueUnion *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreat) const override
    {return this->_rootMap->getItem(key, itemFunc, contentCreat);}
    
    //virtual inline HypMapItem *_getItem(const StringNode *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreat) const override
    //{return this->_rootMap->getItem(key, itemFunc, contentCreat);}
    
    virtual inline void _setSkipValue(const double &v) const override { this->_rootMap->_skipItem._setValue(v);
        this->_rootMap->_skipMe = true;
    }
    
    virtual inline void _setSkipString(const SuperString &v) const override { this->_rootMap->_skipItem._setString(v);
        this->_rootMap->_skipMe = true;
    }
    
    virtual inline void _setSkipPointer(void *v) const override {
        this->_rootMap->_skipItem._setPointer(v);
        this->_rootMap->_skipMe = true;
    }
    
    virtual inline void _setMissingValue(const double &v) const override
    {this->_rootMap->_missingItem._setValue(v);}
    
    virtual inline void _setMissingString(const SuperString &v) const override
    {this->_rootMap->_missingItem._setString(v);}
    
    virtual inline void _setMissingPointer(void *v) const override
    {this->_rootMap->_missingItem._setPointer(v);}
    
    virtual inline double _getSkipValue() const override
    {return this->_rootMap->_skipItem._getValue();}
    
    virtual inline const SuperString &_getSkipString() const override
    {return this->_rootMap->_skipItem._getSuperString();}
       
    virtual inline void *_getSkipPointer() const override
    {return this->_rootMap->_skipItem._getPointer();}
       
    virtual inline double _getMissingValue() const override
    {return this->_rootMap->_missingItem._getValue();}
       
    virtual inline const SuperString &_getMissingString() const override
    {return this->_rootMap->_missingItem._getSuperString();}
    
    virtual inline void *_getMissingPointer() const override
    {return this->_rootMap->_missingItem._getPointer();}
    
    virtual inline void _setMissingKey(const MissingMapKey &m)override {
        this->_missingKey = m;
        this->_exactSearch = (this->_missingKey == MissingMapKey::WRONG && this->_beforeFirst == MissingMapKey::WRONG && this->_afterLast == MissingMapKey::WRONG);
    }
    
    virtual inline void _setBeforeFirst(const MissingMapKey &m) override {
        this->_beforeFirst = m;
        this->_exactSearch = (this->_missingKey == MissingMapKey::WRONG && this->_beforeFirst == MissingMapKey::WRONG && this->_afterLast == MissingMapKey::WRONG);
    }
    
    virtual inline void _setAfterLast(const MissingMapKey &m) override {
        this->_afterLast = m;
        this->_exactSearch = (this->_missingKey == MissingMapKey::WRONG && this->_beforeFirst == MissingMapKey::WRONG && this->_afterLast == MissingMapKey::WRONG);
    }
    
    void _remove() const;
    
    virtual inline void _remove (const double &key) const override
    {this->_rootMap->remove(key);}
    
    virtual inline void _remove (const SuperString &key) const override
    {this->_rootMap->remove(key);}
    
    virtual inline void _remove (const ValueUnion *const &key) const override
    {this->_rootMap->remove(key);}
    
    virtual inline void _remove (const double &key, bool removeUp) const
    {this->_rootMap->remove(key, removeUp);}
    
    virtual inline void _remove (const SuperString &key, bool removeUp) const
    {this->_rootMap->remove(key, removeUp);}
    
    virtual inline void _remove (const ValueUnion *const &key, bool removeUp) const
    {this->_rootMap->remove(key, removeUp);}
    
    virtual void _forEachItem(const std::function<void (HypMapItem &)>& itemFunc) const override;

    virtual inline HypMapItem *_maxItem() const
    {return &this->_rootMap->maximum();}

    virtual inline HypMapItem *_minItem() const
    {return &this->_rootMap->minimum();}

    virtual inline HypMapItem *_skipItem() const override
    {return &this->_rootMap->_skipItem;}
    
    virtual inline HypMapItem *_missingItem() const override
    {return &this->_rootMap->_missingItem;}
    
    void _clear();
    
    virtual inline void _displayMe() const override {
        
        std::cout << "display map: " << std::endl;
        
        if(this->_rootMap) {
            this->_rootMap->displayMap();
        }
        else {
            std::cout << "the map does not has a root." << std::endl;
        }
    }
    template <typename T1, typename ...T2>
    HypMapItem  &operator()(const T1&firstKey, const T2&... secondKey) const{
        try{
            HypMapItem  &nextItem = this->operator[](firstKey);
            return nextItem.operator()(secondKey...);
        }
        catch(GeneralException *e){

            if(this->_missingKey == MissingMapKey::MISSING){
                delete e;
                return this->_rootMap->_missingItem.operator()(firstKey, secondKey...);
            }
            throw e;
        }

    }
    template <typename T>
    inline HypMapItem  &operator()(const T&key) const{
        return this->operator[](key);
    }
    virtual inline HypMapItem *headItem() const override
    {return this->_rootMap->_headItem;}
    
    virtual inline HypMapItem *tailItem() const override
    {return this->_rootMap->_tailItem;}
    ~HypMap();
    
protected:
    
    HypMapCore *_rootMap = nullptr;
    bool _ownRoot = true;
    
    bool _multiThread = false;
    bool _multiThreadClosed = false;
    int _lockId = 0;
    bool _exactSearch = true;
    bool _autoAddMissing = false;
    bool _forceExactSearch = false;
    
    MissingMapKey _missingKey = MissingMapKey::WRONG;
    MissingMapKey _beforeFirst = MissingMapKey::WRONG;
    MissingMapKey _afterLast = MissingMapKey::WRONG;
    
    GeneralMemoryChunk *_chunk = nullptr;
    
    const GeneralMemoryManager *_hypMapCoreManager = nullptr;
    const GeneralMemoryManager *_hypMapItemManager = nullptr;
    const StringManager *_stringManager = nullptr;
    
    virtual HypMapItem *newItem(const double &, HypMapCore *);
    virtual HypMapItem *newItem(const SuperString &, HypMapCore *);
    virtual HypMapItem *newItem(const ValueUnion *const &, HypMapCore *);
    //virtual HypMapItem *newItem(const StringNode *const &, HypMapCore *);
    
    void _changeThread(RecordThread *const &);
    void _changeThread(RecordThread *const &, const StringManager* stringManager);
    void assignCore(HypMapCore *);
    void returnMemory() const;
    
private:
    
    void initialiseMap(const ThreadResourceManager *const &);
    void initialiseMap(const ThreadResourceManager *const &, const StringManager* stringManager);
};

class NumHypMapItem: public HypMapItem {
    
    friend class NumHypMap;
    
public:
    
    virtual inline const SuperString &_getSuperString() const override
    {throw new MapDataTypeError();}
    
    virtual inline void *_getPointer() const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setString(const SuperString &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setPointer(void *const &) const override
    {throw new MapDataTypeError();}
    
    virtual inline operator double () const override
    {return this->_getValue();}
    
    virtual inline HypMapItem &operator = (const SuperString &) override
    {throw new MapDataTypeError();}
    
    virtual inline HypMapItem &operator = (void *) override
    {throw new MapDataTypeError();}
    
    virtual inline NumHypMapItem &operator [] (const double &k) const override
    {return *this->_getItem(k, false);}
    
    virtual inline NumHypMapItem &operator [] (const SuperString &k) const override
    {return *this->_getItem(k, false);}
    
    virtual inline NumHypMapItem &operator [] (const ValueUnion *const &k) const override
    {return *this->_getItem(k, false);}
    
    virtual inline NumHypMapItem *_getItem(const double &k, const bool &create) const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::_getItem(k, create));}
    
    virtual inline NumHypMapItem *_getItem(const SuperString &k, const bool &create) const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::_getItem(k, create));}
    
    virtual inline NumHypMapItem *_getItem(const ValueUnion *const &k, const bool &create) const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::_getItem(k, create));}
    
    //virtual inline NumHypMapItem *_getItem(const StringNode *const &k, const bool &create) const override
    //{return static_cast<NumHypMapItem *>(this->HypMapItem::_getItem(k, create));}
    
    virtual inline NumHypMapItem *_getItem(const double &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc));}
    
    virtual inline NumHypMapItem *_getItem(const SuperString &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc));}
    
    virtual inline NumHypMapItem *_getItem(const ValueUnion *const &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc));}
    
    //virtual inline NumHypMapItem *_getItem(const StringNode *const &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    //{return static_cast<NumHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc));}

    virtual inline NumHypMapItem *_getItem(const double &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc,contentCreate));}
    
    virtual inline NumHypMapItem *_getItem(const SuperString &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc,contentCreate));}
    
    virtual inline NumHypMapItem *_getItem(const ValueUnion *const &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc,contentCreate));}
    
    //virtual inline NumHypMapItem *_getItem(const StringNode *const &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    //{return static_cast<NumHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc,contentCreate));}
    
    virtual inline void _setSkipString(const SuperString &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setSkipPointer(void *) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setMissingString(const SuperString &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setMissingPointer(void *) const override
    {throw new MapDataTypeError();}
    
    virtual inline const SuperString &_getSkipString() const override
    {throw new MapDataTypeError();}
    
    virtual inline void *_getSkipPointer() const override
    {throw new MapDataTypeError();}
    
    virtual inline const SuperString &_getMissingString() const override
    {throw new MapDataTypeError();}
    
    virtual inline void *_getMissingPointer() const override
    {throw new MapDataTypeError();}
    
    void _forEachItem(const std::function<void (const double &)>& valueFunc) const;
    
    virtual inline NumHypMapItem *_skipItem() const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::_skipItem());}
    
    virtual inline NumHypMapItem *_missingItem() const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::_missingItem());}
    
protected:
    
    NumHypMapItem(const int &, const HypMapCore &);
    NumHypMapItem(const double &, const HypMapCore &, GeneralMemoryChunk *&);
    NumHypMapItem(const SuperString &, const HypMapCore &, GeneralMemoryChunk *&);
    NumHypMapItem(const ValueUnion *const &, const HypMapCore &, GeneralMemoryChunk *&);
    
    virtual inline NumHypMapItem *headItem() const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::headItem());}
    
    virtual inline NumHypMapItem *tailItem() const override
    {return static_cast<NumHypMapItem *>(this->HypMapItem::tailItem());}
    
    virtual inline NumHypMapItem *next() const override
    {return static_cast<NumHypMapItem *>(this->_next);}
    
    virtual inline NumHypMapItem *previous() const override
    {return static_cast<NumHypMapItem *>(this->_previous);}
};

class NumHypMap: public HypMap {
    
public:
    
    NumHypMap();
    NumHypMap(const int &);
    NumHypMap(RecordThread *);
    NumHypMap(RecordThread *, const int &);
    NumHypMap(HypMapCore *&);
    NumHypMap(GeneralMemoryChunk *&);
    NumHypMap(const int &, GeneralMemoryChunk *&);
    NumHypMap(RecordThread *, GeneralMemoryChunk *&);
    NumHypMap(RecordThread *, const int &, GeneralMemoryChunk *&);
    NumHypMap(HypMapCore *&, GeneralMemoryChunk *&);
    NumHypMap(const NumHypMap &);
    
    virtual inline NumHypMapItem &operator [] (const double &key) const override
    {return *static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, false));}
    
    virtual inline NumHypMapItem &operator [] (const SuperString &key) const override
    {return *static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, false));}
       
    virtual inline NumHypMapItem &operator [] (const ValueUnion *const &key) const override
    {return *static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, false));}
    
    virtual inline NumHypMapItem *_getItem(const double &key, const bool &create) const override
    {return static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, create));}
    
    virtual inline NumHypMapItem *_getItem(const SuperString &key, const bool &create) const override
    {return static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, create));}
       
    virtual inline NumHypMapItem *_getItem(const ValueUnion *const &key, const bool &create) const override
    {return static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, create));}
    
    //virtual inline NumHypMapItem *_getItem(const StringNode *const &key, const bool &create) const override
    //{return static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, create));}
    
    virtual inline NumHypMapItem *_getItem(const double &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, itemFunc));}
       
    virtual inline NumHypMapItem *_getItem(const SuperString &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, itemFunc));}
    
    virtual inline NumHypMapItem *_getItem(const ValueUnion *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, itemFunc));}
    
    //virtual inline NumHypMapItem *_getItem(const StringNode *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    //{return static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, itemFunc));}

    virtual inline NumHypMapItem *_getItem(const double &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, itemFunc, contentCreate));}
       
    virtual inline NumHypMapItem *_getItem(const SuperString &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, itemFunc, contentCreate));}
    
    virtual inline NumHypMapItem *_getItem(const ValueUnion *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, itemFunc, contentCreate));}
    
    //virtual inline NumHypMapItem *_getItem(const StringNode *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    //{return static_cast<NumHypMapItem *>(this->_rootMap->getItem(key, itemFunc, contentCreate));}
    
    virtual inline void _setSkipString(const SuperString &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setSkipPointer(void *) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setMissingString(const SuperString &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setMissingPointer(void *) const override
    {throw new MapDataTypeError();}
    
    virtual inline const SuperString &_getSkipString() const override
    {throw new MapDataTypeError();}
       
    virtual inline void *_getSkipPointer() const override
    {throw new MapDataTypeError();}
       
    virtual inline const SuperString &_getMissingString() const override
    {throw new MapDataTypeError();}
    
    virtual inline void *_getMissingPointer() const override
    {throw new MapDataTypeError();}
    
    void _forEachItem(const std::function<void (const double &)>& valueFunc) const;
    
    virtual inline NumHypMapItem *_skipItem() const override
    {return static_cast<NumHypMapItem *>(&this->_rootMap->_skipItem);}
    
    virtual inline NumHypMapItem *_missingItem() const override
    {return static_cast<NumHypMapItem *>(&this->_rootMap->_missingItem);}
    
    ~NumHypMap();
    
protected:
    
    virtual NumHypMapItem *newItem(const double &, HypMapCore *) override;
    virtual NumHypMapItem *newItem(const SuperString &, HypMapCore *) override;
    virtual NumHypMapItem *newItem(const ValueUnion *const &, HypMapCore *) override;
    //virtual NumHypMapItem *newItem(const StringNode *const &, HypMapCore *) override;
    
    virtual inline NumHypMapItem *headItem() const override
    {return static_cast<NumHypMapItem *>(this->_rootMap->_headItem);}
    
    virtual inline NumHypMapItem *tailItem() const override
    {return static_cast<NumHypMapItem *>(this->_rootMap->_tailItem);}
};

class StrHypMapItem: public HypMapItem {
    
    friend class StrHypMap;
    
public:
    
    virtual inline double _getValue() const override
    {throw new MapDataTypeError();}
    
    virtual inline void *_getPointer() const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setValue(const double &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setPointer(void *const &) const override
    {throw new MapDataTypeError();}
    
    virtual inline operator const SuperString &() const override
    {return this->_getSuperString();}
    
    virtual inline HypMapItem &operator = (const double &) override
    {throw new MapDataTypeError();}
    
    virtual inline HypMapItem &operator = (void *) override
    {throw new MapDataTypeError();}
    
    virtual inline StrHypMapItem &operator [] (const double &k) const override
    {return *this->_getItem(k, false);}
    
    virtual inline StrHypMapItem &operator [] (const SuperString &k) const override
    {return *this->_getItem(k, false);}
    
    virtual inline StrHypMapItem &operator [] (const ValueUnion *const &k) const override
    {return *this->_getItem(k, false);}
    
    virtual inline StrHypMapItem *_getItem(const double &k, const bool &create) const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::_getItem(k, create));}
    
    virtual inline StrHypMapItem *_getItem(const SuperString &k, const bool &create) const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::_getItem(k, create));}
    
    virtual inline StrHypMapItem *_getItem(const ValueUnion *const &k, const bool &create) const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::_getItem(k, create));}
    
    //virtual inline StrHypMapItem *_getItem(const StringNode *const &k, const bool &create) const override
    //{return static_cast<StrHypMapItem *>(this->HypMapItem::_getItem(k, create));}
    
    virtual inline StrHypMapItem *_getItem(const double &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc));}
    
    virtual inline StrHypMapItem *_getItem(const SuperString &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc));}
    
    virtual inline StrHypMapItem *_getItem(const ValueUnion *const &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc));}
    
    //virtual inline StrHypMapItem *_getItem(const StringNode *const &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    //{return static_cast<StrHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc));}

    virtual inline StrHypMapItem *_getItem(const double &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc, contentCreate));}
    
    virtual inline StrHypMapItem *_getItem(const SuperString &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc, contentCreate));}
    
    virtual inline StrHypMapItem *_getItem(const ValueUnion *const &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc, contentCreate));}
    
    //virtual inline StrHypMapItem *_getItem(const StringNode *const &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    //{return static_cast<StrHypMapItem *>(this->HypMapItem::_getItem(k, itemFunc, contentCreate));}

    virtual inline void _setSkipValue(const double &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setSkipPointer(void *) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setMissingValue(const double &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setMissingPointer(void *) const override
    {throw new MapDataTypeError();}
    
    virtual inline const SuperString &_getSkipString() const override
    {throw new MapDataTypeError();}
    
    virtual inline void *_getSkipPointer() const override
    {throw new MapDataTypeError();}
    
    virtual inline const SuperString &_getMissingString() const override
    {throw new MapDataTypeError();}
    
    virtual inline void *_getMissingPointer() const override
    {throw new MapDataTypeError();}
    
    void _forEachItem(const std::function<void (const SuperString &)>& valueFunc) const;
    
    virtual inline StrHypMapItem *_skipItem() const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::_skipItem());}
    
    virtual inline StrHypMapItem *_missingItem() const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::_missingItem());}
    
protected:
    
    StrHypMapItem(const int &, const HypMapCore &);
    StrHypMapItem(const double &, const HypMapCore &, GeneralMemoryChunk *&);
    StrHypMapItem(const SuperString &, const HypMapCore &, GeneralMemoryChunk *&);
    StrHypMapItem(const ValueUnion *const &, const HypMapCore &, GeneralMemoryChunk *&);
    
    virtual inline StrHypMapItem *headItem() const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::headItem());}
    
    virtual inline StrHypMapItem *tailItem() const override
    {return static_cast<StrHypMapItem *>(this->HypMapItem::tailItem());}
    
    virtual inline StrHypMapItem *next() const override
    {return static_cast<StrHypMapItem *>(this->_next);}
    
    virtual inline StrHypMapItem *previous() const override
    {return static_cast<StrHypMapItem *>(this->_previous);}
};

class StrHypMap: public HypMap {
    
public:
    
    StrHypMap();
    StrHypMap(const int &);
    StrHypMap(RecordThread *);
    StrHypMap(RecordThread *, const int &);
    StrHypMap(HypMapCore *&);
    StrHypMap(GeneralMemoryChunk *&);
    StrHypMap(const int &, GeneralMemoryChunk *&);
    StrHypMap(RecordThread *, GeneralMemoryChunk *&);
    StrHypMap(RecordThread *, const int &, GeneralMemoryChunk *&);
    StrHypMap(HypMapCore *&, GeneralMemoryChunk *&);
    StrHypMap(const StrHypMap &);
    
    virtual inline StrHypMapItem &operator [] (const double &key) const override
    {return *static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, false));}
    
    virtual inline StrHypMapItem &operator [] (const SuperString &key) const override
    {return *static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, false));}
       
    virtual inline StrHypMapItem &operator [] (const ValueUnion *const &key) const override
    {return *static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, false));}
    
    virtual inline StrHypMapItem *_getItem(const double &key, const bool &create) const override
    {return static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, create));}
    
    virtual inline StrHypMapItem *_getItem(const SuperString &key, const bool &create) const override
    {return static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, create));}
       
    virtual inline StrHypMapItem *_getItem(const ValueUnion *const &key, const bool &create) const override
    {return static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, create));}
    
    //virtual inline StrHypMapItem *_getItem(const StringNode *const &key, const bool &create) const override
    //{return static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, create));}
    
    virtual inline StrHypMapItem *_getItem(const double &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, itemFunc));}
       
    virtual inline StrHypMapItem *_getItem(const SuperString &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, itemFunc));}
    
    virtual inline StrHypMapItem *_getItem(const ValueUnion *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, itemFunc));}
    
    //virtual inline StrHypMapItem *_getItem(const StringNode *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    //{return static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, itemFunc));}

    virtual inline StrHypMapItem *_getItem(const double &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, itemFunc, contentCreate));}
       
    virtual inline StrHypMapItem *_getItem(const SuperString &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, itemFunc, contentCreate));}
    
    virtual inline StrHypMapItem *_getItem(const ValueUnion *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, itemFunc, contentCreate));}
    
    //virtual inline StrHypMapItem *_getItem(const StringNode *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    //{return static_cast<StrHypMapItem *>(this->_rootMap->getItem(key, itemFunc, contentCreate));}
    
    virtual inline void _setSkipValue(const double &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setSkipPointer(void *) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setMissingValue(const double &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setMissingPointer(void *) const override
    {throw new MapDataTypeError();}
    
    virtual inline double _getSkipValue() const override
    {throw new MapDataTypeError();}
       
    virtual inline void *_getSkipPointer() const override
    {throw new MapDataTypeError();}
       
    virtual inline double _getMissingValue() const override
    {throw new MapDataTypeError();}
    
    virtual inline void *_getMissingPointer() const override
    {throw new MapDataTypeError();}
    
    void _forEachItem(const std::function<void (const SuperString &)>& valueFunc) const;
    
    virtual inline StrHypMapItem *_skipItem() const override
    {return static_cast<StrHypMapItem *>(&this->_rootMap->_skipItem);}
    
    virtual inline StrHypMapItem *_missingItem() const override
    {return static_cast<StrHypMapItem *>(&this->_rootMap->_missingItem);}
    
    ~StrHypMap();
    
protected:
    
    virtual StrHypMapItem *newItem(const double &, HypMapCore *) override;
    virtual StrHypMapItem *newItem(const SuperString &, HypMapCore *) override;
    virtual StrHypMapItem *newItem(const ValueUnion *const &, HypMapCore *) override;
    //virtual StrHypMapItem *newItem(const StringNode *const &, HypMapCore *) override;
    
    virtual inline StrHypMapItem *headItem() const override
    {return static_cast<StrHypMapItem *>(this->_rootMap->_headItem);}
    
    virtual inline StrHypMapItem *tailItem() const override
    {return static_cast<StrHypMapItem *>(this->_rootMap->_tailItem);}
};

template <typename T>
class PtrHypMapItem: public HypMapItem {
    
    template <typename K> friend class PtrHypMap;
    
public:
    
    virtual inline const SuperString &_getSuperString() const override
    {throw new MapDataTypeError();}
    
    virtual inline double _getValue() const override
    {throw new MapDataTypeError();}
    
    inline T *_getPointerWithType() const
    {return (T *)this->_getPointer();}
    
    virtual inline void _setString(const SuperString &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setValue(const double &) const override
    {throw new MapDataTypeError();}
    
    virtual inline operator void *() const override
    {return this->_getPointer();}
    
    inline T *operator -> () const
    {return (T *)this->_getPointer();}
    
    inline T &operator () () const
    {return *(T *)this->_getPointer();}
    
    virtual inline HypMapItem &operator = (const SuperString &) override
    {throw new MapDataTypeError();}
    
    virtual inline HypMapItem &operator = (const double &) override
    {throw new MapDataTypeError();}
    
    virtual inline PtrHypMapItem<T> &operator [] (const double &k) const override
    {return *this->_getItem(k, false);}
    
    virtual inline PtrHypMapItem<T> &operator [] (const SuperString &k) const override
    {return *this->_getItem(k, false);}
    
    virtual inline PtrHypMapItem<T> &operator [] (const ValueUnion *const &k) const override
    {return *this->_getItem(k, false);}
    
    virtual inline PtrHypMapItem<T> &operator [] (const char *k) const override
    {return static_cast<PtrHypMapItem<T> &>(this->HypMapItem::operator [](k));}
    
    virtual inline PtrHypMapItem<T> &operator [] (std::string k) const override
    {return static_cast<PtrHypMapItem<T> &>(this->HypMapItem::operator [](k));}
    
    virtual inline PtrHypMapItem<T> *_getItem(const double &k, const bool &create) const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_getItem(k, create));}
    
    virtual inline PtrHypMapItem<T> *_getItem(const SuperString &k, const bool &create) const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_getItem(k, create));}
    
    virtual inline PtrHypMapItem<T> *_getItem(const ValueUnion *const &k, const bool &create) const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_getItem(k, create));}
    
    //virtual inline PtrHypMapItem<T> *_getItem(const StringNode *const &k, const bool &create) const override
    //{return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_getItem(k, create));}
    
    virtual inline PtrHypMapItem<T> *_getItem(const double &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_getItem(k, itemFunc));}
    
    virtual inline PtrHypMapItem<T> *_getItem(const SuperString &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_getItem(k, itemFunc));}
    
    virtual inline PtrHypMapItem<T> *_getItem(const ValueUnion *const &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_getItem(k, itemFunc));}
    
    //virtual inline PtrHypMapItem<T> *_getItem(const StringNode *const &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    //{return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_getItem(k, itemFunc));}

    virtual inline PtrHypMapItem<T> *_getItem(const double &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_getItem(k, itemFunc, contentCreate));}
    
    virtual inline PtrHypMapItem<T> *_getItem(const SuperString &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_getItem(k, itemFunc, contentCreate));}
    
    virtual inline PtrHypMapItem<T> *_getItem(const ValueUnion *const &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_getItem(k, itemFunc, contentCreate));}
    
    //virtual inline PtrHypMapItem<T> *_getItem(const StringNode *const &k, const std::function<void (HypMapItem &, const bool &)>& itemFunc, const bool& contentCreate) const override
    //{return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_getItem(k, itemFunc, contentCreate));}
    
    virtual inline void _setSkipString(const SuperString &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setSkipValue(const double &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setMissingString(const SuperString &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setMissingValue(const double &) const override
    {throw new MapDataTypeError();}
    
    virtual inline const SuperString &_getSkipString() const override
    {throw new MapDataTypeError();}
    
    virtual inline double _getSkipValue() const override
    {throw new MapDataTypeError();}
    
    inline T *_getSkipPointerWithType() const
    {return (T *)this->HypMapItem::getSkipPointer();}
    
    virtual inline const SuperString &_getMissingString() const override
    {throw new MapDataTypeError();}
    
    virtual inline double _getMissingValue() const override
    {throw new MapDataTypeError();}
    
    inline T *_getMissingPointerWithType() const
    {return (T *)this->HypMapItem::getMissingPointer();}
    
    void _forEachItem(std::function<void (T *)> valueFunc) const;
    
    virtual inline PtrHypMapItem<T> *_skipItem() const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_skipItem());}
    
    virtual inline PtrHypMapItem<T> *_missingItem() const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::_missingItem());}
    
protected:
    
    PtrHypMapItem(const int &, const HypMapCore &);
    PtrHypMapItem(const double &, const HypMapCore &, GeneralMemoryChunk *&);
    PtrHypMapItem(const SuperString &, const HypMapCore &, GeneralMemoryChunk *&);
    PtrHypMapItem(const ValueUnion *const &, const HypMapCore &, GeneralMemoryChunk *&);
    
    virtual inline PtrHypMapItem<T> *headItem() const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::headItem());}
    
    virtual inline PtrHypMapItem<T> *tailItem() const override
    {return static_cast<PtrHypMapItem<T> *>(this->HypMapItem::tailItem());}
    
    virtual inline PtrHypMapItem<T> *next() const override
    {return static_cast<PtrHypMapItem<T> *>(this->_next);}
    
    virtual inline PtrHypMapItem<T> *previous() const override
    {return static_cast<PtrHypMapItem<T> *>(this->_previous);}
};

template <typename T>
class PtrHypMap: public HypMap {
    
public:
    
    PtrHypMap();
    PtrHypMap(const int &);
    PtrHypMap(RecordThread *);
    PtrHypMap(RecordThread *, const int &);
    PtrHypMap(HypMapCore *&);
    PtrHypMap(GeneralMemoryChunk *&);
    PtrHypMap(const int &, GeneralMemoryChunk *&);
    PtrHypMap(RecordThread *, GeneralMemoryChunk *&);
    PtrHypMap(RecordThread *, const int &, GeneralMemoryChunk *&);
    PtrHypMap(HypMapCore *&, GeneralMemoryChunk *&);
    PtrHypMap(const PtrHypMap<T> &);
    
    virtual inline PtrHypMapItem<T> &operator [] (const double &key) const override
    {return *static_cast<PtrHypMapItem<T> *>(this->_rootMap->getItem(key, false));}
    
    virtual inline PtrHypMapItem<T> &operator [] (const SuperString &key) const override
    {return *static_cast<PtrHypMapItem<T> *>(this->_rootMap->getItem(key, false));}
       
    virtual inline PtrHypMapItem<T> &operator [] (const ValueUnion *const &key) const override
    {return *static_cast<PtrHypMapItem<T> *>(this->_rootMap->getItem(key, false));}
       
    virtual inline PtrHypMapItem<T> &operator [] (const char *key) const override
    {return static_cast<PtrHypMapItem<T> &>(this->HypMap::operator [] (key));}
    
    virtual inline PtrHypMapItem<T> &operator [] (const std::string& key) const override
    {return static_cast<PtrHypMapItem<T> &>(this->HypMap::operator [] (key));}
    
    virtual inline PtrHypMapItem<T> *_getItem(const double &key, const bool &create) const override
    {return static_cast<PtrHypMapItem<T> *>(this->_rootMap->getItem(key, create));}
    
    virtual inline PtrHypMapItem<T> *_getItem(const SuperString &key, const bool &create) const override
    {return static_cast<PtrHypMapItem<T> *>(this->_rootMap->getItem(key, create));}
       
    virtual inline PtrHypMapItem<T> *_getItem(const ValueUnion *const &key, const bool &create) const override
    {return static_cast<PtrHypMapItem<T> *>(this->_rootMap->getItem(key, create));}
    
    //virtual inline PtrHypMapItem<T> *_getItem(const StringNode *const &key, const bool &create) const override
    //{return static_cast<PtrHypMapItem<T> *>(this->_rootMap->getItem(key, create));}
    
    virtual inline PtrHypMapItem<T> *_getItem(const double &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<PtrHypMapItem<T> *>(this->_rootMap->getItem(key, itemFunc));}
       
    virtual inline PtrHypMapItem<T> *_getItem(const SuperString &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<PtrHypMapItem<T> *>(this->_rootMap->getItem(key, itemFunc));}
    
    virtual inline PtrHypMapItem<T> *_getItem(const ValueUnion *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    {return static_cast<PtrHypMapItem<T> *>(this->_rootMap->getItem(key, itemFunc));}
    
    //virtual inline PtrHypMapItem<T> *_getItem(const StringNode *const &key, const std::function<void (HypMapItem &, const bool &)>& itemFunc) const override
    //{return static_cast<PtrHypMapItem<T> *>(this->_rootMap->getItem(key, itemFunc));}
    
    virtual inline void _setSkipString(const SuperString &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setSkipValue(const double &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setMissingString(const SuperString &) const override
    {throw new MapDataTypeError();}
    
    virtual inline void _setMissingValue(const double &) const override
    {throw new MapDataTypeError();}
    
    virtual inline const SuperString &_getSkipString() const override
    {throw new MapDataTypeError();}
    
    virtual inline double _getSkipValue() const override
    {throw new MapDataTypeError();}
    
    inline T *_getSkipPointerWithType() const
    {return (T *)this->HypMap::getSkipPointer();}
       
    virtual inline const SuperString &_getMissingString() const override
    {throw new MapDataTypeError();}
    
    virtual inline double _getMissingValue() const override
    {throw new MapDataTypeError();}
    
    inline T *_getMissingPointerWithType() const
    {return (T *)this->HypMap::getMissingPointer();}
    
    void _forEachItem(std::function<void (T *)> valueFunc) const;
    
    virtual inline PtrHypMapItem<T> *_skipItem() const override
    {return static_cast<PtrHypMapItem<T> *>(&this->_rootMap->_skipItem);}
    
    virtual inline PtrHypMapItem<T> *_missingItem() const override
    {return static_cast<PtrHypMapItem<T> *>(&this->_rootMap->_missingItem);}
    
    ~PtrHypMap();
    
protected:
    
    virtual PtrHypMapItem<T> *newItem(const double &, HypMapCore *) override;
    virtual PtrHypMapItem<T> *newItem(const SuperString &, HypMapCore *) override;
    virtual PtrHypMapItem<T> *newItem(const ValueUnion *const &, HypMapCore *) override;
    //virtual PtrHypMapItem<T> *newItem(const StringNode *const &, HypMapCore *) override;
    
    virtual inline PtrHypMapItem<T> *headItem() const override
    {return static_cast<PtrHypMapItem<T> *>(this->_rootMap->_headItem);}
    
    virtual inline PtrHypMapItem<T> *tailItem() const override
    {return static_cast<PtrHypMapItem<T> *>(this->_rootMap->_tailItem);}
    
};

std::ostream &operator << (std::ostream &, const HypMapItem &);

template <typename T1, typename ...T2>
HypMapItem& HypMapItem::operator ()(const T1&firstKey, const T2&... secondKey) const{
    try{
        const HypMapItem& nextItem = this->operator[](firstKey);
        return nextItem.operator()(secondKey...);
    }
    catch(GeneralException *e){
        if(this->key._getOtherIndicator() == _OTHER_INDICATOR_MISSING){
            throw e;
        }
        if(this->ownerMap._missingKey == MissingMapKey::MISSING ||this->ownerMap._rootMap->_missingKey == MissingMapKey::MISSING){
            delete e;
            return this->ownerMap._missingItem.operator()(firstKey,secondKey...);
        }
        throw e;
    }
}

template <typename T>
HypMapItem& HypMapItem::operator ()(const T& key) const{
    try{
        return this->operator[](key);
    }
    catch(GeneralException *e){
        if(this->key._getOtherIndicator() == _OTHER_INDICATOR_MISSING){
            throw e;
        }
        if(this->ownerMap._missingKey == MissingMapKey::MISSING ||this->ownerMap._rootMap->_missingKey == MissingMapKey::MISSING){
            delete e;
            return this->ownerMap._missingItem.operator[](key);
        }
        throw e;
    }
}

template <typename T>
PtrHypMapItem<T>::PtrHypMapItem(const int &otherInd, const HypMapCore &dMap):
HypMapItem(otherInd, dMap) { }

template <typename T>
PtrHypMapItem<T>::PtrHypMapItem(const double &k, const HypMapCore &dMap, GeneralMemoryChunk *&chunk):
HypMapItem(k, dMap, chunk) { }

template <typename T>
PtrHypMapItem<T>::PtrHypMapItem(const SuperString &k, const HypMapCore &dMap, GeneralMemoryChunk *&chunk):
HypMapItem(k, dMap, chunk) { }

template <typename T>
PtrHypMapItem<T>::PtrHypMapItem(const ValueUnion *const &k, const HypMapCore &dMap, GeneralMemoryChunk *&chunk):
HypMapItem(k, dMap, chunk) { }

template <typename T>
void PtrHypMapItem<T>::_forEachItem(std::function<void (T *)> valueFunc) const {
    
    if(this->_nextMap && this->_nextMap->_size > 0) {
        
        HypMapItem *itemWalk = this->_nextMap->_headItem;
        
        while(itemWalk) {
            
            valueFunc(itemWalk->_getPointer());
            itemWalk = itemWalk->_next;
        }
    }
}

template <typename T>
PtrHypMap<T>::PtrHypMap():
HypMap() { }

template <typename T>
PtrHypMap<T>::PtrHypMap(const int &lockId):
HypMap(lockId) { }

template <typename T>
PtrHypMap<T>::PtrHypMap(RecordThread *recordThread):
HypMap(recordThread) { }

template <typename T>
PtrHypMap<T>::PtrHypMap(RecordThread *recordThread, const int &lockId):
HypMap(recordThread, lockId){ }

template <typename T>
PtrHypMap<T>::PtrHypMap(GeneralMemoryChunk *&chunk):
HypMap(chunk){ }

template <typename T>
PtrHypMap<T>::PtrHypMap(const int &lockId, GeneralMemoryChunk *&chunk) :
HypMap(lockId, chunk) { }

template <typename T>
PtrHypMap<T>::PtrHypMap(RecordThread *recordThread, GeneralMemoryChunk *&chunk):
HypMap(recordThread, chunk) { }

template <typename T>
PtrHypMap<T>::PtrHypMap(RecordThread *recordThread, const int &lockId, GeneralMemoryChunk *&chunk):
HypMap(recordThread, lockId, chunk) { }

template <typename T>
PtrHypMap<T>::PtrHypMap(HypMapCore *&core):
HypMap(core) { }

template <typename T>
PtrHypMap<T>::PtrHypMap(HypMapCore *&core, GeneralMemoryChunk *&chunk):
HypMap(core, chunk) { }

template <typename T>
PtrHypMap<T>::PtrHypMap(const PtrHypMap<T> &target):
HypMap(target) { }

template <typename T>
PtrHypMapItem<T> *PtrHypMap<T>::newItem(const double &key, HypMapCore *core) {
    
    GeneralMemoryChunk *chunk = this->_hypMapItemManager->applyFreeChunk(nullptr);
    return new (chunk->_data) PtrHypMapItem<T>(key, *core, chunk);
}

template <typename T>
PtrHypMapItem<T> *PtrHypMap<T>::newItem(const SuperString &key, HypMapCore *core) {
    
    GeneralMemoryChunk *chunk = this->_hypMapItemManager->applyFreeChunk(nullptr);
    return new (chunk->_data) PtrHypMapItem<T>(key, *core, chunk);
}

template <typename T>
PtrHypMapItem<T> *PtrHypMap<T>::newItem(const ValueUnion *const &key, HypMapCore *core) {
    
    GeneralMemoryChunk *chunk = this->_hypMapItemManager->applyFreeChunk(nullptr);
    return new (chunk->_data) PtrHypMapItem<T>(key, *core, chunk);
}
/*
template <typename T>
PtrHypMapItem<T> *PtrHypMap<T>::newItem(const StringNode *const &key, HypMapCore *core) {
    
    GeneralMemoryChunk *chunk = this->_hypMapItemManager->applyFreeChunk(nullptr);
    return new (chunk->_data) PtrHypMapItem<T>(key->superString, *core, chunk);
}
*/
template <typename T>
void PtrHypMap<T>::_forEachItem(std::function<void (T *)> valueFunc) const {
    
    if(this->_rootMap->_size > 0) {
        
        HypMapItem *itemWalk = this->_rootMap->_headItem;
        
        while(itemWalk) {
            
            valueFunc((T *)itemWalk->_getPointer());
            itemWalk = itemWalk->_next;
        }
    }
}

template <typename T>
PtrHypMap<T>::~PtrHypMap() {
    this->returnMemory();
}

#endif /* SuperMap_20200728_hpp */
