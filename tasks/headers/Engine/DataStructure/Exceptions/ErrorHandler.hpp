//
//  ErrorHandler.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈森 on 2020/1/7.
//  Copyright © 2020 陈曦. All rights reserved.
//

#ifndef ErrorHandler_hpp
#define ErrorHandler_hpp

#include <stdio.h>
#include <exception>
#include <string>

#include "Definitions.hpp"

#ifndef NOEXCEPT

#ifdef __MINGW64__
#define NOEXCEPT noexcept
#else
#define NOEXCEPT noexcept
#endif

#endif

class HypList;
class SuperString;
class Block;
class SeriesBase;
class VariableBase;
class LinkBase;
class SuperTable;
class TableBase;
class Tank;
class TankIterator;
class ValueUnion;
class SuperTableRow;
class Target;
class RecordThread;

enum ErrorTypes {
    
    UNKNOWN,
    TABLENAME,
    TABLE_INITIALISE,
    TABLE_EMPTY,
    TABLEROW,
    TABLEROW_DIM_NO,
    TABLECOL,
    TABLECOL_DIM_NO,
    FILENAME,
    QUICKMAP_KEY,
    ILLEGAL_NUMBER,
    ILLEGAL_STRING,
    TABLE_ILLEGAL_NUMBER,
    TABLE_ROW_ILLEGAL_NUMBER,
    TABLE_COL_ILLEGAL_NUMBER,
    JSON_ILLEGAL_NUMBER,
    JSON_ILLEGAL_STRING,
    JSON_ILLEGAL_FIELD,
    JSON_ILLEGAL_CONTENT,
    JSON_ILLEGAL_READ,
    JSON_ILLEGAL_SEARCH,
    JSON_ILLEGAL_DATA,
    JSON_ILLEGAL_CELL,
    JSON_ILLEGAL_LOOKUP,
    JSON_ILLEGAL_FILE,
    ILLEGAL_TIMESTEP,
    CIRCULAR_REFERENCE,
    MISS_BLOCKCLUSTER,
    BLOCK_OVER_BOUND,
    SERIES_OVER_BOUND,
    VARIABLE_OVER_BOUND,
    TABLE_OVER_BOUND,
    LINK_OVER_BOUND,
    LIST_OVER_BOUND,
    EMPTY_PTR_SWITCHER,
    ILLEGAL_REBASE_SETTING,
    ILLEGAL_FUNCTION,
    ILLEGAL_VARIABLE_TYPE,
    ILLEGAL_DEFAULT_VALUE,
    ILLEGAL_LINK_PASS,
    ILLEGAL_ASSUMPTION_VALUE,
    ILLEGAL_DATA_VALUE,
    ITEM_NOT_FOUND,
    ITEM_NOT_DEFINED,
    ILLEGAL_MAP_ITEM_TYPE,
    ILLEGAL_CONVERT,
    MAP_ITEM_NOT_FOUND,
    LACK_OF_CELL,
    Tank_SEARCH_ERROR,
    NO_PARENT_ERROR,
    NEGATIVE_COPY_SIZE_ERROR,           //BC 20201113
    ILLEGAL_RESIZE_COPY_ERROR,          //BC 20201113
    EXTERNAL_CONSTANT_NOT_EXIST,        //BC 20201113
    COPY_SIZE_FUNC_NOT_SET,             //BC 20201204
    SEPARATOR_NOT_FOUND,                //BC 20201205
    SIGNATURE_NOT_FOUND,                //BC 20201205
    PARSER_CALCULATION_ERROR,           //BC 20201206
    FLOATING_CALCULATION_ERROR,
    SKIP_MODEL_POINT,
    TERMINATE_RUN,
    OUT_OF_SLIDING_WINDOW,
};

class GeneralException: public std::exception{

    friend class RecordThread;
    friend class FloatVariableBase;
    friend class Period;
    
public:
    
