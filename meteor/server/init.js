/**
 * Initialize lookback emails
 */
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