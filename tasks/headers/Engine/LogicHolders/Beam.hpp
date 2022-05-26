//
//  Beam.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2018/1/1.
//  Copyright © 2018年 陈曦. All rights reserved.
//

#ifndef Beam_hpp
#define Beam_hpp

#include <stdio.h>
#include <string>
#include <atomic>
#include <memory.h>
#include <sstream>
#define _SPEED_UP


#include "Functions.hpp"

#include "SuperMap.20200728.hpp"

#include "Block.hpp"
#include "Output.20200702.hpp"

#include "Target.hpp"
#include "TXTDataRoll.hpp"
#include "RecordThread.hpp"
#include "Definitions.hpp"
#include "SuperLock.hpp"           //BC 20201126
#include "ErrorHandler.hpp"

//_CODE_START_

class Beam: public ChainPool{

    friend class ChainPool;
    friend class Block;
    friend class DataRoll;
    friend class RecordThread;
    friend class SuperString;
    friend class Tank;
    friend class TankCell;
    friend class TXTConverter;
    friend class TXTDataRoll;
    friend class NavigatorManager;
    friend class BlockCluster;
    friend class BlockFamily;
    friend class Navigator;
    friend class OutputFolder;
    friend class OutputPage;
    friend class OutputLine;
    friend class OutputFolderNode;
    friend class OutputPageNode;
    friend class QuickTable;
    friend class DataRollRecord;
    friend class BlockResult;
    friend class SuperTable;
    friend class TXTSuperTable;
    friend class TableBase;
    friend class HypList;
    friend class HypMap;
    friend class HypListItem;
    friend class HypMapItem;
    friend class VariableBase;
    friend class SeriesBase;
    friend class ValueUnion;
    friend class GeneralMemoryManager;
    friend class IntegerVariableBase;
    friend class FloatVariableBase;
    friend class StringVariableBase;
    friend class LinkBase;
    friend class Period;
    friend class ExternalConstantReader;            //BC 20201113
    friend int main(int, const char *[]);           //BC 20201208
    friend class ExpressParser;                     //BC 20201208
    friend class GeneralException;                  //BC 20201209
    friend class AssumptionLoader;
    friend class Target;
    template<typename M> friend class BlockLink;
    friend std::string getWorkingDir();

public:

    void setProjection(int argc, const char * argv[]);
    inline std::string workingDir() const{ return this->_workingDir;};
    inline long val_date() const{ return this->_val_date;}
    inline bool entry_date_data() const{ return this->_entry_date_data;}
    inline bool entry_t_data() const{ return this->_entry_t_data;}
    inline bool prod_code() const{ return this->_prod_code;}

private:

    template <typename ...T>
    void printLog(const T&... logInfo) const;
    template <typename ...T>
    void printScreen(const T&... logInfo) const;
    template <typename ...T>
    void printLogLockFree(const T&... logInfo) const;
    template <typename ...T>
    void printScreenLockFree(const T&... logInfo) const;
    template <typename T1, typename ...T2>
    inline std::string log(const T1&logInfo1, const T2&... logInfo2) const {
       return this->log(logInfo1) + '\t' + this->log(logInfo2...);
    }
    inline std::string log(const std::string& logInfo) const{return logInfo;};
    inline std::string log(const char* logInfo) const{return logInfo;};
    inline std::string log(const SuperString& logInfo) const{return logInfo;};
    inline std::string log(const StringVariableBase& logInfo) const{return logInfo;};
    inline std::string log(const FloatVariableBase& logInfo) const{return enhenced_to_string(logInfo);};
    inline std::string log(const IntegerVariableBase& logInfo) const{return enhenced_to_string(logInfo);};
    inline std::string log(const double& logInfo) const{return enhenced_to_string(logInfo);};
    inline std::string log(const long& logInfo) const{return enhenced_to_string(logInfo);};
    inline std::string log(const int& logInfo) const{return enhenced_to_string(logInfo);};
    inline std::string log(bool logInfo) const{return logInfo? "true" : "false";};
    std::string log(const ValueUnion& logInfo) const;
    std::string log(const HypListItem& logInfo) const;
    
