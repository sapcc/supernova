import React, {useMemo} from 'react'


const REGION_SORT_REGEX = [
  [/na-ca-.+/,/na-us-.+/,/na-.+/,/la-br-.+/,/la-.+/],
  [/eu-nl-.+/,/eu-de-.+/,/eu-ru-.+/,/eu-.+/],
  [/ap-ae-.+/,/ap-sa-.+/,/ap-cn-.+/,/ap-jp-.+/],
  [/ap-au-.+/]
]

export default ({items}) => {

  if(!items) return null

  const sortedRegions = useMemo(() => 
    REGION_SORT_REGEX.map(regionRegexList => 
      regionRegexList.map(regionRegex => items.filter(region => regionRegex.test(region)))    
    )
  , items)

  return (
    <div>
      {JSON.stringify(sortedRegions)}
    </div>
  )
}
