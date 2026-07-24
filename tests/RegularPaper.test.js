const RegularPaper = require("../src/RegularPaper");
const User = require('../src/User');

let reviewer1, reviewer2, reviewer3, paper1;

beforeEach( ()=> {
    reviewer1 = new User("Rev1", "UNLP", "r1@u.com", "pass");
    reviewer2 = new User("Rev2", "UNLP", "r2@u.com", "pass");
    reviewer3 = new User("Rev3", "UNLP", "r3@u.com", "pass");

    paper1 = new RegularPaper("Title 1", [reviewer1, reviewer2], reviewer1, "abstract 1");
});

describe("A new RegularPaper", ()=>{
    it("should have an abstract", ()=>{
        let newPaper = new RegularPaper("newPaper Title", [reviewer1, reviewer2, reviewer3], reviewer1, "newPaper Abstract");
        expect(newPaper.abstract()).not.toBe('');
    });
    it("should have its corresponding author amongst its list of authors", ()=>{
        let validPaper, invalidPaper;
        valid = ()=>{ validPaper = new RegularPaper("validPaper Title", [reviewer1, reviewer2], reviewer1, "abstract");}
        invalid = ()=>{ invalidPaper = new RegularPaper("invalidPaper Title", [reviewer1, reviewer2], reviewer3, "abstract");}
        expect(valid).not.toThrow();
        expect(invalid).toThrow();
    })
})

describe("A RegularPaper", ()=>{
    it("should only be valid if there are authors, title and <300 words abstract", ()=>{
        expect(paper1.isValid()).toBe(true);
    });
    it("should be invalid if the abstract exceeds 300 words", ()=>{
        let abstract = "";
        for (let i = 0; i < 300; i++) {
            abstract += "word "
        };
        paper1.setAbstract(abstract)
        expect(paper1.isValid()).toBe(true);
        abstract += "word ";
        paper1.setAbstract(abstract)
        expect(paper1.isValid()).toBe(false);
    });

})
