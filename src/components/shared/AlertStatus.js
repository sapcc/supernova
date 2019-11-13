import React from 'react'
import { Button } from 'reactstrap'
import moment from 'moment'


const AlertStatus = ({status, showAckedBy,showSilencedBy,showInhibitedBy,silences}) => {
  return (
    <React.Fragment>
      {status.state &&
        <div>{status.state}</div>
      }
      {status.inhibitedBy && status.inhibitedBy.length ?
          <div className="u-text-info u-text-small">
            Inhibited by: 
            <Button color="link" className="btn-inline-link" onClick={(e) => {e.preventDefault(); showInhibitedBy(status.inhibitedBy)}}>
              {status.inhibitedBy}
            </Button>
          </div>
        :
        ""
      }
      {silences && silences.length>0 &&
        <React.Fragment> 
          <div className="u-text-info u-text-small">Silenced by:</div>
          {
            silences.map(data => 
              <div key={data.id} className="u-text-info u-text-small">
                { data.silence 
                  ? <Button color="link" className="btn-inline-link" onClick={(e) => {e.preventDefault(); showSilencedBy(data.id)}}>
                      {data.silence.createdBy}
                    </Button>
                  : data['id']  
                }
              </div>  
            )
          } 
        </React.Fragment>  
      }
      {status.pagerDutyInfos && status.pagerDutyInfos.acknowledgements &&  status.pagerDutyInfos.acknowledgements.length>0 &&
        <React.Fragment>
          <div className="u-text-info u-text-small">Acked by:</div>
          {status.pagerDutyInfos.acknowledgements.map((ack,i) => ack.user.name !== 'CC Supernova' && 
            <div className="u-text-info u-text-small" key={i}>
              <Button color="link" className="btn-inline-link" onClick={(e) => { e.preventDefault(); showAckedBy(ack)}}>
                {ack.user.name || ack.user.email}
              </Button>
              <span className="u-nowrap">{' '}{moment(ack.at).fromNow(true)}</span>
            </div>
          )}          
          </React.Fragment>
      }      
    </React.Fragment>
  )
}

export default AlertStatus