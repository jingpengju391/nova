/** 
*   @file       ss_lm_runtime.hpp
*   @brief      ���ɹ����õĵ���ͷ�ļ�.  
*               ��Ӧ��̬��: slm_runtime.dll/slm_runtime_dev.dll 
*               ��Ӧ��̬��: slm_runtime_api.lib/slm_runtime_api_dev.lib 
*
*   ʹ�����ɵ���˳��
*
*       ��һ��������slm_init��������ȫ�ֳ�ʼ��
*       �ڶ���������slm_login������¼���ɣ�Ӳ�����ɣ��������ɣ������ɣ������ɣ�
*       ���������������ɲ�������������slm_keepalive slm_encrypt slm_decrypt�Ȳ���
*       ���Ĳ�������slm_logout�������ǳ���ǰ����
*       ���岽�������˳�ʱ������slm_cleanup��������ʼ������ѡ���ã�
*   @version   2.1.0
*   @date      2013-2020
*
*/
#ifndef __SS_LM_RUMTIME_H__
#define __SS_LM_RUMTIME_H__
#include "ss_define.hpp"
#include "ss_error.hpp"

#ifdef  _MSC_VER
#pragma comment(linker, "/defaultlib:ws2_32.lib")
#pragma comment(linker, "/defaultlib:iphlpapi.lib")
#pragma comment(linker, "/defaultlib:psapi.lib")
#pragma comment(linker, "/defaultlib:Shlwapi.lib")
#pragma comment(lib, "rpcrt4.lib")


#if _MSC_VER >= 1900   // 1900��VS2015�İ汾�ţ������̬����VS2015�±���ʧ�ܵ�����
#pragma comment(linker, "/defaultlib:legacy_stdio_definitions.lib")
#endif  // MSC_VER

#endif//???

/** Ӳ����������ɫ����ɫ */
#define LED_COLOR_BLUE      0
/** Ӳ����������ɫ����ɫ */
#define LED_COLOR_RED       1

/** Ӳ�������ƿ��ƣ��ر� */
#define LED_STATE_CLOSE     0
/** Ӳ�������ƿ��ƣ��� */
#define LED_STATE_OPEN      1
/** Ӳ�������ƿ��ƣ���˸ */
#define LED_STATE_SHRINK    2

/** Virbox���ɷ��� ��Ϣ�����ص���������ǰ�汾 SLM_CALLBACK_VERSION02 ) ������lparam��ʱû��ʹ�� */
typedef SS_UINT32 (SSAPI *SS_CALL_BACK)(SS_UINT32   message,void*       wparam,void*       lparam);
    
//============================================================
//   Virbox���ɷ��� �ص���Ϣ message ����
//============================================================
/** �ص���Ϣ���ͣ���Ϣ��ʾ */
#define SS_ANTI_INFORMATION			0x0101
/** �ص���Ϣ���ͣ����棨�ص�����wparam�����������ͣ�*/
#define SS_ANTI_WARNING				0x0102
/** �ص���Ϣ���ͣ��쳣 */
#define SS_ANTI_EXCEPTION			0x0103
/** �ص���Ϣ���ͣ��ݱ��� */
#define SS_ANTI_IDLE				0x0104

/** �ص������ͣ��������� */
#define SS_MSG_SERVICE_START        0x0200
/** �ص������ͣ�����ֹͣ */
#define SS_MSG_SERVICE_STOP         0x0201
/** �ص������ͣ������ã��������� Virbox���ɷ��� ����ʱ���ѳ�ʼ����ɣ����ص�����wparam �������� */
#define SS_MSG_LOCK_AVAILABLE       0x0202
/** �ص������ͣ�����Ч�����Ѱγ������ص�����wparam �������� */
#define SS_MSG_LOCK_UNAVAILABLE     0x0203
/** �ص������ͣ����˺ŵ�¼���ص�����wparam �����ѵ�¼���˺��û��� */
#define SS_MSG_CLOUD_USER_LOGIN     0x0204
/** �ص������ͣ����˺ŵǳ����ص�����wparam �����ѵǳ����˺��û��� */
#define SS_MSG_CLOUD_USER_LOGOUT    0x0205

//============================================================
//   �ص���Ϣ���ͣ���������SS_ANTI_WARNING��ֵ wparam ����
//============================================================
/** ��⵽�в�������ע�뵽Ŀ������У�һ��ָ�������Ĳ�����̬����ļ������ڵ�ǰ���̿ռ� */
#define SS_ANTI_PATCH_INJECT		0x0201
/** ϵͳģ���쳣�����ܴ��ڽٳ���Ϊ����һЩλ��ϵͳĿ¼�Ķ�̬�⣨hid.dll��lpk.dll���ȣ��Ӵ����Ŀ¼���� */
#define SS_ANTI_MODULE_INVALID		0x0202
/** ��⵽���򱻵��������ӵ���Ϊ����ͨ��Ollydbg��Windbg�Գ�����и��ӵ��� */
#define SS_ANTI_ATTACH_FOUND		0x0203
/** ��Ϊ����Ч���̡߳���δ���壬���� */
#define SS_ANTI_THREAD_INVALID		0x0204
/** ��⵽�������߳�����״̬�쳣�����ܱ����⹥�������̱߳��ֶ������ */
#define SS_ANTI_THREAD_ERROR		0x0205
/** ��⵽��ģ�����ݵ�CRC��֤ʧ�ܣ����ܴ��ڶ��������Ϊ���Խ����е�ģ�����öϵ��۸ĵ� */
#define SS_ANTI_CRC_ERROR			0x0206
/** ��⵽�������л������е��������ڣ���Ollydbg��Windbg */
#define SS_ANTI_DEBUGGER_FOUND		0x0207
//=============================================================

/** ʱ��У׼��������ӳ��� */
#define SLM_FIXTIME_RAND_LENGTH     8

/** SS_CALL_BACK�İ汾 ��֧�ֿ�����API����İ汾��*/
#define SLM_CALLBACK_VERSION02      0x02

/** �ڴ��й���󳤶ȣ��ֽڣ�*/
#define  SLM_MEM_MAX_SIZE           2048

/** ����ִ�У�������뻺������С���ֽڣ� */
#define SLM_MAX_INPUT_SIZE          1758
/** ����ִ�У���������������С���ֽڣ� */
#define SLM_MAX_OUTPUT_SIZE         1758

/** �ӽ�����󻺳�����󳤶ȣ��ֽڣ�*/
#define SLM_MAX_USER_CRYPT_SIZE     1520

