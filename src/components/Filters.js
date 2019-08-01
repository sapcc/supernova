import React from 'react'
import { Col, Form, FormGroup, Label, Input } from 'reactstrap'
import { useDispatch } from '../globalState'


const Filters = ({filterLabels, labelValues}) => {
  // Filter out the top level labels (they will get special treatment, i.e. display, or actions)
  const secondTierFilterLabels = Object.keys(filterLabels).filter(label => /^((?!(\bregion\b|\bseverity\b|\bstate\b)).)*$/.test(label))

  const dispatch = useDispatch()

  const addFilter = (event) => {
    dispatch({type: 'ADD_LABEL_FILTER', name: event.target.name, value: event.target.value})
  }

  return(
    filterLabels ? 
      <div className="filters">
        <Form>
          <div className="filter-section">
            { ['severity', 'region', 'state'].map((topTierLabel) =>
            <FormGroup key={ `filter-${topTierLabel}`} row>
                <Label for={ `filter-${topTierLabel}` } sm={4}>{topTierLabel}</Label>
                <Col  sm={8} >
                  <Input type="select" bsSize="sm" name={topTierLabel} id={`filter-${topTierLabel}`} value={filterLabels[topTierLabel]} onChange={(e) => addFilter(e)}>
                    <option value=""></option>
                    {labelValues ?
                      labelValues[topTierLabel].map(value =>
                        <option value={value} key={`${topTierLabel}-${value}`}>{value}</option>
                      )
                      :
                      <option value="">Loading values...</option>
                    }
                  </Input>
                </Col>
              </FormGroup>
            )}
          </div>
          <div className="filter-section">
            { secondTierFilterLabels.map((label) =>
              <FormGroup key={`filter-${label}`} row>
                <Label for={`filter-${label}` } sm={4}>{label}</Label>
                <Col  sm={8} >
                  <Input type="select" bsSize="sm" name={label} id={`filter-${label}`} value={filterLabels[label]} onChange={(e) => addFilter(e)}>

                  </Input>
                </Col>
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