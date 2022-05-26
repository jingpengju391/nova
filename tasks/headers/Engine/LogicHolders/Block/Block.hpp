//
//  Block.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2017/12/19.
//  Copyright © 2017年 陈曦. All rights reserved.
//

#ifndef Block_hpp
#define Block_hpp

#include <stdio.h>
#include <string>
#include <typeinfo>

#include "Definitions.hpp"
#include "QuickList.20200803.hpp"
#include "SuperMap.20200728.hpp"
#include "Variable.20200709.hpp"
#include "Series.20200624.hpp"
#include "Link.20200718.hpp"
#include "Tank.20200710.hpp"
#include "TXTSuperTable.hpp"
#include "DataRoll.hpp"
#include "ChainPool.hpp"
#include <algorithm>
#include <cmath>
class Beam;
class Block;

class RecordThread;
class BlockResult;
class OutputPageNode;

//_CODE_START_

unsigned char *_setClusterValue(const SuperString &varName, const long &value);
unsigned char *_setClusterValue(const SuperString &varName, const int &value);
unsigned char *_setClusterValue(const SuperString &varName, const double &value);
unsigned char *_setClusterValue(const SuperString &varName, const SuperString &value);
unsigned char *_setClusterValue(const SuperString &varName, const char *value);
unsigned char *_setClusterValue(const SuperString &varName, std::string &value);
unsigned char *_setClusterValue(const SuperString &varName, VariableBase &value);
unsigned char *_setClusterValue(const SuperString &varName, const IntegerVariableBase &value);
unsigned char *_setClusterValue(const SuperString &varName, const FloatVariableBase &value);
unsigned char *_setClusterValue(const SuperString &varName, const StringVariableBase &value);
unsigned char *_setClusterValue(const SuperString &varName, const ValueUnion &value);


class Block : public ChainPoolNode{

    friend class Beam;
    friend class SeriesBase;
    friend class VariableBase;
    friend class Period;
    friend class Navigator;
    friend class RecordThread;
    friend class NavigatorManager;
    friend class BlockCluster;
    friend class BlockResult;
    friend class OutputPageNode;
    friend class OutputLine;
    friend class Target;
    
    friend class PeriodSector;
    friend class PeriodSectorWithResult;
    
    friend class CircularReferenceError;
    friend class GeneralException;
    friend class IntegerVariableBase;
    friend class FloatVariableBase;
    friend class StringVariableBase;
    friend class LinkBase;
    template <typename M> friend class BlockLink;
    
    friend class SuperTableCellList;
    friend class SuperTable;
    friend class TableBase;
    friend class TXTSuperTable;
    
public:
    
    template <typename ME>
    class Profile {
        
        friend class Beam;
        
    public:
        
        Profile(Block *(*)(const BlockCluster *const &, const Block *const &, const bool &, const long &,  GeneralMemoryChunk *const &), const bool &);
        Navigator *_navigator = nullptr;
    protected:
        
        Block *(*_blockFunc)(const BlockCluster *const &, const Block *const &, const bool &, const long &, GeneralMemoryChunk *const &) = nullptr;
        //Navigator *_navigator = nullptr;
        
        virtual void registerToProjection(Navigator *const &);
        
        Navigator *addNavigator(const SuperString &, size_t, Block *(*)(const BlockCluster *const &, const Block *const &, const bool &, const long &, GeneralMemoryChunk *const &));
        template <typename P>
        void linkNavigator(Navigator *const &);
        template <typename P>
        void initialiseDefaultValues();
    };
    
    class Variables {
    
    public:
        const SuperString _ENTRY_T;
        const SuperString _ENTRY_T_RAW;
        const SuperString _ENTRY_DATE;
        const SuperString _RESULT_INDEX_TABLE;
        const SuperString _RESULT_INDEX_NODE;
        const SuperString _RESULT_INDEX_SUBNODE;
        const SuperString _PROD_CODE;
        const SuperString _MODEL_CODE;
        Variables();
    protected:
    };
    
    class Series {
        
    public:
        
        //SuperString rebaseLevel;
        Series();
    