/** �û���֤������󳤶ȣ��ֽڣ�*/
#define SLM_MAX_USER_DATA_SIZE      2048

/** �û�������д����󳤶ȣ��ֽڣ�*/
#define SLM_MAX_WRITE_SIZE          1904

/** ����Ӳ�����豸˽Կǩ��������ǰ׺����slm_sign_by_device */
#define SLM_VERIFY_DEVICE_PREFIX    "SENSELOCK"

/** ����Ӳ�����豸˽Կǩ�������ݴ�С����slm_sign_by_device */
#define SLM_VERIFY_DATA_SIZE        41

/** Ӳ�����豸оƬ�ŵĳ��ȣ��������ֽڣ�*/
#define SLM_LOCK_SN_LENGTH          16

/** ������ID���ȣ��������ֽڣ�*/
#define SLM_DEVELOPER_ID_SIZE       8

/** ָ����¼������������������󳤶ȣ��ַ�����*/
#define SLM_MAX_SERVER_NAME         32

/** ָ����¼�����û�token��󳤶ȣ��ַ�����*/
#define SLM_MAX_ACCESS_TOKEN_LENGTH 64

/** ָ����¼������������ַ��󳤶ȣ��ַ�����*/
#define SLM_MAX_CLOUD_SERVER_LENGTH 100

/** ��Ƭ�������ӳ��ȣ��������ֽڣ�*/
#define SLM_SNIPPET_SEED_LENGTH     32

/** ������API���볤�ȣ��������ֽڣ�*/
#define SLM_DEV_PASSWORD_LENGTH     16

/** �û�GUID��󳤶ȣ��ַ����� */
#define SLM_CLOUD_MAX_USER_GUID_SIZE 	        128	

/** һ���GUID���ȣ������� */
#define SLM_GUID_LENGTH 	                16	

/** Ӳ���������ļ����ͣ������ļ� */
#define SLM_FILE_TYPE_BINARY                    0
/** Ӳ���������ļ����ͣ���ִ���ļ��ļ� */
#define SLM_FILE_TYPE_EXECUTIVE                 1
/** Ӳ���������ļ����ͣ���Կ�ļ� */
#define SLM_FILE_TYPE_KEY                       2

/** Ӳ���������ļ����ԣ������߿ɶ� */
#define SLM_FILE_PRIVILEGE_FLAG_READ            0x01
/** Ӳ���������ļ����ԣ������߿�д */
#define SLM_FILE_PRIVILEGE_FLAG_WRITE           0x02
/** Ӳ���������ļ����ԣ������߿�ʹ�ã���Կ�ļ��� */
#define SLM_FILE_PRIVILEGE_FLAG_USE             0x04
/** Ӳ���������ļ����ԣ������߿�Զ������ */
#define SLM_FILE_PRIVILEGE_FLAG_UPDATE          0x08

/** Ӳ���������ļ����ԣ��ɶ� */
#define SLM_FILE_PRIVILEGE_FLAG_ENTRY_READ      0x10
/** Ӳ���������ļ����ԣ���˼��д */
#define SLM_FILE_PRIVILEGE_FLAG_ENTRY_WRITE     0x20
/** Ӳ���������ļ����ԣ���˼��ʹ�ã���Կ�ļ���*/
#define SLM_FILE_PRIVILEGE_FLAG_ENTRY_USE       0x40
/** Ӳ���������ļ����ԣ���˼��Զ������ */
#define SLM_FILE_PRIVILEGE_FLAG_ENTRY_UPDATE    0x80



/** ���ɵ�¼ģʽ���Զ�ѡ�� */
#define SLM_LOGIN_MODE_AUTO						0x0000
/** ���ɵ�¼ģʽ��ָ����¼������ */
#define SLM_LOGIN_MODE_LOCAL_DONGLE				0x0001
/** ���ɵ�¼ģʽ��ָ����¼������ */
#define SLM_LOGIN_MODE_REMOTE_DONGLE			0x0002
/** ���ɵ�¼ģʽ��ָ����¼���� */
#define SLM_LOGIN_MODE_CLOUD					0x0004
/** ���ɵ�¼ģʽ��ָ����¼�������� */
#define SLM_LOGIN_MODE_LOCAL_SLOCK 				0x0008
/** ���ɵ�¼ģʽ��ָ����¼Զ������ */
#define SLM_LOGIN_MODE_REMOTE_SLOCK				0x0010

/** ���ɵ�¼���ƣ��������е�����������ֶ�����������򲻵�¼���ṩѡ�񣬷����ҵ�������������ֱ�ӵ�¼��������ʹ�ô˱�־��*/
#define SLM_LOGIN_FLAG_FIND_ALL         0x0001    
/** ���ɵ�¼���ƣ�ָ�����ɰ汾 */
#define SLM_LOGIN_FLAG_VERSION          0x0004
/** ���ɵ�¼���ƣ�ָ�����ţ�оƬ�ţ�*/
#define SLM_LOGIN_FLAG_LOCKSN           0x0008
/** ���ɵ�¼���ƣ�ָ�������� */
#define SLM_LOGIN_FLAG_SERVER           0x0010
/** ���ɵ�¼���ƣ�ָ����Ƭ���� */
#define SLM_LOGIN_FLAG_SNIPPET          0x0020


/** �������ѯ������������ID���������� */
#define LANGUAGE_CHINESE_ASCII                  0x0001
/** �������ѯ������������ID��Ӣ�� */
#define LANGUAGE_ENGLISH_ASCII                  0x0002
/** �������ѯ������������ID���������� */
#define LANGUAGE_TRADITIONAL_CHINESE_ASCII      0x0003

/** ��ʼ��ʱ���ã���ʾ���յ� Virbox���ɷ��� ����Ϣ֪ͨ */
#define SLM_INIT_FLAG_NOTIFY            0x01

/** MAC ��ַ���� */
#define SLM_MAC_SIZE                    6
/** CPU ��Ϣ��󳤶� */
#define SLM_MAX_CPU_INFO_SIZE           128
/** BIOS ��Ϣ��󳤶� */
#define SLM_MAX_BIOS_INFO_SIZE          128
/** Session ID ����󳤶ȣ��ַ��� */
#define SLM_MAX_SESSION_ID_SIZE         32


/** ���ɵ�¼����ڴ���������Ҫ�ͻ�ά���ڴ棬Virbox���ɷ��� �濪����ά���ڴ棬����һ���ڴ�id����Χ��0-N֮�� */
typedef unsigned int SLM_HANDLE_INDEX; 