    GeneralException(ErrorTypes typeName);
    GeneralException(ErrorTypes typeName, bool);
    GeneralException();
    GeneralException(const std::string&);
    
    inline void setType(const ErrorTypes &type)
    {this->_typeName = type;}

    inline ErrorTypes typeName()
    {return this->_typeName;}

    ~GeneralException();

    virtual const char *what() NOEXCEPT;

    void appendSource(const VariableBase *, SystemConstant::ItemType);              //BC 20201206
    void appendSource(const SeriesBase *, const long &, SystemConstant::ItemType);              //BC 20201206
    void appendSource(const Block *, const long &, SystemConstant::ItemType);              //BC 20201206
    void appendSource(const TableBase *, SystemConstant::ItemType);              //BC 20201206
    void appendSource(const LinkBase *, SystemConstant::ItemType);              //BC 20201206
    void appendSource(const Target *);
    
    inline bool skipModelPoint()
    {return this->_skipModelPoint;};
    
    inline int exitNumber()
    {return this->_exitNumber;};
    
    inline void appendMessage(std::string msg)
    {this->_errorMessage.append(msg);}
    
protected:
    
    ErrorTypes _typeName = ErrorTypes::UNKNOWN;
    std::string _errorMessage;
    std::string _sourceMessage;
    
    bool _chainFinished = false;
    bool _skipModelPoint = false;
    int _exitNumber = -1;
    
    const void *_toHandle = nullptr;
    const void *_errorPos = nullptr;
    long _timeIndex = -999999;
    
private:
    
    void appendMessage(const Block *);
    void appendMessage(const SeriesBase *);
    void appendMessage(const VariableBase *);
    void appendMessage(const LinkBase *);
    void appendMessage(const TableBase *);
    
    void checkToHandle(const void *);
    
    int _traceStep = 0;
};

class TableNameError: public GeneralException{
    
public:
    
    TableNameError(const TableBase *);
    TableNameError(const std::string&);
    TableNameError();
    
    virtual ~TableNameError() NOEXCEPT {}
};

class TableInitialiseError: public GeneralException{
    
public:
    
    TableInitialiseError(const TableBase *);
    
    TableInitialiseError();
    
    virtual ~TableInitialiseError() NOEXCEPT {}
};

class TableEmptyError: public GeneralException{
    
public:
    
    TableEmptyError(const TableBase *);
    TableEmptyError(const std::string&);
    TableEmptyError();
    
    virtual ~TableEmptyError() NOEXCEPT {}
};

class TableReloadError: public GeneralException{
    
public:
    
    //TableReloadError(const TableBase *);
    TableReloadError(SuperTable *, SuperTableRow *);
    TableReloadError();
    
    virtual ~TableReloadError() NOEXCEPT {}
};


class TableRowDimLookupError: public GeneralException {

public:
    
    TableRowDimLookupError(const SuperTable *, const int &, const long &);
    TableRowDimLookupError();

    virtual ~TableRowDimLookupError() NOEXCEPT {}
};

class TableRowLookupError: public GeneralException {
    
public:
    
    TableRowLookupError(SuperTable *, unsigned char *, const int &, RecordThread*);
    TableRowLookupError(SuperTable *, const long&, RecordThread*);
    TableRowLookupError();
    
    virtual ~TableRowLookupError() NOEXCEPT {}
};

class TableRowIllegalNumError: public GeneralException {
    
public:
    
    TableRowIllegalNumError(SuperTable *, unsigned char *, const int &, const long &);
    TableRowIllegalNumError();
    
    virtual ~TableRowIllegalNumError() NOEXCEPT {}
};

class TableColIllegalNumError: public GeneralException {
    
public:
    
    TableColIllegalNumError(const SuperTable *, const long &, const int &);
    TableColIllegalNumError();
    
    virtual ~TableColIllegalNumError() NOEXCEPT {}
};

