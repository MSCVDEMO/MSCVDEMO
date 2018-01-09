// MSCV DEMO
const express = require('express');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM('<html></html>');
var $ = require('jquery')(window);
//set environment
var router = express.Router();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(express.static('public')); // set static dir
var _KEY;
try {
    fs.readFile('config.json', 'UTF-8', async (err, data) => {
        if (err) throw err;
        let conf = JSON.parse(data);
        _KEY = conf.KEY;
        let _PORT = conf.PORT;
        app.listen(_PORT);
    });
} catch (err) {
    console.log(err)
}
//main code 
router.get('/', async (req, res) => {
    res.render('index.ejs');
});
router.post('/analyze', async (req, res) => {
    var uriBase = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze";
    var params = {
        "visualFeatures": "Categories,Description,Color",
        "details": "",
        "language": "en",
    };
    // Perform the REST API call.
    $.ajax({
        url: uriBase + "?" + $.param(params),

        // Request headers.
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", _KEY);
        },

        type: "POST",

        // Request body.
        data: '{"url": ' + '"' + req.body.src + '"}',
    })

        .done(function (data) {
            // Show formatted JSON on webpage.
            res.send(JSON.stringify(data, null, 2));
        })

        .fail(function (jqXHR, textStatus, errorThrown) {
            // Display error message.
            if(jqXHR.status == 400) res.send('Valid Image URL Required!');
            var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
            errorString += (jqXHR.responseText === "") ? "" : $.parseJSON(jqXHR.responseText).message;
            console.log(errorString);
        });
});
app.use('/', router);