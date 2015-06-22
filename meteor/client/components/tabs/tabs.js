/**
 * Simple system for enabling bootstrap tabs
 */

Tabs = {
  /**
   * Initialize the tab functionality
   */
  init: function (instance) {
    //console.log("Tabs.init");

    // Setup the tab event listeners
    instance.$("ul.nav > li > a").each(function (i, el) {
      if($(el).attr("data-tab-name")){
        //console.log("Found a tab: ", el);
        $(el).unbind("click");
        $(el).bind("click", Tabs.setActive);
      }
    });

    // Make the active tab visible
    instance.$("ul.nav > li.active > a").each(function (i, el) {
      if(el){
        //console.log("Making tab active: ", el);
        Tabs.setActive({
          target: el
        });
      }
    });

    return this;
  },

  /**
   * Set the active tab for a tab set
   */
  setActive: function (event) {
    var el = $(event.target),
      tabName = el.attr("data-tab-name");

    if(tabName){
      //console.log("Setting tab: ", tabName);
      var nav = $(event.target).closest(".nav"),
        tabContainer = nav.nextAll(".tab-container");

      if(!tabContainer.length){
        tabContainer = nav.closest(".vert-nav").prev(".vert-tab-container").children(".tab-container");
      }

      // update the tab bar
      nav.children("li").removeClass("active");
      $(event.target).closest("li").addClass("active");

      // update the tabs
      tabContainer.children(".tab.active").removeClass("active");
      tabContainer.children(".tab[data-tab-name='" + tabName + "']").addClass("active");
    }
  },

  /**
   * Set the first tab to active
   * @param instance The template instance that is calling
   */
  activateFirst: function (instance) {
    // set the active tab if none is set
    //console.log("Activate First:")
    instance.$("ul.nav").each(function (i, el) {
      var activeTab = $(el).find("li.active > a").get(0);
      if(!activeTab) {
        var firstTab = $(el).find("li > a").first().get(0);
        Tabs.setActive({
          target: firstTab
        });
      }
    });
    return this;
  }
};
