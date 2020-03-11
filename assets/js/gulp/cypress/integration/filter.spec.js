context(' ---------------- Filter test ---------------- ', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:4000/kanji/');
  });

  describe('FILTER submenu actions', function () {

    it('NUMBER submenu appears on click', () => {
      cy.clickOnFilter("NUMBER")
    });

    it('click on NUMBER change order', () => {
      cy.clickOnFilter("NUMBER");
      cy.get('#Number-filter').click({ force: true });
      cy.checkOrder(214, 1);
      cy.get('#Number-filter').click({ force: true });
      cy.checkOrder(1, 214);
    });

    it('FREQUENCY submenu appears on click', () => {
      cy.clickOnFilter("FREQUENCY")
    });

    it('click on NUMBER change order', () => {
      cy.clickOnFilter("FREQUENCY");
      cy.get('#Frequency-filter').click({ force: true });
      cy.checkOrder(140, 35);
      cy.get('#Frequency-filter').click({ force: true });
      cy.checkOrder(35, 140);
    });

    it('CATEGORY submenu appears on click', () => {
      cy.clickOnFilter("CATEGORY")
    });

    it('click on CATEGORY change order', () => {
      cy.clickOnFilter("CATEGORY");
      cy.get('#Category-filter').click({ force: true });
      cy.checkOrder(2, 202);
      cy.get('#Category-filter').click({ force: true });
      cy.checkOrder(45, 191);
    });

  });

});
