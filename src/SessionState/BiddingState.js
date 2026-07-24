const SessionState = require("./SessionState.js");
const ReviewingState = require("./ReviewingState.js");

class BiddingState extends SessionState {
    name() { return "Bidding"; }

    enterBid(session, paper, reviewer, interest) {
        session._internalRegisterBid(paper, reviewer, interest);
    }

    closeBidAndAssign(session) {
        session._assignReviewers();
        session.transitionTo(new ReviewingState());
    }
}

module.exports = BiddingState;