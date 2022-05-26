
/*!
*  @file      d2c.h
*  @brief     SLM许可远程升级头文件
*  @details   可以对许可增、更新、删除、锁定、解除锁定等操作；增、删、改写文件操作；修正锁内虚拟时钟；签发动态代码包。
*             使用流程：
*               前提，调用master_open打开开发锁，用于签发d2c包
*               - 签发许可
*               第一步，调用 d2c_lic_new 创建d2c句柄
*               第二步，调用 d2c_add_lic 添加许可条款
*               第三步，调用 d2c_add_developer_cert 向D2C中添加设备证书链
*               第四步，调用 d2c_get 获取最终的d2c信息，可将结果直接通过ss_lm_update提供的接口升级到锁内，
*                    或者保存为*.d2c的文件异步方式升级到锁内。
*               - 签发文件
*               第一步，调用 d2c_file_seed_new 创建d2c句柄
*               第二步，调用 d2c_add_pkg 添加文件内容
*               第三步，调用 d2c_add_developer_cert 向D2C中添加设备证书链
*               第四步，调用 d2c_get 获取最终的d2c信息，可将结果直接通过ss_lm_update提供的接口升级到锁内，
*                   或者保存为*.d2c的文件异步方式升级到锁内。
*               最后，调用 d2c_delete 释放句柄，调用master_close关闭开发锁
*
*               D2C操作较为复杂，详细使用方法可通过Virbox SDK提供的Samples进行学习
*
*  @version   2.2.0
*  @date      2014-2018
*/

#ifndef _D2C_H
#define _D2C_H

#include "ss_define.h"

/*!
*   D2C包的签发类型(SIGN_TYPE)
*   - 证书签发给特定硬件锁锁
*   - 种子码可签发给所有设置了特定种子的硬件锁
*/
typedef enum _SIGN_TYPE {
    /** D2C由证书签发*/
    SIGN_TYPE_CERT          = 1,    
    /** D2C由种子码签发(暂不支持签发许可)*/
    SIGN_TYPE_SEED          = 2,    
} SIGN_TYPE;

/*!
*   D2C包的签名哈希类型
*/
typedef enum _D2C_HASH_ALGO {
    /** 哈希算法为：SHA-1 */
    D2C_HASH_ALGO_SHA1 = 1,
    /** 哈希算法为：SHA-256 */
    D2C_HASH_ALGO_SHA256 = 2,
} D2C_HASH_ALGO;

/*!
*   账户类型，指定给特定的签发对象
*/
typedef enum _ACCOUNT_TYPE {
    /** 签给非账户（硬件锁锁设备）*/
    ACCOUNT_TYPE_NONE   = 0, 
    /** 签给在线账户（硬件锁锁号作为匿名账户） */
    ACCOUNT_TYPE_USB    = 1,
    /** 签给邮箱账户（暂不支持） */
    ACCOUNT_TYPE_EMAIL  = 2,
    /** 签给手机账户（暂不支持） */
    ACCOUNT_TYPE_PHONE  = 3,
} ACCOUNT_TYPE;

/** 签发给账户许可的账户名最大长度 */
#define MAX_ACCOUNT_NAME_LENGTH         64      
/** 账户GUID的长度 */
#define D2C_GUID_LENGTH                 37      
/** 修复时钟的随机数长度*/
#define FIXTIME_RAND_LENGTH             8       
/** 碎片代码种子大小*/
#define SNIPPET_SEED_LENGTH             32      

/** 锁内文件权限定义*/
/** 文件开发者可读*/
#define ACCESS_READ                     0x01    
/** 文件开发者可修改删除*/
#define ACCESS_WRITE_DELETE             0x02    
/** 文件开发者可使用（针对密钥文件）*/
#define ACCESS_USE                      0x04    
/** 文件开发者可远程升级*/
#define ACCESS_WRITE_DELETE_RU          0x08    

/** 文件Entry可读*/
#define ACCESS_ENTRY_READ               0x10    
/** 文件Entry可修改删除*/
#define ACCESS_ENTRY_WRITE_DELETE       0x20    
/** 文件Entry可使用（针对密钥文件）*/
#define ACCESS_ENTRY_USE                0x40    
/** 文件深思可远程升级*/
#define ACCESS_ENTRY_WRITE_DELETE_RU    0x80    

/** 锁内CA/证书类型（使用频率不高）*/
/** 系统级别CA */
#define PKI_CA_TYPE_SYSTEM                          0       
/** 开发者CA */
#define PKI_CA_TYPE_DEVELOPER                       1       
/** 硬件设备CA */
#define PKI_CA_TYPE_DEVICE                          2       
/** 账户证书 */
#define PKI_CA_TYPE_ACCOUNT                         3       
/** 根证书 */
#define PKI_CA_TYPE_ROOT                            0x80    

/** 开发锁PIN码最小长度 */
#define CTRL_PIN_MIN_SIZE               8
/** 开发锁PIN码最大长度 */
#define CTRL_PIN_MAX_SIZE               255

