/**
 * Setup the editable components
 */
Template.focus_node.rendered = function () {
  $('.editable').editable({
    //mode: 'popup',
    display: function () {},
    success: function (response, newValue) {
      Nodes.update({_id: $(this).attr("data-pk")}, {$set: {title: newValue}});
      setTimeout(function () {
        $(this).removeClass('editable-unsaved');
      }.bind(this), 10);
    }
  });
};