const AlertsLoader = require('./AlertsLoader')
const AlertManagerApi = require('../lib/AlertManagerApi')
const PagerDutyApi = require('../lib/PagerDutyApi')

jest.mock('axios')
jest.mock('../lib/AlertManagerApi')
jest.mock('../lib/PagerDutyApi')

const testAlerts = [
  {
    "annotations": {
      "description": "Test Alert1",
      "summary": "Alert1"
    },
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
    "annotations": {
      "description": "Test Alert2",
      "summary": "Alert2"
    },
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
    "annotations": {
      "description": "Test Alert3",
      "summary": "Alert3"
    },
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

describe('get', () => {
  let alerts
  beforeEach( async () => { 
    AlertManagerApi.alerts.mockResolvedValue(testAlerts)
    PagerDutyApi.incidents.mockResolvedValue([])
    PagerDutyApi.incidentAlerts.mockResolvedValue([])
    alerts = await AlertsLoader.get()
  })

  it('returns a promise object', () => {
    expect(AlertsLoader.get() instanceof Promise).toBe(true) 
  })

  it('resolves promise to json', () => {
    expect(alerts).toBeDefined()
  })

  it('contains items property', () => {
    expect(alerts.hasOwnProperty('items')).toBe(true)
  })

  it('contains counts property', () => {
    expect(alerts.hasOwnProperty('counts')).toBe(true)
  })

  it('contains labelValues property', () => {
    expect(alerts.hasOwnProperty('labelValues')).toBe(true)
  })

  describe('items', () => {
    let items
    beforeEach(() => {
      items = alerts.items
    })

    it('returns test alerts', () => {
      items.forEach(item => {
        const testItem = testAlerts.find(a => a.annotations.summary === item.annotations.summary)
        expect(testItem).not.toBe(null)
      })     
    })
  })
  
  describe('counts', () => {
    let counts
    beforeEach( () => {
      counts = alerts.counts
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
      labelValues = alerts.labelValues
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