/** D2C Developer2Customer的句柄*/
typedef struct _D2C_HANDLE_INTERNAL* D2C_HANDLE;

typedef struct _MASTER_HANDLE_INTERNAL* MASTER_HANDLE;

/*!   碎片代码种子结构（开发者不必关心） */
typedef struct _SNIPPET_CODE_CONTEXT {
    /**  版本号 */
    SS_UINT32       version;    
    /**  代码标识 */
    SS_UINT32       code_id;    
    /** 许可ID */
    SS_UINT32       license_id; 
    /** 秘钥（密文）*/
    SS_BYTE         key[32];    //  密钥
    /** 种子（密文）*/
    SS_BYTE         snippet_seed[SNIPPET_SEED_LENGTH]; 
} SNIPPET_CODE_CONTEXT;

/**
*@defgroup group2_d2c_API SenseShield d2c API 深思许可开发接口
*This is sense d2c API 深思许可开发接口
*@{
*/

#ifdef __cplusplus
extern "C" {
#endif

    /*!
    *   @brief      打开签发设备（开发锁）
    *   @param[out] device_handle       开发锁设备句柄
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    一切的签发功能都离不开开发锁，若不打开开发锁，所有许可签发的操作将不能进行
    *   @see        master_close d2c_lic_new
    */
    SS_UINT32 SSAPI master_open(OUT MASTER_HANDLE* device_handle);

    /*!
    *   @brief      关闭签发设备（开发锁）
    *   @param[in]  device_handle       开发锁设备句柄
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @see        master_open
    */
    SS_UINT32 SSAPI master_close(IN MASTER_HANDLE device_handle);

    /*!
    *   @brief      获取开发锁开发商ID
    *   @param[in]  device_handle   开发锁设备句柄
    *   @param[out] developer_id    开发商ID
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    开发商ID是每个开发者唯一的一个标识号，每个开发者独立，通过获取开发锁的开发商ID，可判断此开发锁是否为本人所有。
    *               最常使用的区别方式是区别Demo开发锁和正式开发锁。
    *   @code
    *       {
    *           MASTER_HANDLE master_handle ;
    *           SS_BYTE developer_id[8] = {0};
    *           SS_UINT32 status = SS_OK;
    *
    *           status = master_open(&master_handle);
    *           if(status != SS_OK)
    *               return status;
    *
    *           status = master_get_developer_id(master_handle, developer_id);
    *           if(status == SS_OK)
    *           {
    *               // todo
    *               // HEXTOSTRING(developer_id);    // 将十六进制转换为字符串
    *           }
    *           master_close(master_handle);
    *       }
    *   @endcode
    */
    SS_UINT32 SSAPI master_get_developer_id(IN MASTER_HANDLE device_handle, OUT SS_BYTE *developer_id);

    /*!
    *   @brief      获取开发商锁内所有的根证书数量
    *   @param[in]  device_handle   开发锁设备句柄
    *   @param[out] count           根证书数量
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    自2018年1月1日起，深思对开发锁和用户锁进行安全升级，开发锁将支持多根证书，新用户锁将使用新的根证书。
    *               为兼容之前版本的用户锁，开发锁中将拥有多个根证书
    */
    SS_UINT32 SSAPI master_get_root_count(IN MASTER_HANDLE device_handle, OUT SS_UINT32 *count);

    /*!
    *   @brief      通过证书类型，获取开发锁CA证书
    *   @param[in]  device_handle       开发锁设备句柄
    *   @param[in]  ca_type             证书类型，详见PKI_CA_TYPE_XXXX
    *   @param[out] ca_cert             存放锁CA证书的缓冲区
    *   @param[in]  cert_bufsize        缓冲区大小
    *   @param[out] cert_size           CA证书大小
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    签发许可需要带上开发商证书链，因此获取开发锁的证书、CA将是不可或缺的接口。
    *   @code
    *       {
    *           SS_UINT32 status = SS_OK;
    *           MASTER_HANDLE  master_handle;
    *               SS_BYTE    ca[2048] = { 0 };   // 证书或者CA的大小一般不会超过1.5k，这里缓冲区使用2k足够大了
    *               SS_UINT32  ca_size = 0;
    *           
    *           master_open(&master_handle);
    *
    *           status = master_get_ca_cert(master_handle, PKI_CA_TYPE_DEVELOPER, ca, sizeof(ca), &ca_size);
    *           if(status == SS_OK)
    *           {
    *               // save ca to file
    *           }
    *           master_close(master_handle);
    *       }
    *   @endcode
    */
    SS_UINT32 SSAPI master_get_ca_cert(IN MASTER_HANDLE device_handle, IN SS_BYTE ca_type,
        OUT SS_BYTE *ca_cert, IN SS_UINT32 cert_bufsize, OUT SS_UINT32 *cert_size);


    /*!
    *   @brief      通过证书类型，获取开发锁CA证书
    *   @param[in]  device_handle       开发锁设备句柄
    *   @param[in]  ca_type             证书类型，详见PKI_CA_TYPE_XXXX
    *   @param[in]  root_index          根证书索引序号
    *   @param[out] ca_cert             存放锁CA证书的缓冲区
    *   @param[in]  cert_bufsize        缓冲区大小
    *   @param[out] cert_size           CA证书大小
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    签发许可需要带上开发商证书链，因此获取开发锁的证书、CA将是不可或缺的接口。
    *   @see        master_get_ca_cert
    */
    SS_UINT32 SSAPI master_get_ca_cert_ex(IN MASTER_HANDLE device_handle, IN SS_BYTE ca_type, IN SS_UINT32 root_index,
        OUT SS_BYTE *ca_cert, IN SS_UINT32 cert_bufsize, OUT SS_UINT32 *cert_size);

    /*!
    *   @brief      获取开发锁RootCA证书
    *   @param[in]  device_handle       设备句柄
    *   @param[out] root_ca             存放开发锁Root CA 证书的缓冲区
    *   @param[in]  root_bufsize        缓冲区大小
    *   @param[out] root_size           开发锁Root CA 证书大小
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @see        master_open master_get_ca_cert
    */
    SS_UINT32 SSAPI master_get_root_ca(IN MASTER_HANDLE device_handle,
        OUT SS_BYTE *root_ca, IN SS_UINT32 root_bufsize, OUT SS_UINT32 *root_size);

    /*!
    *   @brief      获取开发锁设备CA证书
    *   @param[in]  device_handle       设备句柄
    *   @param[out] device_ca           存放设备CA证书的缓冲区
    *   @param[in]  device_bufsize      缓冲区大小
    *   @param[out] device_size         设备CA证书大小
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @see        master_open master_get_ca_cert
    */
    SS_UINT32 SSAPI master_get_device_ca(IN MASTER_HANDLE device_handle,
        OUT SS_BYTE *device_ca, IN SS_UINT32 device_bufsize, OUT SS_UINT32 *device_size);

    /*!
    *   @brief      获取开发锁开发者CA证书
    *   @param[in]  device_handle       设备句柄
    *   @param[out] developer_ca        存放开发者CA证书的缓冲区
    *   @param[in]  ca_bufsize          缓冲区大小
    *   @param[out] ca_size             开发者CA证书大小  
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @see        master_open master_get_ca_cert
    */
    SS_UINT32 SSAPI master_get_developer_ca(IN MASTER_HANDLE device_handle,
        OUT SS_BYTE *developer_ca, IN SS_UINT32 ca_bufsize, OUT SS_UINT32 *ca_size);

    /*!
    *   @brief      获取开发锁开发者证书
    *   @param[in]  device_handle       设备句柄
    *   @param[out] developer_cert      存放开发者证书的缓冲区
    *   @param[in]  cert_bufsize        缓冲区大小
    *   @param[out] cert_size           开发者证书大小
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @see        master_open master_get_ca_cert
    */
    SS_UINT32 SSAPI master_get_developer_cert(IN MASTER_HANDLE device_handle,
        OUT SS_BYTE *developer_cert, IN SS_UINT32 cert_bufsize, OUT SS_UINT32 *cert_size);

    /*!
    *   @brief      根据根证书索引，获取开发锁开发者证书（扩展接口）
    *   @param[in]  device_handle       设备句柄
    *   @param[in]  root_index          根证书索引序号
    *   @param[out] developer_cert      存放开发者证书的缓冲区
    *   @param[in]  cert_bufsize        缓冲区大小
    *   @param[out] cert_size           开发者证书大小
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @see        master_open master_get_ca_cert
    */
    SS_UINT32 SSAPI master_get_developer_cert_ex(IN MASTER_HANDLE device_handle, IN SS_UINT32 root_index,
        OUT SS_BYTE* developer_cert, IN SS_UINT32 cert_bufsize, OUT SS_UINT32* cert_size);
    /*! 
    *   @brief      验证开发锁CA证书
    *   @param[in]  device_handle       设备句柄
    *   @param[in]  store               验证时，是否将证书存储在锁内。TRUE，存储；FALSE，不存储。
    *   @param[in]  ca_type             证书类型，详见PKI_CA_TYPE_XXXX
    *   @param[in]  ca_cert             证书缓冲区
    *   @param[in]  ca_len              证书长度
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @code
    *       {
    *           SS_UINT32 status = SS_OK;
    *           MASTER_HANDLE  master_handle;
    *           SS_BYTE    ca[2048] = { 0 };   // 证书或者CA的大小一般不会超过1.5k，这里缓冲区使用2k足够大了
    *           SS_UINT32  ca_size = 0;
    *
    *           master_open(&master_handle);
    *
    *           // 通过master_get_ca_cert、master_get_developer_ca获取到开发者ca，或者加载外部存储的开发者ca
    *           // ... ... 
    *
    *           status = master_verify_ca(master_handle, FALSE, PKI_CA_TYPE_DEVELOPER, ca, ca_size);
    *           if(status == SS_OK)
    *           {
    *               // save ca to file
    *           }
    *           master_close(master_handle);
    *       }
    *   @endcode
    */
    SS_UINT32 SSAPI master_verify_ca(IN MASTER_HANDLE device_handle, IN SS_BOOL store, 
        IN SS_BYTE ca_type, IN SS_BYTE *ca_cert, IN SS_UINT32 ca_len);

    /*!
    *   @brief      验证开发锁CA证书（扩展接口）
    *   @param[in]  device_handle       设备句柄
    *   @param[in]  store               验证时，是否将证书存储在锁内。TRUE，存储；FALSE，不存储。
    *   @param[in]  ca_type             证书类型，详见PKI_CA_TYPE_XXXX
    *   @param[in]  root_index          根证书序号
    *   @param[in]  ca_cert             证书缓冲区
    *   @param[in]  ca_len              证书长度
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    此接口仅对PKI_CA_TYPE_DEVELOPER CA 验证有效
    *   @endcode
    */
    SS_UINT32 SSAPI master_verify_ca_ex(IN MASTER_HANDLE device_handle, IN SS_BOOL store,
        IN SS_BYTE ca_type, IN SS_UINT32 root_index, IN SS_BYTE *ca_cert, IN SS_UINT32 ca_len);

    /*!
    *   @brief      获取签发设备的种子码密钥（种子码公钥）
    *   @param[in]  device_handle   签发设备的句柄
    *   @param[out] key             缓冲区
    *   @param[in]  max_key_len     缓冲区长度
    *   @param[out] key_len         证书的长度
    *   @return     成功返回SS_OK，失败返回相应的错误码
    */
    SS_UINT32 SSAPI master_get_seedkey(
        IN  MASTER_HANDLE   device_handle,
        OUT SS_BYTE*        key,
        IN  SS_UINT32       max_key_len,
        OUT SS_UINT32*      key_len
        );

    /*!
    *   @brief      获取开发锁设备信息
    *   @param[in]  device_handle   签发设备的句柄
    *   @param[in]  type            获取信息类型，当前只能 = 1
    *   @param[out] info            获取到的信息，json结构
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    info需要调用 master_heap_free 释放
    *   @code
    *     - info 的json结构
    *       {
    *           "support_pin":true, 
    *           "enable_pin":true, 
    *           "developer_id":"0300000000000009",
    *           "lock_firmware_version":"3.1.16", 
    *           "lm_firmware_version":"1.2.1.0",    (PIN码验证通过后获取信息是才有此字段)
    *           "sn":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    *       }
    *   @endcode
    */
    SS_UINT32 SSAPI master_get_info(IN MASTER_HANDLE device_handle, IN SS_BYTE type, OUT char **info);

    /*!
    *   @brief      释放内存
    *   @param[in]  buf             D2C内部分配的内存
    *   @return     永远返回 SS_OK
    */
    SS_UINT32 SSAPI master_heap_free(IN void *buf);

    /*!
    *   @brief      修改开发商开发锁PIN码
    *   @param[in]  device_handle   签发设备的句柄
    *   @param[in]  pin_index       PIN码所在的索引位置，目前只支持 1 个PIN码，当前为0
    *   @param[in]  old_pin         当前使用中的PIN码
    *   @param[in]  old_pin_len     当前使用的PIN码长度
    *   @param[in]  new_pin         新PIN码
    *   @param[in]  new_pin_len     新PIN码长度
    *   @param[in]  hash            新PIN码的sha256 hash结果，用于内部校验
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    PIN码遵循以下格式：
    *               - 长度不得低于8个字符，不得大于255个字符
    *               - 不得使用汉字，全角字符等
    *               - 不得出现二级制0等会影响真实长度的字符
    *               - 初始PIN码必须修改，否则初始PIN码无法通过验证，初始PIN码从深思开发者中心获取（https://developer.senseyun.com）
    */
    SS_UINT32 SSAPI master_pin_change(
        IN MASTER_HANDLE    device_handle,
        IN SS_BYTE          pin_index,
        IN SS_BYTE          *old_pin,
        IN SS_UINT32        old_pin_len,
        IN SS_BYTE          *new_pin,
        IN SS_UINT32        new_pin_len,
        IN SS_BYTE          *hash
        );

    /*!
    *   @brief      验证开发锁PIN码
    *   @param[in]  device_handle   签发设备的句柄
    *   @param[in]  pin_index       PIN码所在的索引位置，目前只支持 1 个PIN码，当前为0
    *   @param[in]  pin             当前使用中的PIN码
    *   @param[in]  pin_len         当前使用的PIN码长度
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    PIN验证遵循以下规则：
    *               - 初始PIN码不能通过验证
    *               - 必须通过PIN码验证才能签发升级包
    */
    SS_UINT32 SSAPI master_pin_verify(
        IN MASTER_HANDLE    device_handle,
        IN SS_BYTE          pin_index,
        IN SS_BYTE          *pin,
        IN SS_UINT32        pin_len
        );

    /*!
    *   @brief      确认PIN码是否验证通过
    *   @param[in]  device_handle   签发设备的句柄
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    如果返回 SS_ERROR_MASTER_OUTDATED_VERSION ，表示控制锁版本太低，必须更换控制锁；
    *               如果返回0x0100000D，标明没有进行PIN吗验证。
    */
    SS_UINT32 SSAPI master_pin_is_verified(MASTER_HANDLE device_handle);

    /*!
    *   @brief      启用开发锁PIN码
    *   @param[in]  device_handle   签发设备的句柄
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    启用开发锁 PIN 功能
    */
    SS_UINT32 SSAPI master_pin_enable(MASTER_HANDLE device_handle);

    /*!
    *   @brief      禁用开发锁PIN码
    *   @param[in]  device_handle   签发设备的句柄
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    禁用当前开发锁的PIN 功能，需先调用 master_pin_verify
    */
    SS_UINT32 SSAPI master_pin_disable(MASTER_HANDLE device_handle);

    /*!
    *   @brief      清除PIN权限
    *   @param[in]  device_handle   签发设备的句柄
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    清除当前PIN权限后，下次签发许可时，需要重新调用 master_pin_verify
    */
    SS_UINT32 SSAPI master_pin_deauth(MASTER_HANDLE device_handle);


    /*!
    *   @brief      创建D2C句柄，用于签发许可
    *   @param[in]  device_handle   签发设备的句柄
    *   @param[out] d2c_handle      返回D2C的句柄
    *   @param[in]  account_type    账号类型 @see ACCOUNT_TYPE
    *   @param[in]  account_id      账户名（字符串）或锁号（16字节锁号）
    *   @param[in]  account_size    账户名长度
    *   @param[in]  cert            证书，如果是account type为ACCOUNT_TYPE_NONE，填入硬件锁设备证书链，账户许可填入云开发者证书链
    *   @param[in]  cert_size       证书长度
    *   @return     成功返回SS_OK，失败返回相应的错误码，SS_ERROR_PARSE_CERT 表示解析设备证书失败。
    *   @remarks    创建D2C句柄，生成D2C包的初始化工作。
    *   @see        d2c_delete d2c_add_developer_cert d2c_add_pkg d2c_get
    */
    SS_UINT32 SSAPI d2c_lic_new(
        IN  MASTER_HANDLE   device_handle,
        OUT D2C_HANDLE*     d2c_handle,
        IN  ACCOUNT_TYPE    account_type,
        IN  SS_BYTE*        account_id,
        IN  SS_UINT32       account_size,
        IN  SS_BYTE*        cert,
        IN  SS_UINT32       cert_size
        );

    /*!
    *   @brief      创建D2C句柄，用于签发非许可类型升级包，例如签发文件
    *   @param[in]  device_handle   签发设备的句柄
    *   @param[out] d2c_handle      返回D2C的句柄
    *   @param[in]  sign_type       签包类型，参考 SIGN_TYPE_XXX
    *   @param[in]  param           如果是设备证书，则传入设备证书链，种子码签发填入深思根证书
    *   @param[in]  param_size      证书链的大小或种签子码签发填深思根证书大小
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    自2018年1月1日起，深思对开发锁和用户锁进行安全升级，开发锁将支持多根证书，新用户锁将使用新的根证书，
    *               为保证新旧版本用户锁在签发文件操作上的兼容性，原来的 d2c_file_seed_new 将废弃，变更为当前的d2c_file_new。
    *               主要变更有
    *                   - 在使用种子码签发文件时，param 参数由原来的传空，变成传入深思根证书。
    *
    *               深思根证书可以通过 master_get_ca_cert_ex、master_get_root_count 获取。
    *               最为正确的证书获取方法是做法是：
    *                   - 开发商从固件版本号 3.1.20 以下版本的用户锁中，获取到深思旧版本根证书传值；
    *                   - 开发商从固件版本号 3.1.20 以上（含 3.1.20 ）版本的用户锁中，获取深思新版本根证书传值；
    *                   - 开发商从深思生产提供的 设备证书链中获取对应根证书。
    *
    *               由于根证书都是一样的，只是新用户锁使用新版本根证书，因此两种证书只需要取一次保存即可。
    */
    SS_UINT32 SSAPI d2c_file_new(
        IN  MASTER_HANDLE   device_handle,
        OUT D2C_HANDLE*     d2c_handle,
        IN  SIGN_TYPE       sign_type,
        IN  SS_BYTE*        param,
        IN  SS_UINT32       param_size
        );

    /*!
    *   @brief      增加开发者证书链（不需要再使用了）
    *   @param[in]  d2c_handle      D2C句柄
    *   @param[in]  cert            开发者证书链
    *   @param[in]  cert_len        证书大小
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    D2C在生成时将自动添加开发商证书链到D2C包中，不必再调用此接口传入证书链。
    */
    SS_UINT32 SSAPI d2c_add_developer_cert(D2C_HANDLE d2c_handle, SS_BYTE* cert, SS_UINT32 cert_len);

    /*!
    *   @brief      签发动态代码
    *   @param[in]  device_handle   设备句柄
    *   @param[in]  sign_type       签发类型：(D2C_TYPE_XXX)
    *   @param[in]  param           设备证书 (种子码签发方式填NULL)
    *   @param[in]  param_size      证书长度 (种子码签发方式填0）
    *   @param[in]  exec_code       动态代码 
    *   @param[in]  code_size       代码大小（最大支持2048字节大小的动态代码）
    *   @param[in]  bound_info      绑定信息（许可ID数组，许可ID为4个字节）
    *   @param[in]  bound_size      绑定信息的长度（字节）
    *   @param[out] pkg             存放升级包的用户缓冲区
    *   @param[in]  max_pkg_len     缓冲区的长度
    *   @param[out] pkg_len         签得的代码长
    *   @return     成功返回SS_OK，失败返回相应的错误码
    */
    SS_UINT32 SSAPI gen_dynamic_code(
        IN  MASTER_HANDLE   device_handle,
        IN  SIGN_TYPE       sign_type,
        IN  SS_BYTE*        param,
        IN  SS_UINT32       param_size,
        IN  SS_BYTE*        exec_code,
        IN  SS_UINT32       code_size,
        IN  SS_UINT32*      bound_info,
        IN  SS_UINT32       bound_size,
        OUT SS_BYTE*        pkg,
        IN  SS_UINT32       max_pkg_len,
        OUT SS_UINT32*      pkg_len
        );

    /*!
    *   @brief      根据描述，生成升级包，并添加升级包到D2C，针对非许可项内容的升级
    *   @param[in]  h_d2c D2C句柄（由d2c_lic_new函数得到）
    *   @param[in]  param 升级包json串
    *   @param[in]  opr_desc 包描述字符串
    *   @exception  没有异常
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks
    *   - 升级规则：
    *       -#  更新文件时，执行文件的offset必须为0
    *       -#  种子码方式，不能签发许可
    *   - 重置锁注意事项：
    *       -#  加密锁升级时必须保持与签包服务器时间相同，否则会出现重置锁失败的情况。
    *       -#  锁时间戳小于重置锁限定开始时间，调整计算机本地时间与服务器相同后升级数据包。
    *       -#  锁时间戳大于重置锁限定结束时间，重新签发重置锁升级包。
    *   @code
    *       JSON 参数说明：
    *       文件操作：
    *       {
    *           "op":           "addfile" | "updatefile" | "delfile"    文件操作类型，依次为：添加 | 更新 |删除 
    *           "filename":     "file_name.xxx",                        文件名，长度需小于16字节
    *           "filetype":     "evx" | "evd" | "key"                   文件类型，依次为：可执行文件 | 数据文件 | 密钥文件。 （删除文件时不需要填写类型）
    *           "access":       number                                  文件的访问权限（添加，更新，删除文件时都可以设置，默认为0x0F（开发者所有权限，Entry不可访问），参考ACCESS_XXX_XXX宏
    *           "timestamp":    number(0 ~ 0xFFFFFFFF)                  文件的生成时间（用于抗重放），如果JSON中没有此项，则使用当前时间生成一个时间戳
    *           "filebuffer":   "0123456789ABCDEF"                      文件内容HEX16字符串（删除文件时不需要填写此项）
    *           "fileoffset":   number  (可选)                          文件偏移，默认为0（删除文件时不需要）
    *           "bind_lic":     [1,2,3,4]                               可执行文件绑定的许可，仅文件类型为evx(可执行程序)时有效
    *       }
    *
    *       重置锁：
    *       {
    *           "op":           "reset"             操作类型：重置锁
    *           "not_before":   UTC时间（有效开始时间）
    *           "not_after":    UTC时间（有效终止时间），升级包在起止时间范围内（包含起止的那一秒）可重复使用。
    *       }
    *
    *       修订时钟：
    *       {
    *           "op" :          "fixtime",                  操作类型：修复时钟
    *           "lock_time":      number,					用户锁的时间
    *           "rand":         "0102030405060708"          8个字节HEX16字符串
    *           "diff":          number,                    时间差(pc_time - lock_time)
    *       }
    *
    *   @endcode
    *   @see d2c_lic_new d2c_add_developer_cert
    *
    */
    SS_UINT32 SSAPI d2c_add_pkg(
        IN  D2C_HANDLE          h_d2c,
        IN  SS_CHAR*            param,
        IN  SS_CHAR*            opr_desc
        );

    /*!
    *   @brief      根据描述，生成升级包，并添加升级包到D2C，针对许可项内容的升级
    *   @param[in]  h_d2c    D2C句柄（由d2c_lic_new函数得到）
    *   @param[in]  param    升级包json串
    *   @param[in]  opr_desc 包操作描述字符串，开发者自定义
    *   @param[out] guid     许可GUID
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks
    *   - 升级规则：
    *       -#  更新文件时，执行文件的offset必须为0
    *       -#  种子码方式，不能签发许可
    *   - JSON 参数说明：
    *   @code
    *       参数名称            参数类型    必选字段      参数值                  参数描述
    *       "op"                string     是           "installlic"            安装许可
    *                                                   "addlic"                添加许可
    *                                                   "activelic"             激活许可
    *                                                   "updatelic"             更新许可
    *                                                   "dellic"                删除许可
    *                                                   "lockalllic"            锁定所有许可（0号许可专用）
    *                                                   "unlockalllic"          解锁所有许可（0号许可专用）
    *                                                   "delalllic"             删除所有许可（0号许可专用）
    *       "version"           string     否            "op number"            许可版本号（数字，范围从 1 ~ 0xFFFFFFFF）   op: '+' | '-' | '='    eg. "=123"    
    *       "license_id"        number     是(视op)      --                     许可ID（数字，范围从 1 ~ 0xFFFFFFFF）（lockalllic, delalllic, unlockalllic不需要）
    *       "force"             bool       否            true/false             是否强制升级，若为true，则升级的策略为：
    *                                                                           [addlic]无则添加，有则覆盖
    *                                                                           [dellic]有则删除，无则成功
    *       "start_time"        string     否            "op number"            起始时间(UTC秒)                           op: '+' | '-' | '='    eg. "=123456"   
    *       "end_time"          string     否            "op number"            终止时间，不设置标明是永久许可(UTC秒)       op: '+' | '-' | '='    eg. "+456789"
    *       "counter"           string     否            "op number"            使用次数                                  op : '+' | '-' | '='   eg. "-123"
    *       "span"   	        string     否            "op number"            时间跨度(UTC秒)                           op : '+' | '-' | '='   eg. "=987654"
    *       "concurrent"        string     否            "op number"            最大并发数(0~65535)                       op : '+' | '-' | '='   eg. "=654"
    *       "concurrent_type"   string     否            "process"              以进程限制并发 
    *                                                    "win_user_session",    以 Windows 会话限制并发数    
    *       "module":           json_array 否            [1,2,3,4,5,...,64]     模块区，json整数数组结构，数组里可以表示模块，范围从1到64  
    *       "timestamp":        number     否            --                     许可的签发时间戳，用于防重放，如果JSON中没有此项，则使用当前时间生成一个时间戳
    *       "serial":           number     否            --                     许可的签发流水号，用于防重放，如果JSON中没有此项，则与时间戳配合，生成一个流水号
    *       "rom":              json       否            --                     只读数据区 
    *                                                    {
    *                                                        "data":"HEX字符串",     数据区内容
    *                                                        "offset":number,        写入数据区的偏移，默认为0
    *                                                        "resize":number         如果存在此字段，表示重置数据区大小，值即为新的大小
    *                                                    }           
    *       "raw":              json       否            {"data":"HEX字符串", "offset":number,"resize":number}           读写数据区，内容参考只读取描述
    *       "pub":              json       否            {"data":"HEX字符串", "offset":number,"resize":number}           公开数据区，内容参考只读取描述
    *
    *       注： 除"lockalllic", "unlockalllic", "delalllic"外，其它操作均需要设置"license_id"字段
    *   @endcode
    *   @see d2c_lic_new d2c_add_developer_cert
    *
    */
    SS_UINT32 SSAPI d2c_add_lic(
        IN  D2C_HANDLE          h_d2c,
        IN  SS_CHAR*            param,
        IN  SS_CHAR*            opr_desc,
        OUT SS_CHAR             guid[D2C_GUID_LENGTH]
        );
    
    /*!
    *   @brief      从D2C句柄中获取D2C流，可保存为 .d2c 文件用于升级
    *   @param[in]  h_d2c       D2C句柄（由d2c_lic_new函数得到）
    *   @param[out] d2c_buf     得到的D2C数据流，该数据流为字符串格式
    *                           如果为0，则out_len返回需要的长度
    *   @param[in]  max_buf_len d2c_buf的缓冲区大小
    *   @param[out] out_len     得到的D2C数据流长度
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    通过此接口获取到最终的D2C包内容，可直接将数据写入锁内，也可保存为.d2c文件，异步写入锁内。
    *   @code
    *       {
    *           ["pkg_type":"type", "pkg_data":"base64", "pkg_desc":"desc"]
    *           ["pkg_type":"type", "pkg_data":"base64", "pkg_desc":"desc"]
    *       }
    *   @endcode
    *   @see d2c_lic_new d2c_add_developer_cert
    */
    SS_UINT32 SSAPI d2c_get(
        IN  D2C_HANDLE      h_d2c,
        OUT SS_CHAR*        d2c_buf,
        IN  SS_UINT32       max_buf_len,
        OUT SS_UINT32*      out_len
        );

    /*!
    *  @brief       获得开发者自定义的D2C操作描述，opr_desc
    *  @param[in]   h_d2c   D2C句柄（由d2c_lic_new函数得到）
    *  @param[in]   index   pkg的索引，从1开始
    *  @return      字符串，返回值不需要释放，否则会出错
    */
    const SS_CHAR* d2c_get_pkg_desc(
        IN  D2C_HANDLE      h_d2c,
        IN  SS_UINT32       index
        );

    /*!
    *  @brief       删除D2C句柄
    *  @param[in]   h_d2c 删除D2C句柄
    *  @return      总是返回SS_OK
    *  @see         d2c_lic_new
    */
    SS_UINT32 SSAPI d2c_delete(
        IN  D2C_HANDLE      h_d2c
        );

    /*!
    *   @brief      D2C签名（开发者不必关心）
    *   @param[in]  master_handle   开发锁句柄
    *   @param[in]  hash_algo       哈希算法类型，参考D2C_HASH_ALGO
    *   @param[in]  root_index          根证书序号
    *   @param[in]  data_in         要签名的数据
    *   @param[in]  data_len        要签名数据的长度
    *   @param[out] sign            签名后的数据
    *   @param[in]  max_sign_len    签名缓冲区长度，至少为 256 + 64 字节
    *   @param[out] sign_len        签名数据长度
    *   @return     成功返回SS_OK，失败返回相应的错误码
    *   @remarks    sign 包含 256字节的开发锁签名结果，和 64字节的开发商信息结果。前256字节为签名，后64字节为开发商信息。
    */
    SS_UINT32 SSAPI d2c_sign(IN MASTER_HANDLE master_handle, D2C_HASH_ALGO hash_algo, IN SS_UINT32 root_index, IN SS_BYTE* data_in, IN SS_UINT32 data_len,
        OUT SS_BYTE* sign, IN SS_UINT32 max_sign_len, OUT SS_UINT32* sign_len);

    /*!
    *   @brief      D2C加密（开发者不必关心）
    *   @param[in]  certs           证书链
    *   @param[in]  certs_len       链书链长度
    *   @param[in]  plain           明文
    *   @param[in]  plain_len       明文长度
    *   @param[out] cipher          密文
    *   @param[in]  max_cipher_len  缓冲区大小
    *   @param[out] cipher_len      密文长度
    *   @return     成功返回SS_OK，失败返回相应的错误码
    */
    SS_UINT32 SSAPI d2c_encrypt(IN SS_BYTE* certs, IN SS_UINT32 certs_len, IN const SS_BYTE* plain, IN SS_UINT32 plain_len,
        OUT SS_BYTE* cipher, IN SS_UINT32 max_cipher_len, OUT SS_UINT32* cipher_len);

    /*!
    *   @brief      获取碎片代码种子（开发者不必关心）
    *   @param[in]  master          开发锁句柄
    *   @param[in]  license_id      许可ID
    *   @param[out] snippet_seed    碎片代码种子（32字节）
    *   @return     成功返回SS_OK，失败返回相应的错误码
    */
    SS_UINT32 SSAPI get_snippet_seed(IN MASTER_HANDLE master, IN SS_UINT32 license_id, OUT SS_BYTE snippet_seed[SNIPPET_SEED_LENGTH]);

    /*!
    *   @brief      生成碎片代码（开发者不必关心）
    *   @param[in]  master              开发锁句柄
    *   @param[in]  license_id          绑定的许可ID
    *   @param[in]  evx_code            执行的原始文件
    *   @param[in]  evx_size            执行文件的大小
    *   @param[out] snippet_code        存放生成的碎片代码的缓冲区
    *   @param[in]  snippet_buf_size    缓冲区 snippet_code 的大小
    *   @param[out] snippet_size        生成的碎片代码的大小
    *   @return     成功返回SS_OK，失败返回相应的错误码
    */
    SS_UINT32 SSAPI gen_snippet_code(IN MASTER_HANDLE master, IN SS_UINT32 license_id, IN const SS_BYTE* evx_code, IN SS_UINT32 evx_size,
        OUT SS_BYTE* snippet_code, IN SS_UINT32 snippet_buf_size, OUT SS_UINT32* snippet_size);
    
    /*!
    *   @brief      获取生成碎片代码请求（开发者不必关心）
    *   @param[in]  sc_ctx          碎片代码上下文
    *   @param[in]  evx             执行代码原文
    *   @param[in]  evx_size        执行代码原文大小
    *   @param[out] snippet_code    碎片代码缓冲区
    *   @param[in]  snippet_bufsize 碎片代码缓冲区大小
    *   @param[out] snippet_size   碎片代码大小
    *   @return     成功返回SS_OK，失败返回相应的错误码
    */
    SS_UINT32 SSAPI gen_snippet_code_with_key(IN const SNIPPET_CODE_CONTEXT* sc_ctx, IN const SS_BYTE* evx, IN SS_UINT32 evx_size,
        OUT SS_BYTE* snippet_code, IN SS_UINT32 snippet_bufsize, OUT SS_UINT32* snippet_size);

    /*!
    *   @brief      使用开发锁进行许可加密（开发者不必关心）
    *   @param[in]  master      开发锁句柄
    *   @param[in]  license_id  许可ID
    *   @param[in]  plain       明文
    *   @param[in]  len         加密长度（必须是16的倍数）
    *   @param[out] cipher      密文
    *   @return     成功返回SS_OK，失败则返回相应的错误码
    */
    SS_UINT32 SSAPI license_encrypt(IN MASTER_HANDLE master, IN SS_UINT32 license_id, IN const SS_BYTE* plain, IN SS_UINT32 len, OUT SS_BYTE* cipher);

#ifdef __cplusplus
}
#endif

/* *@} */

#endif  //  _D2C_H
