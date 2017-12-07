import material from 'tele2-material/material'
import MdSubheader from './MdSubheader'

export default Vue => {
  material(Vue)
  Vue.component(MdSubheader.name, MdSubheader)
}
