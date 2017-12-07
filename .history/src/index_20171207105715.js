import 'regenerator-runtime/runtime'
import material from './material'
import * as MdComponents from './components'

let Tele2Material = Vue => {
  material(Vue)

  Object.values(MdComponents).forEach((MdComponent) => {
    Vue.use(MdComponent)
  })
}

Tele2Material.version = '__VERSION__'

export default Tele2Material
