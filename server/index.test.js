require("dotenv").config()
const request = require("supertest")
const axios = require("axios")
// const auth = require("./middlewares/auth")
const verifyToken = require("./middlewares/verifyToken")

jest.mock("axios")
// jest.mock("./middlewares/auth")
jest.mock("./middlewares/verifyToken")

describe("Server", () => {
  let server
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] })
    server = require("./index")
  })

  afterEach(() => {
    server.close()
  })

  describe("/system/rediness", () => {
    test("should return 200", (done) => {
      request(server).get("/system/readiness").expect(200, done)
    })
  })

  describe("/system/liveliness", () => {
    test("should return 200", (done) => {
      request(server).get("/system/liveliness").expect(200, done)
    })
  })

  describe("/api/auth/profile", () => {
    describe("not logged in", () => {
      beforeEach(() => {
        verifyToken.mockImplementation(async (req, res, next) => {
          res.status(403).send("Access denied. No token provided.")
        })
      })
      test("should return 403", (done) => {
        request(server).get("/api/auth/profile").expect(403, done)
      })
    })

    describe("logged in", () => {
      beforeEach(() => {
        verifyToken.mockImplementation(async (req, res, next) => {
          req.user = { id: "test", fullName: "Test Test", groups: [] }
          next()
        })
      })
      it("returns a json object", (done) => {
        request(server)
          .get("/api/auth/profile")
          .expect("Content-Type", /json/)
          .expect(200, done)
      })
    })
  })
})
