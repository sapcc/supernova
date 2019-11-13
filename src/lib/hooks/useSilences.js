import {useMemo} from 'react'

const useSilences = (status, silencesKeyPayload) => {

  const silences = useMemo(() => {
    if(!status || !status.silencedBy) return []
    let silenceIds = status.silencedBy
    if(!Array.isArray(silenceIds)) silenceIds = [silenceIds]
    return silenceIds.map(id => ( {id, silence: silencesKeyPayload[id]} ))
  },[status,silencesKeyPayload])

  return silences

}

export default useSilences