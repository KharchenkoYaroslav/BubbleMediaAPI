describe('Profile', () => {
  let testLogin: string;
  let testPassword: string;
  let authToken: string;
  let userId: string;
  let subscriptionUserId: string;

  before(() => {
    cy.fixture('test.json').then((test) => {
      testLogin = test.login;
      testPassword = test.password;
      subscriptionUserId = test.secondUserId;

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
        userId = res.body.data.login.userId;
      });
    });
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('should get user profile', () => {
    cy.request({
      method: 'POST',
      url: '/',
      body: {
        query: `
          query GetProfile($userId: String!) {
            getProfile(userId: $userId) {
              about
              avatarUrl
              subscribersCount
            }
          }
        `,
        variables: {
          userId: userId,
        },
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');
      expect(res.body.data.getProfile.about).to.be.a('string');
      expect(res.body.data.getProfile.avatarUrl).to.be.a('string');
      expect(res.body.data.getProfile.subscribersCount).to.be.a('number');
    });
  });

  it('should get user avatar', () => {
    cy.request({
      method: 'POST',
      url: '/',
      body: {
        query: `
          query GetAvatar($userId: String!) {
            getAvatar(userId: $userId) {
              avatarUrl
            }
          }
        `,
        variables: {
          userId: userId,
        },
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');
      expect(res.body.data.getAvatar.avatarUrl).to.be.a('string');
    });
  });

  it('should update user about', () => {
    const newAbout = Math.random().toString(36).substring(7);
    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: `
          mutation UpdateAbout($data: UpdateAboutInput!) {
            updateAbout(data: $data)
          }
        `,
        variables: {
          data: {
            about: newAbout,
          },
        },
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');

      cy.request({
        method: 'POST',
        url: '/',
        body: {
          query: `
            query GetProfile($userId: String!) {
              getProfile(userId: $userId) {
                about
              }
            }
          `,
          variables: {
            userId: userId,
          },
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.not.have.property('errors');
        expect(res.body.data.getProfile.about).to.eq(newAbout);
      });
    });
  });

  it('should add and remove subscription', () => {
    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: `
        mutation AddSubscription($data: AddSubscriptionInput!) {
          addSubscription(data: $data)
        }
      `,
        variables: {
          data: {
            subscription: subscriptionUserId,
          },
        },
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);

    cy.request({
      method: 'POST',
      url: '/',
      body: {
        query: `
        query GetProfile($userId: String!) {
          getProfile(userId: $userId) {
            subscriptions
          }
        }
      `,
        variables: {
          userId: userId,
        },
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');
      expect(res.body.data.getProfile.subscriptions).to.be.an('array');
      expect(res.body.data.getProfile.subscriptions).to.include(
        subscriptionUserId
      );
    });

    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: `
        mutation RemoveSubscription($data: RemoveSubscriptionInput!) {
          removeSubscription(data: $data)
        }
      `,
        variables: {
          data: {
            subscriptionToRemove: subscriptionUserId,
          },
        },
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);

    cy.request({
      method: 'POST',
      url: '/',
      body: {
        query: `
        query GetProfile($userId: String!) {
          getProfile(userId: $userId) {
            subscriptions
          }
        }
      `,
        variables: {
          userId: userId,
        },
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');
      const subscriptions = res.body.data.getProfile.subscriptions;
      expect(subscriptions).to.satisfy(
        (subs) =>
          subs === null ||
          (Array.isArray(subs) && !subs.includes(subscriptionUserId))
      );
    });
  });
});
