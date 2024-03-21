import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { UncontrolledTooltip } from "reactstrap"

const RegionSeverityCount = ({
  region,
  severity,
  count,
  countHandled,
  countSilenced,
  countAcked,
  minimalView,
}) => {
  const openAlertCount = (count, countHandled) => {
    if (!count > 0) return 0 // in case count is undefined ensure that 0 is returned
    if (isNaN(countHandled) || countHandled < 1) return count

    return count - countHandled
  }

  const allClearClassName = (count) => {
    return count > 0 ? "" : "allclear"
  }

  return (
    <div
      className={`region-severity severity-${severity} ${allClearClassName(
        count
      )}`}
    >
      <div className="region-severity-open">
        {openAlertCount(count, countHandled)}
      </div>

      {!isNaN(countHandled) && countHandled > 0 && !minimalView && (
        <div className="region-severity-silenced" id={`${region}-${severity}`}>
          <FontAwesomeIcon icon={["far", "bell-slash"]} />
          {countHandled}

          <UncontrolledTooltip
            placement="right"
            target={`${region}-${severity}`}
          >
            <div className="severity-tooltip">
              {countAcked > 0 && `acked - ${countAcked}`}
              {countAcked > 0 && countSilenced > 0 && <br />}
              {countSilenced > 0 && `silenced - ${countSilenced}`}
            </div>
          </UncontrolledTooltip>
        </div>
      )}
    </div>
  )
}

export default RegionSeverityCount
