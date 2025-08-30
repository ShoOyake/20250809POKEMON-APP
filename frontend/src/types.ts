export type Role = "p1" | "p2";

export type PokemonState = {
  name: string;
  hp: number;
  maxHp: number;
};

export type BattleState = {
  p1: PokemonState;
  p2: PokemonState;
};

export type StateResponse =
  | { changed: false; version: number }
  | { changed: true; version: number; turn: number; battle: BattleState; winner: Role | null };

export type CreateRoomResp = {
  room_id: string;
  player_token: string;
  role: Role;
};

export type JoinRoomResp = {
  player_token: string;
  role: Role;
};