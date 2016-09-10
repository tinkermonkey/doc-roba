import {Accounts} from 'meteor/accounts-base';

Accounts.singleUseAuth = {
  /**
   * Generate and store a one-time password
   */
  generate(options, user) {
    user = user || Meteor.user();
    if(!user) { throw new Meteor.Error("Accounts.singleUserAuth.generate failed: no user specified")}

    var singleUse = {
      token: Random.secret(),
      when: new Date(),
      expires: options.expires || { seconds: 30 }
    };

    // create the record structure if needed
    if(!user.services.singleUse){
      Meteor.users.update(user._id,{ $set: { 'services.singleUse': { verificationTokens: [singleUse] }}});
    } else {
      Meteor.users.update(user._id,{ $push: { 'services.singleUse.verificationTokens': singleUse }});
    }

    return singleUse.token;
  },

  /**
   * Verify a single use token
   * @param token
   */
  verify(token) {
    console.log("Verify: ", token);
    var user = Meteor.users.findOne({
        'services.singleUse.verificationTokens.token': token
      }), tokenRecord, interval, quantity, tokenExpires, now;

    // make sure there a user associated with the token
    if(user){
      tokenRecord = _.find(user.services.singleUse.verificationTokens, function(tokenObj){
        return tokenObj.token === token;
      });

      // validate the token
      if (tokenRecord && tokenRecord.expires) {
        interval = _.keys(tokenRecord.expires)[0];
        quantity = tokenRecord.expires[interval];

        tokenExpires = moment(tokenRecord.when).add(quantity, interval);
        now = moment();

        if (now.isBefore(tokenExpires)) {
          // remove it from the user's token list
          Meteor.users.update(user._id, { $pull: { "services.singleUse.verificationTokens": { token: token }}});

          // success
          return { userId: user._id }
        } else {
          throw new Meteor.Error('Single Use Token expired')
        }
      } else {
        throw new Meteor.Error('Single Use Token not found')
      }
    } else {
      throw new Meteor.Error('Single Use Token user not found')
    }
    //throw new Meteor.Error('Single Use Token not valid')
  }
};

/**
 * Register the login handler to scrape a token and verify it
 */
Accounts.registerLoginHandler('singleUseAuth', function (options) {
  if (options.token === undefined) return undefined;

  check(options, {
    token: String
  });
  console.log("singleUseAuth: ", options);
  return Accounts.singleUseAuth.verify(options.token);
});
