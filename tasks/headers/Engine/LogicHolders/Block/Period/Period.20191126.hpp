//
//  Period.20191126.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2019/11/26.
//  Copyright © 2019 陈曦. All rights reserved.
//

#ifndef Period_20191126_hpp
#define Period_20191126_hpp

#include <stdio.h>

class ThreadResourceManager;
class SeriesBase;
class ResultSector;
class PeriodSector;
class BlockResult;
class RecordThread;

//_CODE_START_

class ResultUnit{
    
    friend class Period;
    friend class SeriesBase;
    friend class DataRollRecord;
    friend class OutputLine;
    friend class OutputPageNode;
    friend class BlockResult;
    friend class Block;                 //BC 20201130
    
//protected:            //BC 20201208
private:
    
    __JZ__result _result = 0;
    bool _calculated = false;
    //char placeHolder[3];
};

class IterationUnit{
    
    friend class Period;
    friend class SeriesBase;
    friend class FloatVariableBase;
    friend class IntegerVariableBase;

private:
    
    __JZ__result _lastGuess = 0.15;
    __JZ__result _currentGuess = 0.15;
    __JZ__result _lastResult = 0.;
    void setNextIteration(const __JZ__result& currentResult);
};

class Period {
    
    friend class SeriesBase;
    friend class RecordThread;
    friend class Block;
    friend class DataRollRecord;
    friend class PeriodSector;
    friend class OutputLine;
    friend class BlockResult;
    
public:
    
    //Period(const SeriesBase *const &, const int &);   //bc 2021125 move to private
    
    /*inline operator double () const                   //BC 20201125
    {return this->_value();}*/
    
    /*              //BC 20201125 move to private
    inline bool _hasValue() NOEXCEPT {
        
        void *pt = this;
        unsigned char *p = (unsigned char *)pt;
        p = p - Period::POS_ADJ;
        
        return *(bool *)p;
    }
    */

    const static long SIZE;
    const static long POS_ADJ;
    
private:                                                    //BC 20201125
    
    Period(const bool &/*const SeriesBase *const &, const int &*/);     //BC 20201125


    //ResultUnit *_resultUnit = nullptr;//removed 20210427


    
    mutable unsigned char _loopControl = 0;
    
    bool _rebase = false;
    mutable bool _iterationStart = false;

    double _value(const SeriesBase *, const long &) const;
    double _valueFromNewThread(RecordThread*, const SeriesBase *, const long &) const;
    inline double _storedValue() {
        
        void *pt = this;
        unsigned char *p = (unsigned char *)pt;
        p = p - sizeof(double);
        
        return *(double *)p;
    }

    inline bool _hasValue() NOEXCEPT {              //BC 20201125
        
        void *pt = this;
        unsigned char *p = (unsigned char *)pt;
        p = p - Period::POS_ADJ;
        
        return *(bool *)p;
    }
    void _setValue(const double&) const;
};

struct PeriodStep {
    unsigned char placeHolder[sizeof(Period) + sizeof(double) + sizeof(bool)];
};

enum SectorStatus {
    NONE,
    PERIOD,
    RESULT,
    OUTPUT,
    OUTPUT_DOCK,
    SERIES_DOCK,
    SHARE,
    PERIOD_ITERATION,
};

class PeriodSector: ChunkDataChangeListener {
    
    friend class BlockResult;
    friend class OutputPageNode;
    friend class Block;
    friend class SeriesBase;
    friend class OutputFolder;
    friend class OutputLine;
    friend class GeneralMemoryPool;
    friend class Navigator;
    friend class PeriodSector;
    friend class RecordThread;
    friend class Period;
protected:
    
    PeriodSector(const long&, const long &, const SectorStatus &, GeneralMemoryChunk *const &);
    
    long _startIndex = _ERROR_INTEGER;
    long _sectorId = _ERROR_INTEGER;
    long _sectorPos = _ERROR_INTEGER;
    bool _isDataChanger = false;
    bool _fullContent = false;
    
    SectorStatus _status = SectorStatus::NONE;
    void onDataChange(const ptrdiff_t &) const override;
    
    PeriodSector *_previous = nullptr;
    PeriodSector *_next = nullptr;
    PeriodSector *_pinSector = nullptr;
    mutable GeneralMemoryChunk *_directResult = nullptr;    
    
private:
    
    GeneralMemoryChunk *_chunk = nullptr;
    mutable GeneralMemoryChunk *_sectorContentChunk = nullptr;
    //SingleLock _lock = Singlelock(true);
};


#endif /* Period_20191126_hpp */
