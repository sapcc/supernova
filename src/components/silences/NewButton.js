import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import NewForm from "./NewForm"

const NewButton = ({ className, children, showModal }) => {
  const handleClick = () => {
    showModal({
      header: (
        <React.Fragment>
          <span className="u-text-info">Maintenance Silence</span>
        </React.Fragment>
      ),
      content: NewForm,
    })
  }

  return (
    <button className={`btn btn-link ${className}`} onClick={handleClick}>
      <FontAwesomeIcon icon="tools" /> {children}
    </button>
  )
}

export default NewButton
