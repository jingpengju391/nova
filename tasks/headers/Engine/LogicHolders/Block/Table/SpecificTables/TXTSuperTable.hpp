//
//  TXTSuperTable.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2018/5/5.
//  Copyright © 2018年 陈曦. All rights reserved.
//

#ifndef TXTSuperTable_hpp
#define TXTSuperTable_hpp

#include <stdio.h>

#include "Table.20200727.hpp"
#include "TXTConverter.hpp"

//_CODE_START_
class RecordThread;
class TXTSuperTable: public SuperTable, public TXTConverter, public ChainPoolNode {

    friend class TableBase;
    
protected:
    
    TXTSuperTable(const TableBase* owner, const std::string&, GeneralMemoryChunk *&, RecordThread* recordThread, RecordThread* threadSource, const StringManager* stringManager);
    
    virtual bool initialise(const TableBase *) override;
    virtual SuperTableRow *readRow(unsigned char *&, const int &, RecordThread* recordThread, RecordThread*) override;
    virtual SuperTableRow *readRow(RecordThread* recordThread, RecordThread*) override;//senna update
    virtual SuperTableRow *readRow(const long& rows, RecordThread* recordThread, RecordThread*) override;//senna update
    virtual void loadRow(SuperTableRow *) override;
    virtual long saveTableContents(char *, SuperTableRow *, RecordThread*) override;
    
    char _deliChar = ',';
    long long _highestPos = 0;
    
    inline void _archive() override {return;};
    void _truncate() override;
    
private:
    
    void readTableCells(char *, SuperTableRow */*const TableBase **/);
};

//_CODE_END_

#endif /* TXTSuperTable_hpp */
