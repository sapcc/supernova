import React from "react"
import { useGlobalState } from "../../lib/globalState"

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
                  <label>Creator</label>: {user.profile.id}
                </div>
                <div className="form-group">
                  <label>Fixed labels</label>

                  <div>
                    {selectedFixedLabelsKeys.map((key, i) => (
                      <span>
                        <strong>{key}</strong>:{" "}
                        {silenceTemplates.selected.fixed_labels[key]}
                        {i < selectedFixedLabelsKeys.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-row">
                    <div className="col">
                      <label>Starts at</label>
                      <input
                        className="form-control"
                        type="date"
                        test={console.log(
                          `${now.getFullYear()}-${
                            now.getMonth() + 1
                          }-${now.getDate()}`
                        )}
                        value={`${now.getFullYear()}-${
                          now.getMonth() + 1
                        }-${now.getDate()}`}
                        onChange={(e) => console.log(e.target.value)}
                      />
                    </div>
                    <div className="col">
                      <label>Time</label>
                      <input className="form-control" type="time" value={now} />
                    </div>
                    <div className="col">
                      <label>Ends at</label>
                      <input className="form-control" type="date" value={now} />
                    </div>
                    <div className="col">
                      <label>Time</label>
                      <input className="form-control" type="time" value={now} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Required labels</label>

                  {chunkArray(silenceTemplates.selected.editable_labels, 3).map(
                    (labels) => (
                      <div className="form-row">
                        {labels.map((label) => (
                          <div className="col">
                            <label>{label}</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder={label}
                            />
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>

                <div className="form-group">
                  <label>Comments</label>
                  <input type="textarea" className="form-control" />
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
