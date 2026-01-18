import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, User, Mail, Phone, Briefcase, Filter } from 'lucide-react'
import { useEmployeeStore } from '@/stores/employee-store'
import { Employee } from '@/types/employee'
import { cn } from '@/services/utils'

export function EmployeeDirectory() {
  const { employees, addEmployee } = useEmployeeStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDept, setFilterDept] = useState('all')

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDept = filterDept === 'all' || emp.department === filterDept

    return matchesSearch && matchesDept
  })

  // Group departments for filter
  const departments = Array.from(new Set(employees.map(e => e.department)))

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employee Directory</h2>
          <p className="text-muted-foreground">Manage your team members and roles</p>
        </div>
        <Button onClick={() => {
            // Quick mock add for demo
            addEmployee({
                companyId: 'comp_1',
                employeeNumber: `EMP-${Math.floor(Math.random()*1000)}`,
                firstName: 'New',
                lastName: 'Employee',
                email: `user${Math.floor(Math.random()*100)}@company.com`,
                department: 'Engineering',
                position: 'Developer',
                role: 'employee',
                employmentType: 'full-time',
                status: 'active',
                hireDate: new Date(),
                currency: 'USD'
            })
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-white/50 p-4 rounded-xl border border-slate-200 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select 
                className="bg-white border border-slate-200 rounded-md text-sm p-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
            >
                <option value="all">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
        {filteredEmployees.map(employee => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  {employee.avatarUrl ? (
                    <img src={employee.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span>{employee.firstName[0]}{employee.lastName[0]}</span>
                  )}
                </div>
                <span className={cn(
                    "text-[10px] px-2 py-1 rounded-full font-medium uppercase tracking-wider",
                    employee.status === 'active' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                )}>
                    {employee.status}
                </span>
              </div>
              
              <div className="space-y-1 mb-4">
                <h3 className="font-bold text-lg truncate">{employee.firstName} {employee.lastName}</h3>
                <p className="text-sm text-slate-500 truncate">{employee.position}</p>
                <p className="text-xs text-blue-600 font-medium">{employee.department}</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{employee.email}</span>
                </div>
                {employee.phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{employee.phone}</span>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredEmployees.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <User className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium">No employees found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
            </div>
        )}
      </div>
    </div>
  )
}
