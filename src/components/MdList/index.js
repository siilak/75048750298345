import material from 'tele2-material/material'
import MdList from './MdList'
import MdListItem from './MdListItem/MdListItem.vue'

export default Vue => {
  material(Vue)
  Vue.component(MdList.name, MdList)
  Vue.component(MdListItem.name, MdListItem)
}
