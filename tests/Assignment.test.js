const Session = require("../src/Session");
const User = require("../src/User");
const Paper = require("../src/Paper");
const { Interests } = require("../src/Bid");

let session;

let reviewer1;
let reviewer2;
let reviewer3;
let reviewer4;
let reviewer5;
let reviewer6;
let reviewer7;

let author1;
let author2;


beforeEach(() => {

    session = new Session();

    // Reviewers
    reviewer1 = new User("R1", "Uni", "r1@u.com", "pass");
    reviewer2 = new User("R2", "Uni", "r2@u.com", "pass");
    reviewer3 = new User("R3", "Uni", "r3@u.com", "pass");
    reviewer4 = new User("R4", "Uni", "r4@u.com", "pass");
    reviewer5 = new User("R5", "Uni", "r5@u.com", "pass");
    reviewer6 = new User("R6", "Uni", "r6@u.com", "pass");
    reviewer7 = new User("R7", "Uni", "r7@u.com", "pass");

    // Authors (not reviewers)
    author1 = new User("A1", "Uni", "a1@u.com", "pass");
    author2 = new User("A2", "Uni", "a2@u.com", "pass");


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

        const paper =
            new Paper(`Paper ${paperIndex}`,[author1, author2],author1);

        session.submit(paper);

        submittedPapers.push(paper);
    }

    return submittedPapers;
}



describe("Reviewer assignment — basics", () => {

    it("should assign exactly 3 reviewers per paper", () => {

        const submittedPapers = submitPapers(3);

        session.closeSubmissions();
        session.closeAndAssign();

        submittedPapers.forEach(paper => {

            expect(session.assignmentsFor(paper)).toHaveLength(3);

        });
    });

    it("should transition to Reviewing stage after assignment", () => {

        submitPapers(1);

        session.closeSubmissions();
        session.closeAndAssign();


        expect(session.stage())
            .toBe("Reviewing");

    });



    it("should not allow closeAndAssign outside Bidding stage", () => {

        expect(() => session.closeAndAssign())
            .toThrow();

    });


});




describe("Reviewer assignment — distribution (⌈3A/R⌉)", () => {


    it("should distribute 10 papers among 7 reviewers correctly (2 do 5, 5 do 4)", () => {


        const submittedPapers = submitPapers(10);


        session.closeSubmissions();
        session.closeAndAssign();

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


                    reviewerAssignmentCounts.set(
                        reviewer,
                        reviewerAssignmentCounts.get(reviewer) + 1
                    );


                });

        });



        const assignmentAmounts =
            [
                ...reviewerAssignmentCounts.values()

            ].sort(
                (firstAmount, secondAmount) =>
                    firstAmount - secondAmount
            );



        // 5 reviewers with 4 assignments, 2 reviewers with 5 assignments

        expect(
            assignmentAmounts.filter(
                amount => amount === 5
            )

        ).toHaveLength(2);



        expect(
            assignmentAmounts.filter(
                amount => amount === 4
            )

        ).toHaveLength(5);


    });




    it("should distribute 3 papers among 3 reviewers (each gets 3)", () => {


        const isolatedSession = new Session();


        [
            reviewer1,
            reviewer2,
            reviewer3

        ].forEach(reviewer =>
            isolatedSession.addReviewer(reviewer)
        );



        const submittedPapers = [];



        for (
            let paperIndex = 0;
            paperIndex < 3;
            paperIndex++
        ) {


            const paper =
                new Paper(
                    `Paper ${paperIndex}`,
                    [author1],
                    author1
                );


            isolatedSession.submit(paper);

            submittedPapers.push(paper);

        }



        isolatedSession.closeSubmissions();
        isolatedSession.closeAndAssign();



        const reviewerAssignmentCounts =
            new Map(

                [
                    reviewer1,
                    reviewer2,
                    reviewer3

                ].map(reviewer => [reviewer, 0])

            );



        submittedPapers.forEach(paper => {


            isolatedSession.assignmentsFor(paper)
                .forEach(reviewer => {


                    reviewerAssignmentCounts.set(
                        reviewer,
                        reviewerAssignmentCounts.get(reviewer) + 1
                    );


                });


        });



        reviewerAssignmentCounts.forEach(
            assignmentAmount =>
                expect(assignmentAmount).toBe(3)
        );


    });


});





describe("Reviewer assignment — bid priority", () => {



    it("should prefer Interested reviewers over Maybe", () => {


        const isolatedSession = new Session();


        [
            reviewer1,
            reviewer2,
            reviewer3

        ].forEach(reviewer =>
            isolatedSession.addReviewer(reviewer)
        );



        const paper =
            new Paper(
                "Test Paper",
                [author1],
                author1
            );



        isolatedSession.submit(paper);


        isolatedSession.closeSubmissions();



        isolatedSession.enterBid(
            paper,
            reviewer1,
            Interests.NotInterested
        );


        isolatedSession.enterBid(
            paper,
            reviewer2,
            Interests.Maybe
        );


        isolatedSession.enterBid(
            paper,
            reviewer3,
            Interests.Interested
        );



        isolatedSession.closeAndAssign();



        const assignedReviewers =
            isolatedSession.assignmentsFor(paper);



        expect(assignedReviewers)
            .toContain(reviewer3);


    });





    it("should fill remaining slots with Maybe if not enough Interested", () => {


        const isolatedSession = new Session();



        [
            reviewer1,
            reviewer2,
            reviewer3

        ].forEach(reviewer =>
            isolatedSession.addReviewer(reviewer)
        );



        const paper =
            new Paper(
                "Test Paper",
                [author1],
                author1
            );



        isolatedSession.submit(paper);


        isolatedSession.closeSubmissions();



        isolatedSession.enterBid(
            paper,
            reviewer1,
            Interests.Interested
        );


        isolatedSession.enterBid(
            paper,
            reviewer2,
            Interests.Maybe
        );



        isolatedSession.closeAndAssign();



        const assignedReviewers =
            isolatedSession.assignmentsFor(paper);



        expect(assignedReviewers)
            .toContain(reviewer1);


        expect(assignedReviewers)
            .toContain(reviewer2);


        expect(assignedReviewers)
            .toContain(reviewer3);


    });


});





describe("Reviewer assignment — conflict of interest", () => {

    it("should not assign a reviewer who is an author of the paper", () => {
        const isolatedSession = new Session();
        [reviewer1,reviewer2,reviewer3,reviewer4].forEach(reviewer => isolatedSession.addReviewer(reviewer));

        const conflictPaper = new Paper("Conflict Paper",[reviewer1, author1],reviewer1);

        isolatedSession.submit(conflictPaper);
        isolatedSession.closeSubmissions();
        isolatedSession.closeAndAssign();

        const assignedReviewers = isolatedSession.assignmentsFor(conflictPaper); 

        expect(assignedReviewers).not.toContain(reviewer1);

        expect(assignedReviewers).toHaveLength(3);
    });


});