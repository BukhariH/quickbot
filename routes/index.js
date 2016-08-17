var express = require('express');
var router = express.Router();
var snoowrap = require('snoowrap');
var request = require('request');
var AYLIENTextAPI = require('aylien_textapi');

// Config File Check
try {
 var config = require('../config.json');
}
catch (e) {
 console.log('Please modify the config-example.json file with your own secrets then rename the file to config.json')
}

var redis = require("redis")
var client = redis.createClient(config.RedisPort, config.RedisHost, {no_ready_check: true});
client.auth(config.RedisPassword, function (err) {
    if (err) {throw err}
});

client.on('connect', function() {
    console.log('Connected to Redis');
});

// AYLIEN Text API for Sentiment Analysis
var textapi = new AYLIENTextAPI({
  application_id: config.AylienTextApiId,
  application_key: config.AylienTextApiKey
});

// Snoowrap Library for Reddit
const r = new snoowrap({
  user_agent: config.RedditUserAgent,
  client_id: config.RedditClientId,
  client_secret: config.RedditClientSecret,
  username: config.RedditUsername,
  password: config.RedditPassword
})

function getMessage(type) {
	if (type == 'positive') {
		return "[" + config.PositiveMessages[Math.floor(Math.random() * config.PositiveMessages.length)] + "](" + config.PositiveGifs[Math.floor(Math.random() * config.PositiveGifs.length)] + ")"
	} else {
		return "[" + config.NegativeMessages[Math.floor(Math.random() * config.NegativeMessages.length)] + "](" + config.NegativeGifs[Math.floor(Math.random() * config.NegativeGifs.length)] + ")"
	}
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

router.get('/bot/update', function(req, res, next) {
	client.get('CommentedOn', function(err, reply) {
		request('https://api.pushshift.io/reddit/search/comment?q=' + config.SearchPhrase + '&subreddit=' + config.Subreddits + '&after_id=' + reply, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			var comments = JSON.parse(body)["data"]
			for (var i = comments.length - 1; i >= 0; i--) {
				// Checks to make sure the bot isn't responding to itself
				// https://np.reddit.com/r/bestof/comments/4y0osv/a_user_creates_a_wade_phillips_bot_that_keeps/?ref=share&ref_source=link
				if (comments[i]["author"] != config.RedditUsername) {
					r.get_comment(comments[i]["id"]).fetch().then(function(result) {
						// Finds if the sentiment of the user's message is postive or negative
						// Then posts a postive gif & message for postive & netural sentiment
						// Or posts a negative gif & message for negative sentiment
						client.hget("PostedTo", result.link_id, function (err, reply) {
							if (reply == null) {
								textapi.sentiment({
								  'text': result.body
								}, function(error, response) {
								  if (error === null) {

									sleep(1000).then(() => {
									  	if (response.polarity != 'negative') {
									  		result.reply(getMessage('positive'));
									  	} else {
									  		result.reply(getMessage('negative'));
									  	}
									  	console.log("Posting here: "+ result.id)
									  	client.set("CommentedOn", result.id, redis.print);
									  	client.hset("PostedTo", result.link_id, "true", redis.print);
									})
								  }
								});
							} else {
								console.log("Already posted in this thread: " + result.link_id)
							}
						});
					})
				}
			}
		  }
		})
	});
	// Close client connection
	res.send("done")
});

module.exports = router;