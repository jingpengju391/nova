//
//  Definitions.hpp
//  PlatformJProjectJinShaJiang
//
//  Created by 陈曦 on 2018/1/6.
//  Copyright © 2018年 陈曦. All rights reserved.
//

#ifndef Definitions_hpp
#define Definitions_hpp

#include <stdio.h>

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

#endif
#endif
#endif

//#define _COMPLICATE_MODEL
//#define _SIMPLE_MODEL
//#define _MODEL_ONE
//#define _MODEL_CHINALIFE_LIAB
#define _MODEL_CHINALIFE_SUMMARY
//#define _CHECK_MEMORY
//#define _CHECK_ARCHIVE
// #define _MODEL_CHINALIFE_ALM
//#define _DEBUG_RECORD_PROGRESS

#define _FORCE_STACKING_THREADS
#define _ITEM_NOT_DEFINED_WARNING

#define _LOG_FREQUENCY_MP                       100
//#define _ERROR_TRACE_LENGTH                     16            //BC 20201209

//#define _DEFAULT_MULTI_THREAD_CAPACITY          8             //BC 20201125
//#define _DEFAULT_RECORD_BATCH_SIZE              32            //BC 20201209
#define _INDEX_CHAIN_LENGTH                     16
#define _NEVER_RETURN_CHUNK_SIZE                1048576         // = 1024 * 1024
#define _SIZE_OF_BLOCK_FAMILY                   32

#define _INITIAL_STRING_NODE_LENGTH             512
#define _REALLOC_STRING_NODE_LENGTH             128
#define _INITIAL_STRING_TREE_LENGTH             512
#define _REALLOC_STRING_TREE_LENGTH             128
#define _STRING_NODE_CHAR_LENGTH                8

#define _MAX_TIME_STEP                          2880        //_MAX_TIMESTEP_NODES * _MEMORY_PACK_LENGTH 

#define _MEMORY_PACK_LENGTH                     64 //256
#define _MEMORY_PACK_LENGTH_INDEX               6
#define _MEMORY_POOL_RETAINED                   4
#define _RETURN_EMPTY_MEMORY_POOL             //BC 20201128

#ifndef Pi 
#define Pi 3.141592653589793238462643 
#endif 

//#define _ARCHIVE_FOLDER                         "archive"         //BC 20201209

//#define _OUTPUT_PAGE_NODE_MULTIPLIER            8             //BC 20201209
//#define _OUTPUT_PAGE_NODE_WO_BUFFER             6
//#define _OUTPUT_PAGE_POOL_BASE_SIZE             2048          //BC 20201209
//#define _OUTPUT_PAGE_POOL_BUFFER_SIZE           512           //BC 20201209
//#define _OUTPUT_PAGE_ARCHIVE_PREFIX             "outputPageNode."     //BC 20201209
//#define _OUTPUT_PAGE_ARCHIVE_POSTFIX            ".archive"            //BC 20201209
//#define _OUTPUT_PRECISION                       6

//#define _DATA_RECORD_BATCH_MULTIPLIER           8             //BC 20201209
//#define _DATA_RECORD_BATCH_WO_BUFFER            7             //BC 20201209

#define _INITIAL_FOLDER_NODE_CHUNK_LENGTH       1024
#define _REALLOC_FOLDER_NODE_CHUNK_LENGTH       256
#define _INITIAL_LINE_CHUNK_LENGTH              4096 
#define _REALLOC_LINE_CHUNK_LENGTH              1024 
#define _INITIAL_POINT_CHUNK_LENGTH             1024 
#define _REALLOC_POINT_CHUNK_LENGTH             512 
#define _INITIAL_PAGE_NODE_CHUNK_LENGTH         2048
#define _REALLOC_PAGE_NODE_CHUNK_LENGTH         512

//#define _OUTPUT_FILE_NAME_POSTFIX               "_OUTPUT"         //BC 20201209

#define _DEFAULT_OUTPUT_CORNER                  "#"
#define _DEFAULT_OUTPUT_DELIMETER               ","
#define _DEFAULT_OUTPUT_DELIMETER_CHAR          ','                     //BC 20201124

#define _ERROR_INTEGER                          -99999
#define _ERROR_DATA_LINKAGE                     -999999
#define _ERROR_STRING                           getSuperString("#ERROR")
#define _IND_NO                                 getSuperString("N")
#define _TANK_NAME_DATA_ROLL_RECORD             getSuperString("MP_DATA")
#define _FIXED_VALUE                            getSuperString("FIXED_VALUE")
#define _DEFAULT_TANK_NAME                      getSuperString("DEFAULT")

/*          //BC 20201125
#ifdef __DEBUG_MODE
#define _CALCULATION_CHAIN_CRITICAL_LENGTH      384    //768
#else
#define _CALCULATION_CHAIN_CRITICAL_LENGTH      2048
#endif
*/

