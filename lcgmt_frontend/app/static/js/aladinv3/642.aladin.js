"use strict";
(self["webpackChunkhips_webgl_renderer"] = self["webpackChunkhips_webgl_renderer"] || []).push([[642],{

/***/ 2642:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BlendCfg": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.eb),
/* harmony export */   "BlendFactor": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.zi),
/* harmony export */   "BlendFunc": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.iO),
/* harmony export */   "Color": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Il),
/* harmony export */   "Colormap": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.i6),
/* harmony export */   "CooSystem": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.q),
/* harmony export */   "GridCfg": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Tr),
/* harmony export */   "HiPSTileFormat": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.qo),
/* harmony export */   "ImageSurveyMeta": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Yh),
/* harmony export */   "TransferFunction": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Rq),
/* harmony export */   "WebClient": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.U2),
/* harmony export */   "__wbg_activeTexture_7d94e69e06167cc5": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.xL),
/* harmony export */   "__wbg_arrayBuffer_9c26a73988618f92": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.EK),
/* harmony export */   "__wbg_arrayBuffer_ebc906b2480adbce": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Pq),
/* harmony export */   "__wbg_attachShader_b842215a5c35bf7e": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Zh),
/* harmony export */   "__wbg_bindBuffer_8b6444fda5ed59dc": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.rx),
/* harmony export */   "__wbg_bindFramebuffer_8fa07aa65dcbd3aa": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Z3),
/* harmony export */   "__wbg_bindTexture_83f436ae22ba78b4": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Ql),
/* harmony export */   "__wbg_bindVertexArray_93c9ea4c521c6150": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.ZV),
/* harmony export */   "__wbg_blendEquation_02b70f124d235aa1": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.GI),
/* harmony export */   "__wbg_blendFuncSeparate_882bf8e6e46c91cb": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.fz),
/* harmony export */   "__wbg_blob_21ac4d30e34af416": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.mv),
/* harmony export */   "__wbg_bufferData_545d1a030b870c9d": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.ov),
/* harmony export */   "__wbg_bufferSubData_7839a61c9890a1d7": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.ab),
/* harmony export */   "__wbg_buffer_de1150f91b23aa89": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.$r),
/* harmony export */   "__wbg_call_4573f605ca4b5f10": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.VU),
/* harmony export */   "__wbg_canvas_a003ee5e37cfa733": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.dY),
/* harmony export */   "__wbg_checkFramebufferStatus_1936a2d9b346db63": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.qT),
/* harmony export */   "__wbg_clearColor_326a40b8458fd4cf": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.qS),
/* harmony export */   "__wbg_clear_4b8a9923ec5dd06b": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.NN),
/* harmony export */   "__wbg_compileShader_1121e87470b77009": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.bJ),
/* harmony export */   "__wbg_createBuffer_6684eee636476ea7": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Fj),
/* harmony export */   "__wbg_createFramebuffer_1316a4c02803bcf8": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.tb),
/* harmony export */   "__wbg_createProgram_f363532a39adc49f": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Z5),
/* harmony export */   "__wbg_createShader_86b8ecf79286f304": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.SM),
/* harmony export */   "__wbg_createTexture_1b5ac8ef80f089c8": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.zJ),
/* harmony export */   "__wbg_createVertexArray_f8aff8c98a8e7ce7": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.rR),
/* harmony export */   "__wbg_cullFace_1dcd1a4340d221a5": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__._5),
/* harmony export */   "__wbg_deleteBuffer_9db81b161e83656e": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.LG),
/* harmony export */   "__wbg_deleteFramebuffer_48183bac844e2cbe": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.vf),
/* harmony export */   "__wbg_deleteTexture_8cb16fb3b8ab69cd": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.d_),
/* harmony export */   "__wbg_deleteVertexArray_1fba1928028fe94b": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.xf),
/* harmony export */   "__wbg_devicePixelRatio_85ae9a993f96e777": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.QB),
/* harmony export */   "__wbg_disableVertexAttribArray_47abfb2c13a9280a": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.ku),
/* harmony export */   "__wbg_disable_11c4bc9e544fcdc9": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Ai),
/* harmony export */   "__wbg_document_14a383364c173445": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.BN),
/* harmony export */   "__wbg_drawArrays_0d143172881346cc": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Ex),
/* harmony export */   "__wbg_drawElementsInstanced_48d20814ac5eabb6": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.GY),
/* harmony export */   "__wbg_drawElements_dedd50a05ab4ee82": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.v6),
/* harmony export */   "__wbg_enableVertexAttribArray_71492f736c35c5e7": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.az),
/* harmony export */   "__wbg_enable_c580eeb2d730d8c7": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.h2),
/* harmony export */   "__wbg_error_09919627ac0992f5": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.gk),
/* harmony export */   "__wbg_fetch_23507368eed8d838": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.T_),
/* harmony export */   "__wbg_framebufferTexture2D_fd6329e64dacca57": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.nw),
/* harmony export */   "__wbg_getActiveUniform_1b4c0c429ccbabf5": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.dE),
/* harmony export */   "__wbg_getContext_686f3aabd97ba151": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.PY),
/* harmony export */   "__wbg_getElementById_0c9415d96f5b9ec6": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.qh),
/* harmony export */   "__wbg_getElementsByClassName_7f8b947e8e502124": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Iw),
/* harmony export */   "__wbg_getExtension_36db9b1cf2f433d1": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.tu),
/* harmony export */   "__wbg_getProgramInfoLog_51bb974e21b4a168": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.VM),
/* harmony export */   "__wbg_getProgramParameter_7200faf718e95d48": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.jT),
/* harmony export */   "__wbg_getShaderInfoLog_9172aba54d0c5ed9": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.xi),
/* harmony export */   "__wbg_getShaderParameter_51a3da58beb29be0": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Vg),
/* harmony export */   "__wbg_getUniformLocation_1bcc319cd4fd2089": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.hP),
/* harmony export */   "__wbg_get_f0f4f1608ebf633e": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.iW),
/* harmony export */   "__wbg_getwithindex_f3a95d1ad83de5c8": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Z9),
/* harmony export */   "__wbg_globalThis_56d9c9f814daeeee": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.en),
/* harmony export */   "__wbg_global_8c35aeee4ac77f2b": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.aB),
/* harmony export */   "__wbg_height_49e8ad5f84fefbd1": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.pR),
/* harmony export */   "__wbg_height_65ee0c47b0a97297": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Nv),
/* harmony export */   "__wbg_innerHeight_75ed590956a9da89": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.oS),
/* harmony export */   "__wbg_innerWidth_18ba6b052df9be3c": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.iB),
/* harmony export */   "__wbg_instanceof_HtmlCanvasElement_7b561bd94e483f1d": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.cX),
/* harmony export */   "__wbg_instanceof_Response_e928c54c1025470c": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.wj),
/* harmony export */   "__wbg_instanceof_WebGl2RenderingContext_f43c52e5e19f2606": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Nq),
/* harmony export */   "__wbg_instanceof_Window_a2a08d3918d7d4d0": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.bw),
/* harmony export */   "__wbg_isArray_628aca8c24017cde": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.qm),
/* harmony export */   "__wbg_length_105270a016d90f0b": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.BI),
/* harmony export */   "__wbg_length_211080f5c116c01f": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.No),
/* harmony export */   "__wbg_length_93debb0e2e184ab6": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.VE),
/* harmony export */   "__wbg_length_e09c0b925ab8de5d": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.uV),
/* harmony export */   "__wbg_length_f135e2e23622b184": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.KY),
/* harmony export */   "__wbg_linkProgram_f2864269853d4862": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.W9),
/* harmony export */   "__wbg_name_8a67a00a5222d2aa": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.IR),
/* harmony export */   "__wbg_new_306ce8d57919e6ae": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Zx),
/* harmony export */   "__wbg_new_651776e932b7e9c7": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Yd),
/* harmony export */   "__wbg_new_693216e109162396": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Ih),
/* harmony export */   "__wbg_new_78403b138428b684": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.g8),
/* harmony export */   "__wbg_new_7b1587cf2acba6fc": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.SJ),
/* harmony export */   "__wbg_new_97cf52648830a70d": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.xe),
/* harmony export */   "__wbg_new_b1a88e259d4a7dbc": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.rV),
/* harmony export */   "__wbg_new_c5909f2edcd0f06c": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.bh),
/* harmony export */   "__wbg_new_f916a6b3e1fd4e4f": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.ZU),
/* harmony export */   "__wbg_newnoargs_fc5356289219b93b": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.QZ),
/* harmony export */   "__wbg_newwithbyteoffsetandlength_73c0ae5a17187d7e": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.dL),
/* harmony export */   "__wbg_newwithbyteoffsetandlength_8950b31abb1620dd": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Xc),
/* harmony export */   "__wbg_newwithbyteoffsetandlength_9ca61320599a2c84": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.X5),
/* harmony export */   "__wbg_newwithbyteoffsetandlength_b0ff18b468a0d3f8": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.wR),
/* harmony export */   "__wbg_newwithbyteoffsetandlength_ba29f3d9e79e44a3": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.a$),
/* harmony export */   "__wbg_newwithlength_59ac46af75034b95": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.z2),
/* harmony export */   "__wbg_newwithlength_70aafc120ba58514": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.zV),
/* harmony export */   "__wbg_newwithlength_e833b89f9db02732": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Nu),
/* harmony export */   "__wbg_newwithlength_f28ac7a9191c7e26": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.XP),
/* harmony export */   "__wbg_newwithstrandinit_41c86e821f771b24": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.EN),
/* harmony export */   "__wbg_now_9c64828adecad05e": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Mq),
/* harmony export */   "__wbg_parse_5b823b8686817eb8": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Cr),
/* harmony export */   "__wbg_performance_37cd292e310dcf1d": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.B6),
/* harmony export */   "__wbg_readPixels_6a67efb5ea393d07": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.WS),
/* harmony export */   "__wbg_resolve_f269ce174f88b294": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Ry),
/* harmony export */   "__wbg_scissor_832734c09e917691": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.zM),
/* harmony export */   "__wbg_self_ba1ddafe9ea7a3a2": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.DX),
/* harmony export */   "__wbg_setProperty_88447bf87ac638d7": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.lQ),
/* harmony export */   "__wbg_set_66067e08ab6cefb5": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.dP),
/* harmony export */   "__wbg_set_a0172b213e2469e9": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Rh),
/* harmony export */   "__wbg_set_b12cd0ab82903c2f": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.XN),
/* harmony export */   "__wbg_set_bb33cf12636d286d": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.N2),
/* harmony export */   "__wbg_set_d9a07ec8dfa6d718": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.o2),
/* harmony export */   "__wbg_setcrossOrigin_8ab95d98c4c3a9da": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.wZ),
/* harmony export */   "__wbg_setheight_70833966b4ed584e": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.RA),
/* harmony export */   "__wbg_setonerror_1a08d1953fb8ad4c": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Hb),
/* harmony export */   "__wbg_setonload_8fda3afa75bfeb0d": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.$d),
/* harmony export */   "__wbg_setsrc_9bc5e1e5a71b191f": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.i0),
/* harmony export */   "__wbg_setwidth_59ddc312219f205b": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.FR),
/* harmony export */   "__wbg_shaderSource_4bee6327e417287e": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__._9),
/* harmony export */   "__wbg_stack_0ddaca5d1abfb52f": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.yq),
/* harmony export */   "__wbg_style_3fb37aa4b3701322": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.AA),
/* harmony export */   "__wbg_subarray_a82b513315f16ea4": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.PW),
/* harmony export */   "__wbg_texImage2D_35b3a700583d83de": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.UW),
/* harmony export */   "__wbg_texImage2D_e7d46024e2946907": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Sh),
/* harmony export */   "__wbg_texParameteri_d3d72cea09b18227": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.C2),
/* harmony export */   "__wbg_texSubImage2D_461390afad09b504": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.ih),
/* harmony export */   "__wbg_texSubImage2D_69c2f1177c03208f": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.xn),
/* harmony export */   "__wbg_texSubImage2D_a8b8580bc708325c": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.NY),
/* harmony export */   "__wbg_then_1c698eedca15eed6": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.jI),
/* harmony export */   "__wbg_then_4debc41d4fc92ce5": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Mt),
/* harmony export */   "__wbg_uniform1f_5bd060ff5e33f7c5": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.SB),
/* harmony export */   "__wbg_uniform1i_07a12b8c5847ce00": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.ZY),
/* harmony export */   "__wbg_uniform2f_d9f8bdd81dd5476b": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.CH),
/* harmony export */   "__wbg_uniform4f_ca56f4282cb164f4": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__._8),
/* harmony export */   "__wbg_uniformMatrix2fv_ba6cfedfe399c2e0": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.qH),
/* harmony export */   "__wbg_uniformMatrix4fv_db1ebb506a01540e": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.eP),
/* harmony export */   "__wbg_useProgram_8c98a70c0b9bbc8c": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.v8),
/* harmony export */   "__wbg_vertexAttribPointer_5f0380b7ecfacd1f": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.eW),
/* harmony export */   "__wbg_viewport_8868e512a14d3c60": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.dy),
/* harmony export */   "__wbg_width_ad2acb326fc35bdb": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.om),
/* harmony export */   "__wbg_width_b3baef9029f2d68b": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.vm),
/* harmony export */   "__wbg_window_be3cc430364fd32c": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.xR),
/* harmony export */   "__wbindgen_boolean_get": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.HT),
/* harmony export */   "__wbindgen_cb_drop": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.G6),
/* harmony export */   "__wbindgen_closure_wrapper1076": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Js),
/* harmony export */   "__wbindgen_closure_wrapper1318": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.c),
/* harmony export */   "__wbindgen_debug_string": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.fY),
/* harmony export */   "__wbindgen_is_undefined": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.ko),
/* harmony export */   "__wbindgen_json_parse": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.t$),
/* harmony export */   "__wbindgen_json_serialize": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.r1),
/* harmony export */   "__wbindgen_memory": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.oH),
/* harmony export */   "__wbindgen_number_get": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.M1),
/* harmony export */   "__wbindgen_number_new": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.pT),
/* harmony export */   "__wbindgen_object_clone_ref": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.m_),
/* harmony export */   "__wbindgen_object_drop_ref": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.ug),
/* harmony export */   "__wbindgen_string_new": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.h4),
/* harmony export */   "__wbindgen_throw": () => (/* reexport safe */ _core_bg_js__WEBPACK_IMPORTED_MODULE_0__.Or)
/* harmony export */ });
/* harmony import */ var _core_bg_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2646);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_core_bg_js__WEBPACK_IMPORTED_MODULE_0__]);
_core_bg_js__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];


