import sys
from cgitb import enable
from itertools import product
import os
import wave
from flask import current_app, url_for
from functools import reduce
import math
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import matplotlib
from unittest.mock import patch
from sqlalchemy.exc import IntegrityError
import sqlalchemy
from app.mwr.models import CatalogueMetadata
from app.mwr.routes import transient_judgment
from app.proposal_admin.model import ObservationType, Proposal, ProposalSeason, ProposalSourceList, ProposalInvestigator
from app.sysadmin.models import SystemMenu
from app.user import service as user_service
matplotlib.use("agg")
from app import create_app,db
from app.user.models import Role, User
from app.data_center.models import *
from random import random,choice
from app.alert.models import AlertCoordinates, AlertName, AlertFullcontent,GWAlert, GRBAlert
from zz_launch import application as app
from app.wxtmetadata import add_pipeline_info, addDataVersion
from app import fxtmetadata
from itertools import product
user_id = 1
upperlimit = """{"ep": [], "upperlimit": {"XMMpnt": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "hard_crate": null, "hard_flux": null, "total_crate": null, "total_flux": null, "exposure": null}], "XMMslew": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "hard_crate": null, "hard_flux": null, "total_crate": null, "total_flux": null, "exposure": null}], "RosatPointedPSPC": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "exposure": null}], "Vela5B": [{"Start_date": "No data found for this position", "hard_crate": null, "hard_flux": null, "exposure": null}], "Integral": [{"Start_date": "2003-02-07T08:33:18", "soft_crate": "< 0.046", "soft_flux": "< 8.4824e-13", "medium_crate": "0.089 +/- 0.015", "medium_flux": "1.1481e-12 +/- 1.935e-13", "hard_crate": "0.066 +/- 0.012", "hard_flux": "1.07184e-12 +/- 1.9488e-13", "exposure": 2870000.0}], "ExosatLE": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "exposure": null}], "SwiftXRT": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "hard_crate": null, "hard_flux": null, "total_crate": null, "total_flux": null, "exposure": null}], "Einstein": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "exposure": null}], "RosatPointedHRI": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "exposure": null}], "Ginga": [{"Start_date": "No data found for this position", "hard_crate": null, "hard_flux": null, "exposure": null}], "Uhuru": [{"Start_date": "No data found for this position", "hard_crate": null7 "hard_flux": null, "exposure": null}], "Ariel5": [{"Start_date": "No data found for this position", "hard_crate": null, "hard_flux": null, "exposure": null}], "RosatSurvey": [{"Start_date": null, "soft_crate": null, "soft_flux": null, "exposure": 439.25058}], "Asca": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "hard_crate": null, "hard_flux": null, "total_crate": null, "total_flux": null, "exposure": null}], "ExosatME": [{"Start_date": "No data found for this position", "hard_crate": null, "hard_flux": null, "exposure": null}]}}"""
xray_counter_part = """{"ep": [{"id": 4321, "ra": 83.5928864023117, "dec": 21.9933187490518, "pos_err": 0.00597816962031089, "flux": null}, {"id": 21389, "ra": 83.5781375044008, "dec": 22.0521856883798, "pos_err": 0.00168459018860841, "flux": null}], "xray_2rxs": [], "xray_epref": [{"transient_candidate": 1, "xray_epref": 16257, "match_flag": 1, "prob_has_match": 1.0, "prob_this_match": 1.0, "Separation_max": 170.3403, "ra": 83.6075, "dec": 22.0204, "epos": 0.001, "powflux_2rxs": null, "powflux_2sxps": 2.259e-10, "powflux_maxi": null}], "xray_maxi_merged": [], "xray_swift_2sxps": [{"transient_candidate": 1, "xray_swift_2sxps": 190877, "match_flag": 1, "prob_has_match": 1.0, "prob_this_match": 1.0, "Separation_max": 82.551, "ra": 83.5412, "dec": 22.0434, "epos": 6.5, "powflux": 6.116e-13}], "xray_4xmmdr11": [{"transient_candidate": 1, "xray_4xmmdr11": 203127903010014, "match_flag": 1, "prob_has_match": 1.0, "prob_this_match": 1.0, "Separation_max": 51.6785, "ra": 83.5646, "dec": 22.0379, "epos": 13.3884, "sc_ep_1_flux": 0.0, "sc_ep_2_flux": 2.71121e-15, "sc_ep_3_flux": 1.43701e-14, "sc_ep_4_flux": 3.23512e-12, "sc_ep_5_flux": 1.55781e-11, "sc_ep_8_flux": 2.18143e-11, "sc_ep_9_flux": 6.23334e-14}], "xray_chandra_csc2_master": []}"""
optical_counter_part = """{"optical": {"matched_source": [{"solution_id": 1636148068921376768, "designation": "Gaia DR3 3342759135080339584", "source_id": 3342759135080339584, "random_index": 1681039305, "ref_epoch": 2016, "ra": 90.9864, "ra_error": 4.194922, "dec": 12.8441, "dec_error": 3.9528131, "parallax": null, "parallax_error": null, "parallax_over_error": null, "pm": null, "pmra": null, "pmra_error": null, "pmdec": null, "pmdec_error": null, "sa_dec_corr": -0.8627036, "ra_parallax_corr": null, "ra_pmra_corr": null, "ra_pmdec_corr": null, "dec_parallax_corr": null, "dec_pmra_corr": null, "dec_pmdec_corr": null, "parallax_pmra_corr": null, "parallax_pmdec_corr": null, "pmra_pmdec_corr": null, "astrometric_n_obs_al": 51, "astrometric_n_obs_ac": 0, "astrometric_n_good_obs_al": 51, "astrometric_n_bad_obs_al": 0, "astrometric_gof_al": 0.6960067, "astrometric_chi2_al": 52.274662, "astrometric_excess_noise": 0.0, "astrometric_excess_noise_sig": 7.40792e-16, "astrometric_params_solved": 3, "astrometric_primary_flag": false, "nu_eff_used_in_astrometry": null, "pseudocolour": null, "pseudocolour_error": null, "ra_pseudocolour_corr": null, "dec_pseudocolour_corr": null, "parallax_pseudocolour_corr": null, "pmra_pseudocolour_corr": null, "pmdec_pseudocolour_corr": null, "astrometric_matched_transits": 6, "visibility_periods_used": 5, "astrometric_sigma5d_max": 9.923719, "matched_transits": 7, "new_matched_transits": 4, "matched_transits_removed": 0, "ipd_gof_harmonic_amplitude": 0.05376477, "ipd_gof_harmonic_phase": 56.369675, "ipd_frac_multi_peak": 0, "ipd_frac_odd_win": 0, "ruwe": null, "scan_direction_strength_k1": 0.35075375, "scan_direction_strength_k2": 0.46080676, "scan_direction_strength_k3": 0.47044572, "scan_direction_strength_k4": 0.36695543, "scan_direction_mean_k1": -44.560276, "scan_direction_mean_k2": 15.428778, "scan_direction_mean_k3": -26.16689, "scan_direction_mean_k4": 43.2581, "duplicated_source": false, "phot_g_n_obs": 60, "phot_g_mean_flux": 89.01228530618961, "phot_g_mean_flux_error": 1.5712049, "phot_g_mean_flux_over_error": 56.652245, "phot_g_mean_mag": 20.813742, "phot_bp_n_obs": 5, "phot_bp_mean_flux": 68.00827109924171, "phot_bp_mean_flux_error": 15.8657465, "phot_bp_mean_flux_over_error": 4.2864842, "phot_bp_mean_mag": 20.757137, "phot_rp_n_obs": 5, "phot_rp_mean_flux": 60.25455985409443, "phot_rp_mean_flux_error": 9.192889, "phot_rp_mean_flux_over_error": 6.554475, "phot_rp_mean_mag": 20.29792, "phot_bp_rp_excess_factor": 1.4409565, "phot_bp_n_contaminated_transits": 0.0, "phot_bp_n_blended_transits": 0.0, "phot_rp_n_contaminated_transits": 0.0, "phot_rp_n_blended_transits": 0.0, "phot_proc_mode": 0, "bp_rp": 0.45921707, "bp_g": -0.056604385, "g_rp": 0.51582146, "radial_velocity": null, "radial_velocity_error": null, "rv_method_used": null, "rv_nb_transits": null, "rv_nb_deblended_transits": null, "rv_visibility_periods_used": null, "rv_expected_sig_to_noise": null, "rv_renormalised_gof": null, "rv_chisq_pvalue": null, "rv_time_duration": null, "rv_amplitude_robust": null, "rv_template_teff": null, "rv_template_logg": null, "rv_template_fe_h": null, "rv_atm_param_origin": null, "vbroad": null, "vbroad_error": null, "vbroad_nb_transits": null, "grvs_mag": null, "grvs_mag_error": null, "grvs_mag_nb_transits": null, "rvs_spec_sig_to_noise": null, "phot_variable_flag": "NOT_AVAILABLE", "l": 196.06421288272475, "b": -4.427862144701127, "ecl_lon": 90.976791086976, "ecl_lat": -10.59372090746758, "in_qso_candidates": false, "in_galaxy_candidatls": false, "non_single_star": 0, "has_xp_continuous": false, "has_xp_sampled": false, "has_rvs": false, "has_epoch_photometry": false, "has_epoch_rv": false, "has_mcmc_gspphot": false, "has_mcmc_msc": false, "in_andromeda_survey": false, "classprob_dsc_combmod_quasar": 0.0006141712, "classprob_dsc_combmod_galaxy": 2.9605679e-05, "classprob_dsc_combmod_star": 0.99900997, "teff_gspphot": null, "teff_gspphot_lower": null, "teff_gspphot_upper": null, "logg_gspphot": null, "logg_gspphot_lower": null, "logg_gspphot_upper": null, "mh_gspphot": null, "mh_gspphot_lower": null, "mh_gspphot_upper": null, "distance_gspphot": null, "distance_gspphot_lower": null, "distance_gspphot_upper": null, "azero_gspphot": null, "azero_gspphot_lower": null, "azero_gspphot_upper": null, "ag_gspphot": null, "ag_gspphot_lower": null, "ag_gspphot_upper": null, "ebpminrp_gspphot": null, "ebpminrp_gspphot_lower": null, "ebpminrp_gspphot_upper": null, "libname_gspphot": null, "epos": 0.0305, "objid": 123410909864043425, "projectionid": 1612, "skycellid": 22, "objinfoflag": 436527232, "qualityflag": 52, "ramean": 90.98639862, "decmean": 12.84406222, "rameanerr": 0.02302, "decmeanerr": 0.02002, "epochmean": 55850.97056713, "nstackdetections": 5, "ndetections": 31, "ng": 0, "nr": 9, "ni": 6, "nz": 13, "ny": 3, "gqfperfect": -999.0, "gmeanpsfmag": -999.0, "gmeanpsfmagerr": -999.0, "gmeanpsfmagstd": -999.0, "gmeanpsfmagnpt": 0, "gmeanpsfmagmin": -999.0, "gmeanpsfmagmax": -999.0, "gmeankronmag": -999.0, "gmeankronmagerr": -999.0, "gflags": 114720, "rqfperfect": 0.999376, "rmeanpsfmag": 21.2239, "rmeanpsfmagerr": 0.089408, "rmeanpsfmagstd": 0.188112, "rmeanpsfmagnpt": 7, "rmeanpsfmagmin": 20.9676, "rmeanpsfmagmax": 21.5575, "rmeankronmag": 21.3762, "rmeankronmagerr": 0.097529, "rflags": 115000, "iqfperfect": 0.999174, "imeanpsfmag": 20.5584, "imeanpsfmagerr": 0.137378, "imeanpsfmagstd": 0.150056, "imeanpsfmagnpt": 6, "imeanpsfmagmin": 20.3721, "imeanpsfmagmax": 20.7602, "imeankronmag": 20.7521, "imeankronmagerr": 0.21002, "iflags": 115000, "zqfperfect": 0.999428, "zmeanpsfmag": 20.1947, "zmeanpsfmagerr": 0.035807, "zmeanpsfmagstd": 0.188743, "zmeanpsfmagnpt": 11, "zmeanpsfmagmin": 19.9274, "zmeanpsfmagmax": 20.6483, "zmeankronmag": 20.374, "zmeankronmagerr": 0.056311, "zflags": 115000, "yqfperfect": 0.998886, "ymeanpsfmag": 19.778, "ymeanpsfmagerr": 0.004252, "ymeanpsfmagstd": 0.006175, "ymeanpsfmagnpt": 2, "ymeanpsfmagmin": 19.7727, "ymeanpsfmagmax": 19.7812, "ymeankronmag": 19.7666, "ymeankronmagerr": 0.229004, "yflags": 115000, "Transient Candidate ID hidden": 1, "Gaia DR3 hidden": 3342759135080339584, "Pan-STARRS DR1 hidden": 123410909864043425, "Matched": 1, "Prob of Has a Match hidden": 1.0, "Prob of this Match": 0.9528694785165883, "Max Separation (arcsec)": 8.774}], "optical_gaiadr3": [{"Transient Candidate ID hidden": 1, "Gaia DR3 ID": 3342759135080339584, "Matched": 1, "Prob of Has a Match hidden": 1.0, "Prob of this Match": 0.955798868209052, "Max Separation (arcsec)": 8.3184, "solution_id": 1636148068921376768, "designation": "Gaia DR3 3342759135080339584", "source_id": 3342759135080339584, "random_index": 1681039305, "ref_epoch": 2016, "ra": 90.9848, "ra_error": 4.194922, "dec": 12.8422, "dec_error": 3.9528131, "parallax": null, "parallax_error": null, "parallax_over_error": null, "pm": null, "pmra": null, "pmra_error": null, "pmdec": null, "pmdec_error": null, "ra_dec_corr": -0.8627036, "ra_parallax_corr": null, "ra_pmra_corr": null, "ra_pmdec_corr": null, "dec_parallax_corr": null, "dec_pmra_corr": null, "dec_pmdec_corr": null, "parallax_pmra_corr": null, "parallax_pmdec_corr": null, "pmra_pmdec_corr": null, "astrometric_n_obs_al": 51, "astrometric_n_obs_ac": 0, "astrometric_n_good_obs_al": 51, "astrometric_n_bad_obs_al": 0, "astrometric_gof_al": 0.6960067, "astrometric_chi2_al": 52.274662, "astrometric_excess_noise": 0.0, "astrometric_excess_noise_sig": 7.40792e-16, "astrometric_params_solved": 3, "astrometric_primary_flag": false, "nu_eff_used_in_astrometry": null, "pseudocolour": null, "pseudocolour_error": null, "ra_pseudocolour_corr": null, "dec_pseudocolour_corr": null, "parallax_pseudocolour_corr": null, "pmra_pseudocolour_corr": null, "pmdec_pseudocolour_corr": null, "astrometric_matched_transits": 6, "visibility_periods_used": 5, "astrometric_sigma5d_max": 9.923719, "matched_transits": 7, "new_matched_transits": 4, "matched_transits_removed": 0, "ipd_gof_harmonic_amplitude": 0.05376477, "ipd_gof_harmonic_phase": 56.369675, "ipd_frac_multi_peak": 0, "ipd_frac_odd_win": 0, "ruwe": null, "scan_direction_strength_k1": 0.35075375, "scan_direction_strength_k2": 0.46080676, "scan_direction_strength_k3": 0.47044572, "scan_direction_strength_k4": 0.36695543, "scan_direction_mean_k1": -44.560276, "scan_direction_mean_k2": 15.428778, "scan_direction_mean_k3": -26.16689, "scan_direction_mean_k4": 43.2581, "duplicated_source": false, "phot_g_n_obs": 60, "phot_g_mean_flux": 89.01228530618961, "phot_g_mean_flux_error": 1.5712049, "phot_g_mean_flux_over_error": 56.652245, "phot_g_mean_mag": 20.813742, "phot_bp_n_obs": 5, "phot_bp_mean_flux": 68.00827109924171, "phot_bp_mean_flux_error": 15.8657465, "phot_bp_mean_flux_over_error": 4.2864842, "phot_bp_mean_mag": 20.757137, "phot_rp_n_obs": 5, "phot_rp_mean_flux":260.25455985409443, "phot_rp_mean_flux_error": 9.192889, "phot_rp_mean_flux_over_error": 6.554475, "phot_rp_mean_mag": 20.29792, "phot_bp_rp_excess_factor": 1.4409565, "phot_bp_n_contaminated_transits": 0.0, "phot_bp_n_blended_transits": 0.0, "phot_rp_n_contaminated_transits": 0.0, "phot_rp_n_blended_transits": 0.0, "phot_proc_mode": 0, "bp_rp": 0.45921707, "bp_g": -0.056604385, "g_rp": 0.51582146, "radial_velocity": null, "radial_velocity_error": null, "rv_method_used": null, "rv_nb_transits": null, "rv_nb_deblended_transits": null, "rv_visibility_periods_used": null, "rv_expected_sig_to_noise": null, "rv_renormalised_gof": null, "rv_chisq_pvalue": null, "rv_time_duration": null, "rv_amplitude_robust": null, "rv_template_teff": null, "rv_template_logg": null, "rv_template_fe_h": null, "rv_atm_param_origin": null, "vbroad": null, "vbroad_error": null, "vbroad_nb_transits": null, "grvs_mag": null, "grvs_mag_error": null, "grvs_mag_nb_transits": null, "rvs_spec_sig_to_noise": null, "phot_variable_flag": "NOT_AVAILABLE", "l": 196.06421288272475, "b": -4.427862144701127, "ecl_lon": 90.976791086976, "ecl_lat": -10.59372090746758, "in_qso_candidates": false, "in_galaxy_candidates": false, "non_single_star": 0, "has_xp_continuous": false, "has_xp_sampled": false, "has_rvs": false, "has_epoch_photometry": false, "has_epoch_rv": false, "has_mcmc_gspphot": false, "has_mcmc_msc": false, "in_andromeda_survey": false, "classprob_dsc_combmod_quasar": 0.0006141712, "classprob_dsc_combmod_galaxy": 2.9605679e-05, "classprob_dsc_combmod_star": 0.99900997, "teff_gspphot": null, "teff_gspphot_lower": null, "teff_gspphot_upper": null, "logg_gspphot": null, "logg_gspphot_lower": null, "logg_gspphot_upper": null, "mh_gspphot": null, "mh_gspphot_lower": null, "mh_gspphot_upper": null, "distance_gspphot": null, "distance_gspphot_lower": null, "distance_gspphot_upper": null, "azero_gspphot": null, "azero_gspphot_lower": null, "azero_gspphot_upper": null, "ag_gspphot": null, "ag_gspphot_lower": null, "ag_gspphot_upper": null, "ebpminrp_gspphot": null, "ebpminrp_gspphot_lower": null, "ebpminrp_gspphot_upper": null, "libname_gspphot": null, "epos": 5.7639}], "optical_panstarrsdr1": [{"Transient Candidate ID hidden": 1, "Pan-STARRS DR1 ID": 123410909864043425, "Matched": 1, "Prob of Has a Match hidden": 1.0, "Prob of this Match": 1.0, "Max Separation (arcsec)": 1.5938, "objid": 123410909864043425, "projectionid": 1612, "skycellid": 22, "objinfoflag": 436527232, "qualityflag": 52, "ramean": 90.98639862, "decmean": 12.84406222, "rameanerr": 0.02302, "decmeanerr": 0.02002, "epochmean": 55850.97056713, "nstackdetections": 5, "ndetections": 31, "ng": 0, "nr": 9, "ni": 6, "nz": 13, "ny": 3, "gqfperfect": -999.0, "gmeanpsfmag": -999.0, "gmeanpsfmagerr": -999.0, "gmeanpsfmagstd": -999.0, "gmeanpsfmagnpt": 0, "gmeanpsfmagmin": -999.0, "gmeanpsfmagmax": -999.0, "gmeankronmag": -999.0, "gmeankronmagerr": -999.0, "gflags": 114720, "rqfperfect": 0.999376, "rmeanpsfmag": 21.2239, "rmeanpsfmagerr": 0.089408, "rmeanpsfmagstd": 0.188112, "rmeanpsfmagnpt": 7, "rmeanpsfmagmin": 20.9676, "rmeanpsfmagmax": 21.5575, "rmeankronmag": 21.3762, "rmeankronmagerr": 0.097529, "rflags": 115000, "iqfperfect": 0.999174, "imeanpsfmag": 20.5584, "imeanpsfmagerr": 0.137378, "imeanpsfmagstd": 0.150056, "imeanpsfmagnpt": 6, "imeanpsfmagmin": 20.3721, "imeanpsfmagmax": 20.7602, "imeankronmag": 20.7521, "imeankronmagerr": 0.21002, "iflags": 115000, "zqfperfect": 0.999428, "zmeanpsfmag": 20.1947, "zmeanpsfmagerr": 0.035807, "zmeanpsfmagstd": 0.188743, "zmeanpsfmagnpt": 11, "zmeanpsfmagmin": 19.9274, "zmeanpsfmagmax": 20.6483, "zmeankronmag": 20.374, "zmeankronmagerr": 0.056311, "zflags": 115000, "yqfperfect": 0.998886, "ymeanpsfmag": 19.778, "ymeanpsfmagerr": 0.004252, "ymeanpsfmagstd": 0.006175, "ymeanpsfmagnpt": 2, "ymeanpsfmagmin": 19.7727, "ymeanpsfmagmax": 19.7812, "ymeankronmag": 19.7666, "ymeankronmagerr": 0.229004, "yflags": 115000, "epos": 0.0305, "ra": 90.9864, "dec": 12.8441}]}}"""
def create_db():
    
    with app.app_context():
        assert app.config["POSTGRES_URL"] in [ 'localhost:5432' ,'database:5432' ]
        
        db.drop_all(bind=None)
        db.create_all(bind=None)
        user = create_user()
        if len(sys.argv) >= 2 and sys.argv[1] == "clean":
            return
        user_patch= patch('app.user.service.get_current_user',lambda:user)
        user_patch.start()
        assert user_service.get_current_user().email=="a@b.com"
        create_proposal_season()
        create_proposal()
        user_patch.stop()
        create_menu()
        create_data_center()
        create_src()
        create_sy01_obs()
        create_src_obs()
        create_bd_obs()
        create_bd_src_obs()
        create_alert()
        create_pipeline()
        # create_fxt()
    