#define _STRING_END                             '\0'
#define _STRING_ENTER                           13
#define _STRING_LINE                            10
#define _STRING_SPACE                           ' '
#define _LEFT_MID                               '['
#define _LEFT_BIG                               '{'
#define _RIGHT_MID                              ']'
#define _RIGHT_BIG                              '}'
#define _JSON_SEP                               ','
#define _JSON_FIELD                             ':'

#define _INITIAL_VALUE_UNIT_CHUNK_LENGTH        1024
#define _REALLOC_VALUE_UNIT_CHUNK_LENGTH        512
#define _INITIAL_TANK_CHUNK_LENGTH              512
#define _REALLOC_TANK_CHUNK_LENGTH              128

#define _INITIAL_BLOCK_CLUSTER_LENGTH           512
#define _REALLOC_BLOCK_CLUSTER_LENGTH           128
#define _INITIAL_BLOCK_FAMILY_LENGTH            512
#define _REALLOC_BLOCK_FAMILY_LENGTH            128
#define _INITIAL_NAVIGATOR_LENGTH               256
#define _REALLOC_NAVIGATOR_LENGTH               64

#define _DEFAULT_TABLE_DELIMETER                ','
#define _TXT_FILE_READER_BUFFER_SIZE            16384           //2048 * 16
#define _TXT_FILE_IO_MODE                       "rb"
#define _TXT_FILE_IO_OPEN_NUMBER                 64
//#define _USE_FOPEN_MODE                       

#define _INPUT_TYPE_NUMBER                      'n'
#define _INPUT_TYPE_STRING                      's'
#define _OTHER_INDICATOR_SKIP                   100
#define _OTHER_INDICATOR_MISSING                200
#define _OTHER_INDICATOR_BLACK_HOLE             900

#define _TXT_ROW_STOP_GAP                       128
#define _TXT_ROW_STOP_SIZE                      128

#define _TXT_TABLE_CORNER_IND                   '#'
#define _TXT_TABLE_COLUMN_IND                   'C'
#define _TXT_TABLE_ROW_IND                      'R'
#define _TXT_TABLE_COLUMN_END_IND               'E'

#define _INDEX_MISSING_FIRST                    'f'
#define _INDEX_MISSING_LAST                     'l'
#define _INDEX_MISSING_PREVIOUS                 'p'
#define _INDEX_MISSING_NEXT                     'n'
#define _INDEX_MISSING_MISSING                  'm'
#define _INDEX_MISSING_ERROR                    'e'

#define _TABLE_SPECIAL_IND                      '#'
#define _TABLE_SKIP_IND                         's'
#define _TABLE_MISSING_IND                      'm'
#define _RESULT_INDEX                           "index"

#define _FORCE_END_IND                          '#'

#define _INITIAL_TABLE_LENGTH                   256
#define _REALLOC_TABLE_LENGTH                   64

#define _INITIAL_TABLE_UNIT_LENGTH              512
#define _REALLOC_TABLE_UNIT_LENGTH              128
#define _INITIAL_VARIABLE_LENGTH                512
#define _REALLOC_VARIABLE_LENGTH                128
#define _MINI_TEMP_STRING_CHUNK_SIZE            32
#define _SHORT_TEMP_STRING_CHUNK_SIZE           128
#define _LONG_TEMP_STRING_CHUNK_SIZE            256
#define _LARGE_TEMP_STRING_CHUNK_SIZE           2048
#define _INITIAL_TEMP_STRING_CHUNK_LENGTH       1024
#define _REALLOC_TEMP_STRING_CHUNK_LENGTH       256

//#define _TABLE_ARCHIVE_PREFIX                   "tableUnit"       //BC 20201209
//#define _TABLE_ARCHIVE_POSTFIX                  ".archive"        //BC 20201209

#define _INITIAL_BLOCK_LINK_LENGTH              256
#define _REALLOC_BLOCK_LINK_LENGTH              64
#define _INITIAL_TABLE_VAR_LENGTH               256
#define _REALLOC_TABLE_VAR_LENGTH               64

#define _INITIAL_NAVI_RESULT_PANEL_CHUNK_LENGTH 1028
#define _REALLOC_NAVI_RESULT_PANEL_CHUNK_LENGTH 256

#define _INITIAL_BLOCK_CHUNK_LENGTH_MULTIPLE    1               //BC 20201125
#define _REALLOC_BLOCK_CHUNK_LENGTH_MULTIPLE    8               //BC 20201125

#define _INITIAL_SERIES_CHUNK_LENGTH            1024
#define _REALLOC_SERIES_CHUNK_LENGTH            256

