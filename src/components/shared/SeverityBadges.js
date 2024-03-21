import React from "react"
import { Badge } from "reactstrap"

const SeverityBadges = ({
  critical,
  warning,
  info,
  criticalAcked,
  warningAcked,
  infoAcked,
  criticalHandled,
  warningHandled,
  infoHandled,
  only,
  onClick,
  className,
}) => {
  if (only && only.indexOf("critical") < 0) critical = false
  if (only && only.indexOf("warning") < 0) warning = false
  if (only && only.indexOf("info") < 0) info = false

  let style = { cursor: "pointer" }

  if (!onClick) {
    onClick = () => null
    style = {}
  }

  return (
    <div className={`severity-badges ${className}`}>
      {critical > 0 && (
        <Badge color="danger" style={style} onClick={() => onClick("critical")}>
          {critical}
        </Badge>
      )}
      {warning > 0 && (
        <Badge color="warning" style={style} onClick={() => onClick("warning")}>
          {warning}
        </Badge>
      )}
    </div>
  )
}

export default SeverityBadges
