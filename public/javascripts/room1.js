var chosen = [];
convert = ['X', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
$(document).ready(function () {

    $("#overlay").empty();

//    $.fn.myfunction = function (context, ccc) {
//        //$("#overlay").empty();
//        $('#servermsg').text(ccc);
//        mycards = context;
//        //alert(value);
//        //alert(suit);
//        chosen = [];
//        var suit = 'nothing';
//        var value = -1;
//
//        display_my_cards(context);
//    };

    connect_to_server();
});

function display_used_cards(context, num)
{
    var parsed = parse_cards(context, 'cards');
    parsed.forEach(function(e){
        var div = '#usedcardDiv' + (num+1).toString();
        $(div).append(e);
    });
    //$('#usedcardDiv').append($('<div class="playernum"><p>player ' + (num+1).toString() + '</p></div>'));
}

function parse_cards(context, clas) {
    res = [];
    for (var i = 0; i < context.length; i++) {
        var $temp = $('<div>', {id: i.toString(), class: clas});
        $temp.addClass('animated slideInRight')

        if (context[i].suit === "jokers") {
            if (context[i].value === 1) {
                suit = 's' //little joker
                value = 'JOKER';
            }
            else {
                suit = 'h'; //big joker
                value = 'JOKER';
            }
        }
        else {
            suit = context[i].suit;
            value = convert[context[i].value];
        }
        chosen.push(0);
        $temp.append(Poker.getCardImage(100, suit, value));
        res.push($temp);
    }
    return res;
}

function display_my_cards(context, pos) {
    var clas = 'cards';
    idnum = context.length - 1;
    display_one_more_card(context[idnum], idnum, clas, pos);
}

function display_one_more_card(acard, idnum, clas, pos)
{
    parsed = parse_one_card(acard, idnum, clas);
    if (pos === 0 && idnum === 0)
        $('#overlay').append(parsed);
    else if (pos === 0)
    {
        $('.cards:nth-child(' +(1).toString() + ')').before(parsed);
    }
    else
    {
        $('.cards:nth-child(' +(pos).toString() + ')').after(parsed);
    }
    //$('#overlay').append(parsed);
    //$('#overlay:nth-child(' + (0).toString +')').after(parsed);
    //else
        //$('#overlay').children(':eq(' +(1).toString() + ')').after(parsed);
//    console.log( $('#overlay').children(':eq(' +(pos).toString() + ')'));


    $('.cards').click(function(){
        //alert(this.id);
        if ($(this).hasClass('select')){
            chosen[this.id] = 0;
            $(this).animate({top:'+=20px'},1);
            $(this).removeClass('select')
        }else{
            chosen[this.id] = 1;
            $(this).animate({top:'-=20px'},1);
            $(this).addClass('select')
        }
    });
}

function parse_one_card(acard, idnum, clas) {
    var $temp = $('<div>', {id: idnum.toString(), class: clas});
    $temp.addClass('animated slideInRight')

    if (acard.suit === "jokers") {
        if (acard.value === 1) {
            suit = 's' //little joker
            value = 'JOKER';
        }
        else {
            suit = 'h'; //big joker
            value = 'JOKER';
        }
    }
    else {
        suit = acard.suit;
        value = convert[acard.value];
    }
    chosen.push(0);
    $temp.append(Poker.getCardImage(100, suit, value));
    return $temp;
}
