define([
    'backbone',
    'models/question'
], function (Backbone, Question) {

    var QuestionCollection = Backbone.Collection.extend({
        model: Question
    });

    return QuestionCollection;
});