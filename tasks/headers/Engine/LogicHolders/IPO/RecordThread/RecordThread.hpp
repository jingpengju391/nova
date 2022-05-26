//
//  RecordThread.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2018/1/15.
//  Copyright © 2018年 陈曦. All rights reserved.
//

#ifndef RecordThread_hpp
#define RecordThread_hpp

#include <stdio.h>
#include <thread>
#include <atomic>
#include <iostream>

#include "GeneralMemoryManager.hpp"
#include "QuickList.20200803.hpp"
#include "Target.hpp"
#include "DataRoll.hpp"
#include "Definitions.hpp"
#include "Functions.hpp"
#include "SuperMap.20200728.hpp"
#include "ChainPool.hpp"

class Beam;
class ThreadResourceManager;
class Block;
class SeriesBase;
class GeneralException;
class Navigator;
class BlockCluster;
class RecordThread;
class DataRollRecord;
class StringManager;
class VariableManager;
class SeriesChildManager;
class SuperTableResourceManager;
class SuperTableManager;
class BlockLinkManager;
class TXTSuperTable;

//_CODE_START_

class ThreadResourceManager{
    
    friend class SuperTableCellManager;
    friend class DataRollRecord;
    friend class Block;
    friend class Tank;
    friend class TankCell;
    friend class SeriesBase;
    friend class DataRoll;
    friend class TXTDataRoll;
    friend class Navigator;
    friend class BlockCluster;
    friend class Beam;
    friend class BlockFamily;
    friend class VariableManager;
    friend class TXTConverter;
    friend class SuperLock;
    friend class StaticStation;
    friend class NavigatorManager;
    friend class SuperTable;
    friend class SuperTableResourceManager;
    friend class TXTSuperTable;
    friend class SuperTableManager;
    friend class SuperTableCellList;
    friend class QuickTable;
    friend class SuperTableRow;
    friend class TableBase;
    friend class BlockResult;
    friend class OutputFolder;
    friend class OutputPage;
    friend class OutputLine;
    friend class OutputFolderNode;
    friend class OutputPageNode;
    friend class BlockLinkManager;
    friend class Target;
    friend class VariableBase;
    friend class RecordThread;
    friend class IntegerVariableBase;
    friend class FloatVariableBase;
    friend class StringVariableBase;
    friend class LinkBase;
    template <typename M> friend class BlockLink;
    friend class HypMap;
    friend class HypList;
    friend class ResultSector;
    friend class PeriodSector;
    friend class Period;
    friend class ExpressParser;             //BC 20201206
    //friend class AssumptionLoader;
    
//protected:            //BC 20201209
private:
    
    ThreadResourceManager(RecordThread *);
    
