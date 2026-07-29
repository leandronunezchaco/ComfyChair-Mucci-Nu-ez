const Session = require("../src/Session");
const User = require("../src/User");
const Paper = require("../src/Paper");
const {Bid, Interests} = require("../src/Bid");
const AcceptanceByPercentage = require("../src/AcceptanceStrategies/AcceptanceByPercentage");


let newSession;
let asse;
let reviewer1, reviewer2, reviewer3;
let paper1, paper2, paper3;

beforeEach( ()=> {
    newSession = new Session();
    asse = new Session();

    author1 = new User("Aut1", "UNLP", "a1@u.com", "pass");
    author2 = new User("Aut2", "UNLP", "a2@u.com", "pass");
    author3 = new User("Aut3", "UNLP", "a3@u.com", "pass");

    reviewer1 = new User("Rev1", "UNLP", "r1@u.com", "pass");
    reviewer2 = new User("Rev2", "UNLP", "r2@u.com", "pass");
    reviewer3 = new User("Rev3", "UNLP", "r3@u.com", "pass");

    paper1 = new Paper("Title 1", [author1, author2], author1, "abstract 1");
    paper2 = new Paper("Title 2", [author3, author2], author3, "abstract 2");
    paper3 = new Paper("Title 3", [author1, author3], author1, "abstract 3");
            
});

//#region Session creation
describe("A new Session", () =>{
    it("should have an empty name", ()=> {
        expect(newSession.name()).toBe("");
    })

    it("should have an empty Program Committee", ()=>{
        expect(newSession.programCommittee()).toHaveLength(0);
    })

    it("should start in Receiving state", () => {
        expect(newSession.state()).toBe("Receiving")
    })
})
//#endregion

//#region Program Commitee
describe("Program commitee", ()=> {
    it("should allow adding reviewers", ()=> {
        const testReviewer = new User("test","UNLP", "test@u.com","pass")

        asse.addReviewer(testReviewer)

        expect(asse.reviewers()).toContain(testReviewer)
        expect(asse.reviewers()).toHaveLength(1)
    })
})
//#endregion

//#region Receiving Stage
describe("During Receiving stage", () => {
    it("should allow submitting a valid paper",() =>{
        newSession.submit(paper1)
        expect(newSession.papers()).toContain(paper1)
    })

    it("should reject invalid papers", ()=> {
        const invalidPaper = new Paper("",[author1],author1)
        
        expect(() => newSession.submit(invalidPaper)).toThrow()
    })

     it("should transition to Bidding when submissions are closed", () => {

        newSession.closeSubmissions();

        expect(newSession.state()).toBe("Bidding");

    });

})
//#endregion

//#region Bidding Stage
describe("During the bidding process, a Session", ()=>{

     beforeEach(() => {

        asse.addReviewer(reviewer1);
        asse.addReviewer(reviewer2);
        asse.addReviewer(reviewer3);

        asse.submit(paper1);
        asse.closeSubmissions();
    });

    it("should accept bids", ()=>{
        asse.enterBid(paper1, reviewer1, Interests.Interested);
        expect(asse.bidExistsFor(paper1, reviewer1)).toBe(true);
    })
    it("should allow overriding bids", ()=>{
        asse.enterBid(paper1, reviewer1, Interests.Interested);
        const secondBid = () => {asse.enterBid(paper1, reviewer1, Interests.Maybe)};
        expect(secondBid).not.toThrow();
        expect(asse.interestFor(paper1, reviewer1)).toBe(Interests.Maybe);
        expect(asse.bids()).toHaveLength(1);
    })

    it("should reject submissions during Bidding", ()=>{
        expect(() => asse.submit(paper1)).toThrow();
    })

    it("should reject bids before Bidding stage", () => {
    expect(() =>
        newSession.enterBid(paper1, reviewer1, Interests.Interested)
    ).toThrow();
    })

    it("should transition to Reviewing after assigning reviewers", () => {
    asse.closeBidAndAssign();
    expect(asse.state()).toBe("Reviewing");

    });
});

//#region Reviewing Stage
describe("Durgin the revieweing process, a Session", ()=>{

     beforeEach(() => {

        asse.addReviewer(reviewer1);
        asse.addReviewer(reviewer2);
        asse.addReviewer(reviewer3);

        asse.submit(paper1);
        asse.closeSubmissions();
        asse.closeBidAndAssign();
    });
    it("should transition to Selection when reviewing is closed", () => {

    asse.closeReviewing();
    expect(asse.state()).toBe("Selection");
});

it("should reject reviews from reviewers that were not assigned", () => {

    const notAssignedReviewer = new User("false title", "UNLP", "out@u.com", "pass");

    expect(() =>
        asse.addReview(paper1, notAssignedReviewer, "Review", 2)
    ).toThrow();

});
it("should reject scores outside the valid range", () => {

    const assignedReviewer = asse.assignmentsFor(paper1)[0];

    expect(() => asse.addReview(paper1, assignedReviewer, "Review", 4)).toThrow();

});

it("should accept reviews from assigned reviewers", () => {

    const assignedReviewer = asse.assignmentsFor(paper1)[0];

    asse.addReview(paper1,assignedReviewer,"Very good paper",3);
    expect(paper1.reviews()).toHaveLength(1);

});


})

describe("During the selection stage", () => {

    beforeEach(() => {

        asse.addReviewer(reviewer1);
        asse.addReviewer(reviewer2);
        asse.addReviewer(reviewer3);

        asse.submit(paper1);

        asse.closeSubmissions();
        asse.closeBidAndAssign();
        asse.closeReviewing();

    });

    it("should require an acceptance strategy", () => {

        expect(() => asse.selectPapers()).toThrow();

    });


it("should allow configuring an acceptance strategy", () => {

    const strategy = new AcceptanceByPercentage(50);

    asse.setAcceptanceStrategy(strategy);

    expect(asse.acceptanceStrategy()).toBe(strategy);

});

it("should reject paper selection before Selection stage", () => {

    expect(() => newSession.selectPapers()).toThrow();

});

});

