export default class Game {
  constructor() {
    this.field = document.querySelector('.gameField'); // Игровое поле

    this.difficulty = document.querySelector('.difficulty'); // Поле для выбора уровня сложности
    this.difficultyLevel = this.difficulty.querySelectorAll('div');
    this.playGameButton = document.querySelector('.startGame'); // Кнопка запуска игры
    this.gameSettings = document.querySelector('.gameMessage'); // Поле настройки игры

    this.infoBlock = document.querySelector('.currentInfo'); // Поле с информацией о текущих и лучших результатах
    this.curResultBlock = document.querySelector('.currentResult'); // Поле текущий результат
    this.currentResultValue = document.querySelector('#currentValue'); // Поле для вывода значения текущего результата
    this.bestResultValue = document.querySelector('#bestValue'); // Поле для вывода значения лучшего результата

    this.gameOverButton = document.querySelector('#restart'); // Кнопка для перезапуска игры
    this.finalResultMessage = document.querySelector('.gameOverResult'); // Поле с результатом игры
    this.finalText = document.querySelector('p'); // Сообщение

    this.snakeData = []; // Данные змеи
    this.borderData = []; // Данный границы игрового поля

    this.moveDirection = 'right'; // Направление движения змеи
    this.moveDeltaId = 1; // Математическое выражение движения змеи

    this.foodId;
    this.foodOnGameArea = false;
    this.gameOver = false;
    this.updating;
    this.speed; // Скорость передвижения змеи
    this.points; // Очки в игре
    this.addPointsValue; // В зависимости от уровня сложности начисляются разное кол-во очков
    this.pointsBestResult = localStorage.getItem('theBest') || 0; // Значение лучшего результата
    this.sampleOfBestResult; // Лучший результат на начало игры

    this.threeGameStages = ['Game settings', 'Game process', 'End of the game']; // Три стадии игры, используется для разметки

    this._init();
  }

  _init() {
    // Клик на стрелки
    document.addEventListener('keydown', this._hundleClickOnPress.bind(this));

    // Клик на выборе уровня сложности
    this.difficulty.addEventListener(
      'click',
      this._handleDifficultyLevel.bind(this)
    );

    // Клик на старт игры
    this.playGameButton.addEventListener(
      'click',
      this._handleClickOnStartGame.bind(this)
    );

    // Клик game over
    this.gameOverButton.addEventListener(
      'click',
      this._hundleClickOnRestart.bind(this)
    );
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

    this._getDeltaIdForMoving();
  }

  // Математич. выражение направления движения змеи
  _getDeltaIdForMoving() {
    if (this.moveDirection == 'right') this.moveDeltaId = 1;
    else if (this.moveDirection == 'left') this.moveDeltaId = -1;
    else if (this.moveDirection == 'top') this.moveDeltaId = -17;
    else if (this.moveDirection == 'bottom') this.moveDeltaId = 17;
    return this.moveDeltaId;
  }

  // Выбор уровня сложности
  _handleDifficultyLevel(e) {
    // Удаление разметки
    this.difficultyLevel.forEach((item) => {
      item.classList.remove('choosenLevelButton');
    });

    let level = e.target.getAttribute('id');
    if (level == 'veryEasy') {
      this.speed = 500;
      this.addPointsValue = 1;
    } else if (level == 'easy') {
      this.speed = 400;
      this.addPointsValue = 2;
    } else if (level == 'medium') {
      this.speed = 200;
      this.addPointsValue = 3;
    } else if (level == 'hard') {
      this.speed = 100;
      this.addPointsValue = 4;
    } else if (level == 'veryHard') {
      this.speed = 50;
      this.addPointsValue = 5;
    } else if (!level) {
      return;
    }

    // Разметка при выборе уровня сложности
    let choosenLevel = document.querySelector(`#${level}`);
    choosenLevel.classList.add('choosenLevelButton');
    this.playGameButton.classList.remove('invisible');
  }

  _handleClickOnStartGame() {
    this._setMarkUpOfTheGame(this.threeGameStages[1]); // Разметка
    this._startGame();
    this.updating = setInterval(this._movingMarkUp, this.speed, this.snakeData);
    this.bestResultValue.innerHTML = localStorage.getItem('theBest') || '0';
    this.currentResultValue.innerHTML = '0';
  }

