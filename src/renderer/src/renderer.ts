import { TourGuideClient } from '@sjmc11/tourguidejs/src/Tour'
import { local_ban_modal_init } from './ts/local-ban-modal'
import { settings_modal_init } from './ts/settings-modal'
import { table_controls_init } from './ts/table-controls'
import { table_misc_init } from './ts/table-misc'
import '@sjmc11/tourguidejs/src/scss/tour.scss'
import { global_init } from './ts/global'
import { table_init } from './ts/table'

function init(first_run: boolean): void {
  local_ban_modal_init()
  settings_modal_init(first_run)
  table_controls_init()
  table_misc_init()
  global_init()
  table_init()

  const tour = new TourGuideClient({
    showStepDots: false,
    showStepProgress: false,
    progressBar: 'rgb(74, 114, 255)',
    closeButton: false,
    dialogWidth: 500,
    dialogMaxWidth: 500,
    dialogZ: 9999999
  })

  // if (first_run) {
  //   tour.start()

  //   const tour_complete_handler = (): void => {
  //     console.log('Tour complete!!!')
  //     const settings_modal = document.querySelector('#settings-modal')
  //     const settings_modal_overlay = document.querySelector('#settings-modal-overlay')
  //     if (settings_modal && settings_modal_overlay) {
  //       settings_modal.classList.remove('hidden')
  //       settings_modal.classList.add('first-run')
  //       settings_modal_overlay.classList.remove('hidden')
  //     }
  //   }

  //   tour.onFinish(tour_complete_handler)
  //   tour.onAfterExit(tour_complete_handler)
  // }

  setTimeout(() => {
    const tg_dialog = document.querySelector('.tg-dialog')
    if (tg_dialog) {
      tg_dialog.classList.add('custom-tour')
    }
  }, 1)

  window.electron.ipcRenderer.on('run-tour', () => {
    tour.start()
  })
}

init(false)
// window.electron.ipcRenderer.on('auth-complete', (_, first_run) => {
//   init(first_run)
//   document.body.classList.remove('pre-init')
// })

// window.electron.ipcRenderer.on('visibility-change', () => { 
//   if (document.body.style.display) {
//     document.body.style.display = 'block'
//   } else {
//     document.body.style.display = 'none'
//   }
// })