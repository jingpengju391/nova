//
//  Tank.20200710.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2020/07/10.
//  Copyright © 2020年 陈曦. All rights reserved.
//

#ifndef Tank_20200710_hpp
#define Tank_20200710_hpp

#include <stdio.h>
#include <iostream>
#include <string>
#include <functional>

#include "Definitions.hpp"
#include "SuperMap.20200728.hpp"
#include "ValueUnion.20200713.hpp"

class Tank;
class TankCell;
class RecordThread;
class Block;
class Beam;

//_CODE_START_

class TankIterator {

    friend class Beam;
    friend class BlockCluster;
    friend class IntegerVariableBase;
    friend class FloatVariableBase;
    friend class StringVariableBase;
    friend class OutputPageNode;
    friend class RecordThread;
    template <typename M> friend class BlockLink;

public:

    enum Type {
        UNSPECIFIED,
        TANK,
        VALUE_CELL,
        STRING_CELL,
        OTHER_CELL,                     //BC 20201204
    };

    SuperString name;
    
    virtual operator double () const = 0;
    virtual operator const SuperString &() const = 0;
    virtual inline operator const Tank &() const {return *(Tank*)this;};
    inline const TankIterator &operator [] (const int &id) const{return this->operator[](long(id));};
    virtual const TankIterator &operator [] (const long &) const = 0;
    virtual const TankIterator &operator [] (const SuperString &) const = 0;
    virtual const TankIterator &operator [] (const char *) const = 0;
    //virtual const TankIterator &operator [] (const StringNode *const &) const = 0;
    
    inline Type _getIterType() const                //BC 20201207
    {return this->_iterType;}

    inline operator std::string () const
    {return this->operator const SuperString &()._getString();}
    
    virtual void forEach(std::function<bool (TankIterator &)>) const = 0;
    
    virtual int _size() const = 0;

    virtual bool operator == (const double &) const = 0;
    virtual bool operator == (const char *) const = 0;
    virtual bool operator == (const std::string&) const = 0;
    virtual bool operator == (const SuperString &) const = 0;
    
    virtual bool operator != (const double &) const = 0;
    virtual bool operator != (const char *) const = 0;
    virtual bool operator != (const std::string&) const = 0;
    virtual bool operator != (const SuperString &) const = 0;
    
    virtual bool operator > (const double &) const = 0;
    virtual bool operator > (const char *) const = 0;
    virtual bool operator > (const std::string&) const = 0;
    virtual bool operator > (const SuperString &) const = 0;
    
    virtual bool operator >= (const double &) const = 0;
    virtual bool operator >= (const char *) const = 0;
    virtual bool operator >= (const std::string&) const = 0;
    virtual bool operator >= (const SuperString &) const = 0;
    
    virtual bool operator < (const double &) const = 0;
    virtual bool operator < (const char *) const = 0;
    virtual bool operator < (const std::string&) const = 0;
    virtual bool operator < (const SuperString &) const = 0;
    
    virtual bool operator <= (const double &) const = 0;
    virtual bool operator <= (const char *) const = 0;
    virtual bool operator <= (const std::string&) const = 0;
    virtual bool operator <= (const SuperString &) const = 0;
    
protected:

    TankIterator(Tank *parent, const SuperString &);
    Tank *_parent = nullptr;
    TankIterator::Type _iterType = TankIterator::Type::UNSPECIFIED;
};

class TankCell: public ValueUnion, public TankIterator {
    
    friend class Beam;
    friend class Tank;
    friend class DataRoll;
    friend class DataRollRecord;
    
public:
    
    inline virtual operator double () const override
    {return this->ValueUnion::operator double();}

    inline virtual operator const SuperString &() const override
    {return this->ValueUnion::operator const SuperString &();}

    inline virtual operator const Tank &() const override
    {throw new JsonIllegalSearchError(this->_parent, this->name._getString(), ErrorTypes::JSON_ILLEGAL_DATA);}

    virtual const TankIterator &operator [] (const long &id) const override{
        
        if(id < this->_childValues._size()) {
            return *(TankCell *)this->_childValues._getItem(id)->_getPointer();
        }

        throw new JsonIllegalSearchError(this->_parent, this->name._getString(), ErrorTypes::JSON_ILLEGAL_DATA);
    }

    virtual const TankIterator &operator [] (const SuperString &) const override
    {throw new JsonIllegalSearchError(this->_parent, this->name._getString(), ErrorTypes::JSON_ILLEGAL_DATA);}

