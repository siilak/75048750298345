import material from 'tele2-material/material'
import MdDivider from './MdDivider'

export default Vue => {
  material(Vue)
  Vue.component(MdDivider.name, MdDivider)
}
