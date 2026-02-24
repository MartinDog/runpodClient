import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "https://d8f5euw4493kgn-8080.proxy.runpod.net/api";

export async function loginUser(userId) {
  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export function useSessions(userId) {
  return useQuery({
    queryKey: ["sessions", userId],
    queryFn: async () => {
      const res = await fetch(
        `${API}/sessions/user/${encodeURIComponent(userId)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, title, systemPrompt }) => {
      const res = await fetch(`${API}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, systemPrompt }),
      });
      if (!res.ok) throw new Error("Failed to create session");
      return res.json();
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["sessions", vars.userId] }),
  });
}

export function useChatHistory(sessionId) {
  return useQuery({
    queryKey: ["chatHistory", sessionId],
    queryFn: async () => {
      const res = await fetch(`${API}/chat/history/${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    enabled: !!sessionId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, userId, message }) => {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId, message }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["chatHistory", vars.sessionId] }),
  });
}
