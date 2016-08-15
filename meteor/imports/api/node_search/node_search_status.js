export const NodeSearchStatus = {
  match: 0,
  noMatch: 1,
  missing: 2,
  extra: 3
};
export const NodeSearchStatusLookup = _.invert(NodeSearchStatus);
