//
//  Link.02020718.hpp
//  jinShaJiang
//
//  Created by 陈曦 on 2020/7/18.
//  Copyright © 2020 陈曦. All rights reserved.
//

#ifndef Link_20200718_hpp
#define Link_20200718_hpp

#include <stdio.h>

#include "Switcher.20200803.hpp"
#include "SuperLock.hpp"           //BC 20201126
#include "SuperMap.20200728.hpp"
#include "QuickList.20200803.hpp"
#include "ChainPool.hpp"
#include "GeneralMemoryManager.hpp"

class Block;
class Beam;
class Navigator;
class BlockFamily;

const int SIZE_OF_CLUSTER_SECTOR = (int)(sizeof(void *) + sizeof(bool) + sizeof(double) + sizeof(SuperString));
const int SIZE_OF_CLUSTER_LIST = SIZE_OF_CLUSTER_SECTOR * _INDEX_CHAIN_LENGTH;

class BlockCluster {
    
    friend class Navigator;
    friend class Block;
    friend class Beam;
    friend class BlockResult;
    friend class RecordThread;
    friend class SeriesBase;
    friend class OutputPageNode;
    friend class OutputLine;
    friend class VariableBase;
    friend class IntegerVariableBase;
    friend class FloatVariableBase;
    friend class StringVariableBase;
    template <typename M> friend class BlockLink;
    friend class LinkBase;
    
public:
    
    const SuperString &blockName;
    const SuperString &tankName;
    const int threadId;
    const int resourceId;

    inline operator const Block &()
    {return *this->defaultBlock();}
    
    inline const Block *operator -> ()
    {return this->defaultBlock();}
    
    inline Block *getBlock()
    {return this->defaultBlock();}
    
    template <typename... T>
    inline Block *getBlock(T... variables) {
        
        
        int listLen = sizeof...(variables);
        unsigned char **listPos = this->_listPos;
        if(listLen != this->_listLen){
            this->_listLen = listLen;
            if(listPos){
                free(listPos);
                listPos = (unsigned char **)safe_malloc(sizeof(void*) * (listLen));
            }
            else{
                listPos = (unsigned char **)safe_malloc(sizeof(void*) * (listLen ));
            }
            this->_listPos = listPos;
            
        }
        unsigned char **listWalk = listPos;
        //std::cout<<(bool *)listPos<<std::endl;
        this->generateClusterList(listWalk, listLen, variables...);
        Block *retBlock = this->findBlock(listPos, listLen);
        unsigned char ** p = (unsigned char**) listPos;
        for(int i = 0 ; i < listLen; ++i){
            unsigned char* currPos = *p;
            currPos += sizeof(void *);
            if(!*(bool *)currPos) {
                currPos += (sizeof(bool) + sizeof(double));
                ((SuperString*)currPos)->_clear();
            }
            
            free(*p);
            ++p;
        }
        
        
        return retBlock;
    }
    
    template <typename... T>
    inline const Block &operator () (T... seps)
    {return *this->getBlock(seps...);}
    
private:
    
    BlockCluster(Navigator *, const SuperString &, const int &, const int&);
    
    Tank *_tank = nullptr;
    Navigator *_owner = nullptr;
    ThreadResourceManager *_threadResourceManager = nullptr;
    
    HypMap _blocks = HypMap(nullptr);
    
    bool _isStatic = false;
    bool _resultShared = false;
    unsigned char *_sigatureVariables = nullptr;
    int _signatureLength = 0;
    int _listLen = 0;
    unsigned char ** _listPos = nullptr;
    
    HypList _clusterVariables = HypList(nullptr, nullptr, nullptr);
    
    Block *defaultBlock();
    Block *findBlock(unsigned char **&, const int &);
    
    template <typename ...T>
    inline void generateClusterList(unsigned char **&sepList, int &listLen, unsigned char *&firstSet, T&... restSets) {
        
        this->generateClusterList(sepList, listLen, firstSet);
        this->generateClusterList(sepList, listLen, restSets...);
    }
    
    inline void generateClusterList(unsigned char **&sepList, int &listLen, unsigned char *&vSet) {
       (*sepList++) = vSet;
    }
    mutable long _totalBlock;
};

