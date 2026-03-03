

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';

process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.PORT = 5001;


jest.setTimeout(10000);
