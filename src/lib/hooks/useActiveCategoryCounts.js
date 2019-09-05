import { useMemo } from 'react';

// This module ensures that the counts from the current combination 
// of active categories are used.
export default ({counts, categories}) => 
  useMemo(() => {
    const activeLandscapeCategory = categories.find(c => c.area === 'landscape' && c.active)

    // deep copy of category and region counts 
    const category = JSON.parse(JSON.stringify(counts.category || ""))
    const region = JSON.parse(JSON.stringify(counts.region || ""))

    // Determine current combination of categories
    if(activeLandscapeCategory && category && category[activeLandscapeCategory.name] ) {
      for(let subCategoryName in category[activeLandscapeCategory.name].category) {
        category[subCategoryName] = {...category[activeLandscapeCategory.name].category[subCategoryName]} 
      }
    }

    const activeCategories = categories.filter(c => c.active)

    // determine current active category's counts
    activeCategories.forEach(c => {
      const categoryRegions = {...((category[c.name] || {}).region || {})}
      
      for(let regionName in region) {
        region[regionName] = region[regionName] || {
          critical: 0, 
          warning: 0, 
          info: 0, 
          criticalSilenced: 0,
          warningSilenced: 0,
          infoSilenced: 0
        } 
        const categoryRegion = {...(categoryRegions[regionName] || {})};

        // Since Landscape Category can be combined with other 
        // categories (AND combination), use the smallest counts of all active categories.
        ['critical','warning','info','criticalSilenced','warningSilenced','infoSilenced'].forEach(severity => {
          region[regionName][severity] = Math.min(region[regionName][severity] || 0,categoryRegion[severity] || 0)
        })
      }
    })

    return {category,region}
  }, [counts,categories])
