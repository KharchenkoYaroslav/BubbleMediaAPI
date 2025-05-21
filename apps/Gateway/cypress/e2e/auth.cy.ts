describe('Authentication', () => {
  let testLogin: string;
  let testPassword: string;
  let authToken: string;
  let userId: string;

  before(() => {
    cy.fixture('test.json').then((test) => {
      testLogin = test.auth_login;
      testPassword = test.auth_password;
    });
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('should register a new user', () => {

    cy.request({
      method: 'POST',
      url: '/',
      body: {
        query: `
          mutation Register($data: RegisterInput!) {
            register(data: $data) {
              login
              createdAt
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
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');
      expect(res.body.data.register).to.include({
        login: testLogin,
      });
      expect(res.body.data.register.createdAt).to.be.a('string');
    });
  });

  it('should log in the registered user', () => {
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
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');
      expect(res.body.data.login.token).to.be.a('string');
      expect(res.body.data.login.userId).to.be.a('string');
      authToken = res.body.data.login.token;
      userId = res.body.data.login.userId;
    });
  });

  it('should get user login', () => {
    cy.request({
      method: 'POST',
      url: '/',
      body: {
        query: `
          query GetLogin($data: GetLoginInput!) {
            getLogin(data: $data) {
              login
            }
          }
        `,
        variables: {
          data: {
            userId: userId,
          },
        },
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');
      expect(res.body.data.getLogin).to.include({
        login: testLogin,
      });
    });
  });

  it('should change user login', () => {
    const newLogin = `new_${testLogin}`;
    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: `
          mutation ChangeLogin($data: ChangeLoginInput!) {
            changeLogin(data: $data)
          }
        `,
        variables: {
          data: {
            newLogin: newLogin,
          },
        },
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');
      testLogin = newLogin;
    });
  });

  it('should change user password', () => {
    const newPassword = `new_${testPassword}`;
    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: `
          mutation ChangePassword($data: ChangePasswordInput!) {
            changePassword(data: $data)
          }
        `,
        variables: {
          data: {
            currentPassword: testPassword,
            newPassword: newPassword,
          },
        },
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');
      testPassword = newPassword;
    });
  });

  it('should delete the registered user', () => {
    cy.request({
      method: 'POST',
      url: '/',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        query: `
          mutation {
            deleteAccount
          }
        `,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.not.have.property('errors');
    });
  });
});
