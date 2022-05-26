//
//  Table.20200727.hpp
//  jinShaJiang
//
//  Created by 陈曦 on 2020/7/27.
//  Copyright © 2020 陈曦. All rights reserved.
//

#ifndef Table_20200727_hpp
#define Table_20200727_hpp

#include <stdio.h>
#include <atomic>

#include "QuickList.20200803.hpp"
#include "SuperMap.20200728.hpp"
#include "SuperLock.hpp"           //BC 20201126
#include "ChainPool.hpp"
#include "ErrorHandler.hpp"
#include "Variable.20200709.hpp"

class ThreadResourceManager;
class SuperTableResourceManager;
class QuickTable;
class SuperTable;
class TableBase;
class SuperTableRow;
class TXTSuperTable;
class TolerantTable;                //BC 20201113

const int SIZE_OF_INDEX_SECTOR = (int)(sizeof(bool) + sizeof(double) + sizeof(bool) + sizeof(SuperString));
const int SIZE_OF_INDEX_LIST = SIZE_OF_INDEX_SECTOR * _INDEX_CHAIN_LENGTH;

void _generateIndexSector(unsigned char *&list, int &len, const double &index);
void _generateIndexSecitor(unsigned char *&list, int &len, const SuperString &index);
void _generateIndexSector(unsigned char *&list, int &len, const char *const &index);
void _generateIndexSector(unsigned char *&list, int &len, const std::string &index);
void _generateIndexSector(unsigned char *&list, int &len, const IntegerVariableBase &index);
void _generateIndexSector(unsigned char *&list, int &len, const FloatVariableBase &index);
void _generateIndexSector(unsigned char *&list, int &len, const StringVariableBase &index);
//void _generateIndexSector(unsigned char *&list, int &len, const ValueUnion &index);

class SuperTableRow: public HypList {
    
    friend class TXTSuperTable;
    friend class SuperTable;
    friend class QuickTable;
    friend class LackOfCellError;
    friend class TableIllegalNumberError;
    friend class TableReloadError;
public:
    
    enum Status{
        UNINITIALISED               = 1,
        TEXT_IN_FILE                = 2,
        TEXT_IN_CHUNK               = 3,
        CELL_LOADED                 = 4,
        TEXT_ARCHIVED               = 5,
        CELL_ARCHIVED               = 6,
    };
    
    template <typename... T>
    const HypListItem &operator ()(const T&...) const;
    const HypListItem & getColByNo(const long&) const;
    std::string _rowName() const;
    
private:
    
    SuperTableRow(SuperTable *, const long&, HypMapItem *const &, RecordThread *const &, StringManager* stringManager,GeneralMemoryChunk *const &);
    
    SuperTable *_owner = nullptr;
    HypMapItem *_rowItem = nullptr;
    Status _status = Status::UNINITIALISED;
    //mutable QuickTable *_quickTable = nullptr;
    
    GeneralMemoryChunk *_tempContainerChunk = nullptr;
    
    long _rowNo = 0;
    long _linePos = 0;
    long _contentOffset = 0;
    
    SingleLock _lock = SingleLock(_LOCKER_ID_SUPER_TABLE_ROW);
    
    void checkContent(/*const TableBase **/);
    //HypListItem *getCell(unsigned char *, const int &);
    
    void returnMemory();
};

class QuickTable: public ChainPoolNode {
    
    friend class SuperTableResourceManager;
    friend class SuperTable;
    friend class SuperTableRow;
    
protected:
    
    QuickTable(HypMapCore *, const SuperTableResourceManager *, GeneralMemoryChunk *&);
    
    const SuperTableResourceManager *_owner = nullptr;
    HypMap _rowHolder;
    
    QuickTable *_next = nullptr;
    QuickTable *_previous = nullptr;
    
    virtual void _archive() override;
    inline virtual void _truncate() override {return;};
    void readArchive(const TableBase *);
    
    inline void returnMemory()
    {this->_chunk->returnMemory();}
    
private:
    
