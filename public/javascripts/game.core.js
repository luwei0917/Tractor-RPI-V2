//This is the baby of Wei Lu

//Mon 7:31pm
//4/14 8:28pm
DECK_NUM = 2;
SUIT_NUM = 4;
VALUE_NUM = 13;
JOKER_NUM =2;
ALL_SUIT =['jokers','spades','hearts','diamonds','clubs'];
function Card(my_suit,my_value){
    this.suit = my_suit;
    this.value = my_value;
}

function playerProperty(players){
    for(var i = 0 ;i < players.length; i++){
        players[i].cards = [];
        players[i].suit = new Array(4);
        for(var j =0 ;j<ALL_SUIT.length ; j++){
            players[i].suit[j] = [];
        }
        players[i].points = 0;  //point is for this game
        players[i].score = 2;   //score is for the whole game
        players[i].declarer = -1;  // 0 is false, 1 is true, -1 is undefined.
        //players[i].mynum = -1;
    }
}
function shuffle(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

function Deck(){
    var deck = [];

    for(var i = 0; i <DECK_NUM; i++ ){
        for ( var j = 1 ; j<= SUIT_NUM; j++){
            for( var k =0 ; k < VALUE_NUM ; k++){
                deck.push(new Card(ALL_SUIT[j],k+1))
            }
        }
        for( var j =0; j < JOKER_NUM ; j ++){
            deck.push(new Card(ALL_SUIT[0],j+1))
        }
    }
    shuffle(deck);
    return deck;
}

function GameInfo(){
    this.dominantSuit = 'unknown';
    this.dominantRank = 2;
    //this.starter = -1; //should be one of player 0 to 3
    this.tempPos = -1;
    this.count = -1;
    this.cardsLeft = -1;
    this.firstgame = false;  //should initial as true
    this.dealer = -1;
    this.leader = -1;
    this.currentPlayer = -1;
    this.highCombination = [];
    this.nextRoundLeader = -1;
    this.roundRule = 'unknown';
    this.kitty = [];

}

function Dealing(players,gameInfo){
    debug('Start Dealing');
    var deck = Deck();
    debug('deck length is ' + deck.length);
    var i = gameInfo.dealer;
    for(var j = 0;j < 4; j++){
        players[j].on('DominantSuitIn',function(card){
            //TODO: some checking
            gameInfo.dominantSuit = card.suit;
            debug('dominantSuit now is ' + gameInfo.dominantSuit);
        })
    }
    next(deck,i,players,gameInfo);

}


function next(deck,i,players,gameInfo){
    //debug(deck.length);
    if(deck.length>8){
        var card = deck.shift();
        sendCard(card,players[i], gameInfo.dominantRank,function(result){
            i++;
            i = i%4;
            next(deck,i,players,gameInfo);
        })
    }
    else{
        //all give to the dealer
        var j = gameInfo.dealer;
        //check
        if(j != i){
            debug('1bad');
            debug('j is ' +j + ' i is ' + i);
        }

        for(var i =0;i<deck.length;i++){
            addCard(players[j],deck[i]);
        }

        for(var i =0 ;i<4 ;i++){
            updateHand(players[i]);
            players[i].emit('DealDone');
            //In the first round, every team starts with a score of 2.
            // For teams are not separated into Declarers or Opponents yet,
            // players should reveal any "2" card from the cards he drew as quickly as possible;
            // the first to do so will instantly become the Dealer.
            // His team will thus become the Declarers while the other team will become the Opponents.
            players[i].emit('sysInfo','Wait for dealer to do kitty');
        }
        //updateHand(players[j]);
        //sortCards(players);
        debug('Dealing Done');
        //wait for dealer to do kitty;
        kitty(players[j],gameInfo,players);


    }
}

function addCard(player,card){
    var num = 0;
    var done = false;
    for(var i =0 ;i< ALL_SUIT.length;i++){
        if(ALL_SUIT[i] === card.suit){
            player.suit[i].push(card);
            player.suit[i].sort(function(a,b){
                if(a.suit === 'jokers'){
                    return b.value - a.value
                }
                if (a.value === 1){
                    return false;
                }
                else if (b.value === 1){
                    return true;
                }
                else{
                    return b.value - a.value
                }
            });
            var temp = find(player,card);
            num += temp[1];
            done = true;

        }
        else{
            if(done === false){
                num += player.suit[i].length;
            }
        }
    }
    player.emit('newcard',card,num);

}

function sendCard(card,player,dominantRank,callback){
    addCard(player,card);

    var time = 0.01*1000;  // 0.01s
    //var time = 0.25*1000;
    var IsDominantSuit = false;
    if(card.value === dominantRank && card.suit != 'jokers'){
        player.emit('declaration');
        //player.broadcast.to(player.game).emit('declarationOff');
        //time = 0.5*1000 //10s;
        IsDominantSuit = true;
    }
    else{
        //player.emit('declarationOff');
    }

    setTimeout(function() {
        callback(IsDominantSuit); }, time);
}


function find(player,target){
    for(var i = 0; i< 5; i++){
        if(ALL_SUIT[i] === target.suit){
            for(var j =0 ;j< player.suit[i].length ; j++){
                if(target.value === player.suit[i][j].value){
                    return [i,j];
                }
            }
        }
    }
    return [-1,-1];
}

function debug(message){
    console.log(message +'---------------------------------');
}


function nextPlayer(i){
    return (i+1)%4;
}

function playing(players,gameInfo){
    //The Dealer leads the first trick with any single card or combinations of cards, and the game proceeds like most trick-taking games,
    // where players take turn to play their cards in a counter-clockwise direction,
    // and the player who plays the highest-ordered card or combination of cards take the trick and leads the next round.
    // All cards taken by the Declarers may be discarded for the rest of the round;
    // point cards taken by the Opponents count towards their number of points collected,
    // and should be kept, but other cards may be similarly discarded.

    console.log('OK. please start your trick');
    var done = false;

    gameInfo.count = 0;

    var pos = gameInfo.dealer;
    gameInfo.currentPlayer = gameInfo.dealer;
    var player = players[pos];
    player.emit('go');
    player.broadcast.to(player.game).emit('stop');
    var n = 0;
    while( n < 4){
        n++;
        var player = players[pos];

        pos = nextPlayer(pos);
        player.on('usecard', function(result) {
            var player = players[gameInfo.currentPlayer];
            debug('gamecore:: ' + player.userid );
            var cardsCombination = [];
            for(var i = 0; i< result.length ; i++){
                //result[i].value = parseInt(result[i].value);
                var temp = new Card(result[i].suit, result[i].value);
                cardsCombination.push(temp);
                console.log( ' used card ' + temp.suit + ' ' + temp.value);
            }
            //cardsCombination.push(oneCard);
            var isLegal = deleteHand(player , cardsCombination,gameInfo);  // -1 means not legal
            // if want he want to play is not legal. Tell him.
            //deleteHand(player , cardsCombination);
            if (isLegal === -1){
                players[i].emit('DoAgain');
            }
            else{
                //debug(5);
                updateHand(player);
                player.broadcast.to(player.game).emit('otherTricks',result,gameInfo.currentPlayer);
                player.emit('otherTricks',result,gameInfo.currentPlayer);

                player.emit('stop');
                //next
                gameInfo.count++;
                if(gameInfo.count === 4){
                    // new
                    gameInfo.count = 0;
                    gameInfo.currentPlayer = gameInfo.leader;
                }
                else if(gameInfo.count < 4){
                    gameInfo.currentPlayer =nextPlayer(gameInfo.currentPlayer);
                }
                var myPos = gameInfo.currentPlayer;
                players[myPos].emit('go');

            }
        })
    }
}


function isConsecutivePair(cardCombination,gameInfo){
    //is Consecutive Pair

}

function isOnePair(cardCombination,gameInfo){
    //is one pair

}
function isTwoPair(cardCombination,gameInfo){
    //is two pair

}
function isThirdPair(cardCombination,gameInfo){
    //is third pair

}

function isSingle(cardCombination, gameInfo){

}

function checkRules(cardCombination, gameInfo){
    //Are you the leader?
    if(gameInfo.currentPlayer === gameInfo.leader){
        //A lead may be of one of four types, each with different rules dealing with what can be played on it.
        // As a rule of thumb, when any card or combination of cards is lead, other players must always follow the number of card(s) played.

        //Single or double cards
        //Any single card may be lead. Players must follow suit if they have cards in the same suit;
        // if a trump card is lead, other players must play a trump card, if they still have any.
        // The highest trump, or, if no trump is played, the highest-ordered card of the suit lead takes the trick.
        // In case of ties, the first highest card played wins the trick.
        if(isSingle(cardsCombination,gameInfo)){

        }
        //Only two identical cards are considered doubles, so two different-suited trump rank cards,
        // two ordinary non-trump cards with the same value, or a combination of a Red Joker and a Black Joker are not counted.
        // For example, if 7♣ is trump, 7♠-7♥, or Q♠-Q♦ are not considered doubles despite them being of equal rank (or in the first case, both in the trump suit).
        else if(isOnePair(cardsCombination,gameInfo)){

        }
        //For double cards lead, other players must also follow suit with double cards, if they have;
        // for players who do not have double cards in the suit lead, they may either play separate cards in the same suit,
        // any two cards from other suits, or a double from the trump suit to ruff the trick. In this case, the highest-ordered trump doubles,
        // if they are played, wins the trick; otherwise the highest-ordered doubles in the suit lead wins.
        // Two singles may not beat a double even if they are both higher-ordered than the double (for trump 7♣, 9♦-9♦ beats J♦-Q♦ or even J♣-Q♣, if diamond doubles were led).
    }

}

function deleteHand(player,cardsCombination,gameInfo){
    console.log(cardsCombination);
    //console.log(player.cards);

    // first make sure you have the cards you want to play
    var cardsPosition = [];  // store the position of the cards in my hands
    for(var i = 0; i<cardsCombination.length; i++){
        var index = find(player,cardsCombination[i]);
        if(index[0] === -1){
            debug('not found');
            return -1;  // card not exists
        }
        cardsPosition.push(index);
    }
    //check
    //check all the rules, make sure it's legal
    checkRules(cardsCombination,gameInfo);
//    this.dominantSuit = 'unknown';
//    this.dominantRank = 2;
//    this.dealer = -1;
//    this.leader = -1;

    var dominantSuit = gameInfo.dominantSuit;  //trump
    var dominantRank = gameInfo.dominantRank;


    //it's legal, so delete the cards in my hands.
    for(var i =0;i<cardsCombination.length;i++){
        var index = find(player,cardsCombination[i]);
        player.suit[index[0]].splice(index[1],1);
        //console.log(player.cards);
        //console.log(index);
        //console.log('length '+ player.cards.length);
        debug('deletedone');

    }
    return 1;  //means good
}




function updateHand(player){
    player.cards = [];
    for(var i = 0; i< ALL_SUIT.length; i++){
        for(var j =0 ; j< player.suit[i].length; j++){
            player.cards.push(player.suit[i][j])
        }
    }
    //console.log(player.cards);
    //console.log(player.suit[0]);
    player.emit('updateHand', player.cards);
}



function updateScore(players){

}


function kitty(player,gameInfo,players){
    //Drawing continues until everyone has drawn 25 cards and a pool of reserve cards (usually consisting of about 8 cards), remains.
    // The Dealer then picks up all the cards, integrates them into his hand,
    // and then discards the same number of cards into a pile in the center, known as the kitty.
    // These cards are kept unopened throughout the duration of that round and may or may not be turned over thereafter,
    // depending on the result of the last trick in the round.
    //Sometimes, a player who has no trump, or, in other variations, no point cards in his hand, may force a redeal by showing his hand to everyone.
    player.emit('sysInfo','Do kitty please');
    player.emit('kitty');
    //TODO: kitty

    //pos = nextPlayer(pos);
    player.on('kittyCome', function(cardsCombination) {
        console.log(cardsCombination);
        //console.log(player.cards);

        // first make sure you have the cards you want to play
        for(var i = 0; i<cardsCombination.length; i++){
            var index = find(player,cardsCombination[i]);
            if(index[0] === -1){
                debug('not found');
                return -1;  // card not exists
            }
            delete (player.suit[index[0][index[1]]]);
            //player.suit[index[0]].splice(index[1],1);
        }
        playing(players,gameInfo);
    })

}

function One_game(players,gameInfo){
    if(gameInfo.firstgame === false){
        debug('three');
        var i = gameInfo.dealer;
        gameInfo.dominantRank = players[i].score;
        players[i].emit('dealer');
        players[(i+2)%4].emit('defender');
        players[(i+1)%4].emit('attacker');
        players[(i+3)%4].emit('attacker');
        players[i].declarer = 1;
        players[(i+2)%4].declarer = 0;
        players[(i+1)%4].declarer = 1;
        players[(i+3)%4].declarer = 0;
    }

    Dealing(players,gameInfo);
    //kitty(players[gameInfo.dealer],gameInfo);
    // updateScore(players);
    //playing(players,gameInfo);
}


var game_core= function (game_instance) {
    //Store the instance, if any
    this.instance = game_instance;
    //console.log(game_instance.id)
    //console.log(game_instance);
    //Store a flag if we are the server
    this.server = this.instance !== undefined;
    var players = [];
    for(var i = 0 ; i< 3; i++){
        players[i] = game_instance.player_client[i];
        players[i].emit('initial');
    }
    players[3]=game_instance.player_host;
    players[3].emit('initial');
    playerProperty(players);
    //console.log(players)
    var gameInfo = new GameInfo();
    gameInfo.dealer = 0;  // 0 ,1, 2, 3
    gameInfo.leader = gameInfo.dealer;
    One_game(players,gameInfo);

};


//server side we set the 'game_core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports = global.game_core = game_core;
}



