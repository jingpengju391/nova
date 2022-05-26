//
//  Target.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2018/1/10.
//  Copyright © 2018年 陈曦. All rights reserved.
//

#ifndef Target_hpp
#define Target_hpp

#include <stdio.h>
#include "Series.20200624.hpp"

class RecordThread;

//_CODE_START_

class Target {
    
    friend class RecordThread;
    friend class DataRollRecord;
    friend class DataRoll;
    friend class Beam;
    friend class TXTDataRoll;
    friend class GeneralException;
    
public:
    
    ~Target();
    
    enum TargetType{

        UNSPECIFIED,
        SERIES,
        VARIABLE,
        DOUBLE_VARIABLE,
        LONG_VARIABLE,
        STR_VARIABLE,
    };
    
//protected:            //BC 20201208
private:
    
    Target(const SuperString &, const SuperString &, const SuperString &, bool, bool);
    Target(Target *, RecordThread *);

    void getResult(HypList *const &, int &);
    void getVariableResult(HypList *const &, int &);
    void getSeriesResult(HypList *const &, int &, const long&);

    const SuperString &_targetName;
    TargetType _type = TargetType::UNSPECIFIED;
    
    RecordThread *_thread = nullptr;
    
    const SuperString &_itemName;
    const SuperString &_rootName;
    Block *_rootBlock = nullptr;
    void *_targetItem = nullptr;
    bool _linkChainChecked = false;
    
    HypList _linkName;
    int _from = 0;
    int _span = 0;
    int _outputFrom = 0;
    int _outputSpan = 0;    
    bool _needOutput = false;
    bool _staticLink = false;
};

//_CODE_END_

#endif /* Target_hpp */