    protected:


    };
    
    class Links {
        
    public:
        
    protected:
        
        Links();
    };
    
    static const SuperString NAME;
    static Profile<Block> PROFILE;
    static const Series SERIES;
    static const Variables VARIABLES;

    const SuperString _blockName;
    const SystemConstant::ItemType _type;              //BC 20201206
    const int _threadId;
    inline long _recordId() const {return this->_record? this->_record->id() : -1;};
    const Beam *const _projection;                      //BC 20201209
    const Block *const _ownerBlock;                     //BC 20201209
    Block * _baseBlock;                      //BC 20201209
    const long _copyId;
    const long _depthId;
    const long _level;
    
    mutable bool _rebaseNeeded = false;                   //BC 20201209
    const bool _isDepth = false;                        //BC 20201209

    inline long _rebaseTimePoint() const {return this->_rebaseNeeded || this->_isDepth? this->_rebaseTimePointValue : 0;};
    inline long _rebasePolicyTimePoint() const {return this->_rebaseNeeded || this->_isDepth? this->_rebasePolicyTimePointValue : this->_ENTRY_T_RAW;};
    const Block &_rebaseBaseBlock() const;
    const SuperString _nodeName() const;

    SeriesBase &_series(const SuperString &name) const;
    LinkBase &_link(const SuperString &name) const;
    VariableBase &_variable(const SuperString &name) const;
    IntegerVariableBase &_integerVariable(const SuperString &name) const;
    FloatVariableBase &_floatVariable(const SuperString &name) const;
    StringVariableBase &_stringVariable(const SuperString &name) const;
    TableBase &_table(const SuperString &name) const;
    void _extendCopySize(const long &size) const;

    double _getSumFromCopy(const SeriesBase &, const SeriesBase &, const long &) const;
    
    inline virtual const Block &operator () (const long &copyId) const
    {return *this->_getCopy(copyId);}
    
    
    inline const SuperString &_tankName() const
    {return this->_tank->name;}
    
    inline long _size() const                   //BC 20201113
    {return this->_copySize();}

    inline long _usedSize() const               //BC 20201113
    {return this->_maxCopy;}

    template <typename ...T>
    void printLog(const T&... logInfo) const;
    template <typename ...T>
    void printScreen(const T&... logInfo) const; 
    //SeriesBase rebaseLevel = SeriesBase(this, Block::SERIES.rebaseLevel, &Block::_calc_rebaseLevel, true);


    double _goalSeek(const SeriesBase& tarSeries, long t, const double& targetRes, const FloatVariableBase& chgVar, const double& guess_1, const double& guess_2, bool isolatedBlock) const;
    double _goalSeek(const FloatVariableBase& tarVar, const double& targetRes, const FloatVariableBase& chgVar, const double& guess_1, const double& guess_2, bool isolatedBlock) const;

    inline double _goalSeek(const SeriesBase& tarSeries, long t, const double& targetRes, const FloatVariableBase& chgVar, const double& guess_1, const double& guess_2) const{
        return this->_goalSeek(tarSeries, t, targetRes, chgVar, guess_1, guess_2,false);
    };
    inline double _goalSeek(const FloatVariableBase& tarVar, const double& targetRes, const FloatVariableBase& chgVar, const double& guess_1, const double& guess_2) const{
        return this->_goalSeek(tarVar, targetRes, chgVar, guess_1, guess_2,false);
    };
    inline double _goalSeek(const SeriesBase& tarSeries, long t, const double& targetRes, const FloatVariableBase& chgVar, bool isolatedBlock) const{
        return chgVar == 0 ? this->_goalSeek(tarSeries, t, targetRes, chgVar, chgVar,  0.1,isolatedBlock): this->_goalSeek(tarSeries, t, targetRes, chgVar, chgVar, chgVar * 1.01,isolatedBlock);
    };
    inline double _goalSeek(const FloatVariableBase& tarVar, const double& targetRes, const FloatVariableBase& chgVar, bool isolatedBlock) const{
        return chgVar == 0 ? this->_goalSeek(tarVar, targetRes, chgVar, chgVar,  0.1,isolatedBlock): this->_goalSeek(tarVar, targetRes, chgVar, chgVar, chgVar * 1.01,isolatedBlock);
    };
    inline double _goalSeek(const SeriesBase& tarSeries, long t, const double& targetRes, const FloatVariableBase& chgVar) const{
        return this->_goalSeek(tarSeries, t, targetRes, chgVar, false);
    };
    inline double _goalSeek(const FloatVariableBase& tarVar, const double& targetRes, const FloatVariableBase& chgVar) const{
        return this->_goalSeek(tarVar, targetRes, chgVar,false);
    };


