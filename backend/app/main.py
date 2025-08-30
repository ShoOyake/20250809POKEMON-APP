from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional
import time, uuid

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # フロントの開発URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- インメモリ状態（MVP用） ----
# 本番ではDB/Redisを検討
rooms: Dict[str, dict] = {}      # room_id -> room_state

# ---- モデル ----
class CreateRoomResp(BaseModel):
    room_id: str
    player_token: str
    role: str  # "p1"

class JoinRoomResp(BaseModel):
    player_token: str
    role: str  # "p2"

class MoveReq(BaseModel):
    token: str
    move_id: str  # "tackle" | "water_gun" | "ember"

class StateResp(BaseModel):
    changed: bool
    version: int
    turn: Optional[int] = None
    battle: Optional[dict] = None
    winner: Optional[Optional[str]] = None  # "p1" | "p2" | None

# ---- ユーティリティ ----
def now() -> float:
    return time.time()

def calc_damage(move_id: str) -> int:
    return {"tackle": 18, "water_gun": 22, "ember": 20}.get(move_id, 10)

def make_room() -> dict:
    return {
        "players": {},         # token -> "p1"/"p2"
        "turn": 1,
        "battle": {
            "p1": {"name": "Pochama",    "hp": 80, "maxHp": 80},
            "p2": {"name": "Hinoarashi", "hp": 75, "maxHp": 75},
        },
        "winner": None,        # "p1" / "p2" / None
        "version": 1,          # 状態変更のたびに+1
        "updated_at": now(),
    }

# ---- エンドポイント ----
@app.post("/rooms", response_model=CreateRoomResp)
def create_room():
    room_id = str(uuid.uuid4())[:8]
    token = str(uuid.uuid4())
    room = make_room()
    room["players"][token] = "p1"
    rooms[room_id] = room
    return {"room_id": room_id, "player_token": token, "role": "p1"}

@app.post("/rooms/{room_id}/join", response_model=JoinRoomResp)
def join_room(room_id: str):
    if room_id not in rooms:
        raise HTTPException(404, "room not found")
    room = rooms[room_id]
    if any(role == "p2" for role in room["players"].values()):
        raise HTTPException(400, "room full")
    token = str(uuid.uuid4())
    room["players"][token] = "p2"
    room["version"] += 1
    room["updated_at"] = now()
    return {"player_token": token, "role": "p2"}

@app.get("/rooms/{room_id}/state", response_model=StateResp)
def get_state(room_id: str, since_version: int = 0):
    if room_id not in rooms:
        raise HTTPException(404, "room not found")
    room = rooms[room_id]
    if since_version and room["version"] <= since_version:
        return {"changed": False, "version": room["version"]}
    return {
        "changed": True,
        "version": room["version"],
        "turn": room["turn"],
        "battle": room["battle"],
        "winner": room["winner"],
    }

@app.post("/rooms/{room_id}/move")
def choose_move(room_id: str, req: MoveReq):
    if room_id not in rooms:
        raise HTTPException(404, "room not found")
    room = rooms[room_id]
    role = room["players"].get(req.token)
    if role not in ("p1", "p2"):
        raise HTTPException(403, "invalid token")
    if room["winner"] is not None:
        raise HTTPException(400, "game already finished")

    target = "p2" if role == "p1" else "p1"
    dmg = calc_damage(req.move_id)

    b = room["battle"]
    b[target]["hp"] = max(0, b[target]["hp"] - dmg)

    if b[target]["hp"] == 0:
        room["winner"] = role

    room["turn"] += 1
    room["version"] += 1
    room["updated_at"] = now()
    return {"ok": True, "version": room["version"]}