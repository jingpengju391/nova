//
//  Output.20200702.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2020/07/02.
//  Copyright © 2020年 陈曦. All rights reserved.
//

#ifndef Output_20200702_hpp
#define Output_20200702_hpp

//_CODE_START_

#include <stdio.h>
#include <atomic>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <iomanip>

#include "Definitions.hpp"
#include "GeneralMemoryManager.hpp"
#include "SuperMap.20200728.hpp"
#include "ChainPool.hpp"

class BlockResult;
class OutputFolder;
class OutputFolderNode;
class OutputPage;
class OutputPageNode;


class OutputPoint {

    friend class OutputFolder;
    friend class OutputPageNode;
    friend class VariableBase;
    friend class Block;
    friend class Beam;

private:

    OutputPoint(OutputPageNode *const &, GeneralMemoryChunk *const &);

    VariableBase **_variable = nullptr;


    OutputPageNode *_copyPageNode = nullptr;
    OutputPageNode *_deepPageNode = nullptr;
    OutputPoint *_next = nullptr;
    
    GeneralMemoryChunk *_chunk = nullptr;
    OutputPageNode *_owner = nullptr;
    void bindVariable(VariableBase *const &, bool, int threadID, OutputPoint*);
    SingleLock _lock = SingleLock(_LOCKER_ID_OUTPUT_FOLDER_LOADER);
    void returnMemory();
    ValueUnion _value;
    std::string generateCopyNames(const std::string&);
    std::string generateCopyNames(const std::string&, const long& id);
};
class OutputLine {

    friend class OutputFolder;
    friend class OutputPageNode;
    friend class SeriesBase;
    friend class Block;
    friend class Beam;

private:

    OutputLine(OutputPageNode *const &, GeneralMemoryChunk *const &);

    SeriesBase **_series = nullptr;
    PeriodSector *_outputSectorHead = nullptr;

    //bool _safeRelease = true;

    OutputPageNode *_copyPageNode = nullptr;
    OutputPageNode *_deepPageNode = nullptr;
    OutputLine *_next = nullptr;
    
    GeneralMemoryChunk *_chunk = nullptr;
    OutputPageNode *_owner = nullptr;
    void bindSeries(SeriesBase *const &, bool, int threadID, OutputLine*);
    SingleLock _lock = SingleLock(_LOCKER_ID_OUTPUT_FOLDER_LOADER);
    void returnMemory();
    std::string generateCopyNames(const std::string&);
    std::string generateCopyNames(const std::string&, const long& id);
};

class OutputPageNode: public ChainPoolNode {

    friend class OutputFolderNode;
    friend class OutputFolder;
    friend class OutputLine;
    friend class SeriesBase;
    friend class VariableBase;
    friend class Block;
    friend class OutputPoint;

private:

    OutputPageNode(OutputFolderNode *const &, OutputPage *const &, GeneralMemoryChunk *const &);
    OutputPageNode(OutputPageNode *const &, const TankIterator *const &, GeneralMemoryChunk *const &);
    OutputPageNode(OutputPageNode *const &, GeneralMemoryChunk *const &);
    OutputPageNode(OutputPageNode *const &, GeneralMemoryChunk *const &, bool);

    OutputFolderNode *_owner = nullptr;
    OutputPage *_outputPage = nullptr;


    SuperString _lastBindName;

    
    OutputLine *_lineHead = nullptr;
    OutputLine *_lineTail = nullptr;
    OutputPoint *_pointHead = nullptr;
    OutputPoint *_pointTail = nullptr;
    long _lineLength = 0;
    long _pointLength = 0;
    HypMap* _deepChildrenMap = nullptr;
    HypMap* _subNodeMap = nullptr;
    //HypList _deepChildren;

    bool _copyChildrenNeeded = false;
    //SuperString _childName;
    bool _selectedChildrenOutputs = false;
    //int _targetNameMatchType = 0;
    SuperString _targetChildName;
    //long _targetChildId = -1;
    long _level = 0;

    GeneralMemoryChunk *_chunk = nullptr;
    std::string _archiveName;
    
    //Block **_outputBlock = nullptr;
    
    virtual void _archive() override;
    void readArchive(bool);
    inline void readArchive() {this->readArchive(true);};
    inline virtual void _truncate() override{return;};
    inline bool outputCSV(const std::string& folderName, const std::string& fileName, const std::string& groupName, HypList *const & headers, HypList *const & variableHeaders) {return this->outputCSV(folderName, fileName, groupName,headers, variableHeaders, false, true);};
    bool outputCSV(const std::string&, const std::string&, const std::string&,  HypList *const &, HypList *const &, bool, bool);