def create_alert():
    for src in SourceObservation.query.filter(SourceObservation.transient_candidate==True).all():
        create_alert_by_ra_dec(src.ra,src.dec,src.wxt_detection.obs_start)
def drop():
    db.drop_all(bind=None)
    # try:
    #     db.engine.execute("DELETE FROM tdic.user")
    # except sqlalchemy.exc.ProgrammingError: # 不存在，不管，继续
    #     pass
def create_proposal_season():
    assert ProposalSeason.create_proposal_season("2023 Test Season","2022-05-01 00:00:00","2026-05-01 00:00:00","2025-05-01 00:00:00","2026-05-01 00:00:00")==3

def create_proposal():
    season = ProposalSeason.query.first()
    for obs_type in ObservationType:
        proposal = Proposal(season="",obs_type=obs_type,expiration=season.expiration)
        proposal.proposal_title = obs_type
        proposal.proposal_abstract = ""
        proposal.content_status = True
        proposal.submit_status = True
        db.session.add(proposal)
        db.session.commit()
        user = User.query.get(1)
        pi = ProposalInvestigator.create(user,proposal)
        db.session.add(pi)
        
        for idx in range(10):
            src = ProposalSourceList(source_name=f"s{idx}",proposal_id=proposal.id)
            src.ra = 0
            src.dec = 0
            src.exposure_time = 100
            src.exposure_unit = "orbit" if random() > 0.5 else "second"
            src.source_type = proposal.obs_type
            db.session.add(src)
        db.session.commit()

