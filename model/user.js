//连接数据库实例
var mongodb = require('./db');

//创建一个构造函数，命名为User，里面的username,password,email
// 分别存储用户名，密码和邮箱
function User(user) {
    this.username = user.username;
    this.password = user.password;
    this.email = user.email;

}
module.exports = User;

User.prototype.save = function (callback) {
    var user = {
        //收集即将存入的数据
        username:this.username,
        password:this.password,
        email:this.email
    }

    mongodb.open(function (err,db) {
        //如果在打开数据库的时候发生错误，将错误结果返回给回调
        if(err){
            return callback(err);
        }
        db.collection('user',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
             //将数据插入到Uusers集合里面去
            collection.insert(user,{safe:true},function (err,user) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,user[0]);
            })
        })

    })
}
User.get = function (name,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //读取数据库集合
        db.collection('user',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查询出name为指定用户名的用户信息，将结果返回
            collection.findOne({username:name},function (err,user) {
                mongodb.close();//关掉数据库
                if(err){
                    return callback(err);
                }
                return callback(null,user)
            })
        })
    })
}