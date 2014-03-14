$(document).ready(function(){

    //window.open('/room1','_self');
    $('#gamestart').click(function(){
        $('#gamestart').fadeOut('fast');
        //$('#anewroom').load('/room1')
        //connect_to_server();
        window.open('/room1','_self');
    });

    $('#button1').click(function() {
        send_msg ('button', 'button1');
    });

    $('#gamestart p').mouseenter(function() {
        $('#gamestart p').css('color','yellow');
        //$('this').fadeOut('slow')
    }).mouseleave(function() {
            $('#gamestart p').css('color','violet');
            //$('this').fadeOut('slow')
        });

    $('#inputbutton').click(function() {
        if(myturn){
            var res = $('#input1').val().split(' ');
            var cd = {suit: res[0], value: res[1]};
            send_msg ('usecard', cd);
            $('#input1').val('')
        }
        else{
            $('#gogogo').text('Not your turn yet, Do not panic');
        }
    })
    $('#input1').keypress(function(k) {

        if (k.which === 13)
        {
            if (myturn){
                var res = $('#input1').val().split(' ');
                var cd = {suit: res[0], value: res[1]};
                send_msg ('usecard', cd);
                $('#input1').val('')
            }
            else{
                $('#gogogo').text('Not your turn yet, Do not panic');
            }
        }
    })



    $('#playbutton').click(function() {
        if(myturn){
            var list = [];
            for(var i =0 ; i<chosen.length ; i++){
                if(chosen[i]){
                    list.push(mycards[i]);
                }
            }
            send_msg ('usecard', list);
            $("#overlay").empty();

        }
        else{
            $('#gogogo').text('Not your turn yet, Do not panic');
        }
    })

//DominantSuit
    $('#IDominantSuit').click(function() {
        if(DominantSuitChance){
            var card;
            for(var i =0 ; i<chosen.length ; i++){
                if(chosen[i]){
                    card = mycards[i];
                }
            }
            send_msg ('DominantSuitIn', card);

        }
        else{
            $('#gogogo').text('No No No (one waving his finger in front of you');
        }
    })

})