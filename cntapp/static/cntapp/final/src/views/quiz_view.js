define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/quiz_view.html',
    'models/quiz',
], function ($, _, Backbone,
             quizViewTemplate, Quiz) {

    var TEMPLATE = _.template(quizViewTemplate);

    var QuizView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        questionIndex: 0,
        currentQuestion: undefined,
        dirId: undefined,

        initialize: function (options) {
            options = options || {};
            if (typeof options.path === 'undefined') {
                throw new Error('path not defined.');
            }

            this.path = options.path;
            this.quizId = options.quizId;
            this.dirId = this.path.slice(this.path.lastIndexOf('/') + 1);

            this.model = new Quiz();
        	this.questionIndex = 0;
			this.showContent();
        },

		events: {
			'click .checkResults': 'checkResults',
			'click .nextQuestion': 'nextQuestion',
			'click .backtoDir': function () {
            	finalApp.router.navigate('#directories/' + this.path, {trigger: true});
            }
		},

		checkResults: function() {
			var that = this;
			var selected = this.$el.find('input:radio:checked').val();
			if (!selected)
				return (false);
			this.$el.find('input:radio').attr('disabled', 'disabled');
			var score = 0;
			_.each(this.currentQuestion.getAnswers().models, function(answer){
				if (answer.isAnswerCorrect(selected) == true)
				{
					that.$el.find('#li_answer_' + answer.get('id')).addClass('list-group-item-success');
					score++;
				} else if (answer.isCorrect() == true)
				{
					that.$el.find('#li_answer_' + answer.get('id')).addClass('list-group-item-success');
				}
			});

			this.currentQuestion.set({
				score: score
			});

			// mark the matching responses as true or false,
			// if false, add the correct answer here
			// TODO: make "correct answer" show left column value instead?

			this.$el.find('.secondColumn li').each(function(index, element){
				var thisScore = score.key[index].toString();
				$(element).removeClass().addClass(thisScore);
				if (thisScore === 'false') { $(element).append(' ('+score.items[index]+')'); }
			});

			// hide the check results button, show the next question button
			this.$el.find('#questionTemplate .buttons button').each(function(){
				$(this).toggle();
			});
		},

        showContent: function () {
            var that = this;
            request = $.get('/api/quiz/' + this.quizId);

            request.done(function (data) {
                that.$('.content-info').html("");

                that.model.set(data);
                // check if there is any content
                if (that.model.length === 0) {
                    console.log('empty quiz');
                    that.showErrorMsg(i18n.t("msg-no-sub-content"));
                    return
                }

                that.model.loadData();
				that.questionCount = that.model.questionCount;
				that.currentQuestion = that.model.getQuestion(that.questionIndex);
            	that.render();
				that.listenTo(that.currentQuestion, 'change', that.updateScore);
            });

            request.error(function (XMLHttpRequest, textStatus, errorThrown) {
                if (XMLHttpRequest.readyState == 0) {
                    that.showErrorMsg(
                        i18n.t("msg-retrieve-faulure-because-no-network")

                    );
                } else if (XMLHttpRequest.status === 404) {
                    that.showErrorMsg(i18n.t("msg-content-not-exist"));
                } else {
                    that.showErrorMsg(i18n.t("msg-unknown-retrieve-failure"));
                }
            });
        },

        render: function () {
            this.$el.html(TEMPLATE({model: this.model, questionIndex: this.questionIndex, question: this.currentQuestion}));
            this.$el.i18n();
            return this;
        },

        showErrorMsg: function (msg) {
            this.$('.content-info').html(msg);
            this.$('.content-info').i18n();
        },

        nextQuestion: function() {
			this.questionIndex += 1;
			//this.currentQuestion.close();
			if (this.questionIndex >= this.questionCount) {
				this.renderFinalScore();
				this.listenTo(this.currentQuestion, 'change', this.updateScore);
			} else {
				this.currentQuestion = this.model.getQuestion(this.questionIndex);
				this.render();
				this.listenTo(this.currentQuestion, 'change', this.updateScore);
			}
		},

		renderFinalScore: function() {
			this.$el.find('#scorefinal').html(this.model.get('score'));
			this.$el.find('#possibleScorefinal').html(this.model.get('possibleScore'));
			this.$el.find('#questionTemplate').hide();
			this.$el.find('#finalScoreTemplate').show();
			this.$el.i18n();
		},

		updateScore: function(){
			this.model.incrementScores(
				this.currentQuestion.get('score'),
				this.currentQuestion.get('possibleScore')
			);
			this.$el.find('#score').html(this.model.get('score'));
			this.$el.find('#possibleScore').html(this.model.get('possibleScore'));
		},
    });

    return QuizView;
});