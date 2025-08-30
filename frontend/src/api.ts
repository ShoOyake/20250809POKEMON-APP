const BASE = "http://localhost:8000";

export async function createRoom() {
  const res = await fetch(`${BASE}/rooms`, { method: "POST" });
  if (!res.ok) throw new Error("createRoom failed");
  return (await res.json()) as { room_id: string; player_token: string; role: "p1" };
}

export async function joinRoom(roomId: string) {
  const res = await fetch(`${BASE}/rooms/${roomId}/join`, { method: "POST" });
  if (!res.ok) throw new Error("joinRoom failed");
  return (await res.json()) as { player_token: string; role: "p2" };
}

export async function getState(roomId: string, sinceVersion: number) {
  const res = await fetch(`${BASE}/rooms/${roomId}/state?since_version=${sinceVersion}`);
  if (!res.ok) throw new Error("getState failed");
  return await res.json();
}

export async function sendMove(roomId: string, token: string, moveId: string) {
  const res = await fetch(`${BASE}/rooms/${roomId}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, move_id: moveId }),
  });
  if (!res.ok) throw new Error("sendMove failed");
  return await res.json();
}