class BlockResult: public ChainPoolNode{
    
    friend class Block;
    friend class Navigator;
    friend class NavigatorManager;
    friend class ChainPool;
    friend class OutputPageNode;
    friend class OutputLine;
    friend class Beam;
    friend class SeriesBase;
    
public:
    
    enum Status{
        UNSPECIFIED         = 0,
        AVAILABLE           = 1,
        ACHIVED             = 2,
    };
    
protected:
    
    BlockResult(const Block *, GeneralMemoryChunk *&);
    
    Navigator *_owner = nullptr;
    PeriodSector *_resultSectorHead = nullptr;
    PeriodSector *_resultSectorTail = nullptr;
    HypList _variables = HypList(_LOCKER_ID_BLOCK_RESULT_VARIABLE);
    HypList _tables = HypList(_LOCKER_ID_BLOCK_RESULT_TABLE);           //BC 20201205
    bool _variablesLoaded = false;
    
    Status _status = Status::UNSPECIFIED;
    std::atomic<int> _outputLinks;
    
    virtual void _archive() override;
    inline virtual void _truncate() override {this->returnMemory();};
    void readArchive(const Block *const &);
    
    void returnMemory();
    
private:

    SingleLock _lock = SingleLock(_LOCKER_ID_BLOCK_RESULT);
    
    GeneralMemoryChunk *_chunk = nullptr;
    std::string _archiveName;
    
    PeriodSector *newResultDockSector(const long &, const Block *const &) const;
    PeriodSector *newResultDockSector(const Block *const &, PeriodSector *const &) const;
    void loadResultsFromBlock(const Block *const &);
    void loadCalcualtedVariables(const Block *const &);
    ValueUnion key;
    const HypMapCore* _map = nullptr;
};

class Navigator {
    
    friend class Beam;
    friend class Block;
    friend class NavigatorManager;
    friend class BlockCluster;
    friend class BlockFamily;
    friend class BlockResult;
    friend class ChainPool;
    friend class RecordThread;
    friend class IntegerVariableBase;
    friend class FloatVariableBase;
    friend class StringVariableBase;
    template <typename M> friend class BlockLink;
    friend class SeriesBase;
    friend class LinkBase;
    
public:
    
    const SuperString &blockName;
    
    inline void addChild(Navigator *navigator)
    {this->_familyTree._getItem(navigator->blockName, true)->_setPointer(navigator);}
    
protected:
    
    Navigator(Beam *, const SuperString &, size_t, Block *(*)(const BlockCluster *const &, const Block *const &, const bool &, const long &, GeneralMemoryChunk *const &));
    
    Beam *_owner = nullptr;
    Navigator *_parent = nullptr;
    const TankIterator *_sharingPlan = nullptr;
    const TankIterator *_staticBlocks = nullptr;
    //const TankIterator *_muteSeries = nullptr;        //BC 20201113
    const TankIterator *_blockSettings = nullptr;       //BC 20201113
    const TankIterator *_variableSettings = nullptr;    //BC 20201113
    const TankIterator *_seriesSettings = nullptr;      //BC 20201113
    const TankIterator *_linkSettings = nullptr;        //BC 20201113
    
    HypMap *_blockClusters = /*(HypMap *)this->_posClusters*/nullptr;           //BC 20201125
    HypMap _blockResults = HypMap(_LOCKER_ID_NAVI_BLOCK_RESULT_MAP);
    
    GeneralMemoryManager _blockManager;
    Tank _defaultValues;
    Tank _defaultLinks;
    bool _defaultValueLoaded = false;
    Tank _assumptionValues;
    Tank _assumptionLinks;
    bool _prodBlock = false;
    
    BlockFamily *_blockFamilies = /*(BlockFamily *)this->_posBlockFamilies*/nullptr;            //20201125
    HypMap _familyTree;
    
    BlockCluster *findBlockCluster(const SuperString &, const int &);
    Block *generateChild(const Block *const &, const bool &, const long &);
    
private:
    
    Block *(*_blockFunc)(const BlockCluster *const &, const Block *const &, const bool &, const long &, GeneralMemoryChunk *const &) = nullptr;
    