    mutable std::ofstream log_file;
    mutable int _logThread = -1;
    inline long startTimeInMS() const
    {return this->_startTimeInMS;}
    
    void runData(int argc, const char * argv[]);
    void archiveProcess();

    bool checkSwitchesForTank(const TankIterator &);
    void clearLog();
    void clearLogScreen();
    static Beam PROJECTION;
    static const ThreadResourceManager RESOURCE_MANAGER;
    
//private:      //BC 20201208
    
    mutable std::atomic<int> _threadSize;
    mutable std::atomic<int> _threadRunRecord;
    mutable std::atomic<int> _dataThreadSize;
    int _initThreadSize = 0;            //BC 20201129
    int _tableThreadUnit = 8; 

    mutable std::mutex _completeMutex;
    mutable std::condition_variable _completeCondVar;
    mutable std::mutex _runMutex;
    mutable std::condition_variable _runCondVar;
    mutable std::mutex _archiveMutex;
    mutable std::condition_variable _archiveCondVar;
    mutable std::mutex _batchMutex;
    mutable std::condition_variable _batchCondition;
    mutable std::mutex _readyMutex;
    mutable std::condition_variable _readyCondition;
    mutable std::mutex _dataCompleteMutex;
    mutable std::condition_variable _dataCompleteCondition;
    std::mutex _outputReadyMutex;
    std::condition_variable _outputReadyCondition;
    std::mutex _outputMonitorMutex;
    std::condition_variable _outputMonitorCondition;
    mutable std::mutex _outputArchiveMutex;
    mutable std::condition_variable _outputArchiveCondition;
    OutputFolder *_outputFolder = nullptr;
    long long _startTimeInMS = 0;
    long long _lastCheckPoint = 0;
    long long _lastCheckMP = 0;

    bool _noAccumulatedOutput = true;
    mutable std::string _logScreenBuffer = "";
    mutable std::string _logBuffer = "";
     mutable long _lastLogPoint = 0;
    
    //unsigned char _posThreads[_DEFAULT_MULTI_THREAD_CAPACITY * sizeof(RecordThread)];         //BC 20201125
    
    void getReadyToRun();
    void logProgress();
    void countLoop();

    
    Beam();
    
    RecordThread *_recordThreads = nullptr;
    
    HypMap _tanks;
    HypList _seriesTargets;
    HypList _variableTargets;
    DataRoll *_dataRoll = nullptr;
    bool* _dataRollReady = nullptr;
    DataRoll *_nextDataRoll = nullptr;
    bool _nextDataRollReady = false;
    bool _hasDataRoll = true;
    bool _usingSlidingWindow = false;
    long long _totalLoops = -1;
    long long _completeRecords = 0;
    long long _nextReportMP = 0;
    long long _maxInnerLoops = 0;
    bool _estimateRemainingRunTime = true;
    //long _nextDataRollStartThread = 0;
    //long _runDataNo = 0;              //BC 20201207
    
    mutable bool _projectionCompleted = false;
    
    SuperString _workingDir;
    std::string _archiveDir;
    std::string _archiveOutputDir;
    std::string _archiveTableDir;
    std::string _archiveResultDir;
    std::string _taskName = "";

    SingleLock _lock = SingleLock(_LOCKER_ID_NAVIGATOR_MANAGER);
    SingleLock _loopLock = SingleLock(_LOCKER_ID_NAVIGATOR_MANAGER);
    //SingleLock _lockThreadRecord = SingleLock(_LOCKER_ID_THREAD_ID_RECORD);
    SingleLock _lockLog = SingleLock(_LOCKER_ID_NAVIGATOR_MANAGER);
    SingleLock _lockLogThread = SingleLock(_LOCKER_ID_NAVIGATOR_MANAGER);
    SingleLock _recordCountLock = SingleLock(_LOCKER_ID_NAVIGATOR_MANAGER);
    Tank *_projectionSettings = nullptr;
    const TankIterator *_assumptions = nullptr;
    const TankIterator *_projectionSwitches = nullptr;
    const TankIterator *_defaultValues = nullptr;
    const TankIterator *_defaultLinks = nullptr;
    const TankIterator *_assumptionLinks = nullptr;
    const TankIterator *_assumptionVariables = nullptr;
    //const TankIterator *_sharingPlan = nullptr;   //BC 20201113
    //const TankIterator *_staticBlocks = nullptr;  //BC 20201113
    //const TankIterator *_muteSeries = nullptr;    //BC 20201113
    const TankIterator *_blockSettings = nullptr;   //BC 20201113
    const TankIterator *_externalConstantTank = nullptr;        //BC 20201113
    const TankIterator *_engineSettings = nullptr;              //BC 20201125
    const TankIterator *_rootBlockSeparators = nullptr;
    const TankIterator *_prodCodeMappings = nullptr;
    const TankIterator *_prodIdMappings = nullptr;
    //AssumptionLoader* _assumptionVariablesLoaders;
    //AssumptionLoader* _assumptionLinksLoaders;
    std::thread *_archiveThread = nullptr;
    std::thread *_dataThread = nullptr;
    
