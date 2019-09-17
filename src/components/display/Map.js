import React from 'react';
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
  Markers,Marker,
  Annotations,Annotation
} from "react-simple-maps"

import LOCATIONS from './locations'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useActiveRegionFilter from '../../lib/hooks/useActiveRegionFilter'
import '../../styles/theme.scss'
import '../../styles/map.scss'


const wrapperStyles = {
  width: "100%",
  margin: "0 auto",
  backgroundColor: '#1d232d'
}

const openAlertCount = (count, countHandled) => {
  if (!count > 0) return 0 // in case count is undefined ensure that 0 is returned
  if (isNaN(countHandled) || countHandled < 1) return count

  return count - countHandled 
}

const calculateRegionXY = (dx, dy, width, height) => { 
  // if both x and y are 0 the marker will hit the box at the top left edge
  let x = 0 
  let y = 0
  
  // if both x and y have only a small deviation, ensure the marker gets put on one of the corners
  if (dx >= -10 && dx <= 10 && dy >= -10 && dy <= 10) {
    if (dx < 0) {
      x = -width // x deviation to the left, move box so that marker is at right edge
    }
    if (dy < 0) {
      y = -height // y deviation to the top, move box so that marker is at bottom edge
    }
    if (dx === 0) {
      x = -width/2 // no x deviation, put marker in the middle of the horizontal edge
    }
    if (dy === 0) {
      y = -height/2 // no y deviation, put marker in the middle of the vertical edge
    }
    return {x: x, y: y}
  }

  if (dx >= -10 && dx <= 10) {
    x = -width/2 // in cases of a small difference of x put the marker in the middle of the box by moving the x coordinate by half the width
  } else if (dx < -10) {
    x = -width // if the x difference is larger and negative put the marker on the right edge by moving the x coordinate by the full width
  }

  if (dy >= -10 && dy <= 10) {
    y = -height/2 // in cases of a small difference of y put the marker in the middle of the box by moving the y coordinate by half the height
  } else if (dy < -10) {
    y = -height // if the y difference is larger and negative put the marker on the bottom edge by moving the y coordinate by the full height
  }

  return {x: x, y: y}

}

const AnnotationContent = ({region,dx,dy,counts}) => {

  const severityWidth       = 30
  const totalWidth          = severityWidth * 3
  const regionInfoHeight    = 20
  const extraInfoHeight     = 7
  const severityInfoHeight  = regionInfoHeight + extraInfoHeight
  const totalRegionHeight   = regionInfoHeight + severityInfoHeight

  const xy = calculateRegionXY(dx, dy, totalWidth, totalRegionHeight)

  return (
    <React.Fragment> 
      <svg 
        className="map-region"
        x={ xy.x } 
        y={ xy.y }
        height={totalRegionHeight}
        >

        <rect
          className="map-region-name"
          width= {totalWidth}
          height={regionInfoHeight}/>
      
        <text
          textAnchor="middle" 
          x={ totalWidth/2 } 
          y={ regionInfoHeight/2 + 5 }>
          {region} 
        </text> 

        {["critical", "warning", "info"].map((severity, index) =>

          <svg x = {index*severityWidth} y = {regionInfoHeight} height={severityInfoHeight} className={counts[severity] > 0 ? "" : "allclear"} key={severity}> 
            <rect
              className ={`map-region-severity severity-${severity}`}
              width = {severityWidth}
              height = {regionInfoHeight}/>

            <rect
              className="map-region-extra-info"
              width= {severityWidth}
              height={extraInfoHeight}
              y={regionInfoHeight}/>

            <text
              textAnchor="middle" 
              x={ severityWidth/2 } 
              y={ regionInfoHeight/2 + 5 }>
            <tspan>{openAlertCount(counts[severity], counts[`${severity}Handled`])}</tspan> 
            </text>

            { counts[`${severity}Handled`] > 0 &&
              <g>
                <text
                  className="map-info-text"
                  textAnchor="middle" 
                  x={ severityWidth/2 } 
                  y={ severityInfoHeight - 1.5 }>
                <tspan>{counts[`${severity}Handled`]}</tspan> 
                </text>

                <FontAwesomeIcon width="5" x={ 5 } y={ severityInfoHeight/2 - 3.5 } style={{color: 'white'}} size="xs" icon={["far", "bell-slash"]}/>
              </g>
            }
          </svg>
        )}
      </svg>
    </React.Fragment>
  )
}

export default ({regionCounts}) => {
 const activeRegions = useActiveRegionFilter()
  const counts = activeRegions.reduce((hash,region) => {
    if(regionCounts[region]) hash[region] = regionCounts[region]
    return hash
  },{})   

  return (
    <div style={wrapperStyles}>
    <ComposableMap
      className="map-wrapper"
      projectionConfig={{
        rotation: [-10,0,0]
      }}
    >
      <ZoomableGroup center={[0,20]} disablePanning>
        <Geographies geography={require("./world-110m.json")}>
            {(geographies, projection) => geographies.map((geography, i) => geography.id !== "ATA" && (
              <Geography
                key={i}
                geography={geography}
                projection={projection}
                style={{
                  default: {
                    fill: "#354052",
                    stroke: "grey",
                    strokeWidth: 0.1,
                    outline: "none",
                  },
                  hover: {
                    fill: "354052",
                    stroke: "grey",
                    strokeWidth: 0.1,
                    outline: "none",
                  },
                  pressed: {
                    fill: "#fcb913",
                    stroke: "#607D8B",
                    strokeWidth: 0.75,
                    outline: "none",
                  }
                }}
              />
            ))}
            </Geographies>
            <Markers>
              {Object.keys(counts).map((region,index) => LOCATIONS[region] &&  
                <Marker key={index} marker={{ coordinates: [ LOCATIONS[region].lon, LOCATIONS[region].lat ] }}>
                  <circle stroke='#000' fill='#000' cx={ 0 } cy={ 0 } r={ 1 } />
                </Marker>
              )}
            </Markers>


            <Annotations>
              {Object.keys(counts).map((region,index) => LOCATIONS[region] &&
                <Annotation 
                  key={index} 
                  stroke='#000' 
                  dx={ LOCATIONS[region].dx } dy={ LOCATIONS[region].dy } 
                  subject={ [ LOCATIONS[region].lon, LOCATIONS[region].lat ] } 
                  strokeWidth={ 1 }>
                  <AnnotationContent region={region} counts={counts[region]} {...LOCATIONS[region]}/>
                </Annotation>
              )}  
              </Annotations>
          </ZoomableGroup>
        </ComposableMap>
      </div>
  )
}
