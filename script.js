
const board = document.getElementById("board");
const piece1 = document.getElementById("piece1");
const piece2 = document.getElementById("piece2");
const turnText = document.getElementById("turn");
const resultText = document.getElementById("result");
const positionsText = document.getElementById("positions");
const rollButton = document.getElementById("roll");

// STARTからGOALまでの10マスの位置。
// 画像に合わせて、あとで位置を調整できます。
const squares = [
  { x: 10, y: 90 }, // START
  { x: 22, y: 90 },
  { x: 34, y: 90 },
  { x: 46, y: 86 },
  { x: 58, y: 82 },
  { x: 48, y: 68 },
  { x: 35, y: 60 },
  { x: 22, y: 54 },
  { x: 35, y: 40 },
  { x: 68, y: 25 }  // GOAL
];

const positions = [0, 0];
const pieces = [piece1, piece2];
let currentPlayer = 0;
let gameFinished = false;

function movePiece(player) {
  const square = squares[positions[player]];
  pieces[player].style.left = square.x + "%";
  pieces[player].style.top = square.y + "%";
}

function updateDisplay() {
  positionsText.innerHTML =
    "🔴 プレイヤー1：" + positions[0] + "マス<br>" +
    "🔵 プレイヤー2：" + positions[1] + "マス";
}

function rollDice() {
  if (gameFinished) return;

  const dice = Math.floor(Math.random() * 6) + 1;
  const playerName = "プレイヤー" + (currentPlayer + 1);

  positions[currentPlayer] = Math.min(
    positions[currentPlayer] + dice,
    squares.length - 1
  );

  movePiece(currentPlayer);
  updateDisplay();

  resultText.textContent =
    playerName + "は " + dice + " が出ました！";

  if (positions[currentPlayer] === squares.length - 1) {
    resultText.textContent = playerName + "のゴールです！🎉";
    turnText.textContent = "ゲーム終了！";
    rollButton.disabled = true;
    gameFinished = true;
    return;
  }

  currentPlayer = 1 - currentPlayer;
  turnText.textContent =
    "プレイヤー" + (currentPlayer + 1) + "の番です";
}

rollButton.addEventListener("click", rollDice);

// 最初は両方のコマをSTARTに置く
movePiece(0);
movePiece(1);
updateDisplay();
// Difyのすごろくアシスタントに質問する
async function askDify(question) {
  resultText.textContent = "🤖 Difyに相談中...";

  try {
    const response = await fetch(
      "https://divine-unit-f335.e2658218.workers.dev",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query:
            "あなたは2人用すごろくのアシスタントです。\n" +
            "プレイヤー1の位置：" + positions[0] + "マス\n" +
            "プレイヤー2の位置：" + positions[1] + "マス\n" +
            "現在のプレイヤー：" + (currentPlayer + 1) + "\n" +
            "質問：" + question
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error("通信エラー：" + response.status);
    }

    resultText.textContent =
      data.answer || "Difyから回答を取得できませんでした。";
  } catch (error) {
    resultText.textContent =
      "Difyとの接続に失敗しました。設定を確認してください。";
    console.error(error);
  }
}
// 質問ボタンとDifyを接続する
const askButton = document.getElementById("ask-dify");
const questionInput = document.getElementById("dify-question");
const answerText = document.getElementById("dify-answer");

askButton.addEventListener("click", async function () {
  const question = questionInput.value.trim();

  if (question === "") {
    answerText.textContent = "質問を入力してください。";
    return;
  }

  answerText.textContent = "🤖 Difyに質問しています...";

  await askDify(question);

  answerText.textContent = resultText.textContent;
});