class TableColDimLookupError: public GeneralException {

public:
    
    TableColDimLookupError(const SuperTable *, const long &, const int &);
    TableColDimLookupError();
    
    virtual ~TableColDimLookupError() NOEXCEPT {};
};

class TableColLookupError: public GeneralException {
    
public:
    
    TableColLookupError(const SuperTable *, unsigned char *, const long &);
    TableColLookupError(const SuperTable *, const std::string&, const long &);
    TableColLookupError(const SuperTable *, const long&);
    TableColLookupError();
    
    virtual ~TableColLookupError() NOEXCEPT {}
};

class LackOfCellError: public GeneralException {
    
public:
    
    LackOfCellError(const SuperTableRow *, const long&);
    
    LackOfCellError();
    
    virtual ~LackOfCellError() NOEXCEPT {}
};

class FileNameError: public GeneralException{
    
public:
    
    FileNameError(const std::string);
    FileNameError();
    
    virtual ~FileNameError() NOEXCEPT {};
};

class JsonIllegalReadError: public GeneralException{

public:
    
    JsonIllegalReadError(Tank *, long, ErrorTypes);
    JsonIllegalReadError();

    virtual ~JsonIllegalReadError() NOEXCEPT {};
};

class JsonIllegalSearchError: public GeneralException{

public:
    
    JsonIllegalSearchError(const Tank *, std::string, ErrorTypes);
    JsonIllegalSearchError(const Tank *, ErrorTypes);
    JsonIllegalSearchError();
    
    virtual ~JsonIllegalSearchError() NOEXCEPT {};
};

class TableIllegalNumberError: public GeneralException{
    
public:
    
    TableIllegalNumberError(SuperTableRow *const &, const int &);
    TableIllegalNumberError();

    virtual ~TableIllegalNumberError() NOEXCEPT {}
};

class IllegalTimeStep: public GeneralException{
    
public:
    
    IllegalTimeStep(const SeriesBase *, const long &);
    IllegalTimeStep();
    
    virtual ~IllegalTimeStep() NOEXCEPT {}
};

class IllegalFunctionError: public GeneralException {

public:

    IllegalFunctionError(const SeriesBase *, const int &, SystemConstant::ItemType);              //BC 20201206
    IllegalFunctionError();
    
    virtual ~IllegalFunctionError() NOEXCEPT {}
};

class IllegalRebaseError: public GeneralException{

public:
    
    IllegalRebaseError(const SeriesBase *, const long &);
    IllegalRebaseError(const Block *, const long &);
    IllegalRebaseError();
    
    virtual ~IllegalRebaseError() NOEXCEPT {}
};

class CircularReferenceError: public GeneralException{

public:
    
    CircularReferenceError(const SeriesBase *, const long &, SystemConstant::ItemType);              //BC 20201206
    CircularReferenceError(const VariableBase *, SystemConstant::ItemType);              //BC 20201206
    CircularReferenceError(const LinkBase *, SystemConstant::ItemType);              //BC 20201206
    CircularReferenceError(const TableBase *, SystemConstant::ItemType);              //BC 20201206
    CircularReferenceError(const Block *, const long &, SystemConstant::ItemType);              //BC 20201206
    
    CircularReferenceError();
    
    virtual ~CircularReferenceError() NOEXCEPT {}
};

class MissingBlockCluster: public GeneralException{
    
public:
    
    MissingBlockCluster(std::string);
    MissingBlockCluster();

    virtual ~MissingBlockCluster() NOEXCEPT {}
};

class BlockOverBound: public GeneralException{
    
public:
    
    BlockOverBound(const Block *, const long &, const long &);
    BlockOverBound();
    
    virtual ~BlockOverBound() NOEXCEPT {}
};

class VariableOverBound: public GeneralException{

public:
    
    VariableOverBound(const VariableBase *, const long &, const long &);
    VariableOverBound();
    
    virtual ~VariableOverBound() NOEXCEPT {}
};

