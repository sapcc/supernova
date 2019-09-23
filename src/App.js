import React, { useState, useRef, useMemo, useEffect } from 'react';

import { GlobalStateProvider, useGlobalState, useDispatch } from './lib/globalState'
import reducers from './reducers'

import Categories from './components/Categories'
import Alerts from './components/Alerts'
import Filters from './components/Filters'
import Regions from './components/Regions'
import DevTools from './components/DevTools'

import useModal from './lib/hooks/useModal'
import SuperModal from './components/shared/SuperModal'

import useUrlFilters from './lib/hooks/useUrlFilters'
import useActiveCategoryCounts from './lib/hooks/useActiveCategoryCounts'
import useAlertsLoader from './lib/hooks/useAlertsLoader'
import useUserProfileLoader from './lib/hooks/useUserProfileLoader'

import './styles/theme.scss'
import './App.css'

// import AlertsChart from './AlertsChart'
// import AlertDurationChart from './AlertDurationChart'
import MapDisplay from './components/display/Map'
import OverviewDisplay from './components/display/Overview'

// Icons --------------------------------------------------------
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faBell, faSun, faTimesCircle, faCode, 
  faAngleUp, faAngleDown
} from '@fortawesome/free-solid-svg-icons'
import {
  faBellSlash as faBellSlashRegular
} from '@fortawesome/free-regular-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// build icon library, only needs to be done once, then the icon will be available everywhere, only the FontAwesomeIcon import is necessary in other components
library.add( faBell, faBellSlashRegular, faSun, faTimesCircle, faCode, faAngleUp, faAngleDown )
// --------------------------------------------------------------

const App = () => {
  const state = useGlobalState()
  const dispatch = useDispatch()

  const {alerts, silences, categories, labelFilters, user} = state
  const contentRef = useRef(null)
  const {modalIsShowing, toggleModal} = useModal()
  const [modalContent, setModalContent] = useState([])
  const [display,updateDisplay] = useState('dashboard')

  const initialURLFilters = useUrlFilters({"category": categories.active, "label": labelFilters.settings, "display": [display]})

  // decide which display mode should be used
  const currentDisplayMode = useMemo(() => {
    if(Array.isArray(initialURLFilters.display) && initialURLFilters.display.length>0) {
      if(initialURLFilters.display[0] !== display) return initialURLFilters.display[0]
    }
    return display
  },[initialURLFilters.display,display])

  // get settings from URL and update the state
  useEffect(() => {
    if(Array.isArray(initialURLFilters.display) && initialURLFilters.display.length>0) {
      if(initialURLFilters.display[0] !== display) updateDisplay(initialURLFilters.display[0])
    }
    if(Array.isArray(initialURLFilters.category) && initialURLFilters.category.length > 0) {
      dispatch({type: 'INIT_ACTIVE_ITEMS', items: initialURLFilters.category})
    }
    if(initialURLFilters.label) {
      dispatch({type: 'INIT_LABEL_FILTERS', settings: initialURLFilters.label})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const counts = useActiveCategoryCounts({counts: alerts.counts, categories: categories.items})

  useAlertsLoader(initialURLFilters)
  useUserProfileLoader()

  if( currentDisplayMode === 'overview') return <OverviewDisplay regionCounts={counts.region}/>
  if( currentDisplayMode === 'map') return <MapDisplay regionCounts={counts.region}/>

  return (
    {(!user.profile || user.isLoading) && <div>Loading...</div>}
    {user.profile && 
      <div className="container-fluid page">
        <div className="sidebar ">
          <div className="sidebar-brand"><FontAwesomeIcon icon="sun" className="logo" />Supernova</div>
          <ul className="sidebar-nav">
            <li className="sidebar-folder">
              <span className="sidebar-link active"><FontAwesomeIcon icon="bell" fixedWidth />Alerts</span>
              <Categories categories={categories} counts={counts.category}/>
            </li>
          </ul>  
        </div>  


        <div className="main">
          <nav className="navbar"/>

          <div className="content" ref={contentRef}>
            <Regions
              categories={categories}
              labelFilters={labelFilters} 
              items={alerts.labelValues ? alerts.labelValues['region'] : null} 
              counts={counts.region}
            />
            <Filters labelFilters={labelFilters} labelValues={alerts.labelValues} />
            <Alerts 
              alerts={alerts}
              silences={silences}
              labelFilters={labelFilters} 
              categories={categories}
              showModal={(content) => { setModalContent(content); toggleModal() }}
            />
          </div>
        </div> 

        <SuperModal 
          isShowing={modalIsShowing} 
          hide={toggleModal} 
          header={modalContent.header} 
          footer={modalContent.footer} 
          cancelButtonText={modalContent.cancelButtonText}>
            {modalContent.body}
        </SuperModal>

        {process.env.NODE_ENV === 'development' && <DevTools/>}
      </div>
    }
  )
}

export default () => <GlobalStateProvider reducers={reducers}><App/></GlobalStateProvider>
