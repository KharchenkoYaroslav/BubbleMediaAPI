describe('Content Queries', () => {
  let videoId: string;
  let audioId: string;
  let photoId: string;

  before(() => {
    cy.fixture('test.json').then((test) => {
      videoId = test.videoId;
      audioId = test.audioId;
      photoId = test.photoId;
    });
  });


  it('should fetch video content by ID', () => {
    const query = `
      query GetVideo($publicationId: String!) {
        getVideo(getContentByIdInput: $publicationId) {
          publicationId
          userId
          publicationName
          about
          tegs
          videoUrl
          coverUrl
          createdAt
        }
      }
    `;

    cy.request({
      method: 'POST',
      url: '/',
      body: {
        query: query,
        variables: {
          publicationId: videoId,
        },
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.have.property('errors');
      expect(response.body.data).to.have.property('getVideo');
      expect(response.body.data.getVideo).to.have.property('publicationId');
      expect(response.body.data.getVideo).to.have.property('userId');
      expect(response.body.data.getVideo).to.have.property('publicationName');
      expect(response.body.data.getVideo).to.have.property('about');
      expect(response.body.data.getVideo).to.have.property('tegs');
      expect(response.body.data.getVideo.tegs).to.be.an('array');
      expect(response.body.data.getVideo).to.have.property('videoUrl');
      expect(response.body.data.getVideo).to.have.property('coverUrl');
      expect(response.body.data.getVideo).to.have.property('createdAt');
    });
  });

  it('should fetch audio content by ID', () => {
    const query = `
      query GetAudio($publicationId: String!) {
        getAudio(getContentByIdInput: $publicationId) {
          publicationId
          userId
          publicationName
          about
          tegs
          audioUrl
          coverUrl
          createdAt
        }
      }
    `;

    cy.request({
      method: 'POST',
      url: '/',
      body: {
        query: query,
        variables: {
          publicationId: audioId,
        },
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.have.property('errors');
      expect(response.body.data).to.have.property('getAudio');
      expect(response.body.data.getAudio).to.have.property('publicationId');
      expect(response.body.data.getAudio).to.have.property('userId');
      expect(response.body.data.getAudio).to.have.property('publicationName');
      expect(response.body.data.getAudio).to.have.property('about');
      expect(response.body.data.getAudio).to.have.property('tegs');
      expect(response.body.data.getAudio.tegs).to.be.an('array');
      expect(response.body.data.getAudio).to.have.property('audioUrl');
      expect(response.body.data.getAudio).to.have.property('coverUrl');
      expect(response.body.data.getAudio).to.have.property('createdAt');
    });
  });

  it('should fetch photo content by ID', () => {
    const query = `
      query GetPhoto($publicationId: String!) {
        getPhoto(getContentByIdInput: $publicationId) {
          publicationId
          userId
          publicationName
          about
          tegs
          photoUrl
          createdAt
        }
      }
    `;

    cy.request({
      method: 'POST',
      url: '/',
      body: {
        query: query,
        variables: {
          publicationId: photoId,
        },
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.have.property('errors');
      expect(response.body.data).to.have.property('getPhoto');
      expect(response.body.data.getPhoto).to.have.property('publicationId');
      expect(response.body.data.getPhoto).to.have.property('userId');
      expect(response.body.data.getPhoto).to.have.property('publicationName');
      expect(response.body.data.getPhoto).to.have.property('about');
      expect(response.body.data.getPhoto).to.have.property('tegs');
      expect(response.body.data.getPhoto.tegs).to.be.an('array');
      expect(response.body.data.getPhoto).to.have.property('photoUrl');
      expect(response.body.data.getPhoto).to.have.property('createdAt');
    });
  });
});
