const moment = require("moment")
const utils = require("../helpers/utils")
const AlertManagerApi = require("../lib/AlertManagerApi")
const Cache = require("../lib/Cache")

const _silencesCache = new Cache()
const _updateListeners = []
const addUpdateListener = (func) => _updateListeners.push(func)

/**
 *  This function creates a silence in AlertManager.
 * @param {object} alert
 * @param {Number} duration
 * @param {String} comment, a description
 */
const createAlertSilence = async ({ alert, duration, comment, user }) => {
  const startsAt = new Date()
  const endsAt = new Date()
  endsAt.setHours(endsAt.getHours() + Number.parseInt(duration || 4))
  const matchers = []
  for (let name in alert.labels) {
    // remove some labels that we don't want to include in the silence
    if (["status"].indexOf(name) >= 0) continue
    if (["pod"].indexOf(name) >= 0) continue
    if (["instance"].indexOf(name) >= 0) continue
    let value = alert.labels[name]
    if (alert.labels.region === "area51" && name === "severity") value = "test"
    matchers.push({ name, value, isRegex: false }) // for now hardcode isRegex to false since we take the exact value
  }
  return AlertManagerApi.createSilence({
    matchers,
    startsAt,
    endsAt,
    createdBy: user.fullName,
    comment: comment,
  }).then(() => load())
}

/**
 *  This function creates a silence in AlertManager.
 * @param {object} props, matchers,startsAt,endsAt,createdBy,comment
 * @see https://editor.swagger.io/
 */
const createSilence = (props) =>
  AlertManagerApi.createSilence(props).then(() => load())

/**
 * This function informs all listeners for silence changes.
 * @private
 */
const informUpdateListeners = () =>
  _updateListeners.forEach((listener) => {
    listener(_silencesCache.get())
  })

/**
 * This function returns cached values or loads silences from API.
 * @public
 */
const get = async () =>
  _silencesCache.loaded() ? _silencesCache.get() : load()

/**
 * This function sorts asilences in the cache and informs all listeners.
 * @param {array} alerts
 * @return {Object} HashMap: alerts, counts and labelValues
 * @private
 */
const updateSilences = (silences) => {
  const hasChanged = _silencesCache.update(silences)
  if (hasChanged) informUpdateListeners(_silencesCache.get())
  return _silencesCache.get()
}

/**
 * This function loads the sileneces from AlertMagnager.
 * @return {Promise} a promise object
 * @private
 */
const load = () =>
  AlertManagerApi.silences()
    .then((silences) => {
      console.info(
        `[${moment().format(
          "DD.MM.YYYY hh:mm"
        )}] SILENCES LOADER: receive silences from alert manager`,
        silences.length
      )
      return updateSilences(silences)
    })
    .catch((error) => {
      console.error(
        `[${moment().format("DD.MM.YYYY hh:mm")}] SILENCES LOADER: api error: `,
        error.message,
        error.response.data
      )
      return null
    })
// Run silences polling every 5 minutes
utils.doPeriodical({ intervalInSeconds: 300, immediate: true }, load)

module.exports = Silences = {
  addUpdateListener,
  get,
  createAlertSilence,
  createSilence,
}
