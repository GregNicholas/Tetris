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
  let timerId;
  let level = 1;
  let score = 0;
  let speed = 1000;
  let holdCurrent = false;
  let pieceCount = 0;
  let gameEnd = false;
  //const colors = ["orange", "red", "pink", "green", "blue", "lime", "cyan"];
  const sound = document.getElementById("sound");
  const bitQuest = document.getElementById("bitQuest");
  const classicT = document.getElementById("classicT");
  const piano = document.getElementById("piano");

  sound.volume = 0.2;
  classicT.volume = 0.2;
  bitQuest.volume = 0.2;
  piano.volume = 0.2;

  const levelMusic = {
    1: classicT,
    2: classicT,
    3: bitQuest,
    4: bitQuest,
    5: piano,
    6: piano,
    7: classicT,
    8: classicT,
    9: classicT,
    10: classicT
  };
  for (let song in levelMusic) {
    levelMusic[song].loop = true;
  }

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

  const theTetrominoes = {
    lTetromino: lTetromino,
    jTetromino: jTetromino,
    sTetromino: sTetromino,
    zTetromino: zTetromino,
    tTetromino: tTetromino,
    oTetromino: oTetromino,
    iTetromino: iTetromino
  };

  // const theTetrominoes = [
  //   lTetromino,
  //   jTetromino,
  //   sTetromino,
  //   zTetromino,
  //   tTetromino,
  //   oTetromino,
  //   iTetromino
  // ];

  let currentPosition = 4;

  //randomly select a tetromino and its first position
  const keys = Object.keys(theTetrominoes);
  let randomShape = keys[(keys.length * Math.random()) << 0];
  let onDeck = keys[(keys.length * Math.random()) << 0];
  let inTheHole = keys[(keys.length * Math.random()) << 0];
  let nextRandom = keys[(keys.length * Math.random()) << 0];
  let heldShape;
  //let randomShape = Math.floor(Math.random() * theTetrominoes.length);
  console.log(randomShape, theTetrominoes[randomShape]);
  let currentRotation = Math.floor(
    Math.random() * theTetrominoes[randomShape].length
  );
  let current = theTetrominoes[randomShape][currentRotation];

  //draw the tetromino
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add(randomShape);
    });
  }

  //undraw tetromino
  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove(
        "lTetromino",
        "jTetromino",
        "sTetromino",
        "zTetromino",
        "tTetromino",
        "oTetromino",
        "iTetromino"
      );
    });
  }

  //make tetromino move down every second
  //timerId = setInterval(moveDown, 1000);

  //assign functions to keyCodes
  function control(e) {
    if (!gameEnd) {
      if (timerId) {
        if (e.keyCode === 37) {
          if (timerId) { moveLeft(); }
        } else if (e.keyCode === 38) {
          rotate();
        } else if (e.keyCode === 39) {
          moveRight();
        } else if (e.keyCode === 40) {
          moveDown();
        } else if (e.keyCode === 16) {
          holdPiece();
        } else if (e.keyCode === 13) {
          swapHold();
        } else if (e.keyCode === 32) {
          quickDrop();
        }
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

  function quickDrop() {
    let cur = pieceCount;
    while (cur === pieceCount) {
      moveDown();
    }
  }

  function holdPiece() {
    holdCurrent = true;
    if (heldShape) {
      let temp = heldShape;
      heldShape = randomShape;
      randomShape = temp;
    } else {
      heldShape = randomShape;
      randomShape = onDeck;
      onDeck = inTheHole;
      inTheHole = nextRandom;
    }
    undraw();
    drawHoldDisplay();
    freeze();
  }

  //freeze function
  function freeze() {
    if (
      current.some(index =>
        squares[currentPosition + index + width].classList.contains("taken")
      ) ||
      holdCurrent === true
    ) {
      if (!holdCurrent) {
        current.forEach(index =>
          squares[currentPosition + index].classList.add("taken")
        );
      }
      //start new tetromino falling
      if (!holdCurrent) {
        pieceCount++;
        randomShape = onDeck;
        onDeck = inTheHole;
        inTheHole = nextRandom;
        const keys = Object.keys(theTetrominoes);
        nextRandom = keys[(keys.length * Math.random()) << 0];
        //nextRandom = Math.floor(Math.random() * theTetrominoes.length);
        currentRotation = Math.floor(
          Math.random() * theTetrominoes[randomShape].length
        );
        currentPosition = 4;
      }

      current = theTetrominoes[randomShape][currentRotation];

      addScore();
      draw();
      drawDisplay();
      gameOver();
      holdCurrent = false;
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
    freeze();
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
    freeze();
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

  // so pieces don't join together when rotated near existing blocks
  const isOverlap = () => {
    if (
      current.some(index =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      return true;
    } else return false;
  };

  const rotate = () => {
    undraw();
    let prevRotation = currentRotation;
    currentRotation++;
    if (currentRotation === current.length) {
      currentRotation = 0;
    }
    current = theTetrominoes[randomShape][currentRotation];
    if (isOverlap()) {
      currentRotation = prevRotation;
      current = theTetrominoes[randomShape][currentRotation];
      draw();
      freeze();
    } else {
      checkRotatedPosition();
      draw();
      freeze();
    }
  };

  const displaySquares = document.querySelectorAll(".mini-grid div");
  const displayWidth = 7;
  let displayIndex = 0;
  const holdSquares = document.querySelectorAll(".hold-grid div");

  //tetrominoes without rotations
  const upNextTetrominoes = {
    lTetromino: [1, displayWidth + 1, displayWidth * 2 + 1, 2], //lTetromino
    jTetromino: [1, displayWidth + 1, displayWidth * 2 + 1, 0], //jTetromino
    sTetromino: [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //sTetromino
    zTetromino: [
      displayWidth,
      displayWidth + 1,
      displayWidth * 2 + 1,
      displayWidth * 2 + 2
    ], //zTetromino
    tTetromino: [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
    oTetromino: [0, 1, displayWidth, displayWidth + 1], //oTetromino
    iTetromino: [
      1,
      displayWidth + 1,
      displayWidth * 2 + 1,
      displayWidth * 3 + 1
    ] //iTetromino
  };

  //display next tetromino in mini grid
  function drawDisplay() {
    //clear grid
    displaySquares.forEach(square => {
      square.classList.remove(
        "lTetromino",
        "jTetromino",
        "sTetromino",
        "zTetromino",
        "tTetromino",
        "oTetromino",
        "iTetromino"
      );
    });
    upNextTetrominoes[onDeck].forEach(index => {
      displaySquares[displayWidth + 2 + index].classList.add(onDeck);
    });
    upNextTetrominoes[inTheHole].forEach(index => {
      displaySquares[displayWidth * 6 + 2 + index].classList.add(inTheHole);
    });
    upNextTetrominoes[nextRandom].forEach(index => {
      displaySquares[displayWidth * 11 + 2 + index].classList.add(nextRandom);
    });
  }

  //display current in hold grid
  function drawHoldDisplay() {
    //clear grid
    holdSquares.forEach(square => {
      square.classList.remove(
        "lTetromino",
        "jTetromino",
        "sTetromino",
        "zTetromino",
        "tTetromino",
        "oTetromino",
        "iTetromino"
      );
    });

    upNextTetrominoes[heldShape].forEach(index => {
      holdSquares[displayWidth * 2 + 2 + index].classList.add(heldShape);
    });
  }

  //start/pause button functionality
  startBtn.addEventListener("mousedown", () => {
    if (!gameEnd) {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
        levelMusic[level].pause();
      } else {
        draw();
        timerId = setInterval(moveDown, speed);
        nextRandom = keys[(keys.length * Math.random()) << 0];
        inTheHole = keys[(keys.length * Math.random()) << 0];
        onDeck = keys[(keys.length * Math.random()) << 0];
        drawDisplay();
        levelMusic[level].play();
      }
    } else {
      location.reload();
    }
  });

  const levelUp = () => {
    if (level > levelDisplay.innerHTML) {
      //so the speed doesn't accellerate when rows cleared simultaneously
      speed -= 100;
    }
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
    levelMusic[level - 1].pause();
    levelMusic[level].play();
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
        score += 100;
        scoreDisplay.innerHTML = score;
        row.forEach(index => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino");
        });
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach(cell => grid.appendChild(cell));
        squares.forEach(s => {
          if (s.classList.contains("taken")) {
          } else {
            s.className = "";
          }
        });
        //play sound
        if (soundFlag) {
          sound.pause();
          sound.currentTime = 0;
          sound.play();
          soundFlag = false;
        }
        if (score > 199 && score < 400) {
          level = 2;
          levelUp();
        } else if (score > 399 && score < 510) {
          level = 3;
          levelUp();
        } else if (score > 599 && score < 710) {
          level = 4;
          levelUp();
        } else if (score > 799 && score < 910) {
          level = 5;
          levelUp();
        } else if (score > 999 && score < 1100) {
          level = 6;
          levelUp();
        } else if (score > 1199 && score < 1390) {
          level = 7;
          levelUp();
        } else if (score > 1399 && score < 1500) {
          level = 8;
          levelUp();
        } else if (score > 1599 && score < 1900) {
          level = 9;
          levelUp();
        } else if (score > 1999 && score < 2100) {
          level = 10;
          levelUp();
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
      levelMusic[level].pause();
    }
  };
});