    GeneralMemoryChunk *_chunk = nullptr;
    std::string _archiveName;
    SingleLock _lock = SingleLock(_LOCKER_ID_QUICK_TABLE);
};

class SuperTable{

    friend class SuperTableRow;
    friend class QuickTable;
    friend class TableBase;
    friend class GeneralException;
    friend class TXTSuperTable;
public:
    
    enum FileType{
        UNSPECIFIED                 = 0,
        TXT                         = 1,
    };
    
    long rowSize(RecordThread* recordThread, RecordThread* sourceThread);
    inline long columnSize() const
    {return this->_colMap._size();}
    
protected:
    
    SuperTable(const TableBase* owner, const SuperString&, GeneralMemoryChunk *&, RecordThread* recordThread, RecordThread* threadSource, const StringManager* stringManager);
    
    const TableBase *_owner = nullptr;
    const RecordThread *_threadSourceRecord = nullptr;
    
    HypMap _rowMap = HypMap(nullptr, _LOCKER_ID_SUPER_TABLE_ROW_MAP);
    HypMap _colMap = HypMap(nullptr);
    HypList _rowList = HypList(nullptr, _LOCKER_ID_SUPER_TABLE_ROW_MAP);
    
    bool *_columnIsNumberList = nullptr;
    
    int _rowIndexLength = 0;
    int _colIndexLength = 0;
    int _cellWidth = 0;
    std::atomic<int> _ref = 0;

    bool *_rowIsNumList = nullptr;
    MissingMapKey *_rowFirstSearchList = nullptr;
    MissingMapKey *_rowLastSearchList = nullptr;
    MissingMapKey *_rowMissingSearchList = nullptr;
    HypMapCore * _tableMap = nullptr;
    
    // SingleLock _lock = SingleLock(_LOCKER_ID_SUPER_TABLE);
    std::mutex loadMutex;
    FileType _fileType = SuperTable::FileType::TXT;
    SuperString _fileName;
    std::atomic<bool> _loadCompleted = false;
    std::atomic<long> _highestRow = 0;
    
    const TableBase **_checkingVariables/*[_DEFAULT_MULTI_THREAD_CAPACITY]*/ = nullptr;
    GeneralMemoryChunk *_chunk = nullptr;
    
    virtual bool initialise(const TableBase *) = 0;
    SuperTableRow *getRow(unsigned char *&, const int &, const TableBase *);
    SuperTableRow *getRowByNo(const long& rowNo, const TableBase *);
    virtual SuperTableRow *readRow(unsigned char *&, const int &, RecordThread*, RecordThread*) = 0;
    virtual SuperTableRow *readRow(RecordThread*, RecordThread*) = 0;
    virtual SuperTableRow *readRow(const long& rows, RecordThread*, RecordThread*) = 0;
    virtual void loadRow(SuperTableRow *) = 0;
    virtual long saveTableContents(char *, SuperTableRow *, RecordThread*) = 0;
    int getColFromList(unsigned char *&, const int &);

    
    
    template <typename... T>
    int getCol(const T&...);
    
    template <typename F, typename... T>
    void generateIndexList(unsigned char *&, int &, const F &, const T&...);
    
    void inline generateIndexList(unsigned char *&, int &) {}

    
    SuperString _key;
    
    void returnMemory();
    void destroyAllRows();
    bool _initialised = false;
    //unsigned char ** _listThead;
    template <typename T1, typename ...T2>
    std::string combineKey(const T1&logInfo1, const T2&... logInfo2) const;
    template <typename T>
    std::string combineKey(const T& logInfo) const;
};

class TolerantRow {                             //BC 20201113

    friend class TolerantTable;

public:

    template <typename... T>
    const HypListItem &operator () (const T&...) const;

private:

    TolerantRow(TolerantTable *table): _table(table) { }

    mutable const SuperTableRow *_targetRow = nullptr;
    TolerantTable *_table = nullptr;
    bool _muteMe = true;
};

class TolerantTable {                           //BC 20201113

    friend class TolerantRow;

public:
    
    enum STATUS {
        SUCCESSFUL = 0,
        ROW_FAILED = 1,
        COL_FAILED = 2,
        TABLE_FAILED = 3
    };

