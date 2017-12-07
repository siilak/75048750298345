import material from 'tele2-material/material'
import MdContent from './MdContent'

export default Vue => {
  material(Vue)
  Vue.component(MdContent.name, MdContent)
}
