import React, {useMemo,useState,useEffect,useRef} from 'react'
import ReactJson from 'react-json-view'
import AlertItem from './AlertItem'

const Alerts = ({alerts,silences,categories,labelFilters,showModal}) => {
  const tableElement = useRef(null)
  const activeLabelFilters = {}
  const labelSettings = labelFilters.settings
  const activeCategories = useMemo(() => categories.items.filter(c => c.active), [categories.items])
  const silencesKeyPayload = useMemo(() => 
    silences.items.reduce((hash,silence) => {hash[silence.id] = silence; return hash}, {})
    , [silences.items]
  )

  // These variables are necessary to calculate which alerts to render.
  // We only render those alerts that are currently visible in the viewport of the window.
  const tableOffset = (tableElement.current || {}).offsetTop
  const viewportHeight = window.innerHeight
  const tableHeight = Math.max((tableElement.current || {}).offsetHeight, viewportHeight*2)
  const [scrollOffset,setScrollOffset] = useState(0)

  // update scrollOffset on scroll event
  useEffect(() => {
    const supportPageOffset = window.pageXOffset !== undefined
    const isCSS1Compat = ((document.compatMode || "") === "CSS1Compat")

    window.addEventListener('scroll', () => {
      const y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop
      console.log('update scroll variable')
      setScrollOffset(y)
    })
  },[])

  for(let name in labelSettings) { 
    if(labelSettings[name] && labelSettings[name].length>0) activeLabelFilters[name] = labelSettings[name] 
  }

  // collect fingerprints of visible alerts
  // returns a hash
  let filteredAlertsIds = useMemo(() => {
    // don't filter at all if categories are empty
    if(categories.active.length === 0) return {}

    return alerts.items.reduce((hash,alert) => {
      let visible = activeCategories.reduce((matchesOtherCategories,category) => {
        return matchesOtherCategories && Object.keys(category.match_re).reduce((matchesOtherLabels,label) => {
          const regex = new RegExp(category.match_re[label])
          return matchesOtherLabels && regex.test(alert.labels[label]) 
        },true)
      },true)

      if(visible && Object.keys(activeLabelFilters).length >= 0) {
        for(let name in activeLabelFilters) { 
          if(activeLabelFilters[name].indexOf(alert.labels[name]) < 0) visible = false
        }
      }

      if(visible) hash[alert.fingerprint] = true
      return hash
    },{})
  },[alerts,categories,activeCategories,activeLabelFilters])

  const toggleDetailsModal = (alert) => 
    showModal({
      header: <React.Fragment>Raw Data for <span className="u-text-info">&quot;{alert.annotations.summary}&quot;</span></React.Fragment>,
      body: <ReactJson src={alert} collapsed={2} collapseStringsAfterLength={100} />,
      cancelButtonText: "Close" 
    })
  
  const toggleSilenceModal = (silenceId) => {
    if(!silencesKeyPayload[silenceId]) return
    showModal({
      header: <React.Fragment>Silence</React.Fragment>,
      body: <ReactJson src={silencesKeyPayload[silenceId]} collapsed={2} collapseStringsAfterLength={100} />,
      cancelButtonText: "Close" 
    })
  }

  const toggleInhibitedModal = (fingerprint) => { 
    if(Array.isArray(fingerprint)) fingerprint = fingerprint[0]
    const alert = alerts.items.find(a => a.fingerprint === fingerprint)
    if(!alert) return
    showModal({
      header: <React.Fragment>Alert</React.Fragment>,
      body: <ReactJson src={alert} collapsed={2} collapseStringsAfterLength={100} />,
      cancelButtonText: "Close" 
    })
  }
  
  const toggleAckedModal = (payload) => { 
    showModal({
      header: <React.Fragment>Acknowledgement</React.Fragment>,
      body: <ReactJson src={payload} collapsed={2} collapseStringsAfterLength={100} />,
      cancelButtonText: "Close" 
    })
  }

  const length = Object.keys(filteredAlertsIds).length
  const itemHeight = Math.max(Math.ceil(tableHeight/length),50)
  const start = Math.min(-25,Math.floor((scrollOffset-tableOffset)/itemHeight))
  const end = Math.ceil((viewportHeight+scrollOffset)/itemHeight)

  return (
    <table className="table table-main" ref={tableElement}>
      <thead>
        <tr>
          <th>
            Region
          </th>  
          <th> 
            Service
          </th>  
          <th>
            Title       
          </th>
          <th className="text-nowrap">
            Firing Since
          </th>
          <th>
            Status
          </th>
          <th></th>
        </tr>  
      </thead>
      <tbody>
        {/* IF NO ALERTS -> YAY */}
        {alerts.items.map((alert,index) =>
          filteredAlertsIds[alert.fingerprint] && 
          <AlertItem 
            key={index}
            visible={index >= start && index <= end}
            alert={alert}
            labelSettings={labelSettings}
            silencesKeyPayload={silencesKeyPayload}
            showDetails={() => toggleDetailsModal(alert.clone())}
            showInhibitedBy={(fingerprint) => toggleInhibitedModal(fingerprint) }
            showSilencedBy={(silenceId) => toggleSilenceModal(silenceId)}
            showAckedBy={(payload) => toggleAckedModal(payload)}
          />
        )}
      </tbody> 
    </table> 
  )
}

export default Alerts