    TolerantTable() { }
    TolerantTable(const TableBase &table): _targetTable(&table) { }

    TolerantTable(const TableBase &table, const bool &muteRowError, const bool &muteColError):
    _targetTable(&table),
    _noRowError(muteRowError) {
        this->_targetRow._muteMe = muteColError;
    }

    inline TolerantTable &operator = (const TableBase &table) {
        
        this->_targetTable = &table;
        return *this;
    }
    
    inline TolerantTable &_muteRowError() {

        this->_noRowError = true;
        return *this;
    }

    inline TolerantTable &_unmuteRowError() {

        this->_noRowError = false;
        return *this;
    }

    inline TolerantTable &_muteColError() {

        this->_targetRow._muteMe = true;
        return *this;
    }

    inline TolerantTable &_unmuteColError() {

        this->_targetRow._muteMe = false;
        return *this;
    }

    inline bool _rowErrorMuted() const
    {return this->_noRowError;}

    inline bool _colErrorMuted() const
    {return this->_targetRow._muteMe;}

    inline STATUS _lookupStatus() const
    {return this->_status;}

    template <typename ...T>
    const TolerantRow &operator () (const T&...);
    
private:

    const TableBase *_targetTable = nullptr;
    STATUS _status = STATUS::TABLE_FAILED;
    bool _noRowError = true;
    TolerantRow _targetRow = TolerantRow(this);
    HypListItem _errorCell = HypListItem(ValueUnion::Type::ERROR_TABLE_CELL);
};

class TableBase {
    
    friend class SuperTable;
    friend class SuperTableResourceManager;
    friend class Block;
    friend class GeneralException;
    friend class IllegalConvertError;
    friend class BlockCluster;              //BC 20201205
    friend class BlockResult;               //BC 20201205
    friend class TXTSuperTable;
    
public:
    
    enum RebaseType {
        NO_REBASE                       = 0,
        REBASE                          = 1,
    };
    
    template <typename B>
    TableBase(const B *const &, const SuperString &, std::string (B::*)(const VariableBase &) const);
    template <typename B>
    TableBase(const B *const &, const SuperString &, const long &, std::string (B::*)(const VariableBase &) const);
    template <typename B>
    TableBase(const B *const &, const SuperString &, long (B::*)(const TableBase &) const, std::string (B::*)(const VariableBase &) const);
    template <typename B>
    TableBase(const B *const &, const SuperString &, const SuperString &, const VariableBase::Source &);
    template <typename B>
    TableBase(const B *const &, const SuperString &, const long &, const SuperString &, const VariableBase::Source &);
    template <typename B>
    TableBase(const B *const &, const SuperString &, long (B::*)(const TableBase &) const, const SuperString &, const VariableBase::Source &);
    template <typename B>
    TableBase(const B *const &, const SuperString &, std::string (B::*)(const DataRollRecord &, const VariableBase &) const);
    template <typename B>
    TableBase(const B *const &, const SuperString &, const long &, std::string (B::*)(const DataRollRecord &, const VariableBase &) const);
    template <typename B>
    TableBase(const B *const &, const SuperString &, long (B::*)(const TableBase &) const, std::string (B::*)(const DataRollRecord &, const VariableBase &) const);
    template <typename B>
    TableBase(const B *const &, const SuperString &);
    
    const Block *const _owner;                          //BC 20201209
    const SuperString &_tableInputName;
    const TableBase *const _ownerTable;                 //BC 20201209
    const TableBase *const _baseTable;                  //BC 20201209
    const SystemConstant::ItemType _itemType;              //BC 20201206
    const long _copyId;
    const long _level;
    
    //inline bool _hasValue() const
    //{return! _currentTableValue;}

    inline bool _hasValue() const
    {return this->_currentTableValue;}

