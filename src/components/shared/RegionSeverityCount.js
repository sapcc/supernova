import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default ({severity, count, countHandled}) => {

  const openAlertCount = (count, countHandled) => {
    if (!countHandled || countHandled <= 0) return count || 0

    return count - countHandled 
  }

  const allClearClassName = (count) => {
    return (!count || count === 0) ? "allclear" : ""
  }
  console.log(severity,count,countHandled)

  return (
    <div className={`region-severity region-${severity} ${allClearClassName(count)}`}>
      <div className="region-severity-open">{openAlertCount(count, countHandled)}</div>
      { countHandled > 0  &&
        <div className="region-severity-silenced"><FontAwesomeIcon icon={["far", "bell-slash"]}/> {countHandled}</div>
      }
    </div>
  )
}
