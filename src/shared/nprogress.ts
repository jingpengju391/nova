// @ts-ignore
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  // Changes the minimum percentage used upon starting
  minimum: 0.1,
  // Adjust animation settings using easing (a CSS easing string) and speed (in ms)
  easing: 'ease',
  speed: 500,
  // Turn off the automatic incrementing behavior by setting this to false
  trickle: false,
  // You can adjust the trickleRate (how much to increase per trickle) and trickleSpeed (how often to trickle, in ms)
  trickleRate: 0.02,
  trickleSpeed: 800,
  // Turn off loading spinner by setting it to false
  showSpinner: false,
  // specify this to change the parent container.
  parent: '#np-rogress'
})

export default NProgress
