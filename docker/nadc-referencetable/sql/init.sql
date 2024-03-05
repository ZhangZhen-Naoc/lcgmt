CREATE DATABASE ep_referncetable;
\c ep_referncetable
CREATE EXTENSION q3c;

CREATE TABLE source(
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(30),
    ra DOUBLE PRECISION,
    dec DOUBLE PRECISION,
    mission VARCHAR(30),
    xmm BIGINT,
    maxi BIGINT,
    swift BIGINT,
    chandra BIGINT
);
CREATE INDEX source_q3c_ang2ipix_idx ON source USING btree (q3c_ang2ipix(ra, dec));
CREATE TABLE instrument(
    id BIGSERIAL PRIMARY KEY,
    mission VARCHAR(30),
    name VARCHAR(30),
    energy_start REAL,
    energy_end REAL
);

INSERT INTO source(ra,dec) VALUES(0,0);
INSERT INTO source(ra,dec) VALUES(0,0.015);

INSERT INTO instrument(mission,name,energy_start,energy_end) VALUES('maxi','maxi1',2,20);
INSERT INTO instrument(mission,name,energy_start,energy_end) VALUES('maxi','maxi2',2,4);
INSERT INTO instrument(mission,name,energy_start,energy_end) VALUES('maxi','maxi3',4,10);
INSERT INTO instrument(mission,name,energy_start,energy_end) VALUES('maxi','maxi4',10,20);