    GeneralMemoryManager _blockClusterManager = GeneralMemoryManager(_MEM_ID_BLOCK_CLUSTER, 0, _INITIAL_BLOCK_CLUSTER_LENGTH, _REALLOC_BLOCK_CLUSTER_LENGTH, true);
    GeneralMemoryManager _seriesCopyChildManager = GeneralMemoryManager(_MEM_ID_SERIES_COPY, 0, _INITIAL_SERIES_CHUNK_LENGTH, _REALLOC_SERIES_CHUNK_LENGTH, true);
    GeneralMemoryManager _seriesDeepChildManager = GeneralMemoryManager(_MEM_ID_SERIES_DEEP, 0, _INITIAL_SERIES_CHUNK_LENGTH, _REALLOC_SERIES_CHUNK_LENGTH, true);
    GeneralMemoryManager _stringVariableChildManager = GeneralMemoryManager(_MEM_ID_STRING_VARIABLE, 0, _INITIAL_VARIABLE_LENGTH, _REALLOC_VARIABLE_LENGTH, true);
    GeneralMemoryManager _floatVariableChildManager = GeneralMemoryManager(_MEM_ID_FLOAT_VARIABLE, 0, _INITIAL_VARIABLE_LENGTH, _REALLOC_VARIABLE_LENGTH, true);
    GeneralMemoryManager _integerVariableChildManager = GeneralMemoryManager(_MEM_ID_INTEGER_VARIABLE, 0, _INITIAL_VARIABLE_LENGTH, _REALLOC_VARIABLE_LENGTH, true);
    GeneralMemoryManager _linkChildManager = GeneralMemoryManager(_MEM_ID_BLOCK_LINK, 0, _INITIAL_BLOCK_LINK_LENGTH, _REALLOC_BLOCK_LINK_LENGTH, true);
    GeneralMemoryManager _tableChildManager = GeneralMemoryManager(_MEM_ID_TABLE_VAR, 0, _INITIAL_TABLE_VAR_LENGTH, _REALLOC_TABLE_VAR_LENGTH, true);
    GeneralMemoryManager _blockResultManager = GeneralMemoryManager(_MEM_ID_BLOCK_RESULT, 0, _INITIAL_NAVI_RESULT_PANEL_CHUNK_LENGTH, _REALLOC_NAVI_RESULT_PANEL_CHUNK_LENGTH, true);
    GeneralMemoryManager _hypMapItemManager = GeneralMemoryManager(_MEM_ID_SUPER_MAP_ITEM, 0, _INITIAL_SUPER_MAP_ITEM_LENGTH, _REALLOC_SUPER_MAP_ITEM_LENGTH, true);
    GeneralMemoryManager _hypMapCoreManager = GeneralMemoryManager(_MEM_ID_SUPER_MAP_CORE, 0, _INITIAL_SUPER_MAP_CORE_LENGTH, _REALLOC_SUPER_MAP_CORE_LENGTH, true);
    GeneralMemoryManager _hypMapManager = GeneralMemoryManager(_MEM_ID_SUPER_MAP, 0, _INITIAL_SUPER_MAP_LENGTH, _REALLOC_SUPER_MAP_LENGTH, true);
    GeneralMemoryManager _hypMapItemManagerMultiThread = GeneralMemoryManager(_MEM_ID_SUPER_MAP_ITEM, 0, _INITIAL_SUPER_MAP_ITEM_LENGTH, _REALLOC_SUPER_MAP_ITEM_LENGTH, true);
    GeneralMemoryManager _hypMapCoreManagerMultiThread = GeneralMemoryManager(_MEM_ID_SUPER_MAP_CORE, 0, _INITIAL_SUPER_MAP_CORE_LENGTH, _REALLOC_SUPER_MAP_CORE_LENGTH, true);
    GeneralMemoryManager _hypMapManagerMultiThread = GeneralMemoryManager(_MEM_ID_SUPER_MAP, 0, _INITIAL_SUPER_MAP_LENGTH, _REALLOC_SUPER_MAP_LENGTH, true);
    GeneralMemoryManager _superTableManager = GeneralMemoryManager(_MEM_ID_SUPER_TABLE, 0, _INITIAL_TABLE_LENGTH, _REALLOC_TABLE_LENGTH, true);
    GeneralMemoryManager _largeTXTRowManager = GeneralMemoryManager(_MEM_ID_LONG_TXT_ROW, (_LARGE_TEMP_STRING_CHUNK_SIZE) * sizeof(char), _REALLOC_TEMP_STRING_CHUNK_LENGTH, _REALLOC_TEMP_STRING_CHUNK_LENGTH, true);
    GeneralMemoryManager _longTXTRowManager = GeneralMemoryManager(_MEM_ID_LONG_TXT_ROW, (_LONG_TEMP_STRING_CHUNK_SIZE) * sizeof(char), _INITIAL_TEMP_STRING_CHUNK_LENGTH, _REALLOC_TEMP_STRING_CHUNK_LENGTH, true);
    GeneralMemoryManager _shortTXTRowManager = GeneralMemoryManager(_MEM_ID_SHORT_TXT_ROW, (_SHORT_TEMP_STRING_CHUNK_SIZE) * sizeof(char), _INITIAL_TEMP_STRING_CHUNK_LENGTH, _REALLOC_TEMP_STRING_CHUNK_LENGTH, true);
    GeneralMemoryManager _miniTXTRowManager = GeneralMemoryManager(_MEM_ID_SHORT_TXT_ROW, (_MINI_TEMP_STRING_CHUNK_SIZE) * sizeof(char), _INITIAL_TEMP_STRING_CHUNK_LENGTH, _REALLOC_TEMP_STRING_CHUNK_LENGTH, true);
    GeneralMemoryManager _listCoreManager = GeneralMemoryManager(_MEM_ID_LIST_CORE, 0, _INITIAL_LIST_CORE_LENGTH, _REALLOC_LIST_CORE_LENGTH, true);
    GeneralMemoryManager _listCoreManagerMultiThread = GeneralMemoryManager(_MEM_ID_LIST_CORE, 0, _INITIAL_LIST_CORE_LENGTH, _REALLOC_LIST_CORE_LENGTH, true);
    GeneralMemoryManager _superTableRowManager = GeneralMemoryManager(_MEM_ID_QUICK_LIST, 0, _INITIAL_QUICK_LIST_LENGTH, _REALLOC_QUICK_LIST_LENGTH, true);
    GeneralMemoryManager _tankCellManager = GeneralMemoryManager(_MEM_ID_VALUE_UNION, 0, _INITIAL_VALUE_UNIT_CHUNK_LENGTH, _REALLOC_VALUE_UNIT_CHUNK_LENGTH, true);
    GeneralMemoryManager _tankManager = GeneralMemoryManager(_MEM_ID_TANK, 0, _INITIAL_TANK_CHUNK_LENGTH, _REALLOC_TANK_CHUNK_LENGTH, true);
    GeneralMemoryManager _navigatorManager = GeneralMemoryManager(_MEM_ID_NAVIGATOR, 0, _INITIAL_NAVIGATOR_LENGTH, _REALLOC_NAVIGATOR_LENGTH, true);
    GeneralMemoryManager _resultSectorContentManager = GeneralMemoryManager(_MEM_ID_RESULT_SECTOR_CONTENT, 0, _INITIAL_PERIOD_SECTOR_LENGTH, _REALLOC_PERIOD_SECTOR_LENGTH, true);
    GeneralMemoryManager _periodSectorContentManager = GeneralMemoryManager(_MEM_ID_PERIOD_SECTOR_CONTENT, 0, _INITIAL_PERIOD_SECTOR_LENGTH, _REALLOC_PERIOD_SECTOR_LENGTH, true);
    GeneralMemoryManager _periodSectorWithResultManager = GeneralMemoryManager(_MEM_ID_PERIOD_SECTOR, 0, _INITIAL_PERIOD_SECTOR_LENGTH, _REALLOC_PERIOD_SECTOR_LENGTH, true);
    GeneralMemoryManager _periodSectorDockManager = GeneralMemoryManager(_MEM_ID_PERIOD_DOCK_SECTOR, 0, _INITIAL_PERIOD_SECTOR_LENGTH, _REALLOC_PERIOD_SECTOR_LENGTH, true);
    GeneralMemoryManager _periodSectorDockResultManager = GeneralMemoryManager(_MEM_ID_PERIOD_DOCK_SECTOR, true, true);
    GeneralMemoryManager _resultSectorManager = GeneralMemoryManager(_MEM_ID_RESULT_SECTOR, 0, _INITIAL_PERIOD_SECTOR_LENGTH, _REALLOC_PERIOD_SECTOR_LENGTH, true);
    GeneralMemoryManager _resultDockSectorManager = GeneralMemoryManager(_MEM_ID_RESULT_SECTOR, 0, _INITIAL_PERIOD_SECTOR_LENGTH, _REALLOC_PERIOD_SECTOR_LENGTH, true);
    GeneralMemoryManager _resultRebaseSectorManager = GeneralMemoryManager(_MEM_ID_RESULT_REBASE_SECTOR, 0, _INITIAL_RESULT_REBASE_SECTOR_LENGTH, _REALLOC_RESULT_REBASE_SECTOR_LENGTH, true);
    // GeneralMemoryManager _neverReturnChunkManager = GeneralMemoryManager(true);
    GeneralMemoryManager _expressNodeManager = GeneralMemoryManager(_MEM_ID_EXPRESS_NODE, 0, _INITIAL_EXPRESS_NODE_LENGTH, _REALLOC_EXPRESS_NODE_LENGTH, true);            //BC 20201206
    //GeneralMemoryManager _variableIterationManager = GeneralMemoryManager(_MEM_ID_VARIABLE_ITERATION, sizeof(double), _INITIAL_VARIABLE_ITERATION_LENGTH, _REALLOC_VARIABLE_ITERATION_LENGTH, false);    
    GeneralMemoryManager _periodSectorIterationContentManager = GeneralMemoryManager(_MEM_ID_PERIOD_SECTOR_ITERATION, 0, _INITIAL_PERIOD_SECTOR_ITERATION_LENGTH, _REALLOC_PERIOD_SECTOR_ITERATION_LENGTH, true);
    GeneralMemoryManager _periodSectorIterationManager = GeneralMemoryManager(_MEM_ID_PERIOD_SECTOR_CONTENT_ITERATION, 0, _INITIAL_PERIOD_SECTOR_ITERATION_LENGTH, _REALLOC_PERIOD_SECTOR_ITERATION_LENGTH, true);
    GeneralMemoryManager _variableIterationManager = GeneralMemoryManager(_MEM_ID_VARIABLE_ITERATION, 0, _INITIAL_VARIABLE_ITERATION_LENGTH, _REALLOC_VARIABLE_ITERATION_LENGTH, true);
    GeneralMemoryManager _dataRollRecordManager = GeneralMemoryManager(_MEM_ID_DATA_RECORD_ID, 0, 128, 128, true);
    GeneralMemoryManager _dataRollManager = GeneralMemoryManager(_MEM_ID_DATA_ROLL_ID, 0, 32, 32, true);
//private:          //BC 20201209
    StringManager _stringManager = StringManager(true);
    StringManager _stringManagerMultiThread = StringManager(true);
    mutable RecordThread *_myThread = nullptr;
};

