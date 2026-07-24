const AcceptanceStrategy = require("./AcceptanceStrategy.js");

class AcceptanceByPercentage extends AcceptanceStrategy {

    constructor(percentage){
        super()
        this._percentage = percentage;
    }


    accept(papers){

        const amount = Math.floor(papers.length * this._percentage / 100);
        const sorted = this._sortByScore(papers)    

        return sorted.slice(0, amount);
    }
}


module.exports = AcceptanceByPercentage;