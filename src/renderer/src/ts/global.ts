import { set_table_is_loading } from './table'

const table_body = document.querySelector('#table #body') as HTMLDivElement
const header_checkbox = document.querySelector(
  '#table #header #name .custom-checkbox-container .custom-checkbox'
) as HTMLInputElement

interface PlayerInfo {
  created_at: string
  platform: string
  aliases: string[]
  trust_info: {
    is_admin: boolean
    is_banned: boolean
    is_new_to_db: boolean
    is_suspicious: boolean
    is_veteran: boolean
    was_banned: boolean
    ban_charges: string[] | null
  }
}

interface PlayerData extends PlayerInfo {
  player_name: string
  player_id: string
}

export const get_ban_message = (): string => {
  const punish_reason = document.querySelector('#punish-reason') as HTMLInputElement
  return punish_reason.value
}

export const get_ban_duration = (): string => {
  const punish_duration = document.querySelector('#punish-duration-slider') as HTMLInputElement
  return punish_duration.value
}

export const get_player_data = (target: HTMLDivElement): PlayerData => {
  const name = target.querySelector('.display-name-text') as HTMLParagraphElement
  const playfab = target.querySelector('.playfab-body') as HTMLDivElement

  const extra_content = target.querySelector('.table-additional-content') as HTMLDivElement
  const table = extra_content.querySelector('table') as HTMLTableElement
  const rows = table.querySelectorAll('tr')

  const created_at = rows[0].querySelector('td:nth-child(2)') as HTMLTableDataCellElement
  const platform = rows[1].querySelector('td:nth-child(2)') as HTMLTableDataCellElement
  const aliases = rows[2].querySelector('td:nth-child(2)') as HTMLTableDataCellElement

  const is_banned = rows[4].querySelector('td:nth-child(2)') as HTMLTableDataCellElement
  const is_new_to_db = rows[5].querySelector('td:nth-child(2)') as HTMLTableDataCellElement
  const was_banned = rows[6].querySelector('td:nth-child(2)') as HTMLTableDataCellElement
  const ban_charges = rows[7].querySelector('td:nth-child(2)') as HTMLTableDataCellElement
  const is_suspicious = rows[8].querySelector('td:nth-child(2)') as HTMLTableDataCellElement
  const is_veteran = rows[9].querySelector('td:nth-child(2)') as HTMLTableDataCellElement
  const is_admin = rows[10].querySelector('td:nth-child(2)') as HTMLTableDataCellElement

  return {
    player_name: name.textContent as string,
    player_id: playfab.textContent as string,
    created_at: created_at.textContent as string,
    platform: platform.textContent as string,
    aliases: aliases.textContent?.split(', ') ?? [],
    trust_info: {
      is_banned: is_banned.textContent === 'Yes',
      is_new_to_db: is_new_to_db.textContent === 'Yes',
      was_banned: was_banned.textContent === 'Yes',
      ban_charges: ban_charges.textContent?.split(', ') ?? null,
      is_suspicious: is_suspicious.textContent === 'Yes',
      is_veteran: is_veteran.textContent === 'Yes',
      is_admin: is_admin.textContent === 'Yes'
    }
  }
}

