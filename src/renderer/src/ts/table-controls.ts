import { GetElementsByID } from '../util'
import '@yaireo/tagify/dist/tagify.css'
import Tagify from '@yaireo/tagify'

export const table_controls_init = (): void => {
  const elements = GetElementsByID([
    'refresh-button',
    'player-count',
    'punish-reason',
    'punish-duration',
    'punish-preset-button',
    'punish-global',
    'punish-duration-slider',
    'punish-duration-label'
  ])

  // const punish_reason = elements['punish-reason'] as HTMLInputElement
  const refresh_button = elements['refresh-button'] as HTMLButtonElement
  refresh_button.addEventListener('click', () => {
    window.electron.ipcRenderer.send('command', 'listplayers')
  })

  const slider = elements['punish-duration-slider'] as HTMLInputElement
  const label = elements['punish-duration-label'] as HTMLInputElement

  slider.addEventListener('input', () => {
    label.value = slider.value
  })

  label.addEventListener('input', () => {
    const value = Number(label.value)
    const min = Number(slider.min)
    const max = Number(slider.max)

    if (!isNaN(value) && value >= min && value <= max) {
      slider.value = value.toString()
    } else {
      label.value = slider.value
    }
  })

  const punish_global = elements['punish-global'] as HTMLInputElement
  const tagify = new Tagify(punish_global, {
    whitelist: [],
    enforceWhitelist: true,
    editTags: {
      keepInvalid: false
    },
    dropdown: {
      position: 'text',
      enabled: 1
    }
  })

  window.electron.ipcRenderer.on('catalog', (_, catalog) => {
    // @ts-ignore - whitelist accepts { value: string, ...?: any }[] as well
    tagify.whitelist = Object.keys(catalog).map((key) => ({
      value: key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      ident: key,
      time: catalog[key].ban_time,
      max_time: catalog[key].max_ban_time,
      description: catalog[key].description,
      message: catalog[key].ban_msg
    }))
    tagify.settings.whitelist = tagify.whitelist
  })

  const punish_preset_button = elements['punish-preset-button'] as HTMLButtonElement
  punish_preset_button.addEventListener('click', () => {
    punish_preset_button.classList.add('enabled')
    tagify.addEmptyTag()
    tagify.dropdown.show()
  })
  punish_global.addEventListener('change', () => {
    // punish_reason.value = tagify.value
    //   .map((tag: { value: string }) => {
    //     return tag.value
    //       .split('_')
    //       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    //       .join(' ')
    //   })
    //   .join(', ')

    if (tagify.value.length) {
      const max_time = Math.max(
        ...tagify.value.map((tag: { max_time: number }) => {
          return tag.max_time
        })
      )
      const min_time = Math.min(
        ...tagify.value.map((tag: { time: number }) => {
          return tag.time
        })
      )
      const max_of_time = Math.max(
        ...tagify.value.map((tag: { time: number }) => {
          return tag.time
        })
      )
      slider.value = max_of_time.toString()
      label.value = max_of_time.toString()
      slider.max = max_time.toString()
      slider.min = min_time.toString()
    } else {
      slider.value = '1'
      label.value = '1'
      slider.max = '999999'
      slider.min = '1'
    }
  })

  setInterval(() => {
    if (
      !tagify
        .getTagElms()
        .filter(
          (tag) =>
            !tag.classList.contains('tagify__tag--hide') &&
            !tag.classList.contains('tagify--invalid')
        ).length
    ) {
      punish_preset_button.classList.remove('enabled')
    } else {
      punish_preset_button.classList.add('enabled')
    }
  }, 100)
}
