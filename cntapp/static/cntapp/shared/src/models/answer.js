define([
    'backbone',
    'models/base_model'

], function (Backbone, BaseModel) {

    var Answer = BaseModel.extend({
        urlRoot: '/api/answer/',

		defaults: {
			items: [],
		},
		initialize: function(){
			this.shuffle();
		},

		shuffle: function(){
			this.set('shuffledItems', _.shuffle(this.get('items')));
		},

		isCorrect: function(selected) {
			return (this.get('correct'));
		},

		isAnswerCorrect: function(selected) {
			return (this.get('correct') == true && this.get('id') == selected);
		},

		getContent: function() {
			return (JSON.parse(this.get('content')));
		},
    });

    return Answer;
});