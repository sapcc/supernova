import React from 'react'
import { Badge } from 'reactstrap'

export default ({critical,warning,info,criticalAcked,warningAcked,infoAcked,only, onClick, small}) => {
  if((only && only.indexOf('critical') < 0) || critical === 0) critical = false
  if((only && only.indexOf('warning') < 0) || warning === 0) warning = false
  if((only && only.indexOf('info') < 0) || info === 0) info = false

  let style={cursor: 'pointer'}

  if(!onClick) {
    onClick=() => null
    style={}
  }

  return (
    <span className={small ? 'small' : ''}>
        {critical && <Badge color='danger' style={style} pill onClick={() => onClick('critical')}>{criticalAcked && `${criticalAcked}/`} {critical}</Badge>}  
      {warning && ' '}  
      {warning && <Badge color='warning' style={style} pill onClick={() => onClick('warning')}>{warningAcked && `${warningAcked}/`} {warning}</Badge>}
      {info && ' '}  
      {info && <Badge color='info' style={style} pill onClick={() => onClick('info')}>{infoAcked && `${infoAcked}/`} {info}</Badge>}
    </span>
  )
}
