import React, { useMemo, useState, useRef, useEffect } from "react"
import ReactJson from "react-json-view"
import moment from "moment"

import useAppError from "../lib/hooks/useAppError"
import AlertItem from "./AlertItem"
import NewAlertSilenceForm from "./silences/NewAlertSilenceForm"
import AlertDetails from "./AlertDetails"
import AppErrors from "./AppErrors"

const Alerts = React.memo(
  ({
    alerts,
    updatedAt,
    silences,
    categories,
    labelFilters,
    showModal,
    showTarget,
  }) => {
    const tableElement = useRef(null)
    const labelSettings = labelFilters.settings
    const showError = useAppError()

    const activeCategories = useMemo(
      () => categories.items.filter((c) => c.active),
      [categories.items]
    )
    const silencesKeyPayload = useMemo(
      () =>
        silences.items.reduce((hash, silence) => {
          hash[silence.id] = silence
          return hash
        }, {}),
      [silences.items]
    )

    const activeLabelFilters = useMemo(() => {
      const result = {}
      for (let name in labelSettings) {
        if (labelSettings[name] && labelSettings[name].length > 0)
          result[name] = labelSettings[name]
      }
      return result
    }, [labelSettings])

    const pageSize = 100
    const [page, setPage] = useState(1)

    // collect fingerprints of visible alerts
    // returns a hash
    let filteredAlerts = useMemo(() => {
      // don't filter at all if categories are empty
      //if(categories.active.length === 0) return []

      const items = alerts.items.filter((alert) => {
        let visible = true

        if (categories.active.length > 0) {
          visible = activeCategories.reduce(
            (matchesOtherCategories, category) => {
              return (
                matchesOtherCategories &&
                Object.keys(category.match_re).reduce(
                  (matchesOtherLabels, label) => {
                    const regex = new RegExp(category.match_re[label])
                    return matchesOtherLabels && regex.test(alert.labels[label])
                  },
                  true
                )
              )
            },
            true
          )
        }

        if (visible && Object.keys(activeLabelFilters).length >= 0) {
          for (let name in activeLabelFilters) {
            // alertname needs special handling. While other filters can contain multiple values,
            // alertname filter contains exactly one value. Each alert is checked whether
            // it contains the searched alertname as a substring.
            if (name === "alertname") {
              const searchTerm =
                activeLabelFilters[name] && activeLabelFilters[name].length > 0
                  ? activeLabelFilters[name][0]
                  : ""
              if (
                alert.labels[name] &&
                alert.labels[name].indexOf(searchTerm) < 0
              )
                visible = false
            } else if (activeLabelFilters[name].indexOf(alert.labels[name]) < 0)
              visible = false
          }
        }

        return visible
      })
      if (items.length / pageSize < page) setPage(1)
      return items
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alerts.updatedAt, categories, activeCategories, activeLabelFilters])

    // on load check if an alert id has been set in the URL. If so, show the alert details modal window for this alert
    useEffect(() => {
      if (showTarget && showTarget.length > 0) {
        const showAlert = filteredAlerts.find(
          (alert) => alert.fingerprint === showTarget
        )
        if (showAlert) {
          showDetailsModal(showAlert)
        } else {
          showError(
            "The alert you are trying to view isn't firing currently or doesn't exist so unfortunately we cannot display it at this time",
            "info",
            10000
          )
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // opens a modal window with silence form
    const createAlertSilence = React.useCallback(
      (alert) => {
        return new Promise((resolve, reject) =>
          showModal({
            size: "lg",
            header: `New Silence ${
              alert.labels.alertname && `for alert ${alert.labels.alertname}`
            } in ${alert.labels.region} `,
            // props are Body, Buttons and hide
            content: (props) => (
              <NewAlertSilenceForm
                alert={alert}
                onSuccess={resolve}
                onFailure={reject}
                {...props}
              />
            ),
          })
        )
      },
      [showModal]
    )

    const toggleInhibitedModal = React.useCallback(
      (fingerprint) => {
        if (Array.isArray(fingerprint)) fingerprint = fingerprint[0]
        const alert = alerts.items.find((a) => a.fingerprint === fingerprint)
        if (!alert) return
        showModal({
          header: <React.Fragment>Alert</React.Fragment>,
          body: (
            <ReactJson
              src={alert}
              collapsed={2}
              collapseStringsAfterLength={100}
            />
          ),
          cancelButtonText: "Close",
        })
      },
      [alerts.items, showModal]
    )

    const toggleAckedModal = React.useCallback(
      (payload) => {
        showModal({
          header: <React.Fragment>Acknowledgement</React.Fragment>,
          body: (
            <ReactJson
              src={payload}
              collapsed={2}
              collapseStringsAfterLength={100}
            />
          ),
          cancelButtonText: "Close",
        })
      },
      [showModal]
    )

    const toggleSilenceModal = React.useCallback(
      (silenceId) => {
        if (!silencesKeyPayload[silenceId]) return
        showModal({
          header: <React.Fragment>Silence</React.Fragment>,
          body: (
            <ReactJson
              src={silencesKeyPayload[silenceId]}
              collapsed={2}
              collapseStringsAfterLength={100}
            />
          ),
          cancelButtonText: "Close",
        })
      },
      [silencesKeyPayload, showModal]
    )

    const alertCounts = React.useCallback((alerts) => {
      const criticals = alerts.filter(
        (alert) => alert.labels.severity === "critical"
      ).length
      const warnings = alerts.filter(
        (alert) => alert.labels.severity === "warning"
      ).length
      const infos = alerts.filter((alert) => alert.labels.severity === "info")
        .length

      return (
        <React.Fragment>
          {alerts.length} alerts{" "}
          <span className="u-text-info">
            ({criticals} critical, {warnings} warning, {infos} info)
          </span>
        </React.Fragment>
      )
    }, [])

    const showDetailsModal = React.useCallback(
      (alert) => {
        showModal({
          header: (
            <React.Fragment>
              Details for{" "}
              <span className="u-text-info">
                &quot;{alert.annotations.summary}&quot;
              </span>
            </React.Fragment>
          ),
          content: (props) => (
            <AlertDetails
              alert={alert}
              labelSettings={labelSettings}
              silencesKeyPayload={silencesKeyPayload}
              showDetails={() => showDetailsModal(alert)}
              showInhibitedBy={(fingerprint) =>
                toggleInhibitedModal(fingerprint)
              }
              showSilencedBy={(silenceId) => toggleSilenceModal(silenceId)}
              showAckedBy={(payload) => toggleAckedModal(payload)}
              createSilence={createAlertSilence}
              {...props}
            />
          ),
        })
      },
      [
        showModal,
        labelSettings,
        silencesKeyPayload,
        createAlertSilence,
        toggleInhibitedModal,
        toggleSilenceModal,
        toggleAckedModal,
      ]
    )

    return (
      <React.Fragment>
        <AppErrors />
        <div className="toolbar toolbar-info">
          {alertCounts(filteredAlerts)}
          <span className="info-low-prio u-margin-left-auto">
            updated: {moment(updatedAt).format("HH:mm:ss")}
          </span>
        </div>
        <table className="alerts table table-main" ref={tableElement}>
          <thead>
            <tr>
              <th>Region</th>
              <th>Service</th>
              <th>Title</th>
              <th className="text-nowrap snug">Firing Since</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.slice(0, page * pageSize).map((alert, index) => (
              //index >= start && index <= end &&
              <AlertItem
                key={alert.fingerprint}
                alert={alert}
                visible={true}
                labelSettings={labelSettings}
                silencesKeyPayload={silencesKeyPayload}
                showDetails={() => showDetailsModal(alert)}
                showInhibitedBy={(fingerprint) =>
                  toggleInhibitedModal(fingerprint)
                }
                showSilencedBy={(silenceId) => toggleSilenceModal(silenceId)}
                showAckedBy={(payload) => toggleAckedModal(payload)}
                createSilence={createAlertSilence}
              />
            ))}
          </tbody>
        </table>
        {page * pageSize < filteredAlerts.length && (
          <nav aria-label="Alerts navigation">
            <ul className="pagination justify-content-end">
              <li className="page-item">
                <button
                  className="page-link"
                  tabIndex="-1"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(page + 1)
                  }}
                >
                  Load next
                </button>
              </li>
              {/*<li>  
              <button className="page-link" tabIndex="-1" onClick={(e) => {e.preventDefault(); setPage(Math.ceil(filteredAlerts.length/pageSize))}}>
                All
              </button>
            </li>*/}
            </ul>
          </nav>
        )}
      </React.Fragment>
    )
  },
  (oldProps, newProps) => {
    // speedup
    // do not re-render table if no changes
    const identical =
      oldProps.alerts.updatedAt === newProps.alerts.updatedAt &&
      oldProps.silences.updatedAt === newProps.silences.updatedAt &&
      oldProps.categories === newProps.categories &&
      oldProps.labelFilters === newProps.labelFilters
    return identical
  }
)

export default Alerts
