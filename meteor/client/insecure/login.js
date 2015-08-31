/**
 * Template Helpers
 */
Template.Login.helpers({
});

/**
 * Event Handlers
 */
Template.Login.events({
  /**
   * Transition to the sign-up form
   * @param e
   */
  "click button.show-signup": function (e) {
    d3.select(".login-slide")
      .classed("slide-right", true);
    d3.selectAll(".login-container")
      .classed("login-expand", true);
    document.title = "DocRoba :: Sign Up";
    document.location.search = "?SignUp";
  },

  /**
   * Transition to the login form
   * @param e
   */
  "click button.show-login": function (e) {
    d3.select(".login-slide")
      .classed("slide-right", false);
    d3.selectAll(".login-container")
      .classed("login-expand", false);
    document.title = "DocRoba :: Login";
    document.location.search = "";
  },

  /**
   * Submit the signup form
   * @param e
   */
  "click button.signup": function (e) {
    console.log("Signup");
    var valid = true;

    if(valid){
      var email = $("#signupEmail").val(),
        password = $("#signupPassword").val(),
        name = $("#signupName").val(),
        submitTime = Date.now();

      d3.selectAll(".login-container").classed("login-submit", true);
      d3.select(".login-spinner").classed("hide", false);
      d3.select(".login-slide").classed("hide", true);

      Accounts.createUser({
        username: email,
        email: email,
        password: password,
        profile: {
          name: name
        }
      }, function (error) {
        if(error){
          console.log("Create Account Error: ", error);
          setTimeout(function () {
            d3.selectAll(".login-container").classed("login-submit", false);
            setTimeout(function () {
              d3.select(".login-spinner").classed("hide", true);
              d3.select(".login-slide").classed("hide", false);
            }, 750);
          }, Math.max(500 - (Date.now() - submitTime), 0));
        } else {
          console.log("Account Created");
          setTimeout(function () {
            Router.go("/home");
          }, Math.max(500 - (Date.now() - submitTime), 0));
        }
      })
    }
  },

  /**
   * Submit the login form
   * @param e
   */
  "click button.login, keypress #loginEmail, keypress #loginPassword": function (e) {
    var email = $("#loginEmail").val(),
      password = $("#loginPassword").val(),
      valid = true; // TODO do field validation!

    // filter out unimportant key events
    if(e.type !== "click"){
      if(e.which !== 13){
        return;
      }
    }

    if(email && password){
      var submitTime = Date.now();

      d3.selectAll(".login-container").classed("login-submit", true);
      d3.select(".login-slide").classed("hide", true);
      d3.select(".login-spinner").classed("hide", false);

      setTimeout( function () {
        Meteor.loginWithPassword(email, password, function (error) {
          if(error){
            console.log("Login Error: ", error);
            setTimeout(function () {
              d3.selectAll(".login-container").classed("login-submit", false);
              setTimeout(function () {
                d3.select(".login-spinner").classed("hide", true);
                d3.select(".login-slide").classed("hide", false);
              }, 750);
              $(e.target).focus();
            }, Math.max(500 - (Date.now() - submitTime), 0));
          } else {
            console.log("Logged In");
            setTimeout(function () {
              Router.go("/home");
            }, Math.max(500 - (Date.now() - submitTime), 0));
          }
        });
      }, 500);
    }
  }
});

/**
 *
 */
Template.Login.rendered = function () {
  // check if the user is logged in
  if(Meteor.userId()){
    console.log("User logged in already, logging out");
    Meteor.logout();
  }

  setTimeout(function () {
    d3.selectAll(".login-container").classed("login-intro", false);

    // this needs to start a little later to avoid a blip
    setTimeout(function () {
      d3.select(".login-spinner").classed("hide", true);
      d3.select(".login-slide").classed("hide", false);
    }, 750);

    setTimeout(function () {

      $("#loginEmail").focus();
    }, 1000);
  }, 500);
};