import material from 'tele2-material/material'
import MdEmptyState from './MdEmptyState'

export default Vue => {
  material(Vue)
  Vue.component(MdEmptyState.name, MdEmptyState)
}