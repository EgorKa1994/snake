export default class Game {
  constructor() {
    this.field = document.querySelector('.gameField'); // Игровое поле

    this.difficulty = document.querySelector('.difficulty'); // Поле для выбора уровня сложности
    this.difficultyLevel = this.difficulty.querySelectorAll('div'); // Массив уровней сложности
    this.playGameButton = document.querySelector('.startGame'); // Кнопка запуска игры
    this.gameSettings = document.querySelector('.gameMessage'); // Поле настройки игры

    this.infoBlock = document.querySelector('.currentInfo'); // Поле с информацией о текущем и лучшем результатах
    this.curResultBlock = document.querySelector('.currentResult'); // Поле текущий результат
    this.currentResultValue = document.querySelector('#currentValue'); // Поле для вывода значения текущего результата
    this.bestResultValue = document.querySelector('#bestValue'); // Поле для вывода значения лучшего результата

    this.gameOverButton = document.querySelector('#restart'); // Кнопка для перезапуска игры
    this.finalResultMessage = document.querySelector('.gameOverResult'); // Поле с результатом игры
    this.finalText = document.querySelector('p'); // Сообщение

    this.snakeData = []; // Данные змеи, хвост - начало массива/ голова - конец массива
    this.borderData = []; // Данный границы игрового поля

    this.moveDirection = 'right'; // Направление движения змеи
    this.moveDeltaId = 1; // Математическое выражение движения змеи

    this.foodId;
    this.foodOnGameArea = false;
    this.gameOver = false;
    this.updating; // Обновление данных змеи
    this.speed; // Скорость передвижения змеи
    this.points; // Очки в игре
    this.addPointsValue; // В зависимости от уровня сложности начисляются разное кол-во очков
    this.pointsBestResult = localStorage.getItem('theBest') || 0; // Значение лучшего результата
    this.sampleOfBestResult; // Лучший результат на начало игры

    this.threeGameStages = ['Game settings', 'Game process', 'End of the game']; // Три стадии игры, используется для разметки

    this._init();
  }

  // События ----------------------------------

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
    // Удаление разметки выбранной кнопки уровня сложности
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
    this._startGame(); // Обнуление параметров игры
    this.updating = setInterval(this._movingMarkUp, this.speed, this.snakeData);
    this.currentResultValue.innerHTML = this.points;
  }

  _hundleClickOnRestart() {
    this._setMarkUpOfTheGame(this.threeGameStages[0]); //
    this.bestResultValue.innerHTML = localStorage.getItem('theBest') || '0';
  }

  // Конец событий--------------------------------------------------------------------

  // Создание разметки игрового поля--------------------------------------------------

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

  // Конец разметки игрового поля -----------------------------------------------------------

  _getMovingSnake(currentSnakeData, directionOfMoving) {
    let currentHeadId = currentSnakeData[currentSnakeData.length - 1]; // id головы
    let tailId = currentSnakeData[0]; // id хвоста

    // Редактирование при движении начала массива (хвост змеи) в зависимости от поедания пищи
    if (currentHeadId !== +this.foodId) {
      currentSnakeData.splice(0, 1);
    } else {
      this.foodOnGameArea = false;
      this._pointsCounting(this.points); // Добавление очков при поедании
    }

    // Редактирование при движении конца массива (голова змеи)
    currentSnakeData.push(currentHeadId + directionOfMoving);

    let newHeadId = currentSnakeData[currentSnakeData.length - 1];

    // Копия текущего массива змеи без последнего элемента ("новой" головы змеи)
    let sampleForChecking = currentSnakeData.slice();
    sampleForChecking.splice(sampleForChecking.length - 1, 1);

    // Проверка на конец игры (столкнулась с туловищем или границей)
    if (
      this.borderData.includes(newHeadId) ||
      sampleForChecking.includes(newHeadId)
    ) {
      this.gameOver = true;

      clearInterval(this.updating);

      this._checkBestResult(this.points);
      this._showResultMessage();
      return;
    }
    return currentSnakeData;
  }

  // Подсчет очков
  _pointsCounting(currentPoints) {
    this.points = currentPoints + this.addPointsValue;
    this.currentResultValue.innerHTML = `${this.points}`;
    if (this.points > this.pointsBestResult) {
      this.bestResultValue.innerHTML = this.points;
    }
  }

  // Удаление разметки змеи
  _removeMarkUpOfSnake(currentSnakeData) {
    currentSnakeData.forEach((item) => {
      document.getElementById(item).style.background = 'transparent';
      document.getElementById(item).style.boxShadow = 'none';
    });
  }

  // Добавление разметки змеи
  _addMarkUpOfSnake(currentSnakeData) {
    currentSnakeData.forEach((item) => {
      document.getElementById(item).style.background = '#b90707';
      document.getElementById(item).style.boxShadow =
        '5px 5px 5px 0px rgba(0,0,0,0.75)';
    });
  }

  // Разметка при движении
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

  // Разметка еды
  _markUpFood() {
    this.foodOnGameArea = document.getElementById(this.foodId);
    this.foodOnGameArea.style.backgroundColor = 'rgba(233, 213, 88, 1)';
    this.foodOnGameArea.style.boxShadow = '5px 5px 5px 0px rgba(0,0,0,0.75)';
  }

  // Создание еды
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

  _getRandomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }

  _checkBestResult(currentResult) {
    if (this.pointsBestResult < currentResult) {
      localStorage.setItem('theBest', currentResult);
      this.pointsBestResult = currentResult;
    } else {
      this.bestResultValue.innerHTML = this.pointsBestResult;
    }
  }

  setBestResult() {
    this.bestResultValue.innerHTML = this.pointsBestResult;
  }

  // Сброс настроек перед началом игры
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

  _showResultMessage() {
    this._setMarkUpOfTheGame(this.threeGameStages[2]); // Разметка

    if (this.sampleOfBestResult >= this.points) {
      this.finalText.textContent = `Game over. Your result is ${this.points}. Try one more time to get best result!`;
    } else {
      this.finalText.textContent = `Game over. Congratulations! It's new record! Your result is ${this.points}.`;
    }
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
