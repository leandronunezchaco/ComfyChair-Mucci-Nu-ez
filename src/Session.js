const {Bid, Interests} = require("./Bid");

class Session {
    constructor() {
        this._name = "";
        this._programCommittee = [];
        this._papers = [];
        this._bids = [];
        this._assignments = new Map(); 
        this._stage = "Receiving";

        //
        this._acceptanceStrategy = null

    }

    name() { return this._name; }
    programCommittee() { return this._programCommittee; }
    reviewers() { return this._programCommittee; }

    addReviewer(user) {
        this._programCommittee.push(user);
    }

    canSubmit(paper) {
        return this.stage() === "Receiving" && paper.isValid();
    }

    submit(paper) {
        if (!this.canSubmit(paper)) throw new Error("Cannot submit invalid paper");
        this._papers.push(paper);
    }

    papers() { return this._papers; }
    bids() { return this._bids; }
    stage() { return this._stage; }
    setStage(stage) { this._stage = stage; }

    // transiciones
    closeSubmissions() {
        this.setStage("Bidding");
    }

    closeAndAssign() {
        if (this.stage() !== "Bidding") throw new Error("Must be in Bidding stage");
        this._assignReviewers();
        this.setStage("Reviewing");
    }

    closeReviewing() {
        if (this.stage() !== "Reviewing") throw new Error("Must be in Reviewing stage");
        this.setStage("Selection");
    }

    // bidding
    enterBid(paper, reviewer, interest) {
        if (this.stage() !== "Bidding")
            throw new Error("Cannot enter bids from the current stage.");

        if (this.bidExistsFor(paper, reviewer)) {
            this.bidFor(paper, reviewer).setInterest(interest);
        } else {
            this._bids.push(new Bid(paper, reviewer, interest));
        }
    }

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

    //  asignación consigna 4.1 
   _assignReviewers() {

    const submittedPapers = this._papers;
    const availableReviewers = this._programCommittee;


    if (availableReviewers.length === 0)
        throw new Error("No reviewers available");


    if (submittedPapers.length === 0)
        return;


    const capacity = this._buildCapacityMap(
        submittedPapers.length,
        availableReviewers
    );


    submittedPapers.forEach(paper =>
        this._assignments.set(paper, [])
    );


    for (let round = 0; round < 3; round++) {

        for (const paper of submittedPapers) {

            const assignedReviewers = this._assignments.get(paper);

            if (assignedReviewers.length > round)
                continue;


            let eligibleReviewers =
                this._eligibleReviewersFor(
                    paper,
                    availableReviewers,
                    capacity,
                    assignedReviewers
                );


            if (eligibleReviewers.length === 0) {

                const fallbackReviewer =
                    this._fallbackReviewerFor(
                        paper,
                        availableReviewers,
                        assignedReviewers
                    );


                if (!fallbackReviewer)
                    throw new Error(
                        `Could not assign reviewers to ${paper.title()}`
                    );


                assignedReviewers.push(fallbackReviewer);

                capacity.set(
                    fallbackReviewer,
                    capacity.get(fallbackReviewer) - 1
                );

                continue;
            }


            const selectedReviewer = eligibleReviewers[0];

            assignedReviewers.push(selectedReviewer);

            capacity.set(
                selectedReviewer,
                capacity.get(selectedReviewer) - 1
            );
        }
    }
}
    _fallbackReviewerFor(paper, reviewers, assignedReviewers) {

        const authors = paper._authors || [];

        return reviewers.find(reviewer => !authors.includes(reviewer) && !assignedReviewers.includes(reviewer));
    }

    //Calcula cuántas revisiones puede hacer cada reviewer
    _buildCapacityMap(articleCount, reviewers)
{
    const totalReviewsRequired = 3 * articleCount;

    const reviewsPerReviewer = Math.floor(totalReviewsRequired / reviewers.length);
    const remainingReviews = totalReviewsRequired % reviewers.length;
    const capacity = new Map();


    reviewers.forEach((reviewer, index) => {

        capacity.set(reviewer,index < remainingReviews? reviewsPerReviewer + 1: reviewsPerReviewer);
    });

    return capacity;
}

    
    _priorityOf(paper, reviewer) {
        const interest = this.interestFor(paper, reviewer);
        
        if (interest === Interests.Interested) return 0;
        if (interest === Interests.Maybe) return 1;
        if (interest === Interests.NotInterested) return 3;
        
        return 4; 
    }

    _eligibleReviewersFor(paper,reviewers,capacity,assignedReviewers){

    const authors =
        paper._authors || [];


    return reviewers

        .filter(reviewer => !authors.includes(reviewer) && capacity.get(reviewer) > 0 && !assignedReviewers.includes(reviewer))

        .sort((reviewerA, reviewerB) => this._priorityOf(paper, reviewerA) - this._priorityOf(paper, reviewerB));
}

    assignmentsFor(paper) {
        return this._assignments.get(paper) || [];
    }

    isAssigned(paper, reviewer) {
        return this.assignmentsFor(paper).includes(reviewer);
    }

    // carga de revisiones  consigna 4.2
    addReview(paper, reviewer, text, score) {
        if (this.stage() !== "Reviewing")
            throw new Error("Reviews can only be added during the Reviewing stage");
        if (!this.isAssigned(paper, reviewer))
            throw new Error("Reviewer is not assigned to this paper");
        if (score < -3 || score > 3 || !Number.isInteger(score))
            throw new Error("Score must be an integer between -3 and +3");

        paper.addReview(reviewer, text, score);
    }
selectPapers() {

    if (this.stage() !== "Selection")
        throw new Error("Selection can only happen during the Selection stage");

    if (!this._acceptanceStrategy)
        throw new Error("Acceptance strategy must be configured");

    return this._acceptanceStrategy.accept(this._papers);
}

    setAcceptanceStrategy(strategy){
        this._acceptanceStrategy = strategy
    }
}

module.exports = Session;
