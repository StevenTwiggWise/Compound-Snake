//GENERAL VARIABLES//////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

const snakeboard = document.getElementById("gameCanvas");
const snakeboard_ctx = gameCanvas.getContext("2d");
const snakeboard_ctxBG = gameCanvasBG.getContext("2d");
const startMenu = document.getElementById("startMenu");
const restartMenu = document.getElementById("restartMenu");
const startText = document.getElementById("startText");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameScore = document.getElementById("gameScore");
const scoreDiv = document.getElementById('score');
const yearDiv = document.getElementById('year');
const additionDiv = document.getElementById('addition');
const monthlySlider = document.getElementById('monthlySlider');
const monthlySliderVal = document.getElementById('monthlySliderVal');



//const snakeboard_ctxBG = gameCanvasBG.getContext("2d");
const snakeboard_bg = "#F5EFE2";
const snakeboard_border = "#F5EFE2";
const snake_color = '#780095';
const snake_width = 20;

//Money Related Variables
let dollarUSLocale = Intl.NumberFormat('en-US');
var interestRate = 0.07;
var monthlyPayment = Math.round(monthlySlider.value);

//Gameplay evolving variables
var score = 1000;
var year = 0;
var addition = Math.round(calcInterest(score)-score);
var gameSpeed = 150;
var roundsPlayed = -1;
var yearlyArray = [];


var secret = "Employee of the month";
var underscores = "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _";

updateSlider();

function updateSlider () {
    //Set monthly payment variable
    monthlyPayment = Math.round(monthlySlider.value);

        //show/hide certain elements on first round vs second round
        if (roundsPlayed <= 0 ){
            monthlySliderVal.innerHTML = " ";
            //monthlySlider.disabled = true;    //Turn this off and on to enable/disable the slider on first round
        } else {
            monthlySlider.disabled = false;
            monthlySliderVal.innerHTML = "$" + monthlyPayment;
            startText.classList.add('hidden');
            startBtn.classList.add('hidden');
            restartBtn.innerHTML = "Restart";
        }
        monthlySliderVal.innerHTML = "$" + monthlyPayment;


    //Update addition values (fnumber above first food)
    addition = Math.round(calcInterest(score)-score);
    document.getElementById('addition').innerHTML = "<p>+$" + addition + "</p>";

}


//VELOCITY AND DIRECTION/////////////////////////////////////////
/////////////////////////////////////////////////////////////////

// Horizontal velocity
let dx = snake_width;
// Vertical velocity
let dy = 0;
// Is it changing direction?
let changing_direction = false;

// Direction velocity change
function change_direction(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    if (changing_direction) return;
    changing_direction = true;

    const keyPressed = event.keyCode;
    const goingUp = dy === snake_width * -1;
    const goingDown = dy === snake_width;
    const goingRight = dx === snake_width;
    const goingLeft = dx === snake_width * -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = snake_width * -1;
        dy = 0;
    }

    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = snake_width * -1;
    }

    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = snake_width;
        dy = 0;
    }

    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = snake_width;
    }
};

//Event listener for directiion
document.addEventListener("keydown", change_direction);

//DEFINE SNAKE AND BOARD//////////////////////////////////////////
/////////////////////////////////////////////////////////////////

//Define where our snake will start
var snake = [
    { x: (snakeboard.width / 2), y: (snakeboard.height / 2) },
    { x: (snakeboard.width / 2) - snake_width, y: (snakeboard.height / 2) },
    { x: (snakeboard.width / 2) - (snake_width * 2), y: (snakeboard.height / 2) },
    { x: (snakeboard.width / 2) - (snake_width * 3), y: (snakeboard.height / 2) },
    { x: (snakeboard.width / 2) - (snake_width * 4), y: (snakeboard.height / 2) }
];

// Draw canvas
function clearCanvas() {
    //  Select the colour to fill the drawing
    snakeboard_ctx.clearRect(0, 0, snakeboard.width, snakeboard.height);
}
function initiateBGCanvas() {
    //  Select the colour to fill the drawing
    snakeboard_ctxBG.fillStyle = snakeboard_bg;
    snakeboard_ctxBG.strokeStyle = snakeboard_border;
    // Draw a "filled" rectangle to cover the entire canvas
    snakeboard_ctxBG.fillRect(0, 0, snakeboard.width, snakeboard.height);
    // Draw a "border" around the entire canvas
    snakeboard_ctxBG.strokeRect(0, 0, snakeboard.width, snakeboard.height);
}
// Draw one snake part
function drawSnakePart(snakePart) {
    // Set the colour of the snake part
    snakeboard_ctx.fillStyle = snake_color;
    // Set the border colour of the snake part
    snakeboard_ctx.strokestyle = snake_color;
    // Draw a "filled" rectangle to represent the snake part at the coordinates
    // the part is located
    snakeboard_ctx.fillRect(snakePart.x, snakePart.y, snake_width, snake_width);
    // Draw a border around the snake part
    snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, snake_width, snake_width);
}

