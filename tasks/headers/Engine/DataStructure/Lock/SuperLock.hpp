//
//  SuperLock.20201126.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2020/11/26.
//  Copyright © 2020年 陈曦. All rights reserved.
//

#ifndef SuperLock_20201126_hpp
#define SuperLock_20201126_hpp

#include <stdio.h>
#include <atomic>
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <iomanip>
#include <sys/time.h>
// #include "Definitions.hpp"
//_CODE_START_

class SingleLock{
    
    friend class SuperLock;
    friend class ResultChunkPack;
    friend class BlockResult;
    friend class GeneralMemoryManager;
    //friend class StringNode;
    friend class HypList;
    
public:
    // #if defined(_SYSTEM_IS_WINDOWS)
    // SingleLock() {};

    // SingleLock(const long &lockId): _lockId(lockId) {};
    // #else
    SingleLock():_lockFlag(ATOMIC_FLAG_INIT) {};

    SingleLock(const long &lockId): _lockId(lockId), _lockFlag(ATOMIC_FLAG_INIT) {};
    // #endif
    /*
    inline int64_t getCurrentTime() const {
    
        struct timeval tv;
        gettimeofday(&tv,NULL);
        return tv.tv_sec * 1000 + tv.tv_usec / 1000;
    }*/
    inline void lock() const noexcept{
        // while(this->_lockFlag.test_and_set()) {
        while(this->_lockFlag.test_and_set(std::memory_order_acquire)) {
            std::this_thread::yield();
        }
    }
    
    inline void release() const noexcept{
        // this->_lockFlag.clear();
        this->_lockFlag.clear(std::memory_order_release);
    }

    inline void setLockID(const long& id)
    {this->_lockId = id;};
    
protected:
    
    //mutable std::mutex _lockMutex;
    //mutable std::condition_variable _lockCondition;
    mutable std::atomic_flag _lockFlag;
    long _lockId = 0;
    //mutable bool _locked = false;
};

class SuperLock{
    
    friend class Tank;
    friend class DataRollRecord;
    friend class BlockResult;
    
public:

    SuperLock();

    SuperLock(const int &lockId);

    
    inline void setLockID(const int &id)
    {this->_lockId = id;}
    
    void lock(bool) const noexcept; 
    void release(bool) const noexcept;
    
private:
    
    int _lockId = 0;
    // mutable std::atomic<int> _readThreads = 0;
    mutable int _readThreads = 0;

    mutable std::atomic_flag _writeFlag;
    mutable std::atomic_flag _readFlag;
    void initialiseLock();

};

//_CODE_END_

#endif /* SuperLock_20201126_hpp */
