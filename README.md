HP IDOL Mashathon
==================

Vendor Comparison App
https://hpidol.wordpress.com/2015/02/27/hp-idol/
https://www.youtube.com/watch?v=lUdBrlryEss

# Deployment

- Navigate to root directory
- Set the HP IDOL API key in ```config.js```
- Set twitter API keys in ```config.js``` [see blog post for more on how to get API keys for twitter]
- Execute ```node server.js```
- This should start the API server on localhost with port number 5500. It serves the angular app at ```http://localhost:5500/```


# Configuration

Various parameters can be changed in ```config.js```. The number of tweets to retrieve for each vendor can be set. It should be kept between 5 - 15 so as to not cross Twitter's rate limit (which I accidentally crossed!). 


# Blog Post

The blog post can be found at https://hpidol.wordpress.com/2015/02/27/hp-idol/ . It explains the usage of the Vendor Comparison app, and gives an overview of the source code. It details the HP IDOL APIs used in building the app, and how to use the application.

# Video

The screenshare video that shows an usage of the application can be found at https://www.youtube.com/watch?v=lUdBrlryEss. It describes the basic features of the Vendor Comparison App, shows a overview of the API server code, and demonstrates a use case workflow.


Thank you for reviewing my entry, I really want to continue with this application, and thus make it suitable for the HP Haven Marketplace.