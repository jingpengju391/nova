<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-title">
        <img src="../../../assets/images/logo.png" />
        <span>深轻飞燕</span>
      </div>
      <el-form
        ref="loginRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="120px"
        label-position="top"
      >
        <el-form-item label="用户名:" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            maxlength="inputNameLength"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码:" prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
            maxlength="inputNameLength"
          ></el-input>
        </el-form-item>
        <el-form-item label="工作区编号:" prop="spaceNum">
          <el-input
            type="number"
            v-model="loginForm.spaceNum"
            maxlength="inputNameLength"
            placeholder="请输入工作区编号，默认为0"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="login-text">
        <a href="https://baidu.com" target="_blank">忘记密码</a>
      </div>
      <div class="login-tip">
        登录即表明您同意
        <a href="https://baidu.com" target="_blank">《xxx》</a>
      </div>
      <el-button class="login-btn" type="primary" @click="submitForm(loginRef)"
        >登录</el-button
      >
    </div>
  </div>
</template>
<script lang="ts" setup name="Login">
import { reactive, ref } from 'vue'
import type { ElForm } from 'element-plus'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
type FormInstance = InstanceType<typeof ElForm>
const emit = defineEmits(['login'])

const loginRef = ref<FormInstance>()
const loginForm = reactive({
  username: 'myname',
  password: 'mypass',
  spaceNum: 0
})
const loginRules = reactive({
  username: [{
    required: true,
    message: '用户名不能为空',
    trigger: 'blur'
  }],
  password: [{
    required: true,
    message: '密码不能为空',
    trigger: 'blur'
  }]
})
const submitForm = (formEl: FormInstance | undefined) => {
  formEl.validate((valid) => {
    if (valid) {
      emit('login', loginForm)
    }
  })
}
</script>
<style lang="scss" scoped>
.login-wrap {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  background: url(../../../assets/images/background.jpg) no-repeat;
  background-size: cover;
}
.login-card {
  width: 400px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.1);
  background: #fff;
  border-radius: 10px;
  padding: 40px 30px 30px;
}
.login-title {
  margin-bottom: 20px;
  font-size: 30px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 40px;
    margin-right: 10px;
  }
}
.login-text {
  text-align: right;
  line-height: 30px;
  a:hover {
    text-decoration: underline;
  }
}
.login-tip {
  line-height: 30px;
  color: #666;
  a:hover {
    text-decoration: underline;
  }
}
.login-btn {
  width: 100%;
  margin-top: 30px;
}
</style>
