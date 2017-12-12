//引入Users集合操作方法
var User = require('../model/User');
//引入一个加密的插件
var ctypto = require('crypto');
// 未登录情况下，不允许访问发表和退出
function ckeckLogin(req,res,next) {
    if(!req.session.user){
        req.flash('error','未登录');
        return res.redirect('/login');
    }
    next();
}
//已登陆情况下，不允许登录和注册
function ckeckNotLogin(req,res,next) {
    if(req.session.user){
        req.flash('error','已登陆');
        return res.redirect('back');
    }
    next();
}
module.exports = function (app) {
    //首页
    app.get('/',function (req,res) {
        res.render('index',{
            title:'首页',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //注册页面
    app.get('/reg',ckeckNotLogin,function (req,res) {
        res.render('reg',{
            title:'注册页面',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //注册行为
    app.post('/reg',function (req,res) {
    //    把数据存放到数据库中
    //    1.收集数据
        var username = req.body.username;
        var password = req.body.password;
        var paaword_repeat = req.body['password_repeat'];

    //    2.判断两次密码输入是否正确
        if(password != paaword_repeat){
           //给出用户提示
           req.flash('error','两次密码输入不正确');
           //console.log(req.flash('error'));
           return res.redirect('/reg');
        }
    //    3.对密码进行加密
        var md5 = ctypto.createHash('md5');
        password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            username:username,
            password:password,
            email:req.body.email
        })
    //    4.判断用户名是否存在
        User.get(newUser.username,function (err,user) {
            if(err){
                req.flash('error',err);
                return res.redirect('/reg');
            }
            if(user){
                req.flash('error','用户名已存在');
                return res.redirect('/reg');
            }
            //    5.将用户信息存入数据库，并且跳转到首页
            newUser.save(function (err,user) {
                if(err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                req.flash('success','注册成功');
                return res.redirect('/');
            })
        })
    })
    // 登录页面
    app.get('/login',ckeckNotLogin,function (req,res) {
        res.render('login',{
            title:'登录页面',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    // 登陆行为
    app.post('/login',function (req,res) {
        //1.对密码进行加密
        var md5 = ctypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');
        // 2.判断用户名是否存在
        User.get(req.body.username,function (err,user) {
            if(err){
                req.flash('error',err);
                return res.redirect('/login');
            }
            if(!user){
                console.log(req.body.username);
                req.flash('error','用户名不存在');
                return res.redirect('/login');
            }
            // 3.判断密码是否正确
            if(user.password != password){
                req.flash('error','密码错误，请重新输入');
                return res.redirect('/login');
            }
            // 4.把用户登陆的信息保存在session中，并给出提示，跳转首页
            req.session.user = user;
            req.flash('success','登陆成功');
            return res.redirect('/');
        })
    })
    // 发表页面
    app.get('/post',ckeckLogin,function (req,res) {
        res.render('post',{
            title:'发表页面',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    // 发表行为
    app.post('/post',function (req,res) {
        
    })
    // 退出
    app.get('/logout',ckeckLogin,function (req,res) {
        //将session 里面的信息清除，并给出提示消息，跳转到首页
        req.session.user = null;
        req.flash('success','退出成功');
        return res.redirect('/');
    })
}