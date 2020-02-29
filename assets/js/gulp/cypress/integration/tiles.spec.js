context('Assertions', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:4000/kanji/');
  });

  it('should contain kanji in title', () => {
    cy.title().should('include', 'Kanji')
  });

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

  it('All back card images are hidden', () => {
    cy.get('[alt="kanji stroke"]')
      .should('be.hidden')
      .should('have.length', 214)
  });

});


