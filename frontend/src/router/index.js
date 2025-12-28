import Vue from 'vue'
import VueRouter from 'vue-router'
import { Notify } from 'vant'

Vue.use(VueRouter)

// 路由懒加载
const Login = () => import('../views/Login.vue')
const Home = () => import('../views/Home.vue')
const RepairRequest = () => import('../views/RepairRequest.vue')
const RepairList = () => import('../views/RepairList.vue')
const MaterialRequest = () => import('../views/MaterialRequest.vue')
const MaterialManagement = () => import('../views/MaterialManagement.vue')
const EmployeeManagement = () => import('../views/EmployeeManagement.vue')
const EquipmentManagement = () => import('../views/EquipmentManagement.vue')

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/repair-request',
    name: 'repairRequest',
    component: RepairRequest,
    meta: {
      requiresAuth: true,
      roles: ['employee', 'repairman', 'super_admin', 'material_admin']
    }
  },
  {
    path: '/repair-list',
    name: 'repairList',
    component: RepairList,
    meta: {
      requiresAuth: true,
      roles: ['repairman', 'super_admin']
    }
  },
  {
    path: '/material-request',
    name: 'materialRequest',
    component: MaterialRequest,
    meta: {
      requiresAuth: true,
      roles: ['employee', 'super_admin', 'material_admin', 'repairman']
    }
  },
  {
    path: '/material-management',
    name: 'materialManagement',
    component: MaterialManagement,
    meta: {
      requiresAuth: true,
      roles: ['material_admin', 'super_admin']
    }
  },
  {
    path: '/employee-management',
    name: 'employeeManagement',
    component: EmployeeManagement,
    meta: {
      requiresAuth: true,
      roles: ['super_admin']
    }
  },
  {
    path: '/equipment-management',
    name: 'equipmentManagement',
    component: EquipmentManagement,
    meta: {
      requiresAuth: true,
      roles: ['super_admin']
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const isLoggedIn = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user'))
    
    if (!isLoggedIn) {
      Notify('请先登录')
      next({ path: '/login' })
    } else {
      // 检查角色权限
      if (to.meta.roles) {
        if (to.meta.roles.includes(user.role)) {
          next()
        } else {
          Notify('没有权限访问该页面')
          next({ path: '/home' })
        }
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router
