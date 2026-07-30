// SessionState.js
class SessionState {
    name() {
        throw new Error("Method 'name()' must be implemented.");
    }

    submit(session, paper) {
        throw new Error(`Cannot submit papers in ${this.name()} stage.`);
    }
    closeSubmissions(session) {
        throw new Error(`Cannot close submissions from ${this.name()} stage.`);
    }

    enterBid(session, paper, reviewer, interest) {
        throw new Error(`Cannot enter bids in ${this.name()} stage.`);
    }
    closeBidAndAssign(session) {
        throw new Error(`Cannot assign reviewers from ${this.name()} stage.`);
    }

    addReview(session, paper, reviewer, text, score) {
        throw new Error(`Cannot add reviews in ${this.name()} stage.`);
    }
    closeReviewing(session) {
        throw new Error(`Cannot close reviewing from ${this.name()} stage.`);
    }

    selectPapers(session) {
        throw new Error(`Cannot select papers in ${this.name()} stage.`);
    }
}

module.exports = SessionState;