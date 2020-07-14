import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import NewForm from "./NewForm"

const NewButton = ({ className, children, showModal }) => {
  const handleClick = () => {
    showModal({
      header: (
        <React.Fragment>
          <span className="u-text-info">New Silence</span>
        </React.Fragment>
      ),
      content: NewForm,
    })
  }

  return (
    <button className={`btn btn-primary ${className}`} onClick={handleClick}>
      <FontAwesomeIcon icon="plus-circle" className="logo" /> {children}
    </button>
  )
}

export default NewButton