    void bindBlock(RecordThread *const &);
    void bindSubNode(const Block *linkedBlock, HypMapOperators*iter, HypListItem *linkWalker, const long& linkID, const long& linkSize, std::string subNodeName);
    void bindBlock(const Block *);
    void _updateOutputBind(const Block *);
    
    SingleLock _lock = SingleLock(_LOCKER_ID_OUTPUT_FOLDER_LOADER);

    ptrdiff_t * getSeriesFromBlock(HypList &existingNames, GeneralMemoryManager &lManager, const Block* block, HypMap &seriesPos, long lineSize, int threadID);
    ptrdiff_t * getSeriesFromUI(HypList &existingNames, GeneralMemoryManager &lManager, const Block* block, HypMap &seriesPos, long lineSize, int threadID);
    ptrdiff_t * getVariableFromBlock(HypList &existingNames, GeneralMemoryManager &lManager, const Block* block, HypMap &seriesPos, long lineSize, int threadID);
    ptrdiff_t * getVariableFromUI(HypList &existingNames, GeneralMemoryManager &lManager, const Block* block, HypMap &seriesPos, long lineSize, int threadID);
    void bindChildrenbyIndex(HypListItem* blockHead, HypList& nodeChildren, const long& childSize);
    void bindChildrenbyIndex(HypMapItem* blockHead, HypList& nodeChildren, const long& childSize);
    void bindChildrenbyName(HypListItem* blockHead, const long& childSize);
    void bindChildrenbyName(HypMapItem* blockHead, const long& childSize);
    
    ptrdiff_t *_existingPos = nullptr;
    ptrdiff_t *_existingVariablePos = nullptr;
    void returnMemory();
    
    const HypMapCore* _nodeMap = nullptr;

    void outputCopyLines(std::stringstream& sout, OutputLine* outputLine, OutputLine* outputLinePage, const long& accSectorId, const long& accRowNo);
    void outputCopyPoint(std::stringstream& sout, OutputPoint* outputLine, OutputPoint* outputLinePage, bool outputValue);
};

class OutputPage {

    friend class Beam;
    friend class OutputFolder;
    friend class OutputFolderNode;
    friend class OutputPageNode;
    friend class OutputLine;
    friend class OutputPoint;
    friend class SeriesBase;
    friend class VariableBase;
    friend class Block;

private:

    OutputPage(OutputFolder *, const SuperString &, const SuperString &, const long &, const long &);

    OutputFolder *_owner = nullptr;
    const SuperString &_pageName;
    const SuperString &_rootBlock;

    long _firstPeriod = 0;
    long _lastPeriod = 0;
    long _firstSectorId = 0;
    long _lastSectorId = 0;
    long _outputMaxLevel = 0;
    long _outputMinLevel = 0;

    bool _blockCopyNeeded = false;
    bool _blockDepthNeeded = false;
    bool _seriesCopyNeeded = false;
    bool _seriesDepthNeeded = false;
    bool _separateSeriesCopyPage = false;
    bool _allSeries = true;
    bool _allVariables = true;
    bool _outputAllLevel = true;
    bool _file_separate_by_node = false;
    bool _file_separate_by_copy = false;
    bool _file_separate_by_depth = true;
    long _headerLength = 0;
    const TankIterator *_blockCopyList = nullptr;

    HypList _linkName;
    HypList _outputSeriesNames;
    HypList _outputVariableNames;
    HypMap _seriesPos = HypMap(_LOCKER_ID_PAGE_SERIES);
    HypMap _variablePos = HypMap(_LOCKER_ID_PAGE_SERIES);
    OutputLine *_lineHead = nullptr;
    OutputLine *_lineTail = nullptr;
    OutputPoint *_pointHead = nullptr;
    OutputPoint *_pointTail = nullptr;
    long _lineLength = 0;
    long _pointLength = 0;
    
    std::ios::pos_type _lastPos = 0;
    const Block **_rootBlocks = nullptr;
    long _totalNode = 0;
    SingleLock _outputSeriesLock = SingleLock(_LOCKER_ID_PAGE_SERIES);
    SingleLock _outputVariableLock = SingleLock(_LOCKER_ID_PAGE_SERIES);
};

class OutputFolderNode {

    friend class OutputFolder;
    friend class OutputPageNode;
    friend class OutputLine;
    friend class OutputPoint;
    friend class RecordThread;
    friend class Block;
public:

    enum Status{
        UNSPECIFIED,
        FREE,
        UPLOADING,
        READY,
        ACCUMULATING,
    };

private:

    OutputFolderNode(OutputFolder *const &, ValueUnion *const &, const long& id, GeneralMemoryChunk *const &);

    OutputFolder *_owner = nullptr;
    long _nodeId = -1;
    Status _status = Status::UNSPECIFIED;
    
    long _pageNodeLength = 0;
    OutputPageNode *_outputPageNodes = nullptr;
    
    long _groupIndexLength = 0;
    ValueUnion *_groupIndex = nullptr;
    
    GeneralMemoryChunk *_chunk = nullptr;

    void bindThread(RecordThread* recordThread);
    void returnMemory();
    const HypMapCore* _nodeMap = nullptr;
    long _innerLoopNumber = 0;
    long _outerLoopNumber = 0;
};

class OutputFolder: public ChainPool {

    friend class Beam;
    friend class OutputPage;
    friend class OutputFolderNode;
    friend class OutputPageNode;
    friend class OutputLine;
    friend class OutputPoint;
    friend class RecordThread;
    friend class DataRoll;
    friend class Block;
    
private:

    OutputFolder(Beam *, const std::string &, const std::string &);

    Beam *_owner = nullptr;
    std::string _workingDir;
    std::string  _outputDir;
    std::string _outputPrefix;
    HypList _groupIndex;

    HypMap _outputPages;
    HypMap _outputLinks = HypMap(_LOCKER_ID_OUTPUT_FOLDER_MAP);
    HypMap _outputFolderNodes = HypMap(_LOCKER_ID_OUTPUT_FOLDER_MAP);
    //HypMap _outputFolderNodeListMap = HypMap(_LOCKER_ID_OUTPUT_FOLDER_MAP);

    long _initThreadSize = 0;            //BC 20201129    

    GeneralMemoryManager _outputFolderNodeManager = GeneralMemoryManager(_MEM_ID_FOLDER_NODE, sizeof(OutputFolderNode), _INITIAL_FOLDER_NODE_CHUNK_LENGTH, _REALLOC_FOLDER_NODE_CHUNK_LENGTH,true);
    GeneralMemoryManager _outputPageNodeManager = GeneralMemoryManager(_MEM_ID_PAGE_NODE, sizeof(OutputPageNode), _INITIAL_PAGE_NODE_CHUNK_LENGTH, _REALLOC_PAGE_NODE_CHUNK_LENGTH, true);
    GeneralMemoryManager _outputLineManager = GeneralMemoryManager(_MEM_ID_LINE, sizeof(OutputLine), _INITIAL_LINE_CHUNK_LENGTH, _REALLOC_LINE_CHUNK_LENGTH, true);
    GeneralMemoryManager _outputPointManager = GeneralMemoryManager(_MEM_ID_LINE, sizeof(OutputPoint), _INITIAL_POINT_CHUNK_LENGTH, _REALLOC_POINT_CHUNK_LENGTH, true);

    // std::mutex _readyMutex;
    // std::condition_variable _readyCondition;
    // std::mutex _monitorMutex;
    // std::condition_variable _monitorCondition;
    // std::mutex _archiveMutex;
    // std::condition_variable _archiveCondition;

    long _archivePageNodeCount = 0;
    long _totalNode = 0;

    SingleLock _lockLoader = SingleLock(_LOCKER_ID_OUTPUT_FOLDER_LOADER);
    SingleLock _lockChainPool = SingleLock(_LOCKER_ID_OUTPUT_FOLDER_CHAINPOOL);
    long _osNodes;
    bool _accumulationWait = false;
    /*unsigned char */OutputFolderNode *_posLoaders/*[_OUTPUT_PAGE_NODE_MULTIPLIER * _DEFAULT_MULTI_THREAD_CAPACITY * sizeof(OutputFolderNode)]*/ = nullptr;            //BC 20201125
    //std::thread _threadAccumulation;
    
    void notifyCompletion();

    OutputFolderNode * getRecordNode(const long& threadID, DataRollRecord * record);
    
    void outputCSV();
    void outputCSV(OutputFolderNode* node, bool);
    void outputCSV(HypMapCore*, bool&);
    void outputCSV(const long&);
    void outputCSV(const long&, const long&);
    bool _hasInnerLoop = false;
    bool _hasOuterLoop = false;
    std::thread* _outputThread = nullptr;

    //bool _one_page_one_file = true;
};

//_CODE_END_

#endif //Output_20200702_hpp