    int _calculationChainLimit = 0;                             //BC 20201125
    int _multiThreadNumber = 0;                                 //BC 20201125
    int _errorTraceLength = 0;                                  //BC 20201209
    int _outputPrecision = 0;                                   //BC 20201209
    int _usedBlockCriticalLength = 0;                           //BC 20201209
    int _usedBlockRetainLength = 0;                             //BC 20201209
    int _blockCopyRetainLength = 0;                             //BC 20201209
    int _blockDepthRetainLength = 0;                            //BC 20201209
    int _dataRecordBatchSize = 0;                               //BC 20201209
    int _dataRecordBatchMultiplier = 0;                         //BC 20201209
    int _outputPageNodeMultiplier = 0;                          //BC 20201209
    int _outputPageNodeSafe = 0;                                //BC 20201209
    //bool* _tableTruncated = nullptr;
    bool _allowIterationWhenCircularReference = false;
    long _stepFrom = 0;
    long _stepTo = 0;
    bool _rebaseDepth = false;
    bool _rebaseSwitch = false;
    long* _outerLoopNumber = nullptr;
    long* _innerLoopNumber = nullptr;
    bool _independentInnerLoop = false;
    bool _independentOuterLoop = false;
    long _innerLoopCount = 0;
    long _outerLoopCount = 0;
    bool _useInnerLoop = false;
    bool _useOuterLoop = false;
    bool _hasNextInnerLoop = true;
    bool _hasNextOuterLoop = true;
    
    long* _outer_loop_ranges = nullptr;
    long* _inner_loop_ranges = nullptr;
    long _currentInnerLoopID = 0;
    long _currentOuterLoopID = 0;
    long* _currentInnerLoopRange = 0;
    long* _currentOuterLoopRange = 0;
    bool _firstInnerLoop = true;
    bool _firstOuterLoop = true;
    long _latestInnerLoop = 0;
    long _latestOuterLoop = 0;
    bool _getLoop(const long&, bool);
    inline bool _getLoop(const long& num) {return this->_getLoop(num, true);};
    bool _independentLoop(const long&);
    void _copyLoop(const long&);
    long _val_date = 0;
    bool _entry_date_data = false;
    bool _entry_t_data = false;
    bool _prod_code = false;

    SuperString _outputPageArchivePrefix;                 //BC 20201209
    SuperString _tableArchivePrefix;          //BC 20201209
    SuperString _blockResultArchivePrefix;        //BC 20201209
    SuperString _archivePostfix;                 //BC 20201209
    SuperString _tableFolder;                 
    
    SuperTableResourceManager _superTableResourceManager =  SuperTableResourceManager(this);
    unsigned char _posOutputFolder[sizeof(OutputFolder)];       //BC 20201209
    //unsigned char _posDataRoll[sizeof(TXTDataRoll)];            //BC 20201209

    void closeOneThread();
    BlockResult *newBlockResult(const Block *) const;
    
    BlockCluster *findBlockCluster(const SuperString &blockName, const SuperString &tankName, const int &threadId);

    bool regMe();
    
    void configDataRoll(DataRoll*, bool*);
    SuperString _applyTank;
};

class ExternalConstantReader {              //BC 20201113

    public:
        
        ExternalConstantReader() { }
        