    SingleLock _lockResult = SingleLock(_LOCKER_ID_NAVI_BLOCK_RESULT);
    //unsigned char _posClusters[_DEFAULT_MULTI_THREAD_CAPACITY * sizeof(HypMap)];      //BC 20201125
    //unsigned char _posBlockFamilies[_DEFAULT_MULTI_THREAD_CAPACITY * _SIZE_OF_BLOCK_FAMILY];      //BC 20201125
    void initialiseBlockSettings();
    const size_t _blockSize;
};

class BlockFamily{
    
    friend class Beam;
    friend class Navigator;
    friend class RecordThread;
    template<typename M> friend class BlockLink;
    
public:
    
    const int threadId;
    
    BlockCluster &operator () (const SuperString &blockName, const SuperString &tankName);
    inline BlockCluster &operator () (const SuperString &tankName) {
        return *this->_navigator->findBlockCluster(tankName, this->threadId);
    }
    
protected:
    
    BlockFamily(const int &, Navigator *);
    
    const HypMap &_familyTree = nullptr;
    Navigator *_navigator = nullptr;
    int _prodBlock = 0;
};

class LinkBase {
    
    friend class Block;
    friend class IllegalConvertError;
    friend class GeneralException;
    friend class Navigator;
    friend class Target;
    friend class OutputPageNode;
    friend class AssumptionLoader;
    template <typename M> friend class BlockLink;
    
public:
    
    enum Source{
        UNSPECIFIED                     = 0,
        CALCULATED                      = 1,
        DEFAULT                         = 2,
        ASSUMPTION                      = 3,
        CHILD                           = 4,
        TO_DEFINE                       = 5,
        TRANSMIT                        = 6,
    };
    
    const Block *const _owner;                              //BC 20201209
    const LinkBase *const _ownerLink;                       //BC 20201209
    const LinkBase *const _baseLink;                        //BC 20201209
    const SuperString &_linkName;
    const long _copyId;
    const long _level;
    const SystemConstant::ItemType _itemType;              //BC 20201206
    
    inline const SuperString &_linkage() const
    {return this->_linkageStr;}
    
    bool _hasValue() const;
    const Block *_setTarget(const Block *target) const;
    long _linkSize() const;
    int _removeValue();     //SC
    /*inline int _removeValue()
    {return this->_removeChildValue() + (this->_hasV ? (this->_linkSource == LinkBase::Source::CALCULATED ? ((this->_targetBlock = nullptr ) == nullptr) + (this->_hasV = false) - 1 : (this->_linkSource == LinkBase::Source::DEFAULT || this->_linkSource == LinkBase::Source::ASSUMPTION ? 0 : (this->_baseLink->_linkSource == LinkBase::Source::CALCULATED ? ((this->_targetBlock = nullptr) == nullptr) + (this->_hasV = false) - 1 : 0))) : this->_throwUndefinedMe()) + (this->_hasCopySize = false);}//senna update
    *///senna update
    inline operator const Block &() const
    {return *this->_getTarget();}
    
    inline const Block *operator -> () const
    {return this->_getTarget();}
    

    
    inline long _linkUsedSize() const                   //BC 20201113
    {return this->_maxCopy;}
    
    virtual LinkBase &operator [] (const long &) const = 0;
    const Block &operator () (const long &) const;

    inline const Block *_getTarget() const
    {return this->_hasV ? this->_targetBlock : (this->_targetBlock ? this->_assignRecordToTarget(this->_targetBlock) : this->_getCalculatedTarget());}
    
    bool _setRebaseTime(const long&, bool) const;
    inline bool _setRebaseTime(const long& rebaseTime) const{ return this->_setRebaseTime(rebaseTime, true);};
    const Block *_rebasePeer() const;
    
protected:
    
    LinkBase(const Block *, const SuperString &, const SystemConstant::ItemType &, const Source &, const long &, const long &, const LinkBase *const &, const LinkBase *const &);              //BC 20201206
    
