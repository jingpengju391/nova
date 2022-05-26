<template >
  <el-config-provider :locale="locale">
    <Login v-if="loginMask" @login="login" />
    <div v-if="isAuthor && !isAppStarted" id="start-view">
      <h1>飞燕</h1>
      <main>
        <section>
          <section class="file-open-navigation start">
            <h2>Start</h2>
            <el-button type="text" icon="document-add" @click="createWorkspace"
              >New &nbsp;&nbsp;Workspace</el-button
            >
            <div class="openworkspace-box">
              <el-button type="text" icon="folder-opened" @click="openWorkspace"
                >Open Workspace</el-button
              >
            </div>
            <el-button
              type="text"
              icon="upload"
              v-if="isBS"
              @click="uploadFileVisible = true"
              >Upload Workspace</el-button
            >
          </section>
          <section class="file-open-navigation recent">
            <h3>Recent</h3>
          </section>
        </section>
        <section>
          <h2>Walkthroughs</h2>
        </section>
      </main>
    </div>
    <div v-else-if="!isAuthor && isLicenseChecked" class="Authorization">
      <div>请将机器唯一编码{{ physicalAddress }}告诉客服以获取授权文件</div>
      <el-button @click="openAuthorization">重新授权</el-button>
    </div>

    <el-container v-else id="app">
      <el-container
        id="loading-view"
        v-if="isAppRecoveringFromDB"
        v-loading="isAppRecoveringFromDB"
        element-loading-text="载入数据中"
      />
      <el-container id="main-view">
        <el-aside id="sideBar" width="50px">
          <el-menu
            id="menu"
            :router="true"
            default-active="/coder"
            background-color="rgba(1,1,1,0)"
            text-color="#fff"
            active-text-color="#ffd04b"
          >
            <el-menu-item index="/dcsview">
              <span class="menu-item-box"
                ><i class="icon-box"
                  ><svg-icon
                    :name="
                      $route.path === '/dcsview' ? 'dataLink_hit' : 'dataLink'
                    "
                  ></svg-icon></i
                ><i class="menu-item-title-box"> DCS </i>
              </span>
            </el-menu-item>
            <!-- <el-menu-item index="/dataLink">
              <span class="menu-item-box"
                ><i class="icon-box"
                  ><svg-icon
                    :name="
                      $route.path === '/dataLink' ? 'dataLink_hit' : 'dataLink'
                    "
                  ></svg-icon></i
                ><i class="menu-item-title-box"> 清洗数据 </i>
              </span>
            </el-menu-item>
            <el-menu-item index="/project">
              <span class="menu-item-box"
                ><i class="icon-box"
                  ><svg-icon
                    :name="
                      $route.path === '/project' ? 'project_hit' : 'project'
                    "
                  ></svg-icon></i
                ><i class="menu-item-title-box"> 清洗项目 </i></span
              >
            </el-menu-item> -->
            <el-menu-item index="/data-input">
              <!-- <i class="icon-box"><svg-icon name="data"></svg-icon></i> -->
              <span class="menu-item-box"
                ><i class="icon-box"
                  ><svg-icon
                    :name="$route.path === '/data-input' ? 'data_hit' : 'data'"
                  ></svg-icon></i
                >数据</span
              >
            </el-menu-item>
            <el-menu-item index="/assumption">
              <span class="menu-item-box"
                ><i class="icon-box"
                  ><svg-icon
                    :name="
                      $route.path === '/assumption'
                        ? 'assumption_hit'
                        : 'assumption'
                    "
                  ></svg-icon></i
                >假设</span
              >
            </el-menu-item>
            <el-menu-item index="/coder">
              <span class="menu-item-box"
                ><i class="icon-box"
                  ><svg-icon
                    :name="$route.path === '/coder' ? 'coder_hit' : 'coder'"
                  ></svg-icon></i
                >模型</span
              >
            </el-menu-item>
            <el-menu-item index="/runner">
              <span class="menu-item-box"
                ><i class="icon-box"
                  ><svg-icon
                    :name="$route.path === '/runner' ? 'runner_hit' : 'runner'"
                  ></svg-icon></i
                >运行</span
              >
            </el-menu-item>
            <!-- <el-menu-item index="/output">
              <span class="menu-item-box"
                ><i class="icon-box"
                  ><svg-icon
                    :name="$route.path === '/output' ? 'output_hit' : 'output'"
                  ></svg-icon></i
                >输出</span
              >
            </el-menu-item> -->
            <!-- <el-menu-item index="/help">
              <span class="menu-item-box"
                ><i class="icon-box"
                  ><svg-icon
                    :name="$route.path === '/help' ? 'help_hit' : 'help'"
                  ></svg-icon></i
                >帮助</span
              >
            </el-menu-item> -->

            <el-menu-item index="/product">
              <span class="menu-item-box">
                <i class="icon-box"
                  ><svg-icon
                    :name="$route.path === '/product' ? 'help_hit' : 'help'"
                  ></svg-icon></i
                >产品</span
              >
            </el-menu-item>
            <el-menu-item index="/setup" id="setupBox">
              <span class="menu-item-box"
                ><i class="icon-box"
                  ><svg-icon
                    :name="$route.path === '/setup' ? 'setting_hit' : 'setting'"
                  ></svg-icon></i
              ></span>
            </el-menu-item>
            <!-- <el-menu-item index="/task">
              <span class="menu-item-box"
                ><i class="icon-box"
                  ><svg-icon
                    :name="$route.path === '/task' ? 'task_hit' : 'task'"
                  ></svg-icon></i
                >任务</span>
            </el-menu-item> -->
          </el-menu>
        </el-aside>
        <el-container>
          <router-view v-slot="{ Component, route }">
            <keep-alive>
              <component
                :is="Component"
                :key="route.meta.usePathKey ? route.path : undefined"
              />
            </keep-alive>
          </router-view>
        </el-container>
      </el-container>
    </el-container>
    <import-file-dialog
      v-if="dialogFileVisible"
      extension=".feiyanworkspace"
      @chooseFile="chooseFile"
      @closeDialog="closeChooseFileDialog"
    />
    <create-workspace
      v-if="dialogCreateWorkspaceVisible"
      @closeDialog="closeCreateWorkspaceDialog"
    />
    <upload-file
      v-if="uploadFileVisible"
      type="dir"
      @closeDialog="uploadFileVisible = false"
    />
  </el-config-provider>
