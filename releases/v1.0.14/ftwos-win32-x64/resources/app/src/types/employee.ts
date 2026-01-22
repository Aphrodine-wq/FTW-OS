export type EmployeeRole = 'admin' | 'manager' | 'employee' | 'contractor'
export type EmploymentStatus = 'active' | 'inactive' | 'on-leave' | 'terminated'
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern'

export interface Employee {
  id: string
  userId?: string // Link to auth user
  companyId: string
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  department: string
  position: string
  role: EmployeeRole
  employmentType: EmploymentType
  status: EmploymentStatus
  hireDate: Date
  terminationDate?: Date
  salary?: number
  currency: string
  managerId?: string
  avatarUrl?: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface TimeEntry {
  id: string
  employeeId: string
  projectId?: string
  taskId?: string
  description?: string
  startTime: Date
  endTime?: Date
  duration: number // in seconds
  billable: boolean
  hourlyRate?: number
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Timesheet {
  id: string
  employeeId: string
  startDate: Date
  endDate: Date
  entries: TimeEntry[]
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  totalHours: number
  billableHours: number
}
