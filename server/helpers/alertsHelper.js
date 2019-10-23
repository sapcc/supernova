const config = require('./configLoader')

// This function sorts alerts by severity critical > warning > info
// then by state
// then alphabetically
const sort = (items) => 
  items.sort((a,b) => {
    if((a.labels.severity==='critical' && b.labels.severity!=='critical') || 
      (a.labels.severity==='warning' && ['critical','warning'].indexOf(b.labels.severity) < 0)) return -1  
    else if((a.labels.severity===b.labels.severity) && (a.status.state !== b.status.state)) return a.status.state.localeCompare(b.status.state)
    else if((a.labels.severity===b.labels.severity) && (a.status.state === b.status.state)) return a.labels.region.localeCompare(b.labels.region)
    else return 1
  })
;


const nonLandscapeCategories = config.categories.filter(c => c.area !== 'landscape')
// This function calculates alerts counts 
// Adds to container 
//   summary: {
//     critical: INTEGER,warning: INTEGER,info:INTEGER,
//     criticalSilenced: INTEGER,warningSilenced: INTEGER,infoSilenced: INTEGER,
//     criticalAcked:INTEGER,warningAcked:INTEGER,infoAcked: INTEGER
//     criticalHandled:INTEGER,warningHandled:INTEGER,infoHandled: INTEGER
//   } , 
//   region: { 
//     REGION: {
//       critical: INTEGER,warning: INTEGER,info: INTEGER,
//       criticalSilenced: INTEGER,warningSilenced: INTEGER,infoSilenced: INTEGER,
//       criticalAcked: INTEGER,warningAcked: INTEGER,infoAcked: INTEGER
//       criticalHandled:INTEGER,warningHandled:INTEGER,infoHandled: INTEGER
//     }
//   }
const updateCounts = (container,alert) => {
  if(alert && alert.labels && alert.labels.severity){
    const {region,severity} = alert.labels

    // SUMMARY
    container.summary = container.summary || {}
    container.summary[severity] = container.summary[severity] || 0
    container.summary[severity] += 1
    
    container.summary[`${severity}Silenced`] = container.summary[`${severity}Silenced`] || 0
    container.summary[`${severity}Acked`] = container.summary[`${severity}Acked`] || 0
    container.summary[`${severity}Handled`] = container.summary[`${severity}Handled`] || 0

    let handled = false
    
    if(alert.status && alert.status.state === 'suppressed') {
      container.summary[`${severity}Silenced`] += 1
      handled = true
    }
    
    if(alert.status && alert.status.acknowledgements && alert.status.acknowledgements.length>0) {
      container.summary[`${severity}Acked`] += 1
      handled = true
    }

    if(handled) container.summary[`${severity}Handled`] += 1

    // REGION
    if(region){
      container.region = container.region || {}
      container.region[region] = container.region[region] || {}
      container.region[region][severity] = container.region[region][severity] || 0
      container.region[region][severity] += 1
      
      container.region[region][`${severity}Handled`] = container.region[region][`${severity}Handled`] || 0

      let regionHandled = false
      if(alert.status && alert.status.state === 'suppressed') {
        container.region[region][`${severity}Silenced`] = container.region[region][`${severity}Silenced`] || 0
        container.region[region][`${severity}Silenced`] += 1
        regionHandled = true
      }
      
      if(alert.status && alert.status.acknowledgements && alert.status.acknowledgements.length>0) {
        container.region[region][`${severity}Acked`] = container.region[region][`${severity}Acked`] || 0
        container.region[region][`${severity}Acked`] += 1
        regionHandled = true
      }

      if(regionHandled) container.region[region][`${severity}Handled`] += 1
    }
      
  }
}
// END ################################################################

// Calculate and ectend alerts with severity counts and available label values
const extend = (alerts) => {
  const result = {alerts, counts: {}, labelValues: {}}
  result.counts.region = result.counts.region || {}

  // load default regions and prefil counts with zero
  config.defaultRegions.forEach(region => {
    result.counts.region[region] = {critical: 0, warning: 0, info: 0, criticalSilenced: 0, warningSilenced: 0, infoSilenced: 0}
  })

  //counts -> category -> NAME -> SEVERITY -> number
  alerts.forEach(alert => {

    // get all available values fro label filters
    for(let name in alert.labels) {
      if(config.labelFilters.hasOwnProperty(name)) {
        result.labelValues[name] = result.labelValues[name] || []
        if(result.labelValues[name].indexOf(alert.labels[name])<0) {
          result.labelValues[name].push(alert.labels[name])
        }
      }
    }

    // add status to labels. This will allow to apply filters in UI
    const state = (alert.status || {})['state']
    if(state) {
      alert.labels.status = state
      result.labelValues.status = result.labelValues.status || []
      if(result.labelValues.status.indexOf(state) < 0) result.labelValues.status.push(state)
    }
    // END

    // calculate severity counts dependent on categories
    updateCounts(result.counts,alert)
    for(let category of config.categories) {
      result.counts.category = result.counts.category || {}
      updateCounts(result.counts.category)
    
      const itemInCategory = Object.keys(category.match_re).reduce((active, label) => {
        return active && new RegExp(category.match_re[label]).test(alert.labels[label])
      },true)

      result.counts.category[category.name] = result.counts.category[category.name] || {}
      
      if(itemInCategory) {
        updateCounts(result.counts.category[category.name],alert)

        if(category.area === 'landscape') {
          // severity counts for categories dependent on this landscape category
          for(let subCategory of nonLandscapeCategories) {
            result.counts.category[category.name]['category'] = result.counts.category[category.name]['category'] || {}
            result.counts.category[category.name].category[subCategory.name] = result.counts.category[category.name].category[subCategory.name] || {}

            const itemInSubCategory = Object.keys(subCategory.match_re).reduce((active, label) => {
              if(!active) return false
              const regex = new RegExp(subCategory.match_re[label])
              return regex.test(alert.labels[label])
            }, true)

            if(itemInSubCategory) {
              updateCounts(result.counts.category[category.name].category[subCategory.name],alert)
            }
          } 
        }
      }
    }
    // END 
  })
  
  Object.keys(result.labelValues).forEach(k => result.labelValues[k] = result.labelValues[k].sort())

  return result
}

module.exports = {
  sort,
  extend
}
