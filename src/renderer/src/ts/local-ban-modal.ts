import { GetElementsByID } from '../util'

export const local_ban_modal_init = (): void => {
  const elements = GetElementsByID(['local-ban-modal', 'local-ban-modal-close'])

  const modal = elements['local-ban-modal'] as HTMLDivElement
  const close = elements['local-ban-modal-close'] as HTMLButtonElement

  close.addEventListener('click', () => {
    modal.classList.add('hide')
  })
}
