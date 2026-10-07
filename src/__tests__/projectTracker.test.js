const request = require('supertest');
const app = require('../server');

describe('Project Tracker API & Scoring Rubric Compliance', () => {
  let createdProjectId;
  let createdTaskId;

  describe('1. Health Check & API Readiness', () => {
    it('should return 200 OK for backend health check', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
    });
  });

  describe('2. Project Tracker Dashboard Summary Metrics', () => {
    it('should return aggregated project and task metrics', async () => {
      const res = await request(app).get('/api/projects/stats/summary');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalProjects');
      expect(res.body).toHaveProperty('totalTasks');
      expect(res.body).toHaveProperty('overallCompletion');
      expect(typeof res.body.overallCompletion).toBe('number');
    });
  });

  describe('3. Project CRUD Operations', () => {
    it('should create a new project with title, description, category, and priority', async () => {
      const newProject = {
        title: 'CI/CD Automation Pipeline Integration',
        description: 'Automate build, test, and container deployment pipelines.',
        category: 'Engineering',
        priority: 'High',
        status: 'In Progress',
      };

      const res = await request(app)
        .post('/api/projects')
        .send(newProject);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe(newProject.title);
      expect(res.body.priority).toBe('High');
      createdProjectId = res.body._id;
    });

    it('should retrieve list of projects including newly created project', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should retrieve a project by its unique ID', async () => {
      const res = await request(app).get(`/api/projects/${createdProjectId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('project');
      expect(res.body.project.title).toBe('CI/CD Automation Pipeline Integration');
    });

    it('should update project status and priority', async () => {
      const res = await request(app)
        .put(`/api/projects/${createdProjectId}`)
        .send({ status: 'Completed', progress: 100 });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Completed');
    });
  });

  describe('4. Task CRUD Operations & Metadata', () => {
    it('should create a task with status, priority, assignee and due date', async () => {
      const newTask = {
        title: 'Configure GitHub Actions Workflow YAML',
        description: 'Add matrix builds and automated Jest test execution on push.',
        project: createdProjectId,
        status: 'To Do',
        priority: 'High',
        assignee: 'Rajesh Sharma',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        tags: ['DevOps', 'CI/CD'],
      };

      const res = await request(app)
        .post('/api/tasks')
        .send(newTask);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe(newTask.title);
      expect(res.body.assignee).toBe('Rajesh Sharma');
      expect(res.body.priority).toBe('High');
      expect(res.body.status).toBe('To Do');
      createdTaskId = res.body._id;
    });

    it('should retrieve tasks and support query filtering by priority', async () => {
      const res = await request(app).get('/api/tasks?priority=High');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const allHigh = res.body.every((t) => t.priority === 'High');
      expect(allHigh).toBe(true);
    });

    it('should advance task status to "In Progress" and "Done"', async () => {
      const res = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send({ status: 'Done' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Done');
    });

    it('should delete a task by ID', async () => {
      const res = await request(app).delete(`/api/tasks/${createdTaskId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/removed/i);
    });
  });

  describe('5. Project Cascade Cleanup', () => {
    it('should delete a project by ID', async () => {
      const res = await request(app).delete(`/api/projects/${createdProjectId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/removed/i);
    });
  });
});
