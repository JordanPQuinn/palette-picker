const environment = 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

describe('Client Routes', () => {
  it('should return the homepage with text', () => {
    return chai.request(server)
    .get('/')
    .then(response => {
      response.should.have.status(200);
      response.should.be.html;
    })
    .catch(error => {
      throw error;
    });
  });

  it('should return a 404 if the requested page is not found', () => {
    return chai.request(server)
    .get('/sad')
    .then(response => {
      response.should.have.status(404);
    })
    .catch(error => {
      throw error
    });
  });
});

describe('API Routes', () => {
  beforeEach( done => {
    database.migrate.rollback()
    .then( () => {
      database.migrate.latest()
      .then( () => {
        return database.seed.run()
        .then( () => {
          done();
        });
      });
    });
  });

  describe('GET /api/v1/project', () => {
    it('should get all projects', () => {
      return chai.request(server)
      .get('/api/v1/project')
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(1);
        response.body[0].should.have.property('id');
        response.body[0].should.have.property('name');
        response.body[0].name.should.equal('test-projects');
        response.body[0].should.have.property('created_at');
        response.body[0].should.have.property('updated_at');
      });
    });
  });
});
    