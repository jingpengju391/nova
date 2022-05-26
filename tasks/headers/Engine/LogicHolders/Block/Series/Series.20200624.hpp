//
//  Series.20200624.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2020/06/24.
//  Copyright © 2020年 陈曦. All rights reserved.
//

#ifndef Series_20200624_hpp
#define Series_20200624_hpp

#include <stdio.h>
#include <iostream>
#include <string>

#include "Functions.hpp"
#include "Definitions.hpp"
#include "Switcher.20200803.hpp"
#include "GeneralMemoryManager.hpp"
#include "Period.20191126.hpp"

class Block;
class RecordThread;
class ThreadResourceManager;
class OutputLine;
//_CODE_START_



class SeriesBase {

    friend class Block;
    friend class Period;
    friend class RecordThread;
    friend class PeriodSector;
    friend class Target;
    friend class OutputPageNode;
    friend class OutputLine;
    friend class GeneralException;
    friend class IllegalConvertError;
    friend class FloatVariableBase;
    friend class SeriesBase;
public:

    enum SeriesType {
        UNSPECIFIED,
        FORMULA,
        BLOCKSUM,
        AUTOSUM,
        CHANNEL,
        CHILD,
        TO_DEFINE,
    };
    
    enum RebaseType {
        
        NO_REBASE                          = 0,
        REBASE_AFTER_REBASE_TIME           = 1,
        REBASE_FROM_REBASE_TIME            = 2,
        REBASE_FROM_BEGIN_TIME             = 3,
    };
    
    class PeriodDataChanger: public ChunkDataChangeListener {
        
        friend class PeriodSector;
        friend class SeriesBase;
        
    protected:
        
        virtual void onDataChange(const ptrdiff_t &) const override;
        
    private:
        
        SeriesBase *_owner = nullptr;
    };
    class PeriodIterationChanger: public ChunkDataChangeListener {
        
        friend class PeriodSector;
        friend class SeriesBase;
        
    protected:
        
        virtual void onDataChange(const ptrdiff_t &) const override;
        
    private:
        
        SeriesBase *_owner = nullptr;
    };
    
    const Block *const _owner;                              //BC 20201209
    const SuperString &_seriesName;
    const SystemConstant::ItemType _itemType;              //BC 20201206

    const long _copyId;
    const long _depthId;
    const long _level;
    //const bool _isRebaseLevel;
    const bool _isDepth;
    const SeriesBase *const _ownerSeries;                   //BC 20201209
    const SeriesBase *const _baseSeries;                    //BC 20201209
    mutable bool _returnPeerModelValueBfRebase = true;
    //TO DEFINE

    SeriesBase(const Block *const &, const SuperString &);
    SeriesBase(const Block *const &, const SuperString &, const long&);
    //rebase

    SeriesBase(const Block *const &, const SuperString &, double (Block::*)(const long &, const SeriesBase &) const, bool);

    //NORMAL

    template <typename B>
    SeriesBase(const B *const &, const SuperString &, double (B::*)(const long &, const SeriesBase &) const);
    template <typename B>
    SeriesBase(const B *const &, const SuperString &, double (B::*)(const long &, const SeriesBase &) const, long (B::*)(const SeriesBase &) const, const SeriesBase &(B::*)(const SeriesBase &) const);

    template <typename B>
    SeriesBase(const B *const &, const SuperString &, double (B::*)(const long &, const SeriesBase &) const, const /*int*/long &);           //BC 20201113
    template <typename B>
    SeriesBase(const B *const &, const SuperString &, double (B::*)(const long &, const SeriesBase &) const, const /*int*/long &, long (B::*)(const SeriesBase &) const, const SeriesBase &(B::*)(const SeriesBase &) const);           //BC 20201113

    template <typename B>
    SeriesBase(const B *const &, const SuperString &, double (B::*)(const long &, const SeriesBase &) const, /*int*/long (B::*)(const SeriesBase &) const);      //BC 20201113
    template <typename B>
    SeriesBase(const B *const &, const SuperString &, double (B::*)(const long &, const SeriesBase &) const, /*int*/long (B::*)(const SeriesBase &) const, long (B::*)(const SeriesBase &) const, const SeriesBase &(B::*)(const SeriesBase &) const);        //BC 20201113

