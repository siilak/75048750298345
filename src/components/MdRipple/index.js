import material from 'tele2-material/material'
import MdRipple from './MdRipple'

export default Vue => {
  material(Vue)
  Vue.component(MdRipple.name, MdRipple)
}
