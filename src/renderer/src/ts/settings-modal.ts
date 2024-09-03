const set_validation_info = (item): void => {
  const validation_info = document.querySelector('#validation-output') as HTMLDivElement
  validation_info.innerHTML = `
<table>
    <tr>
      <td>Account created</td>
      <td>${item.created_at}</td>
    </tr>
    <tr>
      <td>Platform estimate</td>
      <td>${item.platform}</td>
    </tr>
    <tr>
      <td>Aliases</td>
      <td>${item.aliases.length > 0 ? item.aliases.join(', ') : 'None'}</td>
    </tr>
    <tr className="ptac-t-divider"><td></td><td></td></tr>
    <tr>
      <td>Is Banned</td>
      <td>${item.trust_info.is_banned ? 'Yes' : 'No'}</td>
    </tr>
    <tr>
      <td>Is New to DB</td>
      <td>${item.trust_info.is_new_to_db ? 'Yes' : 'No'}</td>
    </tr>
    <tr>
      <td>Was Banned</td>
      <td>${item.trust_info.was_banned ? 'Yes' : 'No'}</td>
    </tr>
    <tr>
      <td>Ban Charges</td>
      <td>${item.trust_info.ban_charges ? item.trust_info.ban_charges.join(', ') : 'None'}</td>
    </tr>
    <tr>
      <td>Is Suspicious</td>
      <td>${item.trust_info.is_suspicious ? 'Yes' : 'No'}</td>
    </tr>
    <tr>
      <td>Is Veteran</td>
      <td>${item.trust_info.is_veteran ? 'Yes' : 'No'}</td>
    </tr>
    <tr>
      <td>Is Admin</td>
      <td>${item.trust_info.is_admin ? 'Yes' : 'No'}</td>
  </table>
  `
}

export const settings_modal_init = (first_run: boolean): void => {
  const settings_modal_overlay = document.querySelector('#settings-modal-overlay') as HTMLElement
  const settings_modal = document.querySelector('#settings-modal') as HTMLElement
  const close_button = document.querySelector('#settings-modal-close-button') as HTMLButtonElement
  const tour_button = document.querySelector('#settings-tour-button') as HTMLButtonElement

  const settings_webhook = document.querySelector('#settings-webhook-url') as HTMLInputElement
  const settings_console = document.querySelector('#settings-console-button') as HTMLButtonElement
  const settings_console_label = document.querySelector(
    '#settings-console-label'
  ) as HTMLLabelElement

  close_button.addEventListener('click', () => {
    settings_modal_overlay.classList.toggle('hidden')
    settings_modal.classList.toggle('hidden')

    if (first_run) {
      settings_console.classList.remove('highlight')
    }
  })

  settings_console.addEventListener('click', () => {
    settings_console.disabled = true
    settings_console.textContent = 'Press any key...'
    window.electron.ipcRenderer.send('change-console-key')
  })

  window.electron.ipcRenderer.send('get-console-key')

  window.electron.ipcRenderer.on('console-key-changed', (_e, args) => {
    settings_console.disabled = false
    settings_console.textContent = 'Set Console Key'
    settings_console_label.textContent = args ? `${args.name} (${args.vKey})` : 'Not Set'

    if (first_run) {
      close_button.disabled = false
      close_button.classList.remove('disabled')
    }
  })

  settings_webhook.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      window.electron.ipcRenderer.send('change-webhook-url', settings_webhook.value)
    }
  })

  tour_button.addEventListener('click', () => {
    window.electron.ipcRenderer.send('run-tour')
    settings_modal_overlay.classList.toggle('hidden')
    settings_modal.classList.toggle('hidden')
  })

  const validate_username = document.querySelector('#validation-username') as HTMLInputElement
  const validate_playfab = document.querySelector('#validation-playfab-id') as HTMLInputElement
  const validate_button = document.querySelector('#validate-button') as HTMLButtonElement
  validate_button.addEventListener('click', () => {
    if (!validate_playfab.value.length) return
    window.electron.ipcRenderer.send('validate-user', {
      player_id: validate_playfab.value,
      username: validate_username.value
    })
  })

  window.electron.ipcRenderer.on('validation-result', (_e, args) => {
    if (args[0]) {
      set_validation_info(args[0])
    }
  })

  if (first_run) {
    close_button.disabled = true
    close_button.classList.add('disabled')

    settings_console.classList.add('highlight')
  }
}
