import React, {useMemo} from 'react'
import { Button, Form, FormGroup, Label } from 'reactstrap'
import Select from 'react-select'
import { useDispatch } from '../lib/globalState'
import useFilters from '../lib/hooks/useFilters'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Filters = ({labelFilters, labelValues}) => {

  const dispatch = useDispatch()
  const {extraFiltersVisible, settings} = labelFilters
  const {primaryFilters, secondaryFilters} = useFilters(settings)
  const filterKeys = useMemo(() => {
    const keys = Object.keys(settings).filter(k => ['region','severity'].indexOf(k) < 0)
    keys.unshift('severity')
    keys.unshift('region')
    return keys
  },[settings])

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
    settings ? 
      <div className="filters">
        <Form>

          <Button color="link" className="toggle-show" onClick={() => toggleFilterDisplay()}>
            Advanced filters {' '}
            <FontAwesomeIcon icon={extraFiltersVisible ? 'angle-up' : 'angle-down'}/>
          </Button>

          <div className={`filter-section ${extraFiltersVisible ? '' : 'u-hidden'}`}>
            { filterKeys.map((label) =>
              <FormGroup key={`filter-${label}`}>
                <Label for={`filter-${label}` }>{label}</Label>
                <Select 
                  name={label} 
                  id={`filter-${label}`} 
                  value={transformValuesForSelect(settings[label])} 
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

  //return(
  //  settings ? 
  //    <div className="filters">
  //      <Form>
  //        <div className="filter-section">
  //          { primaryFilters && primaryFilters.map((primaryLabel) =>
  //          <FormGroup key={ `filter-${primaryLabel}`}>
  //              <Label for={ `filter-${primaryLabel}` }>{primaryLabel}</Label>
  //              <Select 
  //                name={primaryLabel} 
  //                id={`filter-${primaryLabel}`} 
  //                value={transformValuesForSelect(settings[primaryLabel])} 
  //                onChange={(value, change) => handleChange(value, change)}
  //                options={transformValuesForSelect(labelValues[primaryLabel])}
  //                isLoading={!labelValues || !labelValues[primaryLabel]}
  //                isMulti>
  //              </Select>
  //            </FormGroup>
  //          )}
  //        </div>

  //        <Button color="link" className="toggle-show" onClick={() => toggleFilterDisplay()}>Show {extraFiltersVisible ? 'fewer' : 'more'} filters</Button>

  //        <div className={`filter-section ${extraFiltersVisible ? '' : 'u-hidden'}`}>
  //          { secondaryFilters && secondaryFilters.map((label) =>
  //            <FormGroup key={`filter-${label}`}>
  //              <Label for={`filter-${label}` }>{label}</Label>
  //              <Select 
  //                name={label} 
  //                id={`filter-${label}`} 
  //                value={transformValuesForSelect(settings[label])} 
  //                onChange={(value, change) => handleChange(value, change)}
  //                options={transformValuesForSelect(labelValues[label])}
  //                isLoading={!labelValues || !labelValues[label]}
  //                isMulti>
  //              </Select>
  //            </FormGroup>
  //          )}
  //        </div>
  //      </Form>
  //    </div>
  //  :
  //  "Loading filters"
  //)
}

export default Filters;
