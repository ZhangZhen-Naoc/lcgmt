 CREATE DATABASE relational;
 \c relational;
 CREATE TABLE IF NOT EXISTS obses(start_time TIMESTAMP,exp_time REAL,flux DOUBLE PRECISION ,flux_err DOUBLE PRECISION,src_id INT, instru_id INT);
 CREATE OR REPLACE FUNCTION reduce_time(start_time TIMESTAMP, current TIMESTAMP, timebin INT)
RETURNS TIMESTAMP AS $$
DECLARE delta_t INT ;concated_delta_t VARCHAR;time_interval INTERVAL; BEGIN delta_t= FLOOR(EXTRACT(EPOCH FROM current - start_time)/timebin)*timebin;concated_delta_t=concat(delta_t,' seconds'); time_interval=cast(concated_delta_t AS interval); RETURN start_time+time_interval; END; $$
LANGUAGE plpgsql
;