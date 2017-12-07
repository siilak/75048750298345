import material from 'tele2-material/material'
import MdAvatar from './MdAvatar'

export default Vue => {
  material(Vue)
  Vue.component(MdAvatar.name, MdAvatar)
}
