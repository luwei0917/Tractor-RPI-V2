/**
 * Created by weilu on 3/8/14.
 */

// Async task (same in all examples in this chapter)
function async(arg, callback) {
    console.log('do something with \''+arg+'\', return 1 sec later');
    setTimeout(function() { callback(arg * 2); }, time);
}
// Final task (same in all the examples)
function final() { console.log('Done', results1); }

// A simple async series:
var items = [ 1, 2, 3, 4, 5, 6 ];
var results1 = [];
time = 10;
function series(item) {
    if(item) {
        async( item, function(result) {
            results1.push(result);
            return series(items.shift());
        });
    } else {
        return final();
    }
}
series(items.shift());
console.log('hi');