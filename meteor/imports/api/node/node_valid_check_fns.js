export const NodeValidCheckFns = {
  isVisible: {
    type : 0,
    label: "Is Visible",
    fn   : "isVisible",
    args : []
  },
  isEnabled: {
    type : 1,
    label: "Is Enabled",
    fn   : "isEnabled",
    args : []
  },
  isExisting: {
    type : 2,
    label: "Is Existing",
    fn   : "isExisting",
    args : []
  },
  isSelected: {
    type : 3,
    label: "Is Selected",
    fn   : "isSelected",
    args : []
  },
  isChecked: {
    type : 4,
    label: "Is Checked",
    fn   : "isChecked",
    args : []
  },
  isNotVisible: {
    type : 5,
    label: "Is Not Visible",
    fn   : "isNotVisible",
    args : []
  },
  isNotEnabled: {
    type : 6,
    label: "Is Not Enabled",
    fn   : "isNotEnabled",
    args : []
  },
  isNotExisting: {
    type : 7,
    label: "Is Not Existing",
    fn   : "isNotExisting",
    args : []
  },
  isNotSelected: {
    type : 8,
    label: "Is Not Selected",
    fn   : "isNotSelected",
    args : []
  },
  isNotChecked: {
    type : 9,
    label: "Is Not Checked",
    fn   : "isNotChecked",
    args : []
  },
  hasText: {
    type : 10,
    label: "Has Text",
    fn   : "hasText",
    args : []
  },
  hasValue: {
    type : 11,
    label: "Has Value",
    fn   : "hasValue",
    args : []
  },
  doesNotHaveText: {
    type : 12,
    label: "Does Not Have Text",
    fn   : "doesNotHaveText",
    args : []
  },
  doesNotHaveValue: {
    type : 13,
    label: "Does Not Have Value",
    fn   : "doesNotHaveValue",
    args : []
  }
};
/*
 export const NodeValidCheckFnsLookup = _.invert(_.mapObject(NodeValidCheckFns, (fn) => {
 return fn.type
 }));
 */