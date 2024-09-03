type ElementList = {
  [key: string]: HTMLElement
}

export const GetElementsByID = (ids: string[]): ElementList => {
  const elements: ElementList = {}
  ids.forEach((id) => {
    const element = document.getElementById(id)
    if (element) {
      elements[id] = element
    }
  })
  return elements
}
