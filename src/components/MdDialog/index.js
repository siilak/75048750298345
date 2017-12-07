import material from 'tele2-material/material'
import MdDialog from './MdDialog'
import MdDialogTitle from './MdDialogTitle'
import MdDialogContent from './MdDialogContent'
import MdDialogActions from './MdDialogActions'

export default Vue => {
  material(Vue)
  Vue.component(MdDialog.name, MdDialog)
  Vue.component(MdDialogTitle.name, MdDialogTitle)
  Vue.component(MdDialogContent.name, MdDialogContent)
  Vue.component(MdDialogActions.name, MdDialogActions)
}
