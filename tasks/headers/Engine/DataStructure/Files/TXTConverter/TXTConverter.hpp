//
//  TXTConverter.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2018/2/14.
//  Copyright © 2018年 陈曦. All rights reserved.
//

#ifndef TXTConverter_hpp
#define TXTConverter_hpp

#include <stdio.h>
#include <fstream>
#include <string>

#include "Definitions.hpp"
#include "QuickList.20200803.hpp"

class Beam;

//_CODE_START_

class TXTConverter {
    friend class TXTSuperTable;
public:
    
    TXTConverter(const std::string&);
    TXTConverter(const std::string&, const char);
 #ifndef _USE_FOPEN_MODE
    long long getLine(std::string&);
    bool getLineFromCopy(const long long&, std::string&);
 #endif   
    long long getLine(char *);
    long long getLine(const long long&, char *);
    bool getLineFromCopy(const long long&, char *); //BC 20201110
    
    void closeFile(bool);
    inline void closeFile(){this->closeFile(this->_fileCompleted);};
    bool openFile();
    
    bool moveTo(const long long&);
    static inline int filesOpened(){return TXTConverter::_fileOpened;};
    static inline int maxFilesOpened(){return TXTConverter::_maxFileOpened;};
    static inline int maxFilesStrict(){return TXTConverter::_maxFileStrict;};
protected:
    
    bool _isFileOpen = false;
    char _delimeter;
    long long _lastPos = 0;
    bool _fileCompleted = false;
    std::string _fileName;
#ifdef _USE_FOPEN_MODE
    FILE *_fin = nullptr;
#else
    std::ifstream _finStream;
    
#endif
    void returnMemory();
    
private:

    char *_openFileName = nullptr;
    static std::atomic<int> _fileOpened;
    static int _maxFileOpened;
    static int _maxFileStrict;
    
};

//_CODE_END_

#endif /* TXTConverter_hpp */
