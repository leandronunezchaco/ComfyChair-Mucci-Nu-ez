const AcceptanceStrategy = require("./AcceptanceStrategy");

class AcceptanceByScoreThreshold extends AcceptanceStrategy{
    constructor(threshold){
        this._threshold = threshold
    }

    accept(papers) {
        let filteredPapers = papers.filter(p => p.score() >= this._threshold)

        return filteredPapers
    }
}

module.exports = AcceptanceByThreshold