    void _setNodeName(const SuperString&) const;
    bool _shrinkMemory(bool) const;
    inline bool _shrinkMemory() const {return this->_shrinkMemory(true);};
    void _callAllSeries(const long& t) const;
    IntegerVariableBase _ENTRY_T = IntegerVariableBase(this, Block::VARIABLES._ENTRY_T, &Block::_calc__ENTRY_T);
    IntegerVariableBase _ENTRY_T_RAW = IntegerVariableBase(this, Block::VARIABLES._ENTRY_T_RAW, &Block::_calc__ENTRY_T_RAW);
    StringVariableBase _PROD_CODE = StringVariableBase(this, Block::VARIABLES._PROD_CODE, &Block::_calc__PROD_CODE);
    StringVariableBase _MODEL_CODE = StringVariableBase(this, Block::VARIABLES._MODEL_CODE, &Block::_calc__MODEL_CODE);
    IntegerVariableBase _ENTRY_DATE = IntegerVariableBase(this, Block::VARIABLES._ENTRY_DATE, &Block::_calc__ENTRY_DATE);

    double _readValueFromSingleResult(const long& prd, const SuperString& colName, const SuperString& nodeName, const SuperString& indexFileName, bool skipError = true, const double& grossup_factor = 1., const long& timeOffet = 0, const long& maxTimeLoadSize = 1296) const;
    double _fillValueFromSingleResult(const SeriesBase& series, const long& prd, const SuperString& colName, const SuperString& nodeName, const SuperString& indexFileName, bool skipError = true, const double& grossup_factor = 1., const long& timeOffet = 0, const long& maxTimeLoadSize = 1296) const;
    double _readValueFromResult(const long& prd, const SuperString& colName, bool skipError = true, const double& grossup_factor = 1., const long& timeOffet = 0, const long& maxTimeLoadSize = 1296) const;
    double _fillValueFromResult(const SeriesBase& series, const long& prd, const SuperString& colName, bool skipError = true, const double& grossup_factor = 1., const long& timeOffet = 0, const long& maxTimeLoadSize = 1296) const;
    void _addNodeToLoad(const SuperString& indexFileName, const SuperString& nodeName, const long& subGroup = 0, bool checkDuplicate = false) const;
    void _clearIndexFiles() const;
    void _copyResultFromOtherBlock(const Block*) const;
    long _existNode(const SuperString& nodeName, const long& subGroup = 0) const;
    inline long _resultFileSize() const{ return this->_RESULT_INDEX_TABLE._size();};
    inline long _resultColNo() const{ return this->_resColHeaderMap._size();};
    inline long _singleResultColNo() const{ return this->_singleResColHeaderMap._size();};

    // double _random(std::normal_distribution<double>& dist) const;
    // double _random(std::uniform_real_distribution<double>& dist) const;
    template <typename Distr>
    inline double _random(Distr& dist = std::uniform_real_distribution<double>(0.0, 1.0)) const {return !this->_recordThread? 0 : dist(this->_recordThread->randomGenerator);};

    void _setSeed(long&) const;
protected:
    
    Block(const BlockCluster *const &, GeneralMemoryChunk *const &);
    Block(const Block *const &, const bool &, const long &, GeneralMemoryChunk *const &);

    
    virtual /*int*/long _maxCopySize() const {return 0;};
    virtual Block *_getCopy(const long &) const;

    
    virtual inline void _convertItems() {};
    virtual inline void _runAfterInitialization() const {};
    virtual inline void _runAfterRebase() const {};
    virtual inline void _runAfterFinalization() const {};
    
