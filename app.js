document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  let squares = Array.from(document.querySelectorAll(".grid div"));
  const scoreDisplay = document.querySelector("#score");
  const levelDisplay = document.querySelector("#level");
  const startBtn = document.querySelector("#start-button");
  const lvlClasses = [
    "grid",
    "gridLvl2",
    "gridLvl3",
    "gridLvl4",
    "gridLvl5",
    "gridLvl6",
    "gridLvl7",
    "gridLvl8"
  ];
  const width = 10;
  let nextRandom = 0;
  let timerId;
  let score = 0;
  let speed = 1000;
  let gameEnd = false;
  const sound = document.getElementById("sound");
  const bgm = document.getElementById("bgm");

  //tetrominos
  const lTetromino = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2]
  ];
  const jTetromino = [
    [1, width + 1, width * 2 + 1, 0],
    [width, width + 1, width + 2, 2],
    [1, width + 1, width * 2 + 1, width * 2 + 2],
    [width, width + 1, width + 2, width * 2]
  ];
  const sTetromino = [
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1]
  ];
  const zTetromino = [
    [width, width + 1, width * 2 + 1, width * 2 + 2],
    [1, width, width + 1, width * 2],
    [width, width + 1, width * 2 + 1, width * 2 + 2],
    [1, width, width + 1, width * 2]
  ];
  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1]
  ];
  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1]
  ];
  const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3]
  ];

  const theTetrominoes = [
    lTetromino,
    jTetromino,
    sTetromino,
    zTetromino,
    tTetromino,
    oTetromino,
    iTetromino
  ];

  let currentPosition = 4;

  //randomly select a tetromino and its first position
  let randomShape = Math.floor(Math.random() * theTetrominoes.length);
  let currentRotation = Math.floor(
    Math.random() * theTetrominoes[randomShape].length
  );
  let current = theTetrominoes[randomShape][currentRotation];

  //draw the tetromino
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add("tetromino");
    });
  }

  //undraw tetromino
  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove("tetromino");
    });
  }

  //make tetromino move down every second
  //timerId = setInterval(moveDown, 1000);

  //assign functions to keyCodes
  function control(e) {
    if (!gameEnd) {
      if (e.keyCode === 37) {
        moveLeft();
      } else if (e.keyCode === 38) {
        rotate();
      } else if (e.keyCode === 39) {
        moveRight();
      } else if (e.keyCode === 40) {
        moveDown();
      }
    }
  }
  document.addEventListener("keydown", control);

  //move down function
  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  //freeze function
  function freeze() {
    if (
      current.some(index =>
        squares[currentPosition + index + width].classList.contains("taken")
      )
    ) {
      current.forEach(index =>
        squares[currentPosition + index].classList.add("taken")
      );
      //start new tetromino falling
      randomShape = nextRandom;
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      // randomShape = Math.floor(Math.random() * theTetrominoes.length);
      currentRotation = Math.floor(
        Math.random() * theTetrominoes[randomShape].length
      );
      current = theTetrominoes[randomShape][currentRotation];
      currentPosition = 4;
      addScore();
      draw();
      drawDisplay();
      gameOver();
    }
  }

  //move left, unless at the edge or blockage
  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(
      index => (currentPosition + index) % width === 0
    );

    if (!isAtLeftEdge) currentPosition -= 1;

    if (
      current.some(index =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentPosition += 1;
    }
    draw();
  }

  const moveRight = () => {
    undraw();
    const isAtRightEdge = current.some(
      index => (currentPosition + index) % width === width - 1
    );

    if (!isAtRightEdge) currentPosition += 1;

    if (
      current.some(index =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentPosition -= 1;
    }
    draw();
  };

  //FIX ROTATION OF TETROMINOS A THE EDGE
  function isAtRight() {
    return current.some(index => (currentPosition + index + 1) % width === 0);
  }

  function isAtLeft() {
    return current.some(index => (currentPosition + index) % width === 0);
  }

  function checkRotatedPosition(P) {
    P = P || currentPosition; //get current position.  Then, check if the piece is near the left side.
    if ((P + 1) % width < 4) {
      //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).
      if (isAtRight()) {
        //use actual position to check if it's flipped over to right side
        currentPosition += 1; //if so, add one to wrap it back around
        checkRotatedPosition(P); //check again.  Pass position from start, since long block might need to move more.
      }
    } else if (P % width > 5) {
      if (isAtLeft()) {
        currentPosition -= 1;
        checkRotatedPosition(P);
      }
    }
  }

  const rotate = () => {
    undraw();
    currentRotation++;
    if (currentRotation === current.length) {
      currentRotation = 0;
    }
    current = theTetrominoes[randomShape][currentRotation];
    checkRotatedPosition();
    draw();
  };

  const displaySquares = document.querySelectorAll(".mini-grid div");
  const displayWidth = 8;
  let displayIndex = 0;

  //tetrominoes without rotations
  const upNextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], //lTetromino
    [1, displayWidth + 1, displayWidth * 2 + 1, 0], //jTetromino
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //sTetromino
    [
      displayWidth,
      displayWidth + 1,
      displayWidth * 2 + 1,
      displayWidth * 2 + 2
    ], //zTetromino
    [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
    [0, 1, displayWidth, displayWidth + 1], //oTetromino
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] //iTetromino
  ];

  //display next tetromino in mini grid
  //draw the tetromino
  function drawDisplay() {
    //clear grid
    displaySquares.forEach(square => {
      square.classList.remove("tetromino");
    });
    upNextTetrominoes[nextRandom].forEach(index => {
      displaySquares[displayWidth * 2 + 3 + index].classList.add("tetromino");
    });
  }

  //start/pause button funcionality
  startBtn.addEventListener("click", () => {
    if (!gameEnd) {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
        bgm.pause();
      } else {
        draw();
        timerId = setInterval(moveDown, speed);
        nextRandom = Math.floor(Math.random() * theTetrominoes.length);
        drawDisplay();
        bgm.play();
      }
    } else {
      location.reload();
    }
  });

  const levelUp = level => {
    if (level > levelDisplay.innerHTML) {
      //so the speed doesn't accellerate when rows cleared simultaneously
      speed -= 100;
      console.log(speed);

      levelDisplay.innerHTML = level;
      squares.forEach((square, i) => {
        if (!squares[i].classList.contains("taken")) {
          squares[i].removeAttribute("class");
          squares[i].classList.remove(...lvlClasses);
          squares[i].classList.add("gridLvl" + level);
        }
      });
      clearInterval(timerId);
      timerId = setInterval(moveDown, speed);
    }
  };

  //add score
  const addScore = () => {
    for (let i = 0; i < 199; i += width) {
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 8,
        i + 9
      ];

      if (row.every(index => squares[index].classList.contains("taken"))) {
        let soundFlag = true;
        score += 10;
        scoreDisplay.innerHTML = score;
        row.forEach(index => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino");
        });
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach(cell => grid.appendChild(cell));
        //play sound
        if (soundFlag) {
          sound.pause();
          sound.currentTime = 0;
          sound.play();
          soundFlag = false;
        }
        if (score > 19 && score < 40) {
          levelUp(2);
        } else if (score > 39 && score < 51) {
          levelUp(3);
        } else if (score > 59 && score < 71) {
          levelUp(4);
        } else if (score > 79 && score < 91) {
          levelUp(5);
        } else if (score > 99 && score < 111) {
          levelUp(6);
        } else if (score > 119 && score < 131) {
          levelUp(7);
        } else if (score > 139 && score < 151) {
          levelUp(8);
        } else if (score > 159 && score < 171) {
          levelUp(9);
        }
      }
    }
  };

  //game over
  const gameOver = () => {
    //check if any part of the piece (current array) (its position in the grid(squares))
    // is occupied by another piece ('taken' class)
    //if so, stop timerId, update scoreDisplay
    if (
      current.some(index =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      clearInterval(timerId);
      const end = document.createElement("h1");
      end.innerHTML = "GAME OVER";
      scoreDisplay.appendChild(end);
      gameEnd = true;
      bgm.pause();
    }
  };
});
