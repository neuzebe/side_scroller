/* Version 1.0
 * Bootstrapped from SlotMachine code
 * Version 1.1
 * Added assets on screen
 * Version 1.2
 * Got on-screen assets moving and resetting
 * Version 1.3
 * Added player input, character jumps in response to input
 * Version 1.4
 * Added collision detection
 * Version 1.5
 * Added scoring and lives
 * Version 1.5
 * Added menu, playing and gameover state
 * Version 1.6
 * Refactored, cleaned up
 * Noel Euzebe 300709334
 * Last Modified By: Noel Euzebe
 * Date Last Modified: 10th Oct 2014
 * ---------
 * game.js
 .
 */
var stage;
var queue;

var stage_speed = 40;
var bullet_speed = 50;
var coin_speed = 35;

var cloud_count = 3;
var tree_count = 2;

var clouds = [];
var trees = [];
var background;
var ground;
var character;
var coin;
var bullet;
var life;

var MENU = 1;
var PLAYING = 2;
var GAME_OVER = 3;
var game_state = MENU;

var play_btn;
var help_btn;

var is_player_jumping = false;
var is_player_falling = false;
var jump_time = 0.75;
var jump_counter = 0;
var jump_speed = 135;
var fall_speed = 135;

var score = 0;
var score_text;
var lives = 3;
var lives_text;

var menu_text;
var game_over_text;
var title_text;

var KEYCODE_SPACE = 32;

/*
 * preload()
 * preloads all game assets
 */
function preload() {
    queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", init);
    queue.loadManifest([        
        { id: "background", src: "images/background.png"},
        { id: "ground", src: "images/ground.png"},
        { id: "cloud", src: "images/cloud.png"},
        { id: "character", src: "images/character.png"},
        { id: "character_jump", src: "images/character_jump.png"},
        { id: "coin", src: "images/coin.png"},
        { id: "help_button", src: "images/help.png"},
        { id: "life", src: "images/life.png"},
        { id: "play_button", src: "images/play_button.png"},
        { id: "bullet", src: "images/bullet.png"},
        { id: "damage", src: "sounds/damage.ogg"},
        { id: "mushroom", src: "sounds/powerup.ogg"},
        { id: "yahoo", src: "sounds/yahoo.ogg"},
        { id: "gameover", src: "sounds/gameover.ogg"},
        { id: "tree", src: "images/tree.png"}
    ]);
}

/*
 * init()
 * sets up the stage and calls other initial functions
 */
function init() {
    stage = new createjs.Stage(document.getElementById("canvas"));
    stage.enableMouseOver(20);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", handleTick);    
    gameStart();
    setup();
}


/*handleTick
 * 
 * @param {type} event
 * @returns {undefined}
 * called every frame, used to update the stage
 */
function handleTick(event) {
    
    switch(game_state)
    {
        case MENU:
            showMenu();
            break;
        case PLAYING:   
            updateBackground(event);            
            updateCoin(event);
            updateBullet(event);
            updatePlayer(event);
            checkPlayerCoinCollision();
            checkPlayerBulletCollision();            
            break;
        case GAME_OVER:
            showGameOver();
            break;
    }

    stage.update();
}

/*
 * gameStart()
 * sets up the User interface, places the background inmages as well as buttons
 * responsible for creating event handlers
 */
