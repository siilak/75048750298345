import 'regenerator-runtime/runtime'
import Vue from 'vue'
import Tele2Material from 'src/material'

Vue.config.productionTip = false
Vue.config.devtools = false
Vue.use(Tele2Material)

Vue.component('transition', {
  abstract: true,
  render (createElement) {
    const defaultSlot = this.$slots.default

    if (defaultSlot) {
      return defaultSlot[0] && defaultSlot[0]
    }
  }
})

function createAppEl () {
  const app = document.createElement('div')

  app.id = 'app'

  document.body.appendChild(app)
}

createAppEl()

process.on('unhandledRejection', () => {})
