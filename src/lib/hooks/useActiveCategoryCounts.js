import { useMemo } from 'react';

export default ({counts, categories}) => 
  useMemo(() => {
    const activeLandscapeCategory = categories.find(c => c.area === 'landscape' && c.active)

    const category = JSON.parse(JSON.stringify(counts.category || ""))
    const region = JSON.parse(JSON.stringify(counts.region || ""))

    if(activeLandscapeCategory && category && category[activeLandscapeCategory.name] ) {
      for(let subCategoryName in category[activeLandscapeCategory.name].category) {
        category[subCategoryName] = {...category[activeLandscapeCategory.name].category[subCategoryName]} 
      }
    }

    const activeCategories = categories.filter(c => c.active)
    activeCategories.forEach(c => {
      const categoryRegions = {...((category[c.name] || {}).region || {})}
      
      for(let regionName in region) {
        region[regionName] = region[regionName] || {critical: 0, warning: 0, info: 0} 
        const categoryRegion = {...(categoryRegions[regionName] || {})}
        region[regionName].critical = Math.min(region[regionName].critical || 0,categoryRegion.critical || 0)
        region[regionName].warning = Math.min(region[regionName].warning || 0,categoryRegion.warning || 0)
        region[regionName].info = Math.min(region[regionName].info || 0,categoryRegion.info || 0)
      }
    })

    return {category,region}
  }, [counts,categories])
