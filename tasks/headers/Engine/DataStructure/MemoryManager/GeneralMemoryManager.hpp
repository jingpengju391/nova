//
//  GeneralMemoryManager.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2019/11/20.
//  Copyright © 2019 陈曦. All rights reserved.
//

#ifndef GeneralMemoryManager_hpp
#define GeneralMemoryManager_hpp

#include <stdio.h>
#include <iostream>
#include "Definitions.hpp"
#include "SuperLock.hpp"
#include <string.h>
class GeneralMemoryManager;
class GeneralMemoryPool;

class ChunkDataChangeListener {
  
    friend class GeneralMemoryPool;
    
protected:
    
    virtual void onDataChange(const ptrdiff_t&) const = 0;
};


class GeneralMemoryChunk{
    
    friend class GeneralMemoryPool;
    friend class GeneralMemoryManager;
    friend class PeriodSector;
    friend class OutputFolder;
    friend class OutputLine;
    friend class OutputPoint;
    friend class OutputPageNode;
    friend class BlockResult;
    friend class Navigator;
    friend class Block;
    friend class SeriesBase;
    friend class VariableBase;
    friend class IntegerVariableBase;
    friend class FloatVariableBase;
    friend class StringVariableBase;
    friend class SeriesBase;
    template <typename M> friend class BlockLink;
    friend class Beam;
    friend class HypMapCore;
    friend class HypMapItem;
    friend class HypMap;
    friend class NumHypMap;
    friend class StrHypMap;
    template <typename T> friend class PtrHypMap;
    friend class QuickTable;
    friend class TableBase;
    friend class TXTSuperTable;
    friend class OutputPageNode;
    friend class OutputFolderNode;
    friend class HypList;
    friend class Tank;
    friend class TankCell;
    friend class BlockCluster;
    friend class SuperTable;
    friend class StringManager;
    friend class DataRollRecord;
    friend class SuperTableResourceManager;
    friend class ExpressParser;                 //BC 20201206
    friend class Period;

public:
    
    inline GeneralMemoryPool *owner()
    {return this->_owner;}
    
    inline byte *data()
    {return this->_data;}
    
    bool returnMemory();            //BC 20201128
    
protected:
    
    GeneralMemoryChunk(GeneralMemoryPool *owner, byte *data, const void *);
    
    GeneralMemoryChunk *_next = nullptr;
    GeneralMemoryChunk *_previous = nullptr;
    
    byte *_data = nullptr;
    const void *_user = nullptr;
    bool _available = true;
    
private:
    
    GeneralMemoryPool *_owner = nullptr;
    GeneralMemoryChunk **_referer = nullptr;
    const ChunkDataChangeListener *_dataChangeListener = nullptr;
};

class GeneralMemoryPool{
    
    friend class GeneralMemoryChunk;
    friend class GeneralMemoryManager;
    friend class PeriodSector;
    friend class OutputFolderNode;
public:
    
    inline const GeneralMemoryManager *owner()
    {return this->_owner;}
    
    inline GeneralMemoryPool *next()
    {return this->_next;}
    
    inline GeneralMemoryPool *previous()
    {return this->_previous;}
    
protected:
    
    GeneralMemoryPool(const GeneralMemoryManager *, long);
    GeneralMemoryPool(const GeneralMemoryManager *);
    ~GeneralMemoryPool();
    
    unsigned char *applyNeverReturnChunk(long);
    GeneralMemoryChunk *applyNewChunk(const void *);
    GeneralMemoryChunk *applyNewChunk(long, const void *, bool, long &);
    GeneralMemoryChunk *applyNewChunk(long, long, bool, const void *);
    
    GeneralMemoryPool *_next = nullptr;
    GeneralMemoryPool *_previous = nullptr;
    
private:
    
    const GeneralMemoryManager *_owner = nullptr;
    
    void *_chunkPlace = nullptr;
    void *_dataPlace = nullptr;
    GeneralMemoryChunk **_chunks = nullptr;
    
    long _chunkLength = 0;
    long _appliedLength = 0;
    long _usedLength = 0;
    
    void swapData(GeneralMemoryChunk *, GeneralMemoryChunk *, bool);
};

class GeneralMemoryManager {
       
    friend class GeneralMemoryChunk;
    friend class GeneralMemoryPool;
    friend class PeriodSector;
    friend class ThreadResourceManager;
    friend class Block;
    friend class Beam;
    friend class Navigator;
    friend class OutputFolderNode;
    friend class StringManager;
public:
    
    GeneralMemoryManager(){};
    GeneralMemoryManager(bool);
    GeneralMemoryManager(long, size_t, long, long);
    GeneralMemoryManager(long, size_t, long, long, bool);
    GeneralMemoryManager(long, bool, bool);
    
    void *applyNeverReturnChunk(long) const;
    GeneralMemoryChunk *applyFreeChunk(const void *) const;
    GeneralMemoryChunk *applyFreeChunk(long, GeneralMemoryChunk *, bool) const;
    GeneralMemoryChunk *applyFreeChunk(long, const void *) const;
    
    void returnChunk(GeneralMemoryChunk *) const;
    
//protected:        //BC 20201209
private:
    
    mutable GeneralMemoryChunk *_availableHead = nullptr;
    mutable GeneralMemoryChunk *_availableTail = nullptr;
    mutable long _availableLength = 0;
    
    mutable GeneralMemoryPool *_poolHead = nullptr;
    mutable GeneralMemoryPool *_poolTail = nullptr;
    mutable long _poolLength = 0;
    
    inline void assignDataUnitSize(size_t dataUnitSize)
    {this->_dataUnitSize = dataUnitSize;}
    inline void assignInitialLength(size_t size)
    {this->_initialLength = size;}
    inline void assignReallocLength(size_t size)
    {this->_reallocLength = size;}

    void setMultiThread(bool);  //BC 20201110
    
//private:      //BC 20201209
        
    size_t _dataUnitSize = 0;
    
    long _initialLength = 0;
    long _reallocLength = 0;
    mutable long _appliedSize = 0;
    mutable long _usedSize = 0;
    long _managerId = 0;
    bool _multiThread = false;
    bool _applyPoolOneByOne = false;
    
    SingleLock _lock;
    byte _placeSingleLock[sizeof(SingleLock)];
};

#endif /* GeneralMemoryManager_hpp */