    Source _linkSource = LinkBase::Source::UNSPECIFIED;
    mutable bool _hasV = false;
    ConstFormulaHolder<const Block &, BlockFamily &, const LinkBase &> _blockFunc;
    SuperString _linkageStr;
    mutable const TankIterator *_tankForChild = nullptr;
    mutable const Block *_targetBlock = nullptr;
    
    bool _allowManualResize = false;        //BC 20201113
    /*int*/long _defaultCopySize = 0;       //BC 20201113
    ConstFormulaHolder</*int*/long, const LinkBase &> _copySizeFunc;        //BC 20201113
    bool _useCopySizeFunc = false;       //BC 20201204
    bool _hasCopySizeFunc = false;
    mutable long _maxCopy = 0;
    mutable int _copyLoopControl = 0;
    mutable int _loopControl = 0;
    
    GeneralMemoryChunk *_chunk = nullptr;
    bool _isTargetLink = false;
    
    const Block *_assignRecordToTarget(const Block *) const;
    virtual void _returnMemory() = 0;
    
    virtual LinkBase *_getCopy(const long &) const = 0;
    virtual void _resize(const /*int*/long &) const = 0;            //BC 20201113
    virtual const Block *_getCalculatedTarget() const = 0;
    virtual void _removeChildValue() = 0;
    
    const Block *_matchBlockCopy(const Block *) const;
    const TankIterator &_getAssumptionTank() const;
    
private:
    
    long _getCopySize(const LinkBase &link) const;
    
    /*int*/long _copySize() const;                  //BC 20201113
    mutable /*int*/long _copySizeValue = 0;         //BC 20201113
    mutable bool _hasCopySize = false;
    
    mutable const Block *_peerBlock = nullptr;
    mutable const Block *_baseBlock = nullptr;
    

    int _throwUndefinedMe() const;
    bool _matchCopyPos = false;

    const TankIterator* _assumptionTank = nullptr;
    mutable long _rebaseTime = 0;
    mutable long _rebasePolicyTime = 0;
    //mutable bool _rebaseTimeChanged = false;
    mutable bool _settingRebase = false;
    //mutable OutputPageNode* _outputPageNode = nullptr;
};

template <typename M>
class BlockLink: public LinkBase {
    
public:
    
    class CopyDataChanger: public ChunkDataChangeListener {
        
        friend class PeriodSector;
        template <typename N> friend class BlockLink;
        
    protected:
        
        virtual void onDataChange(const ptrdiff_t &) const override;
        
    private:
        
        BlockLink<M> *_owner = nullptr;
    };
    
    template <typename B>
    BlockLink(const B *const &, const SuperString &, const Block &(B::*)(BlockFamily &, const LinkBase &) const);
    template <typename B>
    BlockLink(const B *const &, const SuperString &, const long &, const Block &(B::*)(BlockFamily &, const LinkBase &) const);
    template <typename B>
    BlockLink(const B *const &, const SuperString &, long (B::*)(const LinkBase &) const, const Block &(B::*)(BlockFamily &, const LinkBase &) const);
    BlockLink(const Block *const &, const SuperString &, const SuperString &, const LinkBase::Source &);
    BlockLink(const Block *const &, const SuperString &, const long &, const SuperString &, const LinkBase::Source &);
    template <typename B>
    BlockLink(const B *const &, const SuperString &, long (B::*)(const LinkBase &) const, const SuperString &, const LinkBase::Source &);
    BlockLink(const Block *const &, const SuperString &);
    
    virtual BlockLink &operator [] (const long &copy) const override {
        
        this->_throwUndefinedMe();
        return *this->_getCopy(copy);
    }
    inline const M* _getTarget() const
    {return static_cast<const M *>(this->LinkBase::_getTarget());}    

    inline operator const M &() const
    {return *static_cast<const M *>(this->LinkBase::_getTarget());}
    
    inline operator const M *() const
    {return static_cast<const M *>(this->LinkBase::_getTarget());}
    
    inline const M *operator -> () const
    {return static_cast<const M *>(this->LinkBase::_getTarget());}
    
    inline const M &operator () (const long &copy) const
    {return *static_cast<const M *>(this->LinkBase::_getTarget()->_getCopy(copy));}
    