    virtual const TankIterator &operator [] (const char *) const override
    {throw new JsonIllegalSearchError(this->_parent, this->name._getString(), ErrorTypes::JSON_ILLEGAL_DATA);}
    
    /*virtual const TankIterator &operator [] (const StringNode *const &) const override
    {throw new JsonIllegalSearchError(this->_parent, this->name._getString(), ErrorTypes::JSON_ILLEGAL_DATA);}*/
    
    virtual inline void forEach(std::function<bool (TankIterator &)>) const override
    {throw new JsonIllegalSearchError(this->_parent, this->name._getString(), ErrorTypes::JSON_ILLEGAL_DATA);}

    virtual inline int _size() const override
    {throw new JsonIllegalSearchError(this->_parent, this->name._getString(), ErrorTypes::JSON_ILLEGAL_DATA);}

    virtual inline bool operator == (const double &v) const override
    {return this->ValueUnion::operator == (v);}
    
    virtual bool operator == (const char *v) const override
    {return this->ValueUnion::operator == (v);}
    
    virtual inline bool operator == (const std::string& v) const override
    {return this->ValueUnion::operator == (v);}
    
    virtual bool operator == (const SuperString &v) const override
    {return this->ValueUnion::operator == (v);}
    
    virtual inline bool operator != (const double &v) const override
    {return this->ValueUnion::operator != (v);}
    
    virtual bool operator != (const char *v) const override
    {return this->ValueUnion::operator != (v);}
    
    virtual inline bool operator != (const std::string& v) const override
    {return this->ValueUnion::operator != (v);}
    
    virtual bool operator != (const SuperString &v) const override
    {return this->ValueUnion::operator != (v);}
    
    virtual inline bool operator > (const double &v) const override
    {return this->ValueUnion::operator > (v);}
    
    virtual bool operator > (const char *v) const override
    {return this->ValueUnion::operator > (v);}
    
    virtual inline bool operator > (const std::string& v) const override
    {return this->ValueUnion::operator > (v);}
    
    virtual bool operator > (const SuperString &v) const override
    {return this->ValueUnion::operator > (v);}
    
    virtual inline bool operator >= (const double &v) const override
    {return this->ValueUnion::operator >= (v);}
    
    virtual bool operator >= (const char *v) const override
    {return this->ValueUnion::operator >= (v);}
    
    virtual inline bool operator >= (const std::string& v) const override
    {return this->ValueUnion::operator >= (v);}
    
    virtual bool operator >= (const SuperString &v) const override
    {return this->ValueUnion::operator >= (v);}
    
    virtual inline bool operator < (const double &v) const override
    {return this->ValueUnion::operator < (v);}
    
    virtual bool operator < (const char *v) const override
    {return this->ValueUnion::operator < (v);}
    
    virtual inline bool operator < (const std::string& v) const override
    {return this->ValueUnion::operator < (v);}
    
    virtual bool operator < (const SuperString &v) const override
    {return this->ValueUnion::operator < (v);}
    
    virtual inline bool operator <= (const double &v) const override
    {return this->ValueUnion::operator <= (v);}
    
    virtual bool operator <= (const char *v) const override
    {return this->ValueUnion::operator <= (v);}
    
    virtual inline bool operator <= (const std::string& v) const override
    {return this->ValueUnion::operator <= (v);}
    
    virtual bool operator <= (const SuperString &v) const override
    {return this->ValueUnion::operator <= (v);}
    
protected:
    
    TankCell(Tank *, const SuperString &, double, GeneralMemoryChunk *const &);
    TankCell(Tank *, const SuperString &, const SuperString &, GeneralMemoryChunk *const &);
    TankCell(Tank *, const SuperString &, const ValueUnion::Type &, GeneralMemoryChunk *const &);
    TankCell(Tank *, ValueUnion *, ValueUnion *, GeneralMemoryChunk *const &);

    HypList _childValues;
    
    TankCell *pushChild(const SuperString &, double);
    TankCell *pushChild(const SuperString &, const SuperString &);
};

class Tank: public TankIterator {
    
    friend class RecordThread;
    friend class Block;
    friend class Beam;
    friend class NaviResultPanel;
    friend class Navigator;
    friend class BlockCluster;
    friend class TankCell;
    friend class JsonIllegalReadError;
    friend class JsonIllegalSearchError;
    
public:
    //BC 20201208
    /*TankCell *addCell(const SuperString &, double);
    TankCell *addCell(const SuperString &, const SuperString &);*/
    
