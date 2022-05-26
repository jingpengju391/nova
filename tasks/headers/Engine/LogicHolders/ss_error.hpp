/*! 
*  @file ss_error.h
*  @brief     SS对外声明错误码,32位,用来统一错误码格式，最高一字节是模块标识。
*  @details   包括SS、LM、H5、IPC、NetAgent、SSprotect等错误值，其中最高第一字节是错误模块标识，其它由模块自定义
*             
*  @version   2.1.0
*  @date      2013-2015
*  @pre       提前声明所有错误值
*/
#ifndef __SS_ERROR_H__
#define __SS_ERROR_H__


//============================================================
//                  模块号
//============================================================

#define MODE_H5_RUNTIME             0x01    //  H5 API库错误码
#define MODE_IPC                    0x02    //  IPC 模块错误
#define MODE_SYSTEM                 0x04    //  系统错误
#define MODE_SS                     0x05    //  SS 模块
#define MODE_NETAGENT               0x11    //  NetAgent模块
#define MODE_SSPROTECT              0x12    //  SSPROTECT 模块错误
#define MODE_LM_API                 0x13    //  LM 模块(runtime, develop, control)
#define MODE_LM_FIRM                0x22    //  LM 固件模块
#define MODE_LM_SES                 0x23    //  LM SES库错误
#define MODE_LM_SERVICE             0x24    //  LM SERVICE模块
#define MODE_LIC_TRANS              0x28    //  许可转移模块
#define MODE_AUTH_SERVER            0x29    //  Auth Server模块
#define MODE_CLOUD                  0x30    //  云锁模块
#define MODE_SO                     0x51    //  软锁模块
#define MODE_UM						0x60	//	用户管理模块

//============================================================
//              一般错误码
//============================================================

#define SS_OK                                       0x00000000  //  成功
#define SS_ERROR                                    0x00000001  //  错误，原因未知 */ // TODO(zhaock) : 应该去
#define SS_ERROR_INVALID_PARAM                      0x00000002  //  不合法的参数
#define SS_ERROR_MEMORY_FAIELD                      0x00000003  //  内存错误
#define SS_ERROR_INSUFFICIENT_BUFFER                0x00000004  //  缓冲区大小不足
#define SS_ERROR_NOT_FOUND                          0x00000005  //  没找到目标
#define SS_ERROR_EXISTED                            0x00000006  //  目标已存在
#define SS_ERROR_DATA_BROKEN                        0x00000007  //  数据损坏
#define SS_ERROR_INVALID_HANDLE                     0x00000008  //  无效的句柄
#define SS_ERROR_TIMEOUT                            0x00000009  //  操作超时
#define SS_ERROR_TARGET_NOT_IN_USE                  0x0000000A  //  目标未在使用状态，如目标模块未开启或已关闭
#define SS_ERROR_DATA_CONFLICT                      0X0000000B  //  不相容的数据同时存在
#define SS_ERROR_INVALID_TYPE                       0x0000000C  //  无效类型
#define SS_ERROR_INVALID_LENGTH                     0x0000000D  //  无效长度
#define SS_ERROR_USER_MOD_CRASH                     0x0000000E  //  用户模块冲突
#define SS_ERROR_SERVER_IS_LOCAL                    0x0000000F  //  查找的SS是本地
#define SS_ERROR_UNSUPPORT                          0x00000010  //  不支持的操作
#define SS_ERROR_PORT_IN_USE                        0x00000011  //  端口占用
#define SS_ERROR_NO_KEY                             0x00000013  //  没有密钥
#define SS_ERROR_SERVICE_TYPE_NOT_SUPPORT           0x00000014  //  服务类型不支持操作
#define SS_ERROR_MULTICAST_ADDR_IN_USE              0x00000015  //  多播地址占用
#define SS_ERROR_MULTICAST_PORT_IN_USE              0x00000016  //  多播端口占用
#define SS_ERROR_MOD_FAIL_LIBSTRING                 0x00000020  //  libstring错误
#define SS_ERROR_NET_ERROR                          0x00000040  //  网络错误
#define SS_ERROR_IPC_ERROR                          0x00000041  //  IPC 错误
#define SS_ERROR_INVALID_SESSION                    0x00000042  //  会话失效
#define SS_ERROR_GTR_MAX_SERVER_COUNT               0x00000043  //  超过支持服务数上限
#define SS_ERROR_MASTER_UNSUPPORT_PIN               0x00000044  //  开发锁不支持PIN码功能，请立即向深思申请更换新开发锁
#define SS_ERROR_MASTER_PIN_NOT_ACTIVE              0x00000045  //  开发锁PIN码没有激活，请修改初始PIN码
#define SS_ERROR_MASTER_NO_SUCH_PIN                 0x00000046  //  PIN码不存在，请检查PIN码索引是否错误
#define SS_ERROR_MASTER_OUTDATED_VERSION            0x00000047  //  开发锁版本太低，必须更换开发锁
#define SS_ERROR_MASTER_PIN_WRONG                   0x00000048  //  开发锁PIN码错误
#define SS_ERROR_MASTER_PIN_BLOCKED                 0x00000049  //  开发锁PIN码被锁定
#define SS_ERROR_NET_TIMEOUT                        0x0000004A  //  网络错误


//============================================================
//              SS 模块 (0x05)
//============================================================

