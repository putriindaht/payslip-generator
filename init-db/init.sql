\connect postgres;

-- Create payroll_dev if it doesn't exist
SELECT 'CREATE DATABASE payroll_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'payroll_dev')\gexec

-- Create payroll_test if it doesn't exist
SELECT 'CREATE DATABASE payroll_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'payroll_test')\gexec