    //AUTOSUM
    /*      //BC 20201113
    template <typename B>
    SeriesBase(const B *const &, const SuperString &, double (B::*)(const int &, const SeriesBase &) const, const int &, const int &);
    template <typename B>
    SeriesBase(const B *const &, const SuperString &, double (B::*)(const int &, const SeriesBase &) const, const int &, const int &, int (B::*)(const SeriesBase &) const, const SeriesBase &(B::*)(const SeriesBase &) const);

    template <typename B>
    SeriesBase(const B *const &, const SuperString &, double (B::*)(const int &, const SeriesBase &) const, int (B::*)(const SeriesBase &) const, const int &);
    template <typename B>
    SeriesBase(const B *const &, const SuperString &, double (B::*)(const int &, const SeriesBase &) const, int (B::*)(const SeriesBase &) const, const int &, int (B::*)(const SeriesBase &) const, const SeriesBase &(B::*)(const SeriesBase &) const);
    */

    //CHANNEL & BLOCKSUM

    template <typename B>
    SeriesBase(const B *const &, const SuperString &, const SeriesBase &(B::*)() const, const bool &);
    //BC 20201113 for BlockSum Series, the copy size setting should follow its channel
    /*template <typename B>
    SeriesBase(const B *const &, const SuperString &, const SeriesBase &(B::*)() const, const int &);
    template <typename B>
    SeriesBase(const B *const &, const SuperString &, const SeriesBase &(B::*)() const, int (B::*)(const SeriesBase &) const);*/
    
    inline double operator [] (const int &step) const{return this->operator[](long(step));};
    inline double operator [] (const double &step) const{return this->operator[](long(step));};
    
    inline double operator [] (const long &step) const
    {return this->_checkStep(step) ? (*(bool *)this->_periodCursor ? *(double *)(((unsigned char *)this->_periodCursor) + sizeof(bool)) : ((Period *)(((unsigned char *)this->_periodCursor) + Period::POS_ADJ))->_value(this, step)) : this->_getPeriodResult(step);}          //BC 20201125

    bool _calculated(const long &step) const;
    void _setValue(const long &t, const double &value) const;
    void _removeValue(const long &t) const;
    const SeriesBase &operator () (const long &copy) const;
    const SeriesBase &operator () (const SeriesBase &copy) const;
    long _size() const;
    inline long _usedSize() const{return this->_maxCopy;}
    
    
    long _rebaseTimePoint() const;
    long _rebasePolicyTimePoint() const;
    const SeriesBase *_channelSeries() const;
    double _sum(const long &) const;

    template <typename B>
    inline void _convertToNormal(double (B::*periodFunc)(const long &, const SeriesBase &) const) {//senna update
        
        if(this->_seriesType == SeriesBase::SeriesType::TO_DEFINE) {
            this->_initialiseSeries(false, true);
            /*this->_seriesType = SeriesBase::SeriesType::FORMULA;
            this->_periodFunc.getFormula(this->_owner, periodFunc);*/
        }
        else {
            this->_initialiseSeries(false, false);
            /*this->_seriesType = SeriesBase::SeriesType::FORMULA;
            this->_periodFunc.getFormula(this->_owner, periodFunc);*/
            //throw new IllegalConvertError(this);
        }
        //BC 20201204
        this->_seriesType = SeriesBase::SeriesType::FORMULA;
        this->_periodFunc.getFormula(this->_owner, periodFunc);
    }
    
