import React from 'react'
import { UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap'

const SimplePopover = ({type, clickTarget, text}) => {

  // type should be a bootstrap class name like "danger", "warning", "info", etc.

  return (
    <UncontrolledPopover trigger="click" placement="bottom" target={clickTarget}>
      <PopoverHeader  className={type}>Please Note!</PopoverHeader>
      <PopoverBody>{text}</PopoverBody>
    </UncontrolledPopover>
  )
}

export default SimplePopover