        const TankIterator &operator [] (const int &);
        const TankIterator &operator [] (const SuperString &);
        const TankIterator &operator [] (const char *);

    private:
        const TankIterator *_externalConstantTank = nullptr;
};

template <typename ...T>
void Beam::printLog(const T&... logInfo) const{
    _lockLog.lock();
    std::string str = this->log(logInfo...);
    log_file<<str<<std::endl;
    // std::cout<<str<<std::endl;
    _lockLog.release();
}
template <typename ...T>
void Beam::printScreen(const T&... logInfo) const{
    _lockLog.lock();
    std::string str = this->log(logInfo...);
    log_file<<str<<std::endl;
    std::cout<<str<<std::endl;
    _lockLog.release();
}
template <typename ...T>
void Beam::printLogLockFree(const T&... logInfo) const{
    std::string str = this->log(logInfo...);
    log_file<<str<<std::endl;
    // std::cout<<str<<std::endl;
}
template <typename ...T>
void Beam::printScreenLockFree(const T&... logInfo) const{
    std::string str = this->log(logInfo...);
    log_file<<str<<std::endl;
    std::cout<<str<<std::endl;
}
    // template <typename ...T>
    // void Beam::printLog(const T&... logInfo) const{
    //     long currTime = getCurrentTime();
    //     _lockLog.lock();
    //     std::string str = this->log(logInfo...);
    //     if(currTime - this->_lastLogPoint > 500 || this->_logBuffer.length() > 1024 * 32) {
    //         log_file<<this->_logBuffer<<str<<std::endl;
    //         if(this->_logScreenBuffer.length() > 0) {
    //             std::cout<<this->_logScreenBuffer<<std::endl;
    //             this->_logScreenBuffer.clear();
    //         }
    //         this->_logBuffer.clear();
    //         this->_lastLogPoint = currTime;
    //     }
    //     else{
    //         this->_logBuffer += (str + "\n");
    //     }
    //     // std::cout<<str<<std::endl;
    //     _lockLog.release();
    // }
    // template <typename ...T>
    // void Beam::printScreen(const T&... logInfo) const{
        
    //     _lockLog.lock();
    //     long currTime = getCurrentTime();
    //     this->log(logInfo...);
    //     std::string str = this->log(logInfo...);
    //     if(currTime - this->_lastLogPoint > 500 || this->_logBuffer.length() > 1024 * 32) {
    //         //log_file<<this->_logBuffer<<str<<std::endl;
    //         std::cout<<this->_logScreenBuffer<<str<<std::endl;
    //         this->_logScreenBuffer = "";
    //         this->_logBuffer = "";
    //         this->_lastLogPoint = currTime;
    //     }
    //     else{
    //         //std::cout<<" buffer len "<<this->_logScreenBuffer.length()+ str.length() + 1<<std::endl;
    //         this->_logScreenBuffer += (str + "\n");
    //         //this->_logBuffer += (str + "\n");
    //     }
        
    //     _lockLog.release();
    // }

template <typename ME>
Navigator *Block::Profile<ME>::addNavigator(const SuperString &blockName, size_t blockSize, Block *(*func)(const BlockCluster *const &, const Block *const &, const bool &, const long &, GeneralMemoryChunk *const &)){
    
    return new (Beam::RESOURCE_MANAGER._navigatorManager.applyFreeChunk(nullptr)->_data) Navigator(&Beam::PROJECTION, blockName, blockSize, func);
}

template <typename ME>
template <typename P>
void Block::Profile<ME>::linkNavigator(Navigator *const &navigator) {
    
    Navigator *myNavigator = P::PROFILE._navigator;
    
    if(myNavigator != navigator) {
        if(!navigator->_parent) {
            navigator->_parent = myNavigator;

        }
    }

}
template <typename ME>
template <typename P>
void Block::Profile<ME>::initialiseDefaultValues(){


}