function gameStart() {
    // Add code here
    // Some example code here - to be replaced
    background = new createjs.Bitmap(queue.getResult('background'));
    background.regX = background.image.width / 2;
    background.regY = background.image.height / 2;
    background.x = stage.canvas.width / 2;
    background.y = stage.canvas.height / 2;                
    stage.addChild(background);
      
    ground = new createjs.Bitmap(queue.getResult('ground'));
    ground.regX = ground.image.width / 2;
    ground.regY = ground.image.height / 2;
    ground.x = stage.canvas.width / 2;
    ground.y = stage.canvas.height - (ground.image.height * 0.5);                
    
    
    for(var i = 0; i < cloud_count; i++)
    {
        clouds[i] = new createjs.Bitmap(queue.getResult('cloud'));
        clouds[i].regX = clouds[i].image.width / 2;
        clouds[i].regY = clouds[i].image.height / 2;
        clouds[i].y = (Math.random() * (stage.canvas.height / 2));
        clouds[i].x = (Math.random() * (stage.canvas.width)) + 1;                
         
    }
    
    for(var i = 0; i < tree_count; i++)
    {
        trees[i] = new createjs.Bitmap(queue.getResult('tree'));
        trees[i].regX = trees[i].image.width / 2;
        trees[i].regY = trees[i].image.height / 2;
        trees[i].y = stage.canvas.height - (trees[i].image.height * 0.5) - (ground.image.height * 0.95);
        trees[i].x = (Math.random() * (stage.canvas.width)) + 1;                
        stage.addChild(trees[i]);         
    }

    stage.addChild(ground);
    
    character = new createjs.Bitmap(queue.getResult('character'));
    character.regX = character.image.width / 2;
    character.regY = character.image.height / 2;
    character.x = 60;
    character.y = stage.canvas.height - (character.image.height * 0.5) - (ground.image.height * 0.95);                
    stage.addChild(character); 
    
    coin = new createjs.Bitmap(queue.getResult('coin'));
    coin.regX = coin.image.width / 2;
    coin.regY = coin.image.height / 2;
    coin.x = 60;
    coin.y = stage.canvas.height - (coin.image.height * 0.85) - (ground.image.height * 0.95) - character.image.height;                
    stage.addChild(coin);    
    
    life = new createjs.Bitmap(queue.getResult('life'));
    life.regX = life.image.width / 2;
    life.regY = life.image.height / 2;
    life.x = stage.canvas.width - 150;
    life.y = stage.canvas.height - 25;     
    stage.addChild(life);      
    
    bullet = new createjs.Bitmap(queue.getResult('bullet'));
    bullet.regX = bullet.image.width / 2;
    bullet.regY = bullet.image.height / 2;
    bullet.x = stage.canvas.width + bullet.image.width;
    bullet.y = stage.canvas.height - (bullet.image.height * 0.5) - (ground.image.height * 0.95);                
    stage.addChild(bullet);    
    
    score_text = new createjs.Text("Score: " + score, "bold 24px Arial", "#000000");
    score_text.x = 30;
    score_text.y = stage.canvas.height - 35;     
    stage.addChild(score_text);
    
    lives_text = new createjs.Text("x" + lives, "bold 24px Arial", "#000000");
    lives_text.x = stage.canvas.width - 130;
    lives_text.y = stage.canvas.height - 35;     
    stage.addChild(lives_text);    
    
    
    play_btn = new createjs.Bitmap(queue.getResult('play_button'));
    play_btn.regX = play_btn.image.width / 2;
    play_btn.regY = play_btn.image.height / 2;
    play_btn.x = stage.canvas.width / 2;
    play_btn.y = stage.canvas.height / 2 ; 
    stage.addChild(play_btn);    
    
    play_btn.on('rollover', function(){play_btn.alpha = 0.5;});
    play_btn.on('rollout', function(){play_btn.alpha = 1;});
    play_btn.on('click', function(){ playGame();});
    
    menu_text = new createjs.Text("Press SPACE to jump!\nGet points by capturing the Pokeballs \nbut make sure to dodge the bullets.", "bold 24px Arial", "#ffffff");
    menu_text.x = 50;
    menu_text.y =  105;     
    stage.addChild(menu_text); 
    
    game_over_text = new createjs.Text("GAME OVER!\n Your Score is " + score, "bold 24px Arial", "#ffffff");
    game_over_text.x = 50;
    game_over_text.y =  105;  
    
    title_text = new createjs.Text("The Dark Knight's Gotta Catch Em All", "bold 24px Arial", "#ffff00");
    title_text.x = 50;
    title_text.y =  30;     
    stage.addChild(title_text);   
            
    this.document.onkeydown = keyPressed;
}


/*
 * updateClouds
 * called every frame and updates the position of the clouds
 * resets them when they go off screen
 */
function updateClouds(event)
{
    var delta = event.delta / 1000;
    
    for(var i = 0; i < cloud_count; i++)
    {
        clouds[i].x -= delta * stage_speed;
        if(clouds[i].x + clouds[i].image.width < 0)
            resetCloud(clouds[i]);
    }
}

/*
 * updateTrees
 * called every frame to update the position of the trees on the stage
 * resets them when they leave the screen
 */
function updateTrees(event)
{
    var delta = event.delta / 1000;
    
    for(var i = 0; i < tree_count; i++)
    {
        trees[i].x -= delta * stage_speed;
        if(trees[i].x + trees[i].image.width < 0)
            resetTree(trees[i]);
    }
}


/*
 * updateBackground
 * used to update the ground every frame, resets it once
 * it moves more than halfway across the screen
 * calls updateTrees and updateCloud
 */
function updateBackground(event)
{
    var delta = event.delta / 1000;
    
    ground.x -= delta * stage_speed;
    
    if ( (ground.x) < 0)
        ground.x = stage.canvas.width / 2; 
    updateTrees(event);
    updateClouds(event);
}

/*
 * updateCoin
 * moves the PokeBall across the screen, resets it when it leaves the screen
 */
function updateCoin(event)
{
    var delta = event.delta / 1000;
    
    coin.x -= delta * coin_speed * 3;
    
    if(coin.x + coin.image.width < 0)
        resetCoin();
}

/*
 * updateBullet
 * controls the movement of the bullet on the screen
 * used to reset the bullet's position when it leaves the viewable area
 */
function updateBullet(event)
{
    var delta = event.delta / 1000;
    
    bullet.x -= delta * bullet_speed * 3;
    
    if(bullet.x + bullet.image.width < 0)
        resetBullet();
}

/*
 * resetCloud
 * resets the cloud's position after it leaves the screen
 */
function resetCloud(cloud)
{
    cloud.x = stage.canvas.width + cloud.image.width;
    cloud.y = (Math.random() * (stage.canvas.height / 2)) ;
}

