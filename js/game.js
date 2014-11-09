/* Version 1.1
 * Added createJS GUI
 * Noel Euzebe 300709334
 * Last Modified By: Noel Euzebe
 * Date Last Modified: 24th Oct 2014
 * ---------
 * game.js
 * Handles logic for the slot machine. Takes user input, spins reels,
 * and processes spin results and display.
 */
var stage;
var queue;

var stage_speed = 20;
var cloud_count = 3;
var tree_count = 2;

var clouds = [];
var trees = [];
var background;
var ground;
var character;
var coin;
var bullet;

var is_player_jumping = false;
var is_player_falling = false;
var jump_time = 1;
var jump_counter = 0;
var jump_speed = 25;

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
        { id: "bullet", src: "images/bullet.png"},
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

function handleTick(event) {
    updateBackground(event);
    updateClouds(event);
    updateCoin(event);
    updateBullet(event);
    updatePlayer(event);
    checkPlayerCoinCollision();
    checkPlayerBulletCollision();
    stage.update();
}

/*
 * setup()
 * sets up initial values for game data
 */
function setup()
{
           
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
        stage.addChild(clouds[i]); 
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
    coin.y = stage.canvas.height - (coin.image.height * 0.5) - (ground.image.height * 0.95) - character.image.height;                
    stage.addChild(coin);    
    
    bullet = new createjs.Bitmap(queue.getResult('bullet'));
    bullet.regX = bullet.image.width / 2;
    bullet.regY = bullet.image.height / 2;
    bullet.x = 60;
    bullet.y = stage.canvas.height - (bullet.image.height * 0.5) - (ground.image.height * 0.95);                
    stage.addChild(bullet);    
    
    
    this.document.onkeydown = keyPressed;
}

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

function updateBackground(event)
{
    var delta = event.delta / 1000;
    
    ground.x -= delta * stage_speed;
    
    if ( (ground.x) < 0)
        ground.x = stage.canvas.width / 2; 
}

function updateCoin(event)
{
    var delta = event.delta / 1000;
    
    coin.x -= delta * stage_speed * 3;
    
    if(coin.x + coin.image.width < 0)
        resetCoin();
}

function updateBullet(event)
{
    var delta = event.delta / 1000;
    
    bullet.x -= delta * stage_speed * 3;
    
    if(bullet.x + bullet.image.width < 0)
        resetBullet();
}

function resetCloud(cloud)
{
    cloud.x = stage.canvas.width + cloud.image.width;
    cloud.y = (Math.random() * (stage.canvas.height / 2)) ;
}

function resetCoin()
{
    coin.x = stage.canvas.width + coin.image.width;
}

function resetBullet()
{
    bullet.x = stage.canvas.width + bullet.image.width;
}


function keyPressed(event) {
    switch(event.keyCode) {
        case KEYCODE_SPACE:	            
                playerJump();
            break;
    }
    stage.update();
}

function updatePlayer(event)
{
    var delta = event.delta / 1000;
    if(is_player_jumping)
    {
        jump_counter += delta;
        if(jump_counter >= jump_time)
        {
            console.log('end jump');
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
            character.y += delta * jump_speed;
        }
    }
}

function playerJump()
{
    if(!is_player_jumping && !is_player_falling)
    {
        console.log('start jump');
        is_player_jumping = true;
        jump_counter = 0;        
        character.image = queue.getResult('character_jump');
        
    }
}

function distanceBetween(p1, p2)
{
    var result = 0;
    var xPoints = 0;
    var yPoints = 0;
    
    //console.log(p1);
    xPoints = p2.x - p1.x;
    xPoints = xPoints * xPoints;

    yPoints = p2.y - p1.y;
    yPoints = yPoints * yPoints;

    result = Math.sqrt(xPoints + yPoints);

    
    return result;    
}

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

function checkPlayerCoinCollision()
{
    if(checkCollision(character, coin))
        console.log('player and coin collided');
}

function checkPlayerBulletCollision()
{
    if(checkCollision(character, bullet))
        console.log('player and bullet collided');
}