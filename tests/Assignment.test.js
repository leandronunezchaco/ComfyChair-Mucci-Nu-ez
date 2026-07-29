const Session = require("../src/Session");
const User = require("../src/User");
const Paper = require("../src/Paper");
const { Interests } = require("../src/Bid");

let session;
let reviewer1, reviewer2, reviewer3,reviewer4,reviewer5,reviewer6,reviewer7;

let author1;
let author2;

beforeEach(() => {
    session = new Session();

    reviewer1 = new User("Rev1", "UNLP", "r1@u.com", "pass");
    reviewer2 = new User("Rev2", "UNLP", "r2@u.com", "pass");
    reviewer3 = new User("Rev3", "UNLP", "r3@u.com", "pass");
    reviewer4 = new User("Rev4", "UNLP", "r4@u.com", "pass");
    reviewer5 = new User("Rev5", "UNLP", "r5@u.com", "pass");
    reviewer6 = new User("Rev6", "UNLP", "r6@u.com", "pass");
    reviewer7 = new User("Rev7", "UNLP", "r7@u.com", "pass");

    author1 = new User("Aut1", "UNLP", "a1@u.com", "pass");
    author2 = new User("Aut2", "UNLP", "a2@u.com", "pass");

    [
        reviewer1,
        reviewer2,
        reviewer3,
        reviewer4,
        reviewer5,
        reviewer6,
        reviewer7

    ].forEach(reviewer => session.addReviewer(reviewer));
});


function submitPapers(paperCount) {

    const submittedPapers = [];
    for (let paperIndex = 0; paperIndex < paperCount; paperIndex++) {
        const paper = new Paper(`Paper ${paperIndex}`,[author1, author2],author1);
        session.submit(paper);
        submittedPapers.push(paper);
    }

    return submittedPapers;
}

function buildSession(reviewerCount) {

    const newSession = new Session();

    [
        reviewer1,
        reviewer2,
        reviewer3,
        reviewer4,
        reviewer5,
        reviewer6,
        reviewer7
    ]
    .slice(0, reviewerCount)
    .forEach(reviewer => newSession.addReviewer(reviewer));

    return newSession;
}


//#region Reviewer assignment
describe("during reviewer assignment", () => {

    it("should assign three reviewers to each paper", () => {
        const submittedPapers = submitPapers(3);
        session.closeSubmissions();
        session.closeBidAndAssign();

        submittedPapers.forEach(paper => {
            expect(session.assignmentsFor(paper)).toHaveLength(3);
        });
    });

    it("should transition to Reviewing after assigning reviewers", () => {
        submitPapers(1);

        session.closeSubmissions();
        session.closeBidAndAssign();

        expect(session.state()).toBe("Reviewing");
    });

    it("should reject reviewer assignment outside the Bidding stage", () => {
        expect(() => session.closeBidAndAssign()).toThrow();
    });
});
//#endregion

//#region Reviewer assignment distribution
describe("Reviewer assignment — distribution (⌈3A/R⌉)", () => {

    it("should distribute 10 papers among 7 reviewers correctly (2 do 5, 5 do 4)", () => {

        const submittedPapers = submitPapers(10);

        session.closeSubmissions();
        session.closeBidAndAssign();

        const reviewerAssignmentCounts =
            new Map(

                [
                    reviewer1,
                    reviewer2,
                    reviewer3,
                    reviewer4,
                    reviewer5,
                    reviewer6,
                    reviewer7

                ].map(reviewer => [reviewer, 0])
            );

        submittedPapers.forEach(paper => {

            session.assignmentsFor(paper)
                .forEach(reviewer => {
                    reviewerAssignmentCounts.set(reviewer, reviewerAssignmentCounts.get(reviewer) + 1);
                });
        });

        const assignmentCounts =
            [
                ...reviewerAssignmentCounts.values()

            ].sort((firstAmount, secondAmount) => firstAmount - secondAmount);

        expect(assignmentCounts.filter(amount => amount === 5)).toHaveLength(2);
        expect(assignmentCounts.filter(amount => amount === 4)).toHaveLength(5);
    });

    it("should distribute 3 papers among 3 reviewers (each gets 3)", () => {
       const isolatedSession = buildSession(3)

        const submittedPapers = [];

        for (let paperIndex = 0;paperIndex < 3;paperIndex++) {

            const paper = new Paper(`Paper ${paperIndex}`,[author1],author1);

            isolatedSession.submit(paper);
            submittedPapers.push(paper);
        }

        isolatedSession.closeSubmissions();
        isolatedSession.closeBidAndAssign();

        const reviewerAssignmentCounts =
            new Map(
                [
                    reviewer1,
                    reviewer2,
                    reviewer3

                ].map(reviewer => [reviewer, 0])
            );

        submittedPapers.forEach(paper => {
            isolatedSession.assignmentsFor(paper).forEach(reviewer => {

                    reviewerAssignmentCounts.set(reviewer,reviewerAssignmentCounts.get(reviewer) + 1);
                });
        });

        reviewerAssignmentCounts.forEach(assignmentAmount => expect(assignmentAmount).toBe(3));
    });
});
//#endregion

//#region Reviewer assignment bid priority
describe("Reviewer assignment — bid priority", () => {

    it("should prefer Interested reviewers over Maybe", () => {

        const isolatedSession = buildSession(3)

        const paper = new Paper("Test Paper",[author1],author1);

        isolatedSession.submit(paper);
        isolatedSession.closeSubmissions();
        isolatedSession.enterBid(paper,reviewer1,Interests.NotInterested);
        isolatedSession.enterBid(paper,reviewer2,Interests.Maybe);
        isolatedSession.enterBid(paper,reviewer3,Interests.Interested);
        isolatedSession.closeBidAndAssign();

        const assignedReviewers = isolatedSession.assignmentsFor(paper);

        expect(assignedReviewers).toContain(reviewer3);
    });


    it("should fill remaining slots with Maybe if not enough Interested", () => {

        const isolatedSession = buildSession(3);        
        const paper = new Paper("Test Paper",[author1],author1);

        isolatedSession.submit(paper);
        isolatedSession.closeSubmissions();

        isolatedSession.enterBid(paper,reviewer1,Interests.Interested);

        isolatedSession.enterBid(paper,reviewer2,Interests.Maybe);
        isolatedSession.closeBidAndAssign();

        const assignedReviewers = isolatedSession.assignmentsFor(paper);

        expect(assignedReviewers).toContain(reviewer1);
        expect(assignedReviewers).toContain(reviewer2);
        expect(assignedReviewers).toContain(reviewer3);
    });
});
//#endregion


//#region Reviewer assignment conflict of interest
describe("Reviewer assignment — conflict of interest", () => {

    it("should not assign a reviewer who is an author of the paper", () => {

        const isolatedSession = buildSession(4);

        const conflictPaper = new Paper("Conflict Paper",[reviewer1, author1],reviewer1);

        isolatedSession.submit(conflictPaper);
        isolatedSession.closeSubmissions();
        isolatedSession.closeBidAndAssign();

        const assignedReviewers = isolatedSession.assignmentsFor(conflictPaper); 

        expect(assignedReviewers).not.toContain(reviewer1);
        expect(assignedReviewers).toHaveLength(3);
    });
});
//#endregion