// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import chaiColors from 'chai-colors'

chai.use(chaiColors);

Cypress.Commands.add('kanjiLog', (arg1) => {
  Cypress.log({
    consoleProps: () => {
      return arg1
    }
  })
});

Cypress.Commands.add('clickOnSort', (label) => {
  cy.get('#sort').click({force: true});
  cy.get('.menu').contains(label).should('be.visible');
  cy.get('#sort').click({force: true});
  cy.get('.menu').contains(label).should('be.hidden');
  cy.get('#sort').click({force: true});
  cy.get('.menu').contains(label).should('be.visible');
});

Cypress.Commands.add('checkOrder', (first, last) => {
  cy.get('#card-'.concat(first)).should(($el) => {
    expect($el).to.have.css('order', '0')
  });
  cy.get('#card-'.concat(last)).should(($el) => {
    expect($el).to.have.css('order', '213')
  })
});

Cypress.Commands.add('checkFilter', (category, elem) => {
  cy.get('#menu-category').contains(category.toUpperCase()).should('be.visible');
  cy.get('#'.concat(category, '-filter')).click({force: true});
  cy.get('#card-'.concat(elem)).should('be.visible');
  cy.get('#'.concat(category, '-filter')).click({force: true});
  cy.get('#card-'.concat(elem)).should('be.hidden');
});

Cypress.Commands.add('bodyFilterIsUnchecked', () => {
  cy.get('#Body-label span')
    .should('have.css', 'background-color')
    .and('be.colored', '#d79b7d')

});
