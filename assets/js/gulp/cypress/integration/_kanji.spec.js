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
  });

  describe('MAIN menu', function () {

    it('Contains HOME in navigation', () => {
      cy.get('.menu').contains("HOME").should('be.visible')
    });

    it('Contains ABOUT in navigation', () => {
      cy.get('.menu').contains("ABOUT").should('be.visible')
    });

    it('Contains FILTER in navigation', () => {
      cy.get('.menu').contains("FILTER").should('be.visible')
    });

  });

  describe('FILTER submenu', function () {

    it('Contains NUMBER submenu hidden in navigation', () => {
      cy.get('.menu').contains("NUMBER").should('be.hidden');
      cy.get('#filter').click();
      cy.get('.menu').contains("NUMBER").should('be.visible');
      cy.get('#filter').click();
      cy.get('.menu').contains("NUMBER").should('be.hidden');
    });

  });

});


