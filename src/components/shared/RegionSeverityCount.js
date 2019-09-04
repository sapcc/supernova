import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default ({severity, count, countSilenced}) => {

  const openAlertCount = (count, countSilenced) => {
    if (isNaN(countSilenced)) return count

    return count - countSilenced 
  }

  const allClearClassName = (count) => {
    return (count === 0) ? "allclear" : ""
  }

  return (
    <div className={`region-severity region-${severity} ${allClearClassName(count)}`}>
      <div className="region-severity-open">{openAlertCount(count, countSilenced)}</div>
      { !isNaN(countSilenced) &&
        <div className="region-severity-silenced"><FontAwesomeIcon icon={["far", "bell-slash"]}/> {countSilenced}</div>}
    </div>
  )
}