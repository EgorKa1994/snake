export default class Game {
  constructor() {
    this.field = document.querySelector('.gameField');
    this.snakeData = [35, 36, 37]; // начальное положение змеи, голова змеи - конец массива!!!!!!!!!!
    this.moveDirection = 'right';
    this.moveDeltaId = 1;
    this.foodId;
    this.foodOnGameArea = false;
    this.borderData = [];
    this.gameOver = false;
    this.updating;

    this._init();
  }

  _init() {
    document.addEventListener('keydown', this._hundleClickOnPress.bind(this));
  }

  _hundleClickOnPress(e) {
    if (
      event.code == 'ArrowDown' &&
      this.moveDirection !== 'top' &&
      this.moveDirection !== 'bottom'
    ) {
      this.moveDirection = 'bottom';
    } else if (
      event.code == 'ArrowRight' &&
      this.moveDirection !== 'right' &&
      this.moveDirection !== 'left'
    ) {
      this.moveDirection = 'right';
    } else if (
      event.code == 'ArrowUp' &&
      this.moveDirection !== 'top' &&
      this.moveDirection !== 'bottom'
    ) {
      this.moveDirection = 'top';
    } else if (
      event.code == 'ArrowLeft' &&
      this.moveDirection !== 'right' &&
      this.moveDirection !== 'left'
    ) {
      this.moveDirection = 'left';
    }

    this._getMoveDeltaId();
  }

  _getMoveDeltaId() {
    if (this.moveDirection == 'right') this.moveDeltaId = 1;
    else if (this.moveDirection == 'left') this.moveDeltaId = -1;
    else if (this.moveDirection == 'top') this.moveDeltaId = -17;
    else if (this.moveDirection == 'bottom') this.moveDeltaId = 17;
    return this.moveDeltaId;
  }

  // Создание разметки игры***************************

  getGameField() {
    for (let i = 0; i < 170; i++) {
      let div = document.createElement('div');
      this.field.append(div);
      div.classList.add('gameCell');
      div.setAttribute(`id`, i);
    }
  }

  getBorder() {
    for (let i = 0; i < 17; i++) {
      this.borderData.push(i);
    }
    for (let i = 33; i < 170; i += 17) {
      this.borderData.push(i);
    }
    for (let i = 168; i > 152; i--) {
      this.borderData.push(i);
    }
    for (let i = 136; i > 0; i -= 17) {
      this.borderData.push(i);
    }
    for (let i = 0; i < this.borderData.length; i++) {
      let borderCell = document.getElementById(this.borderData[i]);
      borderCell.classList.add('borderCell');
      // borderCell.style.backgroundImage = 'url(../img/stonewall.jpg)';
      // borderCell.style.borderRadius = '0';
      // borderCell.style.backgroundSize = 'cover';
    }
  }

  _getMovingSnake(currentSnakeData, directionOfMoving) {
    let currentHeadId = currentSnakeData[currentSnakeData.length - 1];
    // let samplePrimarySnakeData = currentSnakeData.slice();
    let tailId = currentSnakeData[0];

    // Редактирование при движении начала массива (хвост змеи) в зависимости от поедания пищи
    if (currentHeadId !== +this.foodId) {
      currentSnakeData.splice(0, 1);
    } else {
      this.foodOnGameArea = false;
    }

    // Редактирование при движении конца массива (голова змеи)
    currentSnakeData.push(currentHeadId + directionOfMoving);

    let newHeadId = currentSnakeData[currentSnakeData.length - 1];

    // Копия текущего массива змеи без последнего элемента (головы змеи)
    let sampleForChecking = currentSnakeData.slice();
    sampleForChecking.splice(sampleForChecking.length - 1, 1);

    // Проверка, столкнулась ли змея с границами либо с туловищем
    if (
      this.borderData.includes(newHeadId) ||
      sampleForChecking.includes(newHeadId)
    ) {
      clearInterval(this.updating);
      document.removeEventListener(
        'keydown',
        this._hundleClickOnPress.bind(this)
      );
      this.gameOver = true;

      currentSnakeData.splice(currentSnakeData.length - 1, 1);
      currentSnakeData.splice(0, 0, tailId);
    }
    return currentSnakeData;
  }

  _removeMarkUpOfSnake(currentSnakeData) {
    currentSnakeData.forEach((item) => {
      document.getElementById(item).style.background = 'transparent';
    });
  }

  _addMarkUpOfSnake(currentSnakeData) {
    currentSnakeData.forEach((item) => {
      document.getElementById(item).style.background = '#b90707';
    });
  }

  _movingMarkUp = (currentSnakeData) => {
    if (this.foodOnGameArea == false) {
      this._createIdOfFood();
      this._markUpFood();
    }

    this._removeMarkUpOfSnake(currentSnakeData);
    this._getMovingSnake(currentSnakeData, this.moveDeltaId);
    this._addMarkUpOfSnake(currentSnakeData);
  };

  _getRandomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }

  _markUpFood() {
    this.foodOnGameArea = document.getElementById(this.foodId);
    this.foodOnGameArea.style.backgroundColor = '#4e524e';
  }

  _createIdOfFood() {
    this.foodId = `${this._getRandomInteger(18, 151)}`;
    if (
      !this.snakeData.includes(+this.foodId) &&
      !this.borderData.includes(+this.foodId)
    ) {
      return this.foodId;
    } else {
      this._createIdOfFood();
    }
  }

  playingGame() {
    this.updating = setInterval(this._movingMarkUp, 300, this.snakeData);
  }
}
