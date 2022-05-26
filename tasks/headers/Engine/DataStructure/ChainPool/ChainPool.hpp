//
//  ChainPool.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2018/5/15.
//  Copyright © 2018年 陈曦. All rights reserved.
//

#ifndef ChainPool_hpp
#define ChainPool_hpp

#include <stdio.h>

#include "Functions.hpp"

class ChainPool;

//_CODE_START_

class ChainPoolNode{
    
    friend class ChainPool;
    friend class Beam;
    friend class OutputPageNode;
    friend class RecordThread;
    friend class Block;
public:
    
    inline void setVisitTime() const
    {this->_lastVisitTime = getCurrentTime();}
    
protected:
    
    virtual void _archive() = 0;
    virtual void _truncate() = 0;
  
    ChainPoolNode *_next = nullptr;
    ChainPoolNode *_previous = nullptr;
    
    mutable long _lastVisitTime = 0;
    
    mutable bool _archived = false;
    mutable bool _tableDetached = false;
    bool _saved = false;
};

class ChainPool{
    
    friend class ChainPoolNode;
    friend class RecordThread;
    friend class BlockResult;
    
protected:
    
    ChainPool(long, long);
    ChainPool();                    //BC 20201209

    inline void setCriticalPoint(const int &criticalLen, const int &retainLen) {        //BC 20201209

        this->_criteriaLength = criticalLen;
        this->_targetLength = retainLen;
    }

    void pushChainPoolNode(ChainPoolNode *) const;
    
    mutable ChainPoolNode *_nodeHead = nullptr;
    mutable ChainPoolNode *_nodeTail = nullptr;
    
    mutable long _totalNodeLength = 0;
    mutable long _currentNodeLength = 0;
    
    void archiveChainPool();
    void truncateChainPool();
    void sortNode();
    long _targetLength = 0;
    long _criteriaLength = 0;
    //mutable std::atomic<bool> _archiveNeeded;
    mutable std::atomic<bool> _archiveNeeded = false;            //BC 20201209

    void addActiveNodeCount() const;
    void reduceActiveNodeCount() const;
};

//_CODE_END_

#endif /* ChainPool_hpp */
