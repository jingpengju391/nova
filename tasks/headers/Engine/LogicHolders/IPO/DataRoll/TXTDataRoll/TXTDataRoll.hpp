//
//  TXTDataRoll.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2018/3/5.
//  Copyright © 2018年 陈曦. All rights reserved.
//

#ifndef TXTDataRoll_hpp
#define TXTDataRoll_hpp

#include <stdio.h>

#include "DataRoll.hpp"
#include "TXTConverter.hpp"

class Beam;

//_CODE_START_

class TXTDataRoll: public DataRoll, public TXTConverter{
    
    friend class Beam;
    friend class DataRoll;
    friend class Block;
    
protected:
    
    TXTDataRoll(const Beam *, const std::string&, const std::string&,const std::string&);
    TXTDataRoll(const Beam *, const std::string&, const std::string&, const std::string&, const std::string&);
    
    virtual bool readRecord(DataRollRecord *) override;
    virtual bool getDataReady() override;
    virtual void resetToFirstRecord() override;
    virtual void returnMemory() override;
    virtual void countRecord() override;
    
private:
    
    char _deliChar;
    long long  _currentRow = 0;
};

//_CODE_END_

#endif /* TXTDataRoll_hpp */
