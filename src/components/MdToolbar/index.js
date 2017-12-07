import material from 'tele2-material/material'
import MdToolbar from './MdToolbar'

export default Vue => {
  material(Vue)
  Vue.component(MdToolbar.name, MdToolbar)
}
