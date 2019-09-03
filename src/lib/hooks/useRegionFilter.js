import { useMemo } from 'react'
import { useGlobalState } from '../globalState'

export default () => {
  const state = useGlobalState()
  const {alerts, categories} = state

  return useMemo(() => {
    let tmpItems = alerts.labelValues && alerts.labelValues.region ? alerts.labelValues.region.slice() : []

    // if a landscape category is active then filter regions
    const landscapeCategories = categories.items.filter(c => 
      c.active && c.area === 'landscape' && c.match_re.region
    )

    if(landscapeCategories.length > 0) {
      tmpItems = tmpItems.filter(region => {
        return landscapeCategories.reduce((insideLandscape,category) => {
          const regex = new RegExp(category.match_re.region)
          return insideLandscape && regex.test(region)
        },true)
      })
    }
    // END
    return tmpItems
  }, [categories.items,alerts.labelValues])
}
