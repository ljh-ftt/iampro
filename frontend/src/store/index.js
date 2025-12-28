import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    isLoggedIn: !!localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null')
  },
  mutations: {
    setLoggedIn(state, isLoggedIn) {
      state.isLoggedIn = isLoggedIn
    },
    setUser(state, user) {
      state.user = user
    },
    logout(state) {
      state.isLoggedIn = false
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
  actions: {
    login({ commit }, { token, user }) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      commit('setLoggedIn', true)
      commit('setUser', user)
    },
    logout({ commit }) {
      commit('logout')
    },
    checkAuth({ commit }) {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (token && user) {
        commit('setLoggedIn', true)
        commit('setUser', JSON.parse(user))
      } else {
        commit('logout')
      }
    }
  },
  getters: {
    isLoggedIn: state => state.isLoggedIn,
    currentUser: state => state.user,
    userRole: state => state.user ? state.user.role : null
  }
})

export default store
