import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default ({severity, count, countHandled, minimalView}) => {

  const openAlertCount = (count, countHandled) => {
    if (!count > 0) return 0 // in case count is undefined ensure that 0 is returned
    if (isNaN(countHandled) || countHandled < 1) return count

    return count - countHandled 
  }

  const allClearClassName = (count) => {
    return (count > 0) ? "" : "allclear"
  }

  return (
    <div className={`region-severity severity-${severity} ${allClearClassName(count)}`}>
      <div className="region-severity-open">{openAlertCount(count, countHandled)}</div>
      { (!isNaN(countHandled) && countHandled > 0 && !minimalView) &&
        <div className="region-severity-silenced"><FontAwesomeIcon icon={["far", "bell-slash"]}/> {countHandled}</div>}
    </div>
  )
}