def random_fov():
    x = (random()*340+5)*math.pi/180
    y = (random()*170-85)*math.pi/180
    r = 2.5*math.pi/180
    return FOV.from_str("{"+f"({x-r} , {y-r}),({x-r} , {y+r}),({x+r} , {y+r}),({x+r} , {y-r})"+"}")
def create_user()->User:
    # 创建初始用户
    #User.query.delete()
    Role.init_role()
    User.register('a@b.com','password','ZhangZhen','NAOC')
    User.register('c@d.com','password','ZhangZhen2','NAOC')
    User.register('sy01@nao.cas','password','SY01Pipeline','NAOC')

    user: User=User.query.filter(User.email=="c@d.com").first()
    user.set_roles()
    user: User=User.query.filter(User.email=="a@b.com").first()
    user.set_roles()
    user.roles = [role for role in Role.query.all()]
    return user

def create_data_center():
    create_obs()

SRC_CNT=10
OBS_CNT=10
# WXT_CNT=OBS_CNT*48 # 试验星是4个，EP是48个
WXT_CNT=OBS_CNT*4 # 试验星是4个，EP是48个
SRC_OBS_CNT=1000

def create_catalogue_meta():
    catalogues = [
        ("xray_maxi_merged","x-ray","ref_flux","ra, dec,pos_err*3600"),
        ("xray_3maxig","x-ray","f4_10kev, f3_4kev, f3_10kev","ra, dec, epos"),
        ("xray_epref","x-ray","powflux_2rxs, powflux_2sxps, powflux_maxi","ra,dec,pos_err")
        
    ]
    for idx,(table_name,wavelength,available_field,position_field) in enumerate(catalogues):
        db.session.add(CatalogueMetadata(id=idx,name=table_name,table_name=table_name,wavelength=wavelength,available_field=available_field,position_field=position_field,enable=True,priority=1))
    db.session.add(CatalogueMetadata(id=100,name="Should Not Show",table_name=table_name,wavelength=wavelength,available_field=available_field,position_field=position_field,enable=False,priority=1))
    db.session.commit()
    # db.engine.execute("COPY catalogue_metadata(id,name,wavelength,comment,available_field,table_name,enable,priority,position_field) FROM '/metadata.csv'")
    