/** �������Ϣ����ö��  */
typedef enum _INFO_TYPE 
{
    /**  Ӳ��������Ϣ  */
    LOCK_INFO = 1,
    /**  �������ɵĻỰ��Ϣ */
    SESSION_INFO = 2,
    /**  ��ǰ��¼��������Ϣ */
    LICENSE_INFO  = 3,
	/**  �����ļ��б� */
	FILE_LIST  = 4
} INFO_TYPE;

/** ��������������ö��  */ 
typedef enum _LIC_USER_DATA_TYPE 
{
    /** ֻ���� */
    ROM = 0,     
    /** ��д�� */
    RAW = 1,
    /** ������ */
    PUB = 2
} LIC_USER_DATA_TYPE;

/** �豸��������  */ 
typedef enum _ENUM_DESC_TYPE 
{
    ENUM_DESC_LOCAL_DONGLE = 0,
    ENUM_DESC_REMOTE_DONGLE = 1,
    ENUM_DESC_CLOUD = 2,
    ENUM_DESC_SMART_OFFLINE = 3,
    ENUM_DESC_LOCAL_SLOCK = 4,
	ENUM_DESC_REMOTE_SLOCK = 5,
} ENUM_DESV_TYPE;

/** Ӳ�������ƿ��ƽṹ */
typedef struct _ST_LED_CONTROL 
{
    /**  0��ʾ��ɫLED��1��ʾ��ɫLED���ο��꣺LEX_COLOR_XXX  */
    SS_UINT32   index;
    /**  0�����رգ�1�����򿪣� 2������˸���ο��꣺LED_STATE_XXX */
    SS_UINT32   state;
    /**  LED����˸ʱ���������룩*/
    SS_UINT32   interval;   
} ST_LED_CONTROL;

/** ��ʼ������   */
typedef struct _ST_INIT_PARAM 
{
    /** �汾���������ݣ���ǰʹ�� SLM_CALLBACK_VERSION02 */
    SS_UINT32       version;
    /** �����Ҫ���� Virbox���ɷ��� ֪ͨ���� SLM_INIT_FLAG_NOTIFY */
    SS_UINT32       flag;
    /** �ص�����ָ��*/
    SS_CALL_BACK    pfn;
    /** ͨ�����ӳ�ʱʱ�䣨���룩�������0����ʹ��Ĭ�ϳ�ʱʱ�䣨7�룩*/
    SS_UINT32       timeout;
    /** API���룬�ɴ� VirboxLM �ƿ��������ģ�https://developer.lm.virbox.com����ͨ�����鿴��������Ϣ����ȡ */
    SS_BYTE         password[SLM_DEV_PASSWORD_LENGTH];
} ST_INIT_PARAM;

/** ����Login �ṹ */
typedef struct _ST_LOGIN_PARAM
{ 
    /** �ṹ���С�����*/
    SS_UINT32       size;
    /** Ҫ��¼������ID*/
    SS_UINT32       license_id;
    /** ���ɻỰ�ĳ�ʱʱ�䣨��λ���룩,��0��ʹ��Ĭ��ֵ��600��   */
    SS_UINT32       timeout;
    /** ���ɵ�¼��ģʽ��������������������������������SLM_LOGIN_MODE_XXX)�������0����ʹ��SLM_LOGIN_MODE_AUTO*/
    SS_UINT32       login_mode;
    /** ���ɵ�¼�ı�־����SLM_LOGIN_FLAG_XXX����������;�������ô˲��� */
    SS_UINT32       login_flag;
    /** ���ɵ�¼ָ������Ψһ���кţ���ѡ��*/
    SS_BYTE         sn[SLM_LOCK_SN_LENGTH];
    /** ��������������ַ����ѡ������ʶ��IP��ַ */
    SS_CHAR         server[SLM_MAX_SERVER_NAME];
    /** �����û�token����ѡ��*/
    SS_CHAR         access_token[SLM_MAX_ACCESS_TOKEN_LENGTH];
    /** ������������ַ����ѡ��*/
    SS_CHAR         cloud_server[SLM_MAX_CLOUD_SERVER_LENGTH];
    /** ��Ƭ�������ӣ���ѡ�������Ҫ֧����Ƭ����,login_flag��Ҫָ��ΪSLM_LOGIN_FLAG_SNIPPET*/
    SS_BYTE         snippet_seed[SLM_SNIPPET_SEED_LENGTH];
    /** �ѵ�¼�û���guid����ѡ�� */
    SS_CHAR         user_guid[SLM_CLOUD_MAX_USER_GUID_SIZE];
} ST_LOGIN_PARAM;

/** ����Ϣ�ṹ  */
typedef struct _ST_LOCK_INFO 
{
    ///  �ṹ���С
    SS_UINT32           size;      
    ///  �豸���ͣ�0 = ��ͨ�û�����2 = ʱ���û���
    SS_UINT8            device_type;        
    ///  �豸�ͺ�, 0 = ����5�û���
    SS_UINT8            device_mode;    
    ///  ����
    SS_UINT16           res;             
    ///  Entry �̼��汾���û����ع��ģ�
    SS_UINT8            lmfirm_version[4];  
    ///  H5 �̼��汾���������жϼ������̼��汾
    SS_UINT32           h5firm_version;   
    ///  Ӳ���汾���û����ع��ģ�
    SS_UINT32           hardware_version;   
    ///  �������ڣ�UTC��
    SS_UINT32           manufacture_date;   
    ///  �ܹ��ռ䣨��λ���ֽڣ�
    SS_UINT32           total_space;        
    ///  ʣ��ռ䣨��λ���ֽڣ�
    SS_UINT32           available_space;    
    ///  ͨѶЭ�飨�û����ع��ģ�
    SS_UINT32           protocol;        
    ///  ���ߵ�ַ���û����ع��ģ�
    SS_UINT32           slave_addr;       
    ///  ����ʱ�ӣ�UTC��
    SS_UINT32           clock;        
    ///  0 = ����ʱ�ӣ�2 = Ӳ��ʱ��
    SS_UINT32           clock_type;     
    ///  ʱ���������������Ӳ��ʱ����Ч������5ʱ�������У�
    SS_UINT32           drop_times;        
    ///  ��оƬ���кţ���ʶΨһ��
    SS_BYTE             lock_sn[SLM_LOCK_SN_LENGTH];  
    ///  ���ı��������û��������洢����Ǳ�ţ�Ҳ�ɱ�ʶΨһ��
    SS_BYTE             user_info[128];     
    ///  ���ı��������ڲ�����
    SS_BYTE             inner_info[128];    
} ST_LOCK_INFO;

