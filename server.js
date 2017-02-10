var express = require('express')
var path = require('path');
var app = express()
var mongo = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/urlshort'
var count_id 
function isURL(str) {
     var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
     var url = new RegExp(urlRegex, 'i');
     return str.length < 2083 && url.test(str);
}
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
})
app.get('/new/*', function (req, res){ // add new url
    var input = req.params[0]
    if (isURL(input)){
        console.log('Create new entry');
        //res.send('Looks like an URL')
        mongo.connect(url, function(err, db) {
            if (err) throw err
            
            var collection = db.collection('url')
            
             collection.count({
                type : "url"
            },function(err,count){
                console.log(count)
                count_id= count;
            })
            
            var doc = {
                id : count_id+1,
                url: input,
                type: "url"
            
            }
            var created = {
                original_url: input,
                short_url: "https://camper-api-project-jiuntian.c9users.io/"+ (count_id+1)
            }
            collection.insert(doc,function(err, data){
                if(err) throw err
                res.send(created)
            })
            
        })
    } else {
        console.log('Not a URL');
        res.send({
            error : "Not a URL"
        })
    }
    //
    
})
app.get('/*', function (req, res) {
    var number = req.params[0]
    if(number.split('')[0].match(/^[0-9]+$/)){
        mongo.connect(url, function(err, db) {
            var collection = db.collection('url')
            var ans = collection.find({
                id: Number(number)
            }).toArray(function(err, documents) {
                if (err) throw err
                console.log(documents[0].url)
                res.redirect(documents[0].url)
                db.close()
            })
        })
        
        var result = {
            //
        }
        //console.log(result)
    }

})
app.listen(8080)
