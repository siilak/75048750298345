import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import { app } from '@/app'

import PwHome from '@/components/PwHome'
import PwManage from '@/components/PwManage'
import PwDefault from '@/components/PwDefault'
import UserRegister from '@/components/user-register'

Vue.use(Router)
Vue.use(Meta)

var router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: PwHome
    },
    {
      path: '/manage',
      name: 'manage',
      component: PwManage
    },
    {
      path: '/register',
      name: 'user-register',
      component: UserRegister
    },
    {
      name: 'default',
      path: '*',
      component: PwDefault
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (app) {
    app.$store.dispatch('loading', true)
  }
  next()
})

router.afterEach((to, from) => {
  if (app) {
    // console.log('afterEach')
    app.$store.dispatch('loading', false)
  }
})

export default router