#define SS_ERROR_MOD_INIT_FAIL                      0x05000000  //  模块初始化失败
#define SS_ERROR_BOUND_EXCEEDED                     0x05000001  //  索引越界
#define SS_ERROR_REACH_LIMIT                        0x05000002  //  达到人为限制
#define SS_ERROR_IGNORE                             0x05000003  //  主动忽略
#define SS_ERROR_SERVER_NOT_FOUND                   0x05000004  //  找不到服务器
#define SS_ERROR_NO_LOCK                            0x05000005  //  找不到锁
#define SS_ERROR_SLM_HANDLE_IS_FULL                 0x05000006  //  LM 句柄已达到上限
#define SS_ERROR_REG_NOT_FOUND                      0x05000007  //  注册表项未找到
#define SS_ERROR_REG_ACCESS_DENIED                  0x05000008  //  注册表无访问权限
#define SS_ERROR_REG_INVALID_VALUE                  0x05000009  //  注册表无效值
#define SS_ERROR_FORMAT_NOT_SUPPORTED               0x0500000A  //  不支持的格式
#define SS_ERROR_CONFIG_FILE_NOT_FOUND              0x0500000B  //  未找到配置文件
#define SS_ERROR_CONFIG_PARSE_ERROR                 0x0500000C  //  配置文件解析错误
#define SS_ERROR_SYSTEM_ERROR                       0x0500000D  //  系统操作失败
#define SS_ERROR_CREATE_THREAD_ERROR                0x0500000E  //  创建线程失败
#define SS_ERROR_SSRP_DATA_BROKEN                   0x0500000F  //  SS消息数据损坏
#define SS_ERROR_SSRP_WRONG_VERSION                 0x05000010  //  SS消息版本不支持
#define SS_ERROR_SSRP_INVALID_TYPE                  0x05000012  //  SS消息数据类型不支持
#define SS_ERROR_WHITELISTED                        0x05000013  //  白名单触发
#define SS_ERROR_BLACKLISTED                        0x05000014  //  黑名单触发
#define SS_ERROR_FILE_ACCESS_DENIED                 0x05000015  //  无法访问文件
#define SS_ERROR_DEVICE_NOT_FOUND                   0x05000016  //  没有发现设备
#define SS_ERROR_DEVICE_FAIL_TO_OPEN                0x05000017  //  打开设备失败
#define SS_ERROR_MSG_BAD_PACKAGE                    0x05000018  //  SS消息包错误
#define SS_ERROR_MSG_INVALID_TYPE                   0x05000019  //  SS消息包类型无效
//#define SS_ERROR_SERVICE_INSTALL_ERROR              0x0500001A  //  服务安装错误
//#define SS_ERROR_SERVICE_UNINSTALL_ERROR            0x0500001B  //  服务卸载错误
//#define SS_ERROR_SERVICE_START_ERROR                0x0500001C  //  服务启动错误
//#define SS_ERROR_SERVICE_STOP_ERROR                 0x0500001D  //  服务停止错误
//#define SS_ERROR_SERVICE_QUERY_ERROR                0x0500001E  //  服务查询错误
#define SS_ERROR_LOCK_NOT_FOUND                     0x0500001F  //  锁没有找到
#define SS_ERROR_NO_SESSION_KEY_ERROR               0x05000020  //  没有会话密钥
#define SS_ERROR_ENCRYPT_ERROR                      0x05000021  //  加密错误
#define SS_ERROR_DECRYPT_ERROR                      0x05000022  //  解密错误
#define SS_ERROR_DEVELOPER_NOT_FOUND                0x05000023  //  未找到开发商
#define SS_ERROR_NET_PORT_BIND_ERROR                0X05000030  //  端口被占用
#define SS_ERROR_BROADCAST_INIT_ERROR               0X05000031  //  广播模块初始化错误
#define SS_ERROR_BROADCAST_JOB_ERROR                0X05000030  //  广播模块操作失败
#define SS_ERROR_TASK_PENDING                       0x05000041  //  任务正在执行
#define SS_ERROR_TASK_FAIL                          0x05000042  //  任务执行失败
#define SS_ERROR_TASK_CANCELLING                    0x05000043  //  任务正在取消
#define SS_ERROR_TASK_CANCELLED                     0x05000044  //  任务已取消
#define SS_ERROR_CLOUD_AUTH                         0x05000045  //  认证云锁失败
#define SS_ERROR_HTTP_RESPONSE                      0x05000046  //  Http响应错误

//============================================================
//          LM 模块(0x20): (runtime, control, develop)
//============================================================

#define SS_ERROR_D2C_NO_PACKAGE                     0x13000000  //  D2C包中无签发内容
#define SS_ERROR_DEVELOPER_CERT_ALREADY_EXIST       0x13000001  //  开发商证书已存在
#define SS_ERROR_PARSE_CERT                         0x13000003  //  解析证书错误
#define SS_ERROR_D2C_PACKAGE_TOO_LARGE              0x13000004  //  D2C包过大
#define SS_ERROR_RESPONSE                           0x13000005  //  错误的数据响应
#define SS_ERROR_SEND_LM_REMOTE_REQUEST             0x13000006  //  发送LM远程请求失败
#define SS_ERROR_RUNTIME_NOT_INITIALIZE             0x13000007  //  未调用Runtime初始化函数
#define SS_ERROR_BAD_CONNECT                        0x13000008  //  获取连接失败
#define SS_ERROR_RUNTIME_VERSION                    0x13000009  //  Runtime库 版本不匹配
#define SS_ERROR_LIC_NOT_FOUND                      0x13000020  //  许可未找到
#define SS_ERROR_AUTH_ACCEPT_FAILED                 0x13000021  //  认证错误
#define SS_ERROR_AUTH_HANDLE_FAILED                 0x13000022  //  认证失败
#define SS_ERROR_DECODE_BUFFER                      0x13000023  //  解密错误
#define SS_ERROR_USER_DATA_TOO_SMALL                0x13000024  //  用户数据区太小
#define SS_ERROR_INVALID_LM_REQUEST                 0x13000025  //  无效的LM请求
#define SS_ERROR_INVALID_SHORTCODE                  0x13000026  //  无效的短码
#define SS_ERROR_INVALID_D2C_PACKAGE                0x13000027  //  错误的D2C升级包
#define SS_ERROR_CLOUD_RESPONSE                     0x13000028  //  云锁返回的数据错误
#define SS_ERROR_USER_DATA_TOO_LARGE                0x13000029  //  读写的数据过大
#define SS_ERROR_INVALID_MEMORY_ID                  0x1300002A  //  无效的内存ID
#define SS_ERROR_INVALID_MEMORY_OFFSET              0x1300002B  //  无效的内存偏移
#define SS_ERROR_INVALID_CLOUD_SERVER               0x1300002C  //  无效的云锁服务器
#define SS_ERROR_UNCALIBRATED_TIMESTAMP             0x1300002D  //  时间戳未校准
#define SS_ERROR_GENERATE_GUID                      0x1300002F  //  生成GUID错误
#define SS_ERROR_NO_LOGGED_USER                     0x13000030  //  没有登录的用户
#define SS_ERROR_USER_AUTH_SERVER_NOT_RUNNING       0x13000031  //  用户认证服务未启动
#define SS_ERROR_UNSUPPORTED_SNIPPET_CODE           0x13000033  //  不支持的代码片
#define SS_ERROR_INVALID_SNIPPET_CODE               0x13000034  //  无效的代码
#define SS_ERROR_EXECUTE_SNIPPET_CODE               0x13000035  //  执行碎片代码失败
#define SS_ERROR_SNIPPET_EXECUTE_LOGIN              0x13000036  //  碎片执行登录失败
#define SS_ERROR_LICENSE_MODULE_NOT_EXISTS          0x13000037  //  许可模块不存在
#define SS_ERROR_DEVELOPER_PASSWORD                 0x13000038  //  错误的开发商密码
#define SS_ERROR_CALLBACK_VERSION                   0x13000039  //  错误的初始化回调版本号
#define SS_ERROR_INFO_RELOGIN                       0x1300003A  //  用户需重新登录
#define SS_ERROR_LICENSE_VERIFY                     0x1300003B  //  许可数据验签失败
#define SS_ERROR_REFRESH_TOKEN_TIMEOUT              0x1300003C  //  重新刷新token超时
#define SS_ERROR_TOKEN_VERIFY_FAIL                  0x1300003D  //  token验证失败
#define SS_ERROR_GET_TOKEN_FAIL                     0x1300003E  //  token获取失败
#define SS_ERROR_NEED_WAIT                          0x13000044  //  内部错误
#define SS_ERROR_LICENSE_NEED_TO_ACTIVATE           0x13000051  //  软锁许可需要联网激活
#define SS_ERROR_DATA_NOT_END                       0x13000052  //  内部错误，数据未传输完毕

