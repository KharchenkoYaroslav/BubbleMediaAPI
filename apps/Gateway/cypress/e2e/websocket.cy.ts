describe('WebSocket Comments', () => {
  let publication: string;
  let authToken: string;
  let testLogin: string;
  let testPassword: string;
  const testComment = `Test comment`;

  before(() => {
    cy.fixture('test.json').then((test) => {
      testLogin = test.login;
      testPassword = test.password;
      publication = test.photoId;

      cy.request({
        method: 'POST',
        url: '/',
        body: {
          query: `
            mutation Login($data: LoginInput!) {
              login(data: $data) {
                token
              }
            }
          `,
          variables: {
            data: {
              login: testLogin,
              password: testPassword,
            },
          },
        },
      }).then((res) => {
        authToken = res.body.data.login.token;
      });
    });
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('should add a comment via WebSocket', () => {
    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: `
          mutation CreateComment($data: CreateCommentInput!) {
            createComment(data: $data)
          }
        `,
        variables: {
          data: {
            publicationId: publication,
            comment: testComment,
          },
        },
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.have.property('errors');
    });
  });
});
