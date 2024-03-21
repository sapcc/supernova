import React, { useState, useRef, useEffect } from "react"

import { Alert } from "reactstrap"

import {
  GlobalStateProvider,
  useGlobalState,
  useDispatch,
} from "./lib/globalState"
import reducers from "./reducers"

import Sidebar from "./components/shared/Sidebar"
import SuperNavbar from "./components/shared/Navbar"

import Alerts from "./components/Alerts"
import Filters from "./components/Filters"
import Regions from "./components/Regions"
import LoadingIndicator from "./components/LoadingIndicator"
import AuthError from "./components/AuthError"
import DevTools from "./components/DevTools"

import useModal from "./lib/hooks/useModal"
import SuperModal from "./components/shared/SuperModal"

import useUrlFilters from "./lib/hooks/useUrlFilters"
import useActiveCategoryCounts from "./lib/hooks/useActiveCategoryCounts"
import useInitialLoader from "./lib/hooks/useInitialLoader"
import useOidc from "./lib/hooks/useOidc"

import "./styles/theme.scss"
import "./App.css"

// import AlertsChart from './AlertsChart'
// import AlertDurationChart from "./AlertDurationChart"
import MapDisplay from "./components/display/Map"
import OverviewDisplay from "./components/display/Overview"
import ContactList from "./components/display/contacts"