let current_ban_target: HTMLDivElement | null = null
export const create_table_entry = (
  player_name: string,
  player_id: string,
  item: PlayerInfo
): void => {
  const table_item = document.createElement('div')
  table_item.classList.add('row')
  table_item.classList.add('table-item')

  const row_content = document.createElement('div')
  row_content.classList.add('row-content')
  table_item.appendChild(row_content)

  const name_row = document.createElement('div')
  name_row.classList.add('col')
  name_row.classList.add('row-name')
  row_content.appendChild(name_row)
  name_row.innerHTML = `
  <label class="custom-checkbox-container">
  <input type="checkbox" class="custom-checkbox">
  <span class="custom-checkbox-icon"></span>
  </label>`

  const name = document.createElement('div')
  name.classList.add('display-name-container')
  name.innerHTML = `<p class="display-name-text">
    ${player_name}
    </p>
    <div class="badges">
        ${item.trust_info.is_admin ? '<span class="badge admin"></span>' : ''}
        ${item.trust_info.is_veteran ? '<span class="badge veteran"></span>' : ''}
        ${item.trust_info.is_suspicious || item.trust_info.was_banned ? '<span class="badge suspicious"></span>' : ''}
    </div>`
  name_row.appendChild(name)

  const playfab_container = document.createElement('div')
  playfab_container.classList.add('col')
  playfab_container.classList.add('playfab-body')
  playfab_container.innerHTML = `<p class="playfab-text">${player_id}</p>`
  row_content.appendChild(playfab_container)

  const actions_container = document.createElement('div')
  actions_container.classList.add('col')
  actions_container.classList.add('actions')
  actions_container.innerHTML = `
  <button class="table-ban-button">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" class="ban-icon">
      <path fill="#D16767" d="M8.99996.666672C13.5833.666672 17.3333 4.41667 17.3333 9c0 4.5833-3.75 8.3333-8.33334 8.3333-4.58333 0-8.333334-3.75-8.333334-8.3333 0-4.58333 3.750004-8.333328 8.333334-8.333328Zm0 1.666668c-1.58333 0-3 .5-4.08333 1.41666L14.25 13.0833C15.0833 11.9167 15.6666 10.5 15.6666 9c0-3.66666-3-6.66666-6.66664-6.66666ZM13.0833 14.25 3.74996 4.91667C2.83329 6 2.33329 7.41667 2.33329 9c0 3.6667 3 6.6667 6.66667 6.6667 1.58334 0 3.00004-.5 4.08334-1.4167Z" />
    </svg>
  </button>
  <button class="table-kick-button">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" class="kick-icon">
      <path fill="#D16767" d="M14.5 1.66666 7.66667 7.24999l-1.00834-.86666 3.00834-1.73334-3.825-3.816662-1.175 1.175002L6.95 4.29166 2.16667 7.04999 1.175 10.625l2.05 3.5417 1.44167-.8334L2.975 10.4167l.29167-1.10004 2.65 1.51664.41666 7.5H8l.41667-8.33331L15.5 2.83333l-1-1.16667Zm-12.33333.83333c.44202 0 .86595.1756 1.17851.48816.31256.31256.48815.73648.48815 1.17851 0 .44203-.17559.86595-.48815 1.17851-.31256.31256-.73649.48816-1.17851.48816C1.24167 5.83333.5 5.09166.5 4.16666s.75-1.66667 1.66667-1.66667Z" />
    </svg>
  </button>`
  row_content.appendChild(actions_container)

  const extra_content = document.createElement('div')
  extra_content.classList.add('table-additional-content')
  extra_content.classList.add('hide')
  extra_content.innerHTML = `
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
    </tr>
  </table>
  `
  table_item.appendChild(extra_content)
  table_body.appendChild(table_item)

  row_content.addEventListener('click', () => {
    const extra_content = table_item.querySelector('.table-additional-content') as HTMLDivElement
    extra_content.classList.toggle('hide')
    extra_content.classList.toggle('show')
  })

  const checkbox = name_row.querySelector('.custom-checkbox-container') as HTMLInputElement
  checkbox.addEventListener('click', (event) => {
    event.stopImmediatePropagation()
    event.stopPropagation()

    const checked_entries = get_checked_entries()
    const table_entries = get_table_entries()

    if (checked_entries.length < table_entries.length) {
      header_checkbox.checked = false
    }

    if (checked_entries.length === table_entries.length) {
      header_checkbox.checked = true
    }
  })

  const kick_button = actions_container.querySelector('.table-kick-button') as HTMLButtonElement
  const ban_button = actions_container.querySelector('.table-ban-button') as HTMLButtonElement

  let tooltip_timeout
  kick_button.addEventListener('click', (event) => {
    event.stopPropagation()

    const ban_message = get_ban_message()
    const checked_entries = get_checked_entries()
    if (checked_entries.length > 1) {
      checked_entries.forEach((entry) => {
        const playfab_text = entry.querySelector('.playfab-body') as HTMLDivElement
        window.electron.ipcRenderer.send(
          'command',
          `kickbyid ${playfab_text.innerText} "${ban_message}"`
        )
      })
    } else {
      window.electron.ipcRenderer.send('command', `kickbyid ${player_id} "${ban_message}"`)
    }
  })

  const ban_tooltip = document.querySelector('#ban-tooltip') as HTMLDivElement

  ban_button.addEventListener('click', (event) => {
    event.stopPropagation()

    current_ban_target = table_item
    if (tooltip_timeout) {
      clearTimeout(tooltip_timeout)
    }

    const rect = ban_button.getBoundingClientRect()
    ban_tooltip.style.left = `${rect.left - 152}px`
    ban_tooltip.style.top = `${rect.top + 30}px`
    ban_tooltip.classList.remove('hide')

    tooltip_timeout = setTimeout(() => {
      ban_tooltip.classList.add('hide')
    }, 3000)
  })

  const name_text = name.querySelector('.display-name-text') as HTMLParagraphElement
  name_text.addEventListener('click', (event) => {
    event.stopPropagation()
    const range = document.createRange()
    range.selectNode(name_text)
    window.getSelection()?.removeAllRanges()
    window.getSelection()?.addRange(range)
  })

  const playfab_text = playfab_container.querySelector('.playfab-text') as HTMLParagraphElement
  playfab_text.addEventListener('click', (event) => {
    event.stopPropagation()
    const range = document.createRange()
    range.selectNode(playfab_text)
    window.getSelection()?.removeAllRanges()
    window.getSelection()?.addRange(range)
  })
}

export const clear_table = (): void => {
  table_body.innerHTML = `
    <div id="table-loading">
      <div id="table-loading-spinner"></div>
    </div>`
}

export const get_table_entries = (): HTMLDivElement[] => {
  return Array.from(document.querySelectorAll('.table-item'))
}

