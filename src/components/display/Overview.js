import React from "react"
import Regions from "../Regions"

const Overview = ({ labelFilters, counts }) => {
  return (
    <Regions labelFilters={labelFilters} counts={counts} isFullScreen={true} />
  )
}

export default Overview
