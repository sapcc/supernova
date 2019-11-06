import React from 'react'
import { useDispatch } from '../../lib/globalState'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const AlertLabels = ({labelSettings,labels}) => {
  const dispatch = useDispatch()  

  const isFilterActive = (label, value) => (
    labelSettings[label].findIndex(val => val === value) >= 0
  )
  const handlePillClick = (name, value) => {
    if (isFilterActive(name, value)) {
      dispatch({type: 'REMOVE_FILTER', name, value})          
    } else {
      dispatch({type: 'ADD_FILTER', name, value}) 
    }
  }

  return <React.Fragment>
    {Object.keys(labelSettings).map((labelKey, index) =>
        labels[labelKey] &&
          <span 
            className={`filter-pill ${isFilterActive(labelKey, labels[labelKey]) ? 'active' : ''}`}
            key={ `pill-${labelKey}` } 
            onClick={() => handlePillClick(labelKey, labels[labelKey])}>
            {labelKey} = {labels[labelKey]}
            { isFilterActive(labelKey, labels[labelKey]) &&
              <FontAwesomeIcon icon="times-circle" fixedWidth />
            }
          </span>
    )}
  </React.Fragment>
}

export default AlertLabels