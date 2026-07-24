const SessionState = require("./SessionState.js");
const BiddingState = require("./BiddingState.js");

class ReceivingState extends SessionState {
    name() { return "Receiving"; }

    submit(session, paper) {
        if (!paper.isValid()) {
            throw new Error("Cannot submit invalid paper");
        }
        session.addPaper(paper)
    }

    closeSubmissions(session) {
        session.transitionTo(new BiddingState());
    }
}

module.exports = ReceivingState;