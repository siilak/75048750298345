import material from 'tele2-material/material'
import MdImage from './MdImage'

export default Vue => {
  material(Vue)
  Vue.component(MdImage.name, MdImage)
}
