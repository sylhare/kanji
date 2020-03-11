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

    it('Page ABOUT renders text', () => {
      cy.visit('http://127.0.0.1:4000/kanji/about');
      cy.get(".post-content").contains("Kanji Radicals")
        .should('be.visible')
    });
  });

  describe('MAIN menu', function () {

    it('Contains HOME in navigation', () => {
      cy.get('.menu').contains("HOME")
        .should('be.visible')
        .should('have.attr', 'href', '/kanji/')
    });

    it('Contains ABOUT in navigation', () => {
      cy.get('.menu').contains('ABOUT')
        .should('be.visible')
        .should('have.attr', 'href', '/kanji/about')
    });

    it('Contains FILTER in navigation', () => {
      cy.get('.menu').contains("FILTER")
        .should('be.visible')
        .should('have.attr', 'href', '#')
    });

  });

});