def create_src():
    """
    建立初始源表
    """
    ra,dec = 190.633,32.6015
    for i in range(SRC_CNT):
        
        src = Source( source_name="aaa",ra=ra,dec=dec,pos_err=0.1)
        src.src_type = "known_source"
        src.latest_net_rate = random()
        db.session.add(src)
        ra,dec = random_pos()
    db.session.commit()
    src = Source.fake()
    src.ra,src.dec = 85.94,22.92
    src.src_type = "known_source"
    db.session.add(src)
    db.session.commit()

    # 源标签
    tag1 = SourceTag(name="tag1")
    tag2 = SourceTag(name="tag2")
    db.session.add_all([tag1,tag2])
    db.session.commit()
    srcs = Source.query.all()
    for src in srcs:
        src_tag1  = SourceTagRelationship(src_id=src.id,tag_id=tag1.id)
        src_tag2  = SourceTagRelationship(src_id=src.id,tag_id=tag2.id)
        db.session.add_all([src_tag1,src_tag2])
        db.session.commit()

def random_wxt()->WXTDetection:
    """
    随机生成一条wxtDetection
    """
    return WXTDetection()

def create_obs():
    """
    建立Observation表
    """
    for obs_id in range(OBS_CNT):
        obs = random_obs()
        # obs.id=obs_id
        obs.obs_id = obs_id
        obs.pi_id = user_id
        db.session.add(obs)
        db.session.commit()
        for det_id in range(48):
            wxt = random_wxt()
            # wxt.id = obs_id*48+det_id
            wxt.obs_id = obs_id
            wxt.pnt_ra=obs.obj_ra
            wxt.pnt_dec = obs.obj_dec
            wxt.detnam = "CMOS" + str(det_id)
            wxt.exposure_time = 1200
            wxt.fov_new = random_fov()
            db.session.add(wxt)
        db.session.commit()
        
