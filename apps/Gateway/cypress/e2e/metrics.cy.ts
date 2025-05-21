describe('Metrics Mutations and Queries', () => {
  let photoId: string;
  let authToken: string;
  let testLogin: string;
  let testPassword: string;

  before(() => {
    cy.fixture('test.json').then((test) => {
      testLogin = test.login;
      testPassword = test.password;
      photoId = test.photoId;

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

  it('should get total likes for a publication', () => {
    const query = `
      query GetTotalLikes($data: GetLikesRequestDto!) {
        getTotalLikes(data: $data) {
          total
        }
      }
    `;

    cy.request({
      method: 'POST',
      url: '/',
      body: {
        query: query,
        variables: {
          data: {
            publicationId: photoId,
          },
        },
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.have.property('errors');
      expect(response.body.data).to.have.property('getTotalLikes');
      expect(response.body.data.getTotalLikes).to.have.property('total');
      expect(response.body.data.getTotalLikes.total).to.be.a('number');
    });
  });

  it('should add a like to a publication', () => {
    const mutation = `
      mutation AddLike($data: LikeRequestDto!) {
        addLike(data: $data)
      }
    `;

    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: mutation,
        variables: {
          data: {
            publicationId: photoId,
          },
        },
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.have.property('errors');
    });
  });

  it('should remove a like from a publication', () => {
    const mutation = `
      mutation RemoveLike($data: LikeRequestDto!) {
        removeLike(data: $data)
      }
    `;

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);

    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: mutation,
        variables: {
          data: {
            publicationId: photoId,
          },
        },
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.have.property('errors');
    });
  });
});
