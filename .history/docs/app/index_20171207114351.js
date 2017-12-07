/* Third Party */
import 'regenerator-runtime/runtime'
import Vue from 'vue'
import ga from 'vue-ga'
import { sync } from 'vuex-router-sync'
import Tele2Material from 'tele2-material'

/* App */
import App from './App'
import { i18n, router } from './config'
import store from './store'
import './components'

Vue.config.productionTip = false
Vue.use(Tele2Material)

sync(store, router)

document.addEventListener('DOMContentLoaded', () => {
  const app = new Vue({
    name: 'Root',
    router,
    store,
    i18n,
    render: mount => mount(App)
  })

  router.onReady(() => {
    app.$mount('#docs')
  })
})
