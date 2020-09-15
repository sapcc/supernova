import useUrlFilters from './useUrlFilters'
import { testHook } from './testHook'


describe('useUrlFilters', () => {
  let initialURLFilters
  beforeEach(() => 
    testHook(() => initialURLFilters = useUrlFilters(true,{'test1': ['value1'],'test2': ['value21','value22']}))
  )

  it('returns a json object', () => {
    expect(initialURLFilters instanceof Object).toBe(true)   
  })

  it('initial url filters object is empty', () => {
    expect(initialURLFilters).toEqual({})
  })

  describe('currentUrlFilters', () => {
    beforeEach(() => {
      global.window = Object.create(window);
      Object.defineProperty(window, 'location', {
        value: {
          search: '?category=All&filter_severity=critical&filter_severity=warning&test=value'
        }
      })
      
      testHook(() => initialURLFilters = useUrlFilters(true,{'category': [],'filter': []}))
    })

    it('returns current url filters', () => {
      expect(initialURLFilters).toEqual({"category": ["All"], "filter": {"severity": ["critical","warning"]}})
    })
  })
    
  describe('returns current URL filters', () => {
    beforeEach(() => {
      global.window = Object.create(window);
      Object.defineProperty(window, 'location', {
        value: {
          search: '?category=All&filter_severity=critical&filter_severity=warning&test=value'
        }
      })
      testHook(() => initialURLFilters = useUrlFilters(true,{'category': ['API'],'filter': []}))
    })

    it('returns current url filters', () => {
      expect(initialURLFilters).toEqual({"category": ["All"], "filter": {"severity": ["critical","warning"]}})
    })
  })
  
})
