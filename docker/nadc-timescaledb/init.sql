CREATE DATABASE nadc;
\c nadc;

CREATE TABLE instrument(
    id SERIAL,
    satellite VARCHAR(100),
    energy_level_start DOUBLE PRECISION,
    energy_level_end   DOUBLE PRECISION
);

CREATE TABLE source(
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100),
    ra DOUBLE PRECISION,
    dec DOUBLE PRECISION
);
SELECT create_hypertable('observation','start_time');