//============================================================
//              IPC 模块 (0x02)
//============================================================

#define SS_ERROR_BAD_ADDR                           0x02000000  //  错误的地址
#define SS_ERROR_BAD_NAME                           0x02000001  //  错误的名称
#define SS_ERROR_IPC_FAILED                         0x02000002  //  IPC 收发错误
#define SS_ERROR_IPC_CONNECT_FAILED                 0x02000003  //  连接失败，可能是 Virbox 许可服务未启动
#define SS_ERROR_IPC_AUTH_INITIALIZE                0x02000004  //  Auth失败
#define SS_ERROR_IPC_QUERY_STATE                    0x02000005  //  查询Virbox许可服务状态失败
#define SS_ERROR_SERVICE_NOT_RUNNING                0x02000006  //  Virbox许可服务未启动
#define SS_ERROR_IPC_DISCONNECT_FAILED              0x02000007  //  断开连接失败
#define SS_ERROR_IPC_BUILD_SESSION_KEY              0x02000008  //  会话密钥协商失败
#define SS_ERROR_REQUEST_OUTPUT_BUFFER_TOO_LARGE    0x02000009  //  请求的最大缓冲区过大
#define SS_ERROR_IPC_AUTH_ENCODE                    0x0200000A  //  Auth encode错误
#define SS_ERROR_IPC_AUTH_DECODE                    0x0200000B  //  Auth decode错误
#define SS_ERROR_IPC_INIT_FAILED                    0x0200000C  //  IPC 初始化失败
#define SS_ERROR_IPC_EXCHANGE_CERT                  0x0200000D  //  交换证书失败，一般认为证书升级兼容性错误

//============================================================
//              Net Agent 模块 (0x11)
//============================================================




//============================================================
//              安全模块 (0x12)
//============================================================

#define SS_ERROR_INIT_ANTIDEBUG                     0x12000005
#define SS_ERROR_DEBUG_FOUNDED                      0x12000006



//============================================================
//              LM Service (0x24)
//============================================================

#define ERROR_LM_SVC_UNINTIALIZED                   0x24000001  //  未初始化 service中的表项
#define ERROR_LM_SVC_INITIALIZING                   0x24000002  //  正在初始化service表
#define ERROR_LM_SVC_INVALID_SESSION_INFO_SIZE      0x24000003  //  传入session 大小不正确
#define ERROR_LM_SVC_KEEP_ALIVE_FAILED              0x24000004  //  未知的keep alive 操作失败原因 
#define ERROR_LM_SVC_LICENSE_NOT_FOUND              0x24000005  //  缓存中没有找到对应许可
#define ERROR_LM_SVC_SESSION_ALREADY_LOGOUT         0x24000006  //  session已经退出 
#define ERROR_LM_SVC_SESSION_ID_NOT_FOUND           0x24000007  //  不存在该session id
#define ERROR_LM_SVC_DEBUGGED                       0x24000008  //  发现软件被调试
#define ERROR_LM_SVC_INVALID_DESCRIPTION            0x24000009  //  无效的许可描述信息
#define ERROR_LM_SVC_HANDLE_NOT_FOUND               0x2400000A  //  找不到指定句柄
#define ERROR_LM_SVC_CACHE_OVERFLOW                 0x2400000B  //  cache 缓存已满
#define ERROR_LM_SVC_SESSION_OVERFLOW               0x2400000C  //  session 缓存已满
#define ERROR_LM_SVC_INVALID_SESSION                0x2400000D  //  无效的session
#define ERROR_LM_SVC_SESSION_ALREADY_DELETED        0x2400000E  //  session 已经被删除
#define ERROR_LM_SVC_LICENCE_EXPIRED                0x2400000F  //  许可已经过期
#define ERROR_LM_SVC_SESSION_TIME_OUT               0x24000010  //  session超时
#define ERROR_LM_SVC_NOT_ENOUGH_BUFF                0x24000011  //  缓冲区大小不足
#define ERROR_LM_SVC_DESC_NOT_FOUND                 0x24000012  //  没找到该设备描述
#define ERROR_LM_INVALID_PARAMETER                  0x24000013  //  LM service参数错误
#define ERROR_LM_INVALID_LOCK_TYPE                  0x24000014  //	锁类型不支持
#define ERROR_LM_REMOTE_LOGIN_DENIED                0x24000015  //  许可不允许远程登录
#define ERROR_LM_SVC_SESSION_INVALID_AUTHCODE       0x24000016  //  session认证失败
#define ERROR_LM_SVC_ACCOUNT_NOT_BOUND              0x24000017  //  账户未绑定
#define ERROR_LM_USER_NOT_EXISTS                    0x24000018  //  用户不存在


//============================================================
//              LM Native (0x21)
//============================================================