    inline const M *_rebasePeer() const                //BC 20201205
    {return static_cast<const M *>(this->LinkBase::_rebasePeer());}

    template <typename B>
    void _convertToCalculated(const Block &(B::*blockFunc)(BlockFamily &, const LinkBase &) const) {
        
        //if(this->_linkSource == LinkBase::Source::TO_DEFINE) {        //BC 20201204
        
            this->_linkSource = LinkBase::Source::CALCULATED;
            this->_blockFunc.getFormula(this->_owner, blockFunc);
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    void _convertToCalculated(const Block &(B::*blockFunc)(BlockFamily &, const LinkBase &) const, const long &defaultCopySize) {
        
        //if(this->_linkSource == LinkBase::Source::TO_DEFINE) {        //BC 20201204
        
            this->_linkSource = LinkBase::Source::CALCULATED;
            this->_blockFunc.getFormula(this->_owner, blockFunc);
            this->_defaultCopySize = defaultCopySize;
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    void _convertToCalculated(const Block &(B::*blockFunc)(BlockFamily &, const LinkBase &) const, long (B::*copySizeFunc)(const VariableBase &)) {
        
        //if(this->_linkSource == LinkBase::Source::TO_DEFINE) {        //BC 20201204
        
            this->_linkSource = LinkBase::Source::CALCULATED;
            this->_blockFunc.getFormula(this->_owner, blockFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;                  //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    
    template <typename B>
    void _convertToDefault(const SuperString &linkage, long (B::*copySizeFunc)(const VariableBase &)) {
        
        //if(this->_linkSource == LinkBase::Source::TO_DEFINE) {        //BC 20201204
        
            this->_linkSource = LinkBase::Source::DEFAULT;
           this->_linkageStr = linkage;
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;                  //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    void _convertToAssumption(const SuperString &linkage, long (B::*copySizeFunc)(const VariableBase &)) {
        
        //if(this->_linkSource == LinkBase::Source::TO_DEFINE) {            //BC 20201204
        
            this->_linkSource = LinkBase::Source::ASSUMPTION;
           this->_linkageStr = linkage;
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);//sc
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;                  //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    void _convertToDefault(const SuperString &linkage) {
        
        //if(this->_linkSource == LinkBase::Source::TO_DEFINE) {        //BC 20201204
        
            this->_linkSource = LinkBase::Source::DEFAULT;
           this->_linkageStr = linkage;
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    void _convertToDefault(const SuperString &linkage, const long &defaultCopySize) {
        
        //if(this->_linkSource == LinkBase::Source::TO_DEFINE) {        //BC 20201204
        
            this->_linkSource = LinkBase::Source::DEFAULT;
           this->_linkageStr = linkage;
            this->_defaultCopySize = defaultCopySize;
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    void _convertToAssumption(const SuperString &linkage) {
        
        //if(this->_linkSource == LinkBase::Source::TO_DEFINE) {        //BC 20201204
        
            this->_linkSource = LinkBase::Source::ASSUMPTION;
           this->_linkageStr = linkage;
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    void _convertToAssumption(const SuperString &linkage, const long &defaultCopySize) {
        
        //if(this->_linkSource == LinkBase::Source::TO_DEFINE) {        //BC 20201204
        
            this->_linkSource = LinkBase::Source::ASSUMPTION;
           this->_linkageStr = linkage;
            this->_defaultCopySize = defaultCopySize;
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    //BC 20201113
    inline void _extendCopySize(const long &size) const {

        if(this->_linkSource != LinkBase::Source::TO_DEFINE && this->_allowManualResize) {

            if(size > 0) {
                if(this->_hasCopySize) {
                    if(size > this->_copySizeValue) {

                        this->_copySizeValue = size;
                        this->_resize(size);
                    }
                }
                else {

                    this->_hasCopySize = true;
                    this->_copySizeValue = size;
                    this->_resize(size);
                }
            }
            
            return;
        }

        throw new IllegalResizeCopyError(this);
    }
    
protected:
    
    BlockLink(const LinkBase *const &, const long &, GeneralMemoryChunk *&);
    
    mutable BlockLink<M> *_copyChildren = nullptr;
    mutable long _copyLength = 0;
    unsigned char _copyDataChanger[sizeof(CopyDataChanger)];
    
    virtual void _returnMemory() override;
    
    BlockLink<M> *_getCopy(const long &copy) const override {
        
        if(copy < 0 || copy >= this->_copySize()/*(copy > this->_copySize() && this->_copySize() >= 0)*/){
            throw new LinkOverBound(this, copy, this->_copySizeValue);
        }
            
        this->_maxCopy = this->_maxCopy > copy ? this->_maxCopy : copy + 1;
        //this->_resize(copy + 1);          //BC 20201113

        return this->_copyChildren + copy;
    }
    
    inline virtual void _removeChildValue() override {
        
        
        
        if(this->_maxCopy > 0) {

            BlockLink<M> *childWalk = this->_copyChildren;

            for(int i = 0; i < this->_maxCopy; ++i, ++childWalk) {
                childWalk->_removeValue();
            }
        }
        
        this->_maxCopy = 0;
        this->_hasCopySize = false;
        
        return ;
    }
    
    virtual void _resize(const long &) const override;
    const Block *_getTarget(const LinkBase &) const;
    virtual const Block *_getCalculatedTarget() const override;
    const Block *_getBlockFromTank(const TankIterator &) const;
    const Block *_getBlockFromSettings(const TankIterator &) const;
};

template <typename M>
template <typename B>
BlockLink<M>::BlockLink(const B *const &oBlock, const SuperString &lName, const Block &(B::*blockFunc)(BlockFamily &, const LinkBase &) const):
LinkBase(oBlock, lName, SystemConstant::ItemType::BASE, LinkBase::Source::CALCULATED, 0, 0, nullptr, nullptr) {              //BC 20201206
    
    (new (this->_copyDataChanger) CopyDataChanger())->_owner = this;
    this->_blockFunc.getFormula(this->_owner, blockFunc);
}

template <typename M>
template <typename B>
BlockLink<M>::BlockLink(const B *const &oBlock, const SuperString &lName, const long &defaultCopySize, const Block &(B::*blockFunc)(BlockFamily &, const LinkBase &) const):
LinkBase(oBlock, lName, SystemConstant::ItemType::BASE, LinkBase::Source::CALCULATED, 0, 0, nullptr, nullptr) {              //BC 20201206
    
    (new (this->_copyDataChanger) CopyDataChanger())->_owner = this;
    this->_blockFunc.getFormula(this->owner, blockFunc);
    this->_defaultCopySize = defaultCopySize;
}

template <typename M>
template <typename B>
BlockLink<M>::BlockLink(const B *const &oBlock, const SuperString &lName, long (B::*copySizeFunc)(const LinkBase &) const, const Block &(B::*blockFunc)(BlockFamily &, const LinkBase &) const):
LinkBase(oBlock, lName, SystemConstant::ItemType::BASE, LinkBase::Source::CALCULATED, 0, 0, nullptr, nullptr) {              //BC 20201206
    
    (new (this->_copyDataChanger) CopyDataChanger())->_owner = this;
    this->_blockFunc.getFormula(this->owner, blockFunc);
    this->_copySizeFunc.getFormula(this->owner, copySizeFunc);
    this->_hasCopySizeFunc = true;
    this->_useCopySizeFunc = true;                  //BC 20201204
}

template <typename M>
BlockLink<M>::BlockLink(const Block *const &oBlock, const SuperString &lName, const SuperString &linkage, const LinkBase::Source &source):
LinkBase(oBlock, lName, SystemConstant::ItemType::BASE, source, 0, 0, nullptr, nullptr) {              //BC 20201206
    
    (new (this->_copyDataChanger) CopyDataChanger())->_owner = this;
   this->_linkageStr = linkage;
}

template <typename M>
BlockLink<M>::BlockLink(const Block *const &oBlock, const SuperString &lName, const long &defaultCopySize, const SuperString &linkage, const LinkBase::Source &source):
LinkBase(oBlock, lName, SystemConstant::ItemType::BASE, source, 0, 0, nullptr, nullptr) {              //BC 20201206
    
    (new (this->_copyDataChanger) CopyDataChanger())->_owner = this;
   this->_linkageStr = linkage;
    this->_defaultCopySize = defaultCopySize;
}

template <typename M>
template <typename B>
BlockLink<M>::BlockLink(const B *const &oBlock, const SuperString &lName, long (B::*copySizeFunc)(const LinkBase &) const, const SuperString &linkage, const LinkBase::Source &source):
LinkBase(oBlock, lName, SystemConstant::ItemType::BASE, source, 0, 0, nullptr, nullptr) {              //BC 20201206
    
    (new (this->_copyDataChanger) CopyDataChanger())->_owner = this;
   this->_linkageStr = linkage;
    this->_copySizeFunc.getFormula(this->owner, copySizeFunc);
    this->_hasCopySizeFunc = true;
    this->_useCopySizeFunc = true;                  //BC 20201204
}

template <typename M>
BlockLink<M>::BlockLink(const LinkBase *const &oLink, const long &copy, GeneralMemoryChunk *&chunk):
LinkBase(oLink->_owner, oLink->_linkName, SystemConstant::ItemType::COPY, LinkBase::Source::CHILD, oLink->_level + 1, copy, oLink, oLink->_baseLink){              //BC 20201206
    
    (new (this->_copyDataChanger) CopyDataChanger())->_owner = this;
    this->_chunk = chunk;
}

template <typename M>
BlockLink<M>::BlockLink(const Block *const &oBlock, const SuperString &lName):
LinkBase(oBlock, lName, SystemConstant::ItemType::BASE, LinkBase::Source::TO_DEFINE, 0, 0, nullptr, nullptr) {              //BC 20201206
    
    (new (this->_copyDataChanger) CopyDataChanger())->_owner = this;
}

template <typename M>
void BlockLink<M>::_resize(const long &size) const {
    
    long &orgSize = this->_copyLength;
    
    if(size > orgSize) {
        
        if(orgSize) {
            
            GeneralMemoryChunk *chunk = this->_owner->_threadResourceManager->_linkChildManager.applyFreeChunk(size - orgSize, (this->_copyChildren + this->_copyLength - 1)->_chunk, false);
            
            for(long i = orgSize; i < size; ++i, chunk = chunk->_next) {
                new (chunk->_data) BlockLink<M>(this, i, chunk);
            }
        }
        else {
            
            GeneralMemoryChunk *chunk = this->_owner->_threadResourceManager->_linkChildManager.applyFreeChunk(size, this);
            
            for(long i = 0; i < size; ++i, chunk = chunk->_next) {
                
                if(i == 0) {
                    
                    this->_copyChildren = new (chunk->_data) BlockLink<M>(this, i, chunk);
                    chunk->_dataChangeListener = (ChunkDataChangeListener *)this->_copyDataChanger;
                }
                else {
                    new (chunk->_data) BlockLink<M>(this, i, chunk);
                }
            }
        }
        
        orgSize = size;
    }
}

template <typename M>
const Block *BlockLink<M>::_getCalculatedTarget() const {
    
    if(this->_linkSource == LinkBase::Source::CALCULATED) {
        if(this->_loopControl){
            this->_loopControl = 0;
            throw new CircularReferenceError(this, SystemConstant::ItemType::BASE);
        }
        try {

            
            this->_loopControl = 1;
            const Block * block = &this->_blockFunc.calculateWithFormula(M::PROFILE._navigator->_blockFamilies[this->_owner->_threadId], *this);
            this->_loopControl = 0;
            if(this->_matchCopyPos)
                block = this->_matchBlockCopy(block);
            return this->_setTarget(block);
        }
        catch (GeneralException *e) {
            this->_loopControl = 0;
            e->appendSource(this, SystemConstant::ItemType::BASE);              //BC 20201206
            throw e;
        }
        catch(std::bad_alloc e){
            GeneralException* e1 = new GeneralException("memory alloc error! ");
            e1->appendSource(this, SystemConstant::ItemType::BASE);
            throw e1;
        }
    }
    
    if(this->_linkSource == LinkBase::Source::DEFAULT) {
        
        try {
            return this->_getBlockFromTank(this->_owner->_cluster->_owner->_defaultLinks[this->_linkageStr]);
        }
        catch (GeneralException *e) {
                        
            delete e;
            throw new DefaultValueError(this);
        }
        catch(std::bad_alloc e){
            GeneralException* e1 = new GeneralException("memory alloc error! ");
            e1->appendSource(this, SystemConstant::ItemType::BASE);
            throw e1;
        }
    }
    if(this->_linkSource == LinkBase::Source::TRANSMIT) {
        
        try {
            const TankIterator &blockSetting = (*this->_owner->_cluster->_owner->_linkSettings)[this->_linkageStr];
            return this->_getBlockFromSettings(blockSetting);
        }
        catch (GeneralException *e) {
                        
            delete e;
            throw new LinkPassError(this);
        }
        catch(std::bad_alloc e){
            GeneralException* e1 = new GeneralException("memory alloc error! ");
            e1->appendSource(this, SystemConstant::ItemType::BASE);
            throw e1;
        }
    }   
    if(this->_linkSource == LinkBase::Source::ASSUMPTION) {
        
        try {
            return this->_getBlockFromTank(this->_getAssumptionTank());
        }
        catch (GeneralException *e) {
                        
            delete e;
            throw new AssumptionValueError(this);
        }
        catch(std::bad_alloc e){
            GeneralException* e1 = new GeneralException("memory alloc error! ");
            e1->appendSource(this, SystemConstant::ItemType::BASE);
            throw e1;
        }
    }
    
    if(this->_linkSource == LinkBase::Source::CHILD) {
        return static_cast<const BlockLink<M> *>(this->_ownerLink)->_getTarget(*this);
    }
    
    throw new ItemNotDefinedError(this);
}

template <typename M>
const Block *BlockLink<M>::_getTarget(const LinkBase &link) const {
    
    if(this->_linkSource == LinkBase::Source::CALCULATED) {
        try {
            const Block * block =  &this->_blockFunc.calculateWithFormula(M::PROFILE._navigator->_blockFamilies[this->_owner->_threadId], link);
            if(this->_matchCopyPos)
                block = this->_matchBlockCopy(block);
            return block;
        }
        catch (GeneralException *e) {
            e->appendSource(&link, SystemConstant::ItemType::BASE);              //BC 20201206
            throw e;
        }
    }
    
    if(this->_linkSource == LinkBase::Source::DEFAULT || this->_linkSource == LinkBase::Source::ASSUMPTION) {
    
        if(!link._ownerLink->_hasV) {
            link._ownerLink->_getTarget();
        }
        
        const TankIterator *linkTank = link._ownerLink->_tankForChild;
        
        if(!linkTank) {
            throw new AssumptionValueError(&link);
        }
        
        try {
            return this->_getBlockFromTank(linkTank[this->_copyId]);
        }
        catch(GeneralException *e) {
        
            delete e;
            throw new AssumptionValueError(&link);
        }
    }
    
    throw new ItemNotDefinedError(this);
}

template <typename M>
void BlockLink<M>::_returnMemory() {

    this->_throwUndefinedMe();
    
    long childSize = this->_copyLength;

    for(int i = 0; i < childSize; ++i) {
        this->_copyChildren[i]._returnMemory();
    }
    
    if(this->_linkSource == LinkBase::Source::CHILD) {
        this->_chunk->returnMemory();
    }
    this->_linkageStr.returnMemory();
}

template <typename M>
void BlockLink<M>::CopyDataChanger::onDataChange(const ptrdiff_t &posChange) const {
    
    this->_owner->_copyChildren = (BlockLink<M> *)(((unsigned char *)this->_owner->_copyChildren) + posChange);
    
    BlockLink<M> *linkWalk = this->_owner->_copyChildren;
    long childLength = this->_owner->_copyLength;
    
    for(long i = 0; i < childLength; ++i, ++linkWalk) {
        
        if(linkWalk->_copyChildren) {
            linkWalk->_copyChildren->_chunk->_dataChangeListener = (CopyDataChanger *)linkWalk->_copyDataChanger;
        }
    }
}

#endif /* Link_20200718_hpp */
