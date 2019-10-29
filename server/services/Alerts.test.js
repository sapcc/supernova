const Alerts = require('./Alerts')
const AlertManagerApi = require('../lib/AlertManagerApi')
const PagerDutyApi = require('../lib/PagerDutyApi')

jest.mock('axios')
jest.mock('../lib/AlertManagerApi')
jest.mock('../lib/PagerDutyApi')

const testAlerts = [
  {
    "fingerprint": "test1",
    "annotations": {
      "description": "Test Alert1",
      "summary": "Alert1"
    },
    "endsAt": (new Date()).toString(),
    "labels": {
      "alertname": "OpenstackNeutronIntegrityOutOfFIPs",
      "cluster": "eu-nl-1",
      "region": "eu-nl-1",
      "service": "neutron",
      "severity": "info",
      "tier": "os"
    },
    "status": {"state": "active"}
  },
  {
    "fingerprint": "test2",
    "annotations": {
      "description": "Test Alert2",
      "summary": "Alert2"
    },
    "endsAt": (new Date()).toString(),
    "labels": {
      "alertname": "KubernetesNodeNotReady",
      "cluster": "qa-de-1",
      "region": "qa-de-1",
      "service": "k8s",
      "severity": "warning",
      "tier": "k8s"
    }
  },
  {
    "fingerprint": "test3",
    "annotations": {
      "description": "Test Alert3",
      "summary": "Alert3"
    },
    "endsAt": (new Date()).toString(),
    "labels": {
      "alertname": "OpenstackVcenterNannyGhostVolume",
      "cluster": "eu-de-1",
      "region": "eu-de-1",
      "service": "nanny",
      "severity": "critical",
      "tier": "os"
    }
  }
]

const testIncidents = [
  {
    "id": "PT4KHLK",
    "type": "incident",
    "summary": "[#1234] The server is on fire.",
    "self": "https://api.pagerduty.com/incidents/PT4KHLK",
    "html_url": "https://subdomain.pagerduty.com/incidents/PT4KHLK",
    "incident_number": 1234,
    "created_at": "2015-10-06T21:30:42Z",
    "status": "triggered",
    "title": "The server is on fire.",
    "pending_actions": [
      {
        "type": "unacknowledge",
        "at": "2015-11-10T01:02:52Z"
      },
      {
        "type": "resolve",
        "at": "2015-11-10T04:31:52Z"
      }
    ],
    "incident_key": "baf7cf21b1da41b4b0221008339ff357",
    "service": {
      "id": "PIJ90N7",
      "type": "generic_email_reference",
      "summary": "My Mail Service",
      "self": "https://api.pagerduty.com/services/PIJ90N7",
      "html_url": "https://subdomain.pagerduty.com/services/PIJ90N7"
    },
    "priority": {
      "id": "P53ZZH5",
      "type": "priority_reference",
      "summary": "P2",
      "self": "https://api.pagerduty.com/priorities/P53ZZH5",
      "html_url": null
    },
    "assigned_via": "escalation_policy",
    "assignments": [
      {
        "at": "2015-11-10T00:31:52Z",
        "assignee": {
          "id": "PXPGF42",
          "type": "user_reference",
          "summary": "Earline Greenholt",
          "self": "https://api.pagerduty.com/users/PXPGF42",
          "html_url": "https://subdomain.pagerduty.com/users/PXPGF42"
        }
      }
    ],
    "acknowledgements": [
      {
        "at": "2015-11-10T00:32:52Z",
        "acknowledger": {
          "id": "PXPGF42",
          "type": "user_reference",
          "summary": "Earline Greenholt",
          "self": "https://api.pagerduty.com/users/PXPGF42",
          "html_url": "https://subdomain.pagerduty.com/users/PXPGF42"
        }
      }
    ],
    "last_status_change_at": "2015-10-06T21:38:23Z",
    "last_status_change_by": {
      "id": "PXPGF42",
      "type": "user_reference",
      "summary": "Earline Greenholt",
      "self": "https://api.pagerduty.com/users/PXPGF42",
      "html_url": "https://subdomain.pagerduty.com/users/PXPGF42"
    },
    "first_trigger_log_entry": {
      "id": "Q02JTSNZWHSEKV",
      "type": "trigger_log_entry_reference",
      "summary": "Triggered through the API",
      "self": "https://api.pagerduty.com/log_entries/Q02JTSNZWHSEKV?incident_id=PT4KHLK",
      "html_url": "https://subdomain.pagerduty.com/incidents/PT4KHLK/log_entries/Q02JTSNZWHSEKV"
    },
    "escalation_policy": {
      "id": "PT20YPA",
      "type": "escalation_policy_reference",
      "summary": "Another Escalation Policy",
      "self": "https://api.pagerduty.com/escalation_policies/PT20YPA",
      "html_url": "https://subdomain.pagerduty.com/escalation_policies/PT20YPA"
    },
    "teams": [
      {
        "id": "PQ9K7I8",
        "type": "team_reference",
        "summary": "Engineering",
        "self": "https://api.pagerduty.com/teams/PQ9K7I8",
        "html_url": "https://subdomain.pagerduty.com/teams/PQ9K7I8"
      }
    ],
    "urgency": "high"
  }
]