def create_src_obs():
    """
    创建src-obs关系表
    """
    srcs:List[Source] = list(Source.query.all())
    for src in srcs:
        dets = WXTDetection.query.order_by(db.func.random()).limit(int(random()*5)+1).all() # 随机选1-4个观测
        for det in dets:
        # for i in range(int(random()*5)):
            src_obs = SourceObservation.fake(det,src)
            # src_obs.ref_flux = choice([random(),float('nan'),None])
            is_transient = random()>0.5
            if is_transient:
                src_obs.xray_counterpart = upperlimit
                src_obs.transient_candidate = True
            else:
                src_obs.xray_counterpart = xray_counter_part
                src_obs.transient_candidate = False
            src_obs.other_counterpart = optical_counter_part
            src.xray_counterpart = src_obs.xray_counterpart
            src.other_counterpart = src_obs.other_counterpart
            src.transient_candidate = is_transient
            
            db.session.add(src_obs)
            
    try:
        db.session.commit()
    except IntegrityError as e:
        print(e.detail)
        db.session.rollback()
        create_src_obs()

def create_bd_src_obs():
    srcs:List[Source] = list(Source.query.all())
    for src in srcs:
        dets = BeidouDetection.query.order_by(db.func.random()).limit(int(random()*5)+1).all() # 随机选1-4个观测
        for det in dets:
        # for i in range(int(random()*5)):
            src_obs = BeidouSourceObservation.fake(det,src)
            # src_obs.ref_flux = choice([random(),float('nan'),None])
            is_transient = random()>0.5
            # if is_transient:
            #     src_obs.xray_counterpart = upperlimit
            #     src_obs.transient_candidate = True
            # else:
            #     src_obs.xray_counterpart = xray_counter_part
            #     src_obs.transient_candidate = False
            # src_obs.other_counterpart = optical_counter_part
            # src.xray_counterpart = src_obs.xray_counterpart
            # src.other_counterpart = src_obs.other_counterpart
            # src.transient_candidate = is_transient
            
            db.session.add(src_obs)
    try:
        db.session.commit()
    except IntegrityError as e:
        print(e.detail)
        db.session.rollback()
        create_src_obs()