    template <typename B>
    inline void _convertToNormal(double (B::*periodFunc)(const long &, const SeriesBase &) const, int (B::*rebaseFunc)(const SeriesBase &) const, const SeriesBase & (B::*rebaseBaseFunc)(const SeriesBase &) const) {
        
        if(this->_seriesType == SeriesBase::SeriesType::TO_DEFINE) {
            this->_initialiseSeries(false, true);
            /*this->_seriesType = SeriesBase::SeriesType::FORMULA;
            this->_rebaseNeeded = true;
            this->_periodFunc.getFormula(this->_owner, periodFunc);
            this->_rebaseFunc.getFormula(this->_owner, rebaseFunc);
            this->_rebaseBaseFunc.getFormula(this->_owner, rebaseBaseFunc);*/
        }
        else {
            this->_initialiseSeries(false, false);
            /*this->_seriesType = SeriesBase::SeriesType::FORMULA;
            this->_rebaseNeeded = true;
            this->_periodFunc.getFormula(this->_owner, periodFunc);
            this->_rebaseFunc.getFormula(this->_owner, rebaseFunc);
            this->_rebaseBaseFunc.getFormula(this->_owner, rebaseBaseFunc);*/
            //throw new IllegalConvertError(this);
        }
        //BC 20201204
        this->_seriesType = SeriesBase::SeriesType::FORMULA;
        this->_rebaseNeeded = true;
        this->_periodFunc.getFormula(this->_owner, periodFunc);
        this->_rebaseFunc.getFormula(this->_owner, rebaseFunc);
        this->_rebaseBaseFunc.getFormula(this->_owner, rebaseBaseFunc);
    }
    
    template <typename B>
    inline void _convertToNormal(double (B::*periodFunc)(const long &, const SeriesBase &) const, const long &defaultCopySize) {
        
        if(this->_seriesType == SeriesBase::SeriesType::TO_DEFINE) {
            this->_initialiseSeries(false, true);
            /*this->_seriesType = SeriesBase::SeriesType::FORMULA;
            this->_periodFunc.getFormula(this->_owner, periodFunc);
            this->_defaultCopySize = defaultCopySize;*/
        }
        else {
            this->_initialiseSeries(false, false);
            /*this->_seriesType = SeriesBase::SeriesType::FORMULA;
            this->_periodFunc.getFormula(this->_owner, periodFunc);
            this->_defaultCopySize = defaultCopySize;*/
        }
        //BC 20201204
        this->_seriesType = SeriesBase::SeriesType::FORMULA;
        this->_periodFunc.getFormula(this->_owner, periodFunc);
        this->_defaultCopySize = defaultCopySize;
    }
    
    template <typename B>
    inline void _convertToNormal(double (B::*periodFunc)(const long &, const SeriesBase &) const, const long &defaultCopySize, long (B::*rebaseFunc)(const SeriesBase &) const, const SeriesBase & (B::*rebaseBaseFunc)(const SeriesBase &) const) {
        
        if(this->_seriesType == SeriesBase::SeriesType::TO_DEFINE) {
            this->_initialiseSeries(false, true);
            /*this->_seriesType = SeriesBase::SeriesType::FORMULA;
            this->_rebaseNeeded = true;
            this->_periodFunc.getFormula(this->_owner, periodFunc);
            this->_rebaseFunc.getFormula(this->_owner, rebaseFunc);
            this->_rebaseBaseFunc.getFormula(this->_owner, rebaseBaseFunc);
            this->_defaultCopySize = defaultCopySize;*/
        }
        else {
            this->_initialiseSeries(false, false);
            /*this->_seriesType = SeriesBase::SeriesType::FORMULA;
            this->_rebaseNeeded = true;
            this->_periodFunc.getFormula(this->_owner, periodFunc);
            this->_rebaseFunc.getFormula(this->_owner, rebaseFunc);
            this->_rebaseBaseFunc.getFormula(this->_owner, rebaseBaseFunc);
            this->_defaultCopySize = defaultCopySize;*/
        }
        //BC 20201204
        this->_seriesType = SeriesBase::SeriesType::FORMULA;
        this->_rebaseNeeded = true;
        this->_periodFunc.getFormula(this->_owner, periodFunc);
        this->_rebaseFunc.getFormula(this->_owner, rebaseFunc);
        this->_rebaseBaseFunc.getFormula(this->_owner, rebaseBaseFunc);
        this->_defaultCopySize = defaultCopySize;
    }
    
