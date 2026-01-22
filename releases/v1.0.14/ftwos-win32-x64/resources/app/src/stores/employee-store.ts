import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Employee } from '@/types/employee'

interface EmployeeState {
  employees: Employee[]
  isLoading: boolean
  error: string | null
  
  // Actions
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateEmployee: (id: string, updates: Partial<Employee>) => void
  removeEmployee: (id: string) => void
  getEmployee: (id: string) => Employee | undefined
  getEmployeesByDepartment: (department: string) => Employee[]
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: [],
      isLoading: false,
      error: null,

      addEmployee: (employeeData) => set((state) => ({
        employees: [
          ...state.employees,
          {
            ...employeeData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      })),

      updateEmployee: (id, updates) => set((state) => ({
        employees: state.employees.map(emp => 
          emp.id === id ? { ...emp, ...updates, updatedAt: new Date() } : emp
        )
      })),

      removeEmployee: (id) => set((state) => ({
        employees: state.employees.filter(emp => emp.id !== id)
      })),

      getEmployee: (id) => get().employees.find(emp => emp.id === id),
      
      getEmployeesByDepartment: (dept) => 
        get().employees.filter(emp => emp.department === dept)
    }),
    {
      name: 'ftw-employee-storage',
      // Custom serialization for Date objects
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          return JSON.parse(str, (key, value) => {
            if (key.endsWith('Date') || key === 'startTime' || key === 'endTime' || key === 'createdAt' || key === 'updatedAt') {
              return new Date(value)
            }
            return value
          })
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
