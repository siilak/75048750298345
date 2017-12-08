import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import { app } from '@/app'

import Home from '@/components/Home'
import Default from '@/components/Default'
import Split from '@/components/Split'
import Portfolio from '@/components/Portfolio'
import Social from '@/components/Social'

Vue.use(Router)
Vue.use(Meta)

var router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      name: 'default',
      path: '*',
      component: Default
    },
    {
      name: 'split',
      path: '/mis-on-smart/*',
      component: Split
    },
    {
      name: 'split',
      path: '/dooh',
      component: Split
    },
    {
      name: 'social',
      path: '/dooh/*',
      component: Social
    },
    {
      name: 'portfolio',
      path: '/portfolio/*',
      component: Portfolio
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (app) {
    app.$store.dispatch('loading', true)
  }
  next()
})

export default router