    template <typename B>
    inline void _convertToNormal(double (B::*periodFunc)(const long &, const SeriesBase &) const, long (B::*copySizeFunc)(const SeriesBase &) const) {
        
        if(this->_seriesType == SeriesBase::SeriesType::TO_DEFINE) {
            this->_initialiseSeries(false, true);
            /*this->_seriesType = SeriesBase::SeriesType::FORMULA;
            this->_periodFunc.getFormula(this->_owner, periodFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;*/
        }
        else {
            this->_initialiseSeries(false, false);
            /*this->_seriesType = SeriesBase::SeriesType::FORMULA;
            this->_periodFunc.getFormula(this->_owner, periodFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;*/
        }

        //BC 20201204
        this->_seriesType = SeriesBase::SeriesType::FORMULA;
        this->_periodFunc.getFormula(this->_owner, periodFunc);
        this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
        this->_hasCopySizeFunc = true;
        this->_useCopySizeFunc = true;
    }
    
    template <typename B>
    inline void _convertToNormal(double (B::*periodFunc)(const long &, const SeriesBase &) const, long (B::*copySizeFunc)(const SeriesBase &) const, long (B::*rebaseFunc)(const SeriesBase &) const, const SeriesBase & (B::*rebaseBaseFunc)(const SeriesBase &) const) {
        
        if(this->_seriesType == SeriesBase::SeriesType::TO_DEFINE) {
            this->_initialiseSeries(false, true);
            /*this->_seriesType = SeriesBase::SeriesType::FORMULA;
            this->_rebaseNeeded = true;
            this->_periodFunc.getFormula(this->_owner, periodFunc);
            this->_rebaseFunc.getFormula(this->_owner, rebaseFunc);
            this->_rebaseBaseFunc.getFormula(this->_owner, rebaseBaseFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;*/
        }
        else {
            this->_initialiseSeries(false, false);
            /*this->_seriesType = SeriesBase::SeriesType::FORMULA;
            this->_rebaseNeeded = true;
            this->_periodFunc.getFormula(this->_owner, periodFunc);
            this->_rebaseFunc.getFormula(this->_owner, rebaseFunc);
            this->_rebaseBaseFunc.getFormula(this->_owner, rebaseBaseFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;*/
        }
        //BC 20201204
        this->_seriesType = SeriesBase::SeriesType::FORMULA;
        this->_rebaseNeeded = true;
        this->_periodFunc.getFormula(this->_owner, periodFunc);
        this->_rebaseFunc.getFormula(this->_owner, rebaseFunc);
        this->_rebaseBaseFunc.getFormula(this->_owner, rebaseBaseFunc);
        this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
        this->_hasCopySizeFunc = true;
        this->_useCopySizeFunc = true;
    }
    
    template <typename B>
    inline void _convertToBlockSum(const SeriesBase &(B::*seriesFunc)() const) {
        
        if(this->_seriesType == SeriesBase::SeriesType::TO_DEFINE) {
            this->_initialiseSeries(false, true);
            /*this->_seriesType = SeriesBase::SeriesType::BLOCKSUM;
            this->_seriesFunc.getFormula(this->_owner, seriesFunc);*/
        }
        else {
            this->_initialiseSeries(false, false);
            /*this->_seriesType = SeriesBase::SeriesType::BLOCKSUM;
            this->_seriesFunc.getFormula(this->_owner, seriesFunc);*/
        }
        //BC 20201204
        this->_seriesType = SeriesBase::SeriesType::BLOCKSUM;
        this->_seriesFunc.getFormula(this->_owner, seriesFunc);
    }

    template <typename B>
    inline void _convertToBlockSum(const SeriesBase &(B::*seriesFunc)() const, const long &defaultCopySize) {
        
        if(this->_seriesType == SeriesBase::SeriesType::TO_DEFINE) {
            this->_initialiseSeries(false, true);
            /*this->_seriesType = SeriesBase::SeriesType::BLOCKSUM;
            this->_seriesFunc.getFormula(this->_owner, seriesFunc);
            this->_defaultCopySize = defaultCopySize;*/
        }
        else {
            this->_initialiseSeries(false, false);
            /*this->_seriesType = SeriesBase::SeriesType::BLOCKSUM;
            this->_seriesFunc.getFormula(this->_owner, seriesFunc);
            this->_defaultCopySize = defaultCopySize;*/
        }
        //BC 20201204
        this->_seriesType = SeriesBase::SeriesType::BLOCKSUM;
        this->_seriesFunc.getFormula(this->_owner, seriesFunc);
        this->_defaultCopySize = defaultCopySize;
    }
    
