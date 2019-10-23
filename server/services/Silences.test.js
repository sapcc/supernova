const Silences = require('./Silences')
const AlertManagerApi = require('../lib/AlertManagerApi')

jest.mock('axios')
jest.mock('../lib/AlertManagerApi')

const testSilences = [
  {
    "comment": "silenced by the stargate",
    "createdBy": "Daniel Richardt (C5255888)",
    "endsAt": "2019-10-22T22:31:21.993Z",
    "id": "59237ed1-5486-4f5a-acd0-380de4a0bcc4",
    "matchers": [
    {
    "isRegex": true,
    "name": "alertname",
    "regex": "OpenstackNovaDatapathDown",
    "value": "OpenstackNovaDatapathDown"
    },
    {
    "isRegex": true,
    "name": "severity",
    "regex": "critical",
    "value": "critical"
    },
    {
    "isRegex": true,
    "name": "region",
    "regex": "la-br-1",
    "value": "la-br-1"
    }
    ],
    "startsAt": "2019-10-21T23:11:28.957Z",
    "status": {
    "state": "expired"
    },
    "updatedAt": "2019-10-21T23:11:28.957Z"
    },
    {
    "comment": "silenced by the stargate",
    "createdBy": "Daniel Richardt (C5255888)",
    "endsAt": "2019-10-22T23:13:39.799Z",
    "id": "fccb945b-0f00-4397-a1d6-05bd9773032b",
    "matchers": [
    {
    "isRegex": true,
    "name": "severity",
    "regex": "critical",
    "value": "critical"
    },
    {
    "isRegex": true,
    "name": "region",
    "regex": "la-br-1",
    "value": "la-br-1"
    },
    {
    "isRegex": true,
    "name": "alertname",
    "regex": "OpenstackNovaApiFlapping",
    "value": "OpenstackNovaApiFlapping"
    }
    ],
    "startsAt": "2019-10-21T23:13:39.810Z",
    "status": {
    "state": "expired"
    },
    "updatedAt": "2019-10-21T23:13:39.810Z"
    }
]

describe('get', () => {
  let getResult

  beforeEach( async () => { 
    const cache = Silences.__get__('_silencesCache')
    cache.loaded = jest.fn().mockReturnValue(false).mockName('loaded')

    Silences.__set__({
      _silencesCache: cache,
    })

    AlertManagerApi.silences.mockResolvedValue(testSilences)
    getResult = await Silences.get()
  })

  it('should call loaded function of the cache', () => {
    expect(Silences.__get__('_silencesCache').loaded).toHaveBeenCalled()
  })

  it('returns a promise object', () => {
    expect(Silences.get() instanceof Promise).toBe(true) 
  })

  it('resolves promise to json', () => {
    expect(getResult).toBeDefined()
  })

  it('contains silences', () => {
    expect(Array.isArray(getResult)).toBe(true)
  })


  describe('result', () => {
    it('returns test silences', () => {
      expect(getResult === testSilences).toBe(true)
    })
  })
})

describe('load', () => {
  let updateSilencesMock = jest.fn()

  beforeEach(() => {
    Silences.__set__({
      updateSilences: updateSilencesMock,
    })
    Silences.__get__('load')()
  })
  it('call AlertManagerApi.silences', () => {
    AlertManagerApi.silences.mockReturnValue(Promise.resolve(testSilences))
    expect(AlertManagerApi.silences).toHaveBeenCalled()
  })
  it('call updateSilences', () => {
    expect(updateSilencesMock).toHaveBeenCalled()
  })

  describe('API ERROR', () => {
    beforeEach(() => {
      AlertManagerApi.silences.mockReturnValue(Promise.reject({message:'TEST ERROR'}))
    })
    it('returns null', () => {
      Silences.__get__('load')().then(alerts => expect(silences).toEqual(null))
    })
  })
})