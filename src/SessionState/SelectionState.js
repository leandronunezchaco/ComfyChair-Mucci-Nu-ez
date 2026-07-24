const SessionState = require("./SessionState.js");

class SelectionState extends SessionState {
    name() { return "Selection"; }

    selectPapers(session) {
        if (!session.acceptanceStrategy()) {
            throw new Error("Acceptance strategy must be configured");
        }
        return session.acceptanceStrategy().accept(session.papers());
    }
}

module.exports = SelectionState;