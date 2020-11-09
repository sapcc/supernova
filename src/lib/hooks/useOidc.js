import { useEffect } from "react"
import { useDispatch, useGlobalState } from "../globalState"
import { randomString } from "../utilities"
import apiClient from "../apiClient"

/**
 * @function login
 * This function requests the login page from backend and redirects to it
 */
const login = () => {
  // generate random state string. This string is used to verify the
  // response from ID provider.
  const state = randomString()
  const redirectUri = `${window.location.origin}/oauth_callback`

  // before redirecting safe the state and current uri in
  // browser's session store
  window.sessionStorage.setItem("state", state)
  window.sessionStorage.setItem("uri", window.location.href)

  // reset id token in api client
  apiClient.updateIdToken(null)
  apiClient
    .request(`/api/auth/login?redirectUri=${redirectUri}&state=${state}`)
    .then(async (res) => {
      const uri = await res.text()
      if (!res.ok) {
        throw new Error(`${res.statusText} (${uri})`)
      }
      // redirect
      window.location.href = uri
    })
}

/**
 * @function handleOauthCallback
 *
 * This function handles the response from ID provider.
 */
const handleOauthCallback = async () => {
  // get uri query string. It can be the search (?) or hash (#)
  let queryString = window.location.search || window.location.hash
  if (queryString && queryString[0] === "#")
    queryString = queryString.substring(1)

  // get url parameters
  const urlParams = new URLSearchParams(queryString)
  const loginError = urlParams.get("error")

  if (loginError) throw new Error(loginError)
  // compare returned state with the stored state
  const state = urlParams.get("state")
  const originState = window.sessionStorage.getItem("state")

  if (state !== originState) throw new Error("OIDC Error: unmatched state.")

  const idToken = urlParams.get("id_token")
  if (!idToken) throw new Error("OIDC Error: no id_token provided.")

  // update id token of apiClient
  apiClient.updateIdToken(idToken)

  // restore the origin url
  const originUri = window.sessionStorage.getItem("uri")
  if (originUri) window.history.replaceState("", document.title, originUri)
}

/**
 * @function useOidc React Hook
 *
 * This hook implements the authentication flow using OIDC.
 */
const useOidc = () => {
  const dispatch = useDispatch()
  const { user } = useGlobalState()

  useEffect(() => {
    // url path /oauth_callback means response from id provider
    if (window.location.pathname === "/oauth_callback") {
      // handle oauth response
      handleOauthCallback()
        .then(() => {
          // redirect to login on 403 responses
          apiClient.on403(null)
          // load user data
          // the apiClient already has the current idToken at this point
          // we call backend profile endpint to validate it and get user data
          return apiClient
            .request("/api/auth/profile")
            .then((res) => {
              if (res.status >= 400)
                throw new Error(
                  "Could not authenticate user. Invalid id token."
                )
              return res.json()
            })
            .then((data) => {
              // restoreOriginUri()
              dispatch({ type: "RECEIVE_USER_PROFILE", profile: data })
              // redirect to login on 403 responses
              apiClient.on403(login)
            })
        })
        .catch((error) => {
          dispatch({
            type: "REQUEST_USER_PROFILE_FAILURE",
            error: {
              name: "Login failed",
              message: `${error}`,
            },
          })
        })
    } else {
      // This useEffect is called once on initial load.
      // If the url path does not contain /oauth_callback then
      // user is not authenticated yet!
      login()
    }
    // eslint-disable-next-line
  }, [])

  // return login status
  return !!user.profile
}

export default useOidc
