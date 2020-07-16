import React from "react"
import { useGlobalState } from "../../lib/globalState"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

// Do not use global state
// the silence templates are loaded every time this form is mounted!
const initialState = {
  items: [],
  error: null,
  isLoading: false,
  selected: null,
}

function reducer(state, action) {
  switch (action.type) {
    case "REQUEST":
      return { ...state, isLoading: true, error: null }
    case "RECEIVE":
      return {
        ...state,
        isLoading: false,
        error: null,
        items: action.templates,
      }
    case "ERROR":
      return { ...state, isLoading: false, error: action.error }
    case "SELECT":
      return { ...state, selected: state.items[action.index] }
    default:
      throw new Error()
  }
}

function chunkArray(myArray, chunk_size) {
  var index = 0
  var arrayLength = myArray.length
  var tempArray = []

  for (index = 0; index < arrayLength; index += chunk_size) {
    const myChunk = myArray.slice(index, index + chunk_size)
    // Do something if you want with the group
    tempArray.push(myChunk)
  }

  return tempArray
}

const NewForm = ({ Body, Buttons, hide }) => {
  const { user } = useGlobalState()
  const [isSaving, setIsSaving] = React.useState(false)

  const [silenceTemplates, dispatch] = React.useReducer(reducer, initialState)
  const selectedFixedLabelsKeys = React.useMemo(
    () =>
      silenceTemplates.selected &&
      Object.keys(silenceTemplates.selected.fixed_labels),
    [silenceTemplates.selected]
  )

  React.useEffect(() => {
    dispatch({ type: "REQUEST" })

    fetch("/api/support/silence-templates")
      .then((response) => response.json())
      .then((templates) => {
        dispatch({ type: "RECEIVE", templates })
      })
      .catch((error) => dispatch({ type: "ERROR", error }))

    return () => {
      dispatch({ type: "SELECT", index: -1 })
    }
  }, [])

  const now = new Date()

  return (
    <form style={{ overflow: "auto" }}>
      <Body>
        {silenceTemplates.isLoading ? (
          "Loading templates ..."
        ) : (
          <>
            <div className="form-group">
              <select
                className="form-control"
                value={silenceTemplates.selected || ""}
                onChange={(e) =>
                  dispatch({ type: "SELECT", index: e.target.value })
                }
              >
                <option>Select template</option>
                {silenceTemplates.items.map((template, index) => (
                  <option key={index} value={index}>
                    {template.title}
                  </option>
                ))}
              </select>
            </div>
            {silenceTemplates.selected && (
              <>
                <div className="form-group">
                  <div className="alert alert-secondary" role="alert">
                    {silenceTemplates.selected.description}
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-row">
                    <div className="col">
                      <label>
                        Starts at <span className="text-danger">*</span>
                      </label>

                      <input
                        className="form-control"
                        type="date"
                        value={`${now.getFullYear()}-${
                          now.getMonth() < 9 ? "0" : ""
                        }${now.getMonth() + 1}-${
                          now.getDate() < 10 ? "0" : ""
                        }${now.getDate()}`}
                        placeholder="dd.mm.yyyy"
                        onChange={(e) => console.log(e.target.value)}
                      />
                    </div>
                    <div className="col">
                      <label>
                        Time <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="time"
                        value="12:10"
                      />
                    </div>
                    <div className="col">
                      <label>
                        Ends at <span className="text-danger">*</span>
                      </label>
                      <input className="form-control" type="date" value={now} />
                    </div>
                    <div className="col">
                      <label>
                        Time <span className="text-danger">*</span>
                      </label>
                      <input className="form-control" type="time" value={now} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Labels</label>
                  <div className="alert alert-info">
                    Please use regular expressions for labels
                  </div>

                  {chunkArray(silenceTemplates.selected.editable_labels, 3).map(
                    (labels, i) => (
                      <div key={i} className="form-row">
                        {labels.map((label, j) => (
                          <div key={j} className="col-4">
                            <div className="input-group mb-3">
                              <div className="input-group-prepend ">
                                <span className="input-group-text">
                                  {label}{" "}
                                  <span className="text-danger"> *</span>
                                </span>
                              </div>
                              <input
                                type="text"
                                className="form-control"
                                placeholder={label}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {chunkArray(selectedFixedLabelsKeys, 3).map((keys, i) => (
                    <div key={i} className="form-row">
                      {keys.map((key) => (
                        <div key={key} className="col-4">
                          <div className="input-group mb-3">
                            <div className="input-group-prepend">
                              <span className="input-group-text">{key}</span>
                            </div>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={
                                silenceTemplates.selected.fixed_labels[key]
                              }
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
                </div>

                <div className="form-group">
                  <label>Comment</label>
                  <input type="textarea" className="form-control" />
                </div>

                <div className="form-group">
                  <label>Creator</label>: {user.profile.id}
                </div>

                {/* {JSON.stringify(selected)} */}
              </>
            )}
          </>
        )}
      </Body>
      <Buttons>
        <button type="button" onClick={hide} className="btn btn-secondary">
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            isSaving || silenceTemplates.isLoading || !silenceTemplates.selected
          }
        >
          Submit
        </button>
      </Buttons>
    </form>
  )
}

export default NewForm
