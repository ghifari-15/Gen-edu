"use client"

import { useEffect, useRef, useState } from 'react'

interface LearningSessionOptions {
  activityType: 'notebook_session' | 'quiz_session' | 'study_session'
  resourceId?: string
  resourceTitle?: string
  minSessionDuration?: number // minimum minutes to track
}

export function useLearningSession(options: LearningSessionOptions) {
  const startTimeRef = useRef<Date | null>(null)
  const lastActivityRef = useRef<Date>(new Date())
  const [isActive, setIsActive] = useState(false)
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    activityType,
    resourceId,
    resourceTitle,
    minSessionDuration = 1
  } = options

  // Start tracking session
  const startSession = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = new Date()
      lastActivityRef.current = new Date()
      setIsActive(true)
      console.log(`Started ${activityType} session`)
    }
  }

  // Update activity timestamp (user is actively doing something)
  const updateActivity = () => {
    lastActivityRef.current = new Date()
    
    // Reset session timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current)
    }
    
    // Set timeout to end session after 5 minutes of inactivity
    sessionTimeoutRef.current = setTimeout(() => {
      endSession()
    }, 5 * 60 * 1000) // 5 minutes
  }

  // End tracking session
  const endSession = async () => {
    if (!startTimeRef.current || !isActive) return

    const endTime = new Date()
    const sessionDuration = Math.round((endTime.getTime() - startTimeRef.current.getTime()) / (1000 * 60)) // in minutes

    console.log(`Ending ${activityType} session. Duration: ${sessionDuration} minutes`)

    // Only track if session is longer than minimum duration
    if (sessionDuration >= minSessionDuration) {
      try {
        const response = await fetch('/api/user/track-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'learning_session',
            title: `Learning session: ${resourceTitle || 'Study time'}`,
            description: `Studied for ${sessionDuration} minutes`,
            metadata: {
              sessionDuration,
              activityType,
              resourceId,
              startTime: startTimeRef.current.toISOString(),
              endTime: endTime.toISOString(),
            }
          }),
        })

        if (!response.ok) {
          console.error('Failed to track learning session')
        } else {
          console.log(`Successfully tracked ${sessionDuration} minute learning session`)
        }
      } catch (error) {
        console.error('Error tracking learning session:', error)
      }
    }

    // Reset session
    startTimeRef.current = null
    setIsActive(false)
    
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current)
      sessionTimeoutRef.current = null
    }
  }

  // Get current session duration in minutes
  const getCurrentSessionDuration = () => {
    if (!startTimeRef.current) return 0
    return Math.round((new Date().getTime() - startTimeRef.current.getTime()) / (1000 * 60))
  }

  // Auto-save session data periodically
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        updateActivity() // This will reset the timeout as well
      }, 30000) // Check every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        endSession()
      }
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current)
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Handle page visibility change (user switches tabs or minimizes window)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        // User switched away, end session after a delay
        saveTimeoutRef.current = setTimeout(() => {
          endSession()
        }, 2 * 60 * 1000) // 2 minutes delay
      } else if (!document.hidden && saveTimeoutRef.current) {
        // User came back, cancel the delayed end
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
        updateActivity()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isActive])

  // Handle beforeunload (user closes tab/browser)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isActive) {
        // Use navigator.sendBeacon for reliable tracking on page unload
        const sessionDuration = getCurrentSessionDuration()
        if (sessionDuration >= minSessionDuration) {
          navigator.sendBeacon('/api/user/track-activity', JSON.stringify({
            type: 'learning_session',
            title: `Learning session: ${resourceTitle || 'Study time'}`,
            description: `Studied for ${sessionDuration} minutes`,
            metadata: {
              sessionDuration,
              activityType,
              resourceId,
              startTime: startTimeRef.current?.toISOString(),
              endTime: new Date().toISOString(),
            }
          }))
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isActive, resourceId, resourceTitle, activityType, minSessionDuration])

  return {
    isActive,
    startSession,
    endSession,
    updateActivity,
    getCurrentSessionDuration,
  }
}
