export function formatDate(d: number) {
  const now = new Date(d)
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const date = now.getDate()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const second = now.getSeconds()
  const hours = hour < 10 ? '0' + hour : hour
  const minutes = minute < 10 ? '0' + minute : minute
  const seconds = second < 10 ? '0' + second : second
  return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds
}
