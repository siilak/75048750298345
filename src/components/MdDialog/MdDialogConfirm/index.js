import material from 'tele2-material/material'
import MdDialog from '../MdDialog'
import MdDialogConfirm from './MdDialogConfirm'

export default Vue => {
  material(Vue)
  Vue.component(MdDialog.name, MdDialog)
  Vue.component(MdDialogConfirm.name, MdDialogConfirm)
}
