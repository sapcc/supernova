import React, { useMemo, useEffect, useState } from "react"
import { Button, Form, FormGroup, Label, Input } from "reactstrap"
import Select from "react-select"
import { useDispatch } from "../lib/globalState"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const Filters = ({ labelFilters, labelValues }) => {
  const [showAdvabcedFilters, updateShowAdvancedFilters] = useState(false)
  const dispatch = useDispatch()
  const { settings } = labelFilters
  const filterKeys = useMemo(() => {
    // filter out alertname to avoid that a selectbox is created for it.
    const keys = Object.keys(settings).filter(
      (k) => ["region", "severity", "alertname"].indexOf(k) < 0
    )
    keys.unshift("severity")
    keys.unshift("region")
    return keys
  }, [settings])

  const handleChange = (values, change) => {
    dispatch({
      type: "SET_VALUES_FOR_FILTER",
      action: change.action,
      name: change.name,
      values: transformSelectedValuesToState(values),
    })
  }

  const toggleFilterDisplay = () => {
    updateShowAdvancedFilters(!showAdvabcedFilters)
  }

  useEffect(() => {
    const hasActiveFilters = Object.values(settings).reduce(
      (visible, values) => visible || values.length > 0,
      false
    )
    if (hasActiveFilters) updateShowAdvancedFilters(true)
  }, [settings])

  // in our state we have an array of string values. react-select wants an array of objects of the form {value: VALUE, label: LABEL}
  const transformValuesForSelect = (values) => {
    if (values) {
      return values.map((val) => ({ value: val, label: val }))
    } else {
      return []
    }
  }

  // transform react-select style values back to a simple array of string values
  const transformSelectedValuesToState = (values) => {
    if (values) {
      return values.map((val) => val.value)
    } else {
      return []
    }
  }

  return settings ? (
    <div className="filters">
      <Form>
        <Button
          color="link"
          className="toggle-show"
          onClick={() => toggleFilterDisplay()}
        >
          Advanced filters{" "}
          <FontAwesomeIcon
            icon={showAdvabcedFilters ? "angle-up" : "angle-down"}
          />
        </Button>

        <div
          className={`filter-section ${showAdvabcedFilters ? "" : "u-hidden"}`}
        >
          {/* alertname is a special filter. While other filters are represented by selectboxes
              the alertname field contains a string. This string is used to search for alerts 
              which contains it as a substring.
              To use the existing architecture, we use the handleChange method. 
              This expects a certain format, which we simulate.
          */}
          <FormGroup key={`filter-alertname`}>
            <div className="filter">
              <Label for={`filter-alertname`}>alertname</Label>
              <Input
                name="alertname"
                id={`filter-alertname`}
                value={
                  settings?.alertname && settings?.alertname.length > 0
                    ? settings.alertname[0]
                    : ""
                }
                onChange={(e) =>
                  handleChange([{ value: e.target.value }], {
                    name: "alertname",
                  })
                }
              ></Input>
            </div>
          </FormGroup>
          {filterKeys.map((label) => (
            <FormGroup key={`filter-${label}`}>
              <div className="filter">
                <Label for={`filter-${label}`}>{label}</Label>
                <Select
                  name={label}
                  id={`filter-${label}`}
                  value={transformValuesForSelect(settings[label])}
                  onChange={(value, change) => handleChange(value, change)}
                  options={transformValuesForSelect(labelValues[label])}
                  isLoading={!labelValues || !labelValues[label]}
                  isMulti
                ></Select>
              </div>
            </FormGroup>
          ))}
        </div>
      </Form>
    </div>
  ) : (
    "Loading filters"
  )
}

export default Filters
