import { useEffect, useState } from "react"
import { useDispatch } from "../globalState"
import openSocket from "socket.io-client"
import { randomString } from "../utilities"
import jose from "node-jose"

const getToken = (
  { code, refreshToken },
  redirectUri = window.location.origin
) =>
  fetch("/api/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: code
      ? JSON.stringify({ code, redirectUri })
      : JSON.stringify({ refreshToken, redirectUri }),
  }).then((res) => res.json())

const getLoginPageUri = (
  state = randomString(),
  redirectUri = window.location.origin
) =>
  fetch(`/api/auth/login?redirectUri=${redirectUri}&state=${state}`).then(
    async (res) => {
      const uri = await res.text()
      if (!res.ok) throw new Error(`${res.statusText} (${uri})`)
      return uri
    }
  )

const requestLoginPage = () => {
  const state = randomString()

  window.sessionStorage.setItem("state", state)
  window.sessionStorage.setItem("uri", window.location.href)

  getLoginPageUri(state).then((uri) => {
    window.location.href = uri
  })
}

const login = async (code, state) => {
  if (state !== window.sessionStorage.getItem("state")) {
    throw new Error("Authentication: invalid state")
  }
  console.log("=====================================", window.location.href)
  const uri = window.sessionStorage.getItem("uri")

  if (uri) {
    window.history.replaceState("", document.title, uri)
  }

  // load token
  return getToken({ code })
}

class IDToken {
  constructor(jwt) {
    this.jwt = jwt
    const [header, payload, signature] = jwt.split(".")
    this.headerData = JSON.parse(atob(header))
    this.payloadData = JSON.parse(atob(payload))
    this.signature = signature
  }

  async validate() {
    if (!IDToken.jwks) {
      IDToken.jwks = await fetch(
        `${this.payloadData.iss}/.well-known/openid-configuration`
      )
        .then((response) => response.json())
        .then((data) => fetch(data.jwks_uri))
        .then((res) => res.json())
        .then((data) => data.keys)
    }

    let keystore = await jose.JWK.asKeyStore(IDToken.jwks)
    const verifier = jose.JWS.createVerify(keystore)
    const verified = await verifier.verify(this.jwt).catch(() => {})
    const isVerified = !!verified
    return isVerified
  }
  payload() {
    return this.payloadData
  }
}

const useOidc = () => {
  const dispatch = useDispatch()
  const [loggedIn, setLoggedIn] = useState(false)
  const [idToken, setIdToken] = useState()

  useEffect(() => {}, [])

  useEffect(() => {
    let queryString = window.location.search || window.location.hash
    if (queryString && queryString[0] === "#")
      queryString = queryString.substring(1)
    const urlParams = new URLSearchParams(queryString)
    const code = urlParams.get("code")
    const loginError = urlParams.get("error")
    const state = urlParams.get("state")
    const idToken = urlParams.get("id_token")

    console.log(
      "==============================================",
      window.location.href
    )
    console.log(idToken, Headers.values)

    // use code if presented to get the token
    if (code || idToken) {
      console.log("::::::::::::::::::::::::::")

      const token = new IDToken(idToken)
      token.validate().then((valid) => {
        console.log("=============valid", valid)
        console.log(token.payload())
      })

      return
      login(code, state)
        .then((data) => {
          dispatch({ type: "RECEIVE_USER_PROFILE", profile: data })
          setLoggedIn(true)
        })
        .catch((error) => {
          dispatch({
            type: "REQUEST_USER_PROFILE_FAILURE",
            error: {
              name: "Login failed",
              message: `${error}`,
            },
          })
          console.log(":::::::::::::::::::::::::::::login error", error)
        })
    } else if (loginError) {
      dispatch({
        type: "REQUEST_USER_PROFILE_FAILURE",
        error: {
          name: "Login failed",
          message: loginError,
        },
      })
    } else {
      requestLoginPage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return loggedIn
}

export default useOidc
