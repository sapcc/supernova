import React from 'react'

import { mount } from 'enzyme'
import useUrlFilters from './useUrlFilters'
import { testHook } from './testUtils'


describe('useUrlFilters', () => {
  let urlFilters
  beforeEach(() => 
    testHook(() => urlFilters = useUrlFilters(['test1','test2']))
  )

  it('returns an array', () => {
    expect(urlFilters instanceof Array).toBe(true)   
  })

  it('returns current url filters and a setter function', () => {
    const [currentUrlFilters,setUrlFilters] = urlFilters
    expect(currentUrlFilters instanceof Object).toBe(true)   
    expect(setUrlFilters instanceof Function).toBe(true)
  })

  describe('currentUrlFilters', () => {
    beforeEach(() => {
      window.location.hash = '#category=All&filter_severity=critical&filter_severity=warning&test=value'
      testHook(() => urlFilters = useUrlFilters(['category','filter']))
    })

    it('returns current url filters', () => {
      expect(urlFilters[0]).toEqual({"category": ["All"], "filter": {"severity": ["critical","warning"]}})
    })
  })
  
  describe('setUrlFilters', () => {
    const inputJson = {"category": ["All"], "filter": {"severity": ["critical"], "tier": [], "region": ["eu-de-1","qa-de-1"]}}
    beforeEach(() => {
      const [currentUrlFilters,setUrlFilters] = urlFilters
      setUrlFilters(inputJson)
    })

    it('modifies location hash', () => {
      expect(window.location.hash).toEqual('#category=All&filter_severity=critical&filter_region=eu-de-1&filter_region=qa-de-1')
    })
  })

})
