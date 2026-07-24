const SessionState = require("./SessionState.js");
const BiddingState = require("./BiddingState.js");

class ReviewingState extends SessionState {
    name() { return "Reviewing"; }

    addReview(session, paper, reviewer, text, score) {
        if (!session.isAssigned(paper, reviewer)) {
            throw new Error("Reviewer is not assigned to this paper");
        }
        if (score < -3 || score > 3 || !Number.isInteger(score)) {
            throw new Error("Score must be an integer between -3 and +3");
        }

        paper.addReview(reviewer, text, score);
    }

    closeReviewing(session) {
        session.transitionTo(new SelectionState());
    }
}

module.exports = ReviewingState;