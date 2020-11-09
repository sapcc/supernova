import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { chunkArray } from "../../lib/utilities"
import { Button, Form, FormGroup, Alert, Label, Input, Col } from "reactstrap"
import apiClient from "../../lib/apiClient"

// Do not use global state
const initialState = {
  templates: {
    items: [],
    error: null,
    isLoading: false,
    selected: null,
    current: null,
  },

  startDate: "",
  startTime: "",
  startDateValid: false,
  startTimeValid: false,
  endDate: "",
  endTime: "",
  endDateValid: false,
  endTimeValid: false,

  comment: "",
  error: null,
  isSaving: false,
  submitted: false,
  labelValues: {},
}

const init = (state) => {
  const now = new Date(Date.now() + 60 * 60 * 1000)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  return {
    ...state,
    startDate: formatDateForInput(now),
    startDateValid: true,
    startTime: formatTimeForInput(now),
    startTimeValid: true,
    endDate: formatDateForInput(tomorrow),
    endDateValid: true,
    endTime: formatTimeForInput(tomorrow),
    endTimeValid: true,
    submitted: false,
  }
}

const formatDateForInput = (date) =>
  `${date.getFullYear()}-${date.getMonth() < 9 ? "0" : ""}${
    date.getMonth() + 1
  }-${date.getDate() < 10 ? "0" : ""}${date.getDate()}`

const formatTimeForInput = (date) =>
  `${date.getHours() < 9 ? "0" : ""}${date.getHours()}:${
    date.getMinutes() < 10 ? "0" : ""
  }${date.getMinutes()}`

const validateInputDate = (value) =>
  value && value.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
const validateInputTime = (value) => value && value.match(/^[0-9]{2}:[0-9]{2}$/)
const validateLabelValue = (value) => {
  try {
    return !!new RegExp(value)
  } catch (e) {
    return false
  }
}

const valueToDate = (date, time) => {
  let dateValues = date.split("-")
  dateValues[1] = dateValues[1] - 1
  if (time) dateValues = dateValues.concat(time.split(":"))
  dateValues = dateValues.map((v) => parseInt(v))
  return new Date(...dateValues)
}

function reducer(state, action) {
  switch (action.type) {
    case "REQUEST_TEMPLATES":
      return {
        ...state,
        templates: { ...state.templates, isLoading: true, error: null },
      }
    case "RECEIVE_TEMPLATES":
      return {
        ...state,
        templates: {
          ...state.templates,
          isLoading: false,
          error: null,
          items: action.templates,
        },
      }
    case "TEMPLATES_ERROR":
      return {
        ...state,
        templates: {
          ...state.templates,
          isLoading: false,
          error: action.error,
        },
      }
    case "SELECT_TEMPLATE":
      const newState = {
        ...state,
        templates: {
          ...state.templates,
          selected: action.value,
          current: state.templates.items[action.value],
        },
      }

      // set default values for editable_labels
      const cur = newState.templates.current
      const def_values = cur && cur.editable_labels_default_values
      if (cur && cur.editable_labels && def_values) {
        newState.labelValues = newState.labelValues || {}
        cur.editable_labels.forEach((label, i) => {
          if (def_values[i]) {
            newState.labelValues[label] = {
              value: def_values[i],
              valid: !!def_values[i],
            }
          }
        })
      }
      return newState

    case "START_DATE":
      let startDateValidation =
        valueToDate(state.endDate, state.endTime) >
        valueToDate(action.value, state.startTime)

      return {
        ...state,
        startDate: action.value,
        startDateValid: validateInputDate(action.value),
        endDateValid: startDateValidation,
        endTimeValid: startDateValidation,
      }
    case "START_TIME":
      let startTimeValidation =
        valueToDate(state.endDate, state.endTime) >
        valueToDate(state.startDate, action.value)
      return {
        ...state,
        startTime: action.value,
        startTimeValid: validateInputTime(action.value),
        endDateValid: startTimeValidation,
        endTimeValid: startTimeValidation,
      }
    case "END_DATE":
      let endDateValidation =
        valueToDate(action.value, state.endTime) >
        valueToDate(state.startDate, state.startTime)

      return {
        ...state,
        endDate: action.value,
        endDateValid: validateInputDate(action.value) && endDateValidation,
        endTimeValid: endDateValidation,
      }
    case "END_TIME":
      let endTimeValidation =
        valueToDate(state.endDate, action.value) >
        valueToDate(state.startDate, state.startTime)

      return {
        ...state,
        endTime: action.value,
        endDateValid: endTimeValidation,
        endTimeValid: validateInputTime(action.value) && endTimeValidation,
      }
    case "LABEL_VALUE":
      return {
        ...state,
        labelValues: {
          ...state.labelValues,
          [action.name]: {
            value: action.value,
            valid: validateLabelValue(action.valid),
          },
        },
      }

    case "COMMENT":
      return {
        ...state,
        comment: action.value,
      }

    case "ERROR":
      return { ...state, isSaving: false, error: action.error }
    case "SUBMIT":
      return { ...state, isSaving: true }
    case "SUCCESS":
      return { ...state, isSaving: false, submitted: true }
    case "RESET":
      return init(state)
    default:
      throw new Error()
  }
}

