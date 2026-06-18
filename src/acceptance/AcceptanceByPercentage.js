const AcceptanceStrategy = require("./AcceptanceStrategy");

class AcceptanceByPercentage extends AcceptanceStrategy {

    constructor(percentage){
        super()
        this._percentage = percentage;
    }


    accept(papers){

        const amount = Math.floor(papers.length * this._percentage / 100);

        const sorted = [...papers].sort((a,b)=> b.score() - a.score()); 
        //usa una copia de papers con "..." (para no modificar el original, lo cual hace .sort())
        //a score() se le debe pasar una funcion como argumento

        return sorted.slice(0, amount);
    }
}


module.exports = AcceptanceByPercentage;