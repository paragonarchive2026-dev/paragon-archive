# Paragon Chess — Club Match specification

**Status:** playable free computer mode; owner demo pass pending (`buildProgress: 90`).  
**Path:** `games/chess/index.html` → `games/chess/play.html?level=club`  
**Engine key / variant:** `chess / computer`

## Built experience

- Player has White against a private, entirely local computer opponent.
- Casual (1 ply), Club (2 ply) and Master (3 ply) alpha-beta search with material, development and centre evaluation.
- Full board legality: king safety, check, checkmate, stalemate, king/queen-side castling, en passant, queen/rook/bishop/knight promotion, fifty-move draw, threefold repetition and insufficient-material draw.
- Tournament-style responsive walnut/maple board, keyboard-accessible squares, checked/selected/legal/capture/last-move markers, captured material and signed move ledger.
- Position hint that recommends but never plays a move. Hints are recorded and reduce final performance points.
- Shared engine lifecycle: seeded AI tie selection, free guest access, exact board resume, local score/bests, action hash, rules, quit and result overlay.
- Separate in-game General / Free / Bet / Multiplayer performance board. Free points count locally; they never enter the revenue-funded Coins Leaderboard.

## Money and online boundary

Free mode is available to guests, members and signed-in players with a zero coin balance. The chess file never calls coin, wallet, payout, global leaderboard or network functions.

The manifest preserves future stake capability, so the shared HUD lists every reason it is locked. There is deliberately no stake input, player-search list or simulated human opponent while real-money mode is off. Human-versus-human play must use authenticated server presence, server-issued match state and `paragon_game_settle`; the browser cannot referee a paid result.

## Pure engine exported for regression tests

`window.ParagonChess` exports the board/rule primitives, including:

- `createInitialState`, `squareName`, `parseSquare`
- `isSquareAttacked`, `inCheck`, `pseudoMoves`, `legalMoves`
- `findMove`, `applyMove`, `gameStatus`, `insufficientMaterial`
- `moveNotation`, `evaluate`, `chooseAiMove`

The rules engine has no runtime dependency; the UI hands every checkpoint/result to `ParagonGames`.
