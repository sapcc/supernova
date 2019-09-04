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

const wrapperStyles = {
  width: "100%",
  margin: "0 auto",
  backgroundColor: '#1d232d'
}

const colors = {
  critical: 'rgb(243,56,81)',
  warning:'rgb(255,183,11)', 
  info: 'rgb(53,196,252)',
  ok: 'rgb(116,207,15)'
}

const AnnotationContent = ({region,dx,dy,counts}) => {
  const width = 80
  let factor = 0
  if(counts.critical && counts.critical>0) factor += 1
  if(counts.warning && counts.warning>0) factor += 1
  if(counts.info && counts.info>0) factor += 1
  let height = 20 + 10*(factor || 1)

  const radius = 4
  const x = dx === 0 ? -width/2 : dx < 0 ? -width+radius/2 : -radius/2
  const y = dy === 0 ? -height/2 : dy < 0 ? -height+radius/2 : -radius/2

  let currentY = y+15

  return (
    <React.Fragment> 
      <rect 
        style={{fill: 'rgb(0,0,0)'}} 
        fillOpacity="0.5" 
        x={ x } 
        y={ y }
        width={width} 
        height={height} 
        rx={radius} 
        ry={radius}/>
      <FontAwesomeIcon width="10" x={x+60} y={y-266} style={{fill: '#fff',  color:  counts.critical-counts.criticalSilenced > 0 ? colors.critical : counts.warning > 0 ? colors.warning : counts.info > 0 ? colors.info : colors.ok}}  size="xs" icon="bell"/>
      <text 
        style={{fill: 'white'}} 
        textAnchor="start" 
        x={ x+5 } 
        y={ y+12 } 
        fontSize={'0.6em'}>
        {region} 
      </text> 
      {factor === 0 && 
        <text 
          style={{fill: colors.ok}} 
          textAnchor="start" 
          x={ x+5 } 
          y={ currentY+=10 }
          fontSize={'0.6em'}>
          No alerts!
        </text>
      }
      { counts.critical && counts.critical>0 && 
        <text 
          style={{fill: colors.critical}} 
          textAnchor="start" 
          x={ x+5 } 
          y={ currentY+=10 }
          fontSize={'0.6em'}>
        <tspan>{counts.criticalSilenced > 0 ? counts.critical-counts.criticalSilenced : counts.critical}</tspan> 
          {counts.criticalSilenced >0 && <tspan style={{fill: 'grey'}} fontSize={'smaller'}>{' '} {counts.criticalSilenced} silenced</tspan>}

        </text>
      }
      { counts.warning && counts.warning>0 && 
        <text 
          style={{fill: colors.warning}} 
          textAnchor="start" 
          x={ x+5 } 
          y={ currentY+=10 }
          fontSize={'0.6em'}>
          <tspan>{counts.warningAcked ? counts.warning-counts.warningAcked : counts.warning}</tspan> 
          {counts.warningAcked && <tspan style={{fill: 'grey'}} fontSize={'smaller'}>{' '} {counts.warningAcked} silenced</tspan>}
        </text>
      }
      { counts.info && counts.info>0 && 
        <text 
          style={{fill: colors.info}} 
          textAnchor="start" 
          x={ x+5 } 
          y={ currentY+=10 }
          fontSize={'0.6em'}>
          <tspan>{counts.infoAcked ? counts.info-counts.infoAcked : counts.info}</tspan> 
          {counts.infoAcked && <tspan style={{fill: 'grey'}} fontSize={'smaller'}>{' '} {counts.infoAcked} silenced</tspan>}
        </text>
      }
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
      projectionConfig={{
        scale: 205,
        rotation: [-11,0,0],
      }}
      width={980}
      height={551}
      style={{
        width: "100%",
        height: "auto",
      }}
    >
      <ZoomableGroup center={[0,20]} disablePanning>
        <Geographies geography={require("./world-50m.json")}>
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
                    strokeWidth: 0.2,
                    outline: "none",
                  },
                  pressed: {
                    fill: "#FF5722",
                    stroke: "#607D8B",
                    strokeWidth: 0.75,
                    outline: "none",
                  },
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
