const { Bid, Interests } = require("../src/Bid");
const Paper = require("../src/Paper");
const User = require("../src/User");

let reviewer1, reviewer2;
let paper1;
let bid;

beforeEach( ()=> {
    reviewer1 = new User("Rev1", "UNLP", "r1@u.com", "pass");
    reviewer2 = new User("Rev2", "UNLP", "r2@u.com", "pass");
    
    paper1 = new Paper("Title 1", [reviewer1, reviewer2], reviewer1, "abstract 1");
    bid = new Bid(paper1, reviewer1, Interests.Interested);
});

describe("A new Bid", ()=>{
    it("should know its paper", ()=>{
        expect(bid.paper()).toBe(paper1);
    });
    it("should know its reviewer", ()=>{
        expect(bid.reviewer()).toBe(reviewer1);
    });
    it("should know its interest level", ()=>{
        expect(bid.interest()).toBe(Interests.Interested);
    });
});

describe("An existing Bid", ()=>{
    it("should allow changing the interest level", ()=>{
        bid.setInterest(Interests.Maybe);
        expect(bid.interest()).toBe(Interests.Maybe);
    });
    it("should support all interest levels", ()=>{
        bid.setInterest(Interests.NotInterested);
        expect(bid.interest()).toBe(Interests.NotInterested);
        bid.setInterest(Interests.Maybe);
        expect(bid.interest()).toBe(Interests.Maybe);
        bid.setInterest(Interests.Interested);
        expect(bid.interest()).toBe(Interests.Interested);
    });
});