#define SS_ERROR_UNSUPPORTED_ALGORITHM              0x21000000  //  不支持的算法类型
#define SS_ERROR_INVAILD_HLC_HANDLE                 0x21000001  //  无效的HLC句柄
#define SS_ERROR_HLC_CHECK                          0x21000002  //  HLC检查失败
#define SS_ERROR_LM_CHECK_READ                      0x21000003  //  读标志位检查失败
#define SS_ERROR_LM_CHECK_LICENSE                   0x21000004  //  输出缓冲区许可ID不匹配
#define SS_ERROR_LM_CHECKSUM                        0x21000005  //  输出缓冲区校验失败
#define SS_ERROR_HLC_BUFFER_LEN                     0x21000006  //  HLC数据加密大于最大的缓冲区
#define SS_ERROR_L2CWF_LEN                          0x21000007  //  无效的加密长度
#define SS_ERROR_INVAILD_MAX_ENCRYPT_LENGTH         0x21000008  //  无效的加密长度
#define SS_ERROR_INVAILD_ENUM_CRYPT_TYPE            0x21000009  //  不支持的加密类型
#define SS_ERROR_NATIVE_INSUFFICIENT_BUFFER         0x2100000A  //  缓冲区不足
#define SS_ERROR_NATIVE_LIST_FILE_FAILED            0x2100000B  //  枚举锁内文件错误
#define SS_ERROR_INVALID_C2H_REQUEST                0x2100000C  //  无效的云锁到硬件锁请求

//============================================================
//              LM Firmware (0x22)
//============================================================

