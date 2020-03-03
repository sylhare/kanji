context(' ---------------- Filter test ---------------- ', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:4000/kanji/');
  });

  describe('FILTER submenu actions', function () {

    it('NUMBER submenu appears on click', () => {
      cy.clickOnFilter("NUMBER")
    });

  });

});
