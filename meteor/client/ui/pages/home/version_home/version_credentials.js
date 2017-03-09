import './version_credentials.html';
import { Template } from 'meteor/templating';
import { Nodes } from '../../../../../imports/api/nodes/nodes.js';
import { NodeTypes } from '../../../../../imports/api/nodes/node_types.js';
import { Util } from '../../../../../imports/api/util.js';
import '../../../components/datastores/datastore_data_table.js';

/**
 * Template Helpers
 */
Template.VersionCredentials.helpers({
  userTypes() {
    return Nodes.find({ projectVersionId: this._id, type: NodeTypes.userType }, { sort: { title: 1 } });
  },
  userTitleClean(){
    return Util.dataKey(this.title);
  }
});

/**
 * Template Helpers
 */
Template.VersionCredentials.events({});

/**
 * Template Created
 */
Template.VersionCredentials.created = function () {
  
};

/**
 * Template Rendered
 */
Template.VersionCredentials.rendered = function () {
};

/**
 * Template Destroyed
 */
Template.VersionCredentials.destroyed = function () {
  
};
