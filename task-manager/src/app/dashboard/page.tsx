'use client'

import { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import { AuthContext } from '@/context/AuthContext'

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'completed'
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [title, setTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [loading, setLoading] = useState(false)

  const { logout } = useContext(AuthContext)

  const fetchTasks = async (page = 1, searchTerm = search, statusFilter = filter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '10')

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const res = await api.get(`/tasks?${params.toString()}`)
      setTasks(res.data.tasks)
      setPagination(res.data.pagination)
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      alert('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks(1)
  }, [])

  const handleSearch = (value: string) => {
    setSearch(value)
    fetchTasks(1, value, filter)
  }

  const handleFilterChange = (value: 'all' | 'pending' | 'completed') => {
    setFilter(value)
    fetchTasks(1, search, value)
  }

  const addTask = async () => {
    if (!title.trim()) return

    try {
      await api.post('/tasks', {
        title: title.trim(),
        description: ''
      })
      setTitle('')
      fetchTasks(1, search, filter)
    } catch (err) {
      console.error('Failed to add task:', err)
      alert('Failed to add task')
    }
  }

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await api.delete(`/tasks/${id}`)
      fetchTasks(pagination.page, search, filter)
    } catch (err) {
      console.error('Failed to delete task:', err)
      alert('Failed to delete task')
    }
  }

  const updateTask = async (id: string) => {
    if (!editTitle.trim()) return

    try {
      await api.patch(`/tasks/${id}`, {
        title: editTitle.trim(),
        description: editDescription.trim()
      })
      setEditingId(null)
      setEditTitle('')
      setEditDescription('')
      fetchTasks(pagination.page, search, filter)
    } catch (err) {
      console.error('Failed to update task:', err)
      alert('Failed to update task')
    }
  }

  const toggleStatus = async (id: string) => {
    try {
      await api.post(`/tasks/${id}/toggle`)
      fetchTasks(pagination.page, search, filter)
    } catch (err) {
      console.error('Failed to toggle task status:', err)
      alert('Failed to toggle task status')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <button
            onClick={() => {
              logout();
              // Invalidate cache on logout
              router.refresh()
            }}
            className="text-sm text-red-400 hover:underline w-fit hover:text-red-300 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            placeholder="Search tasks by title or description"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2
                   text-white placeholder-neutral-500
                   focus:outline-none focus:border-neutral-600 transition-colors"
          />

          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as typeof filter)}
            className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2
                   text-white focus:outline-none focus:border-neutral-600 transition-colors"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Add Task */}
        <div className="flex gap-2 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="New task"
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2
                   text-white placeholder-neutral-500
                   focus:outline-none focus:border-neutral-600 transition-colors"
          />
          <button
            onClick={addTask}
            disabled={!title.trim()}
            className="px-4 rounded-md bg-white text-black hover:bg-neutral-200 
                   active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all"
          >
            Add
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-neutral-400 mb-4">
            <p>Loading tasks...</p>
          </div>
        )}

        {/* Task List */}
        <ul className="space-y-3">
          {tasks.length === 0 && !loading ? (
            <li className="text-center text-neutral-400 py-8">
              {search || filter !== 'all'
                ? 'No tasks match your search'
                : 'No tasks yet. Add one above!'}
            </li>
          ) : (
            tasks.map((task) => (
              <li
                key={task.id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-4
                       flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                {/* Left */}
                <div className="flex-1">
                  {editingId === task.id ? (
                    <div className="space-y-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Task title"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1
                               text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                        autoFocus
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Task description (optional)"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1
                               text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600
                               resize-none text-sm"
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div>
                      <p
                        className={`font-medium ${task.status === 'completed'
                          ? 'line-through text-neutral-500'
                          : 'text-white'
                          }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-neutral-400 mt-1">
                          {task.description}
                        </p>
                      )}

                      <span
                        className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${task.status === 'completed'
                          ? 'bg-green-900/30 text-green-300 border border-green-800/50'
                          : 'bg-yellow-900/30 text-yellow-300 border border-yellow-800/50'
                          }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right */}
                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    onClick={() => toggleStatus(task.id)}
                    className="px-3 py-1 rounded border border-neutral-700
                           hover:bg-neutral-800 transition-colors"
                  >
                    {task.status === 'pending' ? 'Mark Completed' : 'Mark Pending'}
                  </button>

                  {editingId === task.id ? (
                    <>
                      <button
                        onClick={() => updateTask(task.id)}
                        className="text-green-400 hover:text-green-300 hover:underline transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditTitle('')
                          setEditDescription('')
                        }}
                        className="text-neutral-400 hover:text-neutral-300 hover:underline transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(task.id)
                        setEditTitle(task.title)
                        setEditDescription(task.description || '')
                      }}
                      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-400 hover:text-red-300 hover:underline transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <button
              onClick={() => fetchTasks(Math.max(1, pagination.page - 1), search, filter)}
              disabled={pagination.page === 1}
              className="px-3 py-2 rounded border border-neutral-700 hover:bg-neutral-800
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchTasks(page, search, filter)}
                className={`px-3 py-2 rounded border transition-colors ${pagination.page === page
                  ? 'bg-white text-black border-white'
                  : 'border-neutral-700 hover:bg-neutral-800'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => fetchTasks(Math.min(pagination.pages, pagination.page + 1), search, filter)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 rounded border border-neutral-700 hover:bg-neutral-800
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Task count */}
        <div className="text-center text-neutral-400 text-sm mt-4">
          Showing {tasks.length} of {pagination.total} tasks
        </div>
      </div>
    </div>
  )
}