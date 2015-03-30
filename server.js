var Twit = require('twit'),
	express = require('express'),
	request = require('request'),
	async = require('async'),
	bodyParser = require('body-parser'),
	https = require('https'),
	config = require('./config.js'),
	iod = require('iod-node'),
	fs = require('fs'),
	busboy = require('connect-busboy');
var client= new iod.IODClient('http://api.idolondemand.com', config.apikey);
var T = new Twit({
	consumer_key: config.consumer_key,
	consumer_secret: config.consumer_secret,
	access_token: config.access_token,
	access_token_secret: config.access_token_secret
});

/////////////////////////////////////////////////
//////    SETUP EXPRESS APP
/////////////////////////////////////////////////

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(busboy());
app.use(express.static(__dirname));


/////////////////////////////////////////////////
//////    API ROUTES
/////////////////////////////////////////////////

app.post('/searchTweets', function(req, res) {

	if(req.body.searchTerm == undefined) {
    res.status(400).json( {'error':'Did not specify search term'} );
	}

	T.get('search/tweets', { q: req.body.searchTerm, count: config.number_ofTweets }, function(err, data, res2) {

		try {
			var all_tweets = [];
			if(err || data.statuses == undefined) {
				console.log(err);
        res.status(400).json();
			}

			/* async.each processes each tweet at the same time */
			async.each(data.statuses, function(status, callbackMain) {
				var single_tweet = [],
						global_sentiment,
						global_highlight_positives = [],
						global_highlight_negatives = [];

				async.waterfall([
						function(callback) {
							/* get sentiment analysis of a tweet */
							client.call('analyzesentiment', { text: status.text }, function(err, res, body) {
								global_sentiment = body;
								callback();
							});
						},
						function(callback) {
							/* call highlight text API for each of the positive sentiments, to hightlight text */
							if(typeof global_sentiment == 'undefined' || global_sentiment == null) {
								callback();
								return;
							}
							if (global_sentiment.positive.length == 0) {
								callback();
								return;
							}

							for(var j in global_sentiment.positive) {
								(function(j) {
									/* send json.positive[j].sentiment as the highlight_expression */
									/* with json.positive[j].original_text as the text */
									client.call('highlighttext', {
										text: global_sentiment.positive[j].original_text,
										highlight_expression: global_sentiment.positive[j].sentiment
									},
									function(err, res, body) {
							    	global_highlight_positives.push({ text: body.text, score: global_sentiment.positive[j].score });

							    	/* if all the sentiments have been processed then only proceed */
							    	if (j == (global_sentiment.positive.length - 1)) {
							    		callback();
							    	}
									});
								})(j);
							}
						},
						function(callback) {
							/* call highlight text API for each of the negative sentiments, to hightlight text */
							if (typeof global_sentiment == 'undefined' || global_sentiment == null) {
								callback();
								return;
							}
							if (global_sentiment.negative.length == 0) {
								callback();
								return;
							}

							for(var j in global_sentiment.negative) {
								(function(j) {
									/* send json.negative[j].sentiment as the highlight_expression */
									/* with json.negative[j].original_text as the text */
									client.call('highlighttext', {
										text: global_sentiment.negative[j].original_text,
										highlight_expression: global_sentiment.negative[j].sentiment
									},
									function(err, res, body) {
							    	global_highlight_negatives.push({ text: body.text, score: global_sentiment.negative[j].score });

							    	/* if all the sentiments have been processed then only proceed */
							    	if (j == (global_sentiment.negative.length - 1)) {
							    		callback();
							    	}
									});
								})(j);
							}
						},			
					],	
					/* final function in async.waterfall */
					function(err, result) {
						single_tweet.push({ text: status.text, analysis: global_sentiment, positive_terms: global_highlight_positives, negative_terms: global_highlight_negatives });

						/* check if sentiment score is not null */
						if(single_tweet[0].analysis.aggregate) {
							if(single_tweet[0].analysis.aggregate.score != 0) {
								all_tweets.push(single_tweet);
							}
						}
						callbackMain();
					});			
			},
			/* final function in async.each */
			function(err) {
				/* this replaces corresponding vendor item in $scope.vendors */
				var global_tweet = { name: req.body.searchTerm, cloud: [], tweets: all_tweets };
		    if(err) {
	        console.log(err);
	        res.status(400).json({'error':'Error in processing tweets'});
		    } else {
					res.status(200).json({ tweets: global_tweet });	
		    }
			});	
		} catch(err) {
			console.log(err);
      res.status(400).json({'error':'Error in getting tweets'});
		}
	});
});

app.post('/extractText', function(req, res) {

  var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {

  		var savePath = __dirname + '/public/uploads/1';
      fstream = fs.createWriteStream(savePath);
      file.pipe(fstream);

      fstream.on('close', function() {

				client.call('extractentity', { file: savePath, entity_type: config.extractEntityTypes }, function(err, response, body) {
					var responsy = [];
					if(err) {
						console.log(err);
						res.status(400).json({'error': 'Error in extracting entites'});
					}
					if(body && body.entities) {
						body.entities.forEach(function(entity) {

							/* check for duplicates */
							for(var i = 0, flag = 0 ; i < responsy.length ; i++) {
								if(responsy[i] == entity.original_text) {
									flag = 1; break;
								}
							}
							if(!flag) {
								responsy.push(entity.original_text);
							}
						});
						fs.unlink(savePath);
		        res.status(200).json({'result': responsy});
		      } else {
		      	res.status(400).json({'error': 'Error in extracting entities'});
		      }
				});
      });
  });
});

app.post('/findRelatedConcepts', function(req, res) {

	if(!req.body.key) {
    res.status(400).json({'error':'Did not specify key'});
	}

	var concept = req.body.key;
	client.call('findrelatedconcepts', { text: concept, index: config.wordCloudIndex }, function(err, response, body) {
		if(err) {
			console.log(err);
			res.status(400).json({'error':'Error in extracting related concepts'});
		}
		if(body && body.entities) {
			var results = [];
			body.entities.forEach(function(entity) {
				results.push({ 'text': entity.text, 'weight': entity.occurrences });
			});
      res.status(200).json({'result': results});
    } else {
    	res.status(400).end();
    }
	});
});

app.post('/findSimilar', function(req, res) {

	if(!req.body.text) {
    res.status(400).json({'error':'Did not specify text'});
	}

	client.call('findsimilar', { text: req.body.text, field_text: config.matchSimilarIndex }, function(err, response, body) {
		if(err) {
			console.log(err);
			res.status(400).json({'error':'Error in find similar vendors'});
		}
		if(body && body.documents) {
			var results = [];
			body.documents.forEach(function(document) {
				results.push(document.title);
			});
      res.status(200).json({'result': results});
    } else {
			res.status(400).json({'error':'Error in find similar vendors'});
    }
	});
});

app.get('/', function(req, res) {
	res.sendfile('./app/index.html')
});

/////////////////////////////////////////////////
//////    START SERVER
/////////////////////////////////////////////////

var port = process.env.PORT || config.portServer;
app.listen(port);
console.log('Server started on port ' + port);