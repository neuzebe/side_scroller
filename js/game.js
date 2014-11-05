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
var game;
var outcome;

var reels = [
    ['blastoise', 'mew', 'pidgey', 'rattata', 'charizard', 'mewtwo'],
    ['mew', 'rattata', 'blastoise', 'mewtwo', 'pidgey', 'charizard'],
    ['charizard', 'mewtwo', 'mew', 'blastoise', 'rattata', 'pidgey'],
    ['rattata', 'charizard', 'blastoise', 'mew', 'pidgey', 'mewtwo'],
    ['mewtwo', 'blastoise', 'mew', 'pidgey', 'charizard', 'rattata']
];

var reel_images = [];
var bet_100_btn, bet_50_btn, bet_10_btn, spin_btn, exit_btn, reset_btn;
var display_money, display_turn, display_wins, display_bet, display_jackpot, display_winnings;
    
 var y_offset = 110;  
 var reel_start_y = 100;
 
 var x_offset = 115;
 var reel_start_x = 170;

/*
 * showStats()
 * updates the canvas GUI with all of the player stats
 */
function showStats()
{  
    stage.removeChild(display_money);
    stage.removeChild(display_bet);
    stage.removeChild(display_wins);
    stage.removeChild(display_winnings);
    stage.removeChild(display_jackpot);
    
    display_money = new createjs.Text("Bal: $" + game.player_money, "bold 24px Arial", "#ffffff");
    display_money.x = 30;
    display_money.y = stage.canvas.height - 75; 
    
    display_bet = new createjs.Text("Bet: $" + game.bet, "bold 24px Arial", "#ffffff");
    display_bet.x = 255;
    display_bet.y = stage.canvas.height - 75;
    
    display_wins = new createjs.Text("Wins: " + game.wins, "bold 24px Arial", "#ffffff");
    display_wins.x = 445;
    display_wins.y = stage.canvas.height - 75;    
        
    display_winnings = new createjs.Text("Won: $" + game.winnings, "bold 24px Arial", "#ffffff");
    display_winnings.x = 620;
    display_winnings.y = stage.canvas.height - 75;    
    
    display_jackpot = new createjs.Text("JACKPOT: $" + game.jackpot, "bold 32px Arial", "#ff7700");
    display_jackpot.y = 10;
    display_jackpot.x = 250;
    
    stage.addChild(display_money);
    stage.addChild(display_bet);
    stage.addChild(display_wins);
    stage.addChild(display_winnings);
    stage.addChild(display_jackpot);           
}


/*
 * spin()
 * main functionality exists here
 * generates the random rolls for the reel spins,
 * assigns roll results and calculates outcomes
 */
function spin()
{        
    if(game.bet > game.player_money)        
        alert("You too broke for this game son!");                                
    else if(!(game.bet > 0))        
        alert("You need to specify a valid bet amount");        
    else
    {
        createjs.Sound.play("spin_wheel");
        clearReel();
        outcome.reset();
        game.winnings = 0;
        game.player_money -= game.bet;
        game.turn++;

        var spins = [];
        var result = [];

        for(var i = 0; i < 5; i++)
        {
            //generate the random reel spin
            spins[i] = Math.floor((Math.random() * 6));                        
            result[i] = reels[i][spins[i]];   
            
            //check to see what are the outcomes of the reel spins
            if(result[i] === "blastoise")
            {
                outcome.blastoise++;
            }
            else if(result [i] === "charizard")
            {
                outcome.charizard++;
            }
            else if(result [i] === "mewtwo")
            {
                outcome.mewtwo++;
            }
            else if(result [i] === "mew")
            {
                outcome.mew++;
            }
            else if(result[i] === "pidgey")
            {
               outcome.pidgey++; 
            }
            else
            {
                outcome.rattata++;
            }
        }

        checkWinnings();        
        showResults(spins);
        showStats();
    }
}

/*
 * bet(amount)
 * takes a bet amount from the bet button clicked by the user
 * verifies the user has enough credit to bet that much
 */
function bet(amount)
{
    if(amount <= game.player_money)
    {
        game.bet = amount;
        createjs.Sound.play("bet");
    }
    else
        alert("You don't have enough money to bet this high");
    
    showStats();
}


/*
 * checkWinnings()
 * called after the reel spins to evaluate whether or not the player has won any money
 */