template <typename ...T>
void Block::printLog(const T&... logInfo) const {
    this->_projection->_lockLogThread.lock();
    bool lockFree = true;
    if(this->_threadId != this->_projection->_logThread){
        this->_projection->_lockLogThread.release();
        this->_projection->_lockLog.lock();
        this->_projection->_lockLogThread.lock();
        this->_projection->_logThread = this->_threadId;
        this->_projection->_lockLogThread.release();
        lockFree = false;
    } else {
        this->_projection->_lockLogThread.release();
    }
    this->_projection->printLogLockFree("thread",this->_threadId, "record", this->_recordId(), logInfo...);
    if(!lockFree) {
        this->_projection->_lockLogThread.lock();
        this->_projection->_logThread = -1;
        this->_projection->_lockLogThread.release();
        this->_projection->_lockLog.release();
    }
}
template <typename ...T>
void Block::printScreen(const T&... logInfo) const {
    this->_projection->_lockLogThread.lock();
    bool lockFree = true;
    if(this->_threadId != this->_projection->_logThread){
        this->_projection->_lockLogThread.release();
        this->_projection->_lockLog.lock();
        this->_projection->_lockLogThread.lock();
        this->_projection->_logThread = this->_threadId;
        this->_projection->_lockLogThread.release();
        lockFree = false;
    } else {
        this->_projection->_lockLogThread.release();
    }
    this->_projection->printScreenLockFree("thread",this->_threadId, "record", this->_recordId(), logInfo...);
    if(!lockFree) {
        this->_projection->_lockLogThread.lock();
        this->_projection->_logThread = -1;
        this->_projection->_lockLogThread.release();
        this->_projection->_lockLog.release();
    }
} 
template <typename T1, typename ...T2>
std::string SuperTable::combineKey(const T1&logInfo1, const T2&... logInfo2) const {
   return Beam::PROJECTION.log(logInfo1) + ", " + this->combineKey(logInfo2...);
}
template <typename T>
std::string SuperTable::combineKey(const T& logInfo) const {
   return Beam::PROJECTION.log(logInfo);
}
void inlialiseBeam(Beam& beam, int argc, const char * argv[]);

template <typename M>
const Block *BlockLink<M>::_getBlockFromTank(const TankIterator &blockTank) const {
    
    SuperString blockName = blockTank["blockName"];
    const SuperString &applyTank = blockTank["applyTank"];
    const TankIterator &separators = blockTank["separators"];
    BlockFamily &blockFamily = M::PROFILE._navigator->_blockFamilies[this->_owner->_threadId];
    if(blockFamily._prodBlock) {
        //RecordThread& recordThread = Beam::PROJECTION._recordThreads[this->_owner->_threadId];
        blockName = (blockName == "N" ? M::NAME : blockName);
    }
    BlockCluster &blockCluster = blockName == "N" ? blockFamily(applyTank == "N" ? this->_owner->_tankName() : applyTank) : blockFamily(blockName, applyTank == "N" ? this->_owner->_tankName() : applyTank);
    
    const Block *res = nullptr;
    
    if(separators._size() > 0) {
        
        int listLen = 0;
        unsigned char **list = (unsigned char **)safe_malloc(sizeof(void*) * separators._size());
        unsigned char **listPos = list;
        
        separators.forEach([&] (TankIterator &sepIter) {
            
            
            unsigned char *listWalk = (unsigned char *)safe_malloc(SIZE_OF_CLUSTER_SECTOR);
            *listPos = listWalk;
            *(const SuperString **)listWalk = &sepIter.name;
            listWalk += sizeof(void *);
            
            if(sepIter._iterType == TankIterator::Type::STRING_CELL) {
                
                *(bool *)listWalk = false;
                listWalk += (sizeof(bool) + sizeof(double));
                *(SuperString *)listWalk = sepIter.operator const SuperString &();
                listWalk += sizeof(SuperString);
            }
            else {
                
                *(bool *)listWalk = true;
                listWalk += sizeof(bool);
                *(double *)listWalk = sepIter.operator double ();
                listWalk += (sizeof(double) + sizeof(SuperString));
            }
            
            ++listLen;
            ++listPos;
            return false;
        });
        
        res = blockCluster.findBlock(list, listLen);
        unsigned char ** p = (unsigned char**) list;
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
        free(list);
    }
    else {
        res = &blockCluster();
    }
    
    if(this->_matchCopyPos) {
        res = this->_matchBlockCopy(res);
    }
    
    this->_tankForChild = &blockTank["children"];
    return this->_setTarget(res);
}

