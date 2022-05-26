export function sortDirectoryAndFile(data2:any) {
  const data = calcFilesOrDirectorySort(data2)
  data.forEach(item => {
    item?.children?.length > 0 && !item.isFile && (item.children = sortDirectoryAndFile(item.children))
  })
  return data
}

function calcFilesOrDirectorySort(data:any) {
  const files = orderFiles(data.filter((item:any) => item.isFile))
  const dirs = orderFiles(data.filter((item:any) => !item.isFile))
  return [...dirs, ...files]
}

function orderFiles(data:any) {
  return data.sort((a:any, b:any) => a.label.localeCompare((b.label)))
}