function checkWinnings()
{
    //if there are no rattatas in the roll, then the player at least collects his
    //bet amount back
    if(outcome.rattata === 0)
    {
        createjs.Sound.play("win");        
        game.wins++;
        game.winnings += game.bet;
        
        //based on the rarity and the frequency of the symbols in the roll,
        //the player's winnings are increased
        if(outcome.pidgey === 3)
            game.winnings += game.bet * 10;
        else if(outcome.pidgey === 4)
            game.winnings += game.bet * 15;
        else if(outcome.pidgey === 5)
            game.winnings += game.bet * 20;
        else if(outcome.blastoise === 3 || outcome.charizard === 3)
            game.winnings += game.bet * 20;
        else if(outcome.blastoise === 4 || outcome.charizard === 4)
            game.winnings += game.bet * 30;  
        else if(outcome.blastoise === 5 || outcome.charizard === 5)
            game.winnings += game.bet * 50;        
        else if(outcome.mew === 3 || outcome.mewtwo === 3)
            game.winnings += game.bet * 40;
        else if(outcome.mew === 4 || outcome.mewtwo === 4)
            game.winnings += game.bet * 60;                      
        else if(outcome.mewtwo === 5)
            game.winnings += game.bet * 80;
        else if(outcome.mew === 5)
            game.winnings += game.bet * 100;

        game.player_money += game.winnings;
        checkJackpot();
    }
}

/*
 * checkJackpot()
 * called once the player has won, gives the player a slight chance at winning the
 * big jackpot
 */
function checkJackpot()
{
    var jackPotTry = Math.floor(Math.random() * 51 + 1);
    var jackPotWin = Math.floor(Math.random() * 51 + 1);
    if (jackPotTry === jackPotWin) {
        alert("You Won the $" + game.jackpot + " Jackpot!!");
        game.player_money += game.jackpot;
        //double the jackpot for even greater winnings in the future
        game.jackpot *= 2;
        createjs.Sound.play("jackpot");
        showStats();
    }
}

/*
 * showResults(spins)
 * takes the spin results and displays the corresponding symbols in the correct
 * reels
 */
function showResults(spins)
{
    var index = 0;
    for(var i = 0; i < reels.length; i++) //across
    {                
        for(var x = spins[i]-1, count = 0; count < 3; x++, count++)//down
        {            
            //effectively link the last item of the reel to the first
            if(x < 0)
                x = reels[i].length-1;
            else if(x > reels[i].length-1)
                x = 0;
            
            //based on each image's specific indices, display in correct position
            //position calculated with x offset based on the reel and y offset based
            //on order in its reel
            
            reel_images[index] = new createjs.Bitmap(queue.getResult(reels[i][x]));
            reel_images[index].regX = reel_images[index].image.width / 2;
            reel_images[index].regY = reel_images[index].image.height / 2;
            reel_images[index].x = reel_start_x + (i * x_offset);
            reel_images[index].y = reel_start_y + (count * y_offset);                
            stage.addChild(reel_images[index]);                          
            index++;
        }
    }   
}

/*
 * reset(0)
 * resets the game stats
 */
function reset()
{          
    outcome.reset();
    game.reset();
    $("#result").empty();
    clearReel();
    showStats();
}

/*
 * clearReel()
 * removes all symbols from the reels
 */

function clearReel()
{
    for(var i = 0; i < reel_images.length; i++)
        stage.removeChild(reel_images[i]);
}

/*
 * quit()
 * quits the game, redirects to google homepage
 */
function quit()
{
   window.location = "http://www.google.ca";
}

/*
 * preload()
 * preloads all game assets
 */
