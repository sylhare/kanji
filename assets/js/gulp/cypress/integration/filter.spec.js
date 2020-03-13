context(' ---------------- Filter test ---------------- ', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:4000/kanji/');
  });

  describe('FILTER submenu actions ', function () {

    it('FILTER submenu buttons are visible but not SORT ones', () => {
      cy.get('#filter').click({force: true});
      cy.get('#Number-filter').contains("NUMBER").should('be.visible');
      cy.get('#Number-sort').contains("NUMBER").should('be.hidden');
    });

    it('Cards appear on CATEGORY click part 1', () => {
      cy.get('#filter').click({force: true});
      cy.checkFilter('Number', 1);
      cy.checkFilter('Weapon', 2);
      cy.checkFilter('Other', 3);
      cy.checkFilter('Fishing', 6);
      cy.checkFilter('Home', 8);
      cy.checkFilter('Body', 9);
      cy.checkFilter('Capability', 11);
      cy.checkFilter('Nature', 15);
    });

    it('Cards appear on CATEGORY click part 2', () => {
      cy.get('#filter').click({force: true});
      cy.checkFilter('Ceremony', 25);
      cy.checkFilter('Society', 26);
      cy.checkFilter('Agriculture', 45);
      cy.checkFilter('Clothing', 50);
      cy.checkFilter('Animal', 58);
      cy.checkFilter('Food', 89);
      cy.checkFilter('Color', 106);
    });

  });

});
