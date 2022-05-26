//
//  DataRoll.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2018/1/14.
//  Copyright © 2018年 陈曦. All rights reserved.
//

#ifndef DataRoll_hpp
#define DataRoll_hpp

#include <stdio.h>
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <atomic>

#include "QuickList.20200803.hpp"
#include "SuperMap.20200728.hpp"
#include "SuperLock.hpp"           //BC 20201126
#include "Tank.20200710.hpp"
#include "Target.hpp"
#include "TXTConverter.hpp"
#include "ExpressParser.hpp"                //BC 20201206

#include "Definitions.hpp"

class Beam;
class RecordThread;
class TXTDataRoll;
class ResultChunkPack;
class DataRoll;

//_CODE_START_
enum BatchStatus {
    FREE,
    LOADED,
    CALCULATING,
    CALCULATED,
    COMPLETED,
    RETIRED,
};

class DataRollRecord: public Tank {
    
    friend class DataRoll;
    friend class TXTDataRoll;
    friend class DataRollRecordPresenter;
    friend class Beam;
    friend class RecordThread;
    friend class FloatVariableBase;
    friend class IntegerVariableBase;
    friend class StringVariableBase;
    friend class Block;
    friend class OutputFolder;

public:
    
    //virtual inline TankCell *getCell(const StringNode *const &id) const override {return (TankCell *)this->_recordMap._getItem(id, false)->_getPointer();};
    virtual TankCell *getCell(const SuperString &id) const  override;
    inline long long id() const {return this->_id;};
    inline const bool& dataLoaded() const {return this->_dataLoaded;};

protected:
    
    virtual void returnMemory();
    int _fieldLength = 0;

private:

    DataRollRecord(DataRoll *);

    void readRecord(char *, char);

    long long _id = -1;
    long long _idCurrentThread = 0;
    bool _dataLoaded = false;
    TankCell *_fieldContents = nullptr;
    //StringNodeQuickFinder *_quickFinders = nullptr;

//private:              //BC 20201208
    
    HypList _results;
    DataRoll *_dataRoll = nullptr;
    HypMap _recordMap;
    GeneralMemoryChunk* _chunk = nullptr;
    
    
};

class DataRoll {
    
    friend class Beam;
    friend class DataRollRecord;
    friend class RecordThread;
    friend class OutputFolder;
    friend class Block;
    friend class FloatVariableBase;
    friend class IntegerVariableBase;
    friend class StringVariableBase;    
public:
    
    enum Type{
        UNSPECIFIED = 0,
        TXT         = 1,
    };
    

    class RecordReaderFunctionMap: public ExpressFunctionMap {      //BC 20201207
        
        friend class DataRoll;
        friend class TXTDataRoll;
        
    public:
        
        class RecordReaderFunction: public ExpressFunctionMap::UserDefinedFunction {

            friend class DataRoll::RecordReaderFunctionMap;

        private:

            RecordReaderFunction();

            virtual void calculate(ValueUnion *, HypList *) override;
            DataRollRecord *_currentRecord = nullptr;
        };

    private:

        RecordReaderFunctionMap(ExpressParser *);

        void setRecord(DataRollRecord *);

        RecordReaderFunction _recordReaderFunction;
        ExpressParser *_expressParser = nullptr;
    };
    
    
private:
    
    //BC 20201208           following variables are moved here from protected session
    std::string _outputFileName;
    std::string _outputFolderName;


    SingleLock _lock = SingleLock(_LOCKER_ID_DATA_ROLL); 

    void notifyBatchDone(int &batchId);

    DataRollRecord *getNextBatchToRun(int &);               //BC 20201208
    void readData();                                        //BC 20201208
    void setupRecordPool();                                 //BC 20201208
    
protected:

    DataRoll(const Beam *, const std::string&, const std::string& outputFolder);

    const Beam *_owner = nullptr;
    //const SuperString &_outputFileName;               //BC 20201208
    
    Type _type = Type::UNSPECIFIED;
    
    HypMap _fieldMap;
    StrHypMap _reFieldMap;
    int *_fieldTypeList = nullptr;
    SuperString *_fieldLinkageList = nullptr;
    SuperString *_fieldNameList = nullptr;
    DataRollRecord *_batchToRun = nullptr;
    DataRollRecord *_batchToOutput = nullptr;
    // mutable std::mutex _batchMutex;
    // mutable std::condition_variable _batchCondition;
    // std::mutex _readyMutex;
    // std::condition_variable _readyCondition;
    // std::mutex _completeMutex;
    // std::condition_variable _completeCondition;
    BatchStatus *_batchStatus/*[_DEFAULT_MULTI_THREAD_CAPACITY * _DATA_RECORD_BATCH_MULTIPLIER]*/ = nullptr;            //BC 20201125
    

    RecordReaderFunctionMap _recordReaderFunctions = RecordReaderFunctionMap(&this->_expressParser);            //BC 20201207
    ExpressParser _expressParser = ExpressParser(&this->_recordReaderFunctions);    //BC 20201207
    
    int _osBatch;
    int _runId = 0;
    int _outputId = 0;
    int _bufferId = 0;
    /*unsigned char*/DataRollRecord *_posDataRecordPool/*[sizeof(DataRollRecord) * _DEFAULT_RECORD_BATCH_SIZE * _DEFAULT_MULTI_THREAD_CAPACITY * _DATA_RECORD_BATCH_MULTIPLIER]*/ = nullptr;     //BC 20201125
    //SingleLock _lock = SingleLock(_LOCKER_ID_DATA_ROLL);          //BC 20201208
    
    int _fieldLength = 0;
    int _resultSize = 0;

    bool _outputNeeded = false;
    //bool _hasData = true;
    std::ofstream _fout;
    bool _recordCompleted = false;
    bool _recordRunCompleted = false;
    
    //long _maxRecords = -1;                //BC 20201208
    long long _currRecord = 0;
    long long _totalRecord = -1;
    int _rangeCount = 0;
    long long *_ranges = nullptr;
    long long _maxRecords = -1;
    long long _calculatedRecord = 0;
     
    //BatchStatus *_batchStatus/*[_DEFAULT_MULTI_THREAD_CAPACITY * _DATA_RECORD_BATCH_MULTIPLIER]*/ = nullptr;            //BC 20201125
    /*          //BC 20201208
    int _runId = 0;
    int _outputId = 0;
    DataRollRecord *_batchToRun = nullptr;
    DataRollRecord *_batchToOutput = nullptr;

    std::atomic<int> _osBatch;
    std::mutex _readyMutex;
    std::condition_variable _readyCondition;
    std::mutex _batchMutex;
    std::condition_variable _batchCondition;*/

    /*inline void notifyBatchDone(int &batchId) {           //BC 20201208

        this->_batchStatus[batchId] = BatchStatus::CALCULATED;
        this->_readyCondition.notify_one();                 //BC 20201125
    }*/
    
    virtual bool readRecord(DataRollRecord *) = 0;
    virtual bool getDataReady() = 0;
    virtual void resetToFirstRecord() = 0;
    virtual void countRecord() = 0;
    long _innerLoopNumber = 0;
    long _outerLoopNumber = 0;
    bool _hasNextOuterLoop = false;
    bool _hasNextInnerLoop = false;
    
    void _setupOutput();
    bool notInRang();
    bool notOnCondition(DataRollRecord *);
    virtual void returnMemory();
    GeneralMemoryChunk * _chunk = nullptr;
    /*      //BC 20201208
    DataRollRecord *getNextBatchToRun(int &);
    
    void readData();
    void setupRecordPool();*/
};

//_CODE_END_

#endif /* DataRoll_hpp */
