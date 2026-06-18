const AcceptanceStrategy = require("./AcceptanceStrategy");

class AcceptanceByCount extends AcceptanceStrategy{
    constructor(count){
        this._count = count
    }

    accept(papers) {
        const sorted = [...papers].sort((a,b) => b.score() - a.score())//crea una copia del array de papers y lo ordena de mayor a menor score - IA

        return sorted.slice(0,this._count)
    }
}

module.exports = AcceptanceByCount;