//Prints the parts based on our snake part array
function drawSnake() {
    snake.forEach(drawSnakePart);
}
var sm = 1;
//Gives the illusion of motion by adding an element to the beginning of the array whose position is affected by our velocity variables, and removing the last array element
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    //Check if it is eating food
    const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
    //if so, simply generate new food and skip popping the last value
    if (has_eaten_food) {
        // Generate new food location
        generateFood();

        //Add the dollar amount per year to an array we'll use to graph these values at the end of a round (before increasing score)
        yearlyArray.push(Math.round(score * .07));

        // Increase score and year
        score = Math.round(calcInterest(score));
        year += 1;
        addition = Math.round(calcInterest(score)-score);
        // Display score on screen
        document.getElementById('score').innerHTML = "<p>Acct: $" + dollarUSLocale.format(Math.round(score)) + "</p>";
        document.getElementById('year').innerHTML = "<p>Year: " + year + "</p>";
        document.getElementById('addition').innerHTML = "<p>+$" + addition + "</p>";
        //Speed up our snake! With a minimum value of 25ms between re-draws
        if (gameSpeed >= 110) {
            gameSpeed -= 15;
        } else if (gameSpeed > 75 && gameSpeed <= 105) {
            gameSpeed -= 5;
        } else if (gameSpeed > 60 && gameSpeed <= 75) {
            gameSpeed -= 2.5;
        } else if (gameSpeed > 50 && gameSpeed <= 60) {
            gameSpeed -= 1;
        };

        //secret message
        document.getElementById('secretMessage').innerHTML = "<p>Secret Message:   " + secret.substring(0,sm) + underscores.substring(0,((secret.length*2)-sm*2)) + "</p>";
        sm+=1;

    } else {
        // Remove the last part of snake body only if not eating food
        snake.pop();
    }

}

//FOOD AND SCORE//////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

//Get a random coordinate within canvas
function randomFood(min, max) {
    return Math.round((Math.random() * (max - min) + min) / snake_width) * snake_width;
}
//Generate food information, recursively. When snake eats food, the function runs again.
function generateFood() {
    food_x = randomFood(0, snakeboard.width - snake_width);
    food_y = randomFood(0, snakeboard.height - snake_width);
    snake.forEach(function has_snake_eaten_food(part) {
        //if a snake part has same coordinates as current food, then it has eaten the food
        const has_eaten = part.x == food_x && part.y == food_y;
        if (has_eaten) generateFood();
    });
}
//Actually draw the food
function drawFood() {
    snakeboard_ctx.fillStyle = '#50E3C2';
    snakeboard_ctx.strokestyle = '#50E3C2';
    snakeboard_ctx.fillRect(food_x, food_y, snake_width, snake_width);
    snakeboard_ctx.strokeRect(food_x, food_y, snake_width, snake_width);
    //Keep the $addition from going off the edge
    if (food_y <= 20) {
        //place above food
        document.getElementById('addition').style.top = food_y + "px";
    } else {
        //place below food
        document.getElementById('addition').style.top = (food_y - (snake_width * 3)) + "px";
    }
    if (food_x <= (snakeboard.width - 60)) {
        document.getElementById('addition').style.left = food_x + "px";
    } else {
        document.getElementById('addition').style.left = (food_x - 60) + "px";
    }

}

function calcInterest (base) {
    for (var i=1;i<=12;i++){
        base += monthlyPayment;
        base *= 1 + (interestRate/12);
    }
    return base;
}

//GAME END CHECK//////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

//Check for game-ending conditions – returns "true" if it hits itself or a wall
function gameEndCheck() {

    //Check if any of the snake parts have the same value as our snake head (meaning a collision with itself)... might change this later to make the snake just start on opposite wall
    for (let i = 4; i < snake.length; i++) {
        const has_collided = snake[i].x === snake[0].x && snake[i].y === snake[0].y
        if (has_collided)
            return true
    }

    //Check if the snake has hit any of the canvas edges
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > snakeboard.width - snake_width;
    const hitToptWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > snakeboard.height - snake_width;

    return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall
}

// END OF ROUND ///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