class RecordThread: public ChainPool{
    
    friend class RecordThread;
    friend class Beam;
    friend class Block;
    friend class Period;
    friend class PeriodPack;
    friend class SeriesBase;
    friend class BlockCluster;
    friend class BlockFamily;
    friend class TXTSuperTable;
    friend class Target;
    friend class OutputFolder;
    friend class OutputPageNode;
    friend class HypMap;
    friend class Navigator;
    friend class SuperTable;
    friend class HypList;
    friend class GeneralMemoryManager;
    friend class GeneralException;
    friend class FloatVariableBase;
    friend class IntegerVariableBase;
    friend class VariableBase;
    friend class LinkBase;
    friend class TableBase;
    //friend class AssumptionLoader;
    
public:                   //BC 20201126
    inline int id() const {return this->_id;};
    inline std::string prodCode() const {return this->_prodCode;};
    inline std::string modelCode() const {return this->_modelCode;};
    //class ThreadStackMonitor;
    
//protected:                //BC 20201204
private:

    RecordThread(Beam *, int);

    Beam *_owner = nullptr;
#if defined(__DEBUG_MODE) || defined(_SYSTEM_IS_MAC) || defined(_FORCE_STACKING_THREADS)
    int _currentStackHeight = 0;
#endif
    std::thread *_runningThread = nullptr;