</template>

<script lang="ts">
import { ElConfigProvider } from 'element-plus'
import zh from 'element-plus/lib/locale/lang/zh-cn'
import { defineComponent } from 'vue'
import { useWorkspacesAPIs, useIpcRenderer, useAppSettingsAPIs, userAPIs } from '@/hooks/apis'
import { mapActions, mapMutations, mapState } from 'vuex'
import SvgIcon from './views/components/SvgIcon.vue'
import Login from './views/components/Login/index.vue'
import defaultLanguageServer from './formulaLanguageServer'
import modelsDataSource from './store/modules/modelsDataSource'
import { isFeiyanWorkspaceFile } from './utils'
import ImportFileDialog from './views/components/ImportFileDialog/index.vue'
import CreateWorkspace from './views/components/Workspace/CreateWorkspace.vue'
import UploadFile from './views/components/Workspace/UploadFile.vue'

// import axios from '../../lib/ajaxRequest'

export default defineComponent({
  components: {
    SvgIcon,
    [ElConfigProvider.name]: ElConfigProvider,
    ImportFileDialog,
    Login,
    CreateWorkspace,
    UploadFile
  },
  data() {
    // let isAppStarted
    // if (useAppSettingsAPIs()) {
    //   isAppStarted = useAppSettingsAPIs().isAppStartedInitialValue()
    // } else {
    //   // console.log('请求获取useAppSettingsAPIs')
    //   // axios.get('http://127.0.0.1:3000/get-apis').then((res) => {
    //   //   console.log('res-----------------', res.data)
    //   // }).catch(err => {
    //   //   console.log('请求发生错误---')
    //   // })
    //   console.log(useWorkspacesAPIs())
    // }

    return {
      locale: zh,
      isAppRecoveringFromDB: true,
      username: 'myname',
      password: 'mypass',
      spaceNum: 0,
      dialogFileVisible: false,
      physicalAddress: undefined,
      dialogCreateWorkspaceVisible: false,
      uploadFileVisible: false,
      isBS: true,
      isShow: false
    }
  },
  computed: {
    ...mapState(['loginMask', 'isAuthor', 'isAppStarted', 'isDataCleanShow', 'isLicenseChecked'])
  },
  created() {
    if (useIpcRenderer()) {
      useIpcRenderer().on('app:openWorkspaceFromDialog', this.openWorkspace)
      useIpcRenderer().on('app:openWorkspaceFromPath', (event, workspacePath) => {
        this.openWorkspaceWithPath(workspacePath)
      })
      useIpcRenderer().on('app:createWorkspace', this.createWorkspace)
      useIpcRenderer().on('app:terminateLanguageServer', this.handleAppBeforeQuit)
    }
    this.isBS = !!userAPIs().login
    this.setIsAuthor(this.isBS)
    if (!this.isBS) {
      this.setLoginMask(false)
      this.isBS = false
    } else {
      this.setLoginMask(true)
      this.isAppRecoveringFromDB = false
    }
    this.setIsAppStarted(useAppSettingsAPIs().isAppStartedInitialValue())
  },
  mounted() {
    document.title = '飞燕'
    const startView = document.getElementById('start-view')
    startView && startView.addEventListener('dragover', event => {
      event.stopPropagation()
      event.preventDefault()
    })
    startView && startView.addEventListener('drop', async event => {
      event.stopPropagation()
      event.preventDefault()
      const filePath = event.dataTransfer.files[0].path
      await this.openWorkspaceWithPath(filePath)
    })
    const appView = document.getElementById('app')
    appView && appView.addEventListener('dragover', event => {
      event.stopPropagation()
      event.preventDefault()
    })
    appView && appView.addEventListener('drop', async event => {
      event.stopPropagation()
      event.preventDefault()
      if (!event.dataTransfer?.files?.length) return
      if (event.dataTransfer?.files.length !== 1) {
        this.$message.error('只允许拖入打开一个飞燕工程文件')
        return
      }
      if (!isFeiyanWorkspaceFile(event.dataTransfer.files[0])) {
        this.$message.error('只允许拖入打开一个格式为 .feiyanworkspace 的飞燕工程文件')
        return
      }
      useWorkspacesAPIs().openWorkspaceInNewWindow(event.dataTransfer.files[0].path)
    })
    if (!this.isBS) {
      userAPIs().checkLicenseSchedule().then((res) => {
        let { isAuthor, msg } = res
        this.setIsAuthor(isAuthor)
        console.log(msg)
      })
      userAPIs().showPhysicalAddress().then(async (res) => {
        this.physicalAddress = res
        userAPIs().firstCheckLocalLicense().then((res) => {
          let { isAuthor, msg } = res
          this.setIsAuthor(isAuthor)
          console.log(msg)
          this.setIsLicenseChecked(true)
        }).catch((err: any) => {
          console.log(err)
        })
      }).catch((err: any) => {
        console.log(err)
        if (!userAPIs().login) {
          this.setIsLicenseChecked(true)
        }
      })
    } else {
      this.setIsLicenseChecked(true)
    }
  },
  unmounted() {
    useIpcRenderer().off('app:openWorkspaceFromDialog', this.openWorkspace)
    useIpcRenderer().off('app:openWorkspaceFromPath', this.openWorkspaceWithPath)
    useIpcRenderer().off('app:createWorkspace', this.createWorkspace)
    useIpcRenderer().off('app:terminateLanguageServer', this.handleAppBeforeQuit)
    // this.handleAppBeforeQuit()
  },
  methods: {
    ...mapMutations(['setWorkspace', 'setLoginMask', 'setDataCleanShow', 'setIsAuthor', 'setIsAppStarted', 'setUserInfo', 'setIsLicenseChecked']),
    ...mapActions(['resetWorkspace']),
    changePage() {
      this.setDataCleanShow()
    },
    async createWorkspace() {
      if (!userAPIs().login) {
        const { canceled, workspacePath } = await useWorkspacesAPIs().createWorkspacePath()
        if (canceled) return
        this.createWorkspaceWithPath(workspacePath)
      } else {
        this.dialogCreateWorkspaceVisible = true
      }
    },
    closeCreateWorkspaceDialog(workspacePath: string) {
      this.dialogCreateWorkspaceVisible = false
      if (workspacePath) {
        this.createWorkspaceWithPath(workspacePath)
      }
    },
    async createWorkspaceWithPath(workspacePath: string) {
      this.isAppRecoveringFromDB = true
      this.setIsAppStarted(true)
      const workspace = await window.apis.initializeWorkspace(workspacePath, true)
      // this.setWorkspace(workspace)
      await this.resetWorkspace(workspace)
      this.isAppRecoveringFromDB = false
    },
    async openWorkspace() {
      if (!userAPIs().login) {
        const { canceled, workspacePath } = await useWorkspacesAPIs().chooseWorkspacePath()
        if (canceled) return
        await this.openWorkspaceWithPath(workspacePath)
      } else {
        this.dialogFileVisible = true
      }
    },
    async openAuthorization() {
      const { canceled, workspacePath } = await useWorkspacesAPIs().chooseAuthorizationPath()
      // console.log(canceled)
      // console.log(workspacePath)
      if (canceled) return
      let { isAuthor, msg } = await userAPIs().authorize(workspacePath)
      this.setIsAuthor(isAuthor)
      console.log(msg)
      // await this.openWorkspaceWithPath(workspacePath)
    },
    async openWorkspaceWithPath(workspacePath: string) {
      document.title = workspacePath
      this.isAppRecoveringFromDB = true
      this.setIsAppStarted(true)
      const workspace = await window.apis.initializeWorkspace(workspacePath, false)
      await this.resetWorkspace(workspace)
      const models = modelsDataSource.getAllModelsWithTheirModelBlocks()
      defaultLanguageServer.addModelsForParsing(models)
      this.isAppRecoveringFromDB = false
    },
    async handleAppBeforeQuit() {
      defaultLanguageServer.terminate()
    },
    async login(loginForm: { username: string, password: string, spaceNum: number }) {
      const res = await userAPIs().login(loginForm.username, loginForm.password, loginForm.spaceNum || 0)
      this.setUserInfo(res)
      useIpcRenderer().socketInit()
      this.setLoginMask(false)
    },
    async chooseFile(file: string) {
      this.dialogFileVisible = false
      await this.openWorkspaceWithPath(file)
    },
    closeChooseFileDialog() {
      this.dialogFileVisible = false
    }
  }
})
</script>

