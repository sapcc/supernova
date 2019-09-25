const request = require('supertest')
const axios = require('axios')
const auth = require('./middlewares/auth')

jest.mock('axios')
jest.mock('./middlewares/auth')

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
  
  describe('/api/auth/profile', () => {
    describe('not logged in', () => {
      beforeEach(() => {
        auth.mockImplementation(async (req,res,next) => {
          res.status(401).send("Access denied. No token provided.")
        })
      })
      test('should return 401', (done) => {
        request(server).get('/api/auth/profile').expect(401, done)
      })
    })

    describe('logged in', () => {
      beforeEach(() => {
        auth.mockImplementation(async (req,res,next) => {
          req.user = {id: 'test', fullName: 'Test Test', groups: []}
          next()
        })
      })
      it('returns a json object', (done) => {
        request(server)
          .get('/api/auth/profile')
          .expect('Content-Type', /json/)
          .expect(200, done)
      })
    })    
  })
})
