context(' ---------------- Navigation tests ---------------- ', () => {

  beforeEach(() => {
    cy.visit('http://127.0.0.1:4000/kanji/');
  });

  describe('Health test', function () {
    it('Site is running', function () {
      cy.kanjiLog("Making sure site is running: \nbundle exec jekyll serve");
      cy.task('log', "\n\tMaking sure site is running: \n\tbundle exec jekyll serve\n")
    });

    it('should contain kanji in title', () => {
      cy.title().should('include', 'Kanji')
    });

    it('Has a FOOTER', () => {
      cy.get("footer").contains("Sylhare")
    });
  });

  describe('MAIN menu', function () {

    it('Contains HOME in navigation', () => {
      cy.get('.menu').contains("HOME")
        .should('be.visible')
        .should('have.attr', 'href', '#');
      cy.get('#card-1').should('be.visible');
      cy.get('#card-214').should('be.visible');
    });

    it('Contains ABOUT in navigation', () => {
      cy.get('.menu').contains('ABOUT')
        .should('be.visible')
        .should('have.attr', 'href', 'https://github.com/sylhare/kanji')
    });

    it('Contains SORT in navigation', () => {
      cy.get('.menu').contains("SORT")
        .should('be.visible')
        .should('have.attr', 'href', '#')
    });

    it('Contains FILTER in navigation', () => {
      cy.get('.menu').contains("FILTER")
        .should('be.visible')
        .should('have.attr', 'href', '#')
    });

  });

});


