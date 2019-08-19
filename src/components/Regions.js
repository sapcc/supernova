import React, {useMemo} from 'react'


const REGION_SORT_REGEX = [
  [/na-ca-.+/,/na-us-.+/,/na-.+/,/la-br-.+/,/la-.+/],
  [/eu-nl-.+/,/eu-de-.+/,/eu-ru-.+/,/eu-.+/],
  [/ap-ae-.+/,/ap-sa-.+/,/ap-cn-.+/,/ap-jp-.+/],
  [/ap-au-.+/]
]

export default ({items}) => {

  if(!items) return null

  const sortedRegions = useMemo(() => {
    let tmpItems = items.slice()

    return REGION_SORT_REGEX.map(regionRegexList => {
      let result = []

      for(let regionRegex of regionRegexList) {
        const items = tmpItems.filter(region => regionRegex.test(region)).sort()
        result = result.concat(items)
        tmpItems = tmpItems.filter(item => !items.includes(item))
      }  
      return result
    })
  }, [items])

  return null
  return (
    <div style={{display: 'flex', justifyContent: 'space-around', width: '100%'}}>
      {sortedRegions.map(regionList => 
        <div style={{backgroundColor: 'red'}}>{regionList.map(region => <div>{region}</div>)}</div>
      )}  
    </div>
  )
}
