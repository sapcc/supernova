import React from 'react'
import { Form, FormGroup, Label } from 'reactstrap'
import Select from 'react-select'
import { useGlobalState, useDispatch } from '../globalState'


const Filters = ({filterLabels, labelValues}) => {

  const dispatch = useDispatch()
  const state = useGlobalState()
  const {extraFiltersVisible} = state.labelFilters

  // Filter out the top level labels (they will get special treatment, i.e. display, or actions)
  const secondTierFilterLabels = Object.keys(filterLabels).filter(label => /^((?!(\bregion\b|\bseverity\b)).)*$/.test(label))

  const handleChange = (values, change) => {
    dispatch({type: 'SET_VALUES_FOR_FILTER', action: change.action, name: change.name, values: transformSelectedValuesToState(values)})
  }

  const toggleFilterDisplay = () => {
    dispatch({type: 'SET_EXTRA_FILTERS_VISIBLE', visible: !extraFiltersVisible})
  }

  // in our state we have an array of string values. react-select wants an array of objects of the form {value: VALUE, label: LABEL}
  const transformValuesForSelect = (values) => {
    if (values) {
      return values.map(val => ({value: val, label: val}))
    } else {
      return []
    }
  }

  // transform react-select style values back to a simple array of string values
  const transformSelectedValuesToState = (values) => {
    if (values) {
      return values.map(val => val.value)
    } else {
      return []
    }
  }

  return(
    filterLabels ? 
      <div className="filters">
        <Form>
          <div className="filter-section">
            { ['severity', 'region'].map((topTierLabel) =>
            <FormGroup key={ `filter-${topTierLabel}`}>
                <Label for={ `filter-${topTierLabel}` }>{topTierLabel}</Label>
                <Select 
                  name={topTierLabel} 
                  id={`filter-${topTierLabel}`} 
                  value={transformValuesForSelect(filterLabels[topTierLabel])} 
                  onChange={(value, change) => handleChange(value, change)}
                  options={transformValuesForSelect(labelValues[topTierLabel])}
                  isLoading={!labelValues || !labelValues[topTierLabel]}
                  isMulti>
                </Select>
              </FormGroup>
            )}
          </div>

          <a href="#" className="toggle-show" onClick={() => toggleFilterDisplay()}>Show {extraFiltersVisible ? 'fewer' : 'more'} filters</a>

          <div className={`filter-section ${extraFiltersVisible ? '' : 'u-hidden'}`}>
            { secondTierFilterLabels.map((label) =>
              <FormGroup key={`filter-${label}`}>
                <Label for={`filter-${label}` }>{label}</Label>
                <Select 
                  name={label} 
                  id={`filter-${label}`} 
                  value={transformValuesForSelect(filterLabels[label])} 
                  onChange={(value, change) => handleChange(value, change)}
                  options={transformValuesForSelect(labelValues[label])}
                  isLoading={!labelValues || !labelValues[label]}
                  isMulti>
                </Select>
              </FormGroup>
            )}
          </div>
        </Form>
      </div>
    :
    "Loading filters"
  )
}

export default Filters;