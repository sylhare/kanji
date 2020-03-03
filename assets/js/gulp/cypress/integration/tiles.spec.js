context(' ---------------- Tiles tests ---------------- ', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:4000/kanji/');
  });

  describe('Check FRONT of the tile', function () {

    it('contains the 214 radicals', () => {
      cy.get('.card').should('have.length', 214)
    });

    it('should render all front images', () => {
      cy.get('[alt="kanji"]')
        .should('be.visible')
        .should('have.length', 214)
        .and(($img) => {
          expect($img[0].naturalWidth).to.be.greaterThan(0)
        })
    });

  });

  describe('Check BACK of the tile', function () {

    it('All back card images are hidden', () => {
      cy.get('[alt="kanji stroke"]')
        .should('be.hidden')
        .should('have.length', 214)
    });

    // hover though css can't be tested with Cypress :(
    // it('Images are visible on hover', () => {
    //   cy.get('#card-1').invoke('hover');
    //   cy.get('img.back-img').should('be.visible')
    // });

  });

});


