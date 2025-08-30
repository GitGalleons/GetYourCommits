describe('GetCommits basic flows', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/');
  });

  it('loads the UI and switches tabs', () => {
    cy.get('#tab-public').should('have.class', 'active');
    cy.get('#tab-private').click().should('have.class', 'active');
    cy.get('#tab-public').click().should('have.class', 'active');
  });

  it('searches a public repo and shows branches and commits', () => {
    cy.get('#public-owner').type('octocat');
    cy.get('#public-repo').type('Hello-World');
    cy.get('#btn-search-public').click();
    cy.get('#repo-section', { timeout: 10000 }).should('contain', 'octocat/Hello-World');
    cy.get('#branch-select', { timeout: 10000 }).should('exist');
    cy.get('#commits-section', { timeout: 10000 }).should('exist');
  });
});