    template <typename B>
    inline void _convertToBlockSum(const SeriesBase &(B::*seriesFunc)() const, long (B::*copySizeFunc)(const SeriesBase &) const) {
        
        if(this->_seriesType == SeriesBase::SeriesType::TO_DEFINE) {
            this->_initialiseSeries(false, true);
            /*this->_seriesType = SeriesBase::SeriesType::BLOCKSUM;
            this->_seriesFunc.getFormula(this->_owner, seriesFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;*/
        }
        else {
            this->_initialiseSeries(false, false);
            /*this->_seriesType = SeriesBase::SeriesType::BLOCKSUM;
            this->_seriesFunc.getFormula(this->_owner, seriesFunc);
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;*/
        }
        //BC 20201204
        this->_seriesType = SeriesBase::SeriesType::BLOCKSUM;
        this->_seriesFunc.getFormula(this->_owner, seriesFunc);
        this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
        this->_hasCopySizeFunc = true;
        this->_useCopySizeFunc = true;
    }
    
    template <typename B>
    inline void _convertToChannel(const SeriesBase &(B::*seriesFunc)() const) {
        
        if(this->_seriesType == SeriesBase::SeriesType::TO_DEFINE) {
            this->_initialiseSeries(false, false);
            /*this->_seriesType = SeriesBase::SeriesType::CHANNEL;
            this->_seriesFunc.getFormula(this->_owner, seriesFunc);*/
        }
        else {
            this->_initialiseSeries(false, false);
            /*this->_seriesType = SeriesBase::SeriesType::CHANNEL;
            this->_seriesFunc.getFormula(this->_owner, seriesFunc);*/
        }
        //BC 20201204
        this->_seriesType = SeriesBase::SeriesType::CHANNEL;
        this->_seriesFunc.getFormula(this->_owner, seriesFunc);
    }
    void turnOnAutoSumFunction();
    void turnOffAutoSumFunction();
    void setAutoSumLevel(const long &level);

    void _extendCopySize(const long &size) const;
    mutable RebaseType _rebaseType = RebaseType::REBASE_AFTER_REBASE_TIME;
    
private:
    
    SeriesBase(const SeriesBase *const &, const bool &, const long &, GeneralMemoryChunk *const &);

    int _calculateId = -1;
    SeriesType _seriesType = SeriesBase::SeriesType::UNSPECIFIED;
    
    const ThreadResourceManager *_threadResourceManager = nullptr;
    mutable PeriodSector *_periodGeneratedHead = nullptr;
    mutable PeriodSector *_periodGeneratedTail = nullptr;
    mutable PeriodSector *_periodIterationHead = nullptr;
    mutable PeriodSector *_periodIterationTail = nullptr;

    mutable long _maxStepLoaded = 0;
    mutable long _minStepLoaded = 0;
    mutable long _maxStepIterationLoaded = 0;
    mutable long _minStepIterationLoaded = 0;
    //mutable bool _dataChanged = false;
    mutable PeriodStep *_periodCursor = nullptr;
    mutable long _periodCursorStep = 0;
    mutable IterationUnit *_periodIterationCursor = nullptr;
    mutable long _periodIterationCursorStep = 0;
    bool _unmute = true;
    mutable bool _outputTag = false;            
    //bool _toOutput = false;                        

    GeneralMemoryChunk *_chunk = nullptr;
    
    mutable ConstFormulaHolder<double, const long &, const SeriesBase &> _periodFunc;
    mutable ConstFormulaHolder<const SeriesBase &> _seriesFunc;
    mutable ConstFormulaHolder<long, const SeriesBase &> _rebaseFunc;
    mutable ConstFormulaHolder</*int*/long, const SeriesBase &> _copySizeFunc;      //BC 20201113
    mutable ConstFormulaHolder<const SeriesBase &, const SeriesBase &> _rebaseBaseFunc;

