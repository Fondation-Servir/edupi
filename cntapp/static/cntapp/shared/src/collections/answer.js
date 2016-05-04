define([
    'backbone',
    'models/answer'
], function (Backbone, Answer) {

    var AnswerCollection = Backbone.Collection.extend({
        model: Answer
    });

    return AnswerCollection;
});