#define SS_ERROR_FIRM_INVALID_FILE_NAME             0x22000001  // 文件名称无效
#define SS_ERROR_FIRM_CHECK_BUFF_FAILED             0x22000002  // 数据校验失败
#define SS_ERROR_FIRM_INVALID_BUFF_LEN              0x22000003  // 传入数据长度错误
#define SS_ERROR_FIRM_INVALID_PARAM                 0x22000004  // 参数有误
#define SS_ERROR_FIRM_INVALID_SESSION_INFO          0x22000005  // session 信息错误
#define SS_ERROR_FIRM_INVALID_FILE_SIZE             0x22000006  // 创建文件长度出错
#define SS_ERROR_FIRM_WRITE_FILE_FAILED             0x22000007  // 写入文件数据出错
#define SS_ERROR_FIRM_INVALID_LICENCE_HEADER        0x22000008  // 许可信息头部错误
#define SS_ERROR_FIRM_INVALID_LICENCE_SIZE          0x22000009  // 许可信息数据错误
#define SS_ERROR_FIRM_INVALID_LICENCE_INDEX         0x2200000A  // 超过支持最大许可序号
#define SS_ERROR_FIRM_LIC_NOT_FOUND                 0x2200000B  // 没有找到对应的许可
#define SS_ERROR_FIRM_MEM_STATUS_INVALID            0x2200000C  // 内存状态数据未初始化
#define SS_ERROR_FIRM_INVALID_LIC_ID                0x2200000D  // 不可用的许可号
#define SS_ERROR_FIRM_LICENCE_ALL_DISABLED          0x2200000E  // 所有许可被禁用
#define SS_ERROR_FIRM_CUR_LICENCE_DISABLED          0x2200000F  // 当前许可被禁用
#define SS_ERROR_FIRM_LICENCE_INVALID               0x22000010  // 当前许可不可用
#define SS_ERROR_FIRM_LIC_STILL_UNAVALIABLE         0x22000011  // 许可尚不可用
#define SS_ERROR_FIRM_LIC_TERMINATED                0x22000012  // 许可已经到期
#define SS_ERROR_FIRM_LIC_RUNTIME_TIME_OUT          0x22000013  // 运行时间用尽
#define SS_ERROR_FIRM_LIC_COUNTER_IS_ZERO           0x22000014  // 次数用尽
#define SS_ERROR_FIRM_LIC_MAX_CONNECTION            0x22000015  // 已达到最大并发授权
#define SS_ERROR_FIRM_INVALID_LOGIN_COUNTER         0x22000016  // 不正确的登录计数
#define SS_ERROR_FIRM_REACHED_MAX_SESSION           0x22000017  // 锁内已经到达最大会话数量
#define SS_ERROR_FIRM_INVALID_TIME_INFO             0x22000018  // 通讯时间信息出错
#define SS_ERROR_FIRM_SESSION_SIZE_DISMATCH         0x22000019  // session 信息大小不匹配
#define SS_ERROR_FIRM_NOT_ENOUGH_SHAREMEMORY        0x2200001A  // 没有足够的共享内存
#define SS_ERROR_FIRM_INVALID_OPCODE                0x2200001B  // 不可用的操作码
#define SS_ERROR_FIRM_INVALID_DATA_LEN              0x2200001C  // 错误的数据文件长度    
#define SS_ERROR_FIRM_DATA_FILE_NOT_FOUND           0x2200001E  // 找不到对应的许可数据文件
#define SS_ERROR_FIRM_INVALID_PKG_TYPE              0x2200001F  // 远程升级包类型错误
#define SS_ERROR_FIRM_INVALID_TIME_STAMP            0x22000020  // 时间戳错误的远程升级包
#define SS_ERROR_FIRM_INVALID_UPD_LIC_ID            0x22000021  // 错误的远程升级许可序号
#define SS_ERROR_FIRM_LIC_ALREADY_EXIST             0x22000022  // 添加的许可已经存在
#define SS_ERROR_FIRM_LICENCE_SIZE_LIMITTED         0x22000023  // 许可数量受限
#define SS_ERROR_FIRM_INVALID_DATA_FILE_OFFSET      0x22000024  // 无效的许可数据文件偏移
#define SS_ERROR_FIRM_ZERO_INDEX_LIC_DESTROY        0x22000025  // 零号许可损坏
#define SS_ERROR_FIRM_LIC_ALREADY_DISABLED          0x22000026  // 许可原已经被禁止
#define SS_ERROR_FIRM_INVALID_UPD_OPCODE            0x22000027  // 无效的远程升级操作码
#define SS_ERROR_FIRM_LIC_ALREADY_ENABLED           0x22000028  // 许可已经有效
#define SS_ERROR_FIRM_INVALID_PKG_SIZE              0x22000029  // 远程升级包长度不正确
#define SS_ERROR_FIRM_LIC_COUNT_RETURN              0x2200002A  // 返回了错误的许可计数
#define SS_ERROR_FIRM_INVALID_OPERATION             0x2200002B  // 执行了不正确的操作
#define SS_ERROR_FIRM_SESSION_ALREADY_LOGOUT        0x2200002C  // session已经退出登录
#define SS_ERROR_FIRM_EXCHANGE_KEY_TIMEOUT          0x2200002D  // 交换密钥超时
#define SS_ERROR_FIRM_INVALID_EXCHANGE_KEY_MAGIC    0x2200002E  // 错误的交换密钥魔数
#define SS_ERROR_FIRM_INVALID_AUTH_CODE             0x2200002F  // 认证数据错误
#define SS_ERROR_FIRM_CONVERT_INDEX_TO_FILE         0x22000030  // 转换lic序号到文件名称失败
#define SS_ERROR_FIRM_INVALID_USER_DATA_TYPE        0x22000031  // 用户自定义字段类型错误
#define SS_ERROR_FIRM_INVALID_DATA_FILE_SIZE        0x22000032  // 用户自定义区域过大
#define SS_ERROR_FIRM_INVALID_CCRNT_OPR_TYPE        0x22000033  // 错误的并发计数操作类型
#define SS_ERROR_FIRM_ALL_LIC_TERMINATED            0x22000034  // 所有许可时间到期不可用
#define SS_ERROR_FIRM_INVALID_CCRNT_VALUE           0x22000035  // 错误的并发计数
#define SS_ERROR_FIRM_INVALID_UPD_FILE              0x22000036  // 不可用的删除历史记录文件
#define SS_ERROR_FIRM_UPD_RECORD_FULL               0x22000037  // 更新记录达到最大值
#define SS_ERROR_FIRM_UPDATE_FAILED                 0x22000038  // 远程升级失败
#define SS_ERROR_FIRM_LICENSE_BEING_WRITTING        0x22000039  // 该许可正在被写入
#define SS_ERROR_FIRM_INVALID_PKG_FIELD_TYPE        0x2200003A  // 升级包子类型错误
#define SS_ERROR_FIRM_LOAT_FSM_SALT                 0x2200003B  // 加载盐值文件出错
#define SS_ERROR_FIRM_DATA_LENGTH_ALIGNMENT         0x2200003C  // 加解密数据长度不对齐
#define SS_ERROR_FIRM_DATA_CRYPTION                 0x2200003D  // 加解密数据错误
#define SS_ERROR_FIRM_SHORTCODE_UPDATE_NOT_SUPPORTED    0x2200003E  // 不支持短码升级
#define SS_ERROR_FIRM_INVALID_SHORTCODE             0x2200003F  // 不可用的短码
#define SS_ERROR_FIRM_LIC_USR_DATA_NOT_EXIST        0x22000040  // 用户自定义数据不存在
#define SS_ERROR_FIRM_RCD_FILE_NOT_INITIALIZED      0x22000041  // 删除记录文件未初始化
#define SS_ERROR_FIRM_AUTH_FILE_NOT_FOUND           0x22000042  // 认证文件找不到
#define SS_ERROR_FIRM_SESSION_OVERFLOW              0x22000043  // session会话数溢出（在不限制并发时导致超过最大计数）
#define SS_ERROR_FIRM_TIME_OVERFLOW                 0x22000044  // 时间信息溢出，可能由于锁外pc时间被恶意修改所致
#define SS_ERROR_FIRM_REACH_FILE_LIS_END            0x22000045  // 枚举到达最后一个文件
#define SS_ERROR_FIRM_ANTI_MECHANISM_ACTIVED        0x22000046  // 惩罚计数触发锁定lm
#define SS_ERROR_FIRM_NO_BLOCK                      0x22000047  // 获取block出错
#define SS_ERROR_FIRM_NOT_ENDED                     0x22000048  // 数据未传输完毕   (特殊错误码)
#define SS_ERROR_FIRM_LIC_ALREADY_ACTIVE            0x22000049  // 许可已经激活
#define SS_ERROR_FIRM_FILE_NOT_FOUND                0x22000050  // 找不到文件
#define SS_ERROR_FIRM_UNKNOW_USER_DATA_TYPE         0x22000051  // 未知的用户数据类型
#define SS_ERROR_FIRM_INVALID_TF_CODE               0x22000052  // 错误的转移操作码
#define SS_ERROR_FIRM_UNMATCH_GUID                  0x22000053  // 不匹配的GUID 
#define SS_ERROR_FIRM_UNABLE_TRANSFER               0x22000054  // 许可不可进行转移
#define SS_ERROR_FIRM_INVALID_TRANSCODE             0x22000055  // 不能识别的随机码
#define SS_ERROR_FIRM_ACCOUNT_NAME_NOT_FOUND        0x22000056  // 用户名未找到
#define SS_ERROR_FIRM_ACCOUNT_ID_NOT_FOUND          0x22000057  // 账户id未找到
#define SS_ERROR_FIRM_INVALID_XKEY_STEP             0x22000058  // 错误的秘钥交换过程
#define SS_ERROR_FIRM_INVLAID_DEVELOPER_ID          0x22000059  // 无效的开发商ID
#define SS_ERROR_FIRM_CA_TYPE                       0x2200005A  // CA类型错误
#define SS_ERROR_FIRM_LIC_TRANSFER_FAILURE          0x2200005B  // 许可转移失败
#define SS_ERROR_FIRM_TF_PACKAGE_VERSION            0x2200005C  // 转移包版本号错误
#define SS_ERROR_FIRM_BEYOND_PKG_ITEM_SIZE          0x2200005D  // 升级包许可数量过大
#define SS_ERROR_FIRM_UNBOUND_ACCOUNT_INFO          0x2200005E  // 账户未绑定
#define SS_ERROR_FIRM_DEVICE_LOCKED                 0x2200005F  // 用户锁被锁定
#define SS_ERROR_FIRM_INVALID_LOCK_PASSWORD         0x22000060  // 错误的锁定密码
#define SS_ERROR_FIRM_NOT_EXCHANGE_KEY              0x22000061  // 未进行秘钥协商（auth认证）
#define SS_ERROR_FIRM_INVALID_SHORTCODE_SWAP_FILE   0x22000062  // 无效的短码升级交互文件
#define SS_ERROR_FIRM_SHORTCODE_UPDATE_USER_DATA    0x22000063  // 短码升级用户数据区错误
#define SS_ERROR_FIRM_CTRL_HMAC_VERSION             0x22000064  // 错误的开发锁hmac签名版本，需升级用户锁
#define SS_ERROR_FIRM_CTRL_HMAC_MAGIC               0x22000065  // 错误的开发锁hmac签名数据，需使用新的开发锁签包