    /*int*/long _defaultCopySize = 0;               //BC 20201113
    bool _rebaseNeeded = false;
    bool _allowManualResize = false;                //BC 20201113
    bool _hasCopySizeFunc = false;
    bool _useCopySizeFunc = false; 
    mutable int _copyCalculationLoopControl = 0;
    mutable int _channelCalculationLoopControl = 0;
    mutable int _calculationLoopControl = 0;
    //mutable long _rebasePointCalibrateEnd = /*_PROJECTION_START*/-_MAX_TIME_STEP;        //BC 20201209
    mutable /*int*/long _copySizeValue = 0;         //BC 20201113
    mutable bool _hasCopySize = false;
    mutable const SeriesBase *_channelSeriesValue = nullptr;
    mutable bool _hasChannelSeries = false;
    mutable const SeriesBase *_rebaseBaseSeriesValue = nullptr;
    mutable bool _hasRebaseBaseSeries = false;
    mutable long _rebaseTimePointValue = 0;
    mutable long _rebasePolicyTimePointValue = 0;
    mutable bool _hasRebaseTimePoint = false;
    mutable bool _hasRebasePolicyTimePoint = false;
    //mutable long _rebasePointCalibrateStartValue = 0;
    //mutable bool _hasRebasePointCalibrateStart = false;
    mutable long _autoSumLevel = 0;

    mutable long _maxCopy = 0;
    mutable long _maxDeep = 0;

    HypList copyChildren = HypList(nullptr, nullptr, nullptr);
    HypList deepChildren = HypList(nullptr, nullptr, nullptr);

    mutable long _copyLength = 0;
    mutable long _deepLength = 0;
    mutable bool _iterationStart = false;
    unsigned char _periodDataChanger[sizeof(SeriesBase::PeriodDataChanger)];
    unsigned char _periodIterationChanger[sizeof(SeriesBase::PeriodIterationChanger)];


    void _initialiseSeries(bool, bool);
    double _getSumFromCopy(const long &) const;
    double _getSumFromOwnCopy(const long &) const;
    double _getAutoSumFromCopy(const long &) const;

    inline Period *_period(const long &step) const
    {return this->_checkStep(step) ? (Period *)(((unsigned char *)this->_periodCursor) + Period::POS_ADJ) : this->_getPeriodSector(step);}

    inline IterationUnit *_periodIteration(const long &step) const
    {return this->_checkIterationStep(step) ? this->_periodIterationCursor : this->_getPeriodIterationSector(step);}
      
    inline Period *_getPeriod(const long &step) const
    {return this->_seriesType == SeriesBase::SeriesType::FORMULA || this->_seriesType == SeriesBase::SeriesType::AUTOSUM || this->_seriesType == SeriesBase::SeriesType::BLOCKSUM || this->_seriesType == SeriesBase::SeriesType::CHILD ? this->_period(step) : (this->_seriesType == SeriesBase::SeriesType::CHANNEL ? this->_channelSeries()->_getPeriod(step) : this->_throwUndefinedMePtr());}

    void _resetPeriod(const long &timeStepIndex) const;
    long _getCopySize(const SeriesBase &series) const;
    long _getRebasePoint(const long &level, const SeriesBase &series) const;
    const SeriesBase *_getRebaseBaseSeries(const SeriesBase &series) const;

    inline double _getPeriodProjection(const long &timeStep, const SeriesBase &series) const
    {return this->_seriesType == SeriesBase::SeriesType::FORMULA ? this->_periodFunc.calculateWithFormula(timeStep, series) : (this->_seriesType == SeriesBase::SeriesType::AUTOSUM ? series._getAutoSumFromCopy(timeStep) : (this->_seriesType == SeriesBase::SeriesType::BLOCKSUM ? series._getSumFromCopy(timeStep) : this->_throwUndefinedMe()));}
    
    SeriesBase *_getCopy(const long &copy) const;
    SeriesBase *_getDepth(const long &depth) const;
    
