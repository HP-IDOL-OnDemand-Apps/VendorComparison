module.exports = {
	//HP key
	apikey: '',

	//twitter API keys for Twit
	consumer_key: 'xDqvC5MJIoEyEo9wh9wF29Upj',
	consumer_secret: 'Tn6Tjbdl6ZPqsKZTaQmssrmC9B1gvPC8muGoVc3zETBlSrrHgB',
	access_token: '3044115824-ueuEWC7P3TjWVJgXHcdWHKioxh73l7HwNvLMN2A',
	access_token_secret: 'Obu72gFYWYRSfsgzWznWZ5etzrXnKANBbxRigpBa4EFV4',

	//tweet analyzer search term
	number_ofTweets: 9,

	//indexes to query while extracting entities
	extractEntityTypes: ['companies_eng', 'organizations'],

	//index to query while creating word cloud
	wordCloudIndex: 'news_eng',

	//index to query while searching for vendors
	matchSimilarIndex: 'MATCH{company}:wikipedia_type',

	//port for deploying node server
	portServer: 5500
}