#define SS_ERROR_FIRM_GEN_HWFP                      0x22001001  // 离线许可绑定错误
#define SS_ERROR_FIRM_WRONG_VERSION                 0x22001002  // 错误的版本号
#define SS_ERROR_FIRM_INVALID_PACKAGE               0x22001003  // 错误的数据包
#define SS_ERROR_FIRM_UNSUPPORTED_PACKAGE           0x22001004  // 不支持的数据包
#define SS_ERROR_FIRM_ILLEGAL_PACKAGE               0x22001005  // 不合法的数据包
#define SS_ERROR_FIRM_EXCEPTION                     0x22001006  // 内部错误
#define SS_ERROR_FIRM_VERIFY_D2C                    0x22001007  // D2C验证失败
#define SS_ERROR_FIRM_HWFP_MISMATCHED               0x22001008  // 绑定包与本机不匹配
#define SS_ERROR_FIRM_LICDATA_ERROR                 0x22001009  // 许可数据错误
#define SS_ERROR_FIRM_DEVPCERTS_NOT_FOUND           0X2200100A  // 开发商证书链未找到
#define SS_ERROR_FIRM_WRONG_CERTS                   0x2200100B  // 错误的证书
#define SS_ERROR_FIRM_VERIFY_DEVPSIGN               0x2200100C  // 开发商签名验证失败
#define SS_ERROR_FIRM_INVALID_VCLOCK                0x2200100D  // 软锁虚拟时钟错误
#define SS_ERROR_FIRM_SLOCK_CORRUPT                 0x2200100E  // 软锁许可文件损坏
#define SS_ERROR_FIRM_FORMAT_SLOCK                  0x2200100F  // 软锁格式化失败
#define SS_ERROR_FIRM_BAD_CONFIG                    0x22001010  // 配置文件不存在或已损坏
#define SS_ERROR_FIRM_BAD_OFFLINE_ADJUST_TIME       0x22001011  // 错误的离线校准时间

//============================================================
//              MODE LIC TRANS 模块()0x28
//============================================================
#define SS_ERROR_LIC_TRANS_NO_SN_DESC               0x28000001  // 未找到锁描述信息
#define SS_ERROR_LIC_TRANS_INVALID_DATA             0x28000002  // 数据格式错误

//============================================================
//              AUTH SERVER 模块 (0x29)
//============================================================

#define SS_ERROR_AUTH_SERVER_INVALID_TOKEN          0x29000001  //无效的token
#define SS_ERROR_AUTH_SERVER_REFRESH_TOKEN          0x29000002  //刷新token失败
#define SS_ERROR_AUTH_SERVER_LOGIN_CANCELED         0x29000003  //用户取消登陆
#define SS_ERROR_AUTH_SERVER_GET_ALL_USER_INFO_FAIL 0x29000004  //获取所有用户信息失败

//============================================================
//              Cloud 模块 (0x30)
//============================================================

#define SS_CLOUD_OK                                 0x30000000  //  成功
#define SS_ERROR_CLOUD_INVALID_PARAMETER            0x30000001  //  参数错误
#define SS_ERROR_CLOUD_QUERY_UESR_INFO              0x30000002  //  查询用户信息失败
#define SS_ERROR_CLOUD_INVALID_LICENSE_SESSION      0x30000003  //  许可未登录或已超时
#define SS_ERROR_CLOUD_DATA_EXPIRED                 0x30000004  //  数据已过期
#define SS_ERROR_CLOUD_VERIFY_TIMESTAMP_SIGNATURE   0x30000005  //  时间戳签名验证失败
#define SS_ERROR_CLOUD_AUTH_FAILED                  0x30000006  //  端到端认证失败
#define SS_ERROR_CLOUD_NOT_BOUND                    0x30000007  //  算法不存在或未绑定
#define SS_ERROR_CLOUD_EXECUTE_FAILED               0x30000008  //  算法执行失败
#define SS_ERROR_CLOUD_INVALID_TOKEN                0x30000010  //  不合法的token
#define SS_ERROR_CLOUD_LICENSE_ALREADY_LOGIN        0x30000011  //  许可已登陆
#define SS_ERROR_CLOUD_LICENSE_EXPIRED              0x30000012  //  许可已到期
#define SS_ERROR_CLOUD_SESSION_KICKED               0x30000013  //  许可已被其它电脑登录
#define SS_ERROR_CLOUD_DEVELOPER_ACCOUNT            0x30000014  //  软件供应商账户异常，请联系软件供应商解决
#define SS_ERROR_CLOUD_INVALID_SESSSION             0x30001002  //  无效的session
#define SS_ERROR_CLOUD_SESSION_TIMEOUT              0x30001004  //  会话超时
#define SS_ERROR_CLOUD_PARSE_PARAM                  0x30001007  //  参数解析错误
#define SS_ERROR_CLOUD_LICENSE_LOGIN_SUCCESS        0x31001000  //  许可登录成功
#define SS_ERROR_CLOUD_LICENSE_NOT_EXISTS           0x31001001  //  许可不存在
#define SS_ERROR_CLOUD_LICENSE_NOT_ACTIVE           0x31001002  //  许可未激活
#define SS_ERROR_CLOUD_LICENSE_EXPIRED2             0x31001003  //  许可已过期
#define SS_ERROR_CLOUD_LICENSE_COUNTER_IS_ZERO      0x31001004  //  许可无使用次数
#define SS_ERROR_CLOUD_LICENSE_RUNTIME_TIME_OUT     0x31001005  //  许可无使用时间
#define SS_ERROR_CLOUD_LICENSE_MAX_CONNECTION       0x31001006  //  许可并发量限制
#define SS_ERROR_CLOUD_LICENSE_LOCKED               0x31001007  //  许可被锁定
#define SS_ERROR_CLOUD_LICENSE_DATA_NOT_EXISTS      0x31001008  //  许可数据不存在
#define SS_ERROR_CLOUD_LICENSE_STILL_UNAVAILABLE    0x31001010  //  许可未到开始使用时间
#define SS_ERROR_CLOUD_ZERO_LICENSE_NOT_EXISTS      0x31001011  //  0号许可不存在
#define SS_ERROR_CLOUD_VERIFY_LICENSE               0x31001012  //  许可验证失败
#define SS_ERROR_CLOUD_EXECUTE_FILE_NOT_EXISTS      0x31002000  //  算法不存在
#define SS_ERROR_CLOUD_LICENSE_NOT_BOUND            0x31003001  //  算法未绑定

