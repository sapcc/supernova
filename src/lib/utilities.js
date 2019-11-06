import { useMemo } from 'react'

const descriptionParsed = (text) => {
  if(!text) return ''
  // urls in descriptions follow the schema: <URL|URL-NAME>
  // Parse description and replace urls with a-tags
  const regexUrl   = /<(http[^>|]+)\|([^>]+)>/g
  const urlParsed  = text.replace(regexUrl, `<a href="$1">$2</a>`)

  // replace text wrapped in *..* by strong tags
  const regexBold  = /\*(.*)\*/g
  const boldParsed = urlParsed.replace(regexBold, `<strong>$1</strong>`)

  const regexCode = /`(.*)`/g
  return boldParsed.replace(regexCode, `<code>$1</code>`)
}

const silences = (alert, silencesKeyPayload) => {
  return useMemo(() => {
    if(!alert.status || !alert.status.silencedBy) return []
    let silenceIds = alert.status.silencedBy
    if(!Array.isArray(silenceIds)) silenceIds = [silenceIds]
    return silenceIds.map(id => ( {id, silence: silencesKeyPayload[id]} ))
  },[alert.status,silencesKeyPayload])
}

export {
  descriptionParsed,
  silences
}