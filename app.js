"use strict";

const GameBoard = (() => {
  const data = ["", "", "", "", "", "", "", "", ""];

  const setItem = function (index, value) {
    this.data[index] = value;
  };

  const getItem = (index) => this.data[index];

  const getLength = () => data.length;

  return {
    data,
    setItem,
    getItem,
    getLength,
  };
})();

const Player = (name, simbol) => {
  const getBestMove = (board, playerMax, playerMin) => {
    const _minimax = (board, currentPlayer) => {
      const gameEnded = GameController.checkWin(board);
      if (gameEnded) {
        if (gameEnded === playerMax) {
          return { bestScore: 1 };
        } else if (gameEnded === playerMin) {
          return { bestScore: -1 };
        }
        return { bestScore: 0 };
      }

      let bestScore = currentPlayer === playerMax ? -Infinity : Infinity;
      let bestMove = null;

      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = currentPlayer;
          const { bestScore: score } = _minimax(
            board,
            currentPlayer === playerMax ? playerMin : playerMax
          );
          if (
            (currentPlayer === playerMax && score > bestScore) ||
            (currentPlayer === playerMin && score < bestScore)
          ) {
            bestScore = score;
            bestMove = i;
          }

          board[i] = "";
        }
      }
      return { bestScore, bestMove };
    };

    return _minimax(board, playerMax).bestMove;
  };

  const markCell = function (callback) {
    if (this.textContent !== "") {
      console.error("already taken");
      return;
    }
    callback(this.getAttribute("data-idx"), simbol);
  };

  return { name, simbol, markCell, getBestMove };
};

const DisplayController = (() => {
  const _getNthCell = (index) => {
    const cell = document.getElementsByClassName("cell")[index];
    return cell;
  };

  const render = (array) => {
    array.forEach((value, index) => {
      setCellContent(index, value);
    });
  };

  const showWinner = (winner) => {
    const winnerElement = document.getElementById("winner");
    winnerElement.textContent =
      typeof winner === "string" ? `The winner is ${winner}` : "Draw";
  };

  const showModal = () => {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
  };

  const closeModal = () => {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
  };

  const setCellContent = (index, value) => {
    const cell = _getNthCell(index);
    cell.textContent = value;
  };

  return {
    setCellContent,
    render,
    showWinner,
    showModal,
    closeModal,
  };
})();

const GameController = (() => {
  const PLAYER_ONE = "◯";
  const PLAYER_TWO = "✖";
  let currentPlayer = PLAYER_ONE;
  const players = [
    Player("player 1", PLAYER_ONE),
    Player("player 2", PLAYER_TWO),
  ];

  const checkWin = (board) => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] !== "" && board[a] === board[b] && board[b] === board[c]) {
        return board[a];
      }
    }
    return !board.includes("");
  };

  const _addListener = function () {
    document.getElementById("pvp-btn").addEventListener("click", function () {
      _addBoardListener();
      DisplayController.closeModal();
    });

    document.getElementById("pvai-btn").addEventListener("click", function () {
      players[1].name = "AI";
      _addBoardListener();
      DisplayController.closeModal();
    });

    document
      .getElementById("restart-btn")
      .addEventListener("click", () => location.reload());
  };

  const _addBoardListener = () => {
    console.log("player", players);
    [...document.getElementsByClassName("cell")].forEach((cell) => {
      cell.addEventListener("click", function () {
        if (checkWin(GameBoard.data) || this.textContent !== "") {
          return;
        }

        if (currentPlayer === PLAYER_ONE) {
          players[0].markCell.call(this, GameBoard.setItem.bind(GameBoard));
          currentPlayer = PLAYER_TWO;
          if (players[1].name === "AI") {
            const bestmove = players[1].getBestMove(
              GameBoard.data,
              PLAYER_TWO,
              PLAYER_ONE
            );
            GameBoard.setItem(bestmove, players[1].simbol);
            currentPlayer = PLAYER_ONE;
          }
        } else {
          players[1].markCell.call(this, GameBoard.setItem.bind(GameBoard));
          currentPlayer = PLAYER_ONE;
        }
        const winner = checkWin(GameBoard.data);
        if (winner) {
          DisplayController.showWinner(winner);
        }
        DisplayController.render(GameBoard.data);
      });
    });
  };

  _addListener();

  return {
    checkWin,
  };
})();

DisplayController.showModal();