    void _removeValue() const;
    //inline int _removeValue() {return this->_removeChildValues() + (this->_fileNameVariable._removeValue()) + (this->_hasCopySize = false) + (!this->_isSeparator ? (this->_currentTableValue = nullptr) == nullptr : 0) + this->_throwUndefinedMe();};
    /*inline int _removeValue()
    {return this->_removeChildValues() + (((this->_currentTableValue && (this->_currentTableValue = nullptr) == nullptr)|| this->_fileNameVariable._hasV) &&
    (this->_valueSource == VariableBase::Source::CALCULATED ||
     this->_valueSource == VariableBase::Source::DATA_RAW ||
     this->_valueSource == VariableBase::Source::DATA_CONVERTED) ? this->_fileNameVariable._removeValue() : this->_throwUndefinedMe()) + (this->_hasCopySize = false);}*///senna update
    
    void _setValue(const SuperString &value) const;
    std::string _currentFileName() const ;
    
    template <typename ...T>
    const SuperTableRow &operator () (const T&...) const;
    
    long _columnSize() const;
    long _rowSize() const;
    long _size() const;
    
    inline const SuperTableRow& _getRowByNo(const long& rowNo) const{return *this->_currentTable()->getRowByNo(rowNo, this);};

    inline long _usedCopy() const {return this->_maxCopy;}
    
    TableBase &operator [] (const long &copy) const;
    TolerantTable &_muteErrors(const bool &rowError, const bool &colError) const;
    
    inline TolerantTable::STATUS _lookupStatus() const            //BC 20201113
    {return this->_tolerantTable._lookupStatus();}
        
    void _convertToDefault(const SuperString &linkage);
    void _convertToDefault(const SuperString &linkage, const long &defaultCopySize);
    void _convertToAssumption(const SuperString &linkage) ;
    void _convertToAssumption(const SuperString &linkage, const long &defaultCopySize);
    void _convertToDataRaw(const SuperString &linkage);
    void _convertToDataRaw(const SuperString &linkage, const long &defaultCopySize);
    void _convertToValue(const SuperString &tableName);
    void _convertToValue(std::string tableName);
    void _convertToValue(const char *tableName);
     
    template <typename B>
    inline void _convertToDataRaw(const SuperString &linkage, long (B::*copySizeFunc)(const TableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {           //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_RAW;
            this->_fileNameVariable._convertToDataRaw(linkage/*, -1*/);         //BC 20201205
            this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;              //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDataConverted(std::string (B::*dataConvFunc)(const DataRollRecord &, const TableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {       //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_CONVERTED;
            this->_fileNameVariable._convertToDataConverted(dataConvFunc/*, -1*/);      //BC 20201205
            this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDataConverted(std::string (B::*dataConvFunc)(const DataRollRecord &, const TableBase &) const, const long &defaultCopySize) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {       //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_CONVERTED;
            this->_fileNameVariable._convertToDataConverted(dataConvFunc/*, -1*/);          //BC 20201205
            this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
            this->_defaultCopySize = defaultCopySize;
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToDataConverted(std::string (B::*dataConvFunc)(const DataRollRecord &, const TableBase &), long (B::*copySizeFunc)(const TableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {       //BC 20201204
            
            this->_valueSource = VariableBase::Source::DATA_CONVERTED;
            this->_fileNameVariable._convertToDataConverted(dataConvFunc/*, -1*/);      //BC 20201205
            this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;              //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }   
        
    template <typename B>
    inline void _convertToAssumption(const SuperString &linkage, long (B::*copySizeFunc)(const TableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {       //BC 20201204
            
            this->_valueSource = VariableBase::Source::ASSUMPTION;
            this->_fileNameVariable._convertToAssumption(linkage/*, -1*/);      //BC 20201205
            this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;              //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
        
    template <typename B>
    inline void _convertToDefault(const SuperString &linkage, long (B::*copySizeFunc)(const TableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {       //BC 20201204
            
            this->_valueSource = VariableBase::Source::DEFAULT;
            this->_fileNameVariable._convertToDefault(linkage/*, -1*/);     //BC 20201205
            this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;              //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }    template <typename B>
    inline void _convertToCalculated(std::string (B::*valueFunc)(const VariableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {       //BC 20201204
            
            this->_valueSource = VariableBase::Source::CALCULATED;
            this->_fileNameVariable._convertToCalculated(valueFunc/*, -1*/);        //BC 20201205
            this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    
    template <typename B>
    inline void _convertToCalculated(std::string (B::*valueFunc)(const VariableBase &) const, const long &defaultCopySize) {
        
        if(this->_valueSource == VariableBase::Source::TO_DEFINE) {
            
            this->_valueSource = VariableBase::Source::CALCULATED;
            this->_fileNameVariable._convertToCalculated(valueFunc/*, -1*/);            //BC 20201205
            this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
            this->_defaultCopySize = defaultCopySize;
        }
        else {
            throw new IllegalConvertError(this);
        }
    }
    
    template <typename B>
    inline void _convertToCalculated(std::string (B::*valueFunc)(const VariableBase &) const, long (B::*copySizeFunc)(const TableBase &) const) {
        
        //if(this->_valueSource == VariableBase::Source::TO_DEFINE) {       //BC 20201204
            
            this->_valueSource = VariableBase::Source::CALCULATED;
            this->_fileNameVariable._convertToCalculated(valueFunc/*, -1*/);            //BC 20201205
            this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
            this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
            this->_hasCopySizeFunc = true;
            this->_useCopySizeFunc = true;              //BC 20201204
        /*}
        else {
            throw new IllegalConvertError(this);
        }*/
    }
    void _extendCopySize(const long &size) const;
    
protected:
    
    TableBase(const TableBase *, const long &, GeneralMemoryChunk *&);
    
    VariableBase::Source _valueSource = VariableBase::Source::UNSPECIFIED;
    mutable SuperTable *_currentTableValue = nullptr;
    //mutable bool _hasV = false;
    mutable SuperTable::FileType _currentType = SuperTable::FileType::TXT;
    
    mutable long _maxCopy = 0;
    //mutable TableBase *_copyChildren;
    HypList copyChildren = HypList(nullptr, nullptr, nullptr);
    mutable long _copyLength = 0;
    
    HypMap _superTableMap = HypMap(nullptr);
    
    bool _allowManualResize = false;            //BC 20201113
    /*int*/long _defaultCopySize = 0;           //BC 20201113
    ConstFormulaHolder</*int*/long, const TableBase &> _copySizeFunc;           //BC 20201113
    bool _hasCopySizeFunc = false;
    bool _useCopySizeFunc = false;              //BC 20201204
    mutable int _loopControl = 0;
    mutable int _copyLoopControl = 0;
    
    SuperTable *_currentTable() const;
    void _returnMemory(bool);
    inline void _returnMemory(){this->_returnMemory(true);};
    
private:
    
    StringVariableBase _fileNameVariable = StringVariableBase(this);
    GeneralMemoryChunk *_chunk = nullptr;
    
    mutable /*int*/long _copySizeValue = 0;             //BC 20201113
    mutable bool _hasCopySize = false;
    
    void _initialiseTable();
    void _resize(const long &) const;
    
    long _getCopySize(const TableBase &variable) const;
    TableBase *_getCopy(const /*int*/long &copy) const;
    mutable TolerantTable _tolerantTable = TolerantTable(*this);        //BC 20201113

    /*int*/long _copySize() const;              //BC 20201113
    void _throwUndefinedMe() const;
    void _removeChildValues() const;
    int _detachTable(SuperTable*) const;
    int _detachAllTable() const;
    inline int _detachTable() const{return this->_detachTable(this->_currentTableValue);};
    bool _isSeparator = false;                  //BC 20201205
    bool _isSignature = false;                  //BC 20201205
    mutable void* _rowLookupList = nullptr;
    mutable long _rowLookupListLength = 0; 
    mutable RebaseType _rebaseType = RebaseType::NO_REBASE;
    void _setRebaseTime() const;
    //GeneralMemoryManager* _superTableManager = nullptr;
    
};

class SuperTableResourceManager: public ChainPool {

    friend class SuperTable;
    friend class TXTSuperTable;
    friend class QuickTable;
    friend class TableBase;
    friend class Block;
    friend class Beam;
    friend class DataRoll;
    friend class TableBase;
    friend class RecordThread;
    
protected:
    
    SuperTableResourceManager(Beam *);
    
    Beam *_owner = nullptr;
    HypMap _tableVariableMap = HypMap(_LOCKER_ID_SUPER_TABLE_VARIABLE);
    
    QuickTable *newQuickTable(HypMapCore *) const;
    
private:
    
    GeneralMemoryManager _quickTableManager = GeneralMemoryManager(_MEM_ID_QUICK_TABLE, sizeof(QuickTable), _INITIAL_TABLE_UNIT_LENGTH, _REALLOC_TABLE_UNIT_LENGTH);;
    SingleLock _lockQuickTable = SingleLock(_LOCKER_ID_SUPER_TABLE_MGR_QUICK_TBL);
};

template <typename... T>
const HypListItem &SuperTableRow::operator () (const T&... index) const{
    
    long colNo = this->_owner->getCol(index...);
    
    try{
        return *this->_getItem(colNo);
    }
    catch(GeneralException *e){
        delete e;
        throw new TableColLookupError(this->_owner, colNo);
    }

}

template <typename... T>
int SuperTable::getCol (const T&... index) {
    
    /*unsigned char *list, *listWalk;//sc
    //unsigned char *list, *listWalk = list = (unsigned char *)safe_malloc(SIZE_OF_INDEX_LIST);
    int length = 0;
    list = (unsigned char *)safe_malloc(SIZE_OF_INDEX_SECTOR * sizeof...(index));
    listWalk = list;
    this->generateIndexList(listWalk, length, index...);
    listWalk = list;
    int c = this->getColFromList(list, length);
    listWalk = list;
    for(int i = 0; i < length; ++i) {
        if(!*(bool *)listWalk ){
            ((SuperString*)(listWalk + sizeof(bool) + sizeof(double)))->_clear();
            
        }
        listWalk += SIZE_OF_INDEX_SECTOR;
    }
    free(list);
    return c;*/

    long length = sizeof...(index);
    if(length != this->_colIndexLength) {
        throw new TableColDimLookupError(this, length, this->_colIndexLength);
    }
    try{

        return this->_colMap(index...)._getValue();
    }
    catch (GeneralException *e){
        delete e;
        const std::string colKey = this->combineKey(index...);
        throw new TableColLookupError(this, colKey, length);
    }

}

template <typename F, typename... T>
void SuperTable::generateIndexList(unsigned char *&sepList, int &listLen, const F &first, const T&... rest) {
    
    _generateIndexSector(sepList, listLen, first);
    this->generateIndexList(sepList, listLen, rest...);
}

template <typename... T>
const SuperTableRow &TableBase::operator () (const T&... index) const {
    
    SuperTable* sTable = this->_currentTable();
    long rowIndexLength = sTable->_rowIndexLength;
    long indexSize = SIZE_OF_INDEX_LIST * rowIndexLength;
    if(!this->_rowLookupList){
        this->_rowLookupList = safe_malloc(indexSize);//sc
        memset(this->_rowLookupList, 0, indexSize);
        this->_rowLookupListLength = rowIndexLength;
    }
    if(sizeof...(index) != rowIndexLength){
        throw new TableRowDimLookupError(sTable, sizeof...(index), rowIndexLength);
    }
    if(this->_rowLookupListLength != rowIndexLength){
        free(this->_rowLookupList);
        this->_rowLookupList = safe_malloc(indexSize);
        memset(this->_rowLookupList, 0, indexSize);
        this->_rowLookupListLength = rowIndexLength;
    }
    int length = 0;
    unsigned char* list = (unsigned char*) this->_rowLookupList;
    unsigned char* listWalk = list;
    sTable->generateIndexList(listWalk, length, index...);  
    
    SuperTableRow* r = sTable->getRow(list, length, this);

    return *r;

 
    //listWalk = (unsigned char*)this->_rowLookupList;

    

}

template <typename B>
TableBase::TableBase(const B *const &oBlock, const SuperString &inputName, std::string (B::*valueFunc)(const VariableBase &) const):
_owner(oBlock),
_tableInputName(inputName),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_valueSource(VariableBase::Source::CALCULATED),
_level(0),
_copyId(0),
_ownerTable(nullptr),
_baseTable(nullptr)
 {
    
    this->_initialiseTable();
    this->_fileNameVariable._convertToCalculated(valueFunc/*, -1*/);        //BC 20201205
    this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
}

template <typename B>
TableBase::TableBase(const B *const &oBlock, const SuperString &inputName, const long &defaultCopySize, std::string (B::*valueFunc)(const VariableBase &) const):
_owner(oBlock),
_tableInputName(inputName),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_valueSource(VariableBase::Source::CALCULATED),
_level(0),
_copyId(0),
_ownerTable(nullptr),
_baseTable(nullptr),
_defaultCopySize(defaultCopySize) {
    
    this->_initialiseTable();
    this->_fileNameVariable._convertToCalculated(valueFunc/*, -1*/);        //BC 20201205
    this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
}

template <typename B>
TableBase::TableBase(const B *const &oBlock, const SuperString &inputName, long (B::*copySizeFunc)(const TableBase &) const, std::string (B::*valueFunc)(const VariableBase &) const):
_owner(oBlock),
_tableInputName(inputName),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_valueSource(VariableBase::Source::CALCULATED),
_level(0),
_copyId(0),
_ownerTable(nullptr),
_baseTable(nullptr),
_hasCopySizeFunc(true),
_useCopySizeFunc(true) {            //BC 20201204
    
    this->_initialiseTable();
    this->_fileNameVariable._convertToCalculated(valueFunc/*, -1*/);        //BC 20201205
    this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
}

template <typename B>
TableBase::TableBase(const B *const &oBlock, const SuperString &inputName, const SuperString &linkage, const VariableBase::Source &source):
_owner(oBlock),
_tableInputName(inputName),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_valueSource(source),
_level(0),
_copyId(0),
_ownerTable(nullptr),
_baseTable(nullptr) {
    
    this->_initialiseTable();
    
    if(source == VariableBase::Source::DEFAULT) {
        this->_fileNameVariable._convertToDefault(linkage/*, -1*/);             //BC 20201205
        this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
    }
    else if(source == VariableBase::Source::DATA_RAW) {
        this->_fileNameVariable._convertToDataRaw(linkage/*, -1*/);             //BC 20201205
        this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
    }
    else {
        this->_fileNameVariable._convertToAssumption(linkage/*, -1*/);          //BC 20201205
        this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
    }
}

template <typename B>
TableBase::TableBase(const B *const &oBlock, const SuperString &inputName, const long &defaultCopySize, const SuperString &linkage, const VariableBase::Source &source):
_owner(oBlock),
_tableInputName(inputName),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_valueSource(source),
_level(0),
_copyId(0),
_ownerTable(nullptr),
_baseTable(nullptr),
_defaultCopySize(defaultCopySize){
    
    this->_initialiseTable();
    
    if(source == VariableBase::Source::DEFAULT) {
        this->_fileNameVariable._convertToDefault(linkage/*, -1*/);             //BC 20201205
        this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
    }
    else if(source == VariableBase::Source::DATA_RAW) {
        this->_fileNameVariable._convertToDataRaw(linkage/*, -1*/);             //BC 20201205
        this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
    }
    else {
        this->_fileNameVariable._convertToAssumption(linkage/*, -1*/);          //BC 20201205
        this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
    }
}

template <typename B>
TableBase::TableBase(const B *const &oBlock, const SuperString &inputName, long (B::*copySizeFunc)(const TableBase &) const, const SuperString &linkage, const VariableBase::Source &source):
_owner(oBlock),
_tableInputName(inputName),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_valueSource(source),
_level(0),
_copyId(0),
_ownerTable(nullptr),
_baseTable(nullptr),
_hasCopySizeFunc(true),
_useCopySizeFunc(true) {            //BC 20201204
    
    this->_initialiseTable();
    
    if(source == VariableBase::Source::DEFAULT) {
        this->_fileNameVariable._convertToDefault(linkage/*, -1*/);             //BC 20201205
        this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
    }
    else if(source == VariableBase::Source::DATA_RAW) {
        this->_fileNameVariable._convertToDataRaw(linkage/*, -1*/);             //BC 20201205
        this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
    }
    else {
        this->_fileNameVariable._convertToAssumption(linkage/*, -1*/);          //BC 20201205
        this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
    }
    
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
}

template <typename B>
TableBase::TableBase(const B *const &oBlock, const SuperString &inputName, std::string (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const):
_owner(oBlock),
_tableInputName(inputName),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_valueSource(VariableBase::Source::DATA_CONVERTED),
_level(0),
_copyId(0),
_ownerTable(nullptr),
_baseTable(nullptr) {
    
    this->_initialiseTable();
    this->_fileNameVariable._convertToDataConverted(dataConvFunc/*, -1*/);      //BC 20201205
    this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
}

template <typename B>
TableBase::TableBase(const B *const &oBlock, const SuperString &inputName, const long &defaultCopySize, std::string (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const):
_owner(oBlock),
_tableInputName(inputName),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_valueSource(VariableBase::Source::DATA_CONVERTED),
_level(0),
_copyId(0),
_ownerTable(nullptr),
_baseTable(nullptr),
_defaultCopySize(defaultCopySize){
    
    this->_initialiseTable();
    this->_fileNameVariable._convertToDataConverted(dataConvFunc/*, -1*/);      //BC 20201205
    this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
}

template <typename B>
TableBase::TableBase(const B *const &oBlock, const SuperString &inputName, long (B::*copySizeFunc)(const TableBase &) const, std::string (B::*dataConvFunc)(const DataRollRecord &, const VariableBase &) const):
_owner(oBlock),
_tableInputName(inputName),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_valueSource(VariableBase::Source::DATA_CONVERTED),
_level(0),
_copyId(0),
_ownerTable(nullptr),
_baseTable(nullptr),
_hasCopySizeFunc(true),
_useCopySizeFunc(true) {            //BC 20201204
    
    this->_initialiseTable();
    this->_fileNameVariable._convertToDataConverted(dataConvFunc/*, -1*/);      //BC 20201205
    this->_fileNameVariable._allowManualResize = true;                      //BC 20201205
    this->_copySizeFunc.getFormula(this->_owner, copySizeFunc);
}

template <typename B>
TableBase::TableBase(const B *const &oBlock, const SuperString &inputName):
_owner(oBlock),
_tableInputName(inputName),
_itemType(SystemConstant::ItemType::BASE),              //BC 20201206
_valueSource(VariableBase::Source::TO_DEFINE),
_level(0),
_copyId(0),
_ownerTable(nullptr),
_baseTable(nullptr) {
    
    this->_initialiseTable();
}


template <typename... T>
const HypListItem &TolerantRow::operator () (const T&...index) const {          //BC 20201113
    
    const SuperTableRow *row = this->_targetRow;
    this->_targetRow = nullptr;

    if(row) {
        try {
            return row->operator()(index...);
        }
        catch (GeneralException *e) {

            if(this->_muteMe) {

                this->_table->_status = TolerantTable::STATUS::COL_FAILED;
                delete e;
            }
            else {
                throw e;
            }
        }
    }
    
    return this->_table->_errorCell;
}

template <typename ...T>
const TolerantRow &TolerantTable::operator () (const T&... index) {           //BC 20201113

    this->_status = TolerantTable::STATUS::SUCCESSFUL;

    if(this->_targetTable) {
        try {
            this->_targetRow._targetRow = &this->_targetTable->operator()(index...);
        }
        catch(GeneralException *e) {
            if(this->_noRowError) {

                delete e;
                this->_status = STATUS::ROW_FAILED;
            }
            else {
                throw e;
            }
        }
    }
    else {
        this->_status = STATUS::TABLE_FAILED;
    }

    return this->_targetRow;
}

#endif /* Table_20200727_hpp */
