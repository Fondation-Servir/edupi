define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/quiz.html'
], function ($, _, Backbone,
             quizTemplate) {

    var TEMPLATE = _.template(quizTemplate);

    var QuizItemView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",

        initialize: function (options) {
            this.model.on("change", this.render, this);
        },

        render: function () {
            this.$el.html(TEMPLATE({model: this.model}));
            return this;
        },

        events: {
            'click .document-row': function () {
            	finalApp.router.navigate(window.location.hash.replace('#directories', '#quiz') + '/' + this.model.get('id'), {trigger: true});
            }
        }
    });

    return QuizItemView;
});