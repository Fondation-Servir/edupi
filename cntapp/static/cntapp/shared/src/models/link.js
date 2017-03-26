define([
    'backbone',
    'models/base_model'

], function (Backbone, BaseModel) {

    var LinkModel = BaseModel.extend({

        urlRoot: '/api/links/',
        type: 'links',

        validate: function (attrs, options) {
            if (attrs.name.length <= 0) {
                return i18n.t("msg-input-error-empty-name");
            }
            if (attrs.url.length <= 0) {
                return i18n.t("msg-input-error-empty-url");
            }
        }
    });

    return LinkModel;
});