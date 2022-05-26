import { ref, onMounted, onUnmounted } from 'vue'

export default function useWindowWidthAndHeight() {
  const windowHeight = ref(window.innerHeight)
  const windowWidth = ref(window.innerWidth)
  const onWidthOrHeightChange = () => {
    windowHeight.value = window.innerHeight
    windowWidth.value = window.innerWidth
  }
  onMounted(() => window.addEventListener('resize', onWidthOrHeightChange))
  onUnmounted(() => window.removeEventListener('resize', onWidthOrHeightChange))
  return { windowHeight, windowWidth }
}