/** �Ự��Ϣ�ṹ��  */
typedef struct _ST_SESSION_INFO 
{
    ///  �����С
    SS_UINT32           size;            
    ///  �Ѿ���¼������id 
    SS_UINT32           license_id;               
    union
    {
        SS_BYTE         sn[SLM_LOCK_SN_LENGTH];
        SS_BYTE         user_guid[SLM_GUID_LENGTH];
    };
    ///  ���������õĻỰ time_out
    SS_UINT32           app_time_out;        
    ///  ��ǰ�����Ľ��� id
    SS_UINT32           app_process_id;      
    ///  ����MAC��ַ
    SS_UINT8            mac[SLM_MAC_SIZE];      
    char                session_id[SLM_MAX_SESSION_ID_SIZE]; 
    ///  CPU ID Verndor ��Ϣ
    char                cpuinfo[SLM_MAX_CPU_INFO_SIZE];  
    ///  BIOS��Ϣ �������Ƶ�   
    char                bios[SLM_MAX_BIOS_INFO_SIZE];     
} ST_SESSION_INFO;

/** ������Ϣ�ṹ  */
typedef struct _ST_SLM_LICENSE_INFO
{
    ///  �ṹ���С
    SS_UINT32   size;
    ///  ���ɰ汾��
    SS_UINT32   lic_ver;  
    ///  ���ɱ�־λ��ע����Ҫ�Ķ�flag��ƫ�ƣ�
    SS_BYTE     flag[4];        
    ///  ���ɵ�guid
    SS_BYTE     guid[SLM_LOCK_SN_LENGTH];  
    ///  ����ID
    SS_UINT32   lic_id;    
    ///  ��ʼʱ��
    SS_UINT32   start_time;     
    ///  ��ֹʱ��
    SS_UINT32   end_time;   
    ///  ʱ����
    SS_UINT32   span_time;    
    ///  ����ʱ���
    SS_UINT32   time_stamp;     
    ///  ������ˮ��
    SS_UINT16   serial;        
    ///  ������󲢷���
    SS_UINT16   concurrency;    
    ///  ����������
    SS_UINT32   count;         
    ///  ģ�鹦�ܱ�ʶλ
    SS_UINT64   module_bit;    
    ///  ����ʱ��
    SS_UINT32   lock_time;      
    ///  ��һ��ʹ��ʱ��
    SS_UINT32   first_use_time; 
    ///  ��ǰʣ�����
    SS_UINT32   curr_count;   
    ///  ������ʱ��
    SS_UINT32   offline_period; 
    ///  ����ͬʱʹ�õĻ���������������޹أ�ֻ�������й�
    SS_UINT32   bind_node;      
    ///  ���ɰ󶨵Ļ���������������йأ�һ���󶨣��������
    SS_UINT32   max_bind_node;  
    ///  ��д����С
    SS_UINT32   raw_size;   
    ///  ֻ������С
    SS_UINT32   rom_size;   
    ///  ��������С
    SS_UINT32   pub_size;   
} ST_SLM_LICENSE_INFO;

/** �ļ���Ϣ�ṹ  */
typedef struct _ST_FILE_INFO 
{
    /** ��־��Щ����Ч�����������ļ�������ʹ��              */
    SS_BYTE     validate;                
    /** �ļ����ͣ������޸�                                 */
    SS_BYTE     type;                    
    /** �ļ�����Ȩ��                                       */
    SS_UINT16   pri;              
    /** �ļ���С                                           */
    SS_UINT32   size;                  
    /** �ļ��޸�ʱ��                                       */
    SS_UINT32   time;              
    /** �ļ���  ��ǰ�ļ����Ƴ���16�ֽ�                     */
    SS_BYTE     name[16];                
} ST_FILE_INFO;

/** �ļ���Ϣ�ṹ�б�  */
typedef struct _ST_FILE_INFO_LIST
{
    /// ��ǰΪ1
    SS_UINT32       version;        
    SS_UINT32       count;
    ST_FILE_INFO    info[1];
} ST_FILE_INFO_LIST;

/** �豸��Ϣ�ṹ  */
typedef struct _ST_DEV_INFO 
{
    ///	local, remote or cloud.(DESC type)
    SS_UINT16  		    desc_type;      
    ///  LM���ͣ�LM_FIRM_TYPE_XXX)
    SS_UINT16           firm_type;      
    SS_BYTE 	        developer_id[SLM_DEVELOPER_ID_SIZE];
    union 
    {
        struct 
        {
            SS_CHAR         cloud_server[114];
            SS_CHAR         user_token[48];
            SS_BYTE         user_guid[SLM_GUID_LENGTH];
        } cloud, smart_offline;  //  ����/��������

        struct 
        {
            SS_BYTE         serial[SLM_LOCK_SN_LENGTH];
            SS_CHAR         ip[64];
            SS_UINT16       port;
            SS_CHAR         host_name[SLM_MAX_SERVER_NAME];
            //  reserved    
        } h5;  //  Ӳ����

        struct 
        {
            SS_BYTE         user_guid[SLM_GUID_LENGTH];
            SS_CHAR         ip[64];
            SS_UINT16       port;
            //SS_BYTE         reserved[114 - 16 - 32];
            SS_CHAR         host_name[SLM_MAX_SERVER_NAME];
            // reserved for remote slock
            SS_CHAR         account_name[64];
        } slock;  //  ����
    };

} ST_DEV_INFO;

/** �豸�����ṹ  */
typedef struct _ST_ENUM_DEVICE 
{
    ST_DEV_INFO     dev_info;
    ST_LOCK_INFO    lock_info;
} ST_ENUM_DEVICE;

/** �豸��Ϣ�б�  */
typedef struct _ST_DEV_INFO_LIST
{
    SS_UINT32       version;        // ��ǰΪ1
    SS_UINT32       count;
    ST_ENUM_DEVICE  info[1];
} ST_DEV_INFO_LIST;

/** ����id�б�  */
typedef struct _ST_LICENSE_IDS
{
    SS_UINT32       count;
    SS_UINT32       lic_ids[1];
} ST_LICENSE_IDS;

/** 
*   @defgroup RuntimeAPI  Virbox Runtime �ӿ�˵��
*   ���ĵ��� Virbox Runtime �û�����ʱ�⣬�������ɷ��ʣ����ɼ��ܣ����ڴ���ִ�еȽӿ�
*   @{
*/

