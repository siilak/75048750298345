import material from 'tele2-material/material'
import MdCheckbox from './MdCheckbox'

export default Vue => {
  material(Vue)
  Vue.component(MdCheckbox.name, MdCheckbox)
}