const testIncidentAlerts = [
  {
    "id": "XXXXX",
    "type": "alert",
    "summary": "The server is on fire.",
    "self": "https://api.pagerduty.com/incidents/PT4KHLK/alerts/PXPGF42",
    "html_url": "https://subdomain.pagerduty.com/alerts/PXPGF42",
    "created_at": "2015-10-06T21:30:42Z",
    "status": "resolved",
    "alert_key": "baf7cf21b1da41b4b0221008339ff357",
    "service": {
      "id": "PIJ90N7",
      "type": "generic_email_reference",
      "summary": "My Mail Service",
      "self": "https://api.pagerduty.com/services/PIJ90N7",
      "html_url": "https://subdomain.pagerduty.com/services/PIJ90N7"
    },
    "body": {
      "type": "alert_body",
      "contexts": [
        {
          "type": "link"
        }
      ],
      "details": {
        "Region": "eu-de-1",
        "Service": "nanny",
        "severity": "critical",
        "Tier": "os"
      }
    },
    "incident": {
      "id": "PT4KHLK",
      "type": "incident_reference"
    },
    "suppressed": false,
    "severity": "critical",
    "integration": {
      "id": "PQ12345",
      "type": "generic_email_inbound_integration_reference",
      "summary": "Email Integration",
      "self": "https://api.pagerduty.com/services/PIJ90N7/integrations/PQ12345",
      "html_url": "https://subdomain.pagerduty.com/services/PIJ90N7/integrations/PQ12345"
    }
  }
]

const testNotes = [
  {
    "id": "PUB0P5E",
    "user": {
      "id": "PLK6IQZ",
      "type": "user_reference",
      "summary": "David Höller",
      "self": "https://api.pagerduty.com/users/PLK6IQZ",
      "html_url": "https://ccloud.pagerduty.com/users/PLK6IQZ"
    },
    "content": "Incident was acknowledged on behalf of sven.blaschke@sap.com. time: 2019-10-22 08:31:08.929396719 +0000 UTC",
    "created_at": "2019-10-22T10:31:09+02:00"
  }
]