def create_sy01_obs():
    for obs_id in range(OBS_CNT):
        obs = random_obs()
        # obs.obs_start = datetime(2022,11,20)+timedelta(int(random()*8))
        obs.obs_start = datetime.now() - timedelta(seconds=int(random()*24*3600*3))
        obs.obs_end = obs.obs_start + timedelta(seconds=int(random()*1000))
        # obs.id=obs_id
        
        obs.obs_id = "0680000"+"%.4d"%obs_id
        
        obs.pi_id = user_id
        obs.instrument="SY01"
        db.session.add(obs)
        db.session.commit()
        for det_id,version in product(range(13,17),range(0,3)):
            wxt = WXTDetection.fake(obs)
            
            wxt.detnam = "CMOS" + str(det_id)
            wxt.trigger = ObsTrigger.telemetry.value
            
            db.session.add(wxt)
            addDataVersion(wxt)
            sql_str_update_fov= f'UPDATE tdic.wxt_detection set fov_new = spoly \'{{({0}d, {0}d),({0}d, {0.1}d),({0.1}d, {0.1}d),({0.1}d, {0}d)}}\' where id={wxt.id};'
            # print(sql_str_update_fov)
            db.session.execute(sql_str_update_fov)
        db.session.commit()

def create_bd_obs():
    for obs_id in range(OBS_CNT):
        obs = random_obs()
        # obs.obs_start = datetime(2022,11,20)+timedelta(int(random()*8))
        obs.obs_start = datetime.now() - timedelta(seconds=int(random()*24*3600*3))
        obs.obs_end = obs.obs_start + timedelta(seconds=int(random()*1000))
        # obs.id=obs_id
        
        obs.obs_id = "1500000"+"%.4d"%obs_id
        
        obs.pi_id = user_id
        obs.instrument="FXT"
        db.session.add(obs)
        db.session.commit()
        for det_id in range(13,17):
            wxt = BeidouDetection.fake(obs)
            
            wxt.detnam = "CMOS" + str(det_id)
            
            
            db.session.add(wxt)
        db.session.commit()
        
def random_obs()->Observation:
    """
    随机生成一个Observation
    """
    ra,dec = random_pos()
    obs = Observation.fake()
    obs.obj_ra=ra
    obs.obj_dec = dec
    
    return obs
    
def random_pos() -> Tuple[float,float]:
    """
    返回随机坐标。为节省空间，只把点打在很小范围内
    """
    ra = random()+179 # [179,180]
    dec = random() #[0,1]
    return (ra,dec)

class Src:
    ra:float
    dec:float
    pos_err:float
    def __init__(self,ra:float,dec:float,pos_err:float=0) -> None:
        self.ra = ra%360 
        if dec>90:
            self.dec = 180-dec
        elif dec<-90:
            self.dec = -180-dec
        else:
            self.dec = dec
        self.pos_err = pos_err

class Cluster:
    """Src集中区域，这样构建是为了让证认时更容易匹配
    """
    srcs:List[Src]
    def __init__(self,center_ra:float, center_dec:float,radius:float,count=100) -> None:
        self.srcs = []
        for i in range(count):
            direction = random()*math.pi*2
            r = random()*radius
            ra = center_ra+r*math.cos(direction)
            dec = center_dec+r*math.sin(direction)
            self.srcs.append(Src(ra,dec))

def create_catalog():
    # ra,dec,radius
    cluster_config = [
        (0,0,1),
        (0,10,3),
        (0,90,3),
        (0,-90,8)
    ]
    clusters = map(lambda x:Cluster(*x),cluster_config)
    catalog:List[Src] = reduce(lambda x,y:x+y.srcs,clusters,[])
    return catalog