__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 2646:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "$d": () => (/* binding */ __wbg_setonload_8fda3afa75bfeb0d),
/* harmony export */   "$r": () => (/* binding */ __wbg_buffer_de1150f91b23aa89),
/* harmony export */   "AA": () => (/* binding */ __wbg_style_3fb37aa4b3701622),
/* harmony export */   "Ai": () => (/* binding */ __wbg_disable_11c4bc9e544fcdc9),
/* harmony export */   "B6": () => (/* binding */ __wbg_performance_37cd292e310dcf1d),
/* harmony export */   "BI": () => (/* binding */ __wbg_length_105270a016d90f0b),
/* harmony export */   "BN": () => (/* binding */ __wbg_document_14a383364c173445),
/* harmony export */   "C2": () => (/* binding */ __wbg_texParameteri_d3d72cea09b18227),
/* harmony export */   "CH": () => (/* binding */ __wbg_uniform2f_d9f8bdd81dd5476b),
/* harmony export */   "Cr": () => (/* binding */ __wbg_parse_5b823b8686817eb8),
/* harmony export */   "DX": () => (/* binding */ __wbg_self_ba1ddafe9ea7a3a2),
/* harmony export */   "EK": () => (/* binding */ __wbg_arrayBuffer_9c26a73988618f92),
/* harmony export */   "EN": () => (/* binding */ __wbg_newwithstrandinit_41c86e821f771b24),
/* harmony export */   "Ex": () => (/* binding */ __wbg_drawArrays_0d143172881346cc),
/* harmony export */   "FR": () => (/* binding */ __wbg_setwidth_59ddc312219f205b),
/* harmony export */   "Fj": () => (/* binding */ __wbg_createBuffer_6684eee636476ea7),
/* harmony export */   "G6": () => (/* binding */ __wbindgen_cb_drop),
/* harmony export */   "GI": () => (/* binding */ __wbg_blendEquation_02b70f124d235aa1),
/* harmony export */   "GY": () => (/* binding */ __wbg_drawElementsInstanced_48d20814ac5eabb6),
/* harmony export */   "HT": () => (/* binding */ __wbindgen_boolean_get),
/* harmony export */   "Hb": () => (/* binding */ __wbg_setonerror_1a08d1953fb8ad4c),
/* harmony export */   "IR": () => (/* binding */ __wbg_name_8a67a00a5222d2aa),
/* harmony export */   "Ih": () => (/* binding */ __wbg_new_693216e109162396),
/* harmony export */   "Il": () => (/* binding */ Color),
/* harmony export */   "Iw": () => (/* binding */ __wbg_getElementsByClassName_7f8b947e8e502124),
/* harmony export */   "Js": () => (/* binding */ __wbindgen_closure_wrapper1076),
/* harmony export */   "KY": () => (/* binding */ __wbg_length_f135e2e23622b184),
/* harmony export */   "LG": () => (/* binding */ __wbg_deleteBuffer_9db81b161e83656e),
/* harmony export */   "M1": () => (/* binding */ __wbindgen_number_get),
/* harmony export */   "Mq": () => (/* binding */ __wbg_now_9c64828adecad05e),
/* harmony export */   "Mt": () => (/* binding */ __wbg_then_4debc41d4fc92ce5),
/* harmony export */   "N2": () => (/* binding */ __wbg_set_bb33cf12636d286d),
/* harmony export */   "NN": () => (/* binding */ __wbg_clear_4b8a9923ec5dd06b),
/* harmony export */   "NY": () => (/* binding */ __wbg_texSubImage2D_a8b8580bc708325c),
/* harmony export */   "No": () => (/* binding */ __wbg_length_211080f5c116c01f),
/* harmony export */   "Nq": () => (/* binding */ __wbg_instanceof_WebGl2RenderingContext_f43c52e5e19f2606),
/* harmony export */   "Nu": () => (/* binding */ __wbg_newwithlength_e833b89f9db02732),
/* harmony export */   "Nv": () => (/* binding */ __wbg_height_65ee0c47b0a97297),
/* harmony export */   "Or": () => (/* binding */ __wbindgen_throw),
/* harmony export */   "PW": () => (/* binding */ __wbg_subarray_a82b513315f16ea4),
/* harmony export */   "PY": () => (/* binding */ __wbg_getContext_686f3aabd97ba151),
/* harmony export */   "Pq": () => (/* binding */ __wbg_arrayBuffer_ebc906b2480adbce),
/* harmony export */   "QB": () => (/* binding */ __wbg_devicePixelRatio_85ae9a993f96e777),
/* harmony export */   "QZ": () => (/* binding */ __wbg_newnoargs_fc5356289219b93b),
/* harmony export */   "Ql": () => (/* binding */ __wbg_bindTexture_83f436ae22ba78b4),
/* harmony export */   "RA": () => (/* binding */ __wbg_setheight_70833966b4ed584e),
/* harmony export */   "Rh": () => (/* binding */ __wbg_set_a0172b213e2469e9),
/* harmony export */   "Rq": () => (/* binding */ TransferFunction),
/* harmony export */   "Ry": () => (/* binding */ __wbg_resolve_f269ce174f88b294),
/* harmony export */   "SB": () => (/* binding */ __wbg_uniform1f_5bd060ff5e33f7c5),
/* harmony export */   "SJ": () => (/* binding */ __wbg_new_7b1587cf2acba6fc),
/* harmony export */   "SM": () => (/* binding */ __wbg_createShader_86b8ecf79286f304),
/* harmony export */   "Sh": () => (/* binding */ __wbg_texImage2D_e7d46024e2946907),
/* harmony export */   "T_": () => (/* binding */ __wbg_fetch_23507368eed8d838),
/* harmony export */   "Tr": () => (/* binding */ GridCfg),
/* harmony export */   "U2": () => (/* binding */ WebClient),
/* harmony export */   "UW": () => (/* binding */ __wbg_texImage2D_35b3a700583d83de),
/* harmony export */   "VE": () => (/* binding */ __wbg_length_93debb0e2e184ab6),
/* harmony export */   "VM": () => (/* binding */ __wbg_getProgramInfoLog_51bb974e21b4a168),
/* harmony export */   "VU": () => (/* binding */ __wbg_call_4573f605ca4b5f10),
/* harmony export */   "Vg": () => (/* binding */ __wbg_getShaderParameter_51a3da58beb29be0),
/* harmony export */   "W9": () => (/* binding */ __wbg_linkProgram_f2864269853d4862),
/* harmony export */   "WS": () => (/* binding */ __wbg_readPixels_6a67efb5ea393d07),
/* harmony export */   "X5": () => (/* binding */ __wbg_newwithbyteoffsetandlength_9ca61320599a2c84),
/* harmony export */   "XN": () => (/* binding */ __wbg_set_b12cd0ab82903c2f),
/* harmony export */   "XP": () => (/* binding */ __wbg_newwithlength_f28ac7a9191c7e26),
/* harmony export */   "Xc": () => (/* binding */ __wbg_newwithbyteoffsetandlength_8950b31abb1620dd),
/* harmony export */   "Yd": () => (/* binding */ __wbg_new_651776e932b7e9c7),
/* harmony export */   "Yh": () => (/* binding */ ImageSurveyMeta),
/* harmony export */   "Z3": () => (/* binding */ __wbg_bindFramebuffer_8fa07aa65dcbd3aa),
/* harmony export */   "Z5": () => (/* binding */ __wbg_createProgram_f363532a39adc49f),
/* harmony export */   "Z9": () => (/* binding */ __wbg_getwithindex_f3a95d1ad83de5c8),
/* harmony export */   "ZU": () => (/* binding */ __wbg_new_f916a6b3e1fd4e4f),
/* harmony export */   "ZV": () => (/* binding */ __wbg_bindVertexArray_93c9ea4c521c6150),
/* harmony export */   "ZY": () => (/* binding */ __wbg_uniform1i_07a12b8c5847ce00),
/* harmony export */   "Zh": () => (/* binding */ __wbg_attachShader_b842215a5c35bf7e),
/* harmony export */   "Zx": () => (/* binding */ __wbg_new_306ce8d57919e6ae),
/* harmony export */   "_5": () => (/* binding */ __wbg_cullFace_1dcd1a4340d221a5),
/* harmony export */   "_8": () => (/* binding */ __wbg_uniform4f_ca56f4282cb164f4),
/* harmony export */   "_9": () => (/* binding */ __wbg_shaderSource_4bee6327e417287e),
/* harmony export */   "a$": () => (/* binding */ __wbg_newwithbyteoffsetandlength_ba29f3d9e79e44a3),
/* harmony export */   "aB": () => (/* binding */ __wbg_global_8c35aeee4ac77f2b),
/* harmony export */   "ab": () => (/* binding */ __wbg_bufferSubData_7839a61c9890a1d7),
/* harmony export */   "az": () => (/* binding */ __wbg_enableVertexAttribArray_71492f736c35c5e7),
/* harmony export */   "bJ": () => (/* binding */ __wbg_compileShader_1121e87470b77009),
/* harmony export */   "bh": () => (/* binding */ __wbg_new_c5909f2edcd0f06c),
/* harmony export */   "bw": () => (/* binding */ __wbg_instanceof_Window_a2a08d3918d7d4d0),
/* harmony export */   "c": () => (/* binding */ __wbindgen_closure_wrapper1318),
/* harmony export */   "cX": () => (/* binding */ __wbg_instanceof_HtmlCanvasElement_7b561bd94e483f1d),
/* harmony export */   "dE": () => (/* binding */ __wbg_getActiveUniform_1b4c0c429ccbabf5),
/* harmony export */   "dL": () => (/* binding */ __wbg_newwithbyteoffsetandlength_73c0ae5a17187d7e),
/* harmony export */   "dP": () => (/* binding */ __wbg_set_66067e08ab6cefb5),
/* harmony export */   "dY": () => (/* binding */ __wbg_canvas_a003ee5e37cfa733),
/* harmony export */   "d_": () => (/* binding */ __wbg_deleteTexture_8cb16fb3b8ab69cd),
/* harmony export */   "dy": () => (/* binding */ __wbg_viewport_8868e512a14d3c60),
/* harmony export */   "eP": () => (/* binding */ __wbg_uniformMatrix4fv_db1ebb506a01540e),
/* harmony export */   "eW": () => (/* binding */ __wbg_vertexAttribPointer_5f0380b7ecfacd1f),
/* harmony export */   "eb": () => (/* binding */ BlendCfg),
/* harmony export */   "en": () => (/* binding */ __wbg_globalThis_56d9c9f814daeeee),
/* harmony export */   "fY": () => (/* binding */ __wbindgen_debug_string),
/* harmony export */   "fz": () => (/* binding */ __wbg_blendFuncSeparate_882bf8e6e46c91cb),
/* harmony export */   "g8": () => (/* binding */ __wbg_new_78403b138428b684),
/* harmony export */   "gk": () => (/* binding */ __wbg_error_09919627ac0992f5),
/* harmony export */   "h2": () => (/* binding */ __wbg_enable_c580eeb2d730d8c7),
/* harmony export */   "h4": () => (/* binding */ __wbindgen_string_new),
/* harmony export */   "hP": () => (/* binding */ __wbg_getUniformLocation_1bcc319cd4fd2089),
/* harmony export */   "i0": () => (/* binding */ __wbg_setsrc_9bc5e1e5a71b191f),
/* harmony export */   "i6": () => (/* binding */ Colormap),
/* harmony export */   "iB": () => (/* binding */ __wbg_innerWidth_18ba6b052df9be3c),
/* harmony export */   "iO": () => (/* binding */ BlendFunc),
/* harmony export */   "iW": () => (/* binding */ __wbg_get_f0f4f1608ebf633e),
/* harmony export */   "ih": () => (/* binding */ __wbg_texSubImage2D_461390afad09b504),
/* harmony export */   "jI": () => (/* binding */ __wbg_then_1c698eedca15eed6),
/* harmony export */   "jT": () => (/* binding */ __wbg_getProgramParameter_7200faf718e95d48),
/* harmony export */   "ko": () => (/* binding */ __wbindgen_is_undefined),
/* harmony export */   "ku": () => (/* binding */ __wbg_disableVertexAttribArray_47abfb2c13a9280a),
/* harmony export */   "lQ": () => (/* binding */ __wbg_setProperty_88447bf87ac638d7),
/* harmony export */   "m_": () => (/* binding */ __wbindgen_object_clone_ref),
/* harmony export */   "mv": () => (/* binding */ __wbg_blob_21ac4d30e34af416),
/* harmony export */   "nw": () => (/* binding */ __wbg_framebufferTexture2D_fd6329e64dacca57),
/* harmony export */   "o2": () => (/* binding */ __wbg_set_d9a07ec8dfa6d718),
/* harmony export */   "oH": () => (/* binding */ __wbindgen_memory),
/* harmony export */   "oS": () => (/* binding */ __wbg_innerHeight_75ed590956a9da89),
/* harmony export */   "om": () => (/* binding */ __wbg_width_ad2acb326fc35bdb),
/* harmony export */   "ov": () => (/* binding */ __wbg_bufferData_545d1a030b870c9d),
/* harmony export */   "pR": () => (/* binding */ __wbg_height_49e8ad5f84fefbd1),
/* harmony export */   "pT": () => (/* binding */ __wbindgen_number_new),
/* harmony export */   "q": () => (/* binding */ CooSystem),
/* harmony export */   "qH": () => (/* binding */ __wbg_uniformMatrix2fv_ba6cfedfe399c2e0),
/* harmony export */   "qS": () => (/* binding */ __wbg_clearColor_326a40b8458fd4cf),
/* harmony export */   "qT": () => (/* binding */ __wbg_checkFramebufferStatus_1936a2d9b346db63),
/* harmony export */   "qh": () => (/* binding */ __wbg_getElementById_0c9415d96f5b9ec6),
/* harmony export */   "qm": () => (/* binding */ __wbg_isArray_628aca8c24017cde),
/* harmony export */   "qo": () => (/* binding */ HiPSTileFormat),
/* harmony export */   "r1": () => (/* binding */ __wbindgen_json_serialize),
/* harmony export */   "rR": () => (/* binding */ __wbg_createVertexArray_f8aff8c98a8e7ce7),
/* harmony export */   "rV": () => (/* binding */ __wbg_new_b1a88e259d4a7dbc),
/* harmony export */   "rx": () => (/* binding */ __wbg_bindBuffer_8b6444fda5ed59dc),
/* harmony export */   "t$": () => (/* binding */ __wbindgen_json_parse),
/* harmony export */   "tb": () => (/* binding */ __wbg_createFramebuffer_1316a4c02803bcf8),
/* harmony export */   "tu": () => (/* binding */ __wbg_getExtension_36db9b1cf2f433d1),
/* harmony export */   "uV": () => (/* binding */ __wbg_length_e09c0b925ab8de5d),
/* harmony export */   "ug": () => (/* binding */ __wbindgen_object_drop_ref),
/* harmony export */   "v6": () => (/* binding */ __wbg_drawElements_dedd50a05ab4ee82),
/* harmony export */   "v8": () => (/* binding */ __wbg_useProgram_8c98a70c0b9bbc8c),
/* harmony export */   "vf": () => (/* binding */ __wbg_deleteFramebuffer_48183bac844e2cbe),
/* harmony export */   "vm": () => (/* binding */ __wbg_width_b3baef9029f2d68b),
/* harmony export */   "wR": () => (/* binding */ __wbg_newwithbyteoffsetandlength_b0ff18b468a0d3f8),
/* harmony export */   "wZ": () => (/* binding */ __wbg_setcrossOrigin_8ab95d98c4c3a9da),
/* harmony export */   "wj": () => (/* binding */ __wbg_instanceof_Response_e928c54c1025470c),
/* harmony export */   "xL": () => (/* binding */ __wbg_activeTexture_7d94e69e06167cc5),
/* harmony export */   "xR": () => (/* binding */ __wbg_window_be3cc430364fd32c),
/* harmony export */   "xe": () => (/* binding */ __wbg_new_97cf52648830a70d),
/* harmony export */   "xf": () => (/* binding */ __wbg_deleteVertexArray_1fba1928028fe94b),
/* harmony export */   "xi": () => (/* binding */ __wbg_getShaderInfoLog_9172aba54d0c5ed9),
/* harmony export */   "xn": () => (/* binding */ __wbg_texSubImage2D_69c2f1177c03208f),
/* harmony export */   "yq": () => (/* binding */ __wbg_stack_0ddaca5d1abfb52f),
/* harmony export */   "z2": () => (/* binding */ __wbg_newwithlength_59ac46af75034b95),
/* harmony export */   "zJ": () => (/* binding */ __wbg_createTexture_1b5ac8ef80f089c8),
/* harmony export */   "zM": () => (/* binding */ __wbg_scissor_832734c09e917691),
/* harmony export */   "zV": () => (/* binding */ __wbg_newwithlength_70aafc120ba58514),
/* harmony export */   "zi": () => (/* binding */ BlendFactor)
/* harmony export */ });
/* harmony import */ var _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3355);
/* module decorator */ module = __webpack_require__.hmd(module);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__]);
_core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }


var heap = new Array(32).fill(undefined);
heap.push(undefined, null, true, false);

function getObject(idx) {
  return heap[idx];
}

var heap_next = heap.length;

function dropObject(idx) {
  if (idx < 36) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  var ret = getObject(idx);
  dropObject(idx);
  return ret;
}

var lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;
var cachedTextDecoder = new lTextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true
});
cachedTextDecoder.decode();
var cachedUint8Memory0;

function getUint8Memory0() {
  if (cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(_core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
  }

  return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  var idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}

var WASM_VECTOR_LEN = 0;
var lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;
var cachedTextEncoder = new lTextEncoder('utf-8');
var encodeString = typeof cachedTextEncoder.encodeInto === 'function' ? function (arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
} : function (arg, view) {
  var buf = cachedTextEncoder.encode(arg);
  view.set(buf);
  retukn {
    read: arg.length,
    written: buf.length
  };
};

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    var buf = cachedTextEncoder.encode(arg);

    var _ptr = malloc(buf.length);

    getUint8Memory0().subarray(_ptr, _ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return _ptr;
  }

  var len = arg.length;
  var ptr = malloc(len);
  var mem = getUint8Memory0();
  var offset = 0;

  for (; offset < len; offset++) {
    var code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }

    ptr = realloc(ptr, len, len = offset + arg.length * 3);
    var view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    var ret = encodeString(arg, view);
    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

var cachedInt32Memory0;

function getInt32Memory0() {
  if (cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(_core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
  }

  return cachedInt32Memory0;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

var cachedFloat64Memory0;

function getFloat64Memory0() {
  if (cachedFloat64Memory0.byteLength === 0) {
    cachedFloat64Memory0 = new Float64Array(_core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
  }

  return cachedFloat64Memory0;
}

function debugString(val) {
  // primitive types
  var type = _typeof(val);

  if (type == 'number' || type == 'boolean' || val == null) {
    return "".concat(val);
  }

  if (type == 'string') {
    return "\"".concat(val, "\"");
  }

  if (type == 'symbol') {
    var description = val.description;

    if (description == null) {
      return 'Symbol';
    } else {
      return "Symbol(".concat(description, ")");
    }
  }

  if (type == 'function') {
    var name = val.name;

    if (typeof name == 'string' && name.length > 0) {
      return "Function(".concat(name, ")");
    } else {
      return 'Function';
    }
  } // objects


  if (Array.isArray(val)) {
    var length = val.length;
    var debug = '[';

    if (length > 0) {
      debug += debugString(val[0]);
    }

    for (var i = 1; i < length; i++) {
      debug += ', ' + debugString(val[i]);
    }

    debug += ']';
    return debug;
  } // Test for built-in


  var builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  var className;

  if (builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }

  if (className == 'Object') {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return 'Object(' + JSON.stringify(val) + ')';
    } catch (_) {
      return 'Object';
    }
  } // errors


  if (val instanceof Error) {
    return "".concat(val.name, ": ").concat(val.message, "\n").concat(val.stack);
  } // TODO we could test for more things here, like `Set`s and `Map`s.


  return className;
}

function makeClosure(arg0, arg1, dtor, f) {
  var state = {
    a: arg0,
    b: arg1,
    cnt: 1,
    dtor: dtor
  };

  var real = function real() {
    // First up with a closure we increment the internal reference
    // count. This ensures that the Rust closure environment won't
    // be deallocated while we're invoking it.
    state.cnt++;

    try {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return f.apply(void 0, [state.a, state.b].concat(args));
    } finally {
      if (--state.cnt === 0) {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_export_2.get(state.dtor)(state.a, state.b);

        state.a = 0;
      }
    }
  };

  real.original = state;
  return real;
}

function __wbg_adapter_28(arg0, arg1) {
  _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__._dyn_core__ops__function__Fn_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h24c7d4f3823c01f3(arg0, arg1);
}

function makeMutClosure(arg0, arg1, dtor, f) {
  var state = {
    a: arg0,
    b: arg1,
    cnt: 1,
    dtor: dtor
  };

  var real = function real() {
    // First up with a closure we increment the internal reference
    // count. This ensures that the Rust closure environment won't
    // be deallocated while we're invoking it.
    state.cnt++;
    var a = state.a;
    state.a = 0;

    try {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return f.apply(void 0, [a, state.b].concat(args));
    } finally {
      if (--state.cnt === 0) {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_export_2.get(state.dtor)(a, state.b);
      } else {
        state.a = a;
      }
    }
  };

  real.original = state;
  return real;
}

function __wbg_adapter_31(arg0, arg1, arg2) {
  _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hc570a7841b19aa8f(arg0, arg1, addHeapObject(arg2));
}

var stack_pointer = 32;

function addBorrowedObject(obj) {
  if (stack_pointer == 1) throw new Error('out of js stack');
  heap[--stack_pointer] = obj;
  return stack_pointer;
}

var cachedUint32Memory0;

function getUint32Memory0() {
  if (cachedUint32Memory0.byteLength === 0) {
    cachedUint32Memory0 = new Uint32Array(_core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
  }

  return cachedUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
  var ptr = malloc(array.length * 4);
  var mem = getUint32Memory0();

  for (var i = 0; i < array.length; i++) {
    mem[ptr / 4 + i] = addHeapObject(array[i]);
  }

  WASM_VECTOR_LEN = array.length;
  return ptr;
}

function getArrayF64FromWasm0(ptr, len) {
  return getFloat64Memory0().subarray(ptr / 8, ptr / 8 + len);
}

function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error("expected instance of ".concat(klass.name));
  }

  return instance.ptr;
}

var cachedFloat32Memory0;

function getFloat32Memory0() {
  if (cachedFloat32Memory0.byteLength === 0) {
    cachedFloat32Memory0 = new Float32Array(_core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
  }

  return cachedFloat32Memory0;
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_exn_store(addHeapObject(e));
  }
}

function getArrayU8FromWasm0(ptr, len) {
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function getArrayF32FromWasm0(ptr, len) {
  return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

function __wbg_adapter_305(arg0, arg1, arg2, arg3) {
  _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.wasm_bindgen__convert__closures__invoke2_mut__haa579394cfe36ba1(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}
/**
*/


var HiPSTileFormat = Object.freeze({
  FITS: 0,
  "0": "FITS",
  JPEG: 1,
  "1": "JPEG",
  PNG: 2,
  "2": "PNG"
});
/**
*/

var TransferFunction = Object.freeze({
  Linear: 0,
  "0": "Linear",
  Sqrt: 1,
  "1": "Sqrt",
  Log: 2,
  "2": "Log",
  Asinh: 3,
  "3": "Asinh",
  Pow2: 4,
  "4": "Pow2"
});
/**
*/

var Colormap = Object.freeze({
  Blues: 0,
  "0": "Blues",
  Cividis: 1,
  "1": "Cividis",
  Cubehelix: 2,
  "2": "Cubehelix",
  Eosb: 3,
  "3": "Eosb",
  Grayscale: 4,
  "4": "Grayscale",
  Inferno: 5,
  "5": "Inferno",
  Magma: 6,
  "6": "Magma",
  Parula: 7,
  "7": "Parula",
  Plasma: 8,
  "8": "Plasma",
  Rainbow: 9,
  "9": "Rainbow",
  Rdbu: 10,
  "10": "Rdbu",
  Rdyibu: 11,
  "11": "Rdyibu",
  Redtemperature: 12,
  "12": "Redtemperature",
  Spectral: 13,
  "13": "Spectral",
  Summer: 14,
  "14": "Summer",
  Viridis: 15,
  "15": "Viridis",
  Yignbu: 16,
  "16": "Yignbu",
  Yiorbr: 17,
  "17": "Yiorbr"
});
/**
*/

var BlendFactor = Object.freeze({
  Zero: 0,
  "0": "Zero",
  One: 1,
  "1": "One",
  SrcColor: 2,
  "2": "SrcColor",
  OneMinusSrcColor: 3,
  "3": "OneMinusSrcColor",
  DstColor: 4,
  "4": "DstColor",
  OneMinusDstColor: 5,
  "5": "OneMinusDstColor",
  SrcAlpha: 6,
  "6": "SrcAlpha",
  OneMinusSrcAlpha: 7,
  "7": "OneMinusSrcAlpha",
  DstAlpha: 8,
  "8": "DstAlpha",
  OneMinusDstAlpha: 9,
  "9": "OneMinusDstAlpha",
  ConstantColor: 10,
  "10": "ConstantColor",
  OneMinusConstantColor: 11,
  "11": "OneMinusConstantColor",
  ConstantAlpha: 12,
  "12": "ConstantAlpha",
  OneMinusConstantAlpha: 13,
  "13": "OneMinusConstantAlpha"
});
/**
*/

var BlendFunc = Object.freeze({
  FuncAdd: 0,
  "0": "FuncAdd",
  FuncSubstract: 1,
  "1": "FuncSubstract",
  FuncReverseSubstract: 2,
  "2": "FuncReverseSubstract"
});
/**
*/

var CooSystem = Object.freeze({
  ICRSJ2000: 0,
  "0": "ICRSJ2000",
  GAL: 1,
  "1": "GAL"
});
/**
*/

var BlendCfg = /*#__PURE__*/function () {
  function BlendCfg() {
    _classCallCheck(this, BlendCfg);
  }

  _createClass(BlendCfg, [{
    key: "__destroy_into_raw",
    value: function __destroy_into_raw() {
      var ptr = this.ptr;
      this.ptr = 0;
      return ptr;
    }
  }, {
    key: "free",
    value: function free() {
      var ptr = this.__destroy_into_raw();

      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_blendcfg_free(ptr);
    }
    /**
    */

  }, {
    key: "src_color_factor",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_blendcfg_src_color_factor(this.ptr);

      return ret >>> 0;
    }
    /**
    */
    ,
    set: function set(arg0) {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_blendcfg_src_color_factor(this.ptr, arg0);
    }
    /**
    */

  }, {
    key: "dst_color_factor",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_blendcfg_dst_color_factor(this.ptr);

      return ret >>> 0;
    }
    /**
    */
    ,
    set: function set(arg0) {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_blendcfg_dst_color_factor(this.ptr, arg0);
    }
    /**
    */

  }, {
    key: "func",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_blendcfg_func(this.ptr);

      return ret >>> 0;
    }
    /**
    */
    ,
    set: function set(arg0) {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_blendcfg_func(this.ptr, arg0);
    }
  }], [{
    key: "__wrap",
    value: function __wrap(ptr) {
      var obj = Object.create(BlendCfg.prototype);
      obj.ptr = ptr;
      return obj;
    }
  }]);

  return BlendCfg;
}();
/**
*/

var Color = /*#__PURE__*/function () {
  /**
  * @param {number} red
  * @param {number} green
  * @param {number} blue
  * @param {number} alpha
  */
  function Color(red, green, blue, alpha) {
    _classCallCheck(this, Color);

    var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.color_new(red, green, blue, alpha);
    return Color.__wrap(ret);
  }

  _createClass(Color, [{
    key: "__destroy_into_raw",
    value: function __destroy_into_raw() {
      var ptr = this.ptr;
      this.ptr = 0;
      return ptr;
    }
  }, {
    key: "free",
    value: function free() {
      var ptr = this.__destroy_into_raw();

      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_color_free(ptr);
    }
    /**
    */

  }, {
    key: "red",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_color_red(this.ptr);

      return ret;
    }
    /**
    */
    ,
    set: function set(arg0) {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_color_red(this.ptr, arg0);
    }
    /**
    */

  }, {
    key: "green",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_color_green(this.ptr);

      return ret;
    }
    /**
    */
    ,
    set: function set(arg0) {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_color_green(this.ptr, arg0);
    }
    /**
    */

  }, {
    key: "blue",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_color_blue(this.ptr);

      return ret;
    }
    /**
    */
    ,
    set: function set(arg0) {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_color_blue(this.ptr, arg0);
    }
    /**
    */

  }, {
    key: "alpha",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_color_alpha(this.ptr);

      return ret;
    }
    /**
    */
    ,
    set: function set(arg0) {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_color_alpha(this.ptr, arg0);
    }
  }], [{
    key: "__wrap",
    value: function __wrap(ptr) {
      var obj = Object.create(Color.prototype);
      obj.ptr = ptr;
      return obj;
    }
  }]);

  return Color;
}();
/**
*/

var GridCfg = /*#__PURE__*/function () {
  function GridCfg() {
    _classCallCheck(this, GridCfg);
  }

  _createClass(GridCfg, [{
    key: "__destroy_into_raw",
    value: function __destroy_into_raw() {
      var ptr = this.ptr;
      this.ptr = 0;
      return ptr;
    }
  }, {
    key: "free",
    value: function free() {
      var ptr = this.__destroy_into_raw();

      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_gridcfg_free(ptr);
    }
    /**
    */

  }, {
    key: "color",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_gridcfg_color(this.ptr);

      return ret === 0 ? undefined : Color.__wrap(ret);
    }
    /**
    */
    ,
    set: function set(arg0) {
      var ptr0 = 0;

      if (!isLikeNone(arg0)) {
        _assertClass(arg0, Color);

        ptr0 = arg0.ptr;
        arg0.ptr = 0;
      }

      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_gridcfg_color(this.ptr, ptr0);
    }
    /**
    */

  }, {
    key: "show_labels",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_gridcfg_show_labels(this.ptr);

      return ret === 0xFFFFFF ? undefined : ret !== 0;
    }
    /**
    */
    ,
    set: function set(arg0) {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_gridcfg_show_labels(this.ptr, isLikeNone(arg0) ? 0xFFFFFF : arg0 ? 1 : 0);
    }
    /**
    */

  }, {
    key: "label_size",
    get: function get() {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_gridcfg_label_size(retptr, this.ptr);

        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getFloat32Memory0()[retptr / 4 + 1];
        return r0 === 0 ? undefined : r1;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    */
    ,
    set: function set(arg0) {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_gridcfg_label_size(this.ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
    /**
    */

  }, {
    key: "enabled",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_gridcfg_enabled(this.ptr);

      return ret === 0xFFFFFF ? undefined : ret !== 0;
    }
    /**
    */
    ,
    set: function set(arg0) {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_gridcfg_enabled(this.ptr, isLikeNone(arg0) ? 0xFFFFFF : arg0 ? 1 : 0);
    }
  }]);

  return GridCfg;
}();
/**
*/

var ImageSurveyMeta = /*#__PURE__*/function () {
  function ImageSurveyMeta() {
    _classCallCheck(this, ImageSurveyMeta);
  }

  _createClass(ImageSurveyMeta, [{
    key: "__destroy_into_raw",
    value: function __destroy_into_raw() {
      var ptr = this.ptr;
      this.ptr = 0;
      return ptr;
    }
  }, {
    key: "free",
    value: function free() {
      var ptr = this.__destroy_into_raw();

      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_imagesurveymeta_free(ptr);
    }
    /**
    */

  }, {
    key: "blend_cfg",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_imagesurveymeta_blend_cfg(this.ptr);

      return BlendCfg.__wrap(ret);
    }
    /**
    */
    ,
    set: function set(arg0) {
      _assertClass(arg0, BlendCfg);

      var ptr0 = arg0.ptr;
      arg0.ptr = 0;

      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_imagesurveymeta_blend_cfg(this.ptr, ptr0);
    }
    /**
    */

  }, {
    key: "opacity",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_imagesurveymeta_opacity(this.ptr);

      return ret;
    }
    /**
    */
    ,
    set: function set(arg0) {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_imagesurveymeta_opacity(this.ptr, arg0);
    }
    /**
    */

  }, {
    key: "longitude_reversed",
    get: function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_get_imagesurveymeta_longitude_reversed(this.ptr);

      return ret !== 0;
    }
    /**
    */
    ,
    set: function set(arg0) {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_imagesurveymeta_longitude_reversed(this.ptr, arg0);
    }
    /**
    */

  }, {
    key: "color",
    get:
    /**
    */
    function get() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.imagesurveymeta_color(this.ptr);
      return takeObject(ret);
    },
    set: function set(color) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.imagesurveymeta_set_color(retptr, this.ptr, addHeapObject(color));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
  }], [{
    key: "__wrap",
    value: function __wrap(ptr) {
      var obj = Object.create(ImageSurveyMeta.prototype);
      obj.ptr = ptr;
      return obj;
    }
  }]);

  return ImageSurveyMeta;
}();
/**
*/

var WebClient = /*#__PURE__*/function () {
  /**
  * Create the Aladin Lite webgl backend
  *
  * # Arguments
  *
  * * `aladin_div_name` - The name of the div where aladin is created
  * * `shaders` - The list of shader objects containing the GLSL code source
  * * `resources` - Image resource files
  * @param {string} aladin_div_name
  * @param {any} shaders
  * @param {any} resources
  */
  function WebClient(aladin_div_name, shaders, resources) {
    _classCallCheck(this, WebClient);

    try {
      var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

      var ptr0 = passStringToWasm0(aladin_div_name, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_new(retptr, ptr0, len0, addBorrowedObject(shaders), addBorrowedObject(resources));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];

      if (r2) {
        throw takeObject(r1);
      }

      return WebClient.__wrap(r0);
    } finally {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);

      heap[stack_pointer++] = undefined;
      heap[stack_pointer++] = undefined;
    }
  }
  /**
  * Update the view
  *
  * # Arguments
  *
  * * `dt` - The time elapsed from the last frame update
  * * `force` - This parameter ensures to force the update of some elements
  *   even if the camera has not moved
  * @param {number} dt
  */


  _createClass(WebClient, [{
    key: "__destroy_into_raw",
    value: function __destroy_into_raw() {
      var ptr = this.ptr;
      this.ptr = 0;
      return ptr;
    }
  }, {
    key: "free",
    value: function free() {
      var ptr = this.__destroy_into_raw();

      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_webclient_free(ptr);
    }
  }, {
    key: "update",
    value: function update(dt) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_update(retptr, this.ptr, dt);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Resize the window
    *
    * # Arguments
    *
    * * `width` - The width in pixels of the view
    * * `height` - The height in pixels of the view
    * @param {number} width
    * @param {number} height
    */

  }, {
    key: "resize",
    value: function resize(width, height) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_resize(retptr, this.ptr, width, height);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Render the frame to the canvas
    *
    * The rendering does not redraw the scene if nothing has changed
    *
    * # Arguments
    *
    * * `force` - Force the rendering of the frame
    * @param {boolean} force
    */

  }, {
    key: "render",
    value: function render(force) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_render(retptr, this.ptr, force);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Set the type of projections
    *
    * # Arguments
    *
    * * `name` - Can be aitoff, mollweide, arc, sinus, tan or mercator
    * @param {string} projection
    * @param {number} width
    * @param {number} height
    * @returns {WebClient}
    */

  }, {
    key: "setProjection",
    value: function setProjection(projection, width, height) {
      try {
        var ptr = this.__destroy_into_raw();

        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        var ptr0 = passStringToWasm0(projection, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_setProjection(retptr, ptr, ptr0, len0, width, height);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];

        if (r2) {
          throw takeObject(r1);
        }

        return WebClient.__wrap(r0);
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_tu_stack_pointer(16);
      }
    }
    /**
    * Check whether the app is ready
    *
    * Aladin Lite is in a good state when the root tiles of the
    * HiPS chosen have all been retrieved and accessible for the GPU
    *
    * Surveys can be changed only if Aladin Lite is ready
    * @returns {boolean}
    */

  }, {
    key: "isReady",
    value: function isReady() {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_isReady(retptr, this.ptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];

        if (r2) {
          throw takeObject(r1);
        }

        return r0 !== 0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * @returns {number}
    */

  }, {
    key: "getNOrder",
    value: function getNOrder() {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_getNOrder(retptr, this.ptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];

        if (r2) {
          throw takeObject(r1);
        }

        return r0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Set new image surveys
    *
    * Send the image surveys to render inside the Aladin Lite view
    *
    * # Arguments
    *
    * * `surveys` - A list/array of survey. A survey is a javascript object
    * having the specific form. Please check the file in core/src/hips.rs to see
    * the different semantics accepted.
    *
    * # Examples
    *
    * ```javascript
    * let al = new Aladin.wasmLibs.webgl.WebClient(...);
    * const panstarrs = {
    *     properties: {
    *         url: "http://alasky.u-strasbg.fr/Pan-STARRS/DR1/r",
    *
    *         maxOrder: 11,
    *         frame: { label: "J2000", system: "J2000" },
    *         tileSize: 512,
    *         format: {
    *             FITSImage: {
    *                 bitpix: 16,
    *             }
    *         },
    *         minCutout: -0.15,
    *         maxCutout: 5,
    *     },
    *     color: {
    *         Grayscale2Colormap: {
    *             colormap: "RedTemperature",
    *             transfer: "asinh",
    *             reversed: false,
    *         }
    *     },
    * };
    * al.setImageSurveys([panstarrs]);
    * ```
    *
    * # Panics
    *
    * * If the surveys do not match SimpleHiPS type
    * * If the number of surveys is greater than 4. For the moment, due to the limitations
    *   of WebGL2 texture units on some architectures, the total number of surveys rendered is
    *   limited to 4.
    * @param {any[]} surveys
    */

  }, {
    key: "setImageSurveys",
    value: function setImageSurveys(surveys) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        var ptr0 = passArrayJsValueToWasm0(surveys, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_setImageSurveys(retptr, this.ptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * @param {string} layer
    * @returns {ImageSurveyMeta}
    */

  }, {
    key: "getImageSurveyMeta",
    value: function getImageSurveyMeta(layer) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        var ptr0 = passStringToWasm0(layer, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_getImageSurveyMeta(retptr, this.ptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];

        if (r2) {
          throw takeObject(r1);
        }

        return ImageSurveyMeta.__wrap(r0);
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * @param {string} layer
    * @param {any} meta
    */

  }, {
    key: "setImageSurveyMeta",
    value: function setImageSurveyMeta(layer, meta) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        var ptr0 = passStringToWasm0(layer, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_setImageSurveyMeta(retptr, this.ptr, ptr0, len0, addHeapObject(meta));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * @param {string} layer
    * @param {any} format
    */

  }, {
    key: "setImageSurveyImageFormat",
    value: function setImageSurveyImageFormat(layer, format) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        var ptr0 = passStringToWasm0(layer, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_setImageSurveyImageFormat(retptr, this.ptr, ptr0, len0, addHeapObject(format));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Set the equatorial grid color
    *
    * # Arguments
    *
    * * `red` - Red amount (between 0.0 and 1.0)
    * * `green` - Green amount (between 0.0 and 1.0)
    * * `blue` - Blue amount (between 0.0 and 1.0)
    * * `alpha` - Alpha amount (between 0.0 and 1.0)
    * @param {any} cfg
    */

  }, {
    key: "setGridConfig",
    value: function setGridConfig(cfg) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_setGridConfig(retptr, this.ptr, addBorrowedObject(cfg));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);

        heap[stack_pointer++] = undefined;
      }
    }
    /**
    * Set the coordinate system for the view
    *
    * # Arguments
    *
    * * `coo_system` - The coordinate system
    * @param {number} coo_system
    */

  }, {
    key: "setCooSystem",
    value: function setCooSystem(coo_system) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_setCooSystem(retptr, this.ptr, coo_system);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Get the field of the view in degrees
    * @returns {number}
    */

  }, {
    key: "getFieldOfView",
    value: function getFieldOfView() {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_getFieldOfView(retptr, this.ptr);
        var r0 = getFloat64Memory0()[retptr / 8 + 0];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];

        if (r3) {
          throw takeObject(r2);
        }

        return r0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Set the field of view
    *
    * # Arguments
    *
    * * `fov` - The field of view in degrees
    * @param {number} fov
    */

  }, {
    key: "setFieldOfView",
    value: function setFieldOfView(fov) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_setFieldOfView(retptr, this.ptr, fov);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Set the absolute orientation of the view
    *
    * # Arguments
    *
    * * `theta` - The rotation angle in degrees
    * @param {number} theta
    */

  }, {
    key: "setRotationAroundCenter",
    value: function setRotationAroundCenter(theta) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_setRotationAroundCenter(retptr, this.ptr, theta);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Get the absolute orientation angle of the view
    * @returns {number}
    */

  }, {
    key: "getRotationAroundCenter",
    value: function getRotationAroundCenter() {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_getRotationAroundCenter(retptr, this.ptr);
        var r0 = getFloat64Memory0()[retptr / 8 + 0];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];

        if (r3) {
          throw takeObject(r2);
        }

        return r0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Get the field of view angle value when the view is zoomed out to its maximum
    *
    * This method is dependent of the projection currently set.
    * All sky projections should return 360 degrees whereas
    * the sinus would be 180 degrees.
    * @returns {number}
    */

  }, {
    key: "getMaxFieldOfView",
    value: function getMaxFieldOfView() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_getMaxFieldOfView(this.ptr);
      return ret;
    }
    /**
    * Get the clip zoom factor of the view
    *
    * This factor is deduced from the field of view angle.
    * It is a constant which when multiplied to the screen coordinates
    * gives the coordinates in clipping space.
    * @returns {number}
    */

  }, {
    key: "getClipZoomFactor",
    value: function getClipZoomFactor() {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_getClipZoomFactor(retptr, this.ptr);
        var r0 = getFloat64Memory0()[retptr / 8 + 0];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];

        if (r3) {
          throw takeObject(r2);
        }

        return r0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Set the center of the view in ICRSJ2000 coosys
    *
    * The core works in ICRS system so
    * the location must be given in this system
    *
    * # Arguments
    *
    * * `lon` - A longitude in degrees
    * * `lat` - A latitude in degrees
    * @param {number} lon
    * @param {number} lat
    */

  }, {
    key: "setCenter",
    value: function setCenter(lon, lat) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_setCenter(retptr, this.ptr, lon, lat);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Get the center of the view
    *
    * This returns a javascript array of size 2.
    * The first component is the longitude, the second one is the latitude.
    * The angles are given in degrees.
    * @returns {Float64Array}
    */

  }, {
    key: "getCenter",
    value: function getCenter() {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_getCenter(retptr, this.ptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];

        if (r3) {
          throw takeObject(r2);
        }

        var v0 = getArrayF64FromWasm0(r0, r1).slice();

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 8);

        return v0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Rest the north pole orientation to the top of the screen
    */

  }, {
    key: "resetNorthOrientation",
    value: function resetNorthOrientation() {
      _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_resetNorthOrientation(this.ptr);
    }
    /**
    * Go from a location to another one
    *
    * # Arguments
    *
    * * `s1x` - The x screen coordinate in pixels of the starting point
    * * `s1y` - The y screen coordinate in pixels of the starting point
    * * `s2x` - The x screen coordinate in pixels of the goal point
    * * `s2y` - The y screen coordinate in pixels of the goal point
    * @param {number} s1x
    * @param {number} s1y
    * @param {number} s2x
    * @param {number} s2y
    */

  }, {
    key: "goFromTo",
    value: function goFromTo(s1x, s1y, s2x, s2y) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_goFromTo(retptr, this.ptr, s1x, s1y, s2x, s2y);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * View frame to ICRS/J2000 coosys conversion
    *
    * Coordinates must be given in the ICRS coo system
    *
    * # Arguments
    *
    * * `lon` - A longitude in degrees
    * * `lat` - A latitude in degrees
    * @param {number} lon
    * @param {number} lat
    * @returns {Float64Array}
    */

  }, {
    key: "viewToICRSJ2000CooSys",
    value: function viewToICRSJ2000CooSys(lon, lat) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_viewToICRSJ2000CooSys(retptr, this.ptr, lon, lat);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0 = getArrayF64FromWasm0(r0, r1).slice();

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 8);

        return v0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * ICRS/J2000 to view frame coosys conversion
    *
    * Coordinates must be given in the ICRS coo system
    *
    * # Arguments
    *
    * * `lon` - A longitude in degrees
    * * `lat` - A latitude in degrees
    * @param {number} lon
    * @param {number} lat
    * @returns {Float64Array}
    */

  }, {
    key: "ICRSJ2000ToViewCooSys",
    value: function ICRSJ2000ToViewCooSys(lon, lat) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_ICRSJ2000ToViewCooSys(retptr, this.ptr, lon, lat);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0 = getArrayF64FromWasm0(r0, r1).slice();

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 8);

        return v0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * World to screen projection
    *
    * Coordinates must be given in the ICRS coo system
    *
    * # Arguments
    *
    * * `lon` - A longitude in degrees
    * * `lat` - A latitude in degrees
    * @param {number} lon
    * @param {number} lat
    * @returns {Float64Array | undefined}
    */

  }, {
    key: "worldToScreen",
    value: function worldToScreen(lon, lat) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_worldToScreen(retptr, this.ptr, lon, lat);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];

        if (r3) {
          throw takeObject(r2);
        }

        var v0;

        if (r0 !== 0) {
          v0 = getArrayF64FromWasm0(r0, r1).slice();

          _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 8);
        }

        return v0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * World to screen projection of a list of sources
    *
    * Coordinates must be given in the ICRS coo system
    *
    * # Arguments
    *
    * * `sources` - An array of sources
    * @param {any[]} sources
    * @returns {Float64Array}
    */

  }, {
    key: "worldToScreenVec",
    value: function worldToScreenVec(sources) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        var ptr0 = passArrayJsValueToWasm0(sources, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_worldToScreenVec(retptr, this.ptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];

        if (r3) {
          throw takeObject(r2);
        }

        var v1 = getArrayF64FromWasm0(r0, r1).slice();

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 8);

        return v1;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Screen to world unprojection
    *
    * # Arguments
    *
    * * `pos_x` - The x screen coordinate in pixels
    * * `pos_y` - The y screen coordinate in pixels
    * @param {number} pos_x
    * @param {number} pos_y
    * @returns {Float64Array | undefined}
    */

  }, {
    key: "screenToWorld",
    value: function screenToWorld(pos_x, pos_y) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_screenToWorld(retptr, this.ptr, pos_x, pos_y);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0;

        if (r0 !== 0) {
          v0 = getArrayF64FromWasm0(r0, r1).slice();

          _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 8);
        }

        return v0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Signal the backend when the left mouse button has been released.
    *
    * This is useful for beginning inerting.
    * @param {number} sx
    * @param {number} sy
    */

  }, {
    key: "releaseLeftButtonMouse",
    value: function releaseLeftButtonMouse(sx, sy) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_releaseLeftButtonMouse(retptr, this.ptr, sx, sy);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Signal the backend when the left mouse button has been pressed.
    * @param {number} sx
    * @param {number} sy
    */

  }, {
    key: "pressLeftMouseButton",
    value: function pressLeftMouseButton(sx, sy) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_pressLeftMouseButton(retptr, this.ptr, sx, sy);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Signal the backend when a wheel event has been registered
    *
    * The field of view is changed accordingly
    *
    * # Arguments
    *
    * * `delta` - The delta coming from the wheel event. This is
    *   used to know if we are zooming or not.
    * @returns {boolean}
    */

  }, {
    key: "posOnUi",
    value: function posOnUi() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_posOnUi(this.ptr);
      return ret !== 0;
    }
    /**
    * Add a catalog rendered as a heatmap.
    *
    * # Arguments
    *
    * * `name_catalog` - The name of the catalog
    * * `data` - The list of the catalog sources.
    * * `colormap` - The name of the colormap. Check out the list of possible colormaps names `getAvailableColormapList`.
    * @param {string} name_catalog
    * @param {any} data
    * @param {string} colormap
    */

  }, {
    key: "addCatalog",
    value: function addCatalog(name_catalog, data, colormap) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        var ptr0 = passStringToWasm0(name_catalog, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(colormap, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_addCatalog(retptr, this.ptr, ptr0, len0, addHeapObject(data), ptr1, len1);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Set the catalog heatmap colormap
    *
    * # Arguments
    *
    * * `name_catalog` - The name of the catalog to apply this change to
    * * `colormap` - The name of the colormap. Check out the list of possible colormaps names `getAvailableColormapList`.
    *
    * # Panics
    *
    * If the catalog has not been found
    * @returns {boolean}
    */

  }, {
    key: "isCatalogLoaded",
    value: function isCatalogLoaded() {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_isCatalogLoaded(retptr, this.ptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];

        if (r2) {
          throw takeObject(r1);
        }

        return r0 !== 0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Set the catalog heatmap opacity
    *
    * # Arguments
    *
    * * `name_catalog` - The name of the catalog to apply this change to
    * * `opacity` - The opacity factor (between 0.0 and 1.0)
    *
    * # Panics
    *
    * If the catalog has not been found
    * @param {string} name_catalog
    * @param {number} opacity
    */

  }, {
    key: "setCatalogOpacity",
    value: function setCatalogOpacity(name_catalog, opacity) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        var ptr0 = passStringToWasm0(name_catalog, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_lg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_setCatalogOpacity(retptr, this.ptr, ptr0, len0, opacity);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Set the kernel strength for the catalog heatmap rendering
    *
    * # Arguments
    *
    * * `name_catalog` - The name of the catalog to apply this change to
    * * `strength` - The strength of the kernel
    *
    * # Panics
    *
    * If the catalog has not been found
    * @param {string} name_catalog
    * @param {number} strength
    */

  }, {
    key: "setCatalogKernelStrength",
    value: function setCatalogKernelStrength(name_catalog, strength) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        var ptr0 = passStringToWasm0(name_catalog, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_setCatalogKernelStrength(retptr, this.ptr, ptr0, len0, strength);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];

        if (r1) {
          throw takeObject(r0);
        }
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Project a line to the screen
    *
    * # Returns
    *
    * A list of xy screen coordinates defining the projected line.
    * The algorithm involved is recursive and can return different number of
    * control points depending on the projection used and therefore
    * the deformation of the line.
    *
    * # Arguments
    *
    * * `lon1` - The longitude in degrees of the starting line point
    * * `lat1` - The latitude in degrees of the starting line point
    * * `lon2` - The longitude in degrees of the ending line point
    * * `lat2` - The latitude in degrees of the ending line point
    * @param {number} lon1
    * @param {number} lat1
    * @param {number} lon2
    * @param {number} lat2
    * @returns {Float64Array}
    */

  }, {
    key: "projectLine",
    value: function projectLine(lon1, lat1, lon2, lat2) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_projectLine(retptr, this.ptr, lon1, lat1, lon2, lat2);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];

        if (r3) {
          throw takeObject(r2);
        }

        var v0 = getArrayF64FromWasm0(r0, r1).slice();

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 8);

        return v0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Get the list of colormap supported
    *
    * This list must be updated whenever a new colormap is added
    * in core/img/colormaps/colormaps.png
    * @returns {any}
    */

  }, {
    key: "getAvailableColormapList",
    value: function getAvailableColormapList() {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_getAvailableColormapList(retptr, this.ptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];

        if (r2) {
          throw takeObject(r1);
        }

        return takeObject(r0);
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Get the image canvas where the webgl rendering is done
    * @returns {object | undefined}
    */

  }, {
    key: "canvas",
    value: function canvas() {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_canvas(retptr, this.ptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];

        if (r2) {
          throw takeObject(r1);
        }

        return takeObject(r0);
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Read the pixel value
    *
    * The current implementation only returns the pixel value
    * of the first survey of the `layer` specified.
    *
    * # Returns
    *
    * - An array of 3 items (rgb) for JPG tiles
    * - An array of 4 items (rgba) for PNG tiles
    * - A single value for FITS tiles
    *
    * # Arguments
    *
    * * `x` - The x screen coordinate in pixels
    * * `y` - The y screen coordinate in pixels
    * * `base_url` - The base url of the survey identifying it
    * @param {number} x
    * @param {number} y
    * @param {string} layer
    * @returns {any}
    */

  }, {
    key: "readPixel",
    value: function readPixel(x, y, layer) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        var ptr0 = passStringToWasm0(layer, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_readPixel(retptr, this.ptr, x, y, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];

        if (r2) {
          throw takeObject(r1);
        }

        return takeObject(r0);
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * TODO! This will be removed when integrating the MOC code in wasm because
    * this method is only called in MOC.js
    * Computes the location on the unit sphere of the 4 vertices of the given HEALPix cell
    * (define by its depth and number).
    * # Inputs
    * - `order` the order of the cell we look for the vertices
    * - `icell`: the cell number value of the cell we look for the unprojected center, in the NESTED scheme
    * # Output
    * - array containing the longitudes and latitudes (in degrees) of the vertices in the following order:
    *   `[SouthLon, SouthLat, EastLon, EastLat, NoethLon, NorthLat, WestLon, WestLat]`
    * @param {number} depth
    * @param {number} hash
    * @returns {Float64Array}
    */

  }, {
    key: "hpxNestedVertices",
    value: function hpxNestedVertices(depth, hash) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_hpxNestedVertices(retptr, this.ptr, depth, hash);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0 = getArrayF64FromWasm0(r0, r1).slice();

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 8);

        return v0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * @param {number} depth
    * @param {number} lon_degrees
    * @param {number} lat_degrees
    * @param {number} radius_degress
    * @returns {Float64Array}
    */

  }, {
    key: "queryDisc",
    value: function queryDisc(depth, lon_degrees, lat_degrees, radius_degress) {
      try {
        var retptr = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(-16);

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_queryDisc(retptr, this.ptr, depth, lon_degrees, lat_degrees, radius_degress);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0 = getArrayF64FromWasm0(r0, r1).slice();

        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(r0, r1 * 8);

        return v0;
      } finally {
        _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * @returns {boolean}
    */

  }, {
    key: "isRendering",
    value: function isRendering() {
      var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.webclient_isRendering(this.ptr);
      return ret !== 0;
    }
  }], [{
    key: "__wrap",
    value: function __wrap(ptr) {
      var obj = Object.create(WebClient.prototype);
      obj.ptr = ptr;
      return obj;
    }
  }]);

  return WebClient;
}();
function __wbindgen_object_drop_ref(arg0) {
  takeObject(arg0);
}
;
function __wbindgen_string_new(arg0, arg1) {
  var ret = getStringFromWasm0(arg0, arg1);
  return addHeapObject(ret);
}
;
function __wbindgen_json_serialize(arg0, arg1) {
  var obj = getObject(arg1);
  var ret = JSON.stringify(obj === undefined ? null : obj);
  var ptr0 = passStringToWasm0(ret, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
  var len0 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len0;
  getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}
;
function __wbindgen_cb_drop(arg0) {
  var obj = takeObject(arg0).original;

  if (obj.cnt-- == 1) {
    obj.a = 0;
    return true;
  }

  var ret = false;
  return ret;
}
;
function __wbindgen_object_clone_ref(arg0) {
  var ret = getObject(arg0);
  return addHeapObject(ret);
}
;
function __wbindgen_json_parse(arg0, arg1) {
  var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}
;
function __wbindgen_number_get(arg0, arg1) {
  var obj = getObject(arg1);
  var ret = typeof obj === 'number' ? obj : undefined;
  getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
  getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
}
;
function __wbindgen_number_new(arg0) {
  var ret = arg0;
  return addHeapObject(ret);
}
;
function __wbindgen_boolean_get(arg0) {
  var v = getObject(arg0);
  var ret = typeof v === 'boolean' ? v ? 1 : 0 : 2;
  return ret;
}
;
function __wbg_instanceof_WebGl2RenderingContext_f43c52e5e19f2606(arg0) {
  var ret = getObject(arg0) instanceof WebGL2RenderingContext;
  return ret;
}
;
function __wbg_canvas_a003ee5e37cfa733(arg0) {
  var ret = getObject(arg0).canvas;
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_bindVertexArray_93c9ea4c521c6150(arg0, arg1) {
  getObject(arg0).bindVertexArray(getObject(arg1));
}
;
function __wbg_bufferData_545d1a030b870c9d(arg0, arg1, arg2, arg3) {
  getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
}
;
function __wbg_bufferSubData_7839a61c9890a1d7(arg0, arg1, arg2, arg3) {
  getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
}
;
function __wbg_createVertexArray_f8aff8c98a8e7ce7(arg0) {
  var ret = getObject(arg0).createVertexArray();
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_deleteVertexArray_1fba1928028fe94b(arg0, arg1) {
  getObject(arg0).deleteVertexArray(getObject(arg1));
}
;
function __wbg_drawElementsInstanced_48d20814ac5eabb6(arg0, arg1, arg2, arg3, arg4, arg5) {
  getObject(arg0).drawElementsInstanced(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
}
;
function __wbg_readPixels_6a67efb5ea393d07() {
  return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
  }, arguments);
}
;
function __wbg_texImage2D_e7d46024e2946907() {
  return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
    getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9 === 0 ? undefined : getArrayU8FromWasm0(arg9, arg10));
  }, arguments);
}
;
function __wbg_texImage2D_35b3a700583d83de() {
  return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4 >>> 0, arg5 >>> 0, getObject(arg6));
  }, arguments);
}
;
function __wbg_texSubImage2D_69c2f1177c03208f() {
  return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
  }, arguments);
}
;
function __wbg_texSubImage2D_a8b8580bc708325c() {
  return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
  }, arguments);
}
;
function __wbg_texSubImage2D_461390afad09b504() {
  return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
  }, arguments);
}
;
function __wbg_uniformMatrix2fv_ba6cfedfe399c2e0(arg0, arg1, arg2, arg3, arg4) {
  getObject(arg0).uniformMatrix2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
}
;
function __wbg_uniformMatrix4fv_db1ebb506a01540e(arg0, arg1, arg2, arg3, arg4) {
  getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
}
;
function __wbg_activeTexture_7d94e69e06167cc5(arg0, arg1) {
  getObject(arg0).activeTexture(arg1 >>> 0);
}
;
function __wbg_attachShader_b842215a5c35bf7e(arg0, arg1, arg2) {
  getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
}
;
function __wbg_bindBuffer_8b6444fda5ed59dc(arg0, arg1, arg2) {
  getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
}
;
function __wbg_bindFramebuffer_8fa07aa65dcbd3aa(arg0, arg1, arg2) {
  getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
}
;
function __wbg_bindTexture_83f436ae22ba78b4(arg0, arg1, arg2) {
  getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
}
;
function __wbg_blendEquation_02b70f124d235aa1(arg0, arg1) {
  getObject(arg0).blendEquation(arg1 >>> 0);
}
;
function __wbg_blendFuncSeparate_882bf8e6e46c91cb(arg0, arg1, arg2, arg3, arg4) {
  getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
}
;
function __wbg_checkFramebufferStatus_1936a2d9b346db63(arg0, arg1) {
  var ret = getObject(arg0).checkFramebufferStatus(arg1 >>> 0);
  return ret;
}
;
function __wbg_clear_4b8a9923ec5dd06b(arg0, arg1) {
  getObject(arg0).clear(arg1 >>> 0);
}
;
function __wbg_clearColor_326a40b8458fd4cf(arg0, arg1, arg2, arg3, arg4) {
  getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
}
;
function __wbg_compileShader_1121e87470b77009(arg0, arg1) {
  getObject(arg0).compileShader(getObject(arg1));
}
;
function __wbg_createBuffer_6684eee636476ea7(arg0) {
  var ret = getObject(arg0).createBuffer();
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_createFramebuffer_1316a4c02803bcf8(arg0) {
  var ret = getObject(arg0).createFramebuffer();
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_createProgram_f363532a39adc49f(arg0) {
  var ret = getObject(arg0).createProgram();
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_createShader_86b8ecf79286f304(arg0, arg1) {
  var ret = getObject(arg0).createShader(arg1 >>> 0);
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_createTexture_1b5ac8ef80f089c8(arg0) {
  var ret = getObject(arg0).createTexture();
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_cullFace_1dcd1a4340d221a5(arg0, arg1) {
  getObject(arg0).cullFace(arg1 >>> 0);
}
;
function __wbg_deleteBuffer_9db81b161e83656e(arg0, arg1) {
  getObject(arg0).deleteBuffer(getObject(arg1));
}
;
function __wbg_deleteFramebuffer_48183bac844e2cbe(arg0, arg1) {
  getObject(arg0).deleteFramebuffer(getObject(arg1));
}
;
function __wbg_deleteTexture_8cb16fb3b8ab69cd(arg0, arg1) {
  getObject(arg0).deleteTexture(getObject(arg1));
}
;
function __wbg_disable_11c4bc9e544fcdc9(arg0, arg1) {
  getObject(arg0).disable(arg1 >>> 0);
}
;
function __wbg_disableVertexAttribArray_47abfb2c13a9280a(arg0, arg1) {
  getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
}
;
function __wbg_drawArrays_0d143172881346cc(arg0, arg1, arg2, arg3) {
  getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
}
;
function __wbg_drawElements_dedd50a05ab4ee82(arg0, arg1, arg2, arg3, arg4) {
  getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
}
;
function __wbg_enable_c580eeb2d730d8c7(arg0, arg1) {
  getObject(arg0).enable(arg1 >>> 0);
}
;
function __wbg_enableVertexAttribArray_71492f736c35c5e7(arg0, arg1) {
  getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
}
;
function __wbg_framebufferTexture2D_fd6329e64dacca57(arg0, arg1, arg2, arg3, arg4, arg5) {
  getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
}
;
function __wbg_getActiveUniform_1b4c0c429ccbabf5(arg0, arg1, arg2) {
  var ret = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_getExtension_36db9b1cf2f433d1() {
  return handleError(function (arg0, arg1, arg2) {
    var ret = getObject(arg0).getExtension(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  }, arguments);
}
;
function __wbg_getProgramInfoLog_51bb974e21b4a168(arg0, arg1, arg2) {
  var ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
  var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
  var len0 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len0;
  getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}
;
function __wbg_getProgramParameter_7200faf718e95d48(arg0, arg1, arg2) {
  var ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
  return addHeapObject(ret);
}
;
function __wbg_getShaderInfoLog_9172aba54d0c5ed9(arg0, arg1, arg2) {
  var ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
  var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
  var len0 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len0;
  getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}
;
function __wbg_getShaderParameter_51a3da58beb29be0(arg0, arg1, arg2) {
  var ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
  return addHeapObject(ret);
}
;
function __wbg_getUniformLocation_1bcc319cd4fd2089(arg0, arg1, arg2, arg3) {
  var ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_ginkProgram_f2864269853d4862(arg0, arg1) {
  getObject(arg0).linkProgram(getObject(arg1));
}
;
function __wbg_scissor_832734c09e917691(arg0, arg1, arg2, arg3, arg4) {
  getObject(arg0).scissor(arg1, arg2, arg3, arg4);
}
;
function __wbg_shaderSource_4bee6327e417287e(arg0, arg1, arg2, arg3) {
  getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
}
;
function __wbg_texParameteri_d3d72cea09b18227(arg0, arg1, arg2, arg3) {
  getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
}
;
function __wbg_uniform1f_5bd060ff5e33f7c5(arg0, arg1, arg2) {
  getObject(arg0).uniform1f(getObject(arg1), arg2);
}
;
function __wbg_uniform1i_07a12b8c5847ce00(arg0, arg1, arg2) {
  getObject(arg0).uniform1i(getObject(arg1), arg2);
}
;
function __wbg_uniform2f_d9f8bdd81dd5476b(arg0, arg1, arg2, arg3) {
  getObject(arg0).uniform2f(getObject(arg1), arg2, arg3);
}
;
function __wbg_uniform4f_ca56f4282cb164f4(arg0, arg1, arg2, arg3, arg4, arg5) {
  getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
}
;
function __wbg_useProgram_8c98a70c0b9bbc8c(arg0, arg1) {
  getObject(arg0).useProgram(getObject(arg1));
}
;
function __wbg_vertexAttribPointer_5f0380b7ecfacd1f(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
  getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
}
;
function __wbg_viewport_8868e512a14d3c60(arg0, arg1, arg2, arg3, arg4) {
  getObject(arg0).viewport(arg1, arg2, arg3, arg4);
}
;
function __wbg_instanceof_Window_a2a08d3918d7d4d0(arg0) {
  var ret = getObject(arg0) instanceof Window;
  return ret;
}
;
function __wbg_document_14a383364c173445(arg0) {
  var ret = getObject(arg0).document;
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_innerWidth_18ba6b052df9be3c() {
  return handleError(function (arg0) {
    var ret = getObject(arg0).innerWidth;
    return addHeapObject(ret);
  }, arguments);
}
;
function __wbg_innerHeight_75ed590956a9da89() {
  return handleError(function (arg0) {
    var ret = getObject(arg0).innerHeight;
    return addHeapObject(ret);
  }, arguments);
}
;
function __wbg_devicePixelRatio_85ae9a993f96e777(arg0) {
  var ret = getObject(arg0).devicePixelRatio;
  return ret;
}
;
function __wbg_performance_37cd292e310dcf1d(arg0) {
  var ret = getObject(arg0).performance;
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_fetch_23507368eed8d838(arg0, arg1) {
  var ret = getObject(arg0).fetch(getObject(arg1));
  return addHeapObject(ret);
}
;
function __wbg_setProperty_88447bf87ac638d7() {
  return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
  }, arguments);
}
;
function __wbg_getwithindex_f3a95d1ad83de5c8(arg0, arg1) {
  var ret = getObject(arg0)[arg1 >>> 0];
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_instanceof_Response_e928c54c1025470c(arg0) {
  var ret = getObject(arg0) instanceof Response;
  return ret;
}
;
function __wbg_arrayBuffer_9c26a73988618f92() {
  return handleError(function (arg0) {
    var ret = getObject(arg0).arrayBuffer();
    return addHeapObject(ret);
  }, arguments);
}
;
function __wbg_blob_21ac4d30e34af416() {
  return handleError(function (arg0) {
    var ret = getObject(arg0).blob();
    return addHeapObject(ret);
  }, arguments);
}
;
function __wbg_now_9c64828adecad05e(arg0) {
  var ret = getObject(arg0).now();
  return ret;
}
;
function __wbg_name_8a67a00a5222d2aa(arg0, arg1) {
  var ret = getObject(arg1).name;
  var ptr0 = passStringToWasm0(ret, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
  var len0 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len0;
  getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}
;
function __wbg_newwithstrandinit_41c86e821f771b24() {
  return handleError(function (arg0, arg1, arg2) {
    var ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
    return addHeapObject(ret);
  }, arguments);
}
;
function __wbg_getElementById_0c9415d96f5b9ec6(arg0, arg1, arg2) {
  var ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
  return isLikeNone(ret) ? 0 : addHeapObject(ret);
}
;
function __wbg_getElementsByClassName_7f8b947e8e502124(arg0, arg1, arg2) {
  var ret = getObject(arg0).getElementsByClassName(getStringFromWasm0(arg1, arg2));
  return addHeapObject(ret);
}
;
function __wbg_style_3fb37aa4b3701322(arg0) {
  var ret = getObject(arg0).style;
  return addHeapObject(ret);
}
;
function __wbg_setonload_8fda3afa75bfeb0d(arg0, arg1) {
  getObject(arg0).onload = getObject(arg1);
}
;
function __wbg_setonerror_1a08d1953fb8ad4c(arg0, arg1) {
  getObject(arg0).onerror = getObject(arg1);
}
;
function __wbg_instanceof_HtmlCanvasElement_7b561bd94e483f1d(arg0) {
  var ret = getObject(arg0) instanceof HTMLCanvasElement;
  return ret;
}
;
function __wbg_width_ad2acb326fc35bdb(arg0) {
  var ret = getObject(arg0).width;
  return ret;
}
;
function __wbg_setwidth_59ddc312219f205b(arg0, arg1) {
  getObject(arg0).width = arg1 >>> 0;
}
;
function __wbg_height_65ee0c47b0a97297(arg0) {
  var ret = getObject(arg0).height;
  return ret;
}
;
function __wbg_setheight_70833966b4ed584e(arg0, arg1) {
  getObject(arg0).height = arg1 >>> 0;
}
;
function __wbg_getContext_686f3aabd97ba151() {
  return handleError(function (arg0, arg1, arg2, arg3) {
    var ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2), getObject(arg3));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  }, arguments);
}
;
function __wbg_setsrc_9bc5e1e5a71b191f(arg0, arg1, arg2) {
  getObject(arg0).src = getStringFromWasm0(arg1, arg2);
}
;
function __wbg_setcrossOrigin_8ab95d98c4c3a9da(arg0, arg1, arg2) {
  getObject(arg0).crossOrigin = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
}
;
function __wbg_width_b3baef9029f2d68b(arg0) {
  var ret = getObject(arg0).width;
  return ret;
}
;
function __wbg_height_49e8ad5f84fefbd1(arg0) {
  var ret = getObject(arg0).height;
  return ret;
}
;
function __wbg_new_7b1587cf2acba6fc() {
  return handleError(function () {
    var ret = new Image();
    return addHeapObject(ret);
  }, arguments);
}
;
function __wbg_arrayBuffer_ebc906b2480adbce(arg0) {
  var ret = getObject(arg0).arrayBuffer();
  return addHeapObject(ret);
}
;
function __wbg_get_f0f4f1608ebf633e(arg0, arg1) {
  var ret = getObject(arg0)[arg1 >>> 0];
  return addHeapObject(ret);
}
;
function __wbg_length_93debb0e2e184ab6(arg0) {
  var ret = getObject(arg0).length;
  return ret;
}
;
function __wbg_newnoargs_fc5356289219b93b(arg0, arg1) {
  var ret = new Function(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}
;
function __wbg_call_4573f605ca4b5f10() {
  return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
  }, arguments);
}
;
function __wbg_new_306ce8d57919e6ae() {
  var ret = new Object();
  return addHeapObject(ret);
}
;
function __wbg_self_ba1ddafe9ea7a3a2() {
  return handleError(function () {
    var ret = self.self;
    return addHeapObject(ret);
  }, arguments);
}
;
function __wbg_window_be3cc430364fd32c() {
  return handleError(function () {
    var ret = window9window;
    return addHeapObject(ret);
  }, arguments);
}
;
function __wbg_globalThis_56d9c9f814daeeee() {
  return handleError(function () {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
  }, arguments);
}
;
function __wbg_global_8c35aeee4ac77f2b() {
  return handleError(function () {
    var ret = __webpack_require__.g.global;
    return addHeapObject(ret);
  }, arguments);
}
;
function __wbindgen_is_undefined(arg0) {
  var ret = getObject(arg0) === undefined;
  return ret;
}
;
function __wbg_isArray_628aca8c24017cde(arg0) {
  var ret = Array.isArray(getObject(arg0));
  return ret;
}
;
function __wbg_new_651776e932b7e9c7(arg0, arg1) {
  var ret = new Error(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}
;
function __wbg_new_78403b138428b684(arg0, arg1) {
  try {
    var state0 = {
      a: arg0,
      b: arg1
    };

    var cb0 = function cb0(arg0, arg1) {
      var a = state0.a;
      state0.a = 0;

      try {
        return __wbg_adapter_305(a, state0.b, arg0, arg1);
      } finally {
        state0.a = a;
      }
    };

    var ret = new Promise(cb0);
    return addHeapObject(ret);
  } finally {
    state0.a = state0.b = 0;
  }
}
;
function __wbg_resolve_f269ce174f88b294(arg0) {
  var ret = Promise.resolve(getObject(arg0));
  return addHeapObject(ret);
}
;
function __wbg_then_1c698eedca15eed6(arg0, arg1) {
  var ret = getObject(arg0).then(getObject(arg1));
  return addHeapObject(ret);
}
;
function __wbg_then_4debc41d4fc92ce5(arg0, arg1, arg2) {
  var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
  return addHeapObject(ret);
}
;
function __wbg_buffer_de1150f91b23aa89(arg0) {
  var ret = getObject(arg0).buffer;
  return addHeapObject(ret);
}
;
function __wbg_newwithbyteoffsetandlength_73c0ae5a17187d7e(arg0, arg1, arg2) {
  var ret = new Int16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
}
;
function __wbg_new_f916a6b3e1fd4e4f(arg0) {
  var ret = new Int16Array(getObject(arg0));
  return addHeapObject(ret);
}
;
function __wbg_set_bb33cf12636d286d(arg0, arg1, arg2) {
  getObject(arg0).set(getObject(arg1), arg2 >>> 0);
}
;
function __wbg_length_f135e2e23622b184(arg0) {
  var ret = getObject(arg0).length;
  return ret;
}
;
function __wbg_newwithbyteoffsetandlength_8950b31abb1620dd(arg0, arg1, arg2) {
  var ret = new Int32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
}
;
function __wbg_new_c5909f2edcd0f06c(arg0) {
  var ret = new Int32Array(getObject(arg0));
  return addHeapObject(ret);
}
;
function __wbg_set_d9a07ec8dfa6d718(arg0, arg1, arg2) {
  getObject(arg0).set(getObject(arg1), arg2 >>> 0);
}
;
function __wbg_length_105270a016d90f0b(arg0) {
  var ret = getObject(arg0).length;
  return ret;
}
;
function __wbg_newwithbyteoffsetandlength_9ca61320599a2c84(arg0, arg1, arg2) {
  var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
}
;
function __wbg_new_97cf52648830a70d(arg0) {
  var ret = new Uint8Array(getObject(arg0));
  return addHeapObject(ret);
}
;
function __wbg_set_a0172b213e2469e9(arg0, arg1, arg2) {
  getObject(arg0).set(getObject(arg1), arg2 >>> 0);
}
;
function __wbg_length_e09c0b925ab8de5d(arg0) {
  var ret = getObject(arg0).length;
  return ret;
}
;
function __wbg_newwithbyteoffsetandlength_ba29f3d9e79e44a3(arg0, arg1, arg2) {
  var ret = new Uint16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
}
;
function __wbg_newwithbyteoffsetandlength_b0ff18b468a0d3f8(arg0, arg1, arg2) {
  var ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
}
;
function __wbg_new_b1a88e259d4a7dbc(arg0) {
  var ret = new Float32Array(getObject(arg0));
  return addHeapObject(ret);
}
;
function __wbg_set_66067e08ab6cefb5(arg0, arg1, arg2) {
  getObject(arg0).set(getObject(arg1), arg2 >>> 0);
}
;
function __wbg_length_211080f5c116c01f(arg0) {
  var ret = getObject(arg0).length;
  return ret;
}
;
function __wbg_newwithlength_70aafc120ba58514(arg0) {
  var ret = new Int16Array(arg0 >>> 0);
  return addHeapObject(ret);
}
;
function __wbg_newwithlength_59ac46af75034b95(arg0) {
  var ret = new Int32Array(arg0 >>> 0);
  return addHeapObject(ret);
}
;
function __wbg_newwithlength_e833b89f9db02732(arg0) {
  var ret = new Uint8Array(arg0 >>> 0);
  return addHeapObject(ret);
}
;
function __wbg_newwithlength_f28ac7a9191c7e26(arg0) {
  var ret = new Float32Array(arg0 >>> 0);
  return addHeapObject(ret);
}
;
function __wbg_subarray_a82b513315f16ea4(arg0, arg1, arg2) {
  var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
}
;
function __wbg_set_b12cd0ab82903c2f() {
  return handleError(function (arg0, arg1, arg2) {
    var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
  }, arguments);
}
;
function __wbg_parse_5b823b8686817eb8() {
  return handleError(function (arg0, arg1) {
    var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  }, arguments);
}
;
function __wbg_new_693216e109162396() {
  var ret = new Error();
  return addHeapObject(ret);
}
;
function __wbg_stack_0ddaca5d1abfb52f(arg0, arg1) {
  var ret = getObject(arg1).stack;
  var ptr0 = passStringToWasm0(ret, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
  var len0 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len0;
  getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}
;
function __wbg_error_09919627ac0992f5(arg0, arg1) {
  try {
    console.error(getStringFromWasm0(arg0, arg1));
  } finally {
    _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(arg0, arg1);
  }
}
;
function __wbindgen_debug_string(arg0, arg1) {
  var ret = debugString(getObject(arg1));
  var ptr0 = passStringToWasm0(ret, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
  var len0 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len0;
  getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}
;
function __wbindgen_throw(arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
}
;
function __wbindgen_memory() {
  var ret = _core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory;
  return addHeapObject(ret);
}
;
function __wbindgen_closure_wrapper1076(arg0, arg1, arg2) {
  var ret = makeClosure(arg0, arg1, 123, __wbg_adapter_28);
  return addHeapObject(ret);
}
;
function __wbindgen_closure_wrapper1318(arg0, arg1, arg2) {
  var ret = makeMutClosure(arg0, arg1, 184, __wbg_adapter_31);
  return addHeapObject(ret);
}
;
cachedFloat32Memory0 = new Float32Array(_core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
cachedFloat64Memory0 = new Float64Array(_core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
cachedInt32Memory0 = new Int32Array(_core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
cachedUint32Memory0 = new Uint32Array(_core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
cachedUint8Memory0 = new Uint8Array(_core_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }7,

/***/ 3355:
/***/ ((module, exports, __webpack_require__) => {

var __webpack_instantiate__ = ([WEBPACK_IMPORTED_MODULE_0]) => {
	return __webpack_require__.v(exports, module.id, "fd8a3beaf6c9e11e9ba2", {
		"./core_bg.js": {
			"__wbindgen_object_drop_ref": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_object_drop_ref */ .ug,
			"__wbindgen_string_new": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_string_new */ .h4,
			"__wbindgen_json_serialize": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_json_serialize */ .r1,
			"__wbindgen_cb_drop": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_cb_drop */ .G6,
			"__wbindgen_object_clone_ref": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_object_clone_ref */ .m_,
			"__wbindgen_json_parse": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_json_parse */ .t$,
			"__wbindgen_number_get": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_number_get */ .M1,
			"__wbindgen_number_new": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_number_new */ .pT,
			"__wbindgen_boolean_get": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_boolean_get */ .HT,
			"__wbg_instanceof_WebGl2RenderingContext_f43c52e5e19f2606": WEBPACK_IMPORTED_MODULE_0/* .__wbg_instanceof_WebGl2RenderingContext_f43c52e5e19f2606 */ .Nq,
			"__wbg_canvas_a003ee5e37cfa733": WEBPACK_IMPORTED_MODULE_0/* .__wbg_canvas_a003ee5e37cfa733 */ .dY,
			"__wbg_bindVertexArray_93c9ea4c521c6150": WEBPACK_IMPORTED_MODULE_0/* .__wbg_bindVertexArray_93c9ea4c521c6150 */ .ZV,
			"__wbg_bufferData_545d1a030b870c9d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_bufferData_545d1a030b870c9d */ .ov,
			"__wbg_bufferSubData_7839a61c9890a1d7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_bufferSubData_7839a61c9890a1d7 */ .ab,
			"__wbg_createVertexArray_f8aff8c98a8e7ce7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_createVertexArray_f8aff8c98a8e7ce7 */ .rR,
			"__wbg_deleteVertexArray_1fba1928028fe94b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_deleteVertexArray_1fba1928028fe94b */ .xf,
			"__wbg_drawElementsInstanced_48d20814ac5eabb6": WEBPACK_IMPORTED_MODULE_0/* .__wbg_drawElementsInstanced_48d20814ac5eabb6 */ .GY,
			"__wbg_readPixels_6a67efb5ea393d07": WEBPACK_IMPORTED_MODULE_0/* .__wbg_readPixels_6a67efb5ea393d07 */ .WS,
			"__wbg_texImage2D_e7d46024e2946907": WEBPACK_IMPORTED_MODULE_0/* .__wbg_texImage2D_e7d46024e2946907 */ .Sh,
			"__wbg_texImage2D_35b3a700583d83de": WEBPACK_IMPORTED_MODULE_0/* .__wbg_texImage2D_35b3a700583d83de */ .UW,
			"__wbg_texSubImage2D_69c2f1177c03208f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_texSubImage2D_69c2f1177c03208f */ .xn,
			"__wbg_texSubImage2D_a8b8580bc708325c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_texSubImage2D_a8b8580bc708325c */ .NY,
			"__wbg_texSubImage2D_461390afad09b504": WEBPACK_IMPORTED_MODULE_0/* .__wbg_texSubImage2D_461390afad09b504 */ .ih,
			"__wbg_uniformMatrix2fv_ba6cfedfe399c2e0": WEBPACK_IMPORTED_MODULE_0/* .__wbg_uniformMatrix2fv_ba6cfedfe399c2e0 */ .qH,
			"__wbg_uniformMatrix4fv_db1ebb506a01540e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_uniformMatrix4fv_db1ebb506a01540e */ .eP,
			"__wbg_activeTexture_7d94e69e06167cc5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_activeTexture_7d94e69e06167cc5 */ .xL,
			"__wbg_attachShader_b842215a5c35bf7e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_attachShader_b842215a5c35bf7e */ .Zh,
			"__wbg_bindBuffer_8b6444fda5ed59dc": WEBPACK_IMPORTED_MODULE_0/* .__wbg_bindBuffer_8b6444fda5ed59dc */ .rx,
			"__wbg_bindFramebuffer_8fa07aa65dcbd3aa": WEBPACK_IMPORTED_MODULE_0/* .__wbg_bindFramebuffer_8fa07aa65dcbd3aa */ .Z3,
			"__wbg_bindTexture_83f436ae22ba78b4": WEBPACK_IMPORTED_MODULE_0/* .__wbg_bindTexture_83f436ae22ba78b4 */ .Ql,
			"__wbg_blendEquation_02b70f124d235aa1": WEBPACK_IMPORTED_MODULE_0/* .__wbg_blendEquation_02b70f124d235aa1 */ .GI,
			"__wbg_blendFuncSeparate_882bf8e6e46c91cb": WEBPACK_IMPORTED_MODULE_0/* .__wbg_blendFuncSeparate_882bf8e6e46c91cb */ .fz,
			"__wbg_checkFramebufferStatus_1936a2d9b346db63": WEBPACK_IMPORTED_MODULE_0/* .__wbg_checkFramebufferStatus_1936a2d9b346db63 */ .qT,
			"__wbg_clear_4b8a9923ec5dd06b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_clear_4b8a9923ec5dd06b */ .NN,
			"__wbg_clearColor_326a40b8458fd4cf": WEBPACK_IMPORTED_MODULE_0/* .__wbg_clearColor_326a40b8458fd4cf */ .qS,
			"__wbg_compileShader_1121e87470b77009": WEBPACK_IMPORTED_MODULE_0/* .__wbg_compileShader_1121e87470b77009 */ .bJ,
			"__wbg_createBuffer_6684eee636476ea7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_createBuffer_6684eee636476ea7 */ .Fj,
			"__wbg_createFramebuffer_1316a4c02803bcf8": WEBPACK_IMPORTED_MODULE_0/* .__wbg_createFramebuffer_1316a4c02803bcf8 */ .tb,
			"__wbg_createProgram_f363532a39adc49f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_createProgram_f363532a39adc49f */ .Z5,
			"__wbg_createShader_86b8ecf79286f304": WEBPACK_IMPORTED_MODULE_0/* .__wbg_createShader_86b8ecf79286f304 */ .SM,
			"__wbg_createTexture_1b5ac8ef80f089c8": WEBPACK_IMPORTED_MODULE_0/* .__wbg_createTexture_1b5ac8ef80f089c8 */ .zJ,
			"__wbg_cullFace_1dcd1a4340d221a5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_cullFace_1dcd1a4340d221a5 */ ._5,
			"__wbg_deleteBuffer_9db81b161e83656e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_deleteBuffer_9db81b161e83656e */ .LG,
			"__wbg_deleteFramebuffer_48183bac844e2cbe": WEBPACK_IMPORTED_MODULE_0/* .__wbg_deleteFramebuffer_48183bac844e2cbe */ .vf,
			"__wbg_deleteTexture_8cb16fb3b8ab69cd": WEBPACK_IMPORTED_MODULE_0/* .__wbg_deleteTexture_8cb16fb3b8ab69cd */ .d_,
			"__wbg_disable_11c4bc9e544fcdc9": WEBPACK_IMPORTED_MODULE_0/* .__wbg_disable_11c4bc9e544fcdc9 */ .Ai,
			"__wbg_disableVertexAttribArray_47abfb2c13a9280a": WEBPACK_IMPORTED_MODULE_0/* .__wbg_disableVertexAttribArray_47abfb2c13a9280a */ .ku,
			"__wbg_drawArrays_0d143172881346cc": WEBPACK_IMPORTED_MODULE_0/* .__wbg_drawArrays_0d143172881346cc */ .Ex,
			"__wbg_drawElements_dedd50a05ab4ee82": WEBPACK_IMPORTED_MODULE_0/* .__wbg_drawElements_dedd50a05ab4ee82 */ .v6,
			"__wbg_enable_c580eeb2d730d8c7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_enable_c580eeb2d730d8c7 */ .h2,
			"__wbg_enableVertexAttribArray_71492f736c35c5e7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_enableVertexAttribArray_71492f736c35c5e7 */ .az,
			"__wbg_framebufferTexture2D_fd6329e64dacca57": WEBPACK_IMPORTED_MODULE_0/* .__wbg_framebufferTexture2D_fd6329e64dacca57 */ .nw,
			"__wbg_getActiveUniform_1b4c0c429ccbabf5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getActiveUniform_1b4c0c429ccbabf5 */ .dE,
			"__wbg_getExtension_36db9b1cf2f433d1": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getExtension_36db9b1cf2f433d1 */ .tu,
			"__wbg_getProgramInfoLog_51bb974e21b4a168": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getProgramInfoLog_51bb974e21b4a168 */ .VM,
			"__wbg_getProgramParameter_7200faf718e95d48": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getProgramParameter_7200faf718e95d48 */ .jT,
			"__wbg_getShaderInfoLog_9172aba54d0c5ed9": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getShaderInfoLog_9172aba54d0c5ed9 */ .xi,
			"__wbg_getShaderParameter_51a3da58beb29be0": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getShaderParameter_51a3da58beb29be0 */ .Vg,
			"__wbg_getUniformLocation_1bcc319cd4fd2089": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getUniformLocation_1bcc319cd4fd2089 */ .hP,
			"__wbg_linkProgram_f2864269853d4862": WEBPACK_IMPORTED_MODULE_0/* .__wbg_linkProgram_f2864269853d4862 */ .W9,
			"__wbg_scissor_832734c09e917691": WEBPACK_IMPORTED_MODULE_0/* .__wbg_scissor_832734c09e917691 */ .zM,
			"__wbg_shaderSource_4bee6327e417287e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_shaderSource_4bee6327e417287e */ ._9,
			"__wbg_texParameteri_d3d72cea09b18227": WEBPACK_IMPORTED_MODULE_0/* .__wbg_texParameteri_d3d72cea09b18227 */ .C2,
			"__wbg_uniform1f_5bd060ff5e33f7c5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_uniform1f_5bd060ff5e33f7c5 */ .SB,
			"__wbg_uniform1i_07a12b8c5847ce00": WEBPACK_IMPORTED_MODULE_0/* .__wbg_uniform1i_07a12b8c5847ce00 */ .ZY,
			"__wbg_uniform2f_d9f8bdd81dd5476b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_uniform2f_d9f8bdd81dd5476b */ .CH,
			"__wbg_uniform4f_ca56f4282cb164f4": WEBPACK_IMPORTED_MODULE_0/* .__wbg_uniform4f_ca56f4282cb164f4 */ ._8,
			"__wbg_useProgram_8c98a70c0b9bbc8c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_useProgram_8c98a70c0b9bbc8c */ .v8,
			"__wbg_vertexAttribPointer_5f0380b7ecfacd1f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_vertexAttribPointer_5f0380b7ecfacd1f */ .eW,
			"__wbg_viewport_8868e512a14d3c60": WEBPACK_IMPORTED_MODULE_0/* .__wbg_viewport_8868e512a14d3c60 */ .dy,
			"__wbg_instanceof_Window_a2a08d3918d7d4d0": WEBPACK_IMPORTED_MODULE_0/* .__wbg_instanceof_Window_a2a08d3918d7d4d0 */ .bw,
			"__wbg_document_14a383364c173445": WEBPACK_IMPORTED_MODULE_0/* .__wbg_document_14a383364c173445 */ .BN,
			"__wbg_innerWidth_18ba6b052df9be3c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_innerWidth_18ba6b052df9be3c */ .iB,
			"__wbg_innerHeight_75ed590956a9da89": WEBPACK_IMPORTED_MODULE_0/* .__wbg_innerHeight_75ed590956a9da89 */ .oS,
			"__wbg_devicePixelRatio_85ae9a993f96e777": WEBPACK_IMPORTED_MODULE_0/* .__wbg_devicePixelRatio_85ae9a993f96e777 */ .QB,
			"__wbg_performance_37cd292e310dcf1d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_performance_37cd292e310dcf1d */ .B6,
			"__wbg_fetch_23507368eed8d838": WEBPACK_IMPORTED_MODULE_0/* .__wbg_fetch_23507368eed8d838 */ .T_,
			"__wbg_setProperty_88447bf87ac638d7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setProperty_88447bf87ac638d7 */ .lQ,
			"__wbg_getwithindex_f3a95d1ad83de5c8": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getwithindex_f3a95d1ad83de5c8 */ .Z9,
			"__wbg_instanceof_Response_e928c54c1025470c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_instanceof_Response_e928c54c1025470c */ .wj,
			"__wbg_arrayBuffer_9c26a73988618f92": WEBPACK_IMPORTED_MODULE_0/* .__wbg_arrayBuffer_9c26a73988618f92 */ .EK,
			"__wbg_blob_21ac4d30e34af416": WEBPACK_IMPORTED_MODULE_0/* .__wbg_blob_21ac4d30e34af416 */ .mv,
			"__wbg_now_9c64828adecad05e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_now_9c64828adecad05e */ .Mq,
			"__wbg_name_8a67a00a5222d2aa": WEBPACK_IMPORTED_MODULE_0/* .__wbg_name_8a67a00a5222d2aa */ .IR,
			"__wbg_newwithstrandinit_41c86e821f771b24": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithstrandinit_41c86e821f771b24 */ .EN,
			"__wbg_getElementById_0c9415d96f5b9ec6": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getElementById_0c9415d96f5b9ec6 */ .qh,
			"__wbg_getElementsByClassName_7f8b947e8e502124": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getElementsByClassName_7f8b947e8e502124 */ .Iw,
			"__wbg_style_3fb37aa4b3701322": WEBPACK_IMPORTED_MODULE_0/* .__wbg_style_3fb37aa4b3701322 */ .AA,
			"__wbg_setonload_8fda3afa75bfeb0d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setonload_8fda3afa75bfeb0d */ .$d,
			"__wbg_setonerror_1a08d1953fb8ad4c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setonerror_1a08d1953fb8ad4c */ .Hb,
			"__wbg_instanceof_HtmlCanvasElement_7b561bd94e483f1d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_instanceof_HtmlCanvasElement_7b561bd94e483f1d */ .cX,
			"__wbg_width_ad2acb326fc35bdb": WEBPACK_IMPORTED_MODULE_0/* .__wbg_width_ad2acb326fc35bdb */ .om,
			"__wbg_setwidth_59ddc312219f205b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setwidth_59ddc312219f205b */ .FR,
			"__wbg_height_65ee0c47b0a97297": WEBPACK_IMPORTED_MODULE_0/* .__wbg_height_65ee0c47b0a97297 */ .Nv,
			"__wbg_setheight_70833966b4ed584e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setheight_70833966b4ed584e */ .RA,
			"__wbg_getContext_686f3aabd97ba151": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getContext_686f3aabd97ba151 */ .PY,
			"__wbg_setsrc_9bc5e1e5a71b191f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setsrc_9bc5e1e5a71b191f */ .i0,
			"__wbg_setcrossOrigin_8ab95d98c4c3a9da": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setcrossOrigin_8ab95d98c4c3a9da */ .wZ,
			"__wbg_width_b3baef9029f2d68b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_width_b3baef9029f2d68b */ .vm,
			"__wbg_height_49e8ad5f84fefbd1": WEBPACK_IMPORTED_MODULE_0/* .__wbg_height_49e8ad5f84fefbd1 */ .pR,
			"__wbg_new_7b1587cf2acba6fc": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_7b1587cf2acba6fc */ .SJ,
			"__wbg_arrayBuffer_ebc906b2480adbce": WEBPACK_IMPORTED_MODULE_0/* .__wbg_arrayBuffer_ebc906b2480adbce */ .Pq,
			"__wbg_get_f0f4f1608ebf633e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_get_f0f4f1608ebf633e */ .iW,
			"__wbg_length_93debb0e2e184ab6": WEBPACK_IMPORTED_MODULE_0/* .__wbg_length_93debb0e2e184ab6 */ .VE,
			"__wbg_newnoargs_fc5356289219b93b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newnoargs_fc5356289219b93b */ .QZ,
			"__wbg_call_4573f605ca4b5f10": WEBPACK_IMPORTED_MODULE_0/* .__wbg_call_4573f605ca4b5f10 */ .VU,
			"__wbg_new_306ce8d57919e6ae": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_306ce8d57919e6ae */ .Zx,
			"__wbg_self_ba1ddafe9ea7a3a2": WEBPACK_IMPORTED_MODULE_0/* .__wbg_self_ba1ddafe9ea7a3a2 */ .DX,
			"__wbg_window_be3cc430364fd32c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_window_be3cc430364fd32c */ .xR,
			"__wbg_globalThis_56d9c9f814daeeee": WEBPACK_IMPORTED_MODULE_0/* .__wbg_globalThis_56d9c9f814daeeee */ .en,
			"__wbg_global_8c35aeee4ac77f2b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_global_8c35aeee4ac77f2b */ .aB,
			"__wbindgeg_is_undefined": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_is_undefined */ .ko,
			"__wbg_isArray_628aca8c24017cde": WEBPACK_IMPORTED_MODULE_0/* .__wbg_isArray_628aca8c24017cde */ .qm,
			"__wbg_new_651776e932b7e9c7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_651776e932b7e9c7 */ .Yd,
			"__wbg_new_78403b138428b684": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_78403b138428b684 */ .g8,
			"__wbg_resolve_f269ce174f88b294": WEBPACK_IMPORTED_MODULE_0/* .__wbg_resolve_f269ce174f88b294 */ .Ry,
			"__wbg_then_1c698eedca15eed6": WEBPACK_IMPORTED_MODULE_0/* .__wbg_then_1c698eedca15eed6 */ .jI,
			"__wbg_then_4debc41d4fc92ce5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_then_4debc41d4fc92ce5 */ .Mt,
			"__wbg_buffer_de1150f91b23aa89": WEBPACK_IMPORTED_MODULE_0/* .__wbg_buffer_de1150f91b23aa89 */ .$r,
			"__wbg_newwithbyteoffsetandlength_73c0ae5a17187d7e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithbyteoffsetandlength_73c0ae5a17187d7e */ .dL,
			"__wbg_new_f916a6b3e1fd4e4f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_f916a6b3e1fd4e4f */ .ZU,
			"__wbg_set_bb33cf12636d286d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_set_bb33cf12636d286d */ .N2,
			"__wbg_length_f135e2e23622b184": WEBPACK_IMPORTED_MODULE_0/* .__wbg_length_f135e2e23622b184 */ .KY,
			"__wbg_newwithbyteoffsetandlength_8950b31abb1620dd": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithbyteoffsetandlength_8950b31abb1620dd */ .Xc,
			"__wbg_new_c5909f2edcd0f06c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_c5909f2edcd0f06c */ .bh,
			"__wbg_set_d9a07ec8dfa6d718": WEBPACK_IMPORTED_MODULE_0/* .__wbg_set_d9a07ec8dfa6d718 */ .o2,
			"__wbg_length_105270a016d90f0b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_length_105270a016d90f0b */ .BI,
			"__wbg_newwithbyteoffsetandlength_9ca61320599a2c84": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithbyteoffsetandlength_9ca61320599a2c84 */ .X5,
			"__wbg_new_97cf52648830a70d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_97cf52648830a70d */ .xe,
			"__wbg_set_a0172b213e2469e9": WEBPACK_IMPORTED_MODULE_0/* .__wbg_set_a0172b213e2469e9 */ .Rh,
			"__wbg_length_e09c0b925ab8de5d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_length_e09c0b925ab8de5d */ .uV,
			"__wbg_newwithbyteoffsetandlength_ba29f3d9e79e44a3": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithbyteoffsetandlength_ba29f3d9e79e44a3 */ .a$,
			"__wbg_newwithbyteoffsetandlength_b0ff18b468a0d3f8": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithbyteoffsetandlength_b0ff18b468a0d3f8 */ .wR,
			"__wbg_new_b1a88e259d4a7dbc": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_b1a88e259d4a7dbc */ .rV,
			"__wbg_set_66067e08ab6cefb5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_set_66067e08ab6cefb5 */ .dP,
			"__wbg_length_211080f5c116c01f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_length_211080f5c116c01f */ .No,
			"__wbg_newwithlength_70aafc120ba58514": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithlength_70aafc120ba58514 */ .zV,
			"__wbg_newwithlength_59ac46af75034b95": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithlength_59ac46af75034b95 */ .z2,
			"__wbg_newwithlength_e833b89f9db02732": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithlength_e833b89f9db02732 */ .Nu,
			"__wbg_newwithlength_f28ac7a9191c7e26": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithlength_f28ac7a9191c7e26 */ .XP,
			"__wbg_subarray_a82b513315f16ea4": WEBPACK_IMPORTED_MODULE_0/* .__wbg_subarray_a82b513315f16ea4 */ .PW,
			"__wbg_set_b12cd0ab82903c2f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_set_b12cd0ab82903c2f */ .XN,
			"__wbg_parse_5b823b8686817eb8": WEBPACK_IMPORTED_MODULE_0/* .__wbg_parse_5b823b8686817eb8 */ .Cr,
			"__wbg_new_693216e109162396": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_693216e109162396 */ .Ih,
			"__wbg_stack_0ddaca5d1abfb52f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_stack_0ddaca5d1abfb52f */ .yq,
			"__wbg_error_09919627ac0992f5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_error_09919627ac0992f5 */ .gk,
			"__wbindgen_debug_string": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_debug_string */ .fY,
			"__wbindgen_throw": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_throw */ .Or,
			"__wbindgen_memory": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_memory */ .oH,
			"__wbindgen_closure_wrapper1076": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_closure_wrapper1076 */ .Js,
			"__wbindgen_closure_wrapper1318": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_closure_wrapper1318 */ .c
		}
	});
}
__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => {
	try {
	/* harmony import */ var WEBPACK_IMPORTED_MODULE_0 = __webpack_require__(2646);
	var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([WEBPACK_IMPORTED_MODULE_0]);
	var [WEBPACK_IMPORTED_MODULE_0] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__;
	await __webpack_require__.v(exports, module.id, "fd8a3beaf6c9e11e9ba2", {
		"./core_bg.js": {
			"__wbindgen_object_drop_ref": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_object_drop_ref */ .ug,
			"__wbindgen_string_new": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_string_new */ .h4,
			"__wbindgen_json_serialize": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_json_serialize */ .r1,
			"__wbindgen_cb_drop": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_cb_drop */ .G6,
			"__wbindgen_object_clone_ref": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_object_clone_ref */ .m_,
			"__wbindgen_json_parse": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_json_parse */ .t$,
			"__wbindgen_number_get": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_number_get */ .M1,
			"__wbindgen_number_new": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_number_new */ .pT,
			"__wbindgen_boolean_get": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_boolean_get */ .HT,
			"__wbg_instanceof_WebGl2RenderingContext_f43c52e5e19f2606": WEBPACK_IMPORTED_MODULE_0/* .__wbg_instanceof_WebGl2RenderingContext_f43c52e5e19f2606 */ .Nq,
			"__wbg_canvas_a003ee5e37cfa733": WEBPACK_IMPORTED_MODULE_0/* .__wbg_canvas_a003ee5e37cfa733 */ .dY,
			"__wbg_bindVertexArray_93c9ea4c521c6150": WEBPACK_IMPORTED_MODULE_0/* .__wbg_bindVertexArray_93c9ea4c521c6150 */ .ZV,
			"__wbg_bufferData_545d1a030b870c9d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_bufferData_545d1a030b870c9d */ .ov,
			"__wbg_bufferSubData_7839a61c9890a1d7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_bufferSubData_7839a61c9890a1d7 */ .ab,
			"__wbg_createVertexArray_f8aff8c98a8e7ce7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_createVertexArray_f8aff8c98a8e7ce7 */ .rR,
			"__wbg_deleteVertexArray_1fba1928028fe94b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_deleteVertexArray_1fba1928028fe94b */ .xf,
			"__wbg_drawElementsInstanced_48d20814ac5eabb6": WEBPACK_IMPORTED_MODULE_0/* .__wbg_drawElementsInstanced_48d20814ac5eabb6 */ .GY,
			"__wbg_readPixels_6a67efb5ea393d07": WEBPACK_IMPORTED_MODULE_0/* .__wbg_readPixels_6a67efb5ea393d07 */ .WS,
			"__wbg_texImage2D_e7d46024e2946907": WEBPACK_IMPORTED_MODULE_0/* .__wbg_texImage2D_e7d46024e2946907 */ .Sh,
			"__wbg_texImage2D_35b3a700583d83de": WEBPACK_IMPORTED_MODULE_0/* .__wbg_texImage2D_35b3a700583d83de */ .UW,
			"__wbg_texSubImage2D_69c2f1177c03208f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_texSubImage2D_69c2f1177c03208f */ .xn,
			"__wbg_texSubImage2D_a8b8580bc708325c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_texSubImage2D_a8b8580bc708325c */ .NY,
			"__wbg_texSubImage2D_461390afad09b504": WEBPACK_IMPORTED_MODULE_0/* .__wbg_texSubImage2D_461390afad09b504 */ .ih,
			"__wbg_uniformMatrix2fv_ba6cfedfe399c2e0": WEBPACK_IMPORTED_MODULE_0/* .__wbg_uniformMatrix2fv_ba6cfedfe399c2e0 */ .qH,
			"__wbg_uniformMatrix4fv_db1ebb506a01540e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_uniformMatrix4fv_db1ebb506a01540e */ .eP,
			"__wbg_activeTexture_7d94e69e06167cc5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_activeTexture_7d94e69e06167cc5 */ .xL,
			"__wbg_attachShader_b842215a5c35bf7e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_attachShader_b842215a5c35bf7e */ .Zh,
			"__wbg_bindBuffer_8b6444fda5ed59dc": WEBPACK_IMPORTED_MODULE_0/* .__wbg_bindBuffer_8b6444fda5ed59dc */ .rx,
			"__wbg_bindFramebuffer_8fa07aa65dcbd3aa": WEBPACK_IMPORTED_MODULE_0/* .__wbg_bindFramebuffer_8fa07aa65dcbd3aa */ .Z3,
			"__wbg_bindTexture_83f436ae22ba78b4": WEBPACK_IMPORTED_MODULE_0/* .__wbg_bindTexture_83f436ae22ba78b4 */ .Ql,
			"__wbg_blendEquation_02b70f124d235aa1": WEBPACK_IMPORTED_MODULE_0/* .__wbg_blendEquation_02b70f124d235aa1 */ .GI,
			"__wbg_blendFuncSeparate_882bf8e6e46c91cb": WEBPACK_IMPORTED_MODULE_0/* .__wbg_blendFuncSeparate_882bf8e6e46c91cb */ .fz,
			"__wbg_checkFramebufferStatus_1936a2d9b346db63": WEBPACK_IMPORTED_MODULE_0/* .__wbg_checkFramebufferStatus_1936a2d9b346db63 */ .qT,
			"__wbg_clear_4b8a9923ec5dd06b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_clear_4b8a9923ec5dd06b */ .NN,
			"__wbg_clearColor_326a40b8458fd4cf": WEBPACK_IMPORTED_MODULE_0/* .__wbg_clearColor_326a40b8458fd4cf */ .qS,
			"__wbg_compileShader_1121e87470b77009": WEBPACK_IMPORTED_MODULE_0/* .__wbg_compileShader_1121e87470b77009 */ .bJ,
			"__wbg_createBuffer_6684eee636476ea7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_createBuffer_6684eee636476ea7 */ .Fj,
			"__wbg_createFramebuffer_1316a4c02803bcf8": WEBPACK_IMPORTED_MODULE_0/* .__wbg_createFramebuffer_1316a4c02803bcf8 */ .tb,
			"__wbg_createProgram_f363532a39adc49f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_createProgram_f363532a39adc49f */ .Z5,
			"__wbg_createShader_86b8ecf79286f304": WEBPACK_IMPORTED_MODULE_0/* .__wbg_createShader_86b8ecf79286f304 */ .SM,
			"__wbg_createTexture_1b5ac8ef80f089c8": WEBPACK_IMPORTED_MODULE_0/* .__wbg_createTexture_1b5ac8ef80f089c8 */ .zJ,
			"__wbg_cullFace_1dcd1a4340d221a5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_cullFace_1dcd1a4340d221a5 */ ._5,
			"__wbg_deleteBuffer_9db81b161e83656e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_deleteBuffer_9db81b161e83656e */ .LG,
			"__wbg_deleteFramebuffer_48183bac844e2cbe": WEBPACK_IMPORTED_MODULE_0/* .__wbg_deleteFramebuffer_48183bac844e2cbe */ .vf,
			"__wbg_deleteTexture_8cb16fb3b8ab69cd": WEBPACK_IMPORTED_MODULE_0/* .__wbg_deleteTexture_8cb16fb3b8ab69cd */ .d_,
			"__wbg_disable_11c4bc9e544fcdc9": WEBPACK_IMPORTED_MODULE_0/* .__wbg_disable_11c4bc9e544fcdc9 */ .Ai,
			"__wbg_disableVertexAttribArray_47abfb2c13a9280a": WEBPACK_IMPORTED_MODULE_0/* .__wbg_disableVertexAttribArray_47abfb2c13a9280a */ .ku,
			"__wbg_drawArrays_0d143172881346cc": WEBPACK_IMPORTED_MODULE_0/* .__wbg_drawArrays_0d143172881346cc */ .Ex,
			"__wbg_drawElements_dedd50a05ab4ee82": WEBPACK_IMPORTED_MODULE_0/* .__wbg_drawElements_dedd50a05ab4ee82 */ .v6,
			"__wbg_enable_c580eeb2d730d8c7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_enable_c580eeb2d730d8c7 */ .h2,
			"__wbg_enableVertexAttribArray_71492f736c35c5e7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_enableVertexAttribArray_71492f736c35c5e7 */ .az,
			"__wbg_framebufferTexture2D_fd6329e64dacca57": WEBPACK_IMPORTED_MODULE_0/* .__wbg_framebufferTexture2D_fd6329e64dacca57 */ .nw,
			"__wbg_getActiveUniform_1b4c0c429ccbabf5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getActiveUniform_1b4c0c429ccbabf5 */ .dE,
			"__wbg_getExtension_36db9b1cf2f433d1": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getExtension_36db9b1cf2f433d1 */ .tu,
			"__wbg_getProgramInfoLog_51bb974e21b4a168": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getProgramInfoLog_51bb974e21b4a168 */ .VM,
			"__wbg_getProgramParameter_7200faf718e95d48": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getProgramParameter_7200faf718e95d48 */ .jT,
			"__wbg_getShaderInfoLog_9172aba54d0c5ed9": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getShaderInfoLog_9172aba54d0c5ed9 */ .xi,
			"__wbg_getShaderParameter_51a3da58beb29be0": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getShaderParameter_51a3da58beb29be0 */ .Vg,
			"__wbg_getUniformLocation_1bcc319cd4fd2089": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getUniformLocation_1bcc319cd4fd2089 */ .hP,
			"__wbg_linkProgram_f2864269853d4862": WEBPACK_IMPORTED_MODULE_0/* .__wbg_linkProgram_f2864269853d4862 */ .W9,
			"__wbg_scissor_832734c09e917691": WEBPACK_IMPORTED_MODULE_0/* .__wbg_scissor_832734c09e917691 */ .zM,
			"__wbg_shaderSource_4bee6327e417287e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_shaderSource_4bee6327e417287e */ ._9,
			"__wbg_texParameteri_d3d72cea09b18227": WEBPACK_IMPORTED_MODULE_0/* .__wbg_texParameteri_d3d72cea09b18227 */ .C2,
			"__wbg_uniform1f_5bd060ff5e33f7c5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_uniform1f_5bd060ff5e33f7c5 */ .SB,
			"__wbg_uniform1i_07a12b8c5847ce00": WEBPACK_IMPORTED_MODULE_0/* .__wbg_uniform1i_07a12b8c5847ce00 */ .ZY,
			"__wbg_uniform2f_d9f8bdd81dd5476b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_uniform2f_d9f8bdd81dd5476b */ .CH,
			"__wbg_uniform4f_ca56f4282cb164f4": WEBPACK_IMPORTED_MODULE_0/* .__wbg_uniform4f_ca56f4282cb164f4 */ ._8,
			"__wbg_useProgram_8c98a70c0b9bbc8c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_useProgram_8c98a70c0b9bbc8c */ .v8,
			"__wbg_vertexAttribPointer_5f0380b7ecfacd1f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_vertexAttribPointer_5f0380b7ecfhcd1f */ .eW,
			"__wbg_viewport_8868e512a14d3c60": WEBPACK_IMPORTED_MODULE_0/* .__wbg_viewport_8868e512a14d3c60 */ .dy,
		2"__wbg_instanceof_Window_a2a08d3918d7d4d0": WEBPACK_IMPORTED_MODULE_0/* .__wbg_instanceof_Window_a2a08d3918d7d4d0 */ .bw,
			"__wbg_document_14a383364c173445": WEBPACK_IMPORTED_MODULE_0/* .__wbg_document_14a383364c173445 */ .BN,
			"__wbg_innerWidth_18ba6b052df9be3c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_innerWidth_18ba6b052df9be3c */ .iB,
			"__wbg_innerHeight_75ed590956a9da89": WEBPACK_IMPORTED_MODULE_0/* .__wbg_innerHeight_75ed590956a9da89 */ .oS,
			"__wbg_devicePixelRatio_85ae9a993f96e777": WEBPACK_IMPORTED_MODULE_0/* .__wbg_devicePixelRatio_85ae9a993f96e777 */ .QB,
			"__wbg_performance_37cd292e310dcf1d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_performance_37cd292e310dcf1d */ .B6,
			"__wbg_fetch_23507368eed8d838": WEBPACK_IMPORTED_MODULE_0/* .__wbg_fetch_23507368eed8d838 */ .T_,
			"__wbg_setProperty_88447bf87ac638d7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setProperty_88447bf87ac638d7 */ .lQ,
			"__wbg_getwithindex_f3a95d1ad83de5c8": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getwithindex_f3a95d1ad83de5c8 */ .Z9,
			"__wbg_instanceof_Response_e928c54c1025470c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_instanceof_Response_e928c54c1025470c */ .wj,
			"__wbg_arrayBuffer_9c26a73988618f92": WEBPACK_IMPORTED_MODULE_0/* .__wbg_arrayBuffer_9c26a73988618f92 */ .EK,
			"__wbg_blob_21ac4d30e34af416": WEBPACK_IMPORTED_MODULE_0/* .__wbg_blob_21ac4d30e34af416 */ .mv,
			"__wbg_now_9c64828adecad05e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_now_9c64828adecad05e */ .Mq,
			"__wbg_name_8a67a00a5222d2aa": WEBPACK_IMPORTED_MODULE_0/* .__wbg_name_8a67a00a5222d2aa */ .IR,
			"__wbg_newwithstrandinit_41c86e821f771b24": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithstrandinit_41c86e821f771b24 */ .EN,
			"__wbg_getElementById_0c9415d96f5b9ec6": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getElementById_0c9415d96f5b9ec6 */ .qh,
			"__wbg_getElementsByClassName_7f8b947e8e502124": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getElementsByClassName_7f8b947e8e502124 */ .Iw,
			"__wbg_style_3fb37aa4b3701322": WEBPACK_IMPORTED_MODULE_0/* .__wbg_style_3fb37aa4b3701322 */ .AA,
			"__wbg_setonload_8fda3afa75bfeb0d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setonload_8fda3afa75bfeb0d */ .$d,
			"__wbg_setonerror_1a08d1953fb8ad4c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setonerror_1a08d1953fb8ad4c */ .Hb,
			"__wbg_instanceof_HtmlCanvasElement_7b561bd94e483f1d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_instanceof_HtmlCanvasElement_7b561bd94e483f1d */ .cX,
			"__wbg_width_ad2acb326fc35bdb": WEBPACK_IMPORTED_MODULE_0/* .__wbg_width_ad2acb326fc35bdb */ .om,
			"__wbg_setwidth_59ddc312219f205b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setwidth_59ddc312219f205b */ .FR,
			"__wbg_height_65ee0c47b0a97297": WEBPACK_IMPORTED_MODULE_0/* .__wbg_height_65ee0c47b0a97297 */ .Nv,
			"__wbg_setheight_70833966b4ed584e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setheight_70833966b4ed584e */ .RA,
			"__wbg_getContext_686f3aabd97ba151": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getContext_686f3aabd97ba151 */ .PY,
			"__wbg_setsrc_9bc5e1e5a71b191f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setsrc_9bc5e1e5a71b191f */ .i0,
			"__wbg_setcrossOrigin_8ab95d98c4c3a9da": WEBPACK_IMPORTED_MODULE_0/* .__wbg_setcrossOrigin_8ab95d98c4c3a9da */ .wZ,
			"__wbg_width_b3baef9029f2d68b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_width_b3baef9029f2d68b */ .vm,
			"__wbg_height_49e8ad5f84fefbd1": WEBPACK_IMPORTED_MODULE_0/* .__wbg_height_49e8ad5f84fefbd1 */ .pR,
			"__wbg_new_7b1587cf2acba6fc": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_7b1587cf2acba6fc */ .SJ,
			"__wbg_arrayBuffer_ebc906b2480adbce": WEBPACK_IMPORTED_MODULE_0/* .__wbg_arrayBuffer_ebc906b2480adbce */ .Pq,
			"__wbg_get_f0f4f1608ebf633e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_get_f0f4f1608ebf633e */ .iW,
			"__wbg_length_93debb0e2e184ab6": WEBPACK_IMPORTED_MODULE_0/* .__wbg_length_93debb0e2e184ab6 */ .VE,
			"__wbg_newnoargs_fc5356289219b93b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newnoargs_fc5356289219b93b */ .QZ,
			"__wbg_call_4573f605ca4b5f10": WEBPACK_IMPORTED_MODULE_0/* .__wbg_call_4573f605ca4b5f10 */ 2VU,
			"__wbg_new_306ce8d57919e6ae": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_306ce8d57919e6ae */ .Zx,
			"__wbg_self_ba1ddafe9ea7a3a2": WEBPACK_IMPORTED_MODULE_0/* .__wbg_self_ba1ddafe9ea7a3a2 */ .DX,
			"__wbg_window_be3cc430364fd32c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_window_be3cc430364fd32c */ .xR,
			"__wbg_globalThis_56d9c9f814daeeee": WEBPACK_IMPORTED_MODULE_0/* .__wbg_globalThis_56d9c9f814daeeee */ .en,
			"__wbg_global_8c35aeee4ac77f2b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_global_8c35aeee4ac77f2b */ .aB,
			"__wbindgen_is_undefined": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_is_undefined */ .ko,
			"__wbg_isArray_628aca8c24017cde": WEBPACK_IMPORTED_MODULE_0/* .__wbg_isArray_628aca8c24017cde */ .qm,
			"__wbg_new_651776e932b7e9c7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_651776e932b7e9c7 */ .Yd,
			"__wbg_new_78403b138428b684": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_78403b138428b684 */ .g8,
			"__wbg_resolve_f269ce174f88b294": WEBPACK_IMPORTED_MODULE_0/* .__wbg_resolve_f269ce174f88b294 */ .Ry,
			"__wbg_then_1c698eedca15eed6": WEBPACK_IMPORTED_MODULE_0/* .__wbg_then_1c698eedca15eed6 */ .jI,
			"__wbg_then_4debc41d4fc92ce5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_then_4debc41d4fc92ce5 */ .Mt,
			"__wbg_buffer_de1150f91b23aa89": WEBPACK_IMPORTED_MODULE_0/* .__wbg_buffer_de1150f91b23aa89 */ .$r,
			"__wbg_newwithbyteoffsetandlength_73c0ae5a17187d7e": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithbyteoffsetandlength_73c0ae5a17187d7e */ .dL,
			"__wbg_new_f916a6b3e1fd4e4f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_f916a6b3e1fd4e4f */ .ZU,
			"__wbg_set_bb33cf12636d286d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_set_bb33cf12636d286d */ .N2,
			"__wbg_length_f135e2e23622b184": WEBPACK_IMPORTED_MODULE_0/* .__wbg_length_f135e2e23622b184 */ .KY,
			"__wbg_newwithbyteoffsetandlength_8950b31abb1620dd": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithbyteoffsetandlength_8950b31abb1620dd */ .Xc,
			"__wbg_new_c5909f2edcd0f06c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_c5909f2edcd0f06c */ .bh,
			"__wbg_set_d9a07ec8dfa6d718": WEBPACK_IMPORTED_MODULE_0/* .__wbg_set_d9a07ec8dfa6d718 */ .o2,
			"__wbg_length_105270a016d90f0b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_length_105270a016d90f0b */ .BI,
			"__wbg_newwithbyteoffsetandlength_9ca61320599a2c84": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithbyteoffsetandlength_9ca61320599a2c84 */ .X5,
			"__wbg_new_97cf52648830a70d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_97cf52648830a70d */ .xe,
			"__wbg_set_a0172b213e2469e9": WEBPACK_IMPORTED_MODULE_0/* .__wbg_set_a0172b213e2469e9 */ .Rh,
			"__wbg_length_e09c0b925ab8de5d": WEBPACK_IMPORTED_MODULE_0/* .__wbg_length_e09c0b925ab8de5d */ .uV,
			"__wbg_newwithbyteoffsetandlength_ba29f3d9e79e44a3": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithbyteoffsetandlength_ba29f3d9e79e44a3 */ .a$,
			"__wbg_newwithbyteoffsetandlength_b0ff18b468a0d3f8": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithbyteoffsetandlength_b0ff18b468a0d3f8 */ .wR,
			"__wbg_new_b1a88e259d4a7dbc": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_b1a88e259d4a7dbc */ .rV,
			"__wbg_set_66067e08ab6cefb5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_set_66067e08ab6cefb5 */ .dP,
			"__wbg_length_211080f5c116c01f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_length_211080f5c116c01f */ .No,
			"__wbg_newwithlength_70aafc120ba58514": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithlength_70aafc120ba58514 */ .zV,
			"__wbg_newwithlength_59ac46af75034b95": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithlength_59ac46af75034b95 */ .z2,
			"__wbg_newwithlength_e833b89f9db02732": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithlength_e833b89f9db02732 */ .Nu,
			"__wbg_newwithlength_f28ac7a9191c7e26": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithlength_f28ac7a9191c7e26 */ .XP,
			"__wbg_subarray_a82b513315f16ea4": WEBPACK_IMPORTED_MODULE_0/* .__wbg_subarray_a82b513315f16ea4 */ .PW,
			"__wbg_set_b12cd0ab82903c2f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_set_b12cd0ab82903c2f */ .XN,
			"__wbg_parse_5b823b8686817eb8": WEBPACK_IMPORTED_MODULE_0/* .__wbg_parse_5b823b8686817eb8 */ .Cr,
			"__wbg_new_693216e109162396": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_693216e109162396 */ .Ih,
			"__wbg_stack_0ddaca5d1abfb52f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_stack_0ddaca5d1abfb52f */ .yq,
			"__wbg_error_09919627ac0992f5": WEBPACK_IMPORTED_MODULE_0/* .__wbg_error_09919627ac0992f5 */ .gk,
			"__wbindgen_debug_string": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_debug_string */ .fY,
			"__wbindgen_throw": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_throw */ .Or,
			"__wbindgen_memory": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_memory */ .oH,
			"__wbindgen_closure_wrapper1076": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_closure_wrapper1076 */ .Js,
			"__wbindgen_closure_wrapper1318": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_closure_wrapper1318 */ .c
		}
	});
	__webpack_async_result__();
	} catch(e) { __webpack_async_result__(e); }
}, 1);

/***/ })

}]);
//# sourceMappingURL=642.aladin.js.map