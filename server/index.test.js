const request = require('supertest')
const config = require('./services/configLoader')
const axios = require('axios')
jest.mock('axios')

describe('Server', () => {
  let server
  beforeEach(() => {
    axios.get.mockResolvedValue({data: []})
    server = require('./index')
  })

  afterEach(() => {
    server.close()
  })

  describe('/system/rediness', () => {
    test('should return 200', (done) => {
      request(server).get('/system/readiness').expect(200, done)
    })
  })
  
  describe('/system/liveliness', () => {
    test('should return 200', (done) => {
      request(server).get('/system/liveliness').expect(200, done)
    })
  })
  
  describe('/api/config', () => {
    test('should return 200', (done) => {
      request(server).get('/api/config').expect(200, done)
    })

    it('returns a json object', (done) => {
      request(server)
        .get('/api/config')
        .expect('Content-Type', /json/)
        .expect(200, done)
    })
    
    it('returns config', (done) => {
      request(server)
        .get('/api/config')
        .expect(200, config, done)
    })
  })
})
