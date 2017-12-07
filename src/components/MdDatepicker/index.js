import material from 'tele2-material/material'
import MdDatepicker from './MdDatepicker'

export default Vue => {
  material(Vue)
  Vue.component(MdDatepicker.name, MdDatepicker)
}