describe('get', () => {
  let getResult
  beforeEach( async () => { 
    AlertManagerApi.alerts.mockResolvedValue(testAlerts)
    PagerDutyApi.incidents.mockResolvedValue(testIncidents)
    PagerDutyApi.incidentAlerts.mockResolvedValue(testIncidentAlerts)
    PagerDutyApi.incidentNotes.mockResolvedValue(testNotes)
    getResult = await Alerts.get()
  })

  it('returns a promise object', () => {
    expect(Alerts.get() instanceof Promise).toBe(true) 
  })

  it('resolves promise to json', () => {
    expect(getResult).toBeDefined()
  })

  it('contains alerts property', () => {
    expect(getResult.hasOwnProperty('alerts')).toBe(true)
  })

  it('contains counts property', () => {
    expect(getResult.hasOwnProperty('counts')).toBe(true)
  })

  it('contains labelValues property', () => {
    expect(getResult.hasOwnProperty('labelValues')).toBe(true)
  })

  describe('alerts', () => {
    let alerts
    beforeEach(() => {
      ({alerts} = getResult)
    })

    it('returns test alerts', () => {
      alerts.forEach(alert => {
        const testAlert= testAlerts.find(a => a.annotations.summary === alert.annotations.summary)
        expect(testAlert).not.toBe(null)
      })     
    })

    describe('pagerDutyInfos', () => {
      let alert
      beforeEach(async () => {
        await Alerts.__get__('loadPagerDutyAlerts')()
        const {alerts} = await Alerts.get()
        alert = alerts.find(a => a.fingerprint === 'test3')
      })
      
      it('contains pagerDutyInfos', () => {
        expect(alert.pagerDutyInfos).toBeDefined()
      })

      it('pagerDutyInfos contains incidentId', () => {
        //console.log(alerts)
        expect(alert.pagerDutyInfos.incidentId).toEqual('PT4KHLK')
      })

      it('pagerDutyInfos contains acknowledgements', () => {
        expect(alert.pagerDutyInfos.acknowledgements).toBeDefined()
      })

      it('acknowledgements contains user infos', () => {
        expect(alert.pagerDutyInfos.acknowledgements).toEqual([
          {
            "at": new Date("2019-10-22T08:31:08.929Z"),
            "user": {
              "name": "Sven Blaschke",
              "email": "sven.blaschke@sap.com"
            }
          },
          {
            "at": new Date("2015-11-10T00:32:52Z"),
            "user": {
              "name": "Earline Greenholt",
            }
          }
        ])
      })
    })
  })
  
  describe('counts', () => {
    let counts
    beforeEach( () => {
      counts = getResult.counts
    })

    it('contains counts of categories', () => {
      expect(counts.hasOwnProperty('category')).toBe(true)  
    })
    
    it('contains counts of regions', () => {
      expect(counts.hasOwnProperty('region')).toBe(true)  
    })

    it('returns counts of categories',() => {
      expect(counts.category).toMatchObject({
        "API": { "region": {"eu-de-1": {"critical": 1}, "eu-nl-1": {"info": 1}}, "summary": {"critical": 1, "warning": 1, "info": 1}},
        "k8s": { "region": {"qa-de-1": {"warning": 1 }}, "summary": {"warning": 1}}
      })
    })
    
    it('returns counts of regions',() => {
      expect(counts.region).toMatchObject({
        "eu-nl-1": { "info": 1},
        "qa-de-1": { "warning": 1 },
        "eu-de-1": { "critical": 1}
      })
    })
  })
  
  describe('labelValues', () => {
    let labelValues
    beforeEach( () => {
      labelValues = getResult.labelValues
    })

    it('contains white listed labels', () => {
      expect(Object.keys(labelValues).sort()).toMatchObject(['cluster','region','service','severity','status','tier'])  
    })
    
    it('returns values of labels',() => {
      expect(labelValues).toMatchObject({
        "cluster": ['eu-de-1','eu-nl-1','qa-de-1'],
        "region": ['eu-de-1','eu-nl-1','qa-de-1'],
        "service": ['k8s','nanny','neutron'],
        "severity": ['critical','info','warning'],
        "tier": ['k8s','os']
      })
    })
  })
})

describe('pagerDutyAlertKey', () => {
  it('builds pagerduty alert key', () => {
    const alert = testIncidentAlerts[0]
    const key = Alerts.__get__('pagerDutyAlertKey')(alert)
    const details = alert.body.details
    
    expect(key).toEqual(`${alert.severity || ''}-${details.Service || ''}-${details.Tier || ''}-${details.Region ||''}-${details.Context ||''}`)
  })
})

describe('alertKey', () => {
  it('builds alert key', () => {
    const alert = testAlerts[0]
    const key = Alerts.__get__('alertKey')(alert)
    const details = alert.labels
    
    expect(key).toEqual(`${details.severity || ''}-${details.service || ''}-${details.tier || ''}-${details.region ||''}-${details.context ||''}`)
  })
})

describe('buildAcknowledgements', () => {
  it('builds acknowledgements of an incident', () => {
    const incident = {...testIncidents[0]}
    incident.notes = testNotes
    expect(Alerts.__get__('buildAcknowledgements')(incident)).toEqual([
      {
        "at": new Date("2019-10-22T08:31:08.929Z"),
        "user": {
          "name": "Sven Blaschke",
          "email": "sven.blaschke@sap.com"
        }
      },
      {
        "at": new Date("2015-11-10T00:32:52Z"),
        "user": {
          "name": "Earline Greenholt",
        }
      }
    ])
  })
})

