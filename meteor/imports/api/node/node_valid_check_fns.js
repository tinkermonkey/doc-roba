export const NodeValidCheckFns = {
  isVisible: {
    label: "Is Visible",
    fn   : "isVisible",
    args : []
  },
  isEnabled: {
    label: "Is Enabled",
    fn   : "isEnabled",
    args : []
  },
  isExisting: {
    label: "Is Existing",
    fn   : "isExisting",
    args : []
  },
  isSelected: {
    label: "Is Selected",
    fn   : "isSelected",
    args : []
  },
  isChecked: {
    label: "Is Checked",
    fn   : "isChecked",
    args : []
  },
  isNotVisible: {
    label: "Is Not Visible",
    fn   : "isNotVisible",
    args : []
  },
  isNotEnabled: {
    label: "Is Not Enabled",
    fn   : "isNotEnabled",
    args : []
  },
  isNotExisting: {
    label: "Is Not Existing",
    fn   : "isNotExisting",
    args : []
  },
  isNotSelected: {
    label: "Is Not Selected",
    fn   : "isNotSelected",
    args : []
  },
  isNotChecked: {
    label: "Is Not Checked",
    fn   : "isNotChecked",
    args : []
  },
  hasText: {
    label: "Has Text",
    fn   : "hasText",
    args : [
      { label: "Text" }
    ]
  },
  hasValue: {
    label: "Has Value",
    fn   : "hasValue",
    args : [
      { label: "Value" }
    ]
  },
  doesNotHaveText: {
    label: "Does Not Have Text",
    fn   : "doesNotHaveText",
    args : [
      { label: "Text" }
    ]
  },
  doesNotHaveValue: {
    label: "Does Not Have Value",
    fn   : "doesNotHaveValue",
    args : [
      { label: "Value" }
    ]
  }
};
/*
 export const NodeValidCheckFnsLookup = _.invert(_.mapObject(NodeValidCheckFns, (fn) => {
 return fn.type
 }));
 */