Template.AdventureLogTable.helpers({
  messages: function () {
    console.log("Messages: ", this);
    return LogMessages.find({"context.adventureId": this._id}, {sort: {time: -1}});
  },
  getTimestamp: function () {
    return moment(this.timestamp).format("hh:mm:ss.SSS");
  },
  getData: function () {
    var data = "";
    _.each(this.data, function (d, i) {
      switch (typeof d) {
        case "string":
          if(i === 0){
            data += "<b>" + d + "</b> ";
          } else {
            data += d + " ";
          }
          break;
        case "array":
        case "object":
          data += "<pre>" + JSON.stringify(d, null, "\t") + " </pre>";
          break;
        default:
          data += d.toString() + " ";
      }
    });
    return data;
  },
  formatData: function () {
    var formatted = "",
      data = this;

    switch (typeof data) {
      case "string":
        //if(i === 0){
          formatted += "<b>" + data + "</b> ";
        //} else {
          //formatted += data + " ";
        //}
        break;
      case "array":
      case "object":
        formatted += "<pre>" + JSON.stringify(data, null, "\t") + "</pre> ";
        break;
      default:
        formatted += "<pre>" + data.toString() + "</pre> ";
    }
    return formatted;
  }
});