#define SS_ERROR_SO_SERVER_ERROR                    0x51000500  //  服务器错误 
#define SS_ERROR_SO_SERVER_DATA_ERROR               0x51004000  //  服务器数据错误
#define SS_ERROR_SO_USER_CENTER_ERROR               0x51004001  //  用户中心错误
#define SS_ERROR_SO_INVALID_TOKEN                   0x51004002  //  无效的access_token
#define SS_ERROR_SO_REFUSE_ADJUST_TIME              0x51004003  //  拒绝时间校准
#define SS_ERROR_SO_BEFORE_START_TIME               0x51004004  //  许可未到开始时间 
#define SS_ERROR_SO_EXPIRED                         0x51004005  //  许可已经过期
#define SS_ERROR_SO_LICENSE_BIND_ERROR              0x51004006  //  许可绑定错误
#define SS_ERROR_SO_LICENSE_BIND_FULL               0x51004007  //  许可同时绑定的机器数已达上限
#define SS_ERROR_SO_LICENSE_UNBOUND                 0x51004008  //  许可已经解绑
#define SS_ERROR_SO_LICENSE_MAX_BIND_FULL           0x51004009  //  许可最大绑定机器数已大上限
#define SS_ERROR_SO_INVALID_ACCESS_TOKEN            0x5100400A  //  无效的AccessToken
#define SS_ERROR_SO_NOT_SUPPORTED_OFFLINE_BIND      0x51004010  //  该许可不支持离线绑定
#define SS_ERROR_SO_EXPIRED_C2D                     0x51004011  //  过期的C2D包
#define SS_ERROR_SO_OFFLINE_UNBIND_REPEAT           0x51004012  //  重复的离线解绑请求（当离线解绑后重复上传时返回）
#define SS_ERROR_SO_DEVELOPER_ACCOUNT               0x51004013  //  软件供应商账户异常，请联系软件供应商解决
#define SS_ERROR_SO_OUTDATED_VERSION                0x51004014  //  许可服务版本过低，请升级到最新版本

#define SS_ERROR_LICKEY_QUERY_STATUS_REQ_ERROR          0x51005001  //  查询授权码状态请求发生异常
#define SS_ERROR_LICKEY_EXCHANGE_REQ_ERROR              0x51005002  //  授权码兑换请求发生异常
#define SS_ERROR_LICKEY_NOT_EXIST                       0x51005003  //  授权码不存在
#define SS_ERROR_LICKEY_DEDUCT_FAILED                   0x51005004  //  授权码许可扣费失败
#define SS_ERROR_LICKEY_C2D_INVALID_CHAR_ENCODING       0x51005005  //  C2D文件有误(需要UTF-8编码)
#define SS_ERROR_LICKEY_C2D_UNSUPPORTED_PROTO_TYPE      0x51005006  //  C2D文件有误(不支持的协议类型)
#define SS_ERROR_LICKEY_C2D_UNSUPPORTED_PROTO_VER       0x51005007  //  C2D文件有误(不支持的协议版本)
#define SS_ERROR_LICKEY_C2D_UNSUPPORTED_HWFP_VER        0x51005008  //  C2D文件有误(不支持的硬件指纹版本)
#define SS_ERROR_LICKEY_C2D_INCOMPATIBLE_MACHINE_ID     0x51005009  //  C2D文件有误(不匹配的机器ID)
#define SS_ERROR_LICKEY_C2D_UNSUPPORTED_INFO_VER        0x5100500A  //  C2D文件有误(不支持的机器信息版本)
#define SS_ERROR_LICKEY_C2D_OVERDUE                     0x5100500B  //  C2D文件有误(已过期，请重新生成)
#define SS_ERROR_LICKEY_C2D_HWFP_VERIFY_FAILED          0x5100500C  //  C2D文件有误(硬件指纹校验失败)
#define SS_ERROR_LICKEY_C2D_OLD_SS_VER                  0x5100500D  //  C2D文件有误(旧版C2D，请使用最新版本的Virbox用户工具重新生成)
#define SS_ERROR_LICKEY_C2D_PLATFORM_JUST_4_TRADITIONAL 0x5100500E  //  该授权码仅能用于传统平台(Windows/Linux/Mac-OS)
#define SS_ERROR_LICKEY_C2D_PLATFORM_JUST_4_ANDROID     0x5100500F  //  该授权码仅能用于安卓平台(Android)
#define SS_ERROR_LICKEY_C2D_EXCEPTION_HAPPENS           0x51005010  //  解析C2D过程发生异常
#define SS_ERROR_LICKEY_BIND_NO_AVAILABLE_LICENSE       0x51005011  //  不能绑定(无正常可用许可)
#define SS_ERROR_LICKEY_BIND_LICENSE_NOT_START          0x51005012  //  不能绑定(还未到许可的开始使用时间)
#define SS_ERROR_LICKEY_BIND_LICENSE_EXPIRED            0x51005013  //  不能绑定(许可已经过期)
#define SS_ERROR_LICKEY_BINDING_LIMIT_EXCEEDED          0x51005014  //  不能绑定(授权码同时绑定设备数已达上限)
#define SS_ERROR_LICKEY_BOUND_LIMIT_EXCEEDED            0x51005015  //  不能绑定(授权码累积绑定设备数已达上限)
#define SS_ERROR_LICKEY_BIND_NO_AVAILABLE_PKG           0x51005016  //  不能绑定(无可用升级包)
#define SS_ERROR_LICKEY_D2C_EXCEPTION_HAPPENS           0x51005017  //  绑定失败(生成升级包发生异常)

#define SS_ERROR_LICKEY_LICENSE_NOT_EXIST               0x5100612D  //  授权码没有包含任何许可，请联系软件供应商
#define SS_ERROR_LICKEY_D2C_PACKAGE                     0x5100612E  //  获取D2C升级包出错
#define SS_ERROR_LICKEY_NOT_EXIST_V2                    0x5100612F  //  授权码不存在，请确认授权码是否正确
#define SS_ERROR_LICKEY_INVALID_C2D_DATA                0x51006130  //  无效的硬件信息数据
#define SS_ERROR_LICKEY_INVALID_C2D_PARAM               0x51006131  //  硬件信息数据参数解析错误
#define SS_ERROR_LICKEY_NO_D2C_PACKAGE                  0x51006132  //  授权码不需要更新或更新包不存在，请联系软件供应商
#define SS_ERROR_LICKEY_LICENSE_ERROR                   0x51006133  //  绑定授权码许可错误
#define SS_ERROR_LICKEY_ABNORMAL_COST                   0x51006134  //  授权码许可扣费失败，请联系软件供应商

