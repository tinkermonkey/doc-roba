Template.Logout.rendered = function () {
  Meteor.logout();
  setTimeout(function () {
    d3.selectAll(".login-container").classed("login-intro", true);
    d3.selectAll("#login-form-container").classed("hide", true);
    setTimeout(function() {
      Router.go("/login");
    }, 750);
  }, 1500);
};