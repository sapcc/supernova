import { useState, useEffect } from 'react'

const useFilters = (allFilters) => {
  const [primaryFilters, setPrimaryFilters] = useState([])
  const [secondaryFilters, setSecondaryFilters] = useState([])


  useEffect(() => {
    setPrimaryFilters(['severity', 'region'])

    const filtered = Object.keys(allFilters).filter(label => /^((?!(\bregion\b|\bseverity\b)).)*$/.test(label))
    setSecondaryFilters(filtered)

  }, [allFilters])


  return {
    primaryFilters,
    secondaryFilters
  }
}

export default useFilters
