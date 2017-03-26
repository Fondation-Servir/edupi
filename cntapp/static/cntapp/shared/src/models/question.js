define([
    'backbone',
    'models/base_model',
    'collections/answer',
    'models/answer',
	'katex'
], function (Backbone, BaseModel, AnswerCollection, Answer, katex) {

    var Question = BaseModel.extend({
		defaults: {
			title: '',
			subtitle: '',
			answers: [],
			score: -1,
			possibleScore: 0,
			currentQuestion: 0
		},
        urlRoot: '/api/question/',

		initialize: function () {
            this.answers = new AnswerCollection();
        },

		getContent: function() {
			return (JSON.parse(this.get('content')));
		},

		getContentHTML: function() {
			return (JSON.parse(this.get('content')).html);
		},

		getContentRAW: function() {
			return (JSON.parse(this.get('content')).raw);
		},

		getContentHTMLz: function() {
			Encoder.EncodeType = "entity";
			return (katex.renderToString(Encoder.htmlEncode(JSON.parse(this.get('content')).raw)));
		},

       	getAnswers: function() {
       		var that = this;
			this.answers.reset();
			var possibleScore = 0;
			_.each(this.get('answer_set'), function(answer, index){
				a = new Answer();
				a.set(answer);
				a.answer_id = q.id;
				a.id = index;
				if (a.get('correct') == true)
				{
					possibleScore += 1;
				}
				that.answers.add(a);
			});
			this.set({'possibleScore': possibleScore})

       		return this.answers;
 		},
    });

    return Question;
});