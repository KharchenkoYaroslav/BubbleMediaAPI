describe('Content Feed Resolver E2E Tests', () => {
  let authToken: string;
  let testLogin: string;
  let testPassword: string;
  let testUserId: string;

  before(() => {
    cy.fixture('test.json').then((test) => {
      testLogin = test.login;
      testPassword = test.password;

      cy.request({
        method: 'POST',
        url: '/',
        body: {
          query: `
            mutation Login($data: LoginInput!) {
              login(data: $data) {
                token
                userId
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
        testUserId = res.body.data.login.userId;
      });
    });
  });

  it('should get user publications', function () {
    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: `
          query GetUserPublications($input: GetUserPublicationsInput!) {
            GetUserPublications(input: $input) {
              publications {
                publicationId
                userId
                login
                avatarUrl
                publicationName
                coverUrl
                type
              }
            }
          }
        `,
        variables: {
          input: {
            userId: testUserId,
            postsRequest: {
              start: 0,
              end: 10,
            },
          },
        },
      },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('GetUserPublications');
      expect(res.body.data.GetUserPublications).to.have.property('publications');
      expect(res.body.data.GetUserPublications.publications).to.be.an('array');

      const firstPublication = res.body.data.GetUserPublications.publications[0];
      expect(firstPublication).to.have.property('publicationId');
      expect(firstPublication.publicationId).to.be.a('string');
      expect(firstPublication).to.have.property('userId');
      expect(firstPublication.userId).to.be.a('string');
      expect(firstPublication).to.have.property('login');
      expect(firstPublication.login).to.be.a('string');
      expect(firstPublication).to.have.property('avatarUrl');
      expect(firstPublication.avatarUrl).to.be.a('string');
      expect(firstPublication).to.have.property('publicationName');
      expect(firstPublication.publicationName).to.be.a('string');
      expect(firstPublication).to.have.property('type');
      expect(firstPublication.type).to.be.a('string');
    });
  });

  it('should get recent top posts', () => {
    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: `
          query GetRecentTopPosts($input: GetRecentTopPostsInput!) {
            GetRecentTopPosts(input: $input) {
              publications {
                publicationId
                userId
                login
                avatarUrl
                publicationName
                coverUrl
                type
              }
            }
          }
        `,
        variables: {
          input: {
            postsRequest: {
              start: 0,
              end: 10,
            },
          },
        },
      },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.data.GetRecentTopPosts.publications).to.be.an('array');
    });
  });

  it('should get liked publications', function () {
    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: `
          query GetLikedPublications($input: GetLikedPublicationsInput!) {
            GetLikedPublications(input: $input) {
              publications {
                publicationId
                userId
                login
                avatarUrl
                publicationName
                coverUrl
                type
              }
            }
          }
        `,
        variables: {
          input: {
            postsRequest: {
              start: 0,
              end: 10,
            },
          },
        },
      },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('GetLikedPublications');
      expect(res.body.data.GetLikedPublications).to.have.property('publications');
      expect(res.body.data.GetLikedPublications.publications).to.be.an('array');

      const firstPublication = res.body.data.GetLikedPublications.publications[0];
      expect(firstPublication).to.have.property('publicationId');
      expect(firstPublication.publicationId).to.be.a('string');
      expect(firstPublication).to.have.property('userId');
      expect(firstPublication.userId).to.be.a('string');
      expect(firstPublication).to.have.property('login');
      expect(firstPublication.login).to.be.a('string');
      expect(firstPublication).to.have.property('avatarUrl');
      expect(firstPublication.avatarUrl).to.be.a('string');
      expect(firstPublication).to.have.property('publicationName');
      expect(firstPublication.publicationName).to.be.a('string');
      expect(firstPublication).to.have.property('type');
      expect(firstPublication.type).to.be.a('string');
    });
  });

  it('should get random publications', () => {
    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: `
          query GetRandomPublications($input: GetRandomPublicationsInput!) {
            GetRandomPublications(input: $input) {
              publications {
                publicationId
                userId
                login
                avatarUrl
                publicationName
                coverUrl
                type
              }
            }
          }
        `,
        variables: {
          input: {
            photoCount: 5,
            videoCount: 5,
            audioCount: 5
          },
        },
      },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.data.GetRandomPublications.publications).to.be.an('array');
      expect(res.body.data).to.have.property('GetRandomPublications');
      expect(res.body.data.GetRandomPublications).to.have.property('publications');
      expect(res.body.data.GetRandomPublications.publications).to.be.an('array');

      const firstPublication = res.body.data.GetRandomPublications.publications[0];
      expect(firstPublication).to.have.property('publicationId');
      expect(firstPublication.publicationId).to.be.a('string');
      expect(firstPublication).to.have.property('userId');
      expect(firstPublication.userId).to.be.a('string');
      expect(firstPublication).to.have.property('login');
      expect(firstPublication.login).to.be.a('string');
      expect(firstPublication).to.have.property('avatarUrl');
      expect(firstPublication.avatarUrl).to.be.a('string');
      expect(firstPublication).to.have.property('publicationName');
      expect(firstPublication.publicationName).to.be.a('string');
      expect(firstPublication).to.have.property('type');
      expect(firstPublication.type).to.be.a('string');
    });
  });

  it('should get subscriptions publications', function () {
    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: `
          query GetSubscriptionsPublications($input: GetSubscriptionsPublicationsInput!) {
            GetSubscriptionsPublications(input: $input) {
              publications {
                publicationId
                userId
                login
                avatarUrl
                publicationName
                coverUrl
                type
              }
            }
          }
        `,
        variables: {
          input: {
            postsRequest: {
              start: 0,
              end: 10,
            },
          },
        },
      },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.data.GetSubscriptionsPublications.publications).to.be.an('array');
      expect(res.body.data).to.have.property('GetSubscriptionsPublications');
      expect(res.body.data.GetSubscriptionsPublications).to.have.property('publications');
      expect(res.body.data.GetSubscriptionsPublications.publications).to.be.an('array');

      const firstPublication = res.body.data.GetSubscriptionsPublications.publications[0];
      expect(firstPublication).to.have.property('publicationId');
      expect(firstPublication.publicationId).to.be.a('string');
      expect(firstPublication).to.have.property('userId');
      expect(firstPublication.userId).to.be.a('string');
      expect(firstPublication).to.have.property('login');
      expect(firstPublication.login).to.be.a('string');
      expect(firstPublication).to.have.property('avatarUrl');
      expect(firstPublication.avatarUrl).to.be.a('string');
      expect(firstPublication).to.have.property('publicationName');
      expect(firstPublication.publicationName).to.be.a('string');
      expect(firstPublication).to.have.property('type');
      expect(firstPublication.type).to.be.a('string');
    });
  });
});