    Tank *addSubTank(Tank *tank);
    
    virtual inline TankCell *getCell(const SuperString &id) const {

        bool f = false;
        TankCell *retCell = this->getCell(id, f);
        
        if(retCell) {
            return retCell;
        }
        
        throw new TankSearchError(id._getString(), this->name._getString());
    }
/*
    virtual inline TankCell *getCell(const StringNode *const &id) const {

        bool f = false;
        TankCell *retCell = this->getCell(id, f);
        
        if(retCell) {
            return retCell;
        }
        
        throw new TankSearchError(id->_getString(), this->name._getString());
    }*/
    
    virtual inline Tank *getSubTank(const SuperString &id) const {
    
        bool f = false;
        return this->getSubTank(id, f);
    }
    
    /*virtual inline Tank *getSubTank(const StringNode *const &id) const {
    
        bool f = false;
        return this->getSubTank(id, f);
    }*/
    
    virtual inline TankCell &operator () (const SuperString &id) const
    {return *this->getCell(id);}

    virtual inline TankCell &operator () (const char *id) const
    {return *this->getCell(SuperString(id));}
    
    virtual const TankIterator &operator [] (const long &key) const override ;
    virtual const TankIterator &operator [] (const SuperString &key) const override;
    virtual inline const TankIterator &operator [] (const char *key) const override{return this->operator[](SuperString(key));};

    /*virtual inline const TankIterator &operator [] (const StringNode *const &key) const override {

        try {
            return *(TankCell *)this->_valueTank._getItem(key, false)->_getPointer();
        }
        catch (GeneralException *e) {

            delete e;

            try {
                return *(Tank *)this->_subTank._getItem(key, false)->_getPointer();
            }
            catch (GeneralException *e) {

                delete e;
                throw new JsonIllegalSearchError(this, key->superString._getString(), ErrorTypes::JSON_ILLEGAL_LOOKUP);
            }
        }
    }*/
    
    inline virtual operator double () const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    //inline virtual operator const Tank &() const override
    //{return *this;}
    
    inline virtual operator const SuperString &() const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}

    virtual void forEach(std::function<bool (TankIterator &)>) const override;
    
    inline virtual int _size() const override
    {return (int)(this->_valueTank._size() + this->_subTank._size());}
    
    virtual inline bool operator == (const double &v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual bool operator == (const char *v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual inline bool operator == (const std::string& v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual bool operator == (const SuperString &v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual inline bool operator != (const double &v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual bool operator != (const char *v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual inline bool operator != (const std::string& v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual bool operator != (const SuperString &v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual inline bool operator > (const double &v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual bool operator > (const char *v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual inline bool operator > (const std::string& v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual bool operator > (const SuperString &v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual inline bool operator >= (const double &v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual bool operator >= (const char *v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual inline bool operator >= (const std::string& v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual bool operator >= (const SuperString &v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}

    virtual inline bool operator < (const double &v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual bool operator < (const char *v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual inline bool operator < (const std::string& v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual bool operator < (const SuperString &v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual inline bool operator <= (const double &v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual bool operator <= (const char *v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual inline bool operator <= (const std::string& v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
    virtual bool operator <= (const SuperString &v) const override
    {throw new JsonIllegalSearchError(this, ErrorTypes::JSON_ILLEGAL_CELL);}
    
private:
    
    TankCell *getCell(const SuperString &, bool &) const;
    //TankCell *getCell(const StringNode *const &, bool &) const;
    Tank *getSubTank(const SuperString &, bool &) const;
    //Tank *getSubTank(const StringNode *const &, bool &) const;
    void loadTankFromJSON(char *&p);
    
protected:
    
    Tank();
    Tank(const SuperString &),
    Tank(const SuperString &, const Beam *);
    Tank(const SuperString &, const std::string &, const Beam *);
    Tank(const SuperString &, char *&, Tank *, const Beam *);

    const Beam *_owner = nullptr;
    const GeneralMemoryManager *_tankCellManager = nullptr;

    HypMap _valueTank;
    HypMap _subTank;
    
    TankCell *addCell(const SuperString &, double);
    TankCell *addCell(const SuperString &, const SuperString &);
    
    void copyTankCell(TankCell *cell);
    void copySubTank(Tank *tank);
};

//_CODE_END_

#endif /* Tank_hpp */
