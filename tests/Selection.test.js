const Session = require("../src/Session.js");
const User = require("../src/User.js");
const Paper = require("../src/Paper.js");

const AcceptanceByPercentage = require("../src/acceptanceStrategies/AcceptanceByPercentage.js")

let session, author, reviewer1, reviewer2, reviewer3;

function buildSession(paperCount) {
    const session = new Session();

        author = new User("Aut", "UNLP", "author@u.com", "pass");
        reviewer1 = new User("Rev1", "UNLP", "r1@u.com", "pass");
        reviewer2 = new User("Rev2", "UNLP", "r2@u.com", "pass");
        reviewer3 = new User("Rev3", "UNLP", "r3@u.com", "pass");


    [reviewer1, reviewer2, reviewer3].forEach(reviewer => session.addReviewer(reviewer));
    
    const submittedPapers = [];
    for (let i = 0; i < paperCount; i++) {
        const p = new Paper(`Paper ${i}`, [author], author);
        session.submit(p);
        submittedPapers.push(p);
    }
    
    session.closeSubmissions();
    session.closeAndAssign();
    return { session, submittedPapers };
}

describe("Paper selection", () => {
    it("should select top papers by score up to the acceptance percentage", () => {
        const { session, submittedPapers } = buildSession(4);
        // Add reviews to differentiate scores
        submittedPapers.forEach((paper, index) => {
            const [reviewer1, reviewer2, reviewer3] = session.assignmentsFor(paper);
            const score = index - 1; // scores: -1, 0, 1, 2
            session.addReview(paper, reviewer1, "Review", Math.max(-3, Math.min(3, score)));
        });
        session.closeReviewing();
        session.setAcceptanceStrategy(new AcceptanceByPercentage(50)); // accept 2 out of 4
        const accepted = session.selectPapers();
        expect(accepted).toHaveLength(2);
        // The two highest-scored papers should be selected
        expect(accepted).toContain(submittedPapers[3]); // score 2
        expect(accepted).toContain(submittedPapers[2]); // score 1
    });

    it("should return no papers if percentage is 0", () => {
        const { session, submittedPapers } = buildSession(2);
        session.closeReviewing();
        session.setAcceptanceStrategy(new AcceptanceByPercentage(0));
        expect(session.selectPapers()).toHaveLength(0);
    });

    it("should return all papers if percentage is 100", () => {
        const { session, submittedPapers } = buildSession(3);
        session.closeReviewing();
        session.setAcceptanceStrategy(new AcceptanceByPercentage(100));
        expect(session.selectPapers()).toHaveLength(3);
    });

    it("should not allow selection outside the Selection stage", () => {
        const { session } = buildSession(1);
        expect(() => session.selectPapers()).toThrow();
    });


    it("should use floor when percentage doesn't yield a whole number", () => {
        // 3 papers, 33% → floor(3 * 0.33) = 0... use 34% → floor(1.02) = 1
        const { session } = buildSession(3);
        session.closeReviewing();
        session.setAcceptanceStrategy(new AcceptanceByPercentage(34));
        expect(session.selectPapers()).toHaveLength(1);
    });
});
