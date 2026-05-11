// jest.setup.cjs - Configuration Jest globale
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/test_db';
process.env.JWT_SECRET = 'test_secret_key';
process.env.PORT = '3001';

