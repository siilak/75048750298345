import material from 'tele2-material/material'
import MdDrawer from './MdDrawer'

export default Vue => {
  material(Vue)
  Vue.component(MdDrawer.name, MdDrawer)
}
