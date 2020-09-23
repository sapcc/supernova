/** @module apiClient
 * It uses the standard fetch function.
 * This module implements the api client, which is used to communicate with the backend API.
 * We use OIDC for user authentication. This authenticates the user in the frontend.
 * So that the Backend API can authenticate the operations, the id token is transferred
 * to the API with every request.
 */

// holds the id token, which is updated with the function updateIdToken.
// The apiClient sends, if set, with every, request this token as Bearer
// token in Authrozation header.
let idToken
// stores the handler for 403 responses (optional)
let unauthorizedHandler

/**
 * @function updateIdToken
 *
 * Updates the id token, stored in idToken.
 * @param {string} newToken, JWT
 */
function updateIdToken(newToken) {
  idToken = newToken
}

/**
 * @function on403
 *
 * Sets the handler for 403 responses. It is used in "useOidc" hook to redirect
 * user to login page if token is invalid or expired.
 * @param {function} handler
 */
function on403(handler) {
  unauthorizedHandler = handler
}

/**
 * @function request
 * @param {string} url
 * @param {Object} options Common options used by fetch
 */
const request = (url, options = {}) => {
  const defaultHeaders = {
    "Content-Type": "application/json",
    // 'Content-Type': 'application/x-www-form-urlencoded',
  }
  // use idToken as Bearer token
  if (idToken) defaultHeaders["Authorization"] = `Bearer ${idToken}`

  // merge default headers with given headers
  // it is possible to overwrite default headers
  options = options || {}
  options.headers = options.headers || {}
  options.headers = Object.assign({}, defaultHeaders, options.headers)

  // console.log(url, options)
  // make request
  return fetch(url, Object.assign({}, options)).then(async (res) => {
    // Backend responses with 403 if token is expired or invalid
    // if unauthorizedHandler exists it will be called
    if (res.status === 403 && unauthorizedHandler) unauthorizedHandler()
    else if (res.status >= 400) {
      const message = await res.text()
      throw Error(message, { status: res.status, statusText: res.statusText })
    } else return res
  })
}

export default {
  request,
  updateIdToken,
  on403,
}
