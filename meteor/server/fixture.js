if (Collections.Nodes.find().count() === 0) {
  Meteor.log.info('No data found, executing data fixture');

  // Create a user
  var user1 = Meteor.users.findOne({username: "demo@gmail.com"});
  if(!user1){
    Meteor.log.info("Fixture: Creating User");
    Accounts.createUser({
      username: "demo@gmail.com",
      email: "demo@gmail.com",
      password: "Password1",
      profile: {
        name: "Demo User"
      }
    });
    user1 = Meteor.users.findOne({username: "demo@gmail.com"});
  }

  // Create a project
  var project1 = Collections.Projects.findOne({title: "Demo Project"});
  if(!project1){
    Meteor.log.info("Fixture: Creating Project");
    Collections.Projects.insert({
      title: "Demo Project",
      owner: user1._id,
      createdBy: user1._id,
      modifiedBy: user1._id
    });
    project1 = Collections.Projects.findOne({title: "Demo Project"});
  }

  // Create a project version
  var project1Version1 = Collections.ProjectVersions.findOne({projectId: project1._id});
  if(!project1Version1){
    Meteor.log.info("Fixture: Creating Project Version");
    Collections.ProjectVersions.insert({
      projectId: project1._id,
      version: "0.1",
      createdBy: user1._id,
      modifiedBy: user1._id
    });
    project1Version1 = Collections.ProjectVersions.findOne({projectId: project1._id});
  }
  
  // Add the user's role to the project
  var project1Version1Role1 = Collections.ProjectRoles.findOne({projectId: project1._id, userId: user1._id});
  if(!project1Version1Role1){
    Meteor.log.info("Fixture: Creating Project Role");
    Collections.ProjectRoles.insert({
      projectId: project1._id,
      userId: user1._id,
      name: user1.profile.name,
      email: user1.emails[0].address,
      role: RoleTypes.owner,
      createdBy: user1._id,
      modifiedBy: user1._id
    });
    project1Version1Role1 = Collections.ProjectRoles.findOne({projectId: project1._id, userId: user1._id});
  }

  // start with the list of nodes
  var rootNode = {
      title: "docRoba",
      type: NodeTypes.root,
      children: [
        {
          title: "Admin",
          type: NodeTypes.userType,
          children: [
            {
              title: "Web",
              type: NodeTypes.platform,
              children: [
                {
                  title: "Log In",
                  type: NodeTypes.page,
                  children: [
                    {
                      title: "Admin Home",
                      type: NodeTypes.page,
                      children: [

                      ]
                    }
                  ]
                },{
                  title: "Sign Up",
                  type: NodeTypes.page,
                  children: [

                  ]
                }
              ]
            },{
              title: "iOS",
              type: NodeTypes.platform,
              children: [

              ]
            }
          ]
        },{
          title: "Tester",
          type: NodeTypes.userType,
          children: [
            {
              title: "Web",
              type: NodeTypes.platform,
              children: [
                {
                  title: "Log In",
                  type: NodeTypes.page,
                  children: [
                    {
                      title: "Tester Home",
                      type: NodeTypes.page,
                      children: [

                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },{
          title: "Developer",
          type: NodeTypes.userType,
          children: [
            {
              title: "Web",
              type: NodeTypes.platform,
              children: [
                {
                  title: "Log In",
                  type: NodeTypes.page,
                  children: [
                    {
                      title: "Developer Home",
                      type: NodeTypes.page,
                      children: [

                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

  var addNode = function (node, parentId, projectId, versionId, userId) {
    // insert the node
    console.log("Inserting node: ", node.title, parentId, projectId, versionId, userId );
    var parent = Collections.Nodes.findOne({staticId: parentId, projectVersionId: versionId});
      nodeId = Collections.Nodes.insert({
        title: node.title,
        type: node.type,
        parentId: parentId,
        projectId: projectId,
        projectVersionId: versionId,
        userTypeId: parent.type == NodeTypes.userType ? parent.staticId : parent.userTypeId,
        platformId: parent.type == NodeTypes.platform ? parent.staticId : parent.platformId,
        createdBy: userId,
        modifiedBy: userId
    });

    // get the static id to link the nodes correctly
    var newNode = Collections.Nodes.findOne(nodeId);

    if(node.children) {
      _.each(node.children, function (d) {
        addNode(d, newNode.staticId, projectId, versionId, userId);
      });
    }
  };

  // Create the nodes for the 1st project
  addNode(rootNode, null, project1._id, project1Version1._id, user1._id);

  // Create some fields for the user types
  var userTypes = Collections.Nodes.find({type: NodeTypes.userType, projectId: project1._id, projectVersionId: project1Version1._id});
  userTypes.forEach(function (userTypeNode) {
    // locate the data store
    var dataStore = Collections.DataStores.findOne({dataKey: userTypeNode._id});

    if(dataStore){
      // add some fields
      var fields = ["Email", "Password", "Name", "Enrolled"];
      _.each(fields, function (field, fieldIndex) {
        console.log("Fixture: Adding field", field, "to user type", userTypeNode.title);
        var check = Collections.DataStoreFields.findOne({
          title: field,
          dataStoreId: dataStore._id
        });
        if(!check){
          Collections.DataStoreFields.insert({
            title: field,
            dataKey: Util.dataKey(field),
            type: FieldTypes.string,
            order: fieldIndex + 1,
            dataStoreId: dataStore._id,
            projectId: project1._id,
            projectVersionId: project1Version1._id,
            createdBy: user1._id,
            modifiedBy: user1._id
          });
        }
      });
    } else {
      console.error("Failed to find dataStore for user type ", userTypeNode.title, userTypeNode._id);
    }
  });

  // Create a server record
  var project1Server1 = Collections.Servers.findOne({projectVersionId: project1Version1._id, title: "Localhost"});
  if(!project1Server1){
    Meteor.log.info("Fixture: Creating Project Server");
    Collections.Servers.insert({
      projectId: project1._id,
      projectVersionId: project1Version1._id,
      title: "Localhost",
      url: "http://localhost:3000",
      active: true,
      createdBy: user1._id,
      modifiedBy: user1._id
    });
    project1Server1 = Collections.Servers.findOne({projectVersionId: project1Version1._id, title: "Localhost"});
  }

  // Create a test-system
  var project1TestSystem1 = Collections.TestSystems.findOne({projectVersionId: project1Version1._id, title: "Localhost"});
  if(!project1TestSystem1){
    Meteor.log.info("Fixture: Creating Project Test System");
    Collections.TestSystems.insert({
      projectId: project1._id,
      projectVersionId: project1Version1._id,
      title: "Localhost",
      url: "http://localhost:3000",
      active: true,
      createdBy: user1._id,
      modifiedBy: user1._id
    });
    project1TestSystem1 = Collections.Servers.findOne({projectVersionId: project1Version1._id, title: "Localhost"});
  }

  // Create a set of user-agents
  var testAgents = [
    {},
  ];
  _.each(testAgents, function (agent) {

  });

  // Create another user
  var user2 = Meteor.users.findOne({username: "demo2@gmail.com"});
  if(!user2){
    Meteor.log.info("Fixture: Creating User");
    Accounts.createUser({
      username: "demo2@gmail.com",
      email: "demo2@gmail.com",
      password: "Password1",
      profile: {
        name: "Another User"
      }
    });
    user2 = Meteor.users.findOne({username: "demo2@gmail.com"});
  }

  // Create a project
  var project2 = Collections.Projects.findOne({title: "Another Project"});
  if(!project2){
    Meteor.log.info("Fixture: Creating Project");
    Collections.Projects.insert({
      title: "Another Project",
      owner: user2._id,
      createdBy: user2._id,
      modifiedBy: user2._id
    });
    project2 = Collections.Projects.findOne({title: "Another Project"});
  }

  // Create a project version
  var project2Version1 = Collections.ProjectVersions.findOne({projectId: project2._id});
  if(!project2Version1){
    Meteor.log.info("Fixture: Creating Project Version");
    Collections.ProjectVersions.insert({
      projectId: project2._id,
      version: "1.0",
      createdBy: user2._id,
      modifiedBy: user2._id
    });
    project2Version1 = Collections.ProjectVersions.findOne({projectId: project2._id});
  }

  // Add the user's role to the project
  var project2Version1Role1 = Collections.ProjectRoles.findOne({projectId: project2._id, userId: user2._id});
  if(!project2Version1Role1){
    Meteor.log.info("Fixture: Creating Project Role");
    Collections.ProjectRoles.insert({
      projectId: project2._id,
      userId: user2._id,
      name: user2.profile.name,
      email: user2.emails[0].address,
      role: RoleTypes.owner,
      createdBy: user2._id,
      modifiedBy: user2._id
    });
    project2Version1Role1 = Collections.ProjectRoles.findOne({projectId: project2._id, userId: user2._id});
  }

  // Add the first user to the 2nd project as a tester
  var project2Version1Role2 = Collections.ProjectRoles.findOne({projectId: project2._id, userId: user1._id});
  if(!project2Version1Role2){
    Meteor.log.info("Fixture: Creating Project Role");
    Collections.ProjectRoles.insert({
      projectId: project2._id,
      userId: user1._id,
      name: user1.profile.name,
      email: user1.emails[0].address,
      role: RoleTypes.tester,
      createdBy: user2._id,
      modifiedBy: user2._id
    });
    project2Version1Role2 = Collections.ProjectRoles.findOne({projectId: project2._id, userId: user2._id});
  }

  // start with the list of nodes
  var rootNode2 = {
    title: "docRoba",
    type: NodeTypes.root,
    children: [
      {
        title: "Admin",
        type: NodeTypes.userType,
        children: [
          {
            title: "Web",
            type: NodeTypes.platform,
            children: [
              {
                title: "Log In",
                type: NodeTypes.page,
                children: [
                  {
                    title: "Admin Home",
                    type: NodeTypes.page,
                    children: [

                    ]
                  }
                ]
              },{
                title: "Sign Up",
                type: NodeTypes.page,
                children: [

                ]
              }
            ]
          },{
            title: "iOS",
            type: NodeTypes.platform,
            children: [

            ]
          }
        ]
      },{
        title: "Tester",
        type: NodeTypes.userType,
        children: [
          {
            title: "Web",
            type: NodeTypes.platform,
            children: [
              {
                title: "Log In",
                type: NodeTypes.page,
                children: [
                  {
                    title: "Tester Home",
                    type: NodeTypes.page,
                    children: [

                    ]
                  }
                ]
              }
            ]
          }
        ]
      },{
        title: "Developer",
        type: NodeTypes.userType,
        children: [
          {
            title: "Web",
            type: NodeTypes.platform,
            children: [
              {
                title: "Log In",
                type: NodeTypes.page,
                children: [
                  {
                    title: "Developer Home",
                    type: NodeTypes.page,
                    children: [

                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  // Create the nodes for the 1st project
  addNode(rootNode2, null, project2._id, project2Version1._id, user2._id);
}
