const environment = process.env.NODE_ENV || 'test';
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

  describe('POST /api/v1/project', () => {
   it('should post a new project', () => {
      return chai.request(server)
      .post('/api/v1/project')
      .send({
        name: 'New Project'
      })
      .then(response => {
        response.should.have.status(201);
        response.body.should.be.a('object');
        response.body.should.have.property('id');
        response.body.id.should.equal(2);
      })
      .catch(error => {
        throw error
      });
    });

    it('should return a 422 with appropriate param message when no name is provided', () => {
      return chai.request(server)
      .post('/api/v1/project')
      .send({
        // name: 'no new projects'
      })
      .then(response => {
        response.should.have.status(422);
        response.body.error.should.equal('You forgot a name');
      })
      .catch(error => {
        throw error
      })
    })
  });
    describe('GET /api/v1/palettes', () => {
    it('should return return all of the palettes', () => {
      return chai.request(server)
      .get('/api/v1/palettes')
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(2);
        response.body[0].should.have.property('colors');
        response.body[0].colors.length.should.equal(5);        
        response.body[0].should.have.property('name');
        response.body[0].name.should.equal('palette1');
        response.body[0].should.have.property('project_id');
        response.body[0].project_id.should.equal(1);
        response.body[0].should.have.property('created_at');
        response.body[0].should.have.property('updated_at');
      });
    });
  });

  describe('POST /api/v1/palettes', () => {

    it('should post a new palette', () => {
      return chai.request(server)
      .post('/api/v1/palettes')
      .send({
        name: 'dopest-color',
        project_id: 1,
        colors: ['blanchedAlmond', 'blanchedAlmond', 'blanchedAlmond', 'blanchedAlmond', 'blanchedAlmond'],
      })
      .then(response => {
        response.should.have.status(201);
        response.body.should.be.a('object');
        response.body.should.have.property('id');
        response.body.id.should.equal(3);
      })
      .catch(error => {
        throw error
      });
    });

    it('should return a 422 with appropriate param message when no name is provided', () => {
      return chai.request(server)
      .post('/api/v1/project')
      .send({
        // name: 'dopest-color',
        project_id: 1,
        colors: ['blanchedAlmond', 'blanchedAlmond', 'blanchedAlmond', 'blanchedAlmond', 'blanchedAlmond'],
      })
      .then(response => {
        response.should.have.status(422);
        response.body.error.should.equal('You forgot a name');
      })
      .catch(error => {
        throw error
      });
    });

    it('should return a 422 with appropriate param message when no colors are provided', () => {
      return chai.request(server)
      .post('/api/v1/palettes')
      .send({
        name: 'dopest-color',
        project_id: 1,
        // colors: ['blanchedAlmond', 'blanchedAlmond', 'blanchedAlmond', 'blanchedAlmond', 'blanchedAlmond'],
      })
      .then(response => {
        response.should.have.status(422);
        response.body.error.should.equal('You forgot to supply a colors');
      })
      .catch(error => {
        throw error
      });
    });

    it('should return a 422 with appropriate param message when no project id is provided', () => {
      return chai.request(server)
      .post('/api/v1/palettes')
      .send({
        name: 'dopest-color',
        // project_id: 1,
        colors: ['blanchedAlmond', 'blanchedAlmond', 'blanchedAlmond', 'blanchedAlmond', 'blanchedAlmond'],
      })
      .then(response => {
        response.should.have.status(422);
        response.body.error.should.equal('You forgot to supply a project_id');
      })
      .catch(error => {
        throw error
      });
    });
  });

  describe('DELETE /api/v1/palettes/:id', () => {
    it('should return 202 on deleting a palette specified by an id', () => {
      return chai.request(server)
      .del('/api/v1/palettes/1')
      .then(response => {
        response.should.have.status(202);
      });
    });
  });

});
    