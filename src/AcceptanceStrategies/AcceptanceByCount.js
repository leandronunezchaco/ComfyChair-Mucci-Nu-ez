const AcceptanceStrategy = require("./AcceptanceStrategy.js");

class AcceptanceByCount extends AcceptanceStrategy{
    constructor(count){
        super()

        if(count < 0)
        throw new Error("Count must be positive");
    
        this._count = count

    }

    accept(papers) {
        const sorted = this._sortByScore(papers)
        return sorted.slice(0,this._count)
    }
}

module.exports = AcceptanceByCount;