    virtual inline long _getRebasePoint(const long& depthID) const
    {return _isDepth? 12 : 0;}
    
    virtual inline const Block &_getRebaseBaseBlock() const
    {return *this;}

    virtual inline std::string _getCopyName() const
    {return _OUTPUT_COPY_PREFIX + std::to_string(this->_copyId);}
    

    void _initialise();
    //void _initialiseRebaseMap();

    inline virtual const Block &_base() const
    {return *this->_baseBlock;}
    
    virtual const Block &_parent() const;

    const long& _outerLoopNumber;
    const long& _innerLoopNumber;

    //const bool _independentLoop;
    
private:
    /*
    mutable const Block *_nextUsed = nullptr;               //BC 20201205
    mutable const Block *_previousUsed = nullptr;           //BC 20201205
    mutable const Block *_bigChildPrevious = nullptr;
    mutable const Block *_bigChildNext = nullptr;
    bool _bigChild = false;             //BC 20201204
    mutable bool _hasBigCopy = false;           //BC 20201204
    mutable bool _hasBigDepth = false;          //BC 20201204
*/
    mutable ThreadResourceManager *_threadResourceManager = nullptr;
    mutable RecordThread *_recordThread = nullptr;
    mutable RecordThread *_recordSourceThread = nullptr;
    mutable int _recordSourceId = 0;
    mutable DataRollRecord *_record = nullptr;
    mutable DataRoll *_dataRoll = nullptr;
    mutable DataRollRecord *_copyRecord = nullptr;
    mutable bool _initialised = false;
    mutable bool _hasDataRoll = false;
    mutable bool _dataRollLoaded = false;
    const BlockCluster *_cluster = nullptr;
    Tank* _tank = nullptr;
    //const TankIterator* _assumptionValue = nullptr;
    //const TankIterator* _assumptionLink = nullptr;
    
    //BC 20201209           following variables are moved here from protected section
    mutable BlockResult *_blockResult = nullptr;
    mutable PeriodSector *_sectorDockHead = nullptr;
    mutable PeriodSector *_sectorDockTail = nullptr;
    mutable bool _sharedResultLoaded = false;
    mutable bool _sharedResultExpanded = false;
    
    mutable int _copyCalculationLoopControl = 0;
    mutable int _nodeCalculationLoopControl = 0;

    mutable int _calculatedSeriesLength = 0;
    mutable bool _internalSignatureVariableLoaded = false;
    mutable int _signatureLength = 0;
    mutable unsigned char *_interalSignatureVariables = nullptr;

    HypMap _seriesNameMap = HypMap(nullptr);
    HypMap _variableNameMap = HypMap(nullptr);
    HypMap _blockLinkNameMap = HypMap(nullptr);
    HypMap _tableNameMap = HypMap(nullptr);
    HypList copyChildren = HypList(nullptr, nullptr, nullptr);
    HypMap copyChildrenMap = HypMap(nullptr);
    HypMap deepChildren = HypMap(nullptr);
    // NumHypMap _rebaseLevelMap = NumHypMap(nullptr);
    HypList dataGroupIndex = HypList(nullptr, nullptr, nullptr);
    
    mutable long _maxCopy = 0;
    mutable long _maxDeep = 0;