template <typename M>
const Block *BlockLink<M>::_getBlockFromSettings(const TankIterator &blockTank) const {
    
    SuperString blockName = blockTank["blockName"];
    const TankIterator &separators = blockTank["separators"];
    BlockFamily &blockFamily = M::PROFILE._navigator->_blockFamilies[this->_owner->_threadId];
    if(blockFamily._prodBlock) {
        //RecordThread& recordThread = Beam::PROJECTION._recordThreads[this->_owner->_threadId];
        blockName = (blockName == "N" ? M::NAME : blockName);
    }
    BlockCluster &blockCluster = blockName == "N" ? blockFamily(this->_owner->_tankName()) : blockFamily(blockName, this->_owner->_tankName());
    
    const Block *res = nullptr;
    
    if(separators._size() > 0) {
        
        int listLen = 0;
        unsigned char **list = (unsigned char **)safe_malloc(sizeof(void*) * separators._size());
        unsigned char **listPos = list;
        
        separators.forEach([&] (TankIterator &sepIter) {
            
            
            unsigned char *listWalk = (unsigned char *)safe_malloc(SIZE_OF_CLUSTER_SECTOR);
            *listPos = listWalk;
            *(const SuperString **)listWalk = &sepIter["name"].operator const SuperString &();
            listWalk += sizeof(void *);
            if(sepIter["type"].operator double() == 1) {
                if(sepIter["value"]._iterType == TankIterator::Type::STRING_CELL) {
                    
                    *(bool *)listWalk = false;
                    listWalk += (sizeof(bool) + sizeof(double));
                    *(SuperString *)listWalk = sepIter.operator const SuperString &();
                    listWalk += sizeof(SuperString);
                }
                else {
                    
                    *(bool *)listWalk = true;
                    listWalk += sizeof(bool);
                    *(double *)listWalk = sepIter.operator double ();
                    listWalk += (sizeof(double) + sizeof(SuperString));
                }
            }
            else {
                const SuperString &varName = sepIter["value"];
                const VariableBase& var = this->_owner->_variable(varName);
                if(var._valueType == VariableBase::ValueType::STRING || var._valueType == VariableBase::ValueType::TABLE_NAME){
                    *(bool *)listWalk = false;
                    listWalk += (sizeof(bool) + sizeof(double));
                    *(SuperString *)listWalk = var._getSuperString();
                    listWalk += sizeof(SuperString);

                } else {
                    
                    *(bool *)listWalk = true;
                    listWalk += sizeof(bool);
                    *(double *)listWalk = var._getNumber();
                    listWalk += (sizeof(double) + sizeof(SuperString));
                }
            }
            ++listLen;
            ++listPos;
            return false;
        });
       
        res = blockCluster.findBlock(list, listLen);
        
        unsigned char ** p = (unsigned char**) list;
        for(int i = 0 ; i < listLen; ++i){
            unsigned char* currPos = *p;
            currPos += sizeof(void *);
            if(!*(bool *)currPos) {
                currPos += (sizeof(bool) + sizeof(double));
                ((SuperString*)currPos)->_clear();
            }
            currPos = *p;
            ++p;
            free(currPos);
        }
        free(list);
    }
    else {
        res = &blockCluster();
    }
    
    if(this->_matchCopyPos) {
        res = this->_matchBlockCopy(res);
    }
    
    return this->_setTarget(res);
}
/*
class AssumptionLoader{

public:

    enum Type {
        VARIABLE,
        LINK
    };

    const Block* getBlock(RecordThread *const &loadThread, const TankIterator&);
    void setAssumptionVariable(RecordThread *const &loadThread);
    void setAssumptionLink(RecordThread *const &loadThread);

    AssumptionLoader(const TankIterator&, AssumptionLoader::Type);

private: 

    Block **_rootBlock = nullptr;
    Block **_outputBlock = nullptr;

    const TankIterator* _assumptionTank;
    const TankIterator* _linksTank;
    const Type _type;
    

};
*/

//_CODE_END_

#endif /* Beam_hpp */