function preload() {
    queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", init);
    queue.loadManifest([        
        { id: "slot_machine", src: "images/slots.png"},
        { id: "blastoise", src: "images/blastoise.png"},
        { id: "charizard", src: "images/charizard.png"},
        { id: "pidgey", src: "images/pidgey.png"},
        { id: "mewtwo", src: "images/mewtwo.png"},
        { id: "mew", src: "images/mew.png"},
        { id: "rattata", src: "images/rattata.png"},
        { id: "bet_10", src: "images/bet10.png"},
        { id: "bet_50", src: "images/bet50.png"},
        { id: "bet_100", src: "images/bet100.png"},
        { id: "spin", src: "images/spin.png"},
        { id: "exit", src: "images/exit.png"},
        { id: "reset", src: "images/reset.png"},
        { id: "spin_wheel", src: "sounds/spin.ogg" },
        { id: "win", src: "sounds/win.ogg" },
        { id: "bet", src: "sounds/bet.ogg" },
        { id: "jackpot", src: "sounds/jackpot.ogg" }
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
    stage.update();
}

/*
 * setup()
 * sets up initial values for game data
 */
function setup()
{
    game = {
        jackpot: 500,
        player_money: 1000,
        winnings: 0,
        bet: 0,
        turn: 0,
        wins: 0,
        reset: function()
        {
            this.jackpot = 500;
            this.player_money = 1000;
            this.winnings = 0;
            this.bet = 0;
            this.turn = 0;
            this.wins = 0;
        }
    };
    
    outcome = {
            rattata: 0,
            pidgey: 0,
            golem: 0,
            charizard: 0,
            blastoise: 0,
            mewtwo: 0,
            mew: 0,
            reset: function(){
                this.rattata = 0;
                this.pidgey = 0;
                this.golem = 0;
                this.charizard = 0;
                this.blastoise = 0;
                this.mew = 0;
                this.mewtwo = 0;
            }
        };    
        
     $("#place_bet").val(0);    
    showStats();        
}

/*
 * gameStart()
 * sets up the User interface, places the background inmages as well as buttons
 * responsible for creating event handlers
 */
function gameStart() {
    // Add code here
    // Some example code here - to be replaced
    var slot_machine_background = new createjs.Bitmap(queue.getResult('slot_machine'));
    slot_machine_background.regX = slot_machine_background.image.width / 2;
    slot_machine_background.regY = slot_machine_background.image.height / 2;
    slot_machine_background.x = stage.canvas.width / 2;
    slot_machine_background.y = stage.canvas.height / 2;                
    stage.addChild(slot_machine_background);
    
    bet_10_btn = new createjs.Bitmap(queue.getResult('bet_10'));
    bet_10_btn.regX = bet_10_btn.image.width / 2;
    bet_10_btn.regY = bet_10_btn.image.height / 2;
    bet_10_btn.x = 105;
    bet_10_btn.y = stage.canvas.height - 26;                
    stage.addChild(bet_10_btn);

    bet_50_btn = new createjs.Bitmap(queue.getResult('bet_50'));
    bet_50_btn.regX = bet_50_btn.image.width / 2;
    bet_50_btn.regY = bet_50_btn.image.height / 2;
    bet_50_btn.x = 300;
    bet_50_btn.y = stage.canvas.height - 26;                 
    stage.addChild(bet_50_btn);
    
    bet_100_btn = new createjs.Bitmap(queue.getResult('bet_100'));
    bet_100_btn.regX = bet_100_btn.image.width / 2;
    bet_100_btn.regY = bet_100_btn.image.height / 2;
    bet_100_btn.x = 495;
    bet_100_btn.y = stage.canvas.height - 26;                 
    stage.addChild(bet_100_btn);
    
    spin_btn = new createjs.Bitmap(queue.getResult('spin'));
    spin_btn.regX = spin_btn.image.width / 2;
    spin_btn.regY = spin_btn.image.height / 2;
    spin_btn.x = 690;
    spin_btn.y = stage.canvas.height - 26;                 
    stage.addChild(spin_btn);   
    
    exit_btn = new createjs.Bitmap(queue.getResult('exit'));
    exit_btn.regX = exit_btn.image.width / 2;
    exit_btn.regY = exit_btn.image.height / 2;
    exit_btn.x = stage.canvas.width - 26;
    exit_btn.y = 20;                 
    stage.addChild(exit_btn); 
        
    reset_btn = new createjs.Bitmap(queue.getResult('reset'));
    reset_btn.regX = reset_btn.image.width / 2;
    reset_btn.regY = reset_btn.image.height / 2;
    reset_btn.x = stage.canvas.width - 70;
    reset_btn.y = 20;                 
    stage.addChild(reset_btn);    
    
    spin_btn.on("click", function(){spin();});
    exit_btn.on("click", function(){quit();});
    reset_btn.on("click", function(){reset();});
    bet_10_btn.on("click", function(){bet(10);});
    bet_50_btn.on("click", function(){bet(50);});
    bet_100_btn.on("click", function(){bet(100);});
    
}