    //mutable bool _hasRebasePointCalibrateStart = false;       //20201209
    //mutable long _rebasePointCalibrateStartValue = 0;
    //mutable long _rebasePointCalibrateEnd = /*_PROJECTION_START*/-_MAX_TIME_STEP;        //BC 20201209
    //mutable bool _hasRebaseTimePoint = false;
    mutable long _rebaseTimePointValue = 0;
    mutable long _rebasePolicyTimePointValue = 0;
    mutable bool _hasCopySize = false;
    mutable bool _allowManualResize = false;        //BC 20201113
    mutable bool _useMaxCopyFunc = true;           //BC 20201113
    mutable long _defaultCopySize = 0;              //BC 20201113
    mutable /*int*/long _copySizeValue = 0;         //BC 20201113
    mutable const Block *_rebaseBaseBlockValue = nullptr;     //20201209
    mutable bool _hasRebaseBaseBlock = false;
    mutable SuperString _childNameValue;
    //mutable const StringNode *_childNameValue = nullptr;
    mutable bool _hasChildName = false;
    mutable bool _hasChildIndexName = false;
    mutable bool _isCleaningUp = false;
    mutable bool _hasReset = false;
    mutable bool _resultUpdated = false;
    mutable bool _isUpdatingResult = false;
    mutable bool _hasOutput = false;
    void _getExistingResult() const;
    void _cutChild(const long &) const;              //BC 20201204
    GeneralMemoryChunk *_chunk = nullptr;
    ValueUnion _key;
    const HypMapCore* _refMap = nullptr;
    const HypMapItem* _refItem = nullptr;
    bool _entryBlock = false;

    long _copySize() const;

    //long _rebasePointCalibrateStart() const;
    void _getReadyForRecord(DataRollRecord *const &record) const;

    void _resize(const long &, const bool &) const;
    long _resizeFromData() const;
    Block *_getDepth(const long &) const;

    void _setClusterVariables();
    void _updateResult() const;
    void _reset(bool resetRecord, bool resetDependence, bool resetLink, bool detachTable) const;
    void _detachAllTable(bool detachDependence,bool detachChild) const;
    inline void _reset()const {this->_reset(true, true, true, true);};
    
    void _loadBlockSettings();

    //double _calc_rebaseLevel(const long &, const SeriesBase &) const;
    mutable OutputPageNode *_bindPage = nullptr;
    mutable OutputPageNode *_outputPageNode = nullptr;
    mutable HypMap *_outputLinks = nullptr;
    mutable HypMap *_outputPages = nullptr;
    mutable bool _baseOuput = false;
    //mutable OutputPage *_outputPage = nullptr;
    void _accOutput() const;
    void _updateOutputBind() const;
    void _accOutput(const long& sectorID) const;
    const bool _rebaseDepth;
    inline void _setRebaseTime(const long& t) const{this->_setRebaseTime(t,true);};
    void _setRebaseTime(const long&, bool) const;
    void configDataRoll(DataRoll*) const;
    const Block* generateBlockFromGroupIndex(HypListItem*, DataRollRecord*) const;
    void _returnMemory(bool) const;
    void _bindPageNode() const;
    void _archiveBindPage() const;
    virtual inline void _archive() override {this->_shrinkMemory(false);};
    virtual void _truncate();
    bool _useSlidingWindow = false;
    void _movingSlidingWindow(const long&) const;
    mutable long _maxStepLoaded = 0;
    mutable long _minStepLoaded = 0;

    long _calc__ENTRY_T(const VariableBase &)const;
    long _calc__ENTRY_T_RAW(const VariableBase &)const;
    long _calc__ENTRY_DATE(const VariableBase &)const;
    std::string _calc__PROD_CODE(const VariableBase &)const;
    std::string _calc__MODEL_CODE(const VariableBase &)const;

    mutable std::vector<double>* _resTank = nullptr; // result reading
    mutable std::vector<double>* _singleResTank = nullptr; // result reading
    mutable std::vector<long long> _res_start_pos; // result reading
    NumHypMap _resColHeaderMap = NumHypMap(nullptr); // result reading
    NumHypMap _singleResColHeaderMap = NumHypMap(nullptr); // result reading
    mutable bool _reloadResults = true; // result reading
    TableBase _RESULT_INDEX_TABLE = TableBase(this, Block::VARIABLES._RESULT_INDEX_TABLE, "_RESULT_INDEX_TABLE", VariableBase::Source::DEFAULT);
    StringVariableBase _RESULT_INDEX_NODE = StringVariableBase(this, Block::VARIABLES._RESULT_INDEX_NODE, "_RESULT_INDEX_NODE", VariableBase::Source::DEFAULT);
    IntegerVariableBase _RESULT_INDEX_SUBNODE = IntegerVariableBase(this, Block::VARIABLES._RESULT_INDEX_SUBNODE, "_RESULT_INDEX_SUBNODE", VariableBase::Source::DEFAULT);
    