export const toggle_all_checkboxes = (checked: boolean): void => {
  const checkboxes = document.querySelectorAll('.custom-checkbox') as NodeListOf<HTMLInputElement>
  checkboxes.forEach((checkbox) => {
    if (checkbox === header_checkbox) return
    checkbox.checked = checked
  })
}

export const get_checked_entries = (): HTMLDivElement[] => {
  const arr = Array.from(document.querySelectorAll('.custom-checkbox:checked')).map(
    (checkbox) => checkbox.closest('.table-item') as HTMLDivElement
  )
  return arr.filter((entry) => entry !== null)
}

export const set_player_count = (count: number): void => {
  const player_count = document.querySelector('#player-count') as HTMLParagraphElement
  player_count.textContent = `Players (${count})`
}

export const get_ban_charges = (): { ident: string; time: number; max_time: number }[] => {
  const tags = document.querySelectorAll('.tagify__tag') as NodeListOf<HTMLElement>
  if (tags.length === 0) {
    return []
  }

  return [...tags].map((tag) => {
    return {
      ident: tag.attributes['ident'].value as string,
      time: tag.attributes['time'].value as number,
      max_time: tag.attributes['max_time'] as number
    }
  })
}

export const global_init = (): void => {
  // for (let i = 0; i < 10; i++) {
  //   const is_banned = !!Math.round(Math.random())
  //   const is_admin = !!Math.round(Math.random())
  //   create_table_entry('test', 'test', {
  //     aliases: ['test1', 'test2'],
  //     created_at: '2021-09-01',
  //     platform: 'PC',
  //     trust_info: {
  //       is_banned: is_banned,
  //       is_new_to_db: !!Math.round(Math.random()),
  //       was_banned: is_banned,
  //       ban_charges: is_banned ? ['cheating', 'ffa'] : null,
  //       is_admin: is_admin,
  //       is_suspicious: is_admin ? false : !!Math.round(Math.random()),
  //       is_veteran: !!Math.round(Math.random())
  //     }
  //   })
  // }

  window.electron.ipcRenderer.on('player-data', (_, data) => {
    clear_table()
    set_player_count(data.length)
    data.forEach((item) => {
      create_table_entry(item.display_name, item.playfab_id, {
        aliases: item.aliases,
        created_at: item.created_at,
        platform: item.platform,
        trust_info: item.trust_info
      })
    })
    set_table_is_loading(false)
  })

  const ban_tooltip = document.querySelector('#ban-tooltip') as HTMLDivElement
  const local_ban_button = document.querySelector('#local-ban-button') as HTMLButtonElement
  const global_ban_button = document.querySelector('#global-ban-button') as HTMLButtonElement

  global_ban_button.addEventListener('click', (event) => {
    event.stopPropagation()
    ban_tooltip.classList.add('hide')

    const ban_charges = get_ban_charges()
    if (ban_charges.length === 0) {
      return
    }

    const selected_entries = get_checked_entries()

    const ban_duration = get_ban_duration()
    let playfab_ids: string[] = []

    if (selected_entries.length > 0) {
      playfab_ids = selected_entries.map((entry) => {
        const player_data = get_player_data(entry)
        return player_data.player_id
      })
    } else if (current_ban_target) {
      playfab_ids = [get_player_data(current_ban_target).player_id]
    }

    window.electron.ipcRenderer.send('ban-players', {
      playfab_ids,
      ban_duration,
      ban_charges: [...ban_charges.map((charge) => charge.ident)]
    })
  })

  window.electron.ipcRenderer.on('ban-players-result', (_, args) => {
    const command = args.data.ban_command
    console.log(args)
    if (command) {
      window.electron.ipcRenderer.send('command', command)
    }
  })

  const local_ban_modal = document.querySelector('#local-ban-modal') as HTMLDivElement
  local_ban_button.addEventListener('click', (event) => {
    event.stopPropagation()
    ban_tooltip.classList.add('hide')
    local_ban_modal.classList.remove('hide')
  })

  const local_ban_reason = document.querySelector('#local-ban-reason') as HTMLInputElement
  const local_ban_duration = document.querySelector('#local-ban-duration') as HTMLInputElement
  const local_ban_submit = document.querySelector('#local-ban-submit') as HTMLButtonElement

  local_ban_submit.addEventListener('click', () => {
    let reason = local_ban_reason.value
    const duration = Number(local_ban_duration.value)

    if (isNaN(duration) || duration < 0 || duration > 999999) {
      return
    }

    if (reason.length === 0) {
      reason = `Banned for ${duration} hours`
    }

    const selected_entries = get_checked_entries()

    const commands: string[] = []
    if (selected_entries.length > 0) {
      const player_data = selected_entries.map((entry) => get_player_data(entry))
      player_data.forEach((player) => {
        commands.push(`banbyid ${player.player_id} ${duration} "${reason}"`)
      })
    } else if (current_ban_target) {
      const player_data = get_player_data(current_ban_target)
      commands.push(`banbyid ${player_data.player_id} ${duration} "${reason}"`)
    }

    commands.forEach((command) => {
      window.electron.ipcRenderer.send('command', command)
    })
  })
}
