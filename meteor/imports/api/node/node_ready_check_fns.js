export const NodeReadyCheckFns = {
  waitForChecked : {
    type : 0,
    label: "Is Checked",
    fn   : "waitForChecked",
    args : []
  },
  waitForEnabled : {
    type : 1,
    label: "Is Enabled",
    fn   : "waitForEnabled",
    args : []
  },
  waitForExist  : {
    type : 2,
    label: "Exists",
    fn   : "waitForExist",
    args : []
  },
  waitForSelected: {
    type : 3,
    label: "Is Selected",
    fn   : "waitForSelected",
    args : []
  },
  waitForText    : {
    type : 4,
    label: "Has Text",
    fn   : "waitForText",
    args : [ "text" ]
  },
  waitForValue   : {
    type : 5,
    label: "Has Value",
    fn   : "waitForValue",
    args : [ "value" ]
  },
  waitForVisible : {
    type : 6,
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