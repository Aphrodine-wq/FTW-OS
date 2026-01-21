import { describe, it, expect } from 'vitest'
import { getModuleCategory, getModulePriority, MODULE_CATEGORIES } from './module-preloader'

describe('Module Preloader', () => {
  it('should correctly identify module categories', () => {
    expect(getModuleCategory('dashboard')).toBe('core')
    expect(getModuleCategory('tasks')).toBe('productivity')
    expect(getModuleCategory('unknown-module')).toBe('other')
  })

  it('should return correct priorities', () => {
    expect(getModulePriority('dashboard')).toBe(10)
    expect(getModulePriority('settings')).toBe(9)
    expect(getModulePriority('unknown')).toBe(0)
  })

  it('should have consistent categories', () => {
    // Verify all modules in categories are strings
    Object.values(MODULE_CATEGORIES).forEach(modules => {
      modules.forEach(module => {
        expect(typeof module).toBe('string')
      })
    })
  })
})