// Icons --------------------------------------------------------
import { library } from "@fortawesome/fontawesome-svg-core"
import {
  faBars,
  faBell,
  faSun,
  faTimesCircle,
  faCode,
  faAngleUp,
  faAngleDown,
  faAngleRight,
  faUser,
  faAmbulance,
  faExclamationTriangle,
  faPlusCircle,
  faThumbtack,
  faTools,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons"
import { faBellSlash as faBellSlashRegular } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

// build icon library, only needs to be done once, then the icon will be available everywhere, only the FontAwesomeIcon import is necessary in other components
library.add(
  faTools,
  faThumbtack,
  faPlusCircle,
  faBars,
  faBell,
  faBellSlashRegular,
  faSun,
  faTimesCircle,
  faCode,
  faAngleUp,
  faAngleDown,
  faAngleRight,
  faUser,
  faAmbulance,
  faExclamationTriangle,
  faExternalLinkAlt
)
// --------------------------------------------------------------

const App = () => {
  const state = useGlobalState()
  const dispatch = useDispatch()

  const { alerts, silences, categories, labelFilters, user, layout } = state
  const { display, layoutMode, contactsListVisible } = layout
  const showTarget = alerts.showTarget
  const contentRef = useRef(null)
  const { modalIsShowing, closeModal, openModal } = useModal()
  const [modalContent, setModalContent] = useState([])

  const loggedIn = useOidc()
  const initialURLFilters = useUrlFilters(loggedIn, {
    category: categories.active,
    label: labelFilters.settings,
    display: [display],
    layout: [layoutMode],
    show: [showTarget],
    supportcontacts: [contactsListVisible],
  })

  // decide which display mode should be used
  // const currentDisplayMode = useMemo(() => {
  //   if(Array.isArray(initialURLFilters.display) && initialURLFilters.display.length>0) {
  //     if(initialURLFilters.display[0] !== display) return initialURLFilters.display[0]
  //   }

  //   return display
  // },[initialURLFilters.display,display])

  // TODO: Fix browser back (currently display and layoutmode doesn't change on browser back if new mode didn't come via url)

  // get settings from URL and update the state
  useEffect(() => {
    if (!loggedIn) return
    if (
      Array.isArray(initialURLFilters.display) &&
      initialURLFilters.display.length > 0
    ) {
      if (initialURLFilters.display[0] !== display)
        setDisplay(initialURLFilters.display[0])
    }
    if (
      Array.isArray(initialURLFilters.layout) &&
      initialURLFilters.layout.length > 0
    ) {
      if (initialURLFilters.layout[0] !== layoutMode)
        setLayoutMode(initialURLFilters.layout[0])
    }
    if (
      Array.isArray(initialURLFilters.category) &&
      initialURLFilters.category.length > 0
    ) {
      dispatch({ type: "INIT_ACTIVE_ITEMS", items: initialURLFilters.category })
    }
    if (initialURLFilters.label) {
      dispatch({
        type: "INIT_LABEL_FILTERS",
        settings: initialURLFilters.label,
      })
    }
    if (
      Array.isArray(initialURLFilters.supportcontacts) &&
      initialURLFilters.supportcontacts.length > 0
    ) {
      dispatch({
        type: "SET_CONTACTS_LIST_VISIBLE",
        contactsListVisible: initialURLFilters.supportcontacts[0] === "true",
      })
    }

    if (
      Array.isArray(initialURLFilters.show) &&
      initialURLFilters.show.length > 0
    ) {
      if (initialURLFilters.show[0] !== showTarget)
        dispatch({
          type: "SET_SHOW_TARGET",
          showTarget: initialURLFilters.show[0],
        })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn])

  const setDisplay = (mode) => {
    dispatch({ type: "SET_DISPLAY_MODE", display: mode })
  }

  const setLayoutMode = (mode) => {
    dispatch({ type: "SET_LAYOUT_MODE", layoutMode: mode })
  }

  const counts = useActiveCategoryCounts({
    counts: alerts.counts,
    categories: categories.items,
  })

  useInitialLoader({ userProfile: user.profile })

  return (
    <React.Fragment>
      {user.isLoading || alerts.isLoading ? (
        <LoadingIndicator />
      ) : user.error ? (
        <AuthError error={user.error} />
      ) : (
        <div className={`container-fluid page ${display}`}>
          {layoutMode !== "fullscreen" && (
            <Sidebar
              counts={counts}
              currentDisplayMode={display}
              showModal={(content) => {
                setModalContent(content)
                openModal()
              }}
            />
          )}

          <div className="main">
            {layoutMode !== "fullscreen" && (
              <SuperNavbar
                showModal={(content) => {
                  setModalContent(content)
                  openModal()
                }}
              />
            )}

            <div className="content" ref={contentRef}>
              {display === "map" ? (
                <MapDisplay regionCounts={counts.region} />
              ) : display === "overview" ? (
                <OverviewDisplay
                  labelFilters={labelFilters}
                  items={
                    alerts.labelValues ? alerts.labelValues["region"] : null
                  }
                  counts={counts.region}
                />
              ) : (
                <React.Fragment>
                  <Alert color="info" isOpen={true}>
                    <h4>Important Update! 🌟 </h4>
                    <p>
                      Introducing the all-new Supernova, now seamlessly
                      integrated into Greenhouse! 🌿🚀 Discover a range of
                      fantastic new features and enhancements in Greenhouse, our
                      new cloud operations platform:
                    </p>
                    <p className="info">
                      <a
                        className="btn btn-info"
                        href="https://ccloud.dashboard.greenhouse.global.cloud.sap"
                      >
                        <FontAwesomeIcon icon="external-link-alt" />
                        &nbsp; Go to Greenhouse
                      </a>
                    </p>

                    <p>
                      Your feedback matters to us! We genuinely appreciate your
                      thoughts as we work towards making Supernova even better.
                      Give the new Supernova a try and kindly share your
                      insights with us, either in the{" "}
                      <a href="https://convergedcloud.slack.com/archives/C04Q0QM40KF">
                        Greenhouse Slack channel
                      </a>{" "}
                      or open an issue in{" "}
                      <a href="https://github.wdf.sap.corp/cc/greenhouse-extensions/issues">
                        the Greenhouse Extensions Github repo
                      </a>
                    </p>
                  </Alert>
                  <Regions labelFilters={labelFilters} counts={counts.region} />

                  <Filters
                    labelFilters={labelFilters}
                    labelValues={alerts.labelValues}
                  />
                  <Alerts
                    alerts={alerts}
                    updatedAt={alerts.updatedAt}
                    silences={silences}
                    labelFilters={labelFilters}
                    categories={categories}
                    showModal={(content) => {
                      setModalContent(content)
                      openModal()
                    }}
                    showTarget={showTarget}
                  />
                </React.Fragment>
              )}
              <ContactList visible={contactsListVisible} />
            </div>
          </div>

          {(modalContent.header ||
            modalContent.body ||
            modalContent.footer ||
            modalContent.content) && (
            <SuperModal
              size={modalContent.size}
              isShowing={modalIsShowing}
              hide={closeModal}
              header={modalContent.header}
              footer={modalContent.footer}
              body={modalContent.body}
              cancelButtonText={modalContent.cancelButtonText}
            >
              {modalContent.content}
            </SuperModal>
          )}
        </div>
      )}
      {process.env.NODE_ENV === "development" && <DevTools />}
    </React.Fragment>
  )
}
const AppWrapper = () => (
  <GlobalStateProvider reducers={reducers}>
    <App />
  </GlobalStateProvider>
)

export default AppWrapper
