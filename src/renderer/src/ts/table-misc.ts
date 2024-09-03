import { GetElementsByID } from '../util'

const elements = GetElementsByID([
  'settings-button',
  'message-input',
  'message-send-button',
  'message-dropdown',
  'message-dropdown-text',
  'message-dropdown-items',
  'unban-input',
  'unban-button'
])

export const table_misc_init = (): void => {
  const settings_button = elements['settings-button'] as HTMLButtonElement
  settings_button.addEventListener('click', () => {
    const settings_modal_overlay = document.querySelector('#settings-modal-overlay') as HTMLElement
    const settings_modal = document.querySelector('#settings-modal') as HTMLElement

    settings_modal_overlay.classList.toggle('hidden')
    settings_modal.classList.toggle('hidden')
  })

  const message_dropdown = elements['message-dropdown'] as HTMLDivElement
  message_dropdown.addEventListener('click', () => {
    message_dropdown.classList.toggle('active')
  })

  const message_dropdown_items = elements['message-dropdown-items'] as HTMLDivElement
  const message_dropdown_text = elements['message-dropdown-text'] as HTMLDivElement
  message_dropdown_items.addEventListener('click', (event) => {
    const target = event.target as HTMLDivElement
    let text = target.textContent
    if (text !== 'Admin' && text !== 'Server') {
      text = message_dropdown_text.textContent
    }
    message_dropdown_text.textContent = text
  })

  const message_input = elements['message-input'] as HTMLInputElement
  const message_send_button = elements['message-send-button'] as HTMLButtonElement
  message_send_button.addEventListener('click', () => {
    const message = message_input.value
    if (!message) return

    const type = message_dropdown_text.textContent
    const command = `${type?.toLowerCase()}say "${message}"`
    window.electron.ipcRenderer.send('command', command)
    message_input.value = ''
  })

  const unban_input = elements['unban-input'] as HTMLInputElement
  const unban_button = elements['unban-button'] as HTMLButtonElement
  unban_button.addEventListener('click', () => {
    const unban = unban_input.value
    if (!unban) return

    window.electron.ipcRenderer.send('command', `unbanbyid ${unban}`)
    unban_input.value = ''
  })
}
