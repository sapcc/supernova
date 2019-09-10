import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default ({severity, count, countHandled}) => {

  const openAlertCount = (count, countHandled) => {
    if (isNaN(countHandled) || countHandled < 1) return count

    return count - countHandled 
  }

  const allClearClassName = (count) => {
    return (count === 0) ? "allclear" : ""
  }

  return (
    <div className={`region-severity region-${severity} ${allClearClassName(count)}`}>
      <div className="region-severity-open">{openAlertCount(count, countHandled)}</div>
      { (!isNaN(countHandled) && countHandled > 0) &&
        <div className="region-severity-silenced"><FontAwesomeIcon icon={["far", "bell-slash"]}/> {countHandled}</div>}
    </div>
  )
}