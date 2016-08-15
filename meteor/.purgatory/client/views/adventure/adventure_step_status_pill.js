/**
 * Register the status to bootstrap class helper
 */
UI.registerHelper('getStepStatusClass', function () {
    var status = this.status,
      className = "default";
    switch (status){
      case AdventureStepStatus.queued:
        className = "primary";
        break;
      case AdventureStepStatus.running:
        className = "warning";
        break;
      case AdventureStepStatus.complete:
        className = "success";
        break;
      default:
        console.log("getStepStatusClass unknown status:", this.status);
    }
    return className;
});