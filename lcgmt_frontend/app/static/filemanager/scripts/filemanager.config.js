/*---------------------------------------------------------
  Configuration
---------------------------------------------------------*/

// Set this to the server side language you wish to use.
var lang = 'py'; // options: lasso, php, py
// Set this to the directory you wish to manage.
var fileRoot = '/uploads/cms/';
// Show image previews in grid views?
var showThumbs = true;
var connector_path = '/cms/filemanager/';

if(null!=window.opener){
    if(typeof window.opener.filemanager_fileRoot !== 'undefined')
        fileRoot = window.opener.filemanager_fileRoot;
    if(typeof window.opener.filemanager_connector_path !== 'undefined')
        connector_path = window.opener.filemanager_connector_path;
    if(typeof window.opener.filemanager_showThumbs !== 'undefined')
        showThumbs = window.opener.filemanager_showThumbs;
    if(typeof window.opener.lang !== 'undefined')
        lang = window.opener.filemanager_lang;
}