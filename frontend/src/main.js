import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Vant from 'vant'
import 'vant/lib/index.css'

// 配置axios
axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || '/api'

// 请求拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
axios.interceptors.response.use(response => {
  return response
}, error => {
  if (error.response && error.response.status === 401) {
    // 未授权，清除token并跳转到登录页
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }
  return Promise.reject(error)
})

// 注册插件
Vue.use(VueAxios, axios)
Vue.use(Vant)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
