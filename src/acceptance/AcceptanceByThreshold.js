const AcceptanceStrategy = require("./AcceptanceStrategy");

class AcceptanceByScoreThreshold extends AcceptanceStrategy{
    constructor(threshold){
        super()

        if(threshold < -3 || threshold > 3)
        throw new Error("Invalid threshold");
    
        this._threshold = threshold
    }

    accept(papers) {
        let filteredPapers = papers.filter(paper => paper.score() >= this._threshold)

        return filteredPapers
    }
}

module.exports = AcceptanceByScoreThreshold