    inline double _getPeriodProjection(const long &timeStep) const
    {return this->_seriesType == SeriesBase::SeriesType::FORMULA ? this->_periodFunc.calculateWithFormula(timeStep, *this) : (this->_seriesType == SeriesBase::SeriesType::AUTOSUM ? this->_getAutoSumFromCopy(timeStep) : (this->_seriesType == SeriesBase::SeriesType::BLOCKSUM ? this->_getSumFromCopy(timeStep) : (this->_seriesType == SeriesBase::SeriesType::CHILD ? this->_baseSeries->_getPeriodProjection(timeStep, *this) : this->_throwUndefinedMe())));}

    void _resetPeriod(const long &timeStepIndex, const double &value) const;
    void _reset() const;
    void _resize(const /*int*/long &, bool) const;      //BC 20201113
    inline void _returnMemory(){this->_returnMemory(true);};
    void _returnMemory(bool applyChild);
    //long _rebasePointCalibrateStart() const;
    /*int*/long _copySize() const;          //BC 20201113
    const SeriesBase *_rebaseBaseSeries() const;

    bool _checkStep(const long &step) const;
    bool _checkIterationStep(const long &step) const;
    inline double _getPeriodResult(const long &step) const
    {return this->_seriesType == SeriesBase::SeriesType::FORMULA || this->_seriesType == SeriesBase::SeriesType::AUTOSUM || this->_seriesType == SeriesBase::SeriesType::BLOCKSUM || this->_seriesType == SeriesBase::SeriesType::CHILD ? (this->_getPeriodSector(step)->_hasValue() ? *(double *)(((unsigned char *)this->_periodCursor) + sizeof(bool)) : ((Period *)(((unsigned char *)this->_periodCursor) + Period::POS_ADJ))->_value(this, step)) : (this->_seriesType == SeriesBase::SeriesType::CHANNEL ? this->_channelSeries()->operator[](step) : this->_throwUndefinedMe());}           //BC 20201125
    
    double _throwUndefinedMe() const;
    Period *_throwUndefinedMePtr() const;
    Period *_getPeriodSector(const long &) const;
    IterationUnit *_getPeriodIterationSector(const long &) const;

    mutable OutputLine* _bindLine = nullptr;
    void _accOutput();
    void _accOutput(const long& sectorID) const;
    
    
    void _setRebaseTime(const long& rebaseTime) const;
    bool _usingSlidingWindow;
    long _slidingWindowChunk = 1;
    void _movingSlidingWindow(const long&) const;
};

template <typename B>
SeriesBase::SeriesBase(const B *const &oBlock, const SuperString &sName, double (B::*periodFunc)(const long &, const SeriesBase &) const):
_owner(oBlock),
_seriesName(sName),
_seriesType(SeriesBase::SeriesType::FORMULA),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_level(0),
_copyId(0),
_depthId(0),
//_isRebaseLevel(false),
_ownerSeries(nullptr),
_isDepth(false),
_baseSeries(this) {
    
    this->_initialiseSeries(true, true);
    this->_periodFunc.getFormula(this->_owner, periodFunc);
}

template <typename B>
SeriesBase::SeriesBase(const B *const &oBlock, const SuperString &sName, double (B::*periodFunc)(const long &, const SeriesBase &) const, long (B::*rebaseFunc)(const SeriesBase &) const, const SeriesBase &(B::*rebaseBaseFunc)(const SeriesBase &) const):
_owner(oBlock),
_seriesName(sName),
_seriesType(SeriesBase::SeriesType::FORMULA),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_level(0),
_copyId(0),
_depthId(0),
//_isRebaseLevel(false),
_rebaseNeeded(true),
_ownerSeries(nullptr),
_isDepth(false),
_baseSeries(this) {
    
    this->_initialiseSeries(true, true);
    this->_periodFunc.getFormula(this->_owner, periodFunc);
    this->_rebaseFunc.getFormula(this->_owner, rebaseFunc);
    this->_rebaseBaseFunc.getFormula(this->_owner, rebaseBaseFunc);
}

