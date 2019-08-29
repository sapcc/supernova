import React, { useState, useRef } from 'react';

import { GlobalStateProvider, useGlobalState } from './lib/globalState'
import reducers from './reducers'

import Categories from './components/Categories'
import Alerts from './components/Alerts'
import Filters from './components/Filters'
import Regions from './components/Regions'
import DevTools from './components/DevTools'

import useModal from './lib/hooks/useModal'
import SuperModal from './components/shared/SuperModal'

import useUrlFilters from './lib/hooks/useUrlFilters'
import useCounts from './lib/hooks/useCounts'
import useInitialLoader from './lib/hooks/useInitialLoader'

import './styles/theme.scss'
import './App.css'
// import AlertsChart from './AlertsChart'
// import AlertDurationChart from './AlertDurationChart'

// Icons --------------------------------------------------------
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faBell, faSun, faTimesCircle, faCode, 
  faAngleUp, faAngleDown 
} from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// build icon library, only needs to be done once, then the icon will be available everywhere, only the FontAwesomeIcon import is necessary in other components
library.add( faBell, faSun, faTimesCircle, faCode, faAngleUp, faAngleDown )
// --------------------------------------------------------------

const App = () => {
  const state = useGlobalState()
  const {alerts, silences, categories, labelFilters} = state
  const contentRef = useRef(null)
  const {modalIsShowing, toggleModal} = useModal()
  const [modalContent, setModalContent] = useState([])
  const initialURLFilters = useUrlFilters({"category": categories.active, "label": labelFilters.settings})
  const counts = useCounts({counts: alerts.counts, categories: categories.items})

  useInitialLoader({initialURLFilters})

  return (
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
        <nav className="navbar">
        </nav>

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
      
      <SuperModal isShowing={modalIsShowing} hide={toggleModal} header={modalContent.header} footer={modalContent.footer} cancelButtonText={modalContent.cancelButtonText}>{modalContent.body}</SuperModal>

      {process.env.NODE_ENV === 'development' && <DevTools/>}
    </div>
  )
}

export default () => <GlobalStateProvider reducers={reducers}><App/></GlobalStateProvider>
