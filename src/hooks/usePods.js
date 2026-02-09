import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

async function fetchPods() {
  const res = await fetch('/api/pods')
  if (!res.ok) throw new Error('Failed to fetch pods')
  return res.json()
}

export function usePods() {
  return useQuery({
    queryKey: ['pods'],
    queryFn: fetchPods,
    refetchInterval: 10000,
  })
}

export function useStopPod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (podId) => {
      const res = await fetch(`/api/pods/${podId}/stop`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to stop pod')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pods'] }),
  })
}

export function useStartPod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (podId) => {
      const res = await fetch(`/api/pods/${podId}/start`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to start pod')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pods'] }),
  })
}

export function useRestartPod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (podId) => {
      const res = await fetch(`/api/pods/${podId}/restart`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to restart pod')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pods'] }),
  })
}

export function useTerminatePod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (podId) => {
      const res = await fetch(`/api/pods/${podId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to terminate pod')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pods'] }),
  })
}

export function useDeployPod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (config) => {
      const res = await fetch('/api/pods/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to deploy pod')
      }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pods'] }),
  })
}