    ThreadResourceManager _threadResourceManager = ThreadResourceManager(this);
    HypMap _entryBlocks;
    HypMap _entryFamilies;
    
    long long _completeRecords = 0;
    long long _skippedRecords = 0;
    DataRollRecord *_currentRecord = nullptr;
    /*
    const Block *_usedBlockHead = nullptr;                  //BC 20201205
    const Block *_usedBlockTail = nullptr;                  //BC 20201205
    const Block *_bigChildBlockHead = nullptr;            //BC 20201204
    const Block *_bigChildBlockTail = nullptr;            //BC 20201204
    */
    GeneralException *_exception = nullptr;
    
    int _usedBlockLength = 0;
    
    void startThread();
    void getReady();
    //void registerUsedBlock(Block *const &);           //BC 20201205
    
//private:              //BC 20201204
    
    int _id = -1;
    
    Target *_seriesTargets = nullptr;
    long _seriesTargetSize = 0;
    Target *_variableTargets = nullptr;
    long _variableTargetSize = 0;
    long _entryBlockSize = 0;
    void runData(const bool&);
    void runRecord(DataRollRecord *const &);
    
    long long _nextReportMP = 0;

    bool _allowIterationWhenCircularReference = false;
    bool _circularReferenceMode = false;
    mutable bool _iterationEnd = true;
    long _maxIteration = 10000;
    double _iterationThreshold = 10e-7;

    HypList _iterationVariableChain;
    HypList _iterationSeriesChain;
    long _seriesIterationLength = 0;
    long _variableIterationLength = 0;
    const int _calculationChainLimit;
    long _stepFrom = 0;
    long _stepTo = 0;
    const bool _useInnerLoop;
    const bool _useOuterLoop;
    bool _hasNextInnerLoop;
    bool _hasNextOuterLoop;
    DataRoll* _dataRoll = nullptr;
    
    bool nextLoop();
    std::default_random_engine randomGenerator;
    mutable long _seed = 0;
    std::string _prodCode;
    std::string _modelCode;
    void _updateProdCode();
    void _updateRootBlock();
    // bool _runnedOneRecord = false;
    //AssumptionLoader* _assumptionVariablesLoaders = nullptr;
    //AssumptionLoader* _assumptionLinksLoaders = nullptr;
    
};

//_CODE_END_

#endif /* RecordThread_hpp */
