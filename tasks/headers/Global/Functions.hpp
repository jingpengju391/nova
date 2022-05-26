//
//  Functions.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2018/1/4.
//  Copyright © 2018年 陈曦. All rights reserved.
//

#ifndef Functions_hpp
#define Functions_hpp

#include <stdio.h>
#include <vector>
#include <sys/time.h>
#include <iostream>
#include <unistd.h>
#include <string.h>
#include <dirent.h>
#include <cxxabi.h>

#ifndef _SYSTEM_DEFINED

#define _SYSTEM_DEFINED

#ifdef __MINGW64__

#define _SYSTEM_IS_WINDOWS

#else

#if defined (__APPLE__) && defined(__GNUC__)

#define _SYSTEM_IS_MAC

#elif defined(__MACOSX__)

#define _SYSTEM_IS_MAC

#elif defined(macintosh)

#define _SYSTEM_IS_MAC

#elif defined(__linux__)
#define _SYSTEM_IS_LINUX
#endif
#endif
#endif

#ifdef _SYSTEM_IS_WINDOWS

#include <windows.h>
#include <TCHAR.h>
#include <io.h>

#else

#include <sys/stat.h>
#include <sys/types.h>
#include <sys/file.h>
#include <fcntl.h>

#ifdef _SYSTEM_IS_MAC

#include <mach-o/dyld.h>

#endif
#endif

#include <math.h>
#include <random>
#include "SuperString.hpp"

inline int64_t getCurrentTime() {
    
    struct timeval tv;
    gettimeofday(&tv,NULL);
    return tv.tv_sec * 1000 + tv.tv_usec / 1000;
}

inline long getMemoryChunkIndex(const long &timeStepIndex)
{return timeStepIndex >= 0 ? timeStepIndex >> _MEMORY_PACK_LENGTH_INDEX : -((-timeStepIndex - 1) >> _MEMORY_PACK_LENGTH_INDEX) - 1;}

const double MONTHLY_PROPORTION = 1.0 / 12.0;

inline double monthlyDecrement(const double& decrement)
{return decrement >= 1 ? 1.0 : (1.0 - pow(1.0 - decrement, MONTHLY_PROPORTION));}

inline double monthlyRate(const double& rate)
{return pow(1.0 + rate, MONTHLY_PROPORTION) - 1.0;}

const double _QUARTERLY_PROPORTION = 0.25;

inline double quarterlyDecrement(double decrement)
{return decrement >= 1 ? 1.0 :( 1.0 - pow(1.0 - decrement, _QUARTERLY_PROPORTION));}

inline double auarterlyRate(double rate)
{return pow(1.0 + rate, _QUARTERLY_PROPORTION) - 1.0;}

const double _HALF_YEARLY_PROPORTION = 0.5;

inline double halfYearlyDecrement(double decrement)
{return decrement >= 1 ? 1.0 :( 1.0 - pow(1.0 - decrement, _HALF_YEARLY_PROPORTION));}

inline double halfYearlyRate(double rate)
{return pow(1.0 + rate, _HALF_YEARLY_PROPORTION) - 1.0;}

bool isLegalChar(const char &c);

char *toLower(const char *);
bool createFolder(const std::string);
bool removeFolder(const std::string);
std::string getParentFolder(std::string childFolder);
std::string getCurrentDir();
bool checkValidName(char);

SuperString getRealClassName(const char *);



std::string _replace(std::string str, const std::string& findStr, const std::string& repStr);

inline const long& min (const long& a, const long& b){return a < b? a: b;};
inline const long& max (const long& a, const long& b){return a > b? a: b;};

bool inCollection(const StringVariableBase& str, const char* chrSet);
bool inCollection(const StringVariableBase& str, const std::string& chrSet);



inline bool fileExist(const char* file_name){return access(file_name, F_OK) != -1;};
inline bool folderExist(const char* folder_name){return access(folder_name, F_OK) != -1;};
inline bool folderExist(const std::string& folder_name){return access(folder_name.c_str(), F_OK) != -1;};
inline bool folderExist(const SuperString& folder_name){return access(folder_name._getString().c_str(), F_OK) != -1;};
bool folderExist(const StringVariableBase& folder_name);
inline bool fileExist(const std::string& file_name){return access(file_name.c_str(), F_OK) != -1;};
inline bool fileExist(const SuperString& file_name){return access(file_name._getString().c_str(), F_OK) != -1;};
bool fileExist(const StringVariableBase& file_name);

inline double _getNextGoalSeekValue(const double& y1, const double& y2, const double& x1, const double& x2){return (y2 != y1)? (y2 * x1 - x2 * y1)/(y2 - y1) : (x2? x2 * 1.05 : 0.2);};

std::string getBlockName(const std::string& fullName);
std::string getWorkingDir();
double cdf(const std::normal_distribution<double>& dist, const double& x);
double pdf(const std::normal_distribution<double>& dist, const double& x);
double quantile(const std::normal_distribution<double>& dist, const double& p);
double round(const double& number, const long& no);
void* safe_malloc(const std::size_t& size);
#endif /* Functions_hpp */