class SeriesOverBound: public GeneralException{

public:
    
    SeriesOverBound(const SeriesBase *, const long &, const long &);
    SeriesOverBound();

    virtual ~SeriesOverBound() NOEXCEPT {}
};

class LinkOverBound: public GeneralException{

public:
    
    LinkOverBound(const LinkBase *, const long &, const long &);
    LinkOverBound();
    
    virtual ~LinkOverBound() NOEXCEPT {}
};

class TableOverBound: public GeneralException{

public:
    
    TableOverBound(const TableBase *, const long &, const long &);
    TableOverBound();
    
    virtual ~TableOverBound() NOEXCEPT {}
};

class VariableTypeError: public GeneralException{

public:
    
    VariableTypeError(const VariableBase *const &);
    VariableTypeError();

    virtual ~VariableTypeError() NOEXCEPT {}
};

class DefaultValueError: public GeneralException{

public:
    
    DefaultValueError(const VariableBase *);
    DefaultValueError(const LinkBase *);
    DefaultValueError();

    virtual ~DefaultValueError() NOEXCEPT {}
};

class LinkPassError: public GeneralException{

public:
    
    LinkPassError(const LinkBase *);
    LinkPassError();

    virtual ~LinkPassError() NOEXCEPT {}
};

class AssumptionValueError: public GeneralException{

public:
    
    AssumptionValueError(const VariableBase *);
    AssumptionValueError(const LinkBase *);
    AssumptionValueError();

    virtual ~AssumptionValueError() NOEXCEPT {}
};

class DataValueError: public GeneralException {

public:
    
    DataValueError(const VariableBase *);
    DataValueError(const std::string&);
    DataValueError(const VariableBase *, const std::string&);
    DataValueError(const std::string&, const std::string&);
    DataValueError();

    virtual ~DataValueError() NOEXCEPT {}
};

class ItemNotFoundError: public GeneralException {

public:
    
    ItemNotFoundError(const Block *, const std::string&, std::string itemType);
    ItemNotFoundError();

    virtual ~ItemNotFoundError() NOEXCEPT {}
};

class ItemNotDefinedError: public GeneralException {

public:

    ItemNotDefinedError(const SeriesBase *);
    ItemNotDefinedError(const VariableBase *);
    ItemNotDefinedError(const LinkBase *);
    ItemNotDefinedError(const TableBase *);
    
    ItemNotDefinedError();

    virtual ~ItemNotDefinedError() NOEXCEPT {}
};

class MapDataTypeError: public GeneralException {

public:

    MapDataTypeError();
    virtual ~MapDataTypeError() NOEXCEPT {}
};

class ListOverBoundError: public GeneralException {

public:

    ListOverBoundError(const long &, const long &);
    ListOverBoundError();
    virtual ~ListOverBoundError() NOEXCEPT {}
};

class IllegalConvertError: public GeneralException {

public:

    IllegalConvertError(const VariableBase *const &);
    IllegalConvertError(const SeriesBase *const &);
    IllegalConvertError(const LinkBase *const &);
    IllegalConvertError(const TableBase *const &);
    IllegalConvertError();
    
    virtual ~IllegalConvertError() NOEXCEPT {}
};

class MapItemNotFoundError: public GeneralException {

public:

    MapItemNotFoundError(const double &);
    MapItemNotFoundError(const std::string&);
    MapItemNotFoundError(const ValueUnion *const &);
    //MapItemNotFoundError(const StringNode *);
    MapItemNotFoundError();
    
    virtual ~MapItemNotFoundError() NOEXCEPT {}
};

class IllegalNumberError: public GeneralException {
    
public:
    
    IllegalNumberError(char *, char *);
    IllegalNumberError();
    
    virtual ~IllegalNumberError() NOEXCEPT {}
};

class TankSearchError: public GeneralException {
    
public:
    
