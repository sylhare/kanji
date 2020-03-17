context(' ---------------- Navigation tests ---------------- ', () => {

  beforeEach(() => {
    cy.visit('http://127.0.0.1:4000/kanji/');
  });

  describe('Health test', function () {

    it('Site is running', function () {
      cy.kanjiLog("Make sure site is running, use: \nbundle exec jekyll serve");
      cy.task('log', "\n\tMaking sure site is running: \n\tbundle exec jekyll serve\n")
    });

    it('should contain kanji in title', () => {
      cy.title().should('include', 'Kanji')
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

  describe('FOOTER is alright', function () {

    it('Has a FOOTER', () => {
      cy.get("footer").contains("Sylhare")
    });

    it('Contains Kanji link in footer', () => {
      cy.get('footer').contains('Kanji')
        .should('be.visible')
        .should('have.attr', 'href', 'https://github.com/sylhare/kanji')
    });
  });


});


