var express = require('express')
var app = express()
const https = require('https')
const request = require('request');

app.set('view engine', 'pug');

//set by heroku so we know where we are hosted.
const service_url = process.env.SERVICE_URL

//TODO: make sure this isn't null.
const BING_KEY = process.env.BING_KEY;


app.get('/', function(req, res, next){
    res.render('help', {url:service_url});
})


var queries = []


/**
 * do an image search and pass the results on.
 */
app.get('/api/imagesearch/:terms', function(req, res, next){
    //https://api.cognitive.microsoft.com/bing/v5.0/images/search
    var options = {
          url:"https://api.cognitive.microsoft.com/bing/v5.0/images/search",
          qs : {q:req.params.terms.replace(/ /g, "+")},
          method: 'GET',
          json: true,
          headers: {
            'Ocp-Apim-Subscription-Key': BING_KEY
          }
    };
    
    if(req.query.offset){
        options.qs['offset'] = req.query.offset
    }
    options.qs['count']=10
    
    //TODO: perhaps persist this somewhere?
    queries.push({term:req.params.terms, when:new Date()})
    if(queries.length > 10){
        queries.shift()
    }
    
    query = request(options, (error, rs, body) => {
        
        if(error){
            console.log('error:', error); // Print the error if one occurred
            res.status(500).send(error);
            return
        }
        
        res.json(body.value.map((image)=>{
            return {
                url: image.contentUrl,
                snippet: image.name,
                thumbnail: image.thumbnailUrl,
                context: image.hostPageUrl
            }
        }));
    })
    
    
})

/**
 * Return the last 10 search terms searched.
 * */
app.get('/api/latest/imagesearch/', function(req, res, next){
    res.json(queries);
})



var port;
port = process.env.PORT || 8080
app.listen(port, function () {
  console.log('Example app listening on port: '+port)
})
