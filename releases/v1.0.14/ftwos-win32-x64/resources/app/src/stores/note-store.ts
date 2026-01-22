/**
 * Note Store
 * Manages notes/ideas captured via Quick Capture
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Note {
  id: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface NoteState {
  notes: Note[]
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  searchNotes: (query: string) => Note[]
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],

      createNote: (note) => {
        const newNote: Note = {
          ...note,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set((state) => ({
          notes: [newNote, ...state.notes]
        }))
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map(note =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          )
        }))
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter(note => note.id !== id)
        }))
      },

      searchNotes: (query) => {
        const { notes } = get()
        const lowerQuery = query.toLowerCase()
        return notes.filter(note =>
          note.content.toLowerCase().includes(lowerQuery) ||
          note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        )
      }
    }),
    {
      name: 'ftw-notes-storage'
    }
  )
)

