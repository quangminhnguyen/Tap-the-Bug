window.onload = function () {
    /* !!!! PLease read NoteOnTheDesign.pdf before looking at my code. !!!*/
    
    /* HTML ELEMENTS */
    var ctx = document.getElementById('gamecanvas').getContext('2d');
    var startGame = document.getElementById("startbutton");
    var startPage = document.getElementById("startpage");
    var gamePage = document.getElementById("gamepage");
    var gameOverPopUp = document.getElementById("gameoverpopup");
    var pauseButton = document.getElementById("pausebutton");
    var timeDisplay = document.getElementById("timecounter");
    var scoreDisplay = document.getElementById("currentscore");
    var radioSelectLevel1 = document.getElementById("radioone");
    var radioSelectLevel2 = document.getElementById("radiotwo");
    var gameOverScore = document.getElementById("finalscore");
    var restartButton = document.getElementById("restartbutton");
    var exitGame = document.getElementById("exitgamebutton");
    var scoreLevel1 = document.getElementById("level1score");
    var highScoreDisplay = document.getElementById("highscore");
    var level1ScorePopUp = document.getElementById("level1popup");
    
    /* GAME VARIABLES */
    var allowOverlapBug = false; // game mode, whether overllaping between bugs are allowed.
    var animation; // will store value return by setInterval
    var currentLevel = 0; // current level in the game. 0 means front page.
    var pause = false; // is the game being paused
    var level1ScoreDisplaying = false; // are the scores for the 1st level displaying.
    var foods = []; // list of foods on the canvas.
    var bugs = []; // list of bugs on the canvas.
    var bugsToFade = []; // list of bugs to fade after being killed.
    
    var bugSpawnTime; // the spawn time between 2 bugs.
    var counter = 0; // counts frame until a second.
    var xStartBug = 0; // a random x coordinate for the bug to start.
    var timeCounter = 60; // time counter starts at 60.
    var aSecondCounter = 0; // count a second.
    var currentScore = 0; // score counter.

    
    /* CONSTANT */
    var FOOD_NAMES = ["apple", "orange", "tomato", "lemon", "peer"]; // can add more foods to this for testing purpose.
    var BUG_COLORS = ["black", "red", "orange"]; // all possible bug's color.
    var FRAME_RATE = 40; // The game frame rate, one frame every 25 millisecond.
    var KILL_BLACK_BUG_SCORE = 5;
    var KILL_RED_BUG_SCORE = 3;
    var KILL_ORANGE_BUG_SCORE = 1;
    var BLACK_BUG_SPEED_LEVEL_1 = 150;
    var RED_BUG_SPEED_LEVEL_1 = 75; 
    var ORANGE_BUG_SPEED_LEVEL_1 = 60;
    var BLACK_BUG_SPEED_LEVEL_2 = 200;
    var RED_BUG_SPEED_LEVEL_2 = 100;
    var ORANGE_BUG_SPEED_LEVEL_2 = 80;
    var SPAWN_FOOD_X_LOW = 20; // The lowerbound on the x coordinate of the foods.
    var SPAWN_FOOD_X_HIGH = 380; // The upper bound on the x coordinate of the foods.
    var SPAWN_FOOD_Y_LOW = 140; // The lowerbound on the y coordinate of the foods.
    var SPAWN_FOOD_Y_HIGH = 580;  // The upper bound on the y coordinate of the foods.
    var TAP_RADIUS = 30; // The radius from the center of the bug each tap can kill it.
    var STORAGE_KEY_LEVEL1 = "highscore1"; // Key to retrieve high score from local storage.
    var STORAGE_KEY_LEVEL2 = "highscore2"; // Key to retrieve high score from local storage.
    var ROTATION_SPEED = 0.08; // angle in radian determine how fast the bug rotate.
    var FADING_TIME = 2; // Fade the death bug in two seconds.
    var FOOD_OVERLAP_RANGE = 20; // Each food is at least 20 pixels away from each other.
    var BUG_SPAWN_TIME_LOW = 40; // 40 frames = 1 seconds
    var BUG_SPAWN_TIME_UP = 120; // 120 frames = 3 seconds, recommend to reduce it to get more bugs!
    
    /* Display high score on the front page. */
    function displayHighScore() {
        /* Display the high score for level 2 only if the player click level 2 radio button. */
        if (radioSelectLevel2.checked) {
            if (localStorage.getItem(STORAGE_KEY_LEVEL2) === null) {
                highScoreDisplay.innerHTML = "High Score: " + 0;
            } else {
                highScoreDisplay.innerHTML = "High Score: " + localStorage.getItem(STORAGE_KEY_LEVEL2);
            }
            
        /* Otherwise, by default, display the high score for level 1.*/
        } else {
            if (localStorage.getItem(STORAGE_KEY_LEVEL1) === null) {
                highScoreDisplay.innerHTML = "High Score: " + 0;
            } else {
                highScoreDisplay.innerHTML = "High Score: " + localStorage.getItem(STORAGE_KEY_LEVEL1);
            }
        }
    }
    
    /* By default displaying the score of level 1 when level has not been selected.*/
    if (localStorage.getItem(STORAGE_KEY_LEVEL1) === null) {
            highScoreDisplay.innerHTML = "High Score: " + 0;
    } else {
            highScoreDisplay.innerHTML = "High Score: " + localStorage.getItem(STORAGE_KEY_LEVEL1);
    }
    
    /* Display the player highscore from the local storage. */
    radioSelectLevel1.onclick = displayHighScore;
    radioSelectLevel2.onclick = displayHighScore;
    
    startGame.onmousedown = function() {
        if (!radioSelectLevel1.checked && !radioSelectLevel2.checked) {
            alert("You have to select one of the two levels!");
        } else {
            if (radioSelectLevel1.checked) {
                currentLevel = 1;
            } else if  (radioSelectLevel2.checked) {
                currentLevel = 2;
            }
            playgame();
        }
    };
    
    /* Start to play the game. */
    function playgame() {
        startPage.style.display = "none";
        gamePage.style.display = "block";
        scoreDisplay.innerHTML = "Level " + currentLevel + "<br>Score: " + currentScore;
        
        
        for (var i = 0; i < FOOD_NAMES.length; i++) {
            var x = Math.floor((Math.random() * (SPAWN_FOOD_X_HIGH - SPAWN_FOOD_X_LOW + 1)) + SPAWN_FOOD_X_LOW);
            var y = Math.floor((Math.random() * (SPAWN_FOOD_Y_HIGH - SPAWN_FOOD_Y_LOW + 1)) + SPAWN_FOOD_Y_LOW);
            while(isOverlap(x, y) == true) {
                x = Math.floor((Math.random() * (SPAWN_FOOD_X_HIGH - SPAWN_FOOD_X_LOW + 1)) + SPAWN_FOOD_X_LOW);
                y = Math.floor((Math.random() * (SPAWN_FOOD_Y_HIGH - SPAWN_FOOD_Y_LOW + 1)) + SPAWN_FOOD_Y_LOW);
            }
            var f = new Food(FOOD_NAMES[i], x, y);
            foods.push(f);
        }
        
        /* 40 to 120 frames is equivalent to 1 to 3 seconds */
        bugSpawnTime = Math.floor((Math.random() * (BUG_SPAWN_TIME_UP - BUG_SPAWN_TIME_LOW + 1)) + BUG_SPAWN_TIME_LOW); 
        
        /* Game Loop */
        animation = setInterval(animate, 1000 / FRAME_RATE);
        
        pauseButton.onmousedown= runOrPause;
        ctx.canvas.onmousedown = tapDetect;
    }
    
    /* Check if two foods are overlapped. */
    function isOverlap(x, y) {
        for (var i = 0; i < foods.length; i++) {
            if ((x < foods[i].x + FOOD_OVERLAP_RANGE) && (x > foods[i].x - FOOD_OVERLAP_RANGE) 
               && (y < foods[i].y + FOOD_OVERLAP_RANGE) && (y > foods[i].y - FOOD_OVERLAP_RANGE)) {
                return true;
            }
        }
        return false;
    }
    
    /* Detect Tap Hit. */
    function tapDetect(event) {
        if (pause == false) {
            var mX = event.clientX - ctx.canvas.offsetLeft;
            var mY = event.clientY - ctx.canvas.offsetTop;
            for (var i = bugs.length - 1; i >= 0; i--) {
                var distance = getDistance(bugs[i].getCenter()[0], bugs[i].getCenter()[1], mX, mY);
                if (distance < TAP_RADIUS) {
                    currentScore += bugs[i].score;
                    scoreDisplay.innerHTML =  "Level " + currentLevel + "<br>Score: " + currentScore;
                    removeBugFromAnyWaitList(bugs[i]);
                    bugsToFade.push(bugs[i]);
                    bugs.splice(i, 1);
                }
            }
        }
    }
    
    /* If a bug is killed, no other bugs should keeps waiting for that bug. */
    function removeBugFromAnyWaitList(b) {
        for (var i = 0; i < bugs.length; i++) {
            for(var k = bugs[i].waitList.length - 1; k >= 0; k--) {
                if (bugs[i].waitList[k] == b) {
                    bugs[i].waitList.splice(k, 1);
                }
            }
        }
    }
    
    /* Game loop function */
    function animate() {
        if (timeCounter == 0 && currentLevel == 1) {
            clearInterval(animation);
            
            var highScore = Math.max(localStorage.getItem(STORAGE_KEY_LEVEL1), currentScore);
            localStorage.setItem(STORAGE_KEY_LEVEL1, highScore);
            
            /* Reset all attributes. */
            counter = 0;
            xStartBug = 0;
            timeCounter = 60;
            aSecondCounter = 0;
            bugs = [];
            bugsToFade = [];
            foods = [];
            
            /* 40 to 120 frames is equivalent to 1 to 3 seconds */
            bugSpawnTime = Math.floor((Math.random() * (BUG_SPAWN_TIME_UP - BUG_SPAWN_TIME_LOW + 1)) + BUG_SPAWN_TIME_LOW); 

            for (var i = 0; i < FOOD_NAMES.length; i++) {
                    var x = Math.floor((Math.random() * (SPAWN_FOOD_X_HIGH - SPAWN_FOOD_X_LOW + 1)) + SPAWN_FOOD_X_LOW);
                    var y = Math.floor((Math.random() * (SPAWN_FOOD_Y_HIGH - SPAWN_FOOD_Y_LOW + 1)) + SPAWN_FOOD_Y_LOW);
                    while(isOverlap(x, y) == true) {
                        x = Math.floor((Math.random() * (SPAWN_FOOD_X_HIGH - SPAWN_FOOD_X_LOW + 1)) + SPAWN_FOOD_X_LOW);
                        y = Math.floor((Math.random() * (SPAWN_FOOD_Y_HIGH - SPAWN_FOOD_Y_LOW + 1)) + SPAWN_FOOD_Y_LOW);
                    }
                    var f = new Food(FOOD_NAMES[i], x, y);
                    foods.push(f);
            }
            
            currentLevel = 2;
            level1ScoreDisplaying = true;
            level1ScorePopUp.style.display = "block";
            scoreLevel1.innerHTML = "Your Score: " + currentScore;    
            currentScore = 0;
            
            scoreDisplay.innerHTML = "Level " + currentLevel + "<br>Score: " + currentScore;
            
            setTimeout(function(){
                level1ScorePopUp.style.display = "none";
                level1ScoreDisplaying = false;
                animation = setInterval(animate, 1000 / FRAME_RATE);
            }, 5000);
        }
        
        if (foods.length == 0 || (timeCounter == 0 && currentLevel == 2)) {
            clearInterval(animation);
            
            restartButton.onmousedown = function() {
                ctx.clearRect(0, 0, 400, 600);
                pauseButton.style.display = "block";
                timeDisplay.style.display = "block";
                scoreDisplay.style.display = "block";
                for (var i = 0; i < FOOD_NAMES.length; i++) {
                    var x = Math.floor((Math.random() * (SPAWN_FOOD_X_HIGH - SPAWN_FOOD_X_LOW + 1)) + SPAWN_FOOD_X_LOW);
                    var y = Math.floor((Math.random() * (SPAWN_FOOD_Y_HIGH - SPAWN_FOOD_Y_LOW + 1)) + SPAWN_FOOD_Y_LOW);
                    while(isOverlap(x, y) == true) {
                        x = Math.floor((Math.random() * (SPAWN_FOOD_X_HIGH - SPAWN_FOOD_X_LOW + 1)) + SPAWN_FOOD_X_LOW);
                        y = Math.floor((Math.random() * (SPAWN_FOOD_Y_HIGH - SPAWN_FOOD_Y_LOW + 1)) 
                                       + SPAWN_FOOD_Y_LOW);
                    }
                    var f = new Food(FOOD_NAMES[i], x, y);
                    foods.push(f);
                }
                gameOverPopUp.style.display = "none";
                scoreDisplay.innerHTML = "Level " + currentLevel + "<br>Score: " + currentScore;
                animation = setInterval(animate, 1000 / FRAME_RATE);
            }
            
            
            exitGame.onmousedown = function() {
                ctx.clearRect(0, 0, 400, 600);
                
                /* Redisplay the info bar*/
                pauseButton.style.display = "block";
                timeDisplay.style.display = "block";
                scoreDisplay.style.display = "block";
                
                /* Uncheck the radio buttons. */
                radioSelectLevel1.checked = false;
                radioSelectLevel2.checked = false;
                
                /* Display the start page*/
                gameOverPopUp.style.display = "none";
                gamePage.style.display = "none";
                startPage.style.display = "block";
                
                /* Reset the highscore. */
                displayHighScore();
                currentLevel = 0;
            }
            
            /* Display the gameover pop up.*/
            gameOverPopUp.style.display = "block"; 
            gameOverScore.innerHTML = "Your Score: " + currentScore;
            
            /* Hide the infobar. */
            pauseButton.style.display = "none";
            timeDisplay.style.display = "none";
            scoreDisplay.style.display = "none";
            
            /* Save if there is a new high score */
            var highScore;
            if (currentLevel == 1) {
                highScore = Math.max(localStorage.getItem(STORAGE_KEY_LEVEL1), currentScore);
                localStorage.setItem(STORAGE_KEY_LEVEL1, highScore);
            } else if (currentLevel == 2) {
                highScore = Math.max(localStorage.getItem(STORAGE_KEY_LEVEL2), currentScore);
                localStorage.setItem(STORAGE_KEY_LEVEL2, highScore);
            }
            
            if (timeCounter == 0 && currentLevel == 2) {
                currentLevel = 1;
            }
            
            /* Reset all attributes. */
            counter = 0;
            xStartBug = 0;
            timeCounter = 60;
            aSecondCounter = 0;
            currentScore = 0;
            bugs = [];
            bugsToFade = [];
            foods = [];
        }
        
        timeDisplay.innerHTML = "Time: " + timeCounter;
        if (counter == bugSpawnTime) {
            counter = 0;
            bugSpawnTime = Math.floor((Math.random() * (BUG_SPAWN_TIME_UP - BUG_SPAWN_TIME_LOW + 1)) + BUG_SPAWN_TIME_LOW);
            xStartBug = Math.floor((Math.random() * (390 - 10 + 1)) + 10);
            var newBug = new Bug(xStartBug, 0, currentLevel);
            bugs.push(newBug);
        }
        
        if (aSecondCounter == 40) {
            aSecondCounter = 0;
            timeCounter -= 1;
        }
        aSecondCounter++;
        counter++;
        
        ctx.clearRect(0, 0, 400, 600);
        renderFood();
        renderEnemies();
    }
    
    /* Pause the game when the user click pause button. */
    function runOrPause() {
        if (level1ScoreDisplaying == false) {
            if (pause == false) {
                pause = true;
                clearInterval(animation);
                pauseButton.innerHTML = "Play";
            } else {
                pause = false;
                animation = setInterval(animate, 25);
                pauseButton.innerHTML = "Pause";
            }
        }
    }
    
    /* Check if a bug comes close to a food, splice the food if a bug comes 
    within 10 pixel from the center of the food. */
    function bugEatFood() {
        for (var i = 0; i < bugs.length; i++) {
            var b = bugs[i];
            for (var k = 0; k < 10; k++) {
                for (var t = 0; t < 40; t++) {
                    for(var u = (foods.length - 1); u >= 0; u--) {
                        var f = foods[u];
                        var distance = getDistance(f.x, f.y, b.x + k, b.y + t);
                        if (distance <= 10) {
                            var sourceAngles = [];
                            var destAngles = [];
                            for(var z = 0; z < bugs.length; z++) {
                                if(bugs[z].state != "rotating") {
                                    sourceAngles.push(bugs[z].angleToRotate());
                                } else {
                                    bugs[z].currentAngleStage = 0;
                                    sourceAngles.push(bugs[z].currentAngle)
                                }
                            }
                            foods.splice(u, 1);
                            for(var z = 0; z < bugs.length; z++) {
                                destAngles.push(bugs[z].angleToRotate());
                            }
                            
                            for (var z = 0; z < bugs.length; z++) {
                                if (sourceAngles[z] >= 0 && destAngles[z] >= 0) { // Case 1
                                    bugs[z].rotatingAngle = destAngles[z] - sourceAngles[z];
                                    bugs[z].currentAngle = sourceAngles[z];
                                } else if (sourceAngles[z] <= 0 && destAngles[z] <= 0) { // Case 4
                                    bugs[z].rotatingAngle = destAngles[z] - sourceAngles[z];
                                    bugs[z].currentAngle = sourceAngles[z];
                                } else if (sourceAngles[z] <= 0 && destAngles[z] >= 0) {
                                    var diff = destAngles[z] - sourceAngles[z];
                                    if (diff >= Math.PI) {
                                        bugs[z].rotatingAngle = -1 * (2 * Math.PI - diff);
                                        bugs[z].currentAngle = sourceAngles[z];
                                    } else if (diff < Math.PI) {
                                        bugs[z].rotatingAngle = diff;
                                        bugs[z].currentAngle = sourceAngles[z];
                                    }
                                } else if (sourceAngles[z] >= 0 && destAngles[z] <= 0) {
                                    var diff = sourceAngles[z] - destAngles[z];
                                    if (diff >= Math.PI) {
                                        bugs[z].rotatingAngle = 2 * Math.PI - diff;
                                        bugs[z].currentAngle = sourceAngles[z];
                                    } else if (diff < Math.PI) {
                                        bugs[z].rotatingAngle = -1 * diff;
                                        bugs[z].currentAngle = sourceAngles[z];
                                    }
                                }
                                bugs[z].state = "rotating";
                            }
                        }
                    }
                }
            }
        }
    }
    
    /* Draw the food according to their name on canvas. */
    function renderFood() {  
        bugEatFood();
        for (var i = 0; i < foods.length; i++) {
            if (foods[i].name == "apple") {
                ctx.beginPath();
                ctx.arc(foods[i].x, foods[i].y, 7, 0, 2 * Math.PI);
                ctx.fillStyle = "Red";
                ctx.fill();
                ctx.strokeStyle = "DarkRed";
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(foods[i].x, foods[i].y - 7);
                ctx.lineTo(foods[i].x + 7, foods[i].y - 7 - 6);
                ctx.strokeStyle = "Green";
                ctx.stroke();

            } else if (foods[i].name == "orange") {
                ctx.beginPath();
                ctx.arc(foods[i].x, foods[i].y, 7, 0, 2 * Math.PI);
                ctx.fillStyle = "Orange";
                ctx.fill();
                ctx.strokeStyle = "DarkOrange";
                ctx.stroke();

                
                ctx.beginPath();
                ctx.moveTo(foods[i].x, foods[i].y - 7);
                ctx.lineTo(foods[i].x + 7, foods[i].y - 7 - 6);
                ctx.strokeStyle = "ForestGreen";
                ctx.stroke();

            } else if (foods[i].name == "tomato") {
                ctx.beginPath();
                ctx.arc(foods[i].x, foods[i].y, 7, 0, 2 * Math.PI);
                ctx.fillStyle = "Crimson";
                ctx.fill();
                ctx.strokeStyle = "DarkRed";
                ctx.stroke();

                
                ctx.beginPath();
                ctx.moveTo(foods[i].x, foods[i].y - 7);
                ctx.lineTo(foods[i].x - 7, foods[i].y - 7 - 6);
                ctx.strokeStyle = "ForestGreen";
                ctx.stroke();


            } else if (foods[i].name == "lemon") {
                ctx.beginPath();
                ctx.arc(foods[i].x, foods[i].y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = "Green";
                ctx.fill();
                ctx.strokeStyle = "DarkGreen";
                ctx.stroke();

                
                ctx.beginPath();
                ctx.moveTo(foods[i].x, foods[i].y - 8);
                ctx.lineTo(foods[i].x, foods[i].y - 9 - 4);
                ctx.strokeStyle = "ForestGreen";
                ctx.stroke();

                
            } else if (foods[i].name == "peer") {
                ctx.beginPath();
                ctx.arc(foods[i].x, foods[i].y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = "GreenYellow";
                ctx.fill();
                ctx.strokeStyle = "DarkYellow";
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(foods[i].x, foods[i].y - 7);
                ctx.lineTo(foods[i].x - 7, foods[i].y - 7 - 6);
                ctx.strokeStyle = "SaddleBrown";
                ctx.stroke();
            }
        }
    }
        
    
    /* Food class */
    function Food(n, x, y) {
        this.name = n;
        this.x = x;
        this.y = y;
    }
    
    
    /* Bug Class */
    function Bug(x, y, level) {
        this.x = x;
        this.y = y;
        this.level = level;
        this.color = getARandomBugColor();
        this.score = getBugKillScore(this.color);
        this.speed = getBugSpeed(this.level, this.color);
        this.alpha = 1;
        
        /* Variables for rotating this bug. */
        this.state = "running";
        this.rotatingAngle = 0; // The difference between source and destination angle.
        this.currentAngle = 0;
        this.currentAngleStage = 0;
        
        /* Variables for avoiding overlapping with other bugs.*/
        this.waitList = [];
        this.priority = false;
        
        /* Get the closest food from the food. */
        this.getClosestFood = function() {
            return findClosestFood(this.x + 5, this.y + 20);
        }
        
        /* Get the change in x that is neccessary to maitain the 
        requirement of this bug. */
        this.xToChange = function() {
            var closestFood = this.getClosestFood();
            
            if (closestFood == null) {
                return 0;
            }
            
            var xToClosestFood = closestFood.x - (this.x + 5);
            var yToClosestFood = closestFood.y - (this.y + 20);
            var rs;
            
            if (yToClosestFood != 0) {
                rs = (Math.sin(Math.atan(xToClosestFood / yToClosestFood)) * this.speed) / FRAME_RATE;
            } else {
                return this.speed;
            }
            if (yToClosestFood < 0) {
                return -1 * rs;
            } else {
                return rs;
            }
        };
        
        /* Get the change in y that is neccessary to maitain the 
        requirement of this bug. */
        this.yToChange = function() {
            var closestFood = this.getClosestFood();
             
            if (closestFood == null) {
                return 0;
            } 
            var xToClosestFood = closestFood.x - (this.x + 5);
            var yToClosestFood = closestFood.y - (this.y + 20);
            var rs;
            if (yToClosestFood != 0) {
                var rs = (Math.cos(Math.atan(xToClosestFood / yToClosestFood)) * this.speed) / FRAME_RATE; 
            } else {
                return 0;
            }
            if (yToClosestFood < 0) {
                return -1 * rs;
            } else {
                return rs;
            }
        };
        
        /* Get angle from this bug to next food. */
        this.angleToRotate = function () {
            var closestFood = this.getClosestFood();
            if (closestFood == null) {
                return 0;
            }
            var xToClosestFood = closestFood.x - (this.x + 5);
            var yToClosestFood = closestFood.y - (this.y + 20);
            var angle;
            // angle has negative value.
            if ((xToClosestFood > 0) && (yToClosestFood > 0)) {
                angle = -1 * Math.atan(xToClosestFood / yToClosestFood);
            // angle has positive value
            } else if ((xToClosestFood < 0) && (yToClosestFood > 0)) {
                angle = -1 * Math.atan(xToClosestFood / yToClosestFood);
            // angle has positive value
            } else if (xToClosestFood < 0 && yToClosestFood < 0) {
                angle = (0.5 * Math.PI - Math.atan(xToClosestFood / yToClosestFood)) + 0.5 * Math.PI;
            // angle 
            } else if (xToClosestFood > 0 && yToClosestFood < 0) {
                angle = -0.5 * Math.PI - (0.5 * Math.PI - (-1) * Math.atan(xToClosestFood / yToClosestFood));
            } else if (xToClosestFood == 0 && yToClosestFood > 0) {
                angle = 0;
            } else if (xToClosestFood < 0 && yToClosestFood == 0) {
                angle = 0.5 * Math.PI;
            } else if (xToClosestFood > 0 && yToClosestFood == 0) {
                angle = -0.5 * Math.PI;
            } else if (xToClosestFood == 0 && yToClosestFood < 0) {
                angle = Math.PI;
            }
            return angle;
        };
        
        /* Get the top left corner coordinate of this bug. */
        this.getTopLeftCorner = function() {
            var angle;
            if (this.state == "running") {
                angle = this.angleToRotate();
            } else if (this.state == "rotating") {
                angle = this.currentAngle;
            }
            return [this.x + 5 + getRotatedX(angle, -5, -20), this.y + 20 + getRotatedY(angle, -5, -20)];
        };
        
        /* Get the bottom left corner coordinate of this bug. */
        this.getBottomLeftCorner = function() {
            var angle;
            if (this.state == "running") {
                angle = this.angleToRotate();
            } else if (this.state == "rotating") {
                angle = this.currentAngle;
            }
            return [this.x + 5 + getRotatedX(angle, -5, 20), this.y + 20 + getRotatedY(angle, -5, 20)];
        };
        
        /* Get the top right corner coordinate of this bug.*/
        this.getTopRightCorner = function() {
            var angle;
            if (this.state == "running") {
                angle = this.angleToRotate();
            } else if (this.state == "rotating") {
                angle = this.currentAngle;
            }
            return [this.x + 5 + getRotatedX(angle, 5, -20), this.y + 20 + getRotatedY(angle, 5, -20)];
        };
        
        /* Get the bottom right corner coordinate of this bug. */
        this.getBottomRightCorner = function() {
            var angle;
            if (this.state == "running") {
                angle = this.angleToRotate();
            } else if (this.state == "rotating") {
                angle = this.currentAngle;
            }
            return [this.x + 5 + getRotatedX(angle, 5, 20), this.y + 20 + getRotatedY(angle, 5, 20)];
        };
        
        /* Get the center */
        this.getCenter = function() {
            var angle;
            if (this.state == "running") {
                angle = this.angleToRotate();
            } else if (this.state == "rotating") {
                angle = this.currentAngle;
            }
            return [this.x + 5 + getRotatedX(angle, 0, 0), this.y + 20 + getRotatedY(angle, 0, 0)];
        };
        
        /* Get the minimum x and y coordinate out of the four corners of the bug.*/
        this.getMinXYCor = function() {
            var x = Math.min(this.getTopLeftCorner()[0], this.getTopRightCorner()[0], this.getBottomLeftCorner()[0], this.getBottomRightCorner()[0]);
            var y = Math.min(this.getTopLeftCorner()[1], this.getTopRightCorner()[1], this.getBottomLeftCorner()[1], this.getBottomRightCorner()[1]);
            return [x, y];
        };
        
        /* Get the maximum x and y coordinate out of the cour corners of the bug.*/
        this.getMaxXYCor = function() {
            var x = Math.max(this.getTopLeftCorner()[0], this.getTopRightCorner()[0], this.getBottomLeftCorner()[0], this.getBottomRightCorner()[0]);
            var y = Math.max(this.getTopLeftCorner()[1], this.getTopRightCorner()[1], this.getBottomLeftCorner()[1], this.getBottomRightCorner()[1]);
            var rs = [];
            return [x, y];
        };
        
        /* Check to see if the two bugs is about to collide !*/
        this.isAboutToCollide = function() {
            for (var i = this.waitList.length - 1; i>=0; i--) {
                var topLeft = inside(this.getTopLeftCorner(), this.waitList[i]);
                var topRight = inside(this.getTopRightCorner(), this.waitList[i]);
                var bottomLeft = inside(this.getBottomLeftCorner(), this.waitList[i]);
                var bottomRight = inside(this.getBottomRightCorner(), this.waitList[i]);
                /*
                if (typeof(bugs[i]) == "undefined") {
                    alert("list: " + bugs);
                    this.waitList.splice(i, 1);
                } */
                if(!topLeft && !topRight && !bottomLeft && !bottomRight && getDistance(this.getCenter()[0], this.getCenter()[1], this.waitList[i].getCenter()[0], this.waitList[i].getCenter()[1]) >= 50) {
                    this.waitList[i].priority = false;
                    this.waitList.splice(i, 1);
                }
            }
            if (this.priority == false) {
                for (var i = 0; i <= bugs.length; i++) {
                    var topLeft = inside(this.getTopLeftCorner(), bugs[i]);
                    var topRight = inside(this.getTopRightCorner(), bugs[i]);
                    var bottomLeft = inside(this.getBottomLeftCorner(), bugs[i]);
                    var bottomRight = inside(this.getBottomRightCorner(), bugs[i]);
                    if ((topLeft || topRight || bottomLeft || bottomRight) && !containBug(this, bugs[i].waitList) && !containBug(bugs[i], this.waitList)) {
                        var angle = angleDifference(this, bugs[i]);
                        if (this != bugs[i] && ((angle >= (1 / 12 * Math.PI) && angle <= (23 / 12 * Math.PI)) ||
                                ((angle < (1 / 12 * Math.PI) || angle > (23 / 12 * Math.PI)) && this.speed == bugs[i].speed))) {
                            this.priority = true;
                            this.waitList.push(bugs[i]);
                        }
                    }
                }
            }
            
            if (this.waitList.length > 0) {
                return true;
            } else {
                return false;
            }
        };
         
    }
    
    
    /* Check if (x, y) is in b boundary. */
    function inside(xy, b) {
        if (b == undefined) {
            return false;
        }
        var x = xy[0];
        var y = xy[1];
        var minXY = b.getMinXYCor();
        var maxXY = b.getMaxXYCor();
        if ((minXY[0] <= x) && (x <= maxXY[0]) && (minXY[1] < y) && (y < maxXY[1])) {
            return true;
        } else {
            return false;
        }
    }
    
    
    /* Check if bug is in the list. */
    function containBug(bug, list) {
        for (var i = 0; i < list.length; i ++) {
            if(list[i] == bug) {
                return true;
            }
        }
        return false;
    }
    
    
    /* The difference between 2 angles of two bugs. */
    function angleDifference(bug1, bug2) {
        var angle;
        if (bug1.state == "running" && bug2.state == "running") {
            angle = Math.abs(bug1.angleToRotate() - bug2.angleToRotate());
        } else if (bug1.state == "running" && bug2.state == "rotating") {
            angle = Math.abs(bug1.angleToRotate() - bug2.currentAngle);
        } else if (bug1.state == "rotating" && bug2.state == "running") {
            angle = Math.abs(bug1.currentAngle - bug2.angleToRotate());
        } else if (bug1.state == "rotating" && bug2.state == "rotating") {
            angle = Math.abs(bug1.currentAngle - bug2.currentAngle);
        }
        return angle;
    }
    
    
    /* Given x and y, return the x coordinate rotated in angle degree. */
    function getRotatedX(angle, x, y) {
        return Math.cos(angle) * x - Math.sin(angle) * y;
    }
    
    
    /* Given the y coordinate, return the y co-ordinate in angle degree. */
    function getRotatedY(angle, x, y) {
        return Math.cos(angle) * y + Math.sin(angle) * x;
    }
    
    
    /* Get a random bug color. */
    function getARandomBugColor() {
        var randomNumber = Math.random();
        var color;
        if (randomNumber < 0.3) {
            color = BUG_COLORS[0];
        } else if (randomNumber >= 0.3 && randomNumber < 0.6) {
            color = BUG_COLORS[1];
        } else if (randomNumber >= 0.6 && randomNumber < 1) {
            color = BUG_COLORS[2];
        }
        return color;
    }
    
    
    /* Get a kill score according to the bug's color. */
    function getBugKillScore(color) {
        var score;
        if (color == "black") {
            score = KILL_BLACK_BUG_SCORE;
        } else if (color == "red") {
            score = KILL_RED_BUG_SCORE; 
        } else if (color == "orange") {
            score = KILL_ORANGE_BUG_SCORE;
        }
        return score;
    }
    
    
    /* Get Speed of a bug according to it's color and level. */
    function getBugSpeed(level, color) {
        var speed;
        if (level == 1) {
            if (color == "black") {
                speed = BLACK_BUG_SPEED_LEVEL_1;
            } else if (color == "red") {
                speed = RED_BUG_SPEED_LEVEL_1;
            } else if (color == "orange") {
                speed = ORANGE_BUG_SPEED_LEVEL_1;
            }
        } else if (level == 2) {
            if (color == "black") {
                speed = BLACK_BUG_SPEED_LEVEL_2;
            } else if (color == "red") {
                speed = RED_BUG_SPEED_LEVEL_2;
            } else if (color == "orange") {
                speed = ORANGE_BUG_SPEED_LEVEL_2;
            }
        }
        return speed;
    }
    
    
    /* Find the closest food to (x, y)*/
    function findClosestFood(x, y) {
        if (foods.length > 0) {
            var closestFood = foods[0];
            var minDistance = getDistance(x, y, foods[0].x, foods[0].y);
            for (var i = 0; i < foods.length; i++) {
                var distance = getDistance(x, y, foods[i].x, foods[i].y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestFood = foods[i];
                }
            }
            return closestFood;
        } else {
            return null;
        }
    }

    
    /* Render Enemies. */
    function renderEnemies() {
        for (var i = 0; i < bugs.length; i++) {
            if (bugs[i].state == "running") {
                if ((!allowOverlapBug && !bugs[i].isAboutToCollide())
                   || allowOverlapBug) {
                    bugs[i].x += bugs[i].xToChange();
                    bugs[i].y += bugs[i].yToChange();
                } 
                ctx.save();
                ctx.translate(bugs[i].x + 5, bugs[i].y + 20);
                ctx.rotate(bugs[i].angleToRotate());
                drawBug(bugs[i]);
                ctx.restore();
            } else if (bugs[i].state == "rotating") {
                ctx.save();
                ctx.translate(bugs[i].x + 5, bugs[i].y + 20);
                if(bugs[i].rotatingAngle > 0 && ((!allowOverlapBug && !bugs[i].isAboutToCollide()) || allowOverlapBug)) {
                    // bugs[i].x += bugs[i].xToChange();
                    // bugs[i].y += bugs[i].yToChange();
                    bugs[i].currentAngle += ROTATION_SPEED;
                    bugs[i].currentAngleStage += ROTATION_SPEED;
                } else if (bugs[i].rotatingAngle < 0 && ((!allowOverlapBug && !bugs[i].isAboutToCollide()) || allowOverlapBug)) {
                    // bugs[i].x += bugs[i].xToChange();
                    // bugs[i].y += bugs[i].yToChange();
                    bugs[i].currentAngle -= ROTATION_SPEED;
                    bugs[i].currentAngleStage -= ROTATION_SPEED;
                }
                ctx.rotate(bugs[i].currentAngle);
                drawBug(bugs[i]);
                ctx.restore();
                if (bugs[i].rotatingAngle >= 0 && bugs[i].currentAngleStage  >= bugs[i].rotatingAngle) {
                    bugs[i].state = "running";
                    bugs[i].currentAngle = 0;
                    bugs[i].currentAngleStage = 0;
                    bugs[i].rotatingAngle = 0;
                } else if (bugs[i].rotatingAngle < 0 && bugs[i].currentAngleStage <= bugs[i].rotatingAngle) {
                    bugs[i].state = "running";
                    bugs[i].currentAngle = 0;
                    bugs[i].currentAngleStage = 0;
                    bugs[i].rotatingAngle = 0;
                }
            }
        }
        
        /* Fade any bug that are in bugsToFade list. */
        for (var i = (bugsToFade.length - 1); i >= 0; i--) {
            ctx.save();
            bugsToFade[i].alpha = bugsToFade[i].alpha - 1/(FADING_TIME * FRAME_RATE);
            ctx.globalAlpha = bugsToFade[i].alpha;
            if (bugsToFade[i].alpha <= 0) {
                bugsToFade.splice(i, 1);
            } else { 
                bugsToFade[i].alpha = bugsToFade[i].alpha - 1 / (FADING_TIME * FRAME_RATE);
                ctx.globalAlpha = bugsToFade[i].alpha;
                ctx.translate(bugsToFade[i].x + 5, bugsToFade[i].y + 20);
                if (bugsToFade[i].state == "running") {
                    ctx.rotate(bugsToFade[i].angleToRotate());
                } else if (bugsToFade[i].state == "rotating") {
                    ctx.rotate(bugsToFade[i].currentAngle);
                }
                drawBug(bugsToFade[i]);
            }
            ctx.restore(); 
        }
    
    }
        
    /* Get distance between (x0, y0) and (x1, y1) */
    function getDistance(x0, y0, x1, y1) {
        return Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0));
    }
    
    
    /* Draw the beautiful Bug. */
    function drawBug(b) {
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(-3, 19);
        ctx.lineTo(-4, 18);
        ctx.lineTo(-5, 16);
        ctx.lineTo(-4, 14);
        ctx.lineTo(-2, 12);
        ctx.lineTo(0, 11);
        ctx.moveTo(0, 20);
        ctx.lineTo(3, 19);
        ctx.lineTo(4, 18);
        ctx.lineTo(5, 16);
        ctx.lineTo(4, 14);
        ctx.lineTo(2, 12);
        ctx.lineTo(0, 11);
        ctx.strokeStyle = "Black";
        ctx.strokeWidth = 2;
        ctx.stroke(); 
        ctx.fillStyle = "White";
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(-2, 14, 1, 0, 2 * Math.PI);
        ctx.arc(2, 14, 1, 0, 2 * Math.PI);
        ctx.fillStyle = "Black";
        ctx.fill();
        ctx.strokeStyle = b.color;
        ctx.stroke();
        
        
        ctx.beginPath();
        ctx.moveTo(0, 11);
        ctx.lineTo(2, 12);
        ctx.lineTo(4, 10);
        ctx.lineTo(4, 8);
        ctx.lineTo(3, 6);
        ctx.lineTo(1, 4);
        ctx.lineTo(0, 4);
        ctx.moveTo(0, 11);
        ctx.lineTo(-2, 12);
        ctx.lineTo(-4, 10);
        ctx.lineTo(-4, 8);
        ctx.lineTo(-3, 6);
        ctx.lineTo(-1, 4);
        ctx.lineTo(0, 4);
        ctx.strokeStyle = "Black";
        ctx.strokeWidth = 2;
        ctx.stroke();
        ctx.fillStyle = b.color;
        ctx.fill();
        
        
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(1, 4);
        ctx.lineTo(3, 6);
        ctx.lineTo(4, 4);
        ctx.lineTo(4, 1);
        ctx.lineTo(3, -1);
        ctx.lineTo(2, -2);
        ctx.lineTo(0, -3);
        ctx.moveTo(0, 4);
        ctx.lineTo(-1, 4);
        ctx.lineTo(-3, 6);
        ctx.lineTo(-4, 4);
        ctx.lineTo(-4, 1);
        ctx.lineTo(-3, -1);
        ctx.lineTo(-2, -2);
        ctx.lineTo(0, -3);
        ctx.strokeStyle = "Black";
        ctx.strokeWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "White";
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.lineTo(2, -2);
        ctx.lineTo(3, -1);
        ctx.lineTo(4, -3);
        ctx.lineTo(4, -6);
        ctx.lineTo(3, -8);
        ctx.lineTo(2, -9);
        ctx.lineTo(0, -10);
        ctx.moveTo(-0, -3);
        ctx.lineTo(-2, -2);
        ctx.lineTo(-3, -1);
        ctx.lineTo(-4, -3);
        ctx.lineTo(-4, -6);
        ctx.lineTo(-3, -8);
        ctx.lineTo(-2, -9);
        ctx.lineTo(0, -10);
        ctx.strokeStyle = "Black";
        ctx.strokeWidth = 2;
        ctx.stroke();
        ctx.fillStyle = b.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(2, -9);
        ctx.lineTo(3, -8);
        ctx.lineTo(4, -10);
        ctx.lineTo(4, -13);
        ctx.lineTo(3, -15);
        ctx.lineTo(2, -16);
        ctx.lineTo(0, -17);
        ctx.moveTo(0, -10);
        ctx.lineTo(-2, -9);
        ctx.lineTo(-3, -8);
        ctx.lineTo(-4, -10);
        ctx.lineTo(-4, -13);
        ctx.lineTo(-3, -15);
        ctx.lineTo(-2, -16);
        ctx.lineTo(0, -17);
        ctx.strokeStyle = "Black";
        ctx.strokeWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "White";
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(0, -17);
        ctx.lineTo(2, -16);
        ctx.lineTo(3, -15);
        ctx.lineTo(1, -20);
        ctx.lineTo(0, -20);
        ctx.moveTo(0, -17);
        ctx.lineTo(-2, -16);
        ctx.lineTo(-3, -15);
        ctx.lineTo(-1, -20);
        ctx.lineTo(0, -20);
        ctx.strokeStyle = "Black";
        ctx.strokeWidth = 2;
        ctx.stroke();
        ctx.fillStyle = b.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(-3, 10);
        ctx.lineTo(-7, 11);
        ctx.moveTo(-3, 7);
        ctx.lineTo(-7, 7);
        ctx.moveTo(-3, 4);
        ctx.lineTo(-7, 3);
        ctx.moveTo(-3, 1);
        ctx.lineTo(-7, 1);
        ctx.moveTo(-3, -3);
        ctx.lineTo(-7, -3);
        ctx.moveTo(-3, -5);
        ctx.lineTo(-7, -7);
        ctx.moveTo(-3, -9);
        ctx.lineTo(-7, -10);
        ctx.moveTo(-3, -12);
        ctx.lineTo(-7, -14);
        ctx.moveTo(3, 10);
        ctx.lineTo(7, 11);
        ctx.moveTo(3, 7);
        ctx.lineTo(7, 7);
        ctx.moveTo(3, 4);
        ctx.lineTo(7, 3);
        ctx.moveTo(3, 1);
        ctx.lineTo(7, 1);
        ctx.moveTo(3, -3);
        ctx.lineTo(7, -3);
        ctx.moveTo(3, -5);
        ctx.lineTo(7, -7);
        ctx.moveTo(3, -9);
        ctx.lineTo(7, -10);
        ctx.moveTo(3, -12);
        ctx.lineTo(7, -14);
        ctx.strokeStyle = b.color;
        ctx.strokeWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, 19);
        ctx.lineTo(1, 19);
        ctx.lineTo(3, 17);
        ctx.moveTo(0, 19);
        ctx.lineTo(-1, 19);
        ctx.lineTo(-3, 17);
        ctx.strokeStyle = b.color;
        ctx.strokeWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-4, 17);
        ctx.lineTo(-5, 18);
        ctx.lineTo(-5.5, 20);
        ctx.moveTo(4, 17);
        ctx.lineTo(5, 18);
        ctx.lineTo(5.5, 20);
        ctx.strokeStyle = "Black";
        ctx.strokeWidth = 5;
        ctx.stroke();
    }
    
    
    

};