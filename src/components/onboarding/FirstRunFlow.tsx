import React, { useState } from 'react'
import { STARTER_TEMPLATES } from '@/stores/template-registry'
import { WorkspaceInfo, UserInfo, Preferences, useOnboardingStore } from '@/stores/onboarding-store'

// Lightweight First-Run Flow with 5 steps
const FirstRunFlow: React.FC = () => {
  // local step state: 0 welcome, 1 workspace, 2 user, 3 prefs, 4 templates, 5 finalize
  const [step, setStep] = useState<number>(0)
  const [workspaceName, setWorkspaceName] = useState<string>('My Workspace')
  const [timezone, setTimezone] = useState<string>('UTC')
  const [currency, setCurrency] = useState<string>('USD')
  const [userName, setUserName] = useState<string>('User')
  const [userEmail, setUserEmail] = useState<string>('user@example.com')
  const [userRole, setUserRole] = useState<string>('Member')
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system')
  const [telemetry, setTelemetry] = useState<boolean>(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(STARTER_TEMPLATES[0]?.id)

  const { start, setWorkspace, setUser, setPreferences, selectTemplate, complete, skip } = useOnboardingStore((s) => ({
    start: s.start,
    setWorkspace: s.setWorkspace,
    setUser: s.setUser,
    setPreferences: s.setPreferences,
    selectTemplate: s.selectTemplate,
    complete: s.complete,
    skip: s.skip
  }))

  // Handlers
  const onStart = () => {
    start()
    setStep(1)
  }

  const onNext = () => setStep((n) => Math.min(n + 1, 5))
  const onBack = () => setStep((n) => Math.max(n - 1, 0))

  const onFinish = () => {
    const workspace: WorkspaceInfo = {
      name: workspaceName,
      timezone,
      currency,
      createdAt: new Date().toISOString()
    }
    const user: UserInfo = {
      name: userName,
      email: userEmail,
      role: userRole
    }
    const preferences: Preferences = {
      theme,
      telemetry
    }

    setWorkspace(workspace)
    setUser(user)
    setPreferences(preferences)
    selectTemplate(selectedTemplate ?? STARTER_TEMPLATES[0]?.id ?? 'crm-starter-mini')
    complete()
  }

  const onSkip = () => {
    skip()
  }

  // Simple render helpers
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to FTW-OS</h2>
            <p className="text-sm text-slate-600 mb-6">A minimal onboarding to get you started quickly.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onStart}>Start Setup</button>
            <div className="mt-3">
              <button className="text-sm text-slate-600" onClick={onSkip}>Skip onboarding</button>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="p-6 space-y-3">
            <h3 className="font-semibold">Workspace</h3>
            <div>
              <label className="block text-sm mb-1">Workspace Name</label>
              <input className="w-full border rounded px-2 py-1" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Timezone</label>
                <input className="w-full border rounded px-2 py-1" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Currency</label>
                <input className="w-full border rounded px-2 py-1" value={currency} onChange={(e) => setCurrency(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={onBack}>Back</button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={onNext}>Next</button>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="p-6 space-y-3">
            <h3 className="font-semibold">User</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input className="w-full border rounded px-2 py-1" value={userName} onChange={(e) => setUserName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input className="w-full border rounded px-2 py-1" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Role</label>
                <input className="w-full border rounded px-2 py-1" value={userRole} onChange={(e) => setUserRole(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-between">
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={onBack}>Back</button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={onNext}>Next</button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="p-6 space-y-3">
            <h3 className="font-semibold">Preferences</h3>
            <div>
              <label className="block text-sm mb-1">Theme</label>
              <select className="w-full border rounded px-2 py-1" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input type="checkbox" checked={telemetry} onChange={(e) => setTelemetry(e.target.checked)} />
                <span className="ml-2 text-sm">Share telemetry (opt-in)</span>
              </label>
            </div>
            <div className="flex justify-between">
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={onBack}>Back</button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={onNext}>Next</button>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="p-6 space-y-3">
            <h3 className="font-semibold">Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STARTER_TEMPLATES.map((t) => {
                const isSelected = selectedTemplate === t.id
                return (
                  <div key={t.id} className={"border rounded p-3 cursor-pointer" + (isSelected ? ' bg-blue-50 border-blue-400' : '')} onClick={() => setSelectedTemplate(t.id)}>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-slate-600">{t.description}</div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-4">
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={onBack}>Back</button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={onFinish}>Finish setup</button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="onboarding-flow max-w-2xl mx-auto border rounded p-4">{renderStep()}</div>
  )
}

export default FirstRunFlow
