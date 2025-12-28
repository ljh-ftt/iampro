<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <h2 class="login-title">设施设备物资信息管理平台</h2>
      <van-form @submit="onLogin">
        <van-field
          v-model="phone"
          name="phone"
          placeholder="请输入手机号"
          label="手机号"
          required
          :rules="[{ required: true, message: '请输入手机号' }]"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          placeholder="请输入密码"
          label="密码"
          required
          :rules="[{ required: true, message: '请输入密码' }]"
        />
        <div style="margin: 24px;">
          <van-button type="primary" block native-type="submit" :loading="loading">
            登录
          </van-button>
        </div>
      </van-form>
    </div>
    
    <!-- 作者信息 -->
    <div class="author-info">
      <p class="author-text">© 2025 浙江海港义乌枢纽有限公司 工程技术与信息管理部 版权所有</p>
    </div>
  </div>
</template>

<script>
import { login } from '../api/auth'
import { Toast } from 'vant'

export default {
  name: 'Login',
  data() {
    return {
      phone: '',
      password: '',
      loading: false
    }
  },
  methods: {
    async onLogin(values) {
      try {
        this.loading = true
        const response = await login(this.phone, this.password)
        
        // 保存登录信息
        this.$store.dispatch('login', {
          token: response.data.token,
          user: response.data.user
        })
        
        Toast.success('登录成功')
        this.$router.push('/home')
      } catch (error) {
        console.error(error)
        Toast.fail(error.response?.data?.message || '登录失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  background-image: url('../assets/login_background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-form-wrapper {
  width: 90%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
  font-size: 24px;
}

/* 作者信息样式 */
.author-info {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
}

.author-text {
  color: #999;
  font-size: 12px;
}
</style>
