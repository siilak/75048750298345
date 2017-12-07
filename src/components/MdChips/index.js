import material from 'tele2-material/material'
import MdChips from './MdChips'
import MdChip from './MdChip'

export default Vue => {
  material(Vue)
  Vue.component(MdChips.name, MdChips)
  Vue.component(MdChip.name, MdChip)
}
