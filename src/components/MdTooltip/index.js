import material from 'tele2-material/material'
import MdTooltip from './MdTooltip'

export default Vue => {
  material(Vue)
  Vue.component(MdTooltip.name, MdTooltip)
}