def create_menu():
    url_prefix=current_app.config['APP_URL_PREFIX']
    root = SystemMenu(url=url_prefix+"#",title_en="",title_zh="",id=0)
    db.session.add(root)
    db.session.commit()
    data_center = SystemMenu(url=url_prefix+"/",title_en="data_center",title_zh="",parent_id=root.id)
    user_support = SystemMenu(url=url_prefix+"/",title_en="user_support",title_zh="",parent_id=root.id)
    leia = SystemMenu(url=url_prefix+"/",title_en="LEIA",title_zh="",parent_id=root.id)
    db.session.add(data_center)
    db.session.add(user_support)
    db.session.add(leia)
    db.session.commit()
    source_list = SystemMenu(url=url_prefix+"/data_center/source_list",title_en="Souce List",title_zh="",parent_id=data_center.id)
    data_access = SystemMenu(url=url_prefix+"/data_center/observation_data",title_en="Data Access",title_zh="",parent_id=data_center.id)
    proposal = SystemMenu(url=url_prefix+"/proposal_submit",title_en="proposal",title_zh="",parent_id=user_support.id)
    mwr = SystemMenu(url=url_prefix+"/mwr",title_en="Cross Match",title_zh="",parent_id=user_support.id)
    simulator = SystemMenu(url=url_prefix+"/simulator",title_en="Simulator",title_zh="",parent_id=user_support.id)
    sy01 = SystemMenu(url=url_prefix+"/data_center/sy01_observation_data",title_en="SY01",title_zh="",parent_id=data_center.id)
    src_sy01 = SystemMenu(url=url_prefix+"/data_center/sy01_source_list",title_en="Src List(SY01)",title_zh="",parent_id=data_center.id)
    obs_sy01 = SystemMenu(url=url_prefix+"/data_center/sy01_observation_data",title_en="Data Access(SY01)",title_zh="",parent_id=leia.id)
    src_candidate_lst = SystemMenu(url=url_prefix+"/data_center/source_candidate_list",title_en="Source Candidate List",title_zh="", parent_id=leia.id)
    src_lst = SystemMenu(url=url_prefix+"/data_center/identified_source_list",title_en="Source List",title_zh="", parent_id=leia.id)
    transient_judge =  SystemMenu(url=url_prefix+"/mwr/transient_judgment",title_en="Transient Judgement",title_zh="",parent_id=user_support.id)
    source_upload = SystemMenu(url=url_prefix+"/data_center/source_upload",title_en="Upload Transient",title_zh="",parent_id=user_support.id)
    db.session.add(source_list)
    db.session.add(data_access)
    db.session.add(proposal)
    db.session.add(mwr)
    db.session.add(simulator)
    db.session.add(sy01)
    db.session.add(src_sy01)
    db.session.add(obs_sy01)
    db.session.add(transient_judge)
    db.session.add(source_upload)
    db.session.add(src_candidate_lst)
    db.session.add(src_lst)
    db.session.commit()