describe('loadPagerDutyAlerts', () => {
  let buildAcknowledgementsMock = jest.fn()
  let pagerDutyAlertKeyMock = jest.fn()
  let _acknowledgementsCacheMock = jest.fn()
  _acknowledgementsCacheMock.update = jest.fn()

  beforeEach(() => {
    Alerts.__set__({
      buildAcknowledgements: buildAcknowledgementsMock,
      pagerDutyAlertKey: pagerDutyAlertKeyMock,
      _acknowledgementsCache: _acknowledgementsCacheMock
    })
    Alerts.__get__('loadPagerDutyAlerts')()
  })
  it('call PagerDutyApi.incidents', () => {
    PagerDutyApi.incidents.mockReturnValue(Promise.resolve(testIncidents))
    expect(PagerDutyApi.incidents).toHaveBeenCalled()
  })
  it('call PagerDutyApi.incidentNotes', () => {
    expect(PagerDutyApi.incidentNotes).toHaveBeenCalled()
  })
  it('call PagerDutyApi.incidentAlerts', () => {
    expect(PagerDutyApi.incidentAlerts).toHaveBeenCalled()
  })
  it('call buildAcknowledgements', () => {
    expect(buildAcknowledgementsMock).toHaveBeenCalled()
  })

  it('call pagerDutyAlertKey', () => {
    expect(pagerDutyAlertKeyMock).toHaveBeenCalled()
  })

  it('call _acknowledgementsCache.update', () => {
    expect(_acknowledgementsCacheMock.update).toHaveBeenCalled()
  })
})
describe('loadPagerDutyAlerts', () => {
  let buildAcknowledgementsMock = jest.fn()
  let pagerDutyAlertKeyMock = jest.fn()
  let _acknowledgementsCacheMock = jest.fn()
  _acknowledgementsCacheMock.update = jest.fn()

  beforeEach(() => {
    Alerts.__set__({
      buildAcknowledgements: buildAcknowledgementsMock,
      pagerDutyAlertKey: pagerDutyAlertKeyMock,
      _acknowledgementsCache: _acknowledgementsCacheMock
    })
    Alerts.__get__('loadPagerDutyAlerts')()
  })
  it('call PagerDutyApi.incidents', () => {
    PagerDutyApi.incidents.mockReturnValue(Promise.resolve(testIncidents))
    expect(PagerDutyApi.incidents).toHaveBeenCalled()
  })
  it('call PagerDutyApi.incidentNotes', () => {
    expect(PagerDutyApi.incidentNotes).toHaveBeenCalled()
  })
  it('call PagerDutyApi.incidentAlerts', () => {
    expect(PagerDutyApi.incidentAlerts).toHaveBeenCalled()
  })
  it('call buildAcknowledgements', () => {
    expect(buildAcknowledgementsMock).toHaveBeenCalled()
  })

  it('call pagerDutyAlertKey', () => {
    expect(pagerDutyAlertKeyMock).toHaveBeenCalled()
  })

  it('call _acknowledgementsCache.update', () => {
    expect(_acknowledgementsCacheMock.update).toHaveBeenCalled()
  })
})

describe('load', () => {
  let updateAlertsMock = jest.fn()

  beforeEach(() => {
    Alerts.__set__({
      updateAlerts: updateAlertsMock,
    })
    Alerts.__get__('load')()
  })
  it('call AlertManagerApi.alerts', () => {
    AlertManagerApi.alerts.mockReturnValue(Promise.resolve(testAlerts))
    expect(AlertManagerApi.alerts).toHaveBeenCalled()
  })
  it('call updateAlerts', () => {
    expect(updateAlertsMock).toHaveBeenCalled()
  })

  it('returns a hashMap', () => {
    Alerts.__get__('load')().then(result => expects(Object.keys(result)).toEqual(['alerts','counts','labelValues']))
  })

  describe('API ERROR', () => {
    beforeEach(() => {
      AlertManagerApi.alerts.mockReturnValue(Promise.reject({message:'TEST ERROR'}))
    })
    it('returns null', () => {
      Alerts.__get__('load')().then(alerts => expect(alerts).toEqual(null))
    })
  })
})