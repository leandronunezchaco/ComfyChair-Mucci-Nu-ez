const Paper = require("../src/Paper");
const Review = require("../src/Review");
const User = require("../src/User");

let paper;
let author, reviewer1, reviewer2, reviewer3;

beforeEach(()=>{
    author = new User("Author", "UNLP", "r1@u.com", "pass");
    reviewer1 = new User("Rev1", "UNLP", "r1@u.com", "pass");
    reviewer2 = new User("Rev2", "UNLP", "r2@u.com", "pass");
    reviewer3 = new User("Rev3", "UNLP", "r3@u.com", "pass");
    paper = new Paper("Title 1",[reviewer1, reviewer2],reviewer1);
});

describe("A Paper", ()=>{
    it("should receive up to 3 reviews", ()=>{
        paper.addReview(reviewer1, "Paper is terrible", -3);
        expect(paper.reviews()).toHaveLength(1);
        paper.addReview(reviewer3, "Paper is bad", -2);
        paper.addReview(reviewer3, "Paper is awesome", 3);
        expect(() => paper.addReview(reviewer2, "Paper is meh", 0)).toThrow();
    })
    it("score should be the score average of its reviews", ()=>{
        expect(paper.score()).toBe(0);
        paper.addReview(reviewer3, "Paper is terrible", -3);
        expect(paper.score()).toBe(-3);
        paper.addReview(reviewer1, "Paper is bad", -2);
        expect(paper.score()).toBe(-2.5);
        paper.addReview(reviewer2, "Paper is awesome", 3);
        expect(paper.score()).toBeCloseTo(-0.66666);
    })
})