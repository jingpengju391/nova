//
//  Switcher.20200803.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2020/08/03.
//  Copyright © 2020年 陈曦. All rights reserved.
//

#ifndef Switcher_20200803_hpp
#define Switcher_20200803_hpp

#include <stdio.h>
#include <iostream>
#include <functional>

#ifndef NOEXCEPT

#ifdef __MINGW64__
#define NOEXCEPT noexcept
#else
#define NOEXCEPT noexcept
#endif

#endif

#include "SuperString.hpp"
#include "ErrorHandler.hpp"

//_CODE_START_

template <typename R, typename... I>
class FormulaHolder {

public:
    
    class IB {
    
        template <typename RR, typename... II> friend class FormulaHolder;
        
    protected:
        virtual R formula(I...) = 0;
    };
    
    template <typename X>
    class IS: public IB {
    
        template <typename RR, typename... II> friend class FormulaHolder;
        
    protected:
        
        R (X::*_func)(I...) = nullptr;
        X *_fh = nullptr;
        
        virtual inline R formula(I... inputs) override
        {return (this->_fh->*this->_func)(inputs...);}
    };
    
    template <typename X>
    inline void getFormula(void *fh, R (X::*f)(I...)) {
        
        IS<X> *newIS = new (this->_posIS) IS<X>();
        newIS->_func = f;
        newIS->_fh = (X *)fh;
    }
    
    inline R calculateWithFormula(I... inputs)
    {return this->_is.formula(inputs...);}
    
private:
    
    IB &_is = *(IB *)this->_posIS;
    unsigned char _posIS[40];
};

template <typename R, typename... I>
class ConstFormulaHolder {

public:
    
    class IB {
    
        template <typename RR, typename... II> friend class ConstFormulaHolder;
        
    protected:
        virtual R formula(I...) const = 0;
    };
    
    template <typename X>
    class IS: public IB {
    
        template <typename RR, typename... II> friend class ConstFormulaHolder;
        
    protected:
        
        R (X::*_func)(I...) const = nullptr;
        const X *_fh = nullptr;
        
        virtual inline R formula(I... inputs) const override
        {return (this->_fh->*_func)(inputs...);}
    };
    
    template <typename X>
    inline void getFormula(const void *fh, R (X::*f)(I...) const) {
        
        IS<X> *newIS = new (this->_posIS) IS<X>();
        newIS->_func = f;
        newIS->_fh = (const X *)fh;
    }
    
    inline R calculateWithFormula(I... inputs) const
    {return this->_is.formula(inputs...);}
    
private:
    
    IB &_is = *(IB *)this->_posIS;
    unsigned char _posIS[40];
};

template <typename T>
class NumSuperSwitcher {
    
public:
    
    NumSuperSwitcher() { }
    
    virtual T projection() const  = 0;
    
    inline T setValue(const T &value) const {
        this->_hasValue = true;
        return this->_value = value;
    }
    
    inline void removeValue() const
    {this->_hasValue = false;}
    
    inline T value() const
    {return this->_hasValue ? this->_value : this->setValue(this->projection());}
    
    inline operator T () const
    {return this->value();}
    
    inline bool hasValue() const NOEXCEPT
    {return this->_hasValue;}
    
protected:
    
    mutable bool _hasValue = false;
    mutable T _value = 0;
};

template<typename T, typename D>
class NumQuickSwitcher: public NumSuperSwitcher<T> {

public:

    NumQuickSwitcher(D *definer, T (D::*func)()):
    NumSuperSwitcher<T>(),
    _definer(definer),
    _func(func) { }

    inline virtual T projection() const override 
    {return (this->_definer->*this->_func)();}
    
protected:

    D *_definer = nullptr;
    T (D::*_func)() = nullptr;
};

template<typename T>
class NumLambdaSwitcher: public NumSuperSwitcher<T> {

public:

    NumLambdaSwitcher(std::function<int ()>func):
    NumSuperSwitcher<T>(),
    _func(func) { }

    inline virtual T projection() const override 
    {return this->_func();}

protected:
    
    std::function<T ()> _func;
};

template <typename T>
class PtrSuperSwitcher {
    
public:
    
    PtrSuperSwitcher(bool allowNull):
    _allowNullptr(allowNull) { };
    
    virtual T *projection() const  = 0;
    
    T *setValue(T *value) const {
        this->_hasValue = true;
        return this->_value = value;
    }
    
    inline void removeValue() const {
        this->_hasValue = false;
    }
    
    inline T *value() const {
        
        T *res = this->_hasValue ? this->_value : this->setValue(this->projection());
        
        if(res || this->_allowNullptr) {
            return res;
        }
        
        throw new EmptyPtrSwitcherError();
    }
    
    inline T &operator () () const
    {return *this->value();}
    
    inline T *operator -> () const
    {return this->value();}
    
    inline bool hasValue() const NOEXCEPT
    {return this->_hasValue;}
    
protected:
    
    mutable bool _hasValue = false;
    mutable T *_value = nullptr;
    bool _allowNullptr = false;
};

template<typename T, typename D>
class PtrQuickSwitcher: public PtrSuperSwitcher<T> {

public:
    
    PtrQuickSwitcher(D *definer, T *(D::*func)()):
    PtrSuperSwitcher<T>(false),
    _definer(definer),
    _func(func) { }
    
    PtrQuickSwitcher(D *definer, T *(D::*func)(), bool allowNull):
    PtrSuperSwitcher<T>(allowNull),
    _definer(definer),
    _func(func) { }

    inline virtual T *projection() const override
    {return (this->_definer->*this->_func)();}
    
protected:

    D *_definer = nullptr;
    T *(D::*_func)() = nullptr;
};

template<typename T>
class PtrLambdaSwitcher: public PtrSuperSwitcher<T> {

public:
    
    PtrLambdaSwitcher(std::function<T * ()> func):
    PtrSuperSwitcher<T>(false),
    _func(func) { }
    
    PtrLambdaSwitcher(std::function<T * ()> func, bool allowNull):
    PtrSuperSwitcher<T>(allowNull),
    _func(func){ }

    inline virtual T *projection() const override
    {return this->_func();}
    
protected:

    std::function<T *()> _func;
};

class StrSuperSwitcher {
    
public:
    
    StrSuperSwitcher() { }
    
    virtual const SuperString &projection() const  = 0;
    
    const SuperString &setValue(const SuperString &value) const {
        this->_hasValue = true;
        return (this->_value = value);
    }
    
    void removeValue() const
    {this->_hasValue = false;}
    
    const SuperString &value() const
    {return this->_hasValue ? this->_value : this->setValue(this->projection());}
    
    operator const SuperString &() const
    {return this->value();}
    
    bool hasValue() const NOEXCEPT
    {return this->_hasValue;}
    
protected:
    
    mutable bool _hasValue = false;
    mutable SuperString _value;
};

template <typename D>
class StrQuickSwitcher: public StrSuperSwitcher {

public:

    StrQuickSwitcher(D *definer, const SuperString &(D::*func)()):
    StrSuperSwitcher(),
    _definer(definer),
    _func(func) { }

    inline virtual const SuperString &projection() const override
    {return (this->_definer->*this->_func)();}
    
protected:

    D *_definer = nullptr;
    const SuperString &(D::*_func)() = nullptr;
};

class StrLambdaSwitcher: public StrSuperSwitcher {

public:

    StrLambdaSwitcher(std::function<const SuperString &()>func):
    StrSuperSwitcher(),
    _func(func) { }

    inline virtual const SuperString &projection() const override
    {return this->_func();}

protected:
    
    std::function<const SuperString &()> _func;
};

//_CODE_END_

#endif /* Switcher_20200803_hpp */
