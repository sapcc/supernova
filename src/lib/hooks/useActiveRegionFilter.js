import { useMemo } from 'react'
import { useGlobalState } from '../globalState'

export default () => {
  const state = useGlobalState()
  const {alerts, categories} = state

  return useMemo(() => {
    let items = alerts.counts && alerts.counts.region ? Object.keys(alerts.counts.region).slice() : []
    items = items.filter((item,index) => items.indexOf(item) === index)

    // if a landscape category is active then filter regions
    const landscapeCategories = categories.items.filter(c => 
      c.active && c.area === 'landscape' && c.match_re.region
    )

    if(landscapeCategories.length > 0) {
      items = items.filter(region => {
        return landscapeCategories.reduce((insideLandscape,category) => {
          const regex = new RegExp(category.match_re.region)
          return insideLandscape && regex.test(region)
        },true)
      })
    }
    // END
    return items
  }, [categories.items,alerts.counts])
}