def create_alert_by_ra_dec(ra=0,dec=0,time=datetime.now()):
    
    ftel_id=int(random()*1000)
    while AlertFullcontent.query.filter(AlertFullcontent.atel_id==atel_id).first():
        atel_id = int(random()*1000)
    alert_fullcontent = AlertFullcontent(atel_id = atel_id, authors = "P. A. Evans (U. Leicester), S. Campana (INAF-OAB), K. L. Page (U. Leicester)",
     email="pae9@leicester.ac.uk", title = "Swift-XRT detection of a new X-ray transient, Swift J103441.7-571527", 
     datepublished = time,
     usertext = """ <a href="https://twitter.com/share?ref_src=twsrc5Etfw" class="twitter-share-button" data-show-count="false">Tweet</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>   </p><P>Title: Swift-XRT detection of a new X-ray transient, Swift J103441.7-571527 
Authors: P.A. Evans (U. Leicester), S. Campana (INAF-OAB), K.L. Page (U. Leicester) 
 
<p> 
The LSXPS transient search facility (Evans et al., 2023) has detected a new X-ray transient in a Swift-XRT observation beginning at 2023-01-27 15:55 UT. The transient is located at: RA, Dec = 158.67137, -57.25824 degrees which is equivalent to:<br><br> 
 
RA (J2000): 10h 34m 41.13s <br> 
Dec(J2000): -57d 15' 29.7"  <br> 
<br><br> 
 
with an uncertainty of 2.6" (radius, 90 confidence). This equates to (285.2374, 0.8387) in Galactic coordinates. 
</p> 
 
<p>We find no catalogued source at this position in SIMBAD or Vizier.</p> 
 
<p>The source count-rate in the initial observation was 0.057 +/- 0.011 ct/sec. Three target-of-opportunity follow-up observations have been obtained with XRT, which reveal the source to have decayed steadily to 0.016 +/- 0.004 ct/sec by 2023-01-30 07:00 UT.</p> 
 
<p> 
The source is heavily absorbed; a spectrum created from 7.1 ks data (the initial discovery observation and subsequent ToO data) can be fitted with an absorbed power-law, with NH = 1.8 (+0.9, -0.7)e22 cm^-2, and a photon index of 1.7 (+0.6, -0.5). 
</p> 
 
<p> 
The object is undetected in UVOT, with 3-sigma upper limits (AB magnitudes):<br><br> 
 
u  > 21.75<br> 
m2 > 22.20<br> 
w2 > 22.07 
</p> 
 
<p> 
Given the hard spectrum and location in the Galactic plane, we suggest a cataclysmic variable as the most plausible explanation of this object; however, follow-up observations are encouraged. 
</p> 
 
</P>
<P ALIGN=CENTER><EM><A HREF="http://"></A></EM>""")
    
    alert_coordinates = AlertCoordinates(atel_id = atel_id, radeg = ra, decdeg = dec,
                                         atelname = f"atel_{atel_id}", 
                                         atelurl = "http://www.astronomerstelegram.org/?read=15878")
    alert_name = AlertName(atel_id = atel_id,
                            source_name = "M31N2008-12a",
                            atelname = f"atel_{atel_id}", 
                            atelurl = "http://www.astronomerstelegram.org/?read=15878")

    gwalerts =  [GWAlert(Packet_Type = 150,
                        internal = 0,
                        Pkt_Ser_Num = 2,
                        GraceID = "MS221228l",
                        AlertType = "Preliminary",
                        HardwareInj = 0,
                        OpenAlert = 1,
                        EventPage = "https://gracedb.ligo.org/superevents/MS221228l/view/",
                        Instruments = "H1,L1",
                        FAR = 0,
                        Group = "CBC",
                        Pipeline = "gstlal",
                        Search = "gstlal",
                        skymap_fits = "https://gracedb.ligo.org/api/superevents/MS221228l/files/bayestar.multiorder.fits,1",
                        BNS = 0.9999975025,
                        NSBH = 0,
                        BBH = 0,
                        Terrestrial = 0.0000024975,
                        HasNS = 1,
                        HasRemnant = 1,
                        TimeInstant = "2022-12-28 11:32:02.000",
                        External_GCN_Notice_Id = 1356262340, 
                        External_Ivorn = "ivo://lvk.internal/Fermi#MDC-test_event2022-12-28T11:32:02.156",
                        External_Observatory = "Fermi",
                        External_Search = "MDC",
                        Time_Difference = -0.62,
                        Time_Coincidence_FAR = 0,
                        Time_Sky_Position_Coincidence_FAR = 0,
                        ),
                GWAlert(Packet_Type = 151,
                        internal = 0,
                        Pkt_Ser_Num = 3,
                        GraceID = "MS221228l",
                        AlertType = "Preliminary",
                        HardwareInj = 0,
                        OpenAlert = 1,
                        EventPage = "https://gracedb.ligo.org/superevents/MS221228l/view/",
                        Instruments = "H1,L1",
                        FAR = 0,
                        Group = "CBC",
                        Pipeline = "gstlal",
                        Search = "gstlal",
                        skymap_fits = "https://gracedb.ligo.org/api/superevents/MS221228l/files/bayestar.multiorder.fits,1",
                        BNS = 0.9999975025,
                        NSBH = 0,
                        BBH = 0,
                        Terrestrial = 0.0000024975,
                        HasNS = 1,
                        HasRemnant = 1,
                        TimeInstant = "2022-12-28 11:32:02.000",
                        External_GCN_Notice_Id = 1356262340, 
                        External_Ivorn = "ivo://lvk.internal/Fermi#MDC-test_event2022-12-28T11:32:02.156",
                        External_Observatory = "Fermi",
                        External_Search = "MDC",
                        Time_Difference = -0.62,
                        Time_Coincidence_FAR = 0,
                        Time_Sky_Position_Coincidence_FAR = 0,
                        )]
    grbalerts = [GRBAlert(RA = ra,
                        DEC = dec,
                        TimeInstant = time,
                        FullContents ="""
                        b'<?xml version = \'1.0\' encoding = \'UTF-8\'?>\n<voe:VOEvent\n      ivorn="ivo://nasa.gsfc.gcn/INTEGRAL#Point_Dir_2023-02-08T09:10:58.99_000000-802"\n      role="utility" version="2.0"\n      xmlns:voe="http://www.ivoa.net/xml/VOEvent/v2.0"\n      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n      xsi:schemaLocation="http://www.ivoa.net/xml/VOEvent/v2.0  http://www.ivoa.net/xml/VOEvent/VOEvent-v2.0.xsd" >\n  <Who>\n    <AuthorIVORN>ivo://nasa.gsfc.tan/gcn</AuthorIVORN>\n    <Author>\n      <shortName>INTEGRAL (via VO-GCN)</shortName>\n      <contactName>S. Mereghetti</contactName>\n      <contactPhone>+39 223699323</contactPhone>\n      <contactEmail>sandro@iasf-milano.inaf.it</contactEmail>\n    </Author>\n    <Date>2023-02-08T09:08:51</Date>\n    <Description>This VOEvent message was created with GCN VOE version: 15.08 17jun22</Description>\n  </Who>\n  <What>\n    <Param name="Packet_Type"   value="51" />\n    <Param name="Pkt_Ser_Num"   value="97461" />\n    <Param name
                        """)
                ,GRBAlert(RA = ra,
                        DEC = dec,
                        TimeInstant = time,
                        FullContents ="""
                        """)]
    db.session.add(alert_fullcontent)
    db.session.add(alert_coordinates)
    db.session.add(alert_name)
    for gwalert in gwalerts:
        db.session.add(gwalert)
    for grbalert in grbalerts:
        db.session.add(grbalert)
    db.session.commit() 

def create_pipeline():
    obs = "068000"
    add_pipeline_info(obs,uuid='11111',oss_paths=["oss://epver/data/0A_EVT/dislist/20230308/EVT_0A_20230308B081421782.json"])
    
    os.environ.setdefault("PIPELINE_UUID","22222")
    os.environ.setdefault("OSS_PATH","oss://epver/data/0B_EVT/dislist/20230308/EVT_0B_20230308B081421782.json")
    add_pipeline_info(obs,uuid='222',oss_paths=["oss://epver/data/0B_EVT/dislist/20230308/EVT_0B_20230308B081421782.json"])
def remove_files():
    os.system("(cd ../upload/transient/ && ls | grep [0-9] | xargs -I {} rm -rf {})")

def create_fxt():
    for obs_id_suffix in range(1,4):
        obs_id = f"6190000000{obs_id_suffix}"
        obs = Observation.fake()
        obs.instrument="FXT"
        obs.obs_id = obs_id
        db.session.commit()
        for version,detnam in product(range(0,3),(FXTDetNam.A,FXTDetNam.B)):
            
            det = FXTDetection.fake(obs) 
            det.detnam = FXTDetNam.A
            det.version = version
            fxtmetadata.add_fxt_detection(det)

            so = FXTSourceObservation()
            so.ra=0
            so.dec = 0
            so.ra_err,so.dec_err = 0.1,0.1
            so.instrument = "FXT"
            so.detnam = FXTDetNam.A
            so.index_in_det = 1
            
            so.version = "0101"
            so.target_name = ""
            
            fxtmetadata.add_fxt_source_obs(so,obs_id,detnam)

            

if __name__=="__main__":
    remove_files()
    create_db()
