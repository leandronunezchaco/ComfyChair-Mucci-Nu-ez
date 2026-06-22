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
        return this.bidFor(paper, reviewer).interest();
    }

    //  asignación consigna 4.1 
    _assignReviewers() {
        const submittedPapers = this._papers;
        const availableReviewers  = this._programCommittee;
        const totalArticles = submittedPapers.length;
        const totalReviewers = availableReviewers.length;

        if (totalReviewers == 0) throw new Error("No reviewers available");
        if (totalArticles === 0) return;

        // calcula cuántas revisiones debe hacer cada revisor
        const totalReviewsRequired  = 3 * totalArticles;
        const reviewsPerReviewer  = Math.floor(totalReviewsRequired / totalReviewers);
        const remainingReviews  = totalReviewsRequired % totalReviewers;

       //Calculamos la capacidad que puede tener cada revisor
        const capacity = new Map();
        availableReviewers.forEach((reviewer, index) => {
            capacity.set(reviewer, index < remainingReviews ? reviewsPerReviewer  + 1 : reviewsPerReviewer );
        });

        
        submittedPapers.forEach(paper => this._assignments.set(paper, []));

        // orden de prioridad para un revisor en un artículo determinado
        const priorityOf = (paper, reviewer) => {
            const bid = this.bidFor(paper, reviewer);
            if (!bid) return 2;                              
            if (bid.interest() === Interests.Interested) return 0;
            if (bid.interest() === Interests.Maybe) return 1;
            if (bid.interest() === Interests.NotInterested) return 3;
            return 4;
        };

    
        const authorsOf = (paper) => paper._authors || [];

      // asignación en 3 rondas, un revisor por artículo por ronda.
        for (let round = 0; round < 3; round++) {
            for (const paper of submittedPapers) {
                const assigned = this._assignments.get(paper);
                if (assigned.length > round) continue;

                const authors = authorsOf(paper);

                const eligible = availableReviewers
                    .filter(r =>
                        !authors.includes(r) &&
                        capacity.get(r) > 0 &&
                        !assigned.includes(r)
                    )
                    .sort((a, b) => priorityOf(paper, a) - priorityOf(paper, b));

                if (eligible.length === 0) {
                    
                    const borrowable = availableReviewers.find(reviewer =>
                        !authors.includes(reviewer) &&
                        !assigned.includes(reviewer)
                    );
                    if (!borrowable)
                        throw new Error(`Could not assign 3 reviewers to paper: "${paper.title()}"`);
                    capacity.set(borrowable, capacity.get(borrowable) + 1);
                    assigned.push(borrowable);
                    capacity.set(borrowable, capacity.get(borrowable) - 1);
                } else {
                    const chosen = eligible[0];
                    assigned.push(chosen);
                    capacity.set(chosen, capacity.get(chosen) - 1);
                }
            }
        }
    }

    assignmentsFor(paper) {
        return this._assignments.get(paper) || [];
    }

    isAssigned(paper, reviewer) {
        return this.assignmentsFor(paper).includes(reviewer);
    }

    _interestLevelFor(paper, reviewer) {
        const bid = this.bidFor(paper, reviewer);
        return bid ? bid.interest() : null;
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
