const AcceptanceStrategy = require("../src/AcceptanceStrategies/AcceptanceStrategy");
const AcceptanceByPercentage = require("../src/AcceptanceStrategies/AcceptanceByPercentage");
const AcceptanceByCount = require("../src/AcceptanceStrategies/AcceptanceByCount");
const AcceptanceByScoreThreshold = require("../src/AcceptanceStrategies/AcceptanceByThreshold"); //el archivo se llama AcceptanceByThreshold pero la clase es AcceptanceByScoreThreshold
const Session = require("../src/Session");
const Paper = require("../src/Paper");
const User = require("../src/User");

describe("1. AcceptanceStrategy (Clase Base Abstracta)", () => {
    it("debe lanzar un error si se invoca el método accept() directamente desde la clase base", () => {
        const strategy = new AcceptanceStrategy();
        expect(() => strategy.accept([])).toThrow("Acceptance Strategy must implement accept()");
    });
});

describe("2. Estrategia: AcceptanceByPercentage", () => {
    let mockPapers;
    let reviewer1;
    let reviewer2;
    let reviewer3;

    beforeEach(() => {
        const session = new Session();

        author = new User("Autor", "UNLP", "author@u.com", "pass");

        reviewer1 = new User("Rev1", "UNLP", "r1@u.com", "pass");
        reviewer2 = new User("Rev2", "UNLP", "r2@u.com", "pass");
        reviewer3 = new User("Rev3", "UNLP", "r3@u.com", "pass");

        // Creamos objetos simulados (mocks) de papers con diferentes puntajes ordenados aleatoriamente
        session.addReviewer(reviewer1);
        session.addReviewer(reviewer2);
        session.addReviewer(reviewer3);

        mockPapers = [
            { score: () => 1.0 },
            { score: () => 3.0 },
            { score: () => -2.0 },
            { score: () => 0.5 }
        ];
    });

    it("debe seleccionar el porcentaje correcto de papers ordenados de mayor a menor score", () => {
        const strategy = new AcceptanceByPercentage(50); // 50% de 4 papers = 2 papers
        const accepted = strategy.accept(mockPapers);

        expect(accepted).toHaveLength(2);
        expect(accepted[0].score()).toBe(3.0); // El mejor puntaje
        expect(accepted[1].score()).toBe(1.0); // El segundo mejor
    });

    it("debe devolver un arreglo vacío si el porcentaje es 0", () => {
        const strategy = new AcceptanceByPercentage(0);
        const accepted = strategy.accept(mockPapers);
        expect(accepted).toHaveLength(0);
    });

    it("debe aceptar todos los papers si el porcentaje es 100", () => {
        const strategy = new AcceptanceByPercentage(100);
        const accepted = strategy.accept(mockPapers);
        expect(accepted).toHaveLength(4);
        expect(accepted[0].score()).toBe(3.0); // Verifica que aun así se mantenga ordenado
    });

    it("debe redondear hacia abajo (Math.floor) si el porcentaje no da un número entero de papers", () => {
        const strategy = new AcceptanceByPercentage(35); // 35% de 4 = 1.4 -> Math.floor da 1 paper
        const accepted = strategy.accept(mockPapers);
        expect(accepted).toHaveLength(1);
        expect(accepted[0].score()).toBe(3.0);
    });
});

describe("3. Estrategia: AcceptanceByCount", () => {
    let mockPapers;

    beforeEach(() => {
        mockPapers = [
            { score: () => 2.0 },
            { score: () => -1.0 },
            { score: () => 3.0 }
        ];
    });

    it("debe lanzar un error en el constructor si la cantidad (count) es negativa", () => {
        expect(() => new AcceptanceByCount(-5)).toThrow("Count must be positive");
    });

    it("debe seleccionar exactamente la cantidad fija de mejores papers especificada", () => {
        const strategy = new AcceptanceByCount(2);
        const accepted = strategy.accept(mockPapers);

        expect(accepted).toHaveLength(2);
        expect(accepted[0].score()).toBe(3.0);
        expect(accepted[1].score()).toBe(2.0);
    });

    it("debe devolver todos los papers disponibles si el cupo máximo es mayor al total enviado", () => {
        const strategy = new AcceptanceByCount(10);
        const accepted = strategy.accept(mockPapers);
        expect(accepted).toHaveLength(3);
    });

    it("debe devolver un arreglo vacío si el cupo configurado es 0", () => {
        const strategy = new AcceptanceByCount(0);
        const accepted = strategy.accept(mockPapers);
        expect(accepted).toHaveLength(0);
    });
});

describe("4. Estrategia: AcceptanceByScoreThreshold", () => {
    let mockPapers;

    beforeEach(() => {
        mockPapers = [
            { score: () => 2.5 },
            { score: () => 0.0 },
            { score: () => -1.5 },
            { score: () => 3.0 }
        ];
    });

    it("debe lanzar un error si el umbral está fuera del rango permitido [-3, 3]", () => {
        expect(() => new AcceptanceByScoreThreshold(-3.1)).toThrow("Invalid threshold");
        expect(() => new AcceptanceByScoreThreshold(4)).toThrow("Invalid threshold");
    });

    it("debe aceptar todos los papers cuyo score sea estrictamente mayor o igual al umbral", () => {
        const strategy = new AcceptanceByScoreThreshold(1.0);
        const accepted = strategy.accept(mockPapers);

        expect(accepted).toHaveLength(2);
        expect(accepted).toContain(mockPapers[0]); // 2.5
        expect(accepted).toContain(mockPapers[3]); // 3.0
    });

    it("debe incluir papers que tengan exactamente el mismo puntaje que el umbral", () => {
        const strategy = new AcceptanceByScoreThreshold(0.0);
        const accepted = strategy.accept(mockPapers);

        expect(accepted).toHaveLength(3); // 2.5, 0.0 y 3.0
        expect(accepted).not.toContain(mockPapers[2]); // -1.5 queda excluido
    });
});

describe("5. Integración: Session con AcceptanceStrategy", () => {
    let session, author, reviewer;

    beforeEach(() => {
        session = new Session();
        author = new User("Autor", "UNLP", "author@u.com", "pass");
        reviewer = new User("Revisor", "UNLP", "reviewer@u.com", "pass");
        session.addReviewer(reviewer);
    });

    it("debe lanzar un error si se intenta seleccionar papers sin haber configurado una estrategia", () => {
        const paper = new Paper("UnPaper", [author], author);
        session.submit(paper);
        session.closeSubmissions();
        session.closeAndAssign();
        session.closeReviewing(); // Forzamos estado a 'Selection'

        expect(() => session.selectPapers()).toThrow();
    });

    it("debe ejecutar con éxito la selección delegando en la estrategia inyectada dinámicamente", () => {
        const paperA = new Paper("Paper A", [author], author);
        const paperB = new Paper("Paper B", [author], author);
        
        session.submit(paperA);
        session.submit(paperB);
        session.closeSubmissions();
        session.closeAndAssign();

        // Cargamos revisiones para generar puntajes diferenciados
        session.addReview(paperA, reviewer, "Excelente trabajo", 3);  // Score: 3
        session.addReview(paperB, reviewer, "Flojo", -1);             // Score: -1
        
        session.closeReviewing(); // Cambia a etapa 'Selection'

        // Inyectamos la estrategia dinámicamente en el atributo de la sesión
        const countStrategy = new AcceptanceByCount(1);
        session._acceptanceStrategy = countStrategy;

        const accepted = session.selectPapers();
        
        expect(accepted).toHaveLength(1);
        expect(accepted[0]).toBe(paperA); // Solo el de mejor puntaje entra por cupo de 1
    });
});