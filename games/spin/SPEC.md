# Paragon Spin — Precision Wheel specification

**Status:** playable free mode; owner demo pass pending (`buildProgress: 90`).  
**Path:** `games/spin/index.html` → `games/spin/play.html`  
**Engine key / variant:** `spin / wheel-duel`

## Built experience

- Six-turn player-versus-house prediction duel on a twelve-sector wheel.
- Player and house lock one sector each before one shared result.
- Published symmetric scoring: exact 120, adjacent 60, two away 25, otherwise 0.
- Circular distance (12 beside 1), seeded result and house prediction, deterministic final wheel rotation.
- Responsive brass/enamel wheel room, reduced-motion path, keyboard-accessible prediction buttons.
- Shared engine lifecycle: guest free access, exact resume, local best/stats, audit seed/action hash, inline rules/quit/result UI.
- In-game performance board with General / Free / Bet / Multiplayer views. Only real device sessions or verified adapter rows render; empty online views never fabricate users.

## Money boundary

Paragon Spin is **free-only**. It never imports or calls coin balance, spend, payout, matchmaking or leaderboard-reward functions. Its points are local game performance only. Signed-in players with zero coins and guests can play.

No Bet or Multiplayer UI is active. Those labels exist only as honest empty leaderboard scopes for the owner's future combined in-game ranking model. Real player search must wait for a production presence/matchmaking service; sample “searching” users are forbidden.

## Pure rules exported for regression tests

`window.ParagonSpin` exports:

- `circularDistance(a, b, total)`
- `scorePrediction(target, result)`
- `rotationForResult(currentRotation, result, turns)`
- `freshState()`

Every random runtime decision uses `ParagonGames` seeded methods.