function endRound () {
    snakeboard_ctx.clearRect(0,0, snakeboard.width, snakeboard.height);

    //Hide and show certain things to start round 2
    additionDiv.classList.add('hidden');

    //This was part of restart menu -- for now, sticking with refresh button lol
    //startMenu.classList.remove('hidden');
    //startText.classList.add('hidden');
    //startBtn.innerHTML = "Restart"
    //document.getElementById('slideContainer').classList.add('hidden');
    //document.getElementById('slideInfo').classList.add('hidden');

    //if(roundsPlayed == 1) restartMenu.classList.remove('hidden');

    //Graph will be a certain px wide. Bar width will depend on number of years in array
    //A boolean. Eight bars will fit before barWidth minus 10px is 0px and we have to get rid of that gap.
    let barLimit = 1;
    let graphWidth = snakeboard.width*.75;
    let graphHeight = snakeboard.height*.35;
    yearlyArray.length<=(graphWidth/10) ? barLimit = 1 : barLimit = 0;

    //General variables for making graph
    let graphStartX = (snakeboard.width%(snakeboard.width*.75))/2;
    let graphStartY = snakeboard.height*.85;
    let numBars = yearlyArray.length;
    let barWidth = (graphWidth/numBars)-(10*barLimit);
    let ya = 0;
    var minimizeGraph = false;

    
    
    //Graph the yearly earnings...

    //Set Fill Style
    snakeboard_ctx.fillStyle = snake_color;

    for (ya; ya < numBars; ya++){

        //Create Bar, animate in to scale
        barHeight = yearlyArray[ya]/yearlyArray[numBars-1] * graphHeight;
        snakeboard_ctx.fillRect(graphStartX, graphStartY, barWidth, barHeight*-1);

        //Create values underneath. 
        //Create Value Text
        let barValueText = document.createElement("div");
        secretDiv.appendChild(barValueText)
        let divName = "value-" + ya;
        barValueText.innerHTML = "<p>$" + yearlyArray[ya] + "</p>";

        //Style it, to display under bar
        barValueText.style.position = "absolute";
        barValueText.style.top = graphStartY+10 + "px";
        barValueText.style.left = graphStartX + "px";
        barValueText.style.width = barWidth + "px";
        barValueText.style.textalign = "center";

        //Name it
        barValueText.setAttribute('id', divName);

        //If there are too many bars, the text will overlap so we have to limit them after a certain amount
        if (numBars> 10 && ya>0 && ya<(numBars-1)){
            //Hide all except first and last
            barValueText.classList.add('hidden');
            minimizeGraph = true;
        }

        graphStartX += barWidth+10;
    }

    //Add graph label once
    if(minimizeGraph){

        //Create label text
        let labelText = document.createElement("div");
        secretDiv.appendChild(labelText)
        let divNameLabel = "labelText";
        labelText.setAttribute('id', divNameLabel)
        labelText.innerHTML = "<p>Interest per Year</p>";

        //Style it, to display under bar
        labelText.style.position = "absolute";
        labelText.style.top = graphStartY+10 + "px";
        labelText.style.left = (snakeboard.width%(snakeboard.width*.75))/2 + "px"; //start of graph on left
        labelText.style.width = graphWidth + "px";
        labelText.style.textalign = "center";
}

}


// MAIN GAME ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

// Main game function, refreshes every 10ms on a recursive loop
function main() {

    //var startTime = performance.now();

    if (gameEndCheck()) {
        endRound();
        return;
    };

    changing_direction = false;

    setTimeout(function onTick() {
        clearCanvas();
        moveSnake();
        drawSnake();
        gameEndCheck();
        drawFood();
        // Call main again
        main();
    }, gameSpeed)
    
/*     var endTime = performance.now()

    console.log("Took " + (endTime-startTime).toFixed(3) + "miliseconds");
    console.log(gameSpeed)
 */

}

//ON-LOAD FUNCTIONS///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

//Initial Drawing
initiateBGCanvas();
//Generate Food Information (but don't draw it)
generateFood();



scoreDiv.innerHTML = "<p>Acct: $" + dollarUSLocale.format(Math.round(score)) + "</p>";
yearDiv.innerHTML = "<p>Year: " + year + "</p>";
additionDiv.classList.add('hidden');
additionDiv.innerHTML = "<p>+$" + addition + "</p>";


function runGame () {

    //Take rounds from -1 to 0 for first run
    roundsPlayed ++;

    snakeboard_ctx.clearRect(0,0, snakeboard.width, snakeboard.height)

    startMenu.classList.add('hidden');
    gameScore.classList.remove('hidden');
    document.getElementById('addition').classList.remove('hidden');

    main();

}

function restartGame () {

    //Initial Drawing
    initiateBGCanvas();
    //Generate Food Information (but don't draw it)
    generateFood();

    //restartMenu.classList.add('hidden');
    document.getElementById('addition').classList.remove('hidden');

    main();

}



