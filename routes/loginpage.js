/**
 * Created by kitsune on 4/15/14.
 */

exports.loginpage = function(req, res){
    if (req.cookies.user == undefined || req.cookies.pass == undefined){
        res.render('loginpage',
            { title: 'Hello - You have no cookie' }
        );
    } else{
        // attempt automatic login //
        AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
            if (o != null){
                req.session.user = o;
                res.redirect('/home');
            }  else{
                res.render('loginpage',
                    { title: 'Hello - You cookie failed' }
                );
            }
        });
    }
};
