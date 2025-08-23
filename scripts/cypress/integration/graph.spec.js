context(' ---------------- Graph tests ---------------- ', () => {

    beforeEach(() => {
        cy.visit('/kanji/');
        cy.get('#graph').click({force: true});
        cy.wait(300);
    });

    describe('GRAPH display', function () {

        it('The GRAPH exists', () => {
            cy.get("#graph-kanji").find("svg")
                .should('have.attr', 'width');
            cy.get("#graph-kanji").find("svg")
                .should('have.attr', 'height');
        });

        it('The GRAPH contains all of the radicals', () => {
            cy.get('g.nodes').find('g.node')
                .should('have.length', 214)
        });

    });

    describe('GRAPH filter', function () {

        it('Nodes from FILTER category gets removed', () => {
            cy.get('#filter').click({force: true});
            cy.checkNodeFilter('Body', 181);
        });

        it('Click on FILTER multiple time makes the nodes appear and disappear', () => {
            cy.get('#filter').click({force: true});
            cy.get('#menu-category').contains("NATURE").should('be.visible');
            cy.checkNodeFilter('Nature', 187);
            cy.checkNodeFilter('Nature', 214);
            cy.checkNodeFilter('Nature', 187);
        });

    });

    describe('GRAPH sort', function () {

    });

});


