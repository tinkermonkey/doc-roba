Template.Logout.rendered = function () {
  console.ut();
  setTimeout(function () {
    d3.selectAll(".login-container").classed("login-intro", true);
    d3.selectAll("#login-form-container").classed("hide", true);
    setTimeout(function() {
      FlowRouter.go("/login");
    }, 750);
  }, 1500);
};