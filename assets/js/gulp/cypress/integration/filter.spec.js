context(' ---------------- Filter test ---------------- ', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:4000/kanji/');
    cy.get('#filter').click({force: true});
  });

  describe('FILTER submenu actions ', function () {

    it('Cards appear on CATEGORY click part 1', () => {
      cy.checkTileFilter('Number', 1);
      cy.checkTileFilter('Weapon', 2);
      cy.checkTileFilter('Other', 3);
      cy.checkTileFilter('Fishing', 6);
      cy.checkTileFilter('Home', 8);
      cy.checkTileFilter('Body', 9);
      cy.checkTileFilter('Capability', 11);
      cy.checkTileFilter('Nature', 15);
    });

    it('Cards appear on CATEGORY click part 2', () => {
      cy.checkTileFilter('Ceremony', 25);
      cy.checkTileFilter('Society', 26);
      cy.checkTileFilter('Agriculture', 45);
      cy.checkTileFilter('Clothing', 50);
      cy.checkTileFilter('Animal', 58);
      cy.checkTileFilter('Food', 89);
      cy.checkTileFilter('Color', 106);
    });

  });

  describe('sorted FILTER combined actions', function () {

    it('FILTER submenu buttons are visible but not SORT ones', () => {
      cy.get('#Number-label').contains("NUMBER").should('be.visible');
      cy.get('#Number-sort').contains("NUMBER").should('be.hidden');
    });

    it('FILTER submenu disappear on SORT Off', () => {
      cy.get('#Number-label').contains("NUMBER").should('be.visible');
      cy.get('#Number-sort').contains("NUMBER").should('be.hidden');
      cy.get('#sort').click({force: true});
      cy.get('#Number-label').contains("NUMBER").should('be.hidden');
      cy.get('#Number-sort').contains("NUMBER").should('be.visible');
    });

    it('FILTER and SORT can both be applied', () => {
      cy.get('#Body-filter').click({force: true});
      cy.get('#card-29').should('be.visible');
      cy.get('#sort').click({force: true});
      cy.get('#Reading-sort').click({force: true});
      cy.get('#card-116').should('be.hidden');
      cy.get('#card-157').should('be.visible');
    });

    it('FILTER, else FILTER should have all categories unchecked', () => {
      cy.get('#Body-filter').click({force: true});
      cy.get('#card-29').should('be.visible');
      cy.get('#sort').click({force: true});
      cy.get('#filter').click({force: true});
      cy.get('#card-29').should('be.hidden');
      cy.bodyFilterIsUnchecked();
    });

  });

});
