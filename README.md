#QuickBot for Reddit

Build a Reddit Bot by changing one file.

I built this for [Wadebot](reddit.com/r/wadebot) for the [Denver Broncos' Subreddit](https://www.reddit.com/r/denverbroncos) however you can modfiy it for your own needs.

It post's positive gifs/messages when the user's sentiment is postive & negative gifs/messages when the user's sentitment is negative.

Just change the value's in the config-example.json file, start the server and visit [localhost:3000/bot/update](localhost:3000/bot/update).

For production you can deploy it to [Google Cloud Functions](https://cloud.google.com/functions/) or [Google App Engine](https://cloud.google.com/nodejs/) & use [UptimeRobot](https://uptimerobot.com/) to send a request every five minutes or use a cron job if you want to update it by sending a request to /bot/update.

HUGE THANKS TO [/u/Stuck_In_the_Matrix](https://www.reddit.com/user/Stuck_In_the_Matrix) for his great reddit search API [Pushshift](https://pushshift.io/enhancing-reddit-api-and-search/).

You'll also need:

- Redis ([Redis Labs](https://redislabs.com) - has a free 30MB plan)
- Aylien Text API ([http://aylien.com/text-api](http://aylien.com/text-api) - Free 10K monthly request api)
- Reddit App Credentials - ([Reddit App](https://www.reddit.com/prefs/apps/) - scroll to bottom to create new app)