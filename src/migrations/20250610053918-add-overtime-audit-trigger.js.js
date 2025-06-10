'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION log_overtime_audit()
      RETURNS TRIGGER AS $$
      DECLARE
        log_id uuid := gen_random_uuid();
        audit_record_id uuid;
        who_created uuid;
        who_updated uuid;
        req_id uuid;
        req_ip text;
        current_time timestamptz := NOW();
      BEGIN
        IF TG_OP = 'INSERT' THEN
          audit_record_id := NEW.id;
          who_created := NEW.created_by;
          who_updated := NEW.updated_by;
          req_id := NEW.request_id;
          req_ip := NEW.request_ip;
        ELSIF TG_OP = 'UPDATE' THEN
          audit_record_id := NEW.id;
          who_created := NEW.created_by;
          who_updated := NEW.updated_by;
          req_id := NEW.request_id;
          req_ip := NEW.request_ip;
        ELSIF TG_OP = 'DELETE' THEN
          audit_record_id := OLD.id;
          who_created := OLD.created_by;
          who_updated := OLD.updated_by;
          req_id := OLD.request_id;
          req_ip := OLD.request_ip;
        END IF;

        INSERT INTO audit_logs (
          id,
          record_id,
          table_name,
          operation,
          request_ip,
          request_id,
          created_by,
          created_by_type,
          updated_by,
          updated_by_type
        )
        VALUES (
          log_id,
          audit_record_id,
          'overtimes',
          TG_OP,
          req_ip,
          req_id,
          who_created,
          'employee',
          who_updated,
          'employee'
        );

        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        ELSE
          RETURN NEW;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 2. Create the trigger
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_log_overtime_audit ON overtimes;
      CREATE TRIGGER trg_log_overtime_audit
      AFTER INSERT OR UPDATE OR DELETE ON overtimes
      FOR EACH ROW
      EXECUTE FUNCTION log_overtime_audit();
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_log_overtime_audit ON overtimes;
      DROP FUNCTION IF EXISTS log_overtime_audit();
    `);
  }
};
