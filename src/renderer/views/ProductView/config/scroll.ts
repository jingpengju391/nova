export function getDistanceOfScrollToTopByTarget(currentClassName: string, parentClassName: string):number {
  const currentElement = document.getElementsByClassName(currentClassName)[0] as HTMLElement
  const parentElement = document.getElementsByClassName(parentClassName)[0] as HTMLElement
  if (!parentElement || !currentElement) return 0
  const yDiff = currentElement.getBoundingClientRect().y - parentElement.getBoundingClientRect().y
  if (yDiff > parentElement.getBoundingClientRect().height) return parentElement.scrollTop + yDiff
  return 0
}