template <typename B>
SeriesBase::SeriesBase(const B *const &oBlock, const SuperString &sName, double (B::*periodFunc)(const long &, const SeriesBase &) const, const long &defaultCopySize):
_owner(oBlock),
_seriesName(sName),
_seriesType(SeriesBase::SeriesType::FORMULA),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_level(0),
_copyId(0),
_depthId(0),
_ownerSeries(nullptr),
_baseSeries(this),
//_isRebaseLevel(false),
_isDepth(false),
_defaultCopySize(defaultCopySize){
    
    this->_initialiseSeries(true, true);
    this->_periodFunc.getFormula(this->_owner, periodFunc);
}

template <typename B>
SeriesBase::SeriesBase(const B *const &oBlock, const SuperString &sName, double (B::*periodFunc)(const long &, const SeriesBase &) const, const long &defaultCopySize, long (B::*rebaseFunc)(const SeriesBase &) const, const SeriesBase &(B::*rebaseBaseFunc)(const SeriesBase &) const):
_owner(oBlock),
_seriesName(sName),
_seriesType(SeriesBase::SeriesType::FORMULA),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_level(0),
_copyId(0),
_depthId(0),
_rebaseNeeded(true),
_ownerSeries(nullptr),
_baseSeries(this),
//_isRebaseLevel(false),
_isDepth(false),
_defaultCopySize(defaultCopySize) {
    
    this->_initialiseSeries(true, true);
    this->_periodFunc.getFormula(this->_owner, periodFunc);
    this->_rebaseFunc.getFormula(this->_owner, rebaseFunc);
    this->_rebaseBaseFunc.getFormula(this->_owner, rebaseBaseFunc);
}

template <typename B>
SeriesBase::SeriesBase(const B *const &oBlock, const SuperString &sName, double (B::*periodFunc)(const long &, const SeriesBase &) const, long (B::*copySizeFunc)(const SeriesBase &) const):
_owner(oBlock),
_seriesName(sName),
_seriesType(SeriesBase::SeriesType::FORMULA),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_level(0),
_copyId(0),
_depthId(0),
_hasCopySizeFunc(true),
_useCopySizeFunc(true),         //BC 20201204
_ownerSeries(nullptr),
//_isRebaseLevel(false),
_isDepth(false),
_baseSeries(this) {
    
    this->_initialiseSeries(true, true);
    this->_periodFunc.getFormula(this->_owner, periodFunc);
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
}

template <typename B>
SeriesBase::SeriesBase(const B *const &oBlock, const SuperString &sName, double (B::*periodFunc)(const long &, const SeriesBase &) const, long (B::*copySizeFunc)(const SeriesBase &) const, long (B::*rebaseFunc)(const SeriesBase &) const, const SeriesBase &(B::*rebaseBaseFunc)(const SeriesBase &) const):
_owner(oBlock),
_seriesName(sName),
_seriesType(SeriesBase::SeriesType::FORMULA),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_level(0),
_copyId(0),
_depthId(0),
_rebaseNeeded(true),
_hasCopySizeFunc(true),
_useCopySizeFunc(true),         //BC 20201204,
_ownerSeries(nullptr),
//_isRebaseLevel(false),
_isDepth(false),
_baseSeries(this) {
    
    this->_initialiseSeries(true, true);
    this->_periodFunc.getFormula(this->_owner, periodFunc);
    this->_rebaseFunc.getFormula(this->_owner, rebaseFunc);
    this->_rebaseBaseFunc.getFormula(this->_owner, rebaseBaseFunc);
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
}

template <typename B>
SeriesBase::SeriesBase(const B *const &oBlock, const SuperString &sName, const SeriesBase &(B::*seriesBlockSumFunc)() const, const bool &isChannel):
_owner(oBlock),
_seriesName(sName),
_seriesType(isChannel ? SeriesBase::SeriesType::CHANNEL : SeriesBase::SeriesType::BLOCKSUM),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_level(0),
_copyId(0),
_depthId(0),
_ownerSeries(nullptr),
//_isRebaseLevel(false),
_isDepth(false),
_baseSeries(this) {
    
    this->_initialiseSeries(true, !isChannel);
    this->_seriesFunc.getFormula(this->_owner, seriesBlockSumFunc);
}

//_CODE_END

#endif //Series_20200624_hpp
