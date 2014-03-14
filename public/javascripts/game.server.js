/**
 * Created by kitsune on 2/14/14.
 */

var UUID = require('node-uuid');

var game_server = module.exports = { games : {}, game_count:0 }

game_server.findGame = function (player) {
    console.log ('looking for a game. We have : ' + this.game_count);
    var joined_a_game = false;
    if (this.game_count) {
        for (var gameid in this.games){
            if (!this.games.hasOwnProperty(gameid)) continue;


            if (this.games[gameid].player_count < 4){
                joined_a_game = true;
                player.join(this.games[gameid].id);
                player.games = this.games[gameid].id;
                player.hosting = false;
                this.games[gameid].player_client.push(player);
                this.games[gameid].player_count++;
                player.send('I joined game ' + this.games[gameid].id)
                console.log('player ' + player.id + ' joined game ' + this.games[gameid].id)
                console.log(this.games[gameid].player_count);
                if (this.games[gameid].player_count === 4){
                    this.startGame(this.games[gameid], player);
                }
            }

            if (!joined_a_game){
                this.createGame(player);
            }

        }

    } else {
        this.createGame(player);
    }

}

game_server.createGame = function(player) {

    var game_instance = {
        id : UUID(),
        player_host : player,
        player_client : [],
        player_count : 1
    };

    this.games[game_instance.id] = game_instance;
    this.game_count ++;

    console.log('player ' + player.userid + ' created a game with id ' + game_instance.id);
    player.game = game_instance.id;
    player.hosting = true;
    player.join(game_instance.id);
    player.send('I hosted game ' + game_instance.id)
    return game_instance;
}

require('./game.core.js');

game_server.startGame = function(game_instance, player){
    player.broadcast.to(game_instance.id).send('Game Start Now!!!');
    player.send('Game Start Now!!!');
    console.log('Game Start Now!!!');
    game_core(game_instance);
}