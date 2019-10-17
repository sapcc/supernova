const doPeriodical = (options = {}, func) => {
  options = Object.assign({intervalInSeconds: 300, immediate: true},options)
  if(!options.intervalInSeconds || options.intervalInSeconds <= 0 ) options.intervalInSeconds = 300
  let interval = options.intervalInSeconds * 1000

  const periodical = () => {
    let start = Date.now()
    Promise.resolve(func()).then(() => {
      let timeout = start + interval - Date.now()
      if(timeout < 0) timeout = 0
      setTimeout(periodical,timeout)
    })
  }
  setTimeout(periodical, options.immediate ? 0 : interval)
}

const capitalize = (string) => string ? string[0].toUpperCase() + string.slice(1) : ''

module.exports = {
  doPeriodical,
  capitalize
}