//#define _BLOCK_RESULT_CRITICAL_LENGTH           98000           //65536   //BC 20201209
//#define _BLOCK_RESULT_BUFFER_LENGTH             16000           //5120//8192  //BC 20201209
//#define _SUPER_TABLE_CRITICAL_LENGTH            8000            //4096        BC 20201209
//#define _SUPER_TABLE_BUFFER_LENGTH              2000          //BC 20201209

//#define _NAVI_RESULT_PANEL_ARCHIVE_PREFIX       "resultPanel"     //BC 20201209
//#define _NAVI_RESULT_PANEL_ARCHIVE_POSTFIX      ".archive"        //BC 20201209

#define _QUICK_LIST_DEFAULT_SIZE                16
#define _INITIAL_QUICK_LIST_LENGTH              128
#define _REALLOC_QUICK_LIST_LENGTH              64
#define _INITIAL_LIST_CORE_LENGTH               512
#define _REALLOC_LIST_CORE_LENGTH               128

#define _INITIAL_SUPER_MAP_LENGTH               512
#define _REALLOC_SUPER_MAP_LENGTH               128
#define _INITIAL_SUPER_MAP_ITEM_LENGTH          2048
#define _REALLOC_SUPER_MAP_ITEM_LENGTH          512
#define _INITIAL_SUPER_MAP_CORE_LENGTH          2048
#define _REALLOC_SUPER_MAP_CORE_LENGTH          512
#define _INITIAL_SUPER_MAP_ITEM_LENGTH          2048
#define _REALLOC_SUPER_MAP_ITEM_LENGTH          512

//#define _USED_BLOCK_CRITICAL_LENGTH             4096                //8192        //BC 20201209
//#define _USED_BLOCK_RETAIN_LENGTH               2048              //BC 20201209
//#define _BLOCK_COPY_RETAIN_LENGTH               16                  //BC 20201205
//#define _BLOCK_DEPTH_RETAIN_LENGTH              64                  //BC 20201205

#define _INITIAL_PERIOD_SECTOR_LENGTH           long (_MAX_TIME_STEP /_MEMORY_PACK_LENGTH) * 2 + 1 > 512? long (_MAX_TIME_STEP /_MEMORY_PACK_LENGTH) * 2 + 1: 512                 //2048
#define _REALLOC_PERIOD_SECTOR_LENGTH           long (_MAX_TIME_STEP /_MEMORY_PACK_LENGTH) * 2 + 1 > 512? long (_MAX_TIME_STEP /_MEMORY_PACK_LENGTH) * 2 + 1: 512
#define _INITIAL_RESULT_SECTOR_LENGTH           2048
#define _REALLOC_RESULT_SECTOR_LENGTH           2048
#define _INITIAL_RESULT_REBASE_SECTOR_LENGTH    256
#define _REALLOC_RESULT_REBASE_SECTOR_LENGTH    512
#define _INITIAL_EXPRESS_NODE_LENGTH            256                 //BC 20201206
#define _REALLOC_EXPRESS_NODE_LENGTH            128                 //BC 20201206
//#define _INITIAL_VARIABLE_ITERATION_LENGTH      16
//#define _REALLOC_VARIABLE_ITERATION_LENGTH      8                 
#define _INITIAL_PERIOD_SECTOR_ITERATION_LENGTH long (_MAX_TIME_STEP /_MEMORY_PACK_LENGTH) * 2 + 1 > 64? long (_MAX_TIME_STEP /_MEMORY_PACK_LENGTH) * 2 + 1: 64 
#define _REALLOC_PERIOD_SECTOR_ITERATION_LENGTH long (_MAX_TIME_STEP /_MEMORY_PACK_LENGTH) * 2 + 1 > 32? long (_MAX_TIME_STEP /_MEMORY_PACK_LENGTH) * 2 + 1: 32 
#define _INITIAL_VARIABLE_ITERATION_LENGTH 32
#define _REALLOC_VARIABLE_ITERATION_LENGTH 32