#define SS_ERROR_LL_SERVER_INTERNAL_ERROR               0x61000001  //  服务内部错误
#define SS_ERROR_LL_INVALID_PARAMETERS                  0x61000002  //  参数错误
#define SS_ERROR_LL_DEVICE_INFO_NOT_EXIST               0x61000003  //  加密锁信息不存在
#define SS_ERROR_LL_DEVICE_LOSS_OR_LOCKED               0x61000004  //  加密锁锁已丢失或已被锁定
#define SS_ERROR_LL_UNSUPPORTED_DEVELOPER               0x61000005  //  该开发者不支持丢锁补锁服务
#define SS_ERROR_LL_DEVICE_NO_RECORD                    0x61000006  //  加密锁未在云平台进行备案
#define SS_ERROR_LL_UNSUPPORTED_DEVICE                  0x61000007  //  加密锁锁不支持丢锁补锁服务
#define SS_ERROR_LL_UNKOWN_ACTIVATION_MODE              0x61001001  //  未知的加密锁激活状态
#define SS_ERROR_LL_UNKOWN_DEVICE_STATE                 0x61001002  //  未知的加密锁锁类型
#define SS_ERROR_LL_UNKOWN_D2C_USAGE                    0x61001003  //  未知的D2C类型
#define SS_ERROR_LL_UNKOWN_D2C_WRITE_RESULT             0x61001004  //  未知的D2C写入结果
#define SS_ERROR_LL_VERIFY_ERROR                        0x61001005  //  服务器验签失败
#define SS_ERROR_LL_DATABASE_OPT_ERROR                  0x61001006  //  数据库操作失败
#define SS_ERROR_LL_NO_NEED_TO_ACTIVATE                 0x61001007  //  加密锁不需要激活
#define SS_ERROR_LL_DEVICE_ALREADY_LOCKED               0x61001008  //  加密锁已被锁定
#define SS_ERROR_LL_D2C_INFO_NOT_EXIST                  0x61001009  //  D2C信息不存在
#define SS_ERROR_LL_ILLEGAL_DEVICE_STATE                0x6100100a  //  无效的加密锁状态
#define SS_ERROR_LL_CANNOT_BE_ACTIVATED                 0x6100100b  //  加密锁的当前状态无法被激活
#define SS_ERROR_LL_NOT_SUPPORTED_PROTOCOL_VERSION      0x6100100c  //  不支持的数据协议，请升级Virbox客户端
#define SS_ERROR_LL_OVER_DOWNLOAD_TIMES				    0x61003001  //  超过下载次数
#define SS_ERROR_LL_CERT_NOT_EXIST					    0x61003002  //  证书不存在
#define SS_ERROR_LL_LACK_OF_MONEY					    0x61003003  //  套餐余额不足，无法下载d2c等
#define SS_ERROR_LL_D2C_ISSUE_ERROR					    0x61003004  //  云平台签发授权失败


//============================================================
//              用户管理模块 (0x60)
//============================================================
#define SS_UM_OK									0x00000000	//成功
#define SS_UM_ERROR									0x00000001	//一般错误
#define SS_ERROR_UM_PARAMETER_ERROR					0x60000002  //参数错误
#define SS_ERROR_UM_CAPTCHA_INVALID					0x60000003  //验证码失效
#define SS_ERROR_UM_CAPTCHA_ERROR					0x60000004  //验证码错误
#define SS_ERROR_UM_CAPTCHA_IS_NULL					0x60000005  //请输入验证码
#define SS_ERROR_UM_USER_NO_ACTIVE					0x60000006  //用户未激活
#define SS_ERROR_UM_RETRY_TOO_MORE					0x60000007  //用户操作过于频繁,请稍后重试
#define SS_ERROR_UM_USER_OR_PWD_ERROR				0x60000008  //用户名或者密码错误
#define SS_ERROR_UM_OAUTH_CONFIG_ERROR				0x60000009  //OAuth用户中心配置错误
#define SS_ERROR_UM_GRANT_TYPE_ERROR				0x6000000A  //不支持的授权类型
#define SS_ERROR_UM_SCOPE_INVALID					0x6000000B  //无效的Scope
#define SS_ERROR_UM_SERVER_STOP						0x6000000C  //服务停止
#define SS_ERROR_UM_IPC_TIMEOUT						0x6000000D  //操作超时
#define SS_ERROR_UM_TRANS_ERROR						0x6000000E  //内部数据传输错误
#define SS_ERROR_UM_CLOUD_INVALID_TOKEN				0x6000000F  //TOKEN无效
#define SS_ERROR_UM_ACCOUNT_HAVE_BEEN_LOGOUT		0x60000010  //未找到GUID对应的登录信息
#define SS_ERROR_UM_NET_ERROR						0x60000011  //网络错误
#define SS_ERROR_UM_COULDNT_RESOLVE_HOST			0x60000012  //主机不可达 URL配置authconfig.xml被篡改或其他传输问题
#define SS_ERROR_UM_MEMORY_ERROR					0x60000013  //内部内存相关错误
#define SS_ERROR_UM_USERLIST_AND_AUTH_CFG_ERROR		0x60000014  //userlist.sensedata authconfig.xml 相关错误
#define SS_ERROR_UM_NEED_RELOGON					0x60000015  //TODO:刷新token失败，返回重新登录
#define SS_ERROR_UM_VERIFY_TOKEN_TIMEOUT				0x60000016  //校验token超时
#define SS_ERROR_UM_REFRESH_TOKEN_TIMEOUT				0x60000017  //刷新token超时



// 宏
#define MAKE_ERROR(mode, errcode)           (((mode) << 24) | (errcode))
#define MAKE_COMMON_ERROR(mode, errcode)    (((mode) << 24) | (errcode))
#define MAKE_H5_RUNTIME(errorcode)          (((errorcode)==H5_ERROR_SUCCESS) ? 0 : (MAKE_COMMON_ERROR(MODE_H5_RUNTIME,(errorcode))))
#define MAKE_SYS_ERROR(errorcode)          (((errorcode)==0) ? 0 : (MAKE_COMMON_ERROR(MODE_SYSTEM,(errorcode))))
#define MAKE_NETAGENT(errorcode)            MAKE_COMMON_ERROR(MODE_NETAGENT,(errorcode))
#define MAKE_SSPROTECT(errorcode)           MAKE_COMMON_ERROR(MODE_NETAGENT,(errorcode))
#define MAKE_LM_FIRM_ERROR(errorcode)       MAKE_COMMON_ERROR(MODE_LM_FIRM,(errorcode))
#define MAKE_LM_SES_ERROR(errorcode)        MAKE_COMMON_ERROR(MODE_LM_SES,(errorcode))
#define GET_ERROR_MODULE(errorcode)          ((errorcode) >> 24)


#endif //__SS_ERROR_H__
