export const NodeReadyCheckFns = {
  waitForChecked : {
    label: "Is Checked",
    fn   : "waitForChecked",
    args : []
  },
  waitForEnabled : {
    label: "Is Enabled",
    fn   : "waitForEnabled",
    args : []
  },
  waitForExist  : {
    label: "Exists",
    fn   : "waitForExist",
    args : []
  },
  waitForSelected: {
    label: "Is Selected",
    fn   : "waitForSelected",
    args : []
  },
  waitForText    : {
    label: "Has Text",
    fn   : "waitForText",
    args : [ "text" ]
  },
  waitForValue   : {
    label: "Has Value",
    fn   : "waitForValue",
    args : [ "value" ]
  },
  waitForVisible : {
    label: "Is Visible",
    fn   : "waitForVisible",
    args : []
  }
};
/*
 export const NodeReadyCheckFnsLookup = _.invert(_.mapObject(NodeReadyCheckFns, (fn) => {
 return fn.type
 }));
 */