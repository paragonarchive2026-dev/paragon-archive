/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: chess.js
  EXPECTED PROJECT PATH: /games/chess/js/chess.js
  ROLE: Full local chess rules, computer search and tournament-board rendering for Paragon
        Chess. The shared game engine owns sessions, seeded tie-breaking, resume, score/bests,
        audit and all free/stake boundaries; this file owns chess only.
  RULE COVERAGE: legal king safety, check/checkmate, stalemate, castling, en passant, all four
        promotions, fifty-move draw, threefold repetition and insufficient material.
  PLATFORM LAWS: free computer play never touches coins or the network; human stake matches
        are not simulated; AI tie choices use engine.next; no browser dialogs.
  RESTORE-LOAD NOTE: Load after site-kit.js, manifest.js, engine.js and game-kit.js.
*/
(function (global) {
  "use strict";

  var doc = global.document;
  var games = global.ParagonGames;
  var kit = global.ParagonGameKit;
  var FILES = "abcdefgh";
  var PIECE_SYMBOLS = {
    K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟"
  };
  var PIECE_NAMES = { k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn" };
  var VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
  var aiTimer = null;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function colorOf(piece) {
    if (!piece) return "";
    return piece === piece.toUpperCase() ? "w" : "b";
  }

  function typeOf(piece) { return String(piece || "").toLowerCase(); }
  function opponent(color) { return color === "w" ? "b" : "w"; }
  function onBoard(row, col) { return row >= 0 && row < 8 && col >= 0 && col < 8; }
  function at(row, col) { return row * 8 + col; }
  function rowOf(index) { return Math.floor(Number(index) / 8); }
  function colOf(index) { return Number(index) % 8; }

  function squareName(index) {
    var i = Number(index);
    if (!isFinite(i) || i < 0 || i > 63) return "";
    return FILES[colOf(i)] + String(8 - rowOf(i));
  }

  function parseSquare(name) {
    var text = String(name || "").toLowerCase();
    if (!/^[a-h][1-8]$/.test(text)) return -1;
    return at(8 - Number(text[1]), FILES.indexOf(text[0]));
  }

  function initialBoard() {
    return ("rnbqkbnr" + "pppppppp" + "........" + "........" + "........" + "........" + "PPPPPPPP" + "RNBQKBNR")
      .split("").map(function (piece) { return piece === "." ? null : piece; });
  }

  function positionKey(state) {
    return state.board.map(function (piece) { return piece || "."; }).join("") + " " + state.turn + " " + (state.castling || "-") + " " + (state.enPassant == null ? "-" : squareName(state.enPassant));
  }

  function createInitialState() {
    var state = {
      board: initialBoard(),
      turn: "w",
      castling: "KQkq",
      enPassant: null,
      halfmove: 0,
      fullmove: 1,
      positions: []
    };
    state.positions.push(positionKey(state));
    return state;
  }

  function copyCore(state) {
    return {
      board: state.board.slice(),
      turn: state.turn,
      castling: String(state.castling || ""),
      enPassant: state.enPassant == null ? null : Number(state.enPassant),
      halfmove: Math.max(0, Number(state.halfmove) || 0),
      fullmove: Math.max(1, Number(state.fullmove) || 1),
      positions: Array.isArray(state.positions) ? state.positions.slice() : []
    };
  }

  function kingSquare(state, color) {
    var king = color === "w" ? "K" : "k";
    for (var i = 0; i < 64; i++) if (state.board[i] === king) return i;
    return -1;
  }

  function isSquareAttacked(state, square, byColor) {
    var board = state.board;
    var row = rowOf(square);
    var col = colOf(square);
    var pawnRow = row + (byColor === "w" ? 1 : -1);
    var pawn = byColor === "w" ? "P" : "p";
    for (var pc = -1; pc <= 1; pc += 2) {
      if (onBoard(pawnRow, col + pc) && board[at(pawnRow, col + pc)] === pawn) return true;
    }

    var knight = byColor === "w" ? "N" : "n";
    var knightSteps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (var n = 0; n < knightSteps.length; n++) {
      var nr = row + knightSteps[n][0];
      var nc = col + knightSteps[n][1];
      if (onBoard(nr, nc) && board[at(nr, nc)] === knight) return true;
    }

    var king = byColor === "w" ? "K" : "k";
    for (var kr = -1; kr <= 1; kr++) {
      for (var kc = -1; kc <= 1; kc++) {
        if ((!kr && !kc) || !onBoard(row + kr, col + kc)) continue;
        if (board[at(row + kr, col + kc)] === king) return true;
      }
    }

    function ray(directions, types) {
      for (var d = 0; d < directions.length; d++) {
        var rr = row + directions[d][0];
        var cc = col + directions[d][1];
        while (onBoard(rr, cc)) {
          var piece = board[at(rr, cc)];
          if (piece) {
            if (colorOf(piece) === byColor && types.indexOf(typeOf(piece)) !== -1) return true;
            break;
          }
          rr += directions[d][0];
          cc += directions[d][1];
        }
      }
      return false;
    }

    if (ray([[-1,0],[1,0],[0,-1],[0,1]], ["r","q"])) return true;
    return ray([[-1,-1],[-1,1],[1,-1],[1,1]], ["b","q"]);
  }

  function inCheck(state, color) {
    var square = kingSquare(state, color);
    return square < 0 || isSquareAttacked(state, square, opponent(color));
  }

  function pseudoMoves(state, from) {
    var board = state.board;
    var piece = board[from];
    if (!piece) return [];
    var color = colorOf(piece);
    var type = typeOf(piece);
    var row = rowOf(from);
    var col = colOf(from);
    var moves = [];

    function add(to, detail) {
      if (to < 0 || to > 63) return;
      var target = board[to];
      if (target && colorOf(target) === color) return;
      var move = { from: from, to: to };
      Object.keys(detail || {}).forEach(function (key) { move[key] = detail[key]; });
      moves.push(move);
    }

    function addPawn(to, detail) {
      if (rowOf(to) === 0 || rowOf(to) === 7) {
        ["q","r","b","n"].forEach(function (promotion) {
          add(to, Object.assign({}, detail || {}, { promotion: promotion }));
        });
      } else add(to, detail);
    }

    if (type === "p") {
      var direction = color === "w" ? -1 : 1;
      var startRow = color === "w" ? 6 : 1;
      var oneRow = row + direction;
      if (onBoard(oneRow, col) && !board[at(oneRow, col)]) {
        addPawn(at(oneRow, col));
        var twoRow = row + direction * 2;
        if (row === startRow && !board[at(twoRow, col)]) add(at(twoRow, col), { doublePawn: true });
      }
      [-1, 1].forEach(function (dc) {
        var captureRow = row + direction;
        var captureCol = col + dc;
        if (!onBoard(captureRow, captureCol)) return;
        var to = at(captureRow, captureCol);
        if (board[to] && colorOf(board[to]) !== color) addPawn(to, { capture: true });
        else if (state.enPassant === to) addPawn(to, { capture: true, enPassant: true });
      });
      return moves;
    }

    if (type === "n") {
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(function (step) {
        if (onBoard(row + step[0], col + step[1])) add(at(row + step[0], col + step[1]));
      });
      return moves;
    }

    function slides(directions) {
      directions.forEach(function (direction) {
        var rr = row + direction[0];
        var cc = col + direction[1];
        while (onBoard(rr, cc)) {
          var to = at(rr, cc);
          if (!board[to]) add(to);
          else {
            if (colorOf(board[to]) !== color) add(to, { capture: true });
            break;
          }
          rr += direction[0];
          cc += direction[1];
        }
      });
    }

    if (type === "b") { slides([[-1,-1],[-1,1],[1,-1],[1,1]]); return moves; }
    if (type === "r") { slides([[-1,0],[1,0],[0,-1],[0,1]]); return moves; }
    if (type === "q") { slides([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]); return moves; }

    if (type === "k") {
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          if ((dr || dc) && onBoard(row + dr, col + dc)) add(at(row + dr, col + dc));
        }
      }
      var enemy = opponent(color);
      if (color === "w" && from === 60 && !inCheck(state, color)) {
        if (state.castling.indexOf("K") !== -1 && board[63] === "R" && !board[61] && !board[62] && !isSquareAttacked(state,61,enemy) && !isSquareAttacked(state,62,enemy)) add(62,{ castle:"K" });
        if (state.castling.indexOf("Q") !== -1 && board[56] === "R" && !board[59] && !board[58] && !board[57] && !isSquareAttacked(state,59,enemy) && !isSquareAttacked(state,58,enemy)) add(58,{ castle:"Q" });
      }
      if (color === "b" && from === 4 && !inCheck(state, color)) {
        if (state.castling.indexOf("k") !== -1 && board[7] === "r" && !board[5] && !board[6] && !isSquareAttacked(state,5,enemy) && !isSquareAttacked(state,6,enemy)) add(6,{ castle:"K" });
        if (state.castling.indexOf("q") !== -1 && board[0] === "r" && !board[3] && !board[2] && !board[1] && !isSquareAttacked(state,3,enemy) && !isSquareAttacked(state,2,enemy)) add(2,{ castle:"Q" });
      }
    }
    return moves;
  }

  function removeRights(rights, letters) {
    var next = String(rights || "");
    String(letters || "").split("").forEach(function (letter) { next = next.replace(letter, ""); });
    return next;
  }

  function applyMove(state, move, options) {
    var opts = options || {};
    var next = copyCore(state);
    var board = next.board;
    var piece = board[move.from];
    var color = colorOf(piece);
    var type = typeOf(piece);
    var captured = board[move.to];
    board[move.from] = null;

    if (move.enPassant) {
      var capturedSquare = move.to + (color === "w" ? 8 : -8);
      captured = board[capturedSquare];
      board[capturedSquare] = null;
    }

    var placed = piece;
    if (move.promotion) placed = color === "w" ? String(move.promotion).toUpperCase() : String(move.promotion).toLowerCase();
    board[move.to] = placed;

    if (move.castle) {
      if (color === "w" && move.to === 62) { board[63] = null; board[61] = "R"; }
      else if (color === "w" && move.to === 58) { board[56] = null; board[59] = "R"; }
      else if (color === "b" && move.to === 6) { board[7] = null; board[5] = "r"; }
      else if (color === "b" && move.to === 2) { board[0] = null; board[3] = "r"; }
    }

    if (piece === "K") next.castling = removeRights(next.castling, "KQ");
    if (piece === "k") next.castling = removeRights(next.castling, "kq");
    if (move.from === 63 || move.to === 63) next.castling = removeRights(next.castling, "K");
    if (move.from === 56 || move.to === 56) next.castling = removeRights(next.castling, "Q");
    if (move.from === 7 || move.to === 7) next.castling = removeRights(next.castling, "k");
    if (move.from === 0 || move.to === 0) next.castling = removeRights(next.castling, "q");

    next.enPassant = null;
    if (type === "p" && Math.abs(move.to - move.from) === 16) next.enPassant = (move.to + move.from) / 2;
    next.halfmove = (type === "p" || captured) ? 0 : next.halfmove + 1;
    if (color === "b") next.fullmove += 1;
    next.turn = opponent(color);
    if (!opts.skipPositions) next.positions.push(positionKey(next));
    return next;
  }

  function legalMoves(state, color) {
    var side = color || state.turn;
    var moves = [];
    for (var from = 0; from < 64; from++) {
      if (colorOf(state.board[from]) !== side) continue;
      pseudoMoves(state, from).forEach(function (move) {
        var next = applyMove(state, move, { skipPositions: true });
        if (!inCheck(next, side)) moves.push(move);
      });
    }
    return moves;
  }

  function findMove(state, from, to, promotion) {
    var fromIndex = typeof from === "string" ? parseSquare(from) : Number(from);
    var toIndex = typeof to === "string" ? parseSquare(to) : Number(to);
    var candidates = legalMoves(state, state.turn).filter(function (move) { return move.from === fromIndex && move.to === toIndex; });
    if (!candidates.length) return null;
    if (promotion) {
      for (var i = 0; i < candidates.length; i++) if (candidates[i].promotion === String(promotion).toLowerCase()) return candidates[i];
    }
    for (var j = 0; j < candidates.length; j++) if (candidates[j].promotion === "q") return candidates[j];
    return candidates[0];
  }

  function insufficientMaterial(state) {
    var pieces = [];
    for (var i = 0; i < 64; i++) {
      var type = typeOf(state.board[i]);
      if (type && type !== "k") pieces.push({ type: type, square: i, color: colorOf(state.board[i]) });
    }
    if (!pieces.length) return true;
    if (pieces.length === 1 && (pieces[0].type === "b" || pieces[0].type === "n")) return true;
    if (pieces.length === 2 && pieces[0].type === "b" && pieces[1].type === "b" && pieces[0].color !== pieces[1].color) {
      return ((rowOf(pieces[0].square) + colOf(pieces[0].square)) % 2) === ((rowOf(pieces[1].square) + colOf(pieces[1].square)) % 2);
    }
    return false;
  }

  function gameStatus(state) {
    var moves = legalMoves(state, state.turn);
    var checked = inCheck(state, state.turn);
    if (!moves.length) {
      if (checked) return { over: true, kind: "checkmate", winner: opponent(state.turn), checked: true, moves: moves };
      return { over: true, kind: "stalemate", winner: "", checked: false, moves: moves };
    }
    if (state.halfmove >= 100) return { over: true, kind: "fifty-move", winner: "", checked: checked, moves: moves };
    var current = positionKey(state);
    var repeats = (state.positions || []).filter(function (key) { return key === current; }).length;
    if (repeats >= 3) return { over: true, kind: "threefold-repetition", winner: "", checked: checked, moves: moves };
    if (insufficientMaterial(state)) return { over: true, kind: "insufficient-material", winner: "", checked: checked, moves: moves };
    return { over: false, kind: checked ? "check" : "playing", winner: "", checked: checked, moves: moves };
  }

  function moveNotation(before, move, afterStatus) {
    if (move.castle) return move.castle === "K" ? "O-O" : "O-O-O";
    var piece = before.board[move.from];
    var type = typeOf(piece);
    var capture = !!before.board[move.to] || move.enPassant;
    var label = type === "p" ? "" : type.toUpperCase();
    var notation = label + squareName(move.from) + (capture ? "x" : "-") + squareName(move.to);
    if (move.promotion) notation += "=" + String(move.promotion).toUpperCase();
    if (afterStatus && afterStatus.kind === "checkmate") notation += "#";
    else if (afterStatus && afterStatus.checked) notation += "+";
    return notation;
  }

  function evaluate(state, perspective) {
    var score = 0;
    for (var i = 0; i < 64; i++) {
      var piece = state.board[i];
      if (!piece) continue;
      var color = colorOf(piece);
      var type = typeOf(piece);
      var value = VALUES[type] || 0;
      var row = rowOf(i);
      var col = colOf(i);
      var center = Math.max(0, 4 - (Math.abs(3.5 - row) + Math.abs(3.5 - col))) * (type === "p" ? 4 : 7);
      var advance = type === "p" ? (color === "w" ? 6 - row : row - 1) * 3 : 0;
      score += (color === perspective ? 1 : -1) * (value + center + advance);
    }
    return score;
  }

  function orderedMoves(state, moves) {
    return moves.slice().sort(function (a, b) {
      var aCapture = state.board[a.to] ? VALUES[typeOf(state.board[a.to])] || 0 : (a.enPassant ? 100 : 0);
      var bCapture = state.board[b.to] ? VALUES[typeOf(state.board[b.to])] || 0 : (b.enPassant ? 100 : 0);
      return bCapture - aCapture || Number(!!b.promotion) - Number(!!a.promotion);
    });
  }

  function minimax(state, depth, alpha, beta, perspective) {
    var status = gameStatus(state);
    if (status.over) {
      if (status.kind === "checkmate") return status.winner === perspective ? 100000 + depth : -100000 - depth;
      return 0;
    }
    if (depth <= 0) return evaluate(state, perspective);
    var moves = orderedMoves(state, status.moves);
    var maximizing = state.turn === perspective;
    var best = maximizing ? -Infinity : Infinity;
    for (var i = 0; i < moves.length; i++) {
      var next = applyMove(state, moves[i], { skipPositions: true });
      var value = minimax(next, depth - 1, alpha, beta, perspective);
      if (maximizing) {
        best = Math.max(best, value);
        alpha = Math.max(alpha, best);
      } else {
        best = Math.min(best, value);
        beta = Math.min(beta, best);
      }
      if (beta <= alpha) break;
    }
    return best;
  }

  function chooseAiMove(state, difficulty, random) {
    var status = gameStatus(state);
    if (status.over || !status.moves.length) return null;
    var depths = { casual: 1, club: 2, master: 3 };
    var depth = depths[String(difficulty || "club")] || 2;
    var perspective = state.turn;
    var bestValue = -Infinity;
    var best = [];
    var moves = orderedMoves(state, status.moves);
    for (var i = 0; i < moves.length; i++) {
      var next = applyMove(state, moves[i], { skipPositions: true });
      var value = minimax(next, depth - 1, -Infinity, Infinity, perspective);
      if (value > bestValue) { bestValue = value; best = [moves[i]]; }
      else if (value === bestValue) best.push(moves[i]);
    }
    var draw = typeof random === "function" ? Number(random()) : 0;
    var index = Math.min(best.length - 1, Math.max(0, Math.floor((isFinite(draw) ? draw : 0) * best.length)));
    return best[index] || best[0] || null;
  }

  function capturedPiece(state, move) {
    if (move.enPassant) return state.board[move.to + (colorOf(state.board[move.from]) === "w" ? 8 : -8)];
    return state.board[move.to];
  }

  function normalizedDifficulty(value) {
    var level = String(value || "club").toLowerCase();
    return ["casual","club","master"].indexOf(level) !== -1 ? level : "club";
  }

  function freshMatch(difficulty) {
    var state = createInitialState();
    state.phase = "player";
    state.selected = null;
    state.legalTargets = [];
    state.lastMove = null;
    state.hintMove = null;
    state.promotion = null;
    state.moveLog = [];
    state.capturedByWhite = [];
    state.capturedByBlack = [];
    state.message = "White to move. Select a piece to see its legal squares.";
    state.difficulty = normalizedDifficulty(difficulty);
    state.hints = 0;
    return state;
  }

  function ChessMatch(engine, ui, savedState, askedDifficulty) {
    var state = savedState && Array.isArray(savedState.board) && savedState.board.length === 64 ? savedState : freshMatch(askedDifficulty);
    state.difficulty = normalizedDifficulty(state.difficulty || askedDifficulty);
    state.positions = Array.isArray(state.positions) && state.positions.length ? state.positions : [positionKey(state)];
    state.moveLog = Array.isArray(state.moveLog) ? state.moveLog : [];
    state.capturedByWhite = Array.isArray(state.capturedByWhite) ? state.capturedByWhite : [];
    state.capturedByBlack = Array.isArray(state.capturedByBlack) ? state.capturedByBlack : [];
    state.phase = state.phase === "over" ? "over" : (state.turn === "b" ? "computer" : "player");
    state.selected = null;
    state.legalTargets = [];
    state.promotion = null;

    function checkpoint() { engine.checkpoint(state); }

    function statusMessage(status) {
      if (status.kind === "checkmate") return status.winner === "w" ? "Checkmate. White wins." : "Checkmate. Black wins.";
      if (status.kind === "stalemate") return "Stalemate. The position is drawn.";
      if (status.kind === "fifty-move") return "Draw by the fifty-move rule.";
      if (status.kind === "threefold-repetition") return "Draw by threefold repetition.";
      if (status.kind === "insufficient-material") return "Draw. Neither side has mating material.";
      if (status.checked) return (state.turn === "w" ? "White" : "Black") + " is in check.";
      return state.turn === "w" ? "Your move with White." : "The computer is calculating.";
    }

    function finishMatch(status) {
      var outcome = status.winner === "w" ? "win" : (status.winner === "b" ? "loss" : "draw");
      var points = outcome === "win" ? Math.max(600, 1200 - state.fullmove * 4 - state.hints * 25) : (outcome === "draw" ? Math.max(250, 450 - state.hints * 20) : 0);
      state.phase = "over";
      state.message = statusMessage(status);
      engine.score(points);
      checkpoint();
      render();
      ui.finish({
        outcome: outcome,
        score: points,
        meta: { boardPoints: points, competitionMode: "free", difficulty: state.difficulty, chessResult: status.kind, moves: state.moveLog.length },
        lines: [
          state.message,
          state.moveLog.length + " half-moves · " + state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1) + " computer",
          state.hints ? state.hints + " position hint" + (state.hints === 1 ? "" : "s") + " used" : "No hints used"
        ],
        actions: [
          { label: "New match", primary: true, onClick: function () { restart(state.difficulty); } },
          { label: "Club room", onClick: function () { global.location.href = "index.html"; } },
          { label: "Leaderboard", onClick: function () { global.location.href = "index.html#leaderboard"; } }
        ]
      });
    }

    function commit(move, actor) {
      if (!move || state.phase === "over") return;
      var before = copyCore(state);
      var captured = capturedPiece(state, move);
      var next = applyMove(state, move);
      var status = gameStatus(next);
      var notation = moveNotation(before, move, status);

      state.board = next.board;
      state.turn = next.turn;
      state.castling = next.castling;
      state.enPassant = next.enPassant;
      state.halfmove = next.halfmove;
      state.fullmove = next.fullmove;
      state.positions = next.positions;
      state.lastMove = { from: move.from, to: move.to };
      state.hintMove = null;
      state.selected = null;
      state.legalTargets = [];
      state.promotion = null;
      state.moveLog.push(notation);
      if (captured) {
        if (actor === "player") state.capturedByWhite.push(captured);
        else state.capturedByBlack.push(captured);
      }
      engine.action("chess-move", actor + " " + notation);

      if (status.over) {
        checkpoint();
        finishMatch(status);
        return;
      }

      state.phase = state.turn === "b" ? "computer" : "player";
      state.message = statusMessage(status);
      checkpoint();
      render();
      if (state.phase === "computer") scheduleComputer();
    }

    function selectSquare(index) {
      if (state.phase !== "player" || state.turn !== "w" || state.promotion) return;
      var piece = state.board[index];
      var all = legalMoves(state, "w");
      if (state.selected != null) {
        var candidates = all.filter(function (move) { return move.from === state.selected && move.to === index; });
        if (candidates.length) {
          if (candidates.some(function (move) { return !!move.promotion; })) {
            state.promotion = { from: state.selected, to: index };
            state.message = "Choose the piece for promotion.";
            checkpoint();
            render();
            return;
          }
          commit(candidates[0], "player");
          return;
        }
      }
      if (piece && colorOf(piece) === "w") {
        state.selected = index;
        state.hintMove = null;
        state.legalTargets = all.filter(function (move) { return move.from === index; }).map(function (move) { return move.to; });
        state.message = PIECE_NAMES[typeOf(piece)].charAt(0).toUpperCase() + PIECE_NAMES[typeOf(piece)].slice(1) + " on " + squareName(index) + ". Choose a highlighted square.";
      } else {
        state.selected = null;
        state.legalTargets = [];
        state.message = "Select one of your White pieces.";
      }
      checkpoint();
      render();
    }

    function promote(piece) {
      if (!state.promotion) return;
      var move = findMove(state, state.promotion.from, state.promotion.to, piece);
      if (move) commit(move, "player");
    }

    function scheduleComputer() {
      if (aiTimer) global.clearTimeout(aiTimer);
      aiTimer = global.setTimeout(function () {
        if (state.phase !== "computer" || state.turn !== "b") return;
        var move = chooseAiMove(state, state.difficulty, function () { return engine.next(); });
        if (!move) {
          var status = gameStatus(state);
          if (status.over) finishMatch(status);
          return;
        }
        commit(move, "computer");
      }, 360);
    }

    function hint() {
      if (state.phase !== "player" || state.turn !== "w") return;
      var move = chooseAiMove(state, "casual", function () { return engine.next(); });
      if (!move) return;
      state.hintMove = { from: move.from, to: move.to };
      state.hints = (Number(state.hints) || 0) + 1;
      state.message = "Position hint: consider " + moveNotation(state, move, null) + ". The move is not played for you.";
      engine.action("chess-hint", squareName(move.from) + " " + squareName(move.to));
      checkpoint();
      render();
    }

    function requestRestart(level) {
      var target = normalizedDifficulty(level || state.difficulty);
      ui.showPanel({
        title: "Start a fresh " + target + " match?",
        body: "This unfinished board will be replaced. No coins are involved.",
        actions: [
          { label: "Start new match", primary: true, onClick: function () { restart(target); } },
          { label: "Keep this board" }
        ]
      });
    }

    function render() {
      var stage = doc.getElementById("game-stage");
      if (!stage) return;
      var status = gameStatus(state);
      var checkedKing = status.checked ? kingSquare(state, state.turn) : -1;
      var targets = {};
      (state.legalTargets || []).forEach(function (to) { targets[to] = true; });
      var boardHTML = "";

      for (var i = 0; i < 64; i++) {
        var row = rowOf(i);
        var col = colOf(i);
        var piece = state.board[i];
        var classes = ["chess-square", (row + col) % 2 ? "dark" : "light"];
        if (state.selected === i) classes.push("selected");
        if (state.lastMove && (state.lastMove.from === i || state.lastMove.to === i)) classes.push("last");
        if (state.hintMove && (state.hintMove.from === i || state.hintMove.to === i)) classes.push("hint");
        if (targets[i]) classes.push("legal");
        if (targets[i] && (piece || (state.enPassant === i && state.board[state.selected] && typeOf(state.board[state.selected]) === "p"))) classes.push("capture");
        if (checkedKing === i) classes.push("in-check");
        var label = squareName(i) + (piece ? ", " + (colorOf(piece) === "w" ? "White " : "Black ") + PIECE_NAMES[typeOf(piece)] : ", empty");
        boardHTML += '<button type="button" class="' + classes.join(" ") + '" data-square="' + i + '" aria-label="' + esc(label) + '">' +
          (piece ? '<span class="chess-piece ' + (colorOf(piece) === "w" ? "white" : "black") + '">' + PIECE_SYMBOLS[piece] + "</span>" : "") +
          (row === 7 ? '<span class="chess-coordinate file">' + FILES[col] + "</span>" : "") +
          (col === 0 ? '<span class="chess-coordinate rank">' + (8 - row) + "</span>" : "") +
        "</button>";
      }

      var moveRows = "";
      for (var m = 0; m < state.moveLog.length; m += 2) {
        moveRows += '<div class="chess-move-row"><span>' + (Math.floor(m / 2) + 1) + '.</span><span>' + esc(state.moveLog[m] || "") + '</span><span>' + esc(state.moveLog[m + 1] || "") + "</span></div>";
      }
      if (!moveRows) moveRows = '<div class="chess-ledger-empty">The signed move ledger begins after White’s first move.</div>';
      var capturedWhite = state.capturedByWhite.map(function (piece) { return PIECE_SYMBOLS[piece] || ""; }).join("") || "—";
      var capturedBlack = state.capturedByBlack.map(function (piece) { return PIECE_SYMBOLS[piece] || ""; }).join("") || "—";
      var title = state.phase === "computer" ? "Computer thinking" : (status.checked ? "King in check" : (state.phase === "over" ? "Match complete" : "Your move"));
      var thinking = state.phase === "computer" ? '<span class="chess-thinking" aria-label="thinking"><i></i><i></i><i></i></span>' : "";

      ui.setStat("turn", state.turn === "w" ? "White" : "Black");
      ui.setStat("level", state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1));
      ui.setStat("moves", state.moveLog.length);
      ui.setStat("state", status.checked ? "Check" : (state.phase === "computer" ? "Thinking" : "Live"));
      ui.setMeta("Untimed full-rule chess · you have White · free performance only · no coins move.");

      stage.innerHTML = '<div class="chess-layout">' +
        '<div class="chess-board-wrap"><div class="chess-board" role="grid" aria-label="Chess board, White at the bottom">' + boardHTML + "</div>" +
          (state.promotion ? '<div class="chess-promotion-backdrop"><div class="chess-promotion-card" role="dialog" aria-modal="true"><small>Pawn promotion</small><h3>Choose the new piece</h3><div class="chess-promotion-options">' +
            ["q","r","b","n"].map(function (piece) { return '<button type="button" data-promote="' + piece + '" aria-label="Promote to ' + PIECE_NAMES[piece] + '">' + PIECE_SYMBOLS[piece.toUpperCase()] + "</button>"; }).join("") +
          "</div></div></div>" : "") +
        "</div>" +
        '<aside class="chess-side">' +
          '<div class="chess-player computer' + (state.turn === "b" ? " active" : "") + '"><span class="chess-player-mark">♚</span><span class="chess-player-info"><strong>Paragon Computer</strong><small>' + state.difficulty + ' strength · Black</small></span><i class="chess-turn-dot"></i></div>' +
          '<div class="chess-status"><small>Board status</small><h2>' + title + thinking + '</h2><p>' + esc(state.message) + "</p></div>" +
          '<div class="chess-captured"><small>White has captured</small><span>' + capturedWhite + "</span></div>" +
          '<div class="chess-controls"><button type="button" class="chess-control primary" data-chess="hint"' + (state.phase !== "player" ? " disabled" : "") + '>Position hint</button><button type="button" class="chess-control" data-chess="new">New match</button></div>' +
          '<div class="chess-strengths" aria-label="Computer strength">' + ["casual","club","master"].map(function (level) { return '<button type="button" data-level="' + level + '" class="' + (state.difficulty === level ? "active" : "") + '">' + level + "</button>"; }).join("") + "</div>" +
          '<div class="chess-ledger"><div class="chess-ledger-title">Move ledger · White / Black</div>' + moveRows + "</div>" +
          '<div class="chess-player you' + (state.turn === "w" ? " active" : "") + '"><span class="chess-player-mark">♔</span><span class="chess-player-info"><strong>You</strong><small>Free player · White</small></span><i class="chess-turn-dot"></i></div>' +
          '<div class="chess-captured"><small>Black has captured</small><span>' + capturedBlack + "</span></div>" +
        "</aside></div>";

      stage.querySelectorAll("[data-square]").forEach(function (button) {
        button.addEventListener("click", function () { selectSquare(Number(button.getAttribute("data-square"))); });
      });
      stage.querySelectorAll("[data-promote]").forEach(function (button) {
        button.addEventListener("click", function () { promote(button.getAttribute("data-promote")); });
      });
      var hintButton = stage.querySelector('[data-chess="hint"]');
      if (hintButton) hintButton.addEventListener("click", hint);
      var newButton = stage.querySelector('[data-chess="new"]');
      if (newButton) newButton.addEventListener("click", function () { requestRestart(state.difficulty); });
      stage.querySelectorAll("[data-level]").forEach(function (button) {
        button.addEventListener("click", function () {
          var level = button.getAttribute("data-level");
          if (level !== state.difficulty) requestRestart(level);
        });
      });
    }

    checkpoint();
    render();
    if (state.phase === "computer") scheduleComputer();
    return { state: function () { return state; }, render: render };
  }

  function askedLevel() {
    try { return normalizedDifficulty(new URLSearchParams(global.location.search || "").get("level")); }
    catch (error) { return "club"; }
  }

  function restart(level) {
    try { games.clearResume("chess", "computer", "free"); } catch (error) { /* noop */ }
    global.location.href = "play.html?level=" + encodeURIComponent(normalizedDifficulty(level));
  }

  function boot() {
    if (!doc || !doc.getElementById("game-stage") || !games || !kit) return;
    var level = askedLevel();
    doc.title = "Paragon Chess — " + level.charAt(0).toUpperCase() + level.slice(1) + " match";
    kit.mount({
      hud: "#game-hud",
      gameKey: "chess",
      variant: "computer",
      stats: [
        { id: "turn", label: "Turn" },
        { id: "level", label: "Strength" },
        { id: "moves", label: "Half-moves" },
        { id: "state", label: "Position" }
      ],
      onStart: function (engine, savedState, resumed, shell) { ChessMatch(engine, shell, savedState, level); },
      onQuit: function () { global.location.href = "index.html"; }
    });
  }

  global.ParagonChess = {
    FILES: FILES,
    PIECE_SYMBOLS: PIECE_SYMBOLS,
    initialBoard: initialBoard,
    createInitialState: createInitialState,
    positionKey: positionKey,
    squareName: squareName,
    parseSquare: parseSquare,
    colorOf: colorOf,
    typeOf: typeOf,
    isSquareAttacked: isSquareAttacked,
    inCheck: inCheck,
    pseudoMoves: pseudoMoves,
    legalMoves: legalMoves,
    findMove: findMove,
    applyMove: applyMove,
    gameStatus: gameStatus,
    insufficientMaterial: insufficientMaterial,
    moveNotation: moveNotation,
    evaluate: evaluate,
    chooseAiMove: chooseAiMove,
    normalizedDifficulty: normalizedDifficulty,
    freshMatch: freshMatch
  };

  if (doc && doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