#ifdef __cplusplus
extern "C" {
#endif

/*!
*   @brief      Runtime API ��ʼ���������������� Runtime API �����ȵ��ô˺������г�ʼ��
*   @param[in]  pst_init    ��ʼ���������� #ST_INIT_PARAM �ṹ����
*   @return     �ɹ�����SS_OK��ʧ�ܷ�����Ӧ�Ĵ�����
*   @remarks    #slm_init ������ Virbox Runtime API �ĳ�ʼ����������ʹ������ Virbox Runtime API ֮ǰ������Ҫ�ȵ��ô˺�����
                ��ʼ��������Ҫ�Ƕ� Runtime �����ĳ�ʼ�����������������Ի��ơ�
*   @see        ST_INIT_PARAM slm_cleanup
*/
SS_UINT32 SSAPI slm_init(IN ST_INIT_PARAM* pst_init);

/*!
*   @brief      ����������Ϣ(����Ӳ������Ч)
*   @param[in]  license_id      Ҫ���ҵ�����ID��0--0xFFFFFFFF��
*   @param[in]  format          ������ʽ���ο� #INFO_FORMAT_TYPE ��Ŀǰ��֧�� #JSON �� #STRUCT
*   @param[out] license_desc    ����������Ϣ��ָ�룬��ʽ�� format ָ��������� #slm_free �ͷ�
*   @return     �ɹ����� SS_OK��ʧ�ܷ�����Ӧ�Ĵ�����
*   @remarks    �˺������ڲ��ұ���������������������Ϣ������ɹ�����Ҫ���� #slm_free �ͷ� license_desc��
*               �� format = #STRUCT ʱ license_desc ������ �ο� #ST_DEV_INFO_LIST
*   @see        INFO_FORMAT_TYPE
*/
SS_UINT32 SSAPI slm_find_license(
    IN  SS_UINT32           license_id,
    IN  INFO_FORMAT_TYPE    format,
    OUT char**              license_desc
    );


/*!
*   @brief      ö���ѵ�¼���û� token
*   @param[out] access_token    Ĭ���û��� token������� #slm_free �ͷ�
*   @return     �ɹ����� SS_OK����� oauth ��̨����δ�������򷵻� SS_ERROR_BAD_CONNECT
*   @remarks    ����ɹ�����Ҫ���� #slm_free �ͷ� access_token
*/
SS_UINT32 SSAPI slm_get_cloud_token(OUT SS_CHAR** access_token);

/*!
*   @brief      ��ȫ��¼����,�� #JSON ���ݲ���,���Ҽ��ʱ�䣨�Ƿ��ڻ����Ƿ����ڿ�ʼʱ�䣩���������������Ƿ���㣬
*               ����м��������������Լ��ٶ�Ӧ�ļ���������������������ʱ�������粢����������
*   @param[in]  license_param ��¼�������������������������� licenseid������ָ����¼���Եȡ�
*   @param[in]  param_format  ���������ַ������ͣ���֧�� #STRUCT��Ϊȷ����ȫ��SDK�汾��2.1.0.15128֮������ɵ�¼������֧�� json ��¼�ķ�����
*   @param[out] slm_handle    ���ص�¼֮�����ɾ��indexֵ,��Χ�� 0-256 ֮�䡣
*   @param[out] auth          ��֤ login ���������Ƿ���ȷ������ ECCǩ�� �ͷ���ֵ���ܣ���ʹ�ÿ����� NULL��
*   @return     �ɹ����� SS_OK��ʧ�ܷ�����Ӧ�Ĵ�����
*   @remarks
*   - #slm_login ������ϸ˵����
*       -# ���Զ����ҿ����������ɾ����
*       -# �� Runtime �������������ڴ�������߳���Ϣ��
*       -# �����������Ҫ���ڼ�ػỰ���̣���������������߱������Լ��ͷŶ�Ӧ���ڴ��������Դ��
*       -# LM�����ڿͻ������Զ����룬���� RSA��Կ����֤�豸ID�������̱�ŵ�һ����֤�ֶΡ�
*       -# LM�����������붼Ҫ login ֮�������Ȩ�޲��� �����д���ӽ��ܵȲ�����
*   - ���ܲ���˵����
*       - ���ýṹ�壺
*       -# �ο� #ST_LOGIN_PARAM �ṹ��ϸ����
*       -# #ST_LOGIN_PARAM::size         �����ṹ���С�����������Ϊ����ṹ��Ĵ�С������᷵�ش��� SS_ERROR_RUNTIME_VERSION
*       -# #ST_LOGIN_PARAM::license_id   ����ID��Ϊ32λ��������ȡֵ��Χ 0-4294967295����д����
*       -# #ST_LOGIN_PARAM::login_mode   ���ɵ�¼ģʽ����Ϊ�Զ�ģʽ���Լ��������������������������������
*       -# #ST_LOGIN_PARAM::sn           ָ����¼���� Ϊ������Ӳ����оƬ�ţ�16�ֽڣ���
*       -# #ST_LOGIN_PARAM::access_token �����¼����������Ҫָ��ͨ�� oauth ��֤�� access token
*       -# #ST_LOGIN_PARAM::timeout     ָ����¼�Ự��ʱ ��λΪ�롣�������д��Ĭ��Ϊ600�룬Ӳ��������������Ĭ����С������ 60s����󲻵ó��� 12Сʱ��12 * 60 * 60 �룩��
*       -# #ST_LOGIN_PARAM::user_guid    ��¼�û��� guid����󳤶�Ϊ #SLM_CLOUD_MAX_USER_GUID_SIZE��һ�㲻ʹ�� guid
*   @code
*       {
*           SS_UINT32           status = SS_OK;
*           ST_INIT_PARAM       init_param = { SLM_CALLBACK_VERSION02, 0, 0, 20000 };
*           SLM_HANDLE_INDEX    slm_handle = 0;
*           ST_LOGIN_PARAM      login_param = { 0 };
*           
*           // psd�Ǳش�������ÿ��������˽�У�����й¶����� VirboxLM �ƿ��������Ļ�ȡ��https://developer.lm.virbox.com
*           const char          psd[] = { 0xDB, 0x3B, 0x83, 0x8B, 0x2E, 0x4F, 0x08, 0xF5, 0xC9, 0xEF, 0xCD, 0x1A, 0x5D, 0xD1, 0x63, 0x41};
*
*           memcpy(init_param.password, psd, sizeof(init_param.password));  
*
*           status = slm_init(&init_param);
*           if(status != SS_OK)
*           {
*               return ;
*           }
*
*           login_param.license_id = 0;
*           login_param.size = sizeof(ST_LOGIN_PARAM);      // �ṹ�峤�ȱ��븳ֵΪ��ȷ�ĳ��ȣ���������
*           login_param.login_mode = SLM_LOGIN_MODE_LOCAL;
*
*           status = slm_login(&login_param, STRUCT, &slm_handle, NULL);
*           if(status != SS_OK)
*           {
*               //todo do: deal error code
*               return ;
*           }
*
*           slm_logout(slm_handle);
*       }
*   @endcode
*   @see slm_logout SS_UINT32 INFO_FORMAT_TYPE ST_LOGIN_PARAM
*/
SS_UINT32 SSAPI slm_login(
    IN  const ST_LOGIN_PARAM*  license_param,
    IN  INFO_FORMAT_TYPE       param_format,
    OUT SLM_HANDLE_INDEX *     slm_handle,
    IN OUT void*               auth
    );

/*!
*   @brief      ���ɵǳ��������ͷ����ɾ������Դ
*   @param[in]  slm_handle    ���ɾ��ֵ���� #slm_login �õ�
*   @return     �ɹ����� SS_OK��ʧ�ܷ�����Ӧ�Ĵ�����
*   @remarks    ����ʹ������ʱ����Ҫ���� #slm_logout �˳���¼���ɣ�������ռ�� Runtime ���е��ڴ����Դ��
*               ���磬���� Runtime ��ֻ֧�����256����¼�������ֻ��¼���ɶ����ǳ����ɣ�һ������ 256 ����¼�㽫ռ������ Runtime ���е���Դ�����º����ĵ�¼ʧ��
*   @see        slm_login
*/
SS_UINT32 SSAPI slm_logout(SLM_HANDLE_INDEX slm_handle);

/*!
*   @brief      ���ֵ�¼�Ự�����������Ϊ����ʬ�������
*   @param[in]  slm_handle    ���ɾ��ֵ
*   @return     �ɹ����� SS_OK��ʧ�ܷ�����Ӧ�Ĵ�����
*   @remarks    ��ʬ��������������ѭ�����߱�����slm_handle �����Զ����ͷţ���� Runtime �����ڴ����Դ�˷�
*   @code
*       DWORD WINAPI __stdcall _ThreadKeepalive(void *pVoid)
*       {
*           SLM_HANDLE_INDEX slm_handle = *(SLM_HANDLE_INDEX *)(pVoid);
*           SS_UINT32        status = SS_OK;
*
*           while (1)
*           {
*               status = slm_keep_alive(slm_handle);
*               if(status != SS_OK)
*               {
*                   //todo do: deal error code
*               }
*               Sleep(1000 * 10);      // ʮ���ӽ���һ���������ӣ���֤�Ự����Ч��
*           }
*       }
*       
*       {
*           SS_UINT32           status = SS_OK;
*           SLM_HANDLE_INDEX    slm_handle = 0;
*           ST_LOGIN_PARAM      login_param = { 0 };
*           HANDLE hThread;
*           DWORD  id = 0;
*
*           login_param.license_id = 0;
*           login_param.size = sizeof(ST_LOGIN_PARAM);
*           login_param.login_mode = SLM_LOGIN_MODE_LOCAL;
*           login_param.time_out = 30;    // ���ûỰΪ30�볬ʱ
*
*           status = slm_login(&login_param, STRUCT, &slm_handle, NULL);
*           if(status != SS_OK)
*           {
*               //todo do: deal error code
*               return ;
*           }
*
*           hThread = CreateThread(NULL, 0, _ThreadKeepalive, &slm_handle, 0, &id);
*           if (hThread == NULL)
*           {
*               //todo: deal error
*           }
*       }
*   @endcode
*   @see       slm_login
*/
SS_UINT32 SSAPI slm_keep_alive(SLM_HANDLE_INDEX slm_handle);

/*!
*   @brief      ���ɼ��ܣ���ͬ������ID��ͬ�Ŀ����߼��ܽ����ͬ
*   @param[in]  slm_handle   ���ɾ��ֵ���� #slm_login �õ�
*   @param[in]  inbuffer     �������뻺����,��Ҫ 16�ֽ� ���룬����ܳ��� 1520���ֽڡ�
*   @param[out] outbuffer    �������������,��Ҫ 16�ֽ� ���� 
*   @param[in]  len          ���ܻ�������С��Ϊ 16 ����������
*   @return     �ɹ����� SS_OK��ʧ�ܷ�����Ӧ�Ĵ�����
*   @remarks    ����Ӳ����������ֽ������ޣ���˼ӽ���ʱһ�δ�����ֽڲ��ó��� 1520���ֽڣ�����Ҫ�ӽ��ܵ��ֽ������ڴ�������ƣ�
*               �ɲ��ý�ȡ��������ѭ�����õķ�ʽ���мӽ��ܣ��ӽ��ܽ�������ܵ��κ�Ӱ�졣            
*   @code
*       {
*           SS_UINT32   status = SS_OK;
*           SS_BYTE     plain[32] = { 0 };  // �ӽ���ʹ��AES�ԳƼ��ܣ��������ݱ���16�ֽڶ���
*           SS_BYTE     enc[32] = { 0 };
*           SS_BYTE     dec[32] = { 0 };
*
*           memcpy(data, "test data...", strlen("test data..."));
*
*           status = slm_encrypt(slm_handle, plain, enc, sizeof(enc));
*           if(status != SS_OK)
*           {
*               // todo: deal error code
*               return ;
*           }
*
*           status = slm_decrypt(slm_handle, enc, dec, sizeof(dec));
*           if(status != SS_OK)
*           {
*               // todo: deal error code
*               return ;
*           }
*
*           //�ԱȽ��ܺ�������Ƿ���������
*           //if(plain == dec)
*           //{ 
*           //    SUCCESS;
*           //}
*           //else
*           //{
*           //    FAILURE;
*           //}
*       }
*   @endcode
*   @see        slm_encrypt slm_decrypt slm_login
 */
SS_UINT32 SSAPI slm_encrypt(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  SS_BYTE*            inbuffer,
    OUT SS_BYTE*            outbuffer,
    IN  SS_UINT32           len
    );

/*!
*   @brief      ���ɽ��ܣ���ͬ������ID��ͬ�Ŀ����߼��ܽ����ͬ
*   @param[in]  slm_handle   ���ɾ��ֵ���� #slm_login �õ�
*   @param[in]  inbuffer     �������뻺����,��Ҫ 16�ֽ� ���롣����ܳ��� 1520���ֽڡ�
*   @param[out] outbuffer    �������������,��Ҫ 16�ֽ� ���� 
*   @param[in]  len          ���ܻ�������С��Ϊ 16 ����������
*   @return     �ɹ����� SS_OK��ʧ�ܷ�����Ӧ�Ĵ�����
*   @remarks    ���ܷ�ʽ���� AES�ԳƼ��ܣ���Կ�ڼ������ڣ�ָӲ��������������������ͬ�����ɣ���û���κλ����ܳ������ڱ�֤Ч�ʵ�ͬʱ��Ҳ��󻯵ļ�ǿ�˰�ȫ�ԡ�
*               ����Ӳ����������ֽ������ޣ���˼ӽ���ʱһ�δ�����ֽڲ��ó��� 1520���ֽڣ�����Ҫ�ӽ��ܵ��ֽ������ڴ�������ƣ��ɲ��ý�ȡ��������ѭ������
*               �ӿڵķ�ʽ���мӽ��ܣ��ӽ��ܽ�������ܵ��κ�Ӱ�졣
*   @code
*       //see slm_encrypt
*   @endcode
*   @see        slm_encrypt slm_login
 */
SS_UINT32 SSAPI slm_decrypt(
    IN  SLM_HANDLE_INDEX    slm_handle, 
    IN  SS_BYTE*            inbuffer, 
    OUT SS_BYTE*            outbuffer, 
    IN  SS_UINT32           len
    );

/*!
*   @brief      ������ɵ��û���������С
*   @param[in]  slm_handle ���ɾ��ֵ���� #slm_login �õ�
*   @param[in]  type       �û����������ͣ����Ͷ���� LIC_USER_DATA_TYPE
*   @param[out] pmem_size  �����û���������С
*   @return     �ɹ����� SS_OK��ʧ�ܷ�����Ӧ�Ĵ�����
*   @see        LIC_USER_DATA_TYPE slm_user_data_getsize slm_user_data_read slm_user_data_write
 */
SS_UINT32 SSAPI slm_user_data_getsize(
    IN SLM_HANDLE_INDEX     slm_handle,
    IN LIC_USER_DATA_TYPE   type,
    OUT SS_UINT32*          pmem_size
    );

/*!
*   @brief      ���������ݣ����Զ�ȡ #PUB��#RAW �� #ROM
*   @param[in]  slm_handle   ���ɾ��ֵ���� #slm_login �õ�
*   @param[in]  type         �û����������ͣ��ο� #LIC_USER_DATA_TYPE
*   @param[out] readbuf      �û���������ȡ������
*   @param[in]  offset       ��ȡ���û�������������ƫ��
*   @param[in]  len          �ⲿʹ�õĴ洢��������С
*   @return     �ɹ����� SS_OK��ʧ�ܷ�����Ӧ�Ĵ�����
*   @remarks    �����������֧�� 64k ���ݵĶ�ȡ��
*   @code
*       {        
*           SS_UINT32 size = 0;
*           SS_BYTE   *buff = 0;
*           SS_UINT32 status = SS_OK;
*       
*           status = slm_user_data_getsize(slm_handle, ROM, &size);   // ��ȡֻ��������
*           if (status == SS_OK && size > 0)
*           {
*               buff = (SS_BYTE *)calloc(sizeof(SS_BYTE), size);
*               status = slm_user_data_read(slm_handle, ROM, buff, 0, size);
*               if(status != SS_OK)
*               {
*                   // todo: deal error code
*               }
*               // ���ڴ˴�����ȡ����ֻ��������
*               free(buff);
*               buff = 0;
*           }
*       }
*   @endcode
*   @see        LIC_USER_DATA_TYPE slm_user_data_getsize slm_user_data_read slm_user_data_write
 */
SS_UINT32 SSAPI slm_user_data_read(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  LIC_USER_DATA_TYPE  type,
    OUT SS_BYTE*            readbuf,
    IN  SS_UINT32           offset,
    IN  SS_UINT32           len
    );

/*!
*   @brief      д���ɵĶ�д������ ,����������֮ǰ����ȷ�����ڶ�д���Ĵ�С������ʹ�� #slm_user_data_getsize ���
*   @param[in]  slm_handle      ���ɾ��ֵ���� #slm_login �õ�
*   @param[in]  writebuf        Ҫд����������ݴ���
*   @param[in]  offset          ����������������ƫ�ƣ���������������д��λ��
*   @param[in]  len             Ҫд�����ݵĳ��ȣ�������󳤶� = min(#slm_user_data_getsize, #SLM_MAX_WRITE_SIZE)
*   @return     �ɹ����� SS_OK��ʧ�ܷ�����Ӧ�Ĵ�����
*   @remarks    ����д������ͨ��Ӧ�ó���д�����ݣ���˴˽ӿڲ���Ҫ�������������ͣ��ӿڻ�ֱ�ӽ�����д���д����
*               ������д��ʱ��������ݳ��ȴ��� #SLM_MAX_WRITE_SIZE ����Ҫ���������н��зְ�д�롣
*   @code
*       {
*           SS_UINT32 size = 0;
*           SS_BYTE   write[20] = { "write data" };
*           SS_UINT32 status = SS_OK;
*           SS_UINT32 offset = 0
*
*           status = slm_user_data_getsize(slm_handle, RAW, &size);   // ����д����д������
*           if (status == SS_OK && size > 0)
*           {
*               size = min( offset + sizeof(write), size);    // д�����ݲ��ó�����ȡ�������ݳ���
*               status = slm_user_data_write(slm_handle, write, offset, size);
*               if(status != SS_OK)
*               {
*                   // todo: deal error code
*               }
*           }
*       }
*   @endcode
*   @see       LIC_USER_DATA_TYPE   slm_user_data_getsize slm_user_data_read slm_user_data_write
 */
SS_UINT32 SSAPI slm_user_data_write(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  SS_BYTE*            writebuf,
    IN  SS_UINT32           offset,
    IN  SS_UINT32           len
    );


SS_UINT32 SSAPI slm_pub_data_getsize(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  SS_UINT32           license_id,
    OUT SS_UINT32*          pmem_size
    );

SS_UINT32 SSAPI slm_pub_data_read(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  SS_UINT32           license_id,
    OUT SS_BYTE*            readbuf,
    IN  SS_UINT32           offset,
    IN  SS_UINT32           len
    );


SS_UINT32 SSAPI slm_get_info(
    IN  SLM_HANDLE_INDEX	slm_handle,
    IN  INFO_TYPE			type,
    IN  INFO_FORMAT_TYPE	format,
    OUT char**              result
    );


SS_UINT32 SSAPI slm_execute_static(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  const char*         exfname,
    IN  SS_BYTE*            inbuf,
    IN  SS_UINT32           insize,
    OUT SS_BYTE*            poutbuf,
    IN  SS_UINT32           outsize,
    OUT SS_UINT32*          pretsize
    );


SS_UINT32 SSAPI slm_execute_dynamic(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  SS_BYTE*            exf_buffer,
    IN  SS_UINT32           exf_size,
    IN  SS_BYTE*            inbuf,
    IN  SS_UINT32           insize,
    OUT SS_BYTE*            poutbuf,
    IN  SS_UINT32           outsize,
    OUT SS_UINT32*          pretsize
    );


SS_UINT32 SSAPI slm_mem_alloc(
    IN  SLM_HANDLE_INDEX    slm_handle, 
    IN  SS_UINT32           size, 
    OUT SS_UINT32*          mem_id
    );


SS_UINT32 SSAPI slm_mem_free(
    IN  SLM_HANDLE_INDEX    slm_handle, 
    IN  SS_UINT32           mem_id
    );


SS_UINT32 SSAPI slm_mem_read(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  SS_UINT32           mem_id,
    IN  SS_UINT32           offset,
    IN  SS_UINT32           len,
    IN  SS_BYTE*            readbuff,
    OUT SS_UINT32*          readlen
    );


SS_UINT32 SSAPI slm_mem_write(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  SS_UINT32           mem_id,
    IN  SS_UINT32           offset,
    IN  SS_UINT32           len,
    IN  SS_BYTE*            writebuff,
    OUT SS_UINT32*          numberofbyteswritten
    );


SS_UINT32 SSAPI slm_is_debug(IN void *auth);

SS_UINT32 SSAPI slm_get_cert(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  CERT_TYPE           cert_type,
    OUT SS_BYTE*            cert,
    IN  SS_UINT32           cert_size,
    OUT SS_UINT32*          cert_len
    );

SS_UINT32 SSAPI slm_get_device_cert(
    IN  SLM_HANDLE_INDEX    slm_handle,
    OUT SS_BYTE*            device_cert,
    IN  SS_UINT32           buff_size,
    OUT SS_UINT32*          return_size
    );

SS_UINT32 SSAPI slm_sign_by_device(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  SS_BYTE*            verify_data,
    IN  SS_UINT32           verify_data_size,
    OUT SS_BYTE*            signature,
    IN  SS_UINT32           signature_buf_size,
    OUT SS_UINT32*          signature_size
    );

SS_UINT32 SSAPI slm_adjust_time_request(
    IN  SLM_HANDLE_INDEX    slm_handle,
    OUT SS_BYTE             rand[SLM_FIXTIME_RAND_LENGTH],
    OUT SS_UINT32*          lock_time,
    IN OUT SS_UINT32*       pc_time
    );


SS_UINT32 SSAPI slm_led_control(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  ST_LED_CONTROL*     led_ctrl
    );


SS_UINT32 SSAPI slm_get_version(
    OUT SS_UINT32*      api_version, 
    OUT SS_UINT32*      ss_version
    );

void SSAPI slm_free(
    IN void*        buffer
    );

SS_UINT32 SSAPI slm_update(
    IN  char*       d2c_pkg, 
    OUT char**      error_msg
    );


SS_UINT32 SSAPI slm_update_ex(
    IN SS_BYTE*     lock_sn, 
    IN char*        d2c_pkg, 
    OUT char**      error_msg
    );


SS_UINT32 SSAPI slm_d2c_update_inside(
    IN char*        lock_sn,
    IN char*        inside_file
    );


SS_UINT32 SSAPI slm_enum_device(
    OUT char**  device_info
    );


SS_UINT32 SSAPI slm_enum_device_ex(
    IN  INFO_FORMAT_TYPE    format,
    OUT void                **device_info
    );


SS_UINT32 SSAPI slm_enum_license_id(
    IN const char   *device_info,
    OUT char        **license_ids
    );


SS_UINT32 SSAPI slm_enum_license_id_ex(
    IN  ST_DEV_INFO         *device_info,
    IN  INFO_FORMAT_TYPE    format,
    OUT void                **license_ids
    );


SS_UINT32 SSAPI slm_get_license_info(
    IN const char   *device_info,
    IN SS_UINT32    license_id,
    OUT char        **license_info
    );


SS_UINT32 SSAPI slm_get_license_info_ex(
    IN  ST_DEV_INFO          *device_info,
    IN  SS_UINT32           license_id,
    IN  INFO_FORMAT_TYPE    format,
    OUT void                **license_info
    );


SS_UINT32 SSAPI slm_check_module(IN SLM_HANDLE_INDEX slm_handle, IN SS_UINT32 module_id);


SS_UINT32 SSAPI slm_snippet_execute(
    IN  SLM_HANDLE_INDEX    slm_handle,
    IN  SS_BYTE*            snippet_code,
    IN  SS_UINT32           code_size,
    IN  SS_BYTE*            input, 
    IN  SS_UINT32           input_size, 
    OUT SS_BYTE*            output, 
    IN  SS_UINT32           outbuf_size, 
    OUT SS_UINT32*          output_size
    );


SS_UINT32 SSAPI slm_get_developer_id(OUT SS_BYTE developer_id[SLM_DEVELOPER_ID_SIZE]);


SS_UINT32 SSAPI slm_license_sign(
    IN  SLM_HANDLE_INDEX   slm_handle,
    IN  SS_BYTE           *sign_data,
    IN  SS_UINT32          sign_length,
    OUT SS_BYTE           *signature,
    IN  SS_UINT32          max_buf_size,
    OUT SS_UINT32         *signature_length
    );


SS_UINT32 SSAPI slm_license_verify(
    IN  SS_BYTE      *sign_data,
    IN  SS_UINT32       sign_length,
    IN  SS_BYTE      *signature,
    IN  SS_UINT32     signature_length,
    OUT char        **sign_info
    );


const SS_CHAR * SSAPI slm_error_format(
    IN SS_UINT32    error_code,
    IN SS_UINT32    language_id
    );


SS_UINT32 SSAPI slm_cleanup(void);


SS_UINT32 SSAPI slm_extensions_config(IN const char *config);

#ifdef __cplusplus
};
#endif //__cplusplus

/**
*   @}
*/


#endif // #ifndef __SS_LM_RUMTIME_H__

