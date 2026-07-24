class AcceptanceStrategy {
    accept(papers){
        throw new Error ("Acceptance Strategy must implement accept()")
    }

    _sortByScore (papers){
        return [...papers].sort((paperA,paperB) => paperB.score() - paperA.score());         
        //usa una copia de papers con "..." (para no modificar el original, lo cual hace .sort())
        //a score() se le debe pasar una funcion como argumento
    }
}

module.exports = AcceptanceStrategy;