    bool _loadSingleResultFile(std::vector<double> *cellValues, const std::string& file_name, const long long& startPos, long long blockLength, const long& colNo) const; // result reading
    long _updateResultColHeaders(const HypMap& resColHeaderMap, const std::string& file_name) const; // for result read
    long _getResultColNo(const HypMap& resColHeaderMap, const std::string& file_name) const; // for result read
    double _getValueFromResult(std::vector<double> *valueTank, const long& colNo, const long& colID, const long& prd, const long& minTime, const long& maxTime, const double& grossup_factor = 1., const long& timeOffset = 0) const;
    double _setValueFromResult(std::vector<double> *valueTank, const SeriesBase& series, const long& colNo, const long& colID, const long& prd, const long& minTime, const long& maxTime, const double& grossup_factor = 1., const long& timeOffset = 0) const;
    long _loadSingleResult(const SuperString& nodeName, const SuperString& indexFileName, const long& maxTimeLoadSize = 1296) const;
    long _loadResults(const long& maxTimeLoadSize = 1296) const;
    long _addNodeForLastIndexFile(const SuperString& nodeName, const long& subGroup = 0, bool checkDuplicate = false) const;

    

};

template <typename ME>
Block::Profile<ME>::Profile(Block *(*blockFunc)(const BlockCluster *const &, const Block *const &, const bool &, const long &, GeneralMemoryChunk *const &), const bool &direct) {
    
    this->_blockFunc = blockFunc;
    
    if(direct) {
        
        this->_navigator = this->addNavigator(ME::NAME, sizeof(ME), this->_blockFunc);
        this->registerToProjection(this->_navigator);
        
        std::cout << "block registered: [" << this->_navigator->blockName << "]" << std::endl;
    }
}

template <typename ME>
void Block::Profile<ME>::registerToProjection(Navigator *const &navigator) {
    
    this->linkNavigator<ME>(navigator);
    
    if(ME::PROFILE._navigator) {
        ME::PROFILE._navigator->_familyTree._getItem(navigator->blockName, true)->_setPointer(navigator);
    }
}


double _pv_irr(const SeriesBase& ncf_b, const SeriesBase& ncf_m, const SeriesBase& ncf_e, const double& irr_rate, int periodStart, int periodEnd);
double _pv_irr(const SeriesBase& ncf_b, const SeriesBase& ncf_e, const double& irr_rate, int periodStart, int periodEnd);
double _pv_irr(const SeriesBase& ncf_e, const double& irr_rate, int periodStart, int periodEnd);

double _irr(const SeriesBase& ncf_b, const SeriesBase& ncf_m, const SeriesBase& ncf_e, int periodStart, int periodEnd, const double& targetVal, const double& guess_1, const double& guess_2);
double _irr(const SeriesBase& ncf_b, const SeriesBase& ncf_e, int periodStart, int periodEnd, const double& targetVal, const double& guess_1, const double& guess_2);
double _irr(const SeriesBase& ncf_e, int periodStart, int periodEnd, const double& targetVal, const double& guess_1, const double& guess_2);

inline double _irr(const SeriesBase& ncf_e, int periodStart, int periodEnd, const double& targetVal){return _irr(ncf_e, periodStart, periodEnd, targetVal,0.01,0.15);};
inline double _irr(const SeriesBase& ncf_b, const SeriesBase& ncf_e, int periodStart, int periodEnd, const double& targetVal){return _irr(ncf_b,ncf_e, periodStart, periodEnd, targetVal,0.01,0.15);};
inline double _irr(const SeriesBase& ncf_b, const SeriesBase& ncf_m, const SeriesBase& ncf_e, int periodStart, int periodEnd, const double& targetVal){return _irr(ncf_b, ncf_m, ncf_e, periodStart, periodEnd, targetVal,0.01,0.15);};
double simpleGoalSeekIteration(const std::function<double(const double&)>&, const double& targetRes, double guess_1, double guess_2);//no reset, for irr

//_CODE_END_

#endif /* Block_hpp */
