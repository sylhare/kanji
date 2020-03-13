context(' ---------------- Sort test ---------------- ', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:4000/kanji/');
  });

  describe('SORT submenu actions', function () {

    it('NUMBER submenu appears on click', () => {
      cy.clickOnSort("NUMBER")
    });

    it('click on NUMBER change order', () => {
      cy.clickOnSort("NUMBER");
      cy.get('#Number-sort').click({force: true});
      cy.checkOrder(214, 1);
      cy.get('#Number-sort').click({force: true});
      cy.checkOrder(1, 214);
    });

    it('FREQUENCY submenu appears on click', () => {
      cy.clickOnSort("FREQUENCY")
    });

    it('click on FREQUENCY change order', () => {
      cy.clickOnSort("FREQUENCY");
      cy.get('#Frequency-sort').click({force: true});
      cy.checkOrder(140, 35);
      cy.get('#Frequency-sort').click({force: true});
      cy.checkOrder(35, 140);
    });

    it('CATEGORY submenu appears on click', () => {
      cy.clickOnSort("CATEGORY")
    });

    it('click on CATEGORY change order', () => {
      cy.clickOnSort("CATEGORY");
      cy.get('#Category-sort').click({force: true});
      cy.checkOrder(45, 191);
      cy.get('#Category-sort').click({force: true});
      cy.checkOrder(2, 202);
    });

    it('READING submenu appears on click', () => {
      cy.clickOnSort("CATEGORY")
    });

    it('click on READING change order', () => {
      cy.clickOnSort("READING");
      cy.get('#Reading-sort').click({force: true});
      cy.checkOrder(155, 36);
      cy.get('#Reading-sort').click({force: true});
      cy.checkOrder(36, 155);
    });

  });

  describe('SORT order always ASC first', function () {

    it('click on NUMBER then READING then NUMBER', () => {
      cy.get('#sort').click({force: true});
      cy.get('#Number-sort').click({force: true});
      cy.checkOrder(214, 1);
      cy.get('#Reading-sort').click({force: true});
      cy.checkOrder(155, 36);
      cy.get('#Number-sort').click({force: true});
      cy.checkOrder(1, 214);
    });

    it('click on FREQUENCY then NUMBER then CATEGORY', () => {
      cy.get('#sort').click({force: true});
      cy.get('#Frequency-sort').click({force: true});
      cy.checkOrder(140, 35);
      cy.get('#Number-sort').click({force: true});
      cy.checkOrder(1, 214);
      cy.get('#Category-sort').click({force: true});
      cy.checkOrder(45, 191);
    });
  });

  describe('FILTER submenu actions ', function () {

    it('FILTER submenu buttons are visible but not SORT ones', () => {
      cy.get('#filter').click({force: true});
      cy.get('#Number-filter').contains("NUMBER").should('be.visible');
      cy.get('#Number-sort').contains("NUMBER").should('be.hidden');
    });

    it('OTHER submenu appears on click', () => {
      cy.get('#filter').click({force: true});
      cy.get('.menu').contains("OTHER").should('be.visible');
    });

  });

});
