import { toggle_all_checkboxes, get_table_entries } from './global'

export const set_table_is_loading = (is_loading: boolean): void => {
  const table_body = document.querySelector('#table #body') as HTMLDivElement

  const table_items = document.querySelectorAll('.table-item')
  let hide_table_items
  if (table_items.length) {
    hide_table_items = (is_loading: boolean): void => {
      table_items.forEach((item) => {
        if (is_loading) {
          item.classList.add('hidden')
        } else {
          item.classList.remove('hidden')
        }
      })
    }
  }

  if (is_loading) {
    if (hide_table_items) hide_table_items(true)
    table_body.classList.add('loading')
  } else {
    if (hide_table_items) hide_table_items(false)
    table_body.classList.remove('loading')
  }
}

export const get_badges = (table_item: HTMLDivElement): string[] => {
  const badge_container = table_item.querySelector(
    '.row-content .row-name .display-name-container .badges'
  )
  if (!badge_container) return []

  const badges = badge_container.querySelectorAll('.badge')

  const badge_types: string[] = []
  badges.forEach((badge) => {
    badge_types.push(badge.classList[1])
  })

  return badge_types
}

export const table_init = (): void => {
  const header_checkbox = document.querySelector(
    '#table #header #name .custom-checkbox-container .custom-checkbox'
  ) as HTMLInputElement

  window.electron.ipcRenderer.on('clipboard-loading', () => {
    set_table_is_loading(true)
  })

  const body = document.querySelector('#table #body') as HTMLDivElement

  setInterval(() => {
    body.style.height = `${window.innerHeight - 300}px`
    body.style.maxHeight = `${window.innerHeight - 300}px`
  }, 100)

  header_checkbox.addEventListener('click', (e) => {
    if (!get_table_entries().length) {
      e.preventDefault()
      return
    }

    toggle_all_checkboxes(header_checkbox.checked)
  })

  const sort_button = document.querySelector(
    '#table #header #header-sort #table-sort-button'
  ) as HTMLButtonElement

  sort_button.addEventListener('click', () => {
    const table_entries = get_table_entries()
    if (!table_entries.length) return

    table_entries.forEach((entry) => {
      const badges = get_badges(entry)

      if (badges.includes('suspicious')) {
        entry.style.order = '-1'
      } else if (badges.includes('veteran')) {
        entry.style.order = '0'
      } else if (badges.includes('admin')) {
        entry.style.order = '1'
      } else {
        entry.style.order = '0'
      }
    })
  })

  const search_input = document.querySelector(
    '#table #header #name #header-search'
  ) as HTMLInputElement

  search_input.addEventListener('input', (e) => {
    const table_entries = get_table_entries()

    if (!table_entries.length) {
      e.preventDefault()
      search_input.value = ''
      return
    }

    const search = search_input.value.toLowerCase()

    if (!search.length) {
      table_entries.forEach((entry) => {
        entry.classList.remove('hidden')
      })
      return
    }

    table_entries.forEach((entry) => {
      const name = entry.querySelector(
        '.row-content .row-name .display-name-container'
      ) as HTMLDivElement
      if (!name.textContent) return
      const name_text = name.textContent.toLowerCase()

      if (name_text.includes(search)) {
        entry.classList.remove('hidden')
        return
      } else {
        entry.classList.add('hidden')
      }
    })
  })
}
