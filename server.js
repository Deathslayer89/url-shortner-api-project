require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const urlparser = require('url');
const dns=require('dns');
// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({ extended: false }));
const schema = new mongoose.Schema({ url: String });
const Url = mongoose.model('Url', schema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});
//post endpoint to shorten url
app.post('/api/shorturl', (req, res) => {
  const requrl = req.body.url;
  var myURL;
  //check url is valid
  function validURL(myURL) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ //port
    '(\\?[;&amp;a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i');
    return pattern.test(myURL);
 }
  if(!validURL(requrl)){
  res.json({error: "Invalid URL"});
  }
  else
  {const dns_check = dns.lookup(urlparser.parse(requrl).hostname, (err, address, family) => {
    if (err) {
      res.json({ error: 'invalid URL' });
    }
    else {
      const newurl = new Url({ url: requrl });
      newurl.save((err, data) => {
        if (err) {
          res.json({ error: 'invalid URL' });
        }
        else {
          res.json({ original_url: requrl, short_url: data._id });
        }
      });
    }
  })}
})
//get endpoint to redirect to original url
app.get('/api/shorturl/:id',(req,res)=>{
  const id = req.params.id;
  Url.findOne({_id:id},(err,data)=>{
    if(err){
      res.json({error:'invalid URL'});
    }
    else{
      res.redirect(data.url);
    }
  })
})
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
