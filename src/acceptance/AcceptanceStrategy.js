class AcceptanceStrategy {
    accept(papers){
        throw new Error ("Acceptance Strategy must implement accept()")
    }
}

module.exports = AcceptanceStrategy;