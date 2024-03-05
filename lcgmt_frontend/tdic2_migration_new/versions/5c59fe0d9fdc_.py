"""empty message

Revision ID: 5c59fe0d9fdc
Revises: 956a8a8324c5
Create Date: 2023-10-20 19:05:50.137373

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5c59fe0d9fdc'
down_revision = '956a8a8324c5'
branch_labels = None
depends_on = None


def upgrade():

    op.add_column('issue', sa.Column('vhf_obs_id', sa.Integer(), nullable=True), schema='tdic')
    op.add_column('issue', sa.Column('beidou_obs_id', sa.Integer(), nullable=True), schema='tdic')
    op.add_column('issue', sa.Column('fxt_src_obs_id', sa.Integer(), nullable=True), schema='tdic')
    op.create_foreign_key(None, 'issue', 'vhf_source_observation', ['vhf_obs_id'], ['id'], source_schema='tdic', referent_schema='tdic')
    op.create_foreign_key(None, 'issue', 'beidou_source_observation', ['beidou_obs_id'], ['id'], source_schema='tdic', referent_schema='tdic')
    op.create_foreign_key(None, 'issue', 'fxt_source_observation', ['fxt_src_obs_id'], ['id'], source_schema='tdic', referent_schema='tdic')

def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('pipeline', 'oss_path',
               existing_type=sa.Text(),
               type_=sa.VARCHAR(length=100),
               existing_nullable=True)
    op.create_index('ix_cms_article_recommended', 'cms_article', ['recommended'], unique=False)
    op.create_index('ix_cms_article_published', 'cms_article', ['published'], unique=False)
    op.create_index('ix_cms_article_order', 'cms_article', ['order'], unique=False)
    op.create_index('ix_cms_article_ontop', 'cms_article', ['ontop'], unique=False)
    op.create_index('ix_cms_article_id', 'cms_article', ['id'], unique=False)
    op.drop_table('ta_comment_record', schema='tdic')
    op.drop_table('issue', schema='tdic')
    op.drop_table('wxt_data_version', schema='tdic')
    op.drop_index(op.f('ix_tdic_vhf_source_observation_source_id'), table_name='vhf_source_observation', schema='tdic')
    op.drop_index(op.f('ix_tdic_vhf_source_observation_detection_id'), table_name='vhf_source_observation', schema='tdic')
    op.drop_table('vhf_source_observation', schema='tdic')
    op.drop_index(op.f('ix_tdic_source_observation_wxt_detection_id'), table_name='source_observation', schema='tdic')
    op.drop_table('source_observation', schema='tdic')
    op.drop_index(op.f('ix_tdic_fxt_source_observation_fxt_detection_id'), table_name='fxt_source_observation', schema='tdic')
    op.drop_table('fxt_source_observation', schema='tdic')
    op.drop_table('fxt_data_version', schema='tdic')
    op.drop_index(op.f('ix_tdic_beidou_source_observation_source_id'), table_name='beidou_source_observation', schema='tdic')
    op.drop_index(op.f('ix_tdic_beidou_source_observation_detection_id'), table_name='beidou_source_observation', schema='tdic')
    op.drop_table('beidou_source_observation', schema='tdic')
    op.drop_index(op.f('ix_tdic_wxt_detection_status'), table_name='wxt_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_wxt_detection_obs_start'), table_name='wxt_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_wxt_detection_obs_id'), table_name='wxt_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_wxt_detection_obs_end'), table_name='wxt_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_wxt_detection_instrument'), table_name='wxt_detection', schema='tdic')
    op.drop_table('wxt_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_vhf_detection_status'), table_name='vhf_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_vhf_detection_obs_start'), table_name='vhf_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_vhf_detection_obs_end'), table_name='vhf_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_vhf_detection_instrument'), table_name='vhf_detection', schema='tdic')
    op.drop_table('vhf_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_fxt_detection_status'), table_name='fxt_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_fxt_detection_observer'), table_name='fxt_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_fxt_detection_obs_start'), table_name='fxt_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_fxt_detection_obs_end'), table_name='fxt_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_fxt_detection_instrument'), table_name='fxt_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_fxt_detection_data_mode'), table_name='fxt_detection', schema='tdic')
    op.drop_table('fxt_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_comment_response_response_date'), table_name='comment_response', schema='tdic')
    op.drop_table('comment_response', schema='tdic')
    op.drop_index(op.f('ix_tdic_beidou_detection_status'), table_name='beidou_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_beidou_detection_obs_start'), table_name='beidou_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_beidou_detection_obs_end'), table_name='beidou_detection', schema='tdic')
    op.drop_index(op.f('ix_tdic_beidou_detection_instrument'), table_name='beidou_detection', schema='tdic')
    op.drop_table('beidou_detection', schema='tdic')
    op.drop_table('asso_stp_user', schema='tdic')
    op.drop_index(op.f('ix_tdic_user_scientific_category_user_id'), table_name='user_scientific_category', schema='tdic')
    op.drop_index(op.f('ix_tdic_user_scientific_category_category'), table_name='user_scientific_category', schema='tdic')
    op.drop_table('user_scientific_category', schema='tdic')
    op.drop_table('user_o_auth2_token', schema='tdic')
    op.drop_table('stp_user', schema='tdic')
    op.drop_index(op.f('ix_tdic_source_type_type'), table_name='source_type', schema='tdic')
    op.drop_table('source_type', schema='tdic')
    op.drop_table('source_tag_relationship', schema='tdic')
    op.drop_table('smc_user', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_technical_review_review_result'), table_name='proposal_technical_review', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_technical_review_proposal_id'), table_name='proposal_technical_review', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_technical_review_email'), table_name='proposal_technical_review', schema='tdic')
    op.drop_table('proposal_technical_review', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_source_list_source_name'), table_name='proposal_source_list', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_source_list_proposal_id'), table_name='proposal_source_list', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_source_list_fxt2_window_mode'), table_name='proposal_source_list', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_source_list_fxt2_obs_mode'), table_name='proposal_source_list', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_source_list_fxt2_filter'), table_name='proposal_source_list', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_source_list_fxt1_window_mode'), table_name='proposal_source_list', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_source_list_fxt1_obs_mode'), table_name='proposal_source_list', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_source_list_fxt1_filter'), table_name='proposal_source_list', schema='tdic')
    op.drop_table('proposal_source_list', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_season_announcement_season'), table_name='proposal_season_announcement', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_season_announcement_proposal_season_id'), table_name='proposal_season_announcement', schema='tdic')
    op.drop_table('proposal_season_announcement', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_scientific_category_proposal_id'), table_name='proposal_scientific_category', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_scientific_category_category'), table_name='proposal_scientific_category', schema='tdic')
    op.drop_table('proposal_scientific_category', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_review_expert_reviewer_type'), table_name='proposal_review_expert', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_review_expert_review_deadline'), table_name='proposal_review_expert', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_review_expert_proposal_id'), table_name='proposal_review_expert', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_review_expert_name'), table_name='proposal_review_expert', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_review_expert_email'), table_name='proposal_review_expert', schema='tdic')
    op.drop_table('proposal_review_expert', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_investigator_user_id'), table_name='proposal_investigator', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_investigator_role'), table_name='proposal_investigator', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_investigator_proposal_id'), table_name='proposal_investigator', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_investigator_name'), table_name='proposal_investigator', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_investigator_identification'), table_name='proposal_investigator', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_investigator_email'), table_name='proposal_investigator', schema='tdic')
    op.drop_table('proposal_investigator', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_expert_proposal_id'), table_name='proposal_expert', schema='tdic')
    op.drop_table('proposal_expert', schema='tdic')
    op.drop_index(op.f('ix_tdic_operation_log_operation_time'), table_name='operation_log', schema='tdic')
    op.drop_table('operation_log', schema='tdic')
    op.drop_table('observation_plan', schema='tdic')
    op.drop_index(op.f('ix_tdic_observation_obs_id'), table_name='observation', schema='tdic')
    op.drop_table('observation', schema='tdic')
    op.drop_index(op.f('ix_tdic_notification_timestamp'), taple_name='notification', schema='tdic')
    op.drop_table('notification', schema='tdic')
    op.drop_table('data_application', schema='tdic')
    op.drop_index(op.f('ix_tdic_comment_submitted_time'), table_name='comment', schema='tdic')
    op.drop_table('comment', schema='tdic')
    op.drop_table('atel_names', schema='tdic')
    op.drop_table('atel_coordinates', schema='tdic')
    op.drop_table('PV', schema='tdic')
    op.drop_table('workplan', schema='tdic')
    op.drop_index(op.f('ix_tdic_user_modify_info_user_id'), table_name='user_modify_info', schema='tdic')
    op.drop_index(op.f('ix_tdic_user_modify_info_email'), table_name='user_modify_info', schema='tdic')
    op.drop_table('user_modify_info', schema='tdic')
    op.drop_index(op.f('ix_tdic_user_id_weibo'), table_name='user', schema='tdic')
    op.drop_index(op.f('ix_tdic_user_id_wechat'), table_name='user', schema='tdic')
    op.drop_index(op.f('ix_tdic_user_id_qq'), table_name='user', schema='tdic')
    op.drop_index(op.f('ix_tdic_user_id_github'), table_name='user', schema='tdic')
    op.drop_index(op.f('ix_tdic_user_id_escience'), table_name='user', schema='tdic')
    op.drop_index(op.f('ix_tdic_user_id_cstnet'), table_name='user', schema='tdic')
    op.drop_index(op.f('ix_tdic_user_email'), table_name='user', schema='tdic')
    op.drop_table('user', schema='tdic')
    op.drop_index(op.f('ix_tdic_sys_menu_url'), table_name='sys_menu', schema='tdic')
    op.drop_index(op.f('ix_tdic_sys_menu_title_zh'), table_name='sys_menu', schema='tdic')
    op.drop_index(op.f('ix_tdic_sys_menu_title_en'), table_name='sys_menu', schema='tdic')
    op.drop_index(op.f('ix_tdic_sys_menu_order'), table_name='sys_menu', schema='tdic')
    op.drop_table('sys_menu', schema='tdic')
    op.drop_table('sql_alchemy_task', schema='tdic')
    op.drop_table('source_tag', schema='tdic')
    op.drop_index(op.f('ix_tdic_source_type'), table_name='source', schema='tdic')
    op.drop_table('source', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_survey_title'), table_name='science_team_survey', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_survey_telephone'), table_name='science_team_survey', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_survey_reseach_type'), table_name='science_team_survey', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_survey_observation_research'), table_name='science_team_survey', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_survey_name'), table_name='science_team_survey', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_survey_institute'), table_name='science_team_survey', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_survey_how_to_analyze_data'), table_name='science_team_survey', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_survey_email'), table_name='science_team_survey', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_survey_address'), table_name='science_team_survey', schema='tdic')
    op.drop_table('science_team_survey', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_application_title'), table_name='science_team_application', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_application_telephone'), table_name='science_team_application', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_application_reseach_type'), table_name='science_team_application', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_application_observation_research'), table_name='science_team_application', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_application_name'), table_name='science_team_application', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_application_institute'), table_name='science_team_application', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_application_email'), table_name='science_team_application', schema='tdic')
    op.drop_index(op.f('ix_tdic_science_team_application_address'), table_name='science_team_application', schema='tdic')
    op.drop_table('science_team_application', schema='tdic')
    op.drop_table('role', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_season_season'), table_name='proposal_season', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_season_review_deadline'), table_name='proposal_season', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_season_open_date'), table_name='proposal_season', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_season_identification'), table_name='proposal_season', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_season_expiration'), table_name='proposal_season', schema='tdic')
    op.drop_table('proposal_season', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_urgency'), table_name='proposal', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_upload_type'), table_name='proposal', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_type2'), table_name='proposal', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_type1'), table_name='proposal', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_stp'), table_name='proposal', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_season'), table_name='proposal', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_proposal_season_id'), table_name='proposal', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_proposal_number'), table_name='proposal', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_priority'), table_name='proposal', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_pid'), table_name='proposal', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_identification'), table_name='proposal', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_expiration'), table_name='proposal', schema='tdic')
    op.drop_index(op.f('ix_tdic_proposal_code'), table_name='proposal', schema='tdic')
    op.drop_table('proposal', schema='tdic')
    op.drop_table('permission', schema='tdic')
    op.drop_index(op.f('ix_tdic_paper_user_id'), table_name='paper', schema='tdic')
    op.drop_table('paper', schema='tdic')
    op.drop_table('login_session', schema='tdic')
    op.drop_index(op.f('ix_tdic_friend_link_url'), table_name='friend_link', schema='tdic')
    op.drop_index(op.f('ix_tdic_friend_link_name_zh'), table_name='friend_link', schema='tdic')
    op.drop_index(op.f('ix_tdic_friend_link_name_en'), table_name='friend_link', schema='tdic')
    op.drop_index(op.f('ix_tdic_friend_link_logo_url'), table_name='friend_link', schema='tdic')
    op.drop_table('friend_link', schema='tdic')
    op.drop_table('atel_fullcontent', schema='tdic')
    op.drop_index(op.f('ix_tdic_associate_science_team_application_referer_name'), table_name='associate_science_team_application', schema='tdic')
    op.drop_table('associate_science_team_application', schema='tdic')
    # ### end Alembic commands ###
