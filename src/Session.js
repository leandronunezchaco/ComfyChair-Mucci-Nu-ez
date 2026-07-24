const {Bid, Interests} = require("./Bid");
const ReceivingState = require("./SessionState/ReceivingState");
const ReviewingState = require("./SessionState/ReviewingState");

class Session {
    constructor() {
        this._name = "";
        this._programCommittee = [];
        this._papers = [];
        this._bids = [];
        this._assignments = new Map(); 
        this._stage = new ReviewingState();
        this._acceptanceStrategy = null

    }

    name() { return this._name; }
    programCommittee() { return this._programCommittee; }
    reviewers() { return this._programCommittee; }

    addReviewer(user) {
        this._programCommittee.push(user);
    }

    stage() {return this._stage.name();}

    transitionTo(nextStage){
        this.stage = nextStage;}

    submit(paper) {
        this._stage.submit(this,paper)
    }

    closeSubmissions() {
        this._state.closeSubmissions(this);
    }

    enterBid(paper, reviewer, interest) {
        this._state.enterBid(this, paper, reviewer, interest);
    }

    closeAndAssign() {
        this._state.closeAndAssign(this);
    }

    addReview(paper, reviewer, text, score) {
        this._state.addReview(this, paper, reviewer, text, score);
    }
    closeReviewing() {
        this._state.closeReviewing(this);
    }
    selectPapers() {
        return this._state.selectPapers(this);
    }

    //  Métodos de Ayuda e Internos 
    canSubmit(paper) {
        return this.stage() === "Receiving" && paper.isValid();
    }

    _internalAddPaper(paper) {
        this._papers.push(paper);
    }

    _internalRegisterBid(paper, reviewer, interest) {
        if (this.bidExistsFor(paper, reviewer)) {
            this.bidFor(paper, reviewer).setInterest(interest);
        } else {
            this._bids.push(new Bid(paper, reviewer, interest));
        }
    }

    papers() { return this._papers; }
    bids() { return this._bids; }

    bidExistsFor(paper, reviewer) {
        return typeof this.bidFor(paper, reviewer) !== "undefined";
    }

    bidFor(paper, reviewer) {
        return this._bids.find(bid => bid.paper() === paper && bid.reviewer() === reviewer);
    }

    interestFor(paper, reviewer) {
        const bid = this.bidFor(paper, reviewer);
        return bid ? bid.interest() : Interests.NotInterested;
    }

    // Strategy Pattern getter/setter
    acceptanceStrategy() { return this._acceptanceStrategy; }
    setAcceptanceStrategy(strategy) {
        this._acceptanceStrategy = strategy;
    }

    //  Métodos de Asignación 
    assignmentsFor(paper) {
        return this._assignments.get(paper) || [];
    }

    isAssigned(paper, reviewer) {
        return this.assignmentsFor(paper).includes(reviewer);
    }

    _assignReviewers() {
        const submittedPapers = this._papers;
        const availableReviewers = this._programCommittee;

        if (availableReviewers.length === 0)
            throw new Error("No reviewers available");

        if (submittedPapers.length === 0)
            return;

        const capacity = this._buildCapacityMap(submittedPapers.length, availableReviewers);

        submittedPapers.forEach(paper =>
            this._assignments.set(paper, [])
        );

        for (let round = 0; round < 3; round++) {
            for (const paper of submittedPapers) {
                const assignedReviewers = this._assignments.get(paper);

                if (assignedReviewers.length > round) continue;

                let eligibleReviewers = this._eligibleReviewersFor(
                    paper,
                    availableReviewers,
                    capacity,
                    assignedReviewers
                );

                if (eligibleReviewers.length === 0) {
                    const fallbackReviewer = this._fallbackReviewerFor(
                        paper,
                        availableReviewers,
                        assignedReviewers
                    );

                    if (!fallbackReviewer)
                        throw new Error(`Could not assign reviewers to ${paper.title()}`);

                    assignedReviewers.push(fallbackReviewer);
                    capacity.set(fallbackReviewer, capacity.get(fallbackReviewer) - 1);
                    continue;
                }

                const selectedReviewer = eligibleReviewers[0];
                assignedReviewers.push(selectedReviewer);
                capacity.set(selectedReviewer, capacity.get(selectedReviewer) - 1);
            }
        }
    }

    _fallbackReviewerFor(paper, reviewers, assignedReviewers) {
        const authors = paper.authors();
        return reviewers.find(reviewer => !authors.includes(reviewer) && !assignedReviewers.includes(reviewer));
    }

    _buildCapacityMap(articleCount, reviewers) {
        const totalReviewsRequired = 3 * articleCount;
        const reviewsPerReviewer = Math.floor(totalReviewsRequired / reviewers.length);
        const remainingReviews = totalReviewsRequired % reviewers.length;
        const capacity = new Map();

        reviewers.forEach((reviewer, index) => {
            capacity.set(reviewer, index < remainingReviews ? reviewsPerReviewer + 1 : reviewsPerReviewer);
        });

        return capacity;
    }

    _priorityOf(paper, reviewer) {
        const bid = this.bidFor(paper, reviewer);
        if (!bid) return 2;
        if (bid.interest() === Interests.Interested) return 0;
        if (bid.interest() === Interests.Maybe) return 1;
        if (bid.interest() === Interests.NotInterested) return 3;
        return 4;
    }

    _eligibleReviewersFor(paper, reviewers, capacity, assignedReviewers) {
        const authors = paper.authors() || []; // Corregido paper._authors por paper.authors()
        return reviewers
            .filter(reviewer => !authors.includes(reviewer) && capacity.get(reviewer) > 0 && !assignedReviewers.includes(reviewer))
            .sort((reviewerA, reviewerB) => this._priorityOf(paper, reviewerA) - this._priorityOf(paper, reviewerB));
    }
}


module.exports = Session;
