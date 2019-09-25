import React from 'react'
import Regions from '../Regions'



export default ({labelFilters, counts}) => {

  return (
    <Regions labelFilters={labelFilters} counts={counts} isFullScreen={true} />
  )
}