const NewForm = ({ Body, Buttons, hide }) => {
  const [form, dispatch] = React.useReducer(reducer, initialState, init)

  const templatesItems = React.useMemo(
    () => form.templates.items.filter((t) => t.status === "active"),
    [form.templates]
  )

  React.useEffect(() => {
    if (form && form.templates && form.templates.current) {
      form.templates.current.editable_labels =
        form.templates.current.editable_labels || []
    }
  }, [form])

  const selectedFixedLabelsKeys = React.useMemo(
    () =>
      form.templates.current &&
      Object.keys(form.templates.current.fixed_labels),
    [form.templates]
  )

  React.useEffect(() => {
    dispatch({ type: "REQUEST_TEMPLATES" })
    //dispatch({ type: "RESET" })

    apiClient
      .request("/api/support/silence-templates")
      .then((response) => response.json())
      .then((templates) => {
        dispatch({ type: "RECEIVE_TEMPLATES", templates })
      })
      .catch((error) => dispatch({ type: "TEMPLATES_ERROR", error }))
  }, [])

  const valid = () => {
    let isValid =
      form.startDateValid &&
      form.startTimeValid &&
      form.endDateValid &&
      form.endTimeValid &&
      (!form.templates.current.editable_labels ||
        form.templates.current.editable_labels.reduce(
          (bool, label) =>
            bool &&
            !!form.labelValues[label] &&
            !!form.labelValues[label].valid,
          [true]
        ))
    return isValid
  }

  const submit = () => {
    if (!valid) return
    const silence = {
      startsAt: valueToDate(form.startDate, form.startTime),
      endsAt: valueToDate(form.endDate, form.endTime),
      matchers: [],
      comment: form.comment,
    }
    for (let label in form.templates.current.fixed_labels) {
      silence.matchers.push({
        name: label,
        value: form.templates.current.fixed_labels[label],
        isRegex: true, //false,
      })
    }
    form.templates.current.editable_labels.forEach((label) => {
      silence.matchers.push({
        name: label,
        value: form.labelValues[label].value,
        isRegex: true,
      })
    })

    dispatch({ type: "SUBMIT" })
    apiClient
      .request("/api/silences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(silence),
      })
      .then(() => dispatch({ type: "SUCCESS" }))
      .catch((error) => dispatch({ type: "ERROR", error }))
  }

  if (form.submitted)
    return (
      <>
        <Body>
          <Alert color="success">
            Silence was created successfully!
            <a
              rel="noopener noreferrer"
              href={process.env.REACT_APP_ALERTMANAGER_API_ENDPOINT.replace(
                "/api/v2",
                "#/silences"
              )}
              target="_blank"
            >
              <br />
              Show in Alert Manager
            </a>
          </Alert>

          <br />
          <Button
            className="btn btn-primary"
            onClick={(e) => dispatch({ type: "RESET" })}
          >
            Create New
          </Button>
        </Body>
        <Buttons>
          <Button type="button" onClick={hide} className="btn btn-secondary">
            Close
          </Button>
        </Buttons>
      </>
    )

  return (
    <Form
      style={{ overflow: "auto" }}
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <Body>
        {form.templates.isLoading ? (
          "Loading templates ..."
        ) : (
          <>
            {templatesItems.length > 0 ? (
              <FormGroup>
                <Input
                  type="select"
                  className="form-control"
                  value={form.templates.selected || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SELECT_TEMPLATE",
                      value: e.target.value,
                    })
                  }
                >
                  <option>Select template</option>
                  {templatesItems.map((template, index) => (
                    <option key={index} value={index}>
                      {template.title}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            ) : (
              <Alert color="info">This feature is coming soon!</Alert>
            )}
            {form.templates.selected && (
              <>
                <FormGroup>
                  <Alert color="secondary">
                    {form.templates.current.description}
                  </Alert>
                </FormGroup>

                <FormGroup row>
                  <Col sm="3">
                    <Label>
                      Starts at <span className="text-danger">*</span>
                    </Label>

                    <Input
                      className={`form-control ${
                        form.startDateValid ? "is-valid" : "is-invalid"
                      }`}
                      type="date"
                      value={form.startDate}
                      placeholder="yyyy-mm-dd"
                      onChange={(e) =>
                        dispatch({
                          type: "START_DATE",
                          value: e.target.value,
                        })
                      }
                    />
                    {!form.startDateValid && (
                      <div className="invalid-feedback">
                        The start date must be in the correct format
                      </div>
                    )}
                  </Col>
                  <Col sm="3">
                    <Label>
                      Time <span className="text-danger">*</span>
                    </Label>
                    <Input
                      className={`form-control ${
                        form.startTimeValid ? "is-valid" : "is-invalid"
                      }`}
                      type="time"
                      value={form.startTime}
                      placeholder="hh:mm"
                      onChange={(e) =>
                        dispatch({
                          type: "START_TIME",
                          value: e.target.value,
                        })
                      }
                    />
                    {!form.startDateValid && (
                      <div className="invalid-feedback">
                        The start time must be in the correct format
                      </div>
                    )}
                  </Col>
                  <Col sm="3">
                    <Label>
                      Ends at <span className="text-danger">*</span>
                    </Label>
                    <Input
                      className={`form-control ${
                        form.endDateValid ? "is-valid" : "is-invalid"
                      }`}
                      type="date"
                      value={form.endDate}
                      placeholder="yyyy-mm-dd"
                      onChange={(e) =>
                        dispatch({
                          type: "END_DATE",
                          value: e.target.value,
                        })
                      }
                    />
                    <div className="invalid-feedback">
                      The end date must be in the correct format and must be
                      after the start date
                    </div>
                  </Col>
                  <Col sm="3">
                    <Label>
                      Time <span className="text-danger">*</span>
                    </Label>
                    <input
                      className={`form-control ${
                        form.endTimeValid ? "is-valid" : "is-invalid"
                      }`}
                      type="time"
                      value={form.endTime}
                      placeholder="hh:mm"
                      onChange={(e) =>
                        dispatch({
                          type: "END_TIME",
                          value: e.target.value,
                        })
                      }
                    />
                    <div className="invalid-feedback">
                      The end time must be in the correct format and must be
                      after the start date
                    </div>
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Label>Labels</Label>
                  <div className="alert alert-info">
                    You may use regular expressions for labels
                  </div>

                  {form &&
                    form.templates &&
                    form.templates.current &&
                    form.templates.current.editable_labels &&
                    chunkArray(form.templates.current.editable_labels, 3).map(
                      (labels, i) => (
                        <div key={i} className="form-row">
                          {labels.map((label, j) => (
                            <div key={j} className="col-sm-4">
                              <div className="input-group mb-3">
                                <div className="input-group-prepend ">
                                  <span className="input-group-text">
                                    {label}{" "}
                                    <span className="text-danger"> *</span>
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  className={`form-control ${
                                    form.labelValues[label] &&
                                    form.labelValues[label].valid
                                      ? "is-valid"
                                      : "is-invalid"
                                  }`}
                                  placeholder={
                                    (form.templates.current
                                      .editable_labels_default_values &&
                                      form.templates.current
                                        .editable_labels_default_values[i]) ||
                                    label
                                  }
                                  value={
                                    (form.labelValues[label] &&
                                      form.labelValues[label].value) ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    dispatch({
                                      type: "LABEL_VALUE",
                                      name: label,
                                      value: e.target.value,
                                    })
                                  }
                                />
                                {(!form.labelValues[label] ||
                                  !form.labelValues[label].valid) && (
                                  <div className="invalid-feedback">
                                    {`${label} is required`}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  {chunkArray(selectedFixedLabelsKeys, 3).map((keys, i) => (
                    <div key={i} className="form-row">
                      {keys.map((key) => (
                        <div key={key} className="col-sm-4">
                          <div className="input-group mb-3">
                            <div className="input-group-prepend">
                              <span className="input-group-text">{key}</span>
                            </div>
                            <input
                              type="text"
                              className="form-control"
                              value={form.templates.current.fixed_labels[key]}
                              disabled
                            />
                            <div className="input-group-append">
                              <span className="input-group-text">
                                <FontAwesomeIcon
                                  icon="thumbtack"
                                  className="logo"
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </FormGroup>

                <FormGroup>
                  <Label>Comment</Label>
                  <input
                    type="textarea"
                    className="form-control"
                    value={form.comment}
                    onChange={(e) =>
                      dispatch({ type: "COMMENT", value: e.target.value })
                    }
                  />
                </FormGroup>

                {/* {JSON.stringify(selected)} */}
              </>
            )}
          </>
        )}
      </Body>
      <Buttons>
        <Button type="button" onClick={hide} className="btn btn-secondary">
          Cancel
        </Button>
        <Button
          type="submit"
          className="btn btn-primary"
          disabled={
            form.isSaving ||
            form.templates.isLoading ||
            !form.templates.current ||
            !valid()
          }
        >
          Submit
        </Button>
      </Buttons>
    </Form>
  )
}

export default NewForm
