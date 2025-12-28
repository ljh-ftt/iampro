<template>
  <div class="home-container">
    <van-nav-bar title="首页" @click-left="onLogout">
      <template #left>
        <van-button type="default" size="small" text>退出</van-button>
      </template>
    </van-nav-bar>
    
    <div class="user-info">
      <van-cell-group>
        <van-cell title="姓名" :value="user?.name" />
        <van-cell title="部门" :value="user?.department_name" />
        <van-cell title="岗位" :value="user?.position_name" />
        <van-cell title="手机号" :value="user?.phone" />
        <van-cell title="修改密码" is-link @click="showChangePasswordDialog = true" />
      </van-cell-group>
    </div>
    
    <div class="function-grid">
      <!-- 普通员工功能 -->
      <van-grid :column-num="2" :border="false">
        <van-grid-item icon="warning-o" text="设备报修" @click="$router.push('/repair-request')" />
        <van-grid-item icon="gift-o" text="物资申领" @click="$router.push('/material-request')" />
      </van-grid>
      
      <!-- 维修人员功能 -->
      <van-grid v-if="hasRole(['repairman'])" :column-num="2" :border="false">
        <van-grid-item icon="orders-o" text="派工单" @click="$router.push('/repair-list')" />
      </van-grid>
      
      <!-- 物资管理员功能 -->
      <van-grid v-if="hasRole(['material_admin'])" :column-num="2" :border="false">
        <van-grid-item icon="shopping-cart-o" text="物资管理" @click="$router.push('/material-management')" />
      </van-grid>
      
      <!-- 超级管理员功能 -->
      <van-grid v-if="hasRole(['super_admin'])" :column-num="2" :border="false">
        <van-grid-item icon="manager" text="员工管理" @click="$router.push('/employee-management')" />
        <van-grid-item icon="setting-o" text="设备管理" @click="$router.push('/equipment-management')" />
        <van-grid-item icon="shopping-cart-o" text="物资管理" @click="$router.push('/material-management')" />
      </van-grid>
    </div>
    
    <!-- 底部背景图片区域 -->
    <div class="background-image-container">
    </div>

    <!-- 修改密码对话框 -->
    <van-popup v-model="showChangePasswordDialog" position="bottom" :style="{ height: '80%' }">
      <div class="dialog-header">
        <h3>修改密码</h3>
        <van-icon name="cross" size="24" @click="showChangePasswordDialog = false" />
      </div>
      <van-form @submit="onChangePassword" class="password-form">
        <van-field
          v-model="passwordForm.currentPassword"
          type="password"
          label="当前密码"
          placeholder="请输入当前密码"
          required
          :rules="[{ required: true, message: '请输入当前密码' }]"
        />
        <van-field
          v-model="passwordForm.newPassword"
          type="password"
          label="新密码"
          placeholder="请输入新密码"
          required
          :rules="[{ required: true, message: '请输入新密码' }]"
        />
        <van-field
          v-model="passwordForm.confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入新密码"
          required
          :rules="[{ required: true, message: '请再次输入新密码' }]"
        />
        <div class="form-actions">
          <van-button type="default" @click="showChangePasswordDialog = false" style="margin-right: 10px;">取消</van-button>
          <van-button type="primary" native-type="submit" :loading="changingPassword">确认修改</van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Toast, Dialog, Popup, Form, Field, Button, Icon } from 'vant'

export default {
  name: 'Home',
  components: {
    Popup,
    Form,
    Field,
    Button,
    Icon
  },
  data() {
    return {
      showChangePasswordDialog: false,
      changingPassword: false,
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'userRole']),
    user() {
      return this.currentUser
    }
  },
  methods: {
    hasRole(roles) {
      return roles.includes(this.userRole)
    },
    onLogout() {
      Dialog.confirm('确定要退出登录吗？')
        .then(() => {
          this.$store.dispatch('logout')
          this.$router.push('/login')
          Toast.success('已退出登录')
        })
        .catch(() => {
          // 取消退出
        })
    },
    onChangePassword() {
      // 验证两次输入的密码是否一致
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        Toast.fail('两次输入的密码不一致')
        return
      }

      this.changingPassword = true
      
      // 调用修改密码API
      this.$axios.post('/api/auth/change-password', {
        currentPassword: this.passwordForm.currentPassword,
        newPassword: this.passwordForm.newPassword
      })
      .then(() => {
        Toast.success('密码修改成功')
        this.showChangePasswordDialog = false
        // 清空表单
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      })
      .catch(error => {
        Toast.fail(error.response?.data?.message || '密码修改失败')
      })
      .finally(() => {
        this.changingPassword = false
      })
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.user-info {
  background-color: rgba(255, 255, 255, 0.8);
  margin: 10px 0;
  padding: 0 15px;
}

.function-grid {
  background-color: rgba(255, 255, 255, 0.8);
  margin: 10px 0;
  padding: 15px;
}

/* 底部背景图片容器样式 */
.background-image-container {
  width: 100%;
  height: 500px; /* 可以根据需要调整高度 */
  background-image: url('../assets/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  margin-top: 20px;
}

/* 修改密码对话框样式 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.password-form {
  padding: 16px;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .background-image-container {
    height: 200px;
  }
}

@media screen and (max-width: 480px) {
  .background-image-container {
    height: 150px;
  }
}
</style>