/*
 * resetTree
 * resets the tree's position once it leaves the screen
 */
function resetTree(tree)
{
    tree.x = stage.canvas.width + tree.image.width;    
}

/*
 * resetCoin
 * resets the coin when it leaves the screen or the player collects it
 * adjusts the movement speed of the coin each time 
 */
function resetCoin()
{
    coin.x = stage.canvas.width + coin.image.width;
    coin_speed = Math.random() * 25 + 45;
}

/*
 * resetBullet
 * reset the position and changes the speed of the bullet every time it 
 * leaves the screen or collides with the player
 */
function resetBullet()
{
    bullet_speed = Math.random() * 30 + 60;
    bullet.x = stage.canvas.width + bullet.image.width;
    
}

/*
 * event listener for key events
 * used to listen for and process the spacebar being pressed
 */
function keyPressed(event) {
    switch(event.keyCode) {
        case KEYCODE_SPACE:	            
                playerJump();
            break;
    }
    stage.update();
}

/*
 * called every frame
 * handles the player jumping and falling
 */
function updatePlayer(event)
{
    var delta = event.delta / 1000;
    if(is_player_jumping)
    {
        jump_counter += delta;
        if(jump_counter >= jump_time)
        {            
            jump_counter = 0;
            is_player_jumping = false;
            is_player_falling = true;                                             
        }
        else
        {
            character.y -= delta * jump_speed;
        }
    }    
    else if(is_player_falling)
    {
        jump_counter += delta;
        if(jump_counter >= jump_time)
        {
            is_player_falling = false;
            jump_counter = 0;
            character.image = queue.getResult('character');
        }
        else
        {
            character.y += delta * fall_speed;
        }
    }
}

/*
 * playerJump
 * used to determine whether the player is in a state that allows him or her
 * to jump
 */
function playerJump()
{
    if(!is_player_jumping && !is_player_falling)
    {        
        is_player_jumping = true;
        jump_counter = 0;        
        character.image = queue.getResult('character_jump');
        
    }
}


/*
 * distanceBetween(point1, point2)
 * utility function to calculate the distance between two objects
 * on the stage
 */
function distanceBetween(p1, p2)
{
    var result = 0;
    var xPoints = 0;
    var yPoints = 0;
        
    xPoints = p2.x - p1.x;
    xPoints = xPoints * xPoints;

    yPoints = p2.y - p1.y;
    yPoints = yPoints * yPoints;

    result = Math.sqrt(xPoints + yPoints);
   
    return result;    
}


/*
 * checkCollision(object_one, object_two)
 * utility function to determine whether two on-stage objects
 * are colliding
 */
function checkCollision(object_one, object_two)
{
    var p1 = new createjs.Point();
    var p2 = new createjs.Point();
    p1.x = object_one.x;
    p1.y = object_one.y;
    p2.x = object_two.x;
    p2.y = object_two.y;
    
    return (distanceBetween(p1, p2) < ((object_one.image.height/2) + (object_two.image.height/2)));
}


/*
 * checks to see if the player has collected a pokeball
 * and handles the score increase and sound effects if so
 */
function checkPlayerCoinCollision()
{
    if(checkCollision(character, coin))
    {                
        createjs.Sound.play("yahoo");        
        
        score += 50;
        if(score % 500 === 0)
        {
             createjs.Sound.play("mushroom");
            lives++;
        }
        
        updateText();
        resetCoin();
    }
}

/*
 * updateText
 * utility function to refresh the text display on screen
 */

function updateText()
{
    score_text.text = "Score: " + score;
    lives_text.text = "x" + lives;
}

/*
 * checkPlayerBulletCollision
 * checks to see if the player has collided with the bullet
 * deducts life and plays apt sound effect in such an event
 */
function checkPlayerBulletCollision()
{
    if(checkCollision(character, bullet))
    {           
        createjs.Sound.play("damage");
        if(lives === 0)
        {            
            game_state = GAME_OVER;
            createjs.Sound.play("gameover");
            showGameOver();
        }
        else
            lives--;
        
        updateText();
        resetBullet();
    }
}

function showMenu()
{
                   
}

/*
 * showGameOver()
 * called when the player's lives run out
 * shows the game over text
 */
function showGameOver()
{   
    for(var i = 0; i < cloud_count; i++)
        stage.removeChild(clouds[i]);    
    
    game_over_text.text = "GAME OVER!\n Your Score is " + score;
    stage.addChild(play_btn);
    stage.addChild(game_over_text);
}

/*
 * playGame
 * called when the play button is called
 * removes menu/game over text, updates the game state
 * resets the score and life display, and resets the bullet and pokeball
 */

function playGame()
{
    stage.removeChild(play_btn);
    stage.removeChild(menu_text);
    stage.removeChild(game_over_text);
    stage.removeChild(title_text);
    score = 0;
    lives = 3;
    
    updateText();
    resetBullet();
    resetCoin();
    game_state = PLAYING;
    
    for(var i = 0; i < cloud_count; i++)
        stage.addChild(clouds[i]);
}
