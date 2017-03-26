define([
    'backbone',
    'models/quiz'
], function (Backbone, Quiz) {

    var QuizCollection = Backbone.Collection.extend({
        url: '/api/quiz/',
        model: Quiz
    });

    return QuizCollection;
});
