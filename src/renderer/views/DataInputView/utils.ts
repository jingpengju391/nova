import moment from 'moment'

export function parseDateString(dateString: string): Date|undefined {
  // 上的unicode \u4e0a   |  下的unicode \u4e0b  |   午的unicode \u5348
  try {
    const dateParser = /(\d{4})\/(\d{1,2})\/(\d{1,2})\s*([\u4e0b|\u4e0a]\u5348)(\d{1,2}):(\d{1,2}):(\d{1,2})/
    const match = dateString.match(dateParser)
    if (match) {
      const isPM = match[4] === '下午'
      const hours = isPM ? Number(match[5]) + 12 : Number(match[5])
      return new Date(
        Number(match[1]), // year
        Number(match[2]) - 1, // monthIndex
        Number(match[3]), // day
        hours, // hours
        Number(match[6]), // minutes
        Number(match[7]) // seconds
      )
    } else {
      throw new Error(`Invalid date string: ${dateString}`)
    }
  } catch { }
}

export function formateTime(time:any): String {
  if (time === undefined) {
    return ''
  }
  if (typeof time === 'string' && time.includes('午')) {
    return time
  }
  let hour = Number(moment(time).format('HH'))
  if (hour >= 0 && hour < 12) {
    return moment(time).format('YYYY-MM-DD ') + '上午' + moment(time).format(' h:mm:ss')
  } else {
    return moment(time).format('YYYY-MM-DD ') + '下午' + moment(time).format(' h:mm:ss')
  }
}
