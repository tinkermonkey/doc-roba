/**
 * Search data status enum
 */
NodeSearchStatus = {
  match: 0,
  noMatch: 1,
  missing: 2,
  extra: 3
};
NodeSearchStatusLookup = _.invert(NodeSearchStatus);

/**
 * Node search
 */
NodeSearch = {
  /**
   * Search scoring
   */
  score: {
    url: 5,
    param: 5,
    title: 5,
    pageTitle: 5
  },

  /**
   * Return a list of weighted results based on matching the URL
   * @param url
   * @param projectVersionId
   */
  byUrl: function (url, title, projectVersionId) {
    //Meteor.log.debug("searchNodes: " + url+ ", " + title + ", " + projectVersionId);
    var maxScore    = -100000,
      searchResults = [];

    // go through each node and score it against the current url
    Nodes.find({projectVersionId: projectVersionId, type: {$in: [NodeTypes.page, NodeTypes.view]}}).forEach(function (node) {
      //console.log("Checking node ", node._id, node.url, node.pageTitle);
      // initialize the score
      var result = {
        node: node,
        score: {
          total: 0,
          max: 0
        },
        url:    NodeSearch.compareUrl(url, node.url),
        params: NodeSearch.compareParams(url, node.urlParameters),
        title:  NodeSearch.compareTitle(title, node.pageTitle)
      };

      // calculate the score
      result.score.total = result.url.score + result.params.score + result.title.score;

      // update the max values
      maxScore = result.score.total > maxScore ? result.score.total : maxScore;

      // store the score
      searchResults.push(result);
    });

    // set the max score for all of the results
    _.each(searchResults, function (result) { result.score.max = maxScore});

    // sort the results by score
    return _.sortBy(searchResults.filter(function (result) { return result.score.total }), function (result) {return maxScore - result.score.total});
  },

  /**
   * Return a list of nodes
   * @param url
   * @param projectVersionId
   */
  byTerm: function (searchTerm, projectVersionId) {
    //Meteor.log.debug("NodeSearch.byTerm: " + searchTerm, projectVersionId);

    if(!searchTerm || !searchTerm.length){
      return [];
    }

    var maxScore    = -100000,
      check         = new RegExp(searchTerm, "i"),
      searchParams  = ['title', 'pageTitle', 'url'],
      searchResults = [];

    // go through each node and score it against the current url
    Nodes.find({
      projectVersionId: projectVersionId,
      type: {$in: [NodeTypes.page, NodeTypes.view]},
      $or: [
        { title: {$regex: searchTerm, $options: "i"}},
        { pageTitle: {$regex: searchTerm, $options: "i"}},
        { url: {$regex: searchTerm, $options: "i"}}
      ]
    }).forEach(function (node) {
      var result = {
        searchTerm: searchTerm,
        node: node,
        score: {
          total: 0
        }
      };

      _.each(searchParams, function (param) {
        if(node[param]){
          result.score[param] = node[param].match(check) ? NodeSearch.score[param] : 0;
        } else {
          result.score[param] = 0;
        }
        result.score.total += result.score[param];
      });

      // update the max values
      maxScore = result.score.total > maxScore ? result.score.total : maxScore;

      // store the score
      searchResults.push(result);
    });

    // set the max score for all of the results
    _.each(searchResults, function (result) { result.score.max = maxScore});

    // sort the results by score
    return _.sortBy(searchResults, function (result) {return maxScore - result.score.total});
  },

  /**
   * Check to see if an adventure is still at the last known node
   * @param instance The adventure console instance
   */
  checkAdventureLocation: function (instance) {
    check(instance, Blaze.TemplateInstance);

    var data = instance.data,
      node = Nodes.findOne({staticId: data.adventure.lastKnownNode});

    // check the local url
    if(node && node.url && data.state && data.state.url){
      var result = NodeSearch.compareNode(data.state.url, data.state.title, node);

      if(result.url.match && result.params.match && result.title.match){
        //console.log("checkCurrentLocation, param match, location known");
        instance.currentNode.set(node.staticId);
      } else {
        //console.log("checkCurrentLocation, no param match, location unknown");
        instance.currentNode.set();
      }
    } else {
      instance.currentNode.set();
    }
  },

  /**
   * Check to see if a node matches a url & title
   * @param url
   * @param title
   * @param node
   */
  compareNode: function (url, title, node) {
    check(url, String);
    check(title, String);
    check(node, Object);

    // check the local url
    var result = {
        url:    NodeSearch.compareUrl(url, node.url),
        params: NodeSearch.compareParams(url, node.urlParameters),
        title:  NodeSearch.compareTitle(title, node.pageTitle)
      };
    return result;
  },

  /**
   * Compare a url to a node url
   * @param url
   * @param nodeUrl
   */
  compareUrl: function (url, nodeUrl) {
    var result = {
        match: true,
        score: 0,
        pieces: []
      },
      pathPieces = Util.urlPath(url).split("/").filter(function (piece) {return piece.length}),
      i;

    if(nodeUrl){
      var nodeUrlPieces = nodeUrl.split("/").filter(function (piece) {return piece.length});

      // format any wildcards in the node url
      _.each(nodeUrlPieces, function (piece, i) {
        nodeUrlPieces[i] = piece.replace(/\*/, ".*?");
      });

      // compare the two urls
      var pieceCount = Math.min(pathPieces.length, nodeUrlPieces.length);
      //console.log("compareUrl, pieceCount: ", pieceCount);
      for(i = 0; i < pieceCount; i++){
        //if(pathPieces[i].match(new RegExp("^" + nodeUrlPieces[i] + "$"))){
        if(pathPieces[i].match(nodeUrlPieces[i])){
          result.pieces.push({
            index: i,
            status: NodeSearchStatus.match,
            search: nodeUrlPieces[i],
            value: pathPieces[i]
          });
          result.score += NodeSearch.score.url;
          //console.log("compareUrl, url match: ", nodeUrlPieces[i]);
        } else {
          result.pieces.push({
            index: i,
            status: NodeSearchStatus.noMatch,
            search: nodeUrlPieces[i],
            value: pathPieces[i]
          });
          //result.score -= NodeSearch.score.url;
          result.match = false;
          //console.log("compareUrl, url noMatch: ", nodeUrlPieces[i]);
        }
      }

      // catalog the missing pieces
      for(i = pieceCount; i < pathPieces.length; i++){
        //console.log("Extra: ", pathPieces[i]);
        result.pieces.push({
          index: i,
          status: NodeSearchStatus.missing,
          search: pathPieces[i],
          value: pathPieces[i]
        });
        result.match = false;
        //console.log("compareUrl, url missing: ", pathPieces[i]);
      }

      // catalog the extra pieces
      for(i = pieceCount; i < nodeUrlPieces.length; i++){
        //console.log("Missing: ", pathPieces[i]);
        result.pieces.push({
          index: i,
          status: NodeSearchStatus.extra,
          search: nodeUrlPieces[i],
          value: nodeUrlPieces[i]
        });
        result.match = false;
        //console.log("compareUrl, url extra: ", nodeUrlPieces[i]);
      }

      // subtract any difference in url length
      //console.log("compareUrl, subtracting: ", result.score.url, Math.abs(pathPieces.length - nodeUrlPieces.length));
      //result.score -= Math.abs(pathPieces.length - nodeUrlPieces.length) * NodeSearch.score.url;
    } else {
      // catalog the missing pieces
      for(i = 0; i < pathPieces.length; i++){
        //console.log("Missing: ", pathPieces[i]);
        result.pieces.push({
          index: i,
          status: NodeSearchStatus.missing,
          search: pathPieces[i],
          value: pathPieces[i]
        });
        //console.log("compareUrl, url missing: ", pathPieces[i]);
        result.match = false;
      }
      //result.score -= pathPieces.length * NodeSearch.score.url;
    }
    //console.log("compareUrl, url score: ", result.score);

    return result;
  },

  /**
   * Compare url parameters to a node urlParameters set
   * @param url
   * @param nodeUrl
   */
  compareParams: function (url, nodeUrlParameters) {
    var result = {
        match: true,
        score: 0,
        pieces: []
      },
      params = Util.urlParams(url),
      i;

    //console.log("compareParams, params: ", params);

    // calculate the param match score
    //console.log("compareParams, scoring params");
    if(nodeUrlParameters){
      // compare the two urls
      var pieceCount = Math.min(params.length, nodeUrlParameters.length);
      //console.log("compareParams, pieceCount: ", pieceCount);
      for(i = 0; i < pieceCount; i++){
        if(params[i].param == nodeUrlParameters[i].param && params[i].value == nodeUrlParameters[i].value){
          result.pieces.push({
            index: i,
            status: NodeSearchStatus.match,
            search: {
              param: params[i].param,
              value: params[i].value
            },
            value: {
              param: nodeUrlParameters[i].param,
              value: nodeUrlParameters[i].value
            }
          });
          result.score += NodeSearch.score.param;
          //console.log("compareParams, param match: ", params[i].param, params[i].value);
        } else {
          result.pieces.push({
            index: i,
            status: NodeSearchStatus.noMatch,
            search: {
              param: params[i].param,
              value: params[i].value
            },
            value: {
              param: nodeUrlParameters[i].param,
              value: nodeUrlParameters[i].value
            }
          });
          //result.score -= NodeSearch.score.param;
          result.match = false;
          //console.log("compareParams, param noMatch: ", params[i].param, params[i].value);
        }
      }

      // catalog the missing pieces
      for(i = pieceCount; i < params.length; i++){
        //console.log("Extra: ", pathPieces[i]);
        result.pieces.push({
          index: i,
          status: NodeSearchStatus.missing,
          search: {
            param: params[i].param,
            value: params[i].value
          },
          value: {
            param: params[i].param,
            value: params[i].value
          }
        });
        result.match = false;
        //console.log("compareParams, param missing: ", params[i].param, params[i].value);
      }

      // catalog the extra pieces
      for(i = pieceCount; i < nodeUrlParameters.length; i++){
        //console.log("Missing: ", pathPieces[i]);
        result.pieces.push({
          index: i,
          status: NodeSearchStatus.extra,
          search: {
            param: nodeUrlParameters[i].param,
            value: nodeUrlParameters[i].value
          },
          value: {
            param: nodeUrlParameters[i].param,
            value: nodeUrlParameters[i].value
          }
        });
        result.match = false;
        //console.log("compareParams, param extra: ", nodeUrlParameters[i].param, nodeUrlParameters[i].value);
      }

      // subtract any difference in url length
      //console.log("compareParams, subtracting: ", result.score.url, Math.abs(pathPieces.length - nodeUrlPieces.length));
      //result.score -= Math.abs(params.length - nodeUrlParameters.length) * NodeSearch.score.param;
    } else {
      // catalog the missing params
      for(i = 0; i < params.length; i++){
        //console.log("Missing: ", params[i]);
        result.pieces.push({
          index: i,
          status: NodeSearchStatus.missing,
          search: {
            param: params[i].param,
            value: params[i].value
          },
          value: {
            param: params[i].param,
            value: params[i].value
          }
        });
        //console.log("compareParams, param noMatch: ", params[i].param, params[i].value);
        result.match = false;
      }
      //result.score -= params.length * NodeSearch.score.param;
    }

    return result;
  },

  /**
   * Compare a title to a node page title
   * @param title
   * @param nodePageTitle
   */
  compareTitle: function (title, nodePageTitle) {
    var result = {
        match: true,
        score: 0,
        pieces: []
      },
      titlePieces = title.split(" "),
      i;

    // trim extra whitespace
    _.each(titlePieces, function (piece, i) {
      titlePieces[i] = piece.trim();
    });

    // check the node title
    if(nodePageTitle) {
      // clean up the title regex
      var titleRegex = nodePageTitle.replace(/\*/g, ".*?"),
        nodeTitlePieces = titleRegex.split(" ");

      // check for a full match
      if(title.match(titleRegex)){
        // good to go
        result.pieces.push({
          index: i,
          status: NodeSearchStatus.match,
          search: nodePageTitle,
          value: title
        });
        result.score += nodeTitlePieces.length * NodeSearch.score.title;
      } else {
        // No match, catalog the differences
        result.match = false;

        var pieceCount = Math.min(titlePieces.length, nodeTitlePieces.length);
        for(i = 0; i < pieceCount; i++){
          //console.log("NodeTitlePiece: ", nodeTitlePieces[i], titlePieces[i]);
          if(titlePieces[i].match(nodeTitlePieces[i])){
            result.pieces.push({
              index: i,
              status: NodeSearchStatus.match,
              search: nodeTitlePieces[i],
              value: titlePieces[i]
            });
            result.score += NodeSearch.score.title;
          } else {
            result.pieces.push({
              index: i,
              status: NodeSearchStatus.noMatch,
              search: nodeTitlePieces[i],
              value: titlePieces[i]
            });
            //result.score -= NodeSearch.score.title;
          }
        }

        // catalog the missing pieces
        for(i = pieceCount; i < titlePieces.length; i++){
          //console.log("Extra: ", titlePieces[i]);
          result.pieces.push({
            index: i,
            status: NodeSearchStatus.missing,
            search: titlePieces[i],
            value: titlePieces[i]
          });
        }

        // catalog the extra pieces
        for(i = pieceCount; i < nodeTitlePieces.length; i++){
          //console.log("Missing: ", titlePieces[i]);
          result.pieces.push({
            index: i,
            status: NodeSearchStatus.extra,
            search: nodeTitlePieces[i],
            value: nodeTitlePieces[i]
          });
        }

        // subtract any difference in url length
        //result.score -= Math.abs(titlePieces.length - nodeTitlePieces.length) * NodeSearch.score.title;
      }
    } else {
      // catalog the missing params
      for(i = 0; i < titlePieces.length; i++){
        //console.log("Missing: ", titlePieces[i]);
        result.pieces.push({
          index: i,
          status: NodeSearchStatus.missing,
          search: titlePieces[i],
          value: titlePieces[i]
        });
        //console.log("compareTitle, piece missing: ", titlePieces[i]);
        result.match = false;
      }
      //result.score -= titlePieces.length * NodeSearch.score.title;
    }

    return result;
  }
};