  _hundleClickOnRestart() {
    this._setMarkUpOfTheGame(this.threeGameStages[0]); // Разметка
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
      this.points = this.points + this.addPointsValue;
      this.currentResultValue.innerHTML = `${this.points}`;
    }

    if (this.points > this.pointsBestResult) {
      this.bestResultValue.innerHTML = this.points;
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
      currentSnakeData.splice(currentSnakeData.length - 1, 1);
      currentSnakeData.splice(0, 0, tailId);

      this.gameOver = true;

      this._setBestResult(this.points);
      this._getResultMessage();
      return;
    }
    return currentSnakeData;
  }

  _removeMarkUpOfSnake(currentSnakeData) {
    currentSnakeData.forEach((item) => {
      document.getElementById(item).style.background = 'transparent';
      document.getElementById(item).style.boxShadow = 'none';
    });
  }

  _addMarkUpOfSnake(currentSnakeData) {
    currentSnakeData.forEach((item) => {
      document.getElementById(item).style.background = '#b90707';
      document.getElementById(item).style.boxShadow =
        '5px 5px 5px 0px rgba(0,0,0,0.75)';
    });
  }

  _movingMarkUp = (currentSnakeData) => {
    if (this.foodOnGameArea == false) {
      this._createIdOfFood();
      this._markUpFood();
    }

    this._removeMarkUpOfSnake(currentSnakeData);
    this._getMovingSnake(currentSnakeData, this.moveDeltaId);
    if (!this.gameOver) {
      this._addMarkUpOfSnake(currentSnakeData);
    } else {
      document.getElementById(this.foodId).style.background = 'transparent';
      document.getElementById(this.foodId).style.boxShadow = 'none';
      return;
    }
  };

  _getRandomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }

  _markUpFood() {
    this.foodOnGameArea = document.getElementById(this.foodId);
    this.foodOnGameArea.style.backgroundColor = 'rgba(233, 213, 88, 1)';
    this.foodOnGameArea.style.boxShadow = '5px 5px 5px 0px rgba(0,0,0,0.75)';
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

  _setBestResult(currentResult) {
    if (this.pointsBestResult < currentResult) {
      this.pointsBestResult = localStorage.setItem('theBest', currentResult);
    } else {
      this.bestResultValue.innerHTML = this.pointsBestResult;
    }
  }

  setBestResult() {
    this.bestResultValue.innerHTML = this.pointsBestResult;
  }

  _startGame() {
    this.snakeData = [35, 36, 37];
    this.moveDirection = 'right';
    this.moveDeltaId = 1;
    this.foodId = undefined;
    this.foodOnGameArea = false;
    this.gameOver = false;
    this.points = 0;
    this.bestResultValue.innerHTML = this.pointsBestResult;
    this.sampleOfBestResult = this.pointsBestResult;
  }

  _getResultMessage() {
    this._setMarkUpOfTheGame(this.threeGameStages[2]); // Разметка
    if (this.sampleOfBestResult > this.points) {
      this.finalText.textContent = `Game over. Your result is ${this.points}. Try one more time to get best result!`;
    } else {
      this.finalText.textContent = `Game over. Congratulations! It's new record! Your result is ${this.points}.`;
    }
    this.gameOverButton.classList.add('startGame');
    this.gameOverButton.style.width = '30%';
    this.gameOverButton.style.fontSize = '1em';
    this.gameOverButton.style.marginTop = '20px';
  }

  // Разметка игры в зависимости от стадии игры (начало, игра, конец)
  _setMarkUpOfTheGame(gameStage) {
    if (gameStage == 'Game settings') {
      this.finalResultMessage.classList.add('invisible');
      this.gameSettings.classList.remove('invisible');
      this.infoBlock.classList.remove('invisible');
      this.curResultBlock.classList.add('invisible');
    } else if (gameStage == 'Game process') {
      this.gameSettings.classList.add('invisible');
      this.field.classList.remove('invisible');
      this.curResultBlock.classList.remove('invisible');
    } else if (gameStage == 'End of the game') {
      this.field.classList.add('invisible');
      this.infoBlock.classList.add('invisible');
      this.finalResultMessage.classList.remove('invisible');
    }
  }
}
