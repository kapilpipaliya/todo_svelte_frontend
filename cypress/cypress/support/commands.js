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
Cypress.Commands.add('login', (email = 'reg130@o-k.tech', password = 'a123456') => {
  cy.visit('http://localhost:8500/super_login', { failOnStatusCode: false })
  cy.get("input[name='Email']")
    .focus()
    .type(email)
  cy.get("input[name='Pass']")
    .focus()
    .type(password)
  cy.get("button.success[type='submit']").click()
  cy.wait(500) // must wait to get cookie from server
})
Cypress.Commands.add('addClick', () => {
  cy.get("button[name='table_add']").click()
})
Cypress.Commands.add('editClick', () => {
  cy.get("table tbody td button[name='edit'][type='button']").click()
})
Cypress.Commands.add('editKeyClick', key => {
  cy.get(
    `table tbody td button[type='button'][key='${key}'][name='edit']`
  ).click()
})
Cypress.Commands.add('deleteClick', () => {
  cy.get("table tbody td button[name='delete'][type='button']").click()
})
Cypress.Commands.add('deleteKeyClick', key => {
  cy.get(
    `table tbody td button[name='delete'][key='${key}'][type='button']`
  ).click()
})
Cypress.Commands.add('submitButtonClick', (key = 'insert') => {
  cy.get(`form.${key} button.success[type='submit']`).click()
})
Cypress.Commands.add('inputType', (key, value) => {
  cy.wait(300)
  cy.get(`input[name='${key}']`)
    .focus()
    .type(value)
})
