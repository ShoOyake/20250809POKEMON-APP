import { useEffect, useMemo, useRef, useState } from "react";
import { createRoom, joinRoom, getState, sendMove } from "./api";
import type { BattleState, Role, StateResponse } from "./types";

type Conn = {
  roomId: string;
  token: string;
  role: Role;
};

function App() {
  const [conn, setConn] = useState<Conn | null>(null);
  const [version, setVersion] = useState(0);
  const [turn, setTurn] = useState<number | null>(null);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [winner, setWinner] = useState<Role | null>(null);
  const [joinRoomId, setJoinRoomId] = useState("");

  // ポーリング開始/停止
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!conn) return;
    const tick = async () => {
      try {
        const st: StateResponse = await getState(conn.roomId, version);
        if (st.changed) {
          setVersion(st.version);
          setTurn(st.turn);
          setBattle(st.battle);
          setWinner(st.winner);
        }
      } catch (e) {
        console.error(e);
      }
    };
    // 初回すぐ実行
    tick();
    // 1秒間隔ポーリング
    timerRef.current = window.setInterval(tick, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [conn, version]);

  const canPlay = useMemo(() => !!conn && !!battle && !winner, [conn, battle, winner]);

  const onCreateRoom = async () => {
    const res = await createRoom();
    setConn({ roomId: res.room_id, token: res.player_token, role: res.role });
    setVersion(0);
  };

  const onJoinRoom = async () => {
    if (!joinRoomId) return;
    const res = await joinRoom(joinRoomId);
    setConn({ roomId: joinRoomId, token: res.player_token, role: res.role });
    setVersion(0);
  };

  const play = async (moveId: string) => {
    if (!conn) return;
    await sendMove(conn.roomId, conn.token, moveId);
    // サーバー側versionが上がるので、次回ポーリングで反映される
  };

  return (
    <div style={{ padding: 16, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Pokemon Battle (REST Polling)</h1>

      {!conn && (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={onCreateRoom}>ルーム作成（p1）</button>
          <input
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            placeholder="参加する room_id を入力"
            style={{ padding: 6 }}
          />
          <button onClick={onJoinRoom} disabled={!joinRoomId}>
            参加（p2）
          </button>
        </div>
      )}

      {conn && (
        <div style={{ marginTop: 12 }}>
          <div>room_id: <code>{conn.roomId}</code></div>
          <div>あなたのロール: <b>{conn.role}</b></div>
          <div>version: {version}</div>
        </div>
      )}

      {battle && (
        <div style={{ marginTop: 20, display: "flex", gap: 40 }}>
          <HPCard label="P1" p={battle.p1} />
          <HPCard label="P2" p={battle.p2} />
        </div>
      )}

      {turn !== null && <div style={{ marginTop: 8 }}>ターン: {turn}</div>}

      {canPlay && (
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button onClick={() => play("tackle")}>たいあたり</button>
          <button onClick={() => play("water_gun")}>みずでっぽう</button>
          <button onClick={() => play("ember")}>ひのこ</button>
        </div>
      )}

      {winner && <h2 style={{ marginTop: 16 }}>勝者: {winner}</h2>}
    </div>
  );
}
export default App;


function HPCard({ label, p }: { label: string; p: { name: string; hp: number; maxHp: number } }) {
  const percent = Math.max(0, Math.round((p.hp / p.maxHp) * 100));
  return (
    <div>
      <div style={{ fontWeight: 600 }}>{label}: {p.name}</div>
      <div style={{ border: "1px solid #ccc", width: 220, height: 14 }}>
        <div style={{ width: `${percent}%`, height: 14, background: "limegreen" }} />
      </div>
      <div>{p.hp} / {p.maxHp}</div>
    </div>
  );
}
