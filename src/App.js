import React, { useState, useRef, useEffect } from 'react';

import { GlobalStateProvider, useGlobalState, useDispatch } from './lib/globalState'
import reducers from './reducers'

import Sidebar from './components/shared/Sidebar'
import SuperNavbar from './components/shared/Navbar'

import Alerts from './components/Alerts'
import Filters from './components/Filters'
import Regions from './components/Regions'
import LoadingIndicator from './components/LoadingIndicator'
import AuthError from './components/AuthError'
import DevTools from './components/DevTools'

import useModal from './lib/hooks/useModal'
import SuperModal from './components/shared/SuperModal'

import useUrlFilters from './lib/hooks/useUrlFilters'
import useActiveCategoryCounts from './lib/hooks/useActiveCategoryCounts'
import useInitialLoader from './lib/hooks/useInitialLoader'

import './styles/theme.scss'
import './App.css'

// import AlertsChart from './AlertsChart'
// import AlertDurationChart from './AlertDurationChart'
import MapDisplay from './components/display/Map'
import OverviewDisplay from './components/display/Overview'

// Icons --------------------------------------------------------
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faBars, faBell, faSun, faTimesCircle, faCode, 
  faAngleUp, faAngleDown, faUser
} from '@fortawesome/free-solid-svg-icons'
import {
  faBellSlash as faBellSlashRegular
} from '@fortawesome/free-regular-svg-icons'


// build icon library, only needs to be done once, then the icon will be available everywhere, only the FontAwesomeIcon import is necessary in other components
library.add( faBars, faBell, faBellSlashRegular, faSun, faTimesCircle, faCode, faAngleUp, faAngleDown, faUser )
// --------------------------------------------------------------

const App = () => {
  const state = useGlobalState()
  const dispatch = useDispatch()

  const {alerts, silences, categories, labelFilters, user, layout} = state
  const display = layout.display
  const layoutMode = layout.layoutMode
  const showTarget = alerts.showTarget
  const contentRef = useRef(null)
  const {modalIsShowing, closeModal,openModal} = useModal()
  const [modalContent, setModalContent] = useState([])
  // const [showTarget, setShowTarget] = useState([])

  const initialURLFilters = useUrlFilters({"category": categories.active, "label": labelFilters.settings, "display": [display], "layout": [layoutMode], "show": [showTarget]})
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
    if(Array.isArray(initialURLFilters.display) && initialURLFilters.display.length>0) {
      if(initialURLFilters.display[0] !== display) setDisplay(initialURLFilters.display[0])
    }
    if(Array.isArray(initialURLFilters.layout) && initialURLFilters.layout.length>0) {
      if(initialURLFilters.layout[0] !== layoutMode) setLayoutMode(initialURLFilters.layout[0])
    }
    if(Array.isArray(initialURLFilters.category) && initialURLFilters.category.length > 0) {
      dispatch({type: 'INIT_ACTIVE_ITEMS', items: initialURLFilters.category})
    }
    if(initialURLFilters.label) {
      dispatch({type: 'INIT_LABEL_FILTERS', settings: initialURLFilters.label})
    }

    if(Array.isArray(initialURLFilters.show) && initialURLFilters.show.length>0) {
      if(initialURLFilters.show[0] !== showTarget) dispatch({type: 'SET_SHOW_TARGET', showTarget: initialURLFilters.show[0]})
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])  

  const toggleDetailsModal = (alert) => {
    setModalContent({
      header: <React.Fragment>Raw Data for <span className="u-text-info">&quot;{alert.annotations.summary}&quot;</span></React.Fragment>,
      body: <React.Fragment>{alert.annotations.description}</React.Fragment>,
      cancelButtonText: "Close" 
    })
    toggleModal()
  }

  const setDisplay = (mode) => {
    dispatch({type: 'SET_DISPLAY_MODE', display: mode})
  }

  const setLayoutMode = (mode) => {
    dispatch({type: 'SET_LAYOUT_MODE', layoutMode: mode})
  }

  const counts = useActiveCategoryCounts({counts: alerts.counts, categories: categories.items})
  
  //useAlertsLoader(initialURLFilters)
  //useUserProfileLoader()
  useInitialLoader({urlFilters: initialURLFilters, userProfile: user.profile})

  return (
    <React.Fragment>
      {(user.isLoading || alerts.isLoading)
        ? <LoadingIndicator/>
        : user.error 
          ? <AuthError error={user.error}/>
          :
          <div className={`container-fluid page ${display}`}>
            
            { layoutMode !== 'fullscreen' && <Sidebar counts={counts} currentDisplayMode={display} /> }

            <div className="main">
              { layoutMode !== 'fullscreen' && <SuperNavbar /> }

              <div className="content" ref={contentRef}>
                { display === 'map' 
                  ? <MapDisplay regionCounts={counts.region}/>
                  : display === 'overview' 
                    ? <OverviewDisplay labelFilters={labelFilters} items={alerts.labelValues ? alerts.labelValues['region'] : null} counts={counts.region} />
                    :
                    <React.Fragment>
                      <Regions
                        labelFilters={labelFilters}
                        counts={counts.region}/>

                      <Filters labelFilters={labelFilters} labelValues={alerts.labelValues} />
                      <Alerts 
                        alerts={alerts}
                        silences={silences}
                        labelFilters={labelFilters} 
                        categories={categories}
                        showModal={(content) => { setModalContent(content); openModal() }}
                        showTarget={showTarget}
                      />
                    </React.Fragment> 
                }
              </div>
            </div> 

            {(modalContent.header || modalContent.body || modalContent.footer || modalContent.content) && 
              <SuperModal 
                size={modalContent.size}
                isShowing={modalIsShowing} 
                hide={closeModal} 
                header={modalContent.header} 
                footer={modalContent.footer} 
                body={modalContent.body}
                cancelButtonText={modalContent.cancelButtonText}>
                  {modalContent.content}
              </SuperModal>
            }

          </div>
      }
      {process.env.NODE_ENV === 'development' && <DevTools/>}
    </React.Fragment>
  )
}

export default () => <GlobalStateProvider reducers={reducers}><App/></GlobalStateProvider>