<style lang='scss' scoped>
$sideBarBgColor: #273d58;
$primaryColor: #409eff;

#app,
#start-view {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: relative;
}

#app {
  #loading-view {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
    z-index: 10;
  }
  #main-view {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
}
.Authorization {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  div {
    width: 100%;
    text-align: center;
  }
}
#start-view {
  padding: 100px 200px;
  h1 {
    font-size: 260%;
  }
  button {
    text-align: left;
    font-size: 110%;
    margin-left: 20px;
    icon {
      margin-right: 50px;
    }
    margin-left: 0;
  }
  main {
    display: flex;
    flex-flow: row nowrap;
  }
  .start {
    margin-right: 100px;
    display: flex;
    flex-flow: column nowrap;
    margin-bottom: 30px;
  }
}

#sideBar {
  flex-flow: column nowrap;
  background: $sideBarBgColor;
  color: #565f75;
}

#logo {
  height: 100px;
  width: 100%;
  background: $primaryColor;
  margin-bottom: 20px;
  flex: 1 0 %0;
}

#menu {
  // flex: 1 0 %0;
  // border: none;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  po .menu-item-icon {
    margin: 0;
  }

  #setupBox {
    margin-top: auto;
    height: 80px;
    width: 50px;
    color: transparent;
  }
  #changeButton {
    margin-top: auto;
  }
  #changeButton1 {
    margin-top: 0px;
  }

  &:deep(.el-menu-item) {
    display: flex;
    flex-flow: column;
    align-items: center;
    height: auto;
  }

  &:deep(.el-menu-item:hover) {
    background-image: linear-gradient(to right, $primaryColor, $sideBarBgColor);
  }

  &:deep(.el-menu-item.is-active) {
    background-image: linear-gradient(to right, $primaryColor, $sideBarBgColor);
  }
  .menu-item-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    .icon-box {
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-bottom: 20px;
    }
    .menu-item-title-box {
      display: flex;
      align-items: flex-start;
      // word-break: break-all;
      // word-wrap: break-word;
      white-space: normal;
      width: 28px;
      line-height: 20px;
      margin: 20px 0;
      font-style: normal;
      // width: 24px;
      // height: 48px;
      // margin-bottom: 20px;
    }
  }
}
</style>
