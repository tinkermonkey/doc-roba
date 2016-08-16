import {Meteor} from 'meteor/meteor';
import {Mailer} from 'meteor/lookback:emails';
import {EmailHelpers} from '../../api/email_templates/email_helpers.js';
import {EmailTemplates} from '../../api/email_templates/email_templates.js';

Mailer.init({
  templates: EmailTemplates,
  helpers: EmailHelpers,
  replyTo: Meteor.settings.email.replyTo,
  from: Meteor.settings.email.from,
  layout: {
    name: "EmailLayout",
    path: "email_layout.html",
    css: "email_layout.css"
  }
});
