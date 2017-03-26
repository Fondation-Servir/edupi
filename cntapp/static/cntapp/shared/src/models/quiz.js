define([
    'backbone',
    'models/base_model',
    'collections/questions',
    'models/question',

], function (Backbone, BaseModel, QuestionCollection, Question) {

    var Quiz = BaseModel.extend({
		defaults: {
			title: '',
			subtitle: '',
			questions: [],
			score: 0,
			possibleScore: 0,
			currentQuestion: 0,
			questionCount: 0,
		},
        urlRoot: '/api/quiz/',
        type: 'quiz',

		initialize: function () {
            this.questions = new QuestionCollection();
        },

        loadData: function () {
        	var that = this;
        	this.questionCount = this.get('question_set').length;

			_.each(this.get('question_set'), function(question, index){
				q = new Question();
				q.set(question);
				q.question_id = q.id;
				q.id = index;
				that.questions.add(q);
			});
			that.questions.reset(that.questions.shuffle(), {silent:true});
       	},

       	getQuestion: function(index) {
       		return this.questions.at(index);
 		},

		incrementScores: function(score, possibleScore){
			this.set('score', (this.get('score') + score ));
			this.set('possibleScore', (this.get('possibleScore') + possibleScore ));
			this.trigger('change');
		},
    });

    return Quiz;
});