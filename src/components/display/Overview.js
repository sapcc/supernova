import React from 'react'
import Regions from '../Regions'



export default ({labelFilters, items, counts}) => {

  return (
    <Regions labelFilters={labelFilters} items={items} counts={counts} isFullScreen={true} />
  )
}
