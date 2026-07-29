const Poster = require("../src/Poster");
const User = require('../src/User');

let reviewer1, reviewer2, reviewer3;
let poster01;

beforeEach( ()=> {
    reviewer1 = new User("Rev1", "UNLP", "r1@u.com", "pass");
    reviewer2 = new User("Rev2", "UNLP", "r2@u.com", "pass");
    reviewer3 = new User("Rev3", "UNLP", "r3@u.com", "pass");
    poster1 = new Poster("Poster title",[reviewer1, reviewer2],
        reviewer1,
        "https://example.com/poster",
        "https://example.com/sources"
    );

});

describe("A new Poster", ()=>{
    it("should have its corresponding author amongst its list of authors", ()=>{
        const valid = ()=> new Poster("A poster", [reviewer1, reviewer3], reviewer1, "https://example.com/poster", "https://example.com/source");
        const invalid = ()=> new Poster("A poster", [reviewer1, reviewer3], reviewer2, "https://example.com/poster", "https://example.com/source");
        expect(valid).not.toThrow();
        expect(invalid).toThrow();
    });
});

describe("A Poster", ()=>{
    it("should have an attachment URL", ()=>{
        expect(poster1.attachmentUrl()).toBe("https://example.com/poster");
    });
    it("should have a sources URL", ()=>{
        expect(poster1.sourcesUrl()).toBe("https://example.com/sources");
    });
    it("should be valid with title and at least one author", ()=>{
        expect(poster1.isValid()).toBe(true);
    });
    it("should be invalid without a title", ()=>{
        const noTitle = new Poster("", [reviewer1], reviewer1, "https://example.com/poster", "https://example.com/source");
        expect(noTitle.isValid()).toBe(false);
    });
});