    TankSearchError(std::string, std::string);
    TankSearchError();
    
    virtual ~TankSearchError() NOEXCEPT {}
};

class EmptyPtrSwitcherError: public GeneralException {
    
public:
    
    EmptyPtrSwitcherError();
    
    virtual ~EmptyPtrSwitcherError() NOEXCEPT {}
};

class NoParentError: public GeneralException {
    
public:
    
    NoParentError(const Block *);
    NoParentError();
    
    virtual ~NoParentError() NOEXCEPT {}
};

class NegativeCopySizeError: public GeneralException{       //BC 20201113

public:
    
    NegativeCopySizeError(const SeriesBase *, const long &);
    NegativeCopySizeError(const VariableBase *, const long &);
    NegativeCopySizeError(const LinkBase *, const long &);
    NegativeCopySizeError(const TableBase *, const long &);
    NegativeCopySizeError(const Block *, const long &);
    
    NegativeCopySizeError();
    
    virtual ~NegativeCopySizeError() NOEXCEPT {}
};

class IllegalResizeCopyError: public GeneralException{       //BC 20201113

public:
    
    IllegalResizeCopyError(const SeriesBase *);
    IllegalResizeCopyError(const VariableBase *);
    IllegalResizeCopyError(const LinkBase *);
    IllegalResizeCopyError(const TableBase *);
    IllegalResizeCopyError(const Block *);
    
    IllegalResizeCopyError();
    
    virtual ~IllegalResizeCopyError() NOEXCEPT {}
};

class ExternalConstantNotExistsError: public GeneralException{       //BC 20201113

public:
    
    ExternalConstantNotExistsError(const int &);
    ExternalConstantNotExistsError(const std::string& key);
    //ExternalConstantNotExistsError(const char *key);

    virtual ~ExternalConstantNotExistsError() NOEXCEPT {}
};

class CopySizeFunctionNotSetError: public GeneralException {        //BC 20201204

public:

    CopySizeFunctionNotSetError(const SeriesBase *);
    CopySizeFunctionNotSetError(const VariableBase *);
    CopySizeFunctionNotSetError(const LinkBase *);
    CopySizeFunctionNotSetError(const TableBase *);

    CopySizeFunctionNotSetError();

    virtual ~CopySizeFunctionNotSetError() NOEXCEPT {}
};

class SeparatorNotFoundError: public GeneralException {        //BC 20201205

public:

    SeparatorNotFoundError(const std::string& , const std::string& );
    SeparatorNotFoundError();

    virtual ~SeparatorNotFoundError() NOEXCEPT {}
};

class SignatureNotFoundError: public GeneralException {        //BC 20201205

public:

    SignatureNotFoundError(const std::string& , const std::string& );
    SignatureNotFoundError();

    virtual ~SignatureNotFoundError() NOEXCEPT {}
};

class ParserCalcuationError: public GeneralException {        //BC 20201206

public:

    ParserCalcuationError(std::string);
    ParserCalcuationError();

    virtual ~ParserCalcuationError() NOEXCEPT {}
};

class FloatingPointError: public GeneralException{
    
public:
    
    FloatingPointError(const SeriesBase *, const long &);
    FloatingPointError(const VariableBase *);
    FloatingPointError();
    
    virtual ~FloatingPointError() NOEXCEPT {}
};

class SkipModelPoint: public GeneralException{
    
public:
    
    SkipModelPoint(const std::string&);
    
    virtual ~SkipModelPoint() NOEXCEPT {}
};

class TerminateRun: public GeneralException{
    
public:
    
    TerminateRun(const std::string&);
    
    virtual ~TerminateRun() NOEXCEPT {}
};

class SlidingWindowError: public GeneralException{
    
public:
    
    SlidingWindowError(const SeriesBase *, const long &, const long &);
    
    virtual ~SlidingWindowError() NOEXCEPT {}
};

#endif /* ErrorHandler_hpp */