#define _LOCKER_ID_STRING_MANAGER               301
#define _LOCKER_ID_STRING_NODE                  302
#define _LOCKER_ID_NAVI_BLOCK_RESULT            303
#define _LOCKER_ID_DATA_ROLL                    304
#define _LOCKER_ID_SUPER_TABLE_MGR_QUICK_TBL    305
#define _LOCKER_ID_SUPER_TABLE                  306
#define _LOCKER_ID_SUPER_TABLE_ROW_MAP          307
#define _LOCKER_ID_QUICK_TABLE                  308
#define _LOCKER_ID_SUPER_TABLE_ROW              309
#define _LOCKER_ID_BLOCK_RESULT                 310
#define _LOCKER_ID_NAVIGATOR_MANAGER            311
#define _LOCKER_ID_OUTPUT_FOLDER_LOADER         312
#define _LOCKER_ID_NAVI_BLOCK_RESULT_MAP        313
#define _LOCKER_ID_PAGE_NODE_MANAGER            314
#define _LOCKER_ID_SECTOR_BLOCK                 315
#define _LOCKER_ID_PAGE_SERIES                  316
#define _LOCKER_ID_LINE_MANAGER                 317
#define _LOCKER_ID_SUPER_TABLE_VARIABLE         318
#define _LOCKER_ID_BLOCK_RESULT_VARIABLE        319
#define _LOCKER_ID_BLOCK_RESULT_TABLE           320             
#define _LOCKER_ID_OUTPUT_FOLDER_MAP            321
#define _LOCKER_ID_OUTPUT_PAGE_MAP              322
#define _LOCKER_ID_OUTPUT_FOLDER_CHAINPOOL      323

#define _MEM_ID_VALUE_UNION                     101
#define _MEM_ID_BLOCK                           102
#define _MEM_ID_SERIES_COPY                     103
#define _MEM_ID_SUPER_TABLE                     104
#define _MEM_ID_QUICK_TABLE                     105
#define _MEM_ID_TABLE_VARIABLE                  116
#define _MEM_ID_SUPER_MAP_ITEM                  107
#define _MEM_ID_SUPER_MAP_CORE                  108
#define _MEM_ID_SUPER_MAP                       109
#define _MEM_ID_BLOCK_RESULT                    110
#define _MEM_ID_STRING_VARIABLE                 111
#define _MEM_ID_STRING_NODE                     112
#define _MEM_ID_STRING_TREE                     113
#define _MEM_ID_QUICK_LIST                      114
#define _MEM_ID_SHORT_TXT_ROW                   115
#define _MEM_ID_LONG_TXT_ROW                    116
#define _MEM_ID_FOLDER_NODE                     117
#define _MEM_ID_PAGE_NODE                       118
#define _MEM_ID_BLOCK_LINK                      119
#define _MEM_ID_LINE                            120
#define _MEM_ID_PERIOD_SECTOR                   121
#define _MEM_ID_RESULT_SECTOR                   122
#define _MEM_ID_PERIOD_SECTOR_CONTENT           123
#define _MEM_ID_RESULT_SECTOR_CONTENT           124
#define _MEM_ID_RESULT_REBASE_SECTOR            125
#define _MEM_ID_PERIOD_DOCK_SECTOR              126
#define _MEM_ID_PERIOD_DOCK_RESULT_SECTOR       127
#define _MEM_ID_BLOCK_CLUSTER                   128
#define _MEM_ID_LIST_CORE                       129
#define _MEM_ID_TANK                            130
#define _MEM_ID_TABLE_VAR                       131
#define _MEM_ID_NAVIGATOR                       132
#define _MEM_ID_NEVER_RETURN                    133
#define _MEM_ID_SERIES_DEEP                     134
#define _MEM_ID_FLOAT_VARIABLE                  135
#define _MEM_ID_INTEGER_VARIABLE                136
#define _MEM_ID_EXPRESS_NODE                    137                 //BC 20201206
#define _MEM_ID_VARIABLE_ITERATION              138
#define _MEM_ID_PERIOD_SECTOR_ITERATION         139
#define _MEM_ID_PERIOD_SECTOR_CONTENT_ITERATION 140
#define _MEM_ID_DATA_RECORD_ID                  141
#define _MEM_ID_DATA_ROLL_ID                    142

#define _FOLDER_SEP_IN_ALL_SYSTEMS              "\\/"
#ifdef _SYSTEM_IS_WINDOWS
#define _FOLDER_SEPARATOR                       "\\"
#else
#define _FOLDER_SEPARATOR                       "/"
#endif

#define _JSON_HEAD                              "JSON"
#define _EMPTY_TANK                             getSuperString("emptyTank")

#define _INITIAL_DOCK_LENGTH                    0
#define _INITIAL_DOCK_ID                        -1

#define _STRING_COLLECTION_SEP_                 '|'
#define _OUTPUT_DEEP_PREFIX                     "d"
#define _OUTPUT_COPY_PREFIX                     "c"

#define _LOOP_CONTROL_LIMIT                     4
#define _STRING_NODE_RESERVE                    4

#define _DOUBLE_COMPARE_PRECISION               0.0000000001
#define _VAL_DATE                               Beam::PROJECTION.val_date()

#define _PROD_BLOCK_SEPARATOR                   "_"

typedef unsigned char byte;
typedef double __JZ__result;

class SystemConstant {              //BC 20201206
    
public:
    
    enum ItemType{
        BASE,
        COPY,
        DEEP,
    };
};

#endif /* Definitions_hpp */
