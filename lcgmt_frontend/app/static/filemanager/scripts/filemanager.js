/*---------------------------------------------------------
  Setup, Layout, and Status Functions
---------------------------------------------------------*/

// Sets paths to connectors based on language selection.
if(connector_path != ""){
	var treeConnector = connector_path+'?mode=listdir';
	var fileConnector = connector_path;
}else{
    alert("无效目录")
	//var treeConnector = 'scripts/jquery.filetree/connectors/jqueryFileTree.' + lang;
	//var fileConnector = 'connectors/' + lang + '/filemanager.' + lang;
}

// Options for alert, prompt, and confirm dialogues.
$.SetImpromptuDefaults({
	overlayspeed: 'fast',
	show: 'fadeIn',
	opacity: 0.4
});

// Forces columns to fill the layout vertically.
// Called on initial page load and on resize.
var setDimensions = function(){
	var newH = $(window).height() - 100;
	$('#splitter, #filetree, #fileinfo, .vsplitbar').height(newH);
	var newW = $(window).width() - $('#filetree').width() - 20;
	$('#fileinfo').width(newW);
}

$('#home').click(function(){
    init_filetree();
    getFolderInfo(fileRoot);
});

// Sets the folder status, upload, and new folder functions 
// to the path specified. Called on initial page load and 
// whenever a new directory is selected.
var setUploader = function(path){
	$('#currentpath').val(path);
	$('#uploader h1').text('Current Folder: ' + path);

	$('#newfolder').unbind().click(function(){
		// var foldername = prompt('Enter the name of the new folder:', 'My Folder');
		var foldername = 'My Folder';
		var msg = 'Enter the name of the new folder: <input id="fname" name="fname" type="text" value="' + foldername + '" />';
		
		var getFolderName = function(v, m){
			if(v != 1) return false;		
			var fname = m.children('#fname').val();		

			if(fname != ''){
				foldername = fname;
				$.getJSON(fileConnector + '?mode=addfolder&path=' + $('#currentpath').val() + '&name=' + foldername, function(result){
					if(result['Code'] == 0){
						addFolder(result['Parent'], result['Name']);
						getFolderInfo(result['Parent']);
					} else {
						$.prompt(result['Error']);
					}				
				});
			} else {
				$.prompt('No folder name was provided.');
			}
		}
		
		$.prompt(msg, {
			callback: getFolderName,
			buttons: { 'Create Folder': 1, 'Cancel': 0 }
		});		
	});	
}

// Binds specific actions to the toolbar in detail views.
// Called when detail views are loaded.
var bindToolbar = function(data){
	// this little bit is purely cosmetic
	$('#fileinfo').find('button').wrapInner('<span></span>');

	$('#fileinfo').find('button#select').click(function(){
		selectItem(data);
	});

	$('#fileinfo').find('button#thumbnail').click(function(){
		setthumbnail(data);
	});
	
    $('#fileinfo').find('button#topimage').click(function(){
		settopimage(data);
	});

	$('#fileinfo').find('button#rename').click(function(){
		var newName = renameItem(data);
		if(newName.length) $('#fileinfo > h1').text(newName);
	});

	$('#fileinfo').find('button#delete').click(function(){
		if(deleteItem(data)) $('#fileinfo').html('<h1>Select an item from the left.</h1>');
	});
	
	$('#fileinfo').find('button#download').click(function(){
		window.location = data['Path'];
	});
}

// Converts bytes to kb, mb, or gb as needed for display.
var formatBytes = function(bytes){
	var n = parseFloat(bytes);
	var d = parseFloat(1024);
	var c = 0;
	var u = [' bytes','kb','mb','gb'];
	
	while(true){
		if(n < d){
			n = Math.round(n * 100) / 100;
			return n + u[c];
		} else {
			n /= d;
			c += 1;
		}
	}
}

// function to retrieve GET params
$.urlParam = function(name){
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if(null==results) return 0;
	return results[1] || 0;
}


/*---------------------------------------------------------
  Item Actions
---------------------------------------------------------*/

// Calls the SetUrl function for FCKEditor compatibility,
// passes file path, dimensions, and alt text back to the
// opening window. Triggered by clicking the "Select" 
// button in detail views or choosing the "Select"
// contextual menu option in list views. 
// NOTE: closes the window when finished.
var selectItem = function(data){
	if(window.opener){
		if($.urlParam('CKEditor')){
			// use CKEditor 3.0 integration method
			window.opener.CKEDITOR.tools.callFunction($.urlParam('CKEditorFuncNum'), data['Return']);
		} else {
		    var callback=$.urlParam('callback');
			// use FCKEditor 2.0 integration method
			if(data['Properties']['Width'] != ''){
				var p = data['Path'];
				var w = data['Properties']['Width'];
				var h = data['Properties']['Height'];			
				window.opener[callback](p,w,h);
			} else {
			    window.opener[callback](data['Path']);
			}
		}

		window.close();
	} else {
		$.prompt('The "Select" function is only used for integration with FCKEditor.');
	}
}

var  setthumbnail = function(data){
    var p = data['Path'];
    var w = data['Properties']['Width'];
    var h = data['Properties']['Height'];
    if(window.opener) {
           window.opener.setValue(p);
           window.close();
    }
    return p;

}
var settopimage = function(data){
    var p = data['Path'];
    var w = data['Properties']['Width'];
    var h = data['Properties']['Height'];

    if(window.opener) {
           window.opener.setValue(p);
           window.close();
    }
    return p;
}

// Renames the current item and returns the new name.
// Called by clicking the "Rename" button in detail views
// or choosing the "Rename" contextual menu option in 
// list views.
var renameItem = function(data){
	var finalName = '';
	var msg = 'Enter a new name for the file: <input id="rname" name="rname" type="text" value="' + data['Filename'] + '" />';

	var getNewName = function(v, m){
		if(v != 1) return false;
		rname = m.children('#rname').val();
		
		if(rname != ''){
			var givenName = rname;	
			var oldPath = data['Path'];	
			var connectString = fileConnector + '?mode=rename&old=' + data['Path'] + '&new=' + givenName;
		
			$.ajax({
				type: 'GET',
				url: connectString,
				dataType: 'json',
				async: false,
				success: function(result){
					if(result['Code'] == 0){
						var newPath = result['New Path'];
						var newName = result['New Name'];
	
						updateNode(oldPath, newPath, newName);
						
						if($('#fileinfo').data('view') == 'grid'){
							$('#fileinfo img[alt="' + oldPath + '"]').parent().next('p').text(newName);
							$('#fileinfo img[alt="' + oldPath + '"]').attr('alt', newPath);
						} else {
							$('#fileinfo td[title="' + oldPath + '"]').parent().text(newName);
							$('#fileinfo td[title="' + oldPath + '"]').attr('title', newPath);
						}
						$.prompt('Rename successful.');
					} else {
						$.prompt(result['Error']);
					}
					
					finalName = result['New Name'];		
				}
			});	
		}
	}
	
	$.prompt(msg, {
		callback: getNewName,
		buttons: { 'Rename': 1, 'Cancel': 0 }
	});
	
	return finalName;
}

// Prompts for confirmation, then deletes the current item.
// Called by clicking the "Delete" button in detail views
// or choosing the "Delete contextual menu item in list views.
var deleteItem = function(data){
	var isDeleted = false;
	var msg = 'Are you sure you wish to delete this file?';
	
	var doDelete = function(v, m){
		if(v != 1) return false;	
		var connectString = fileConnector + '?mode=delete&path=' + data['Path'];
	
		$.ajax({
			type: 'GET',
			url: connectString,
			dataType: 'json',
			async: false,
			success: function(result){
				if(result['Code'] == 0){
					removeNode(result['Path']);
					isDeleted = true;
					$.prompt('Delete successful.');
					var p =data.Path;
					var reload_path=p.substr(0, p.lastIndexOf('/', p.length-2))+'/';
					getFolderInfo(reload_path);//详细页重新加载当前目录
				} else {
					isDeleted = false;
					$.prompt(result['Error']);
				}			
			}
		});	
	}
	
	$.prompt(msg, {
		callback: doDelete,
		buttons: { 'Yes': 1, 'No': 0 }
	});
	
	return isDeleted;
}





/*---------------------------------------------------------
  Functions to Update the File Tree
---------------------------------------------------------*/

// Adds a new node as the first item beneath the specified
// parent node. Called after a successful file upload.
var addNode = function(path, name){
	var ext = name.substr(name.lastIndexOf('.') + 1);
	var thisNode = $('#filetree').find('a[rel="' + path + '"]');
	var parentNode = thisNode.parent();
	var newNode = '<li class="file ext_' + ext + '"><a rel="' + path + name + '/" href="#">' + name + '/</a></li>';
	
	if(!parentNode.find('ul').size()) parentNode.append('<ul></ul>');
	parentNode.find('ul').prepend(newNode);
	thisNode.click().click();

	getFolderInfo(path);

	$.prompt('New file added successfully.');
}

// Updates the specified node with a new name. Called after
// a successful rename operation.
var updateNode = function(oldPath, newPath, newName){
	var thisNode = $('#filetree').find('a[rel="' + oldPath + '"]');
	var parentNode = thisNode.parent().parent().prev('a');
	thisNode.attr('rel', newPath).text(newName);
	parentNode.click().click();
}

// Removes the specified node. Called after a successful 
// delete operation.
var removeNode = function(path){
//	$('#filetree').find('a[rel="' + path + '"]').parent().fadeOut('slow', function(){
//        $(this).remove();
//    });
    var thisNode = $('#filetree').find('a[rel="' + path + '"]');
	var parentNode = thisNode.parent().parent().prev('a');
	thisNode.remove();
	parentNode.click().click();
}

// Adds a new folder as the first item beneath the
// specified parent node. Called after a new folder is
// successfully created.
var addFolder = function(parent, name){
    $.prompt('New folder added successfully.');
    if(parent==fileRoot){
        init_filetree();
    }else{
        //var newNode = '<li class="directory collapsed"><a rel="' + parent + name + '/" href="#">' + name + '/</a><ul class="jqueryFileTree" style="display: block;"></ul></li>';
        var parentNode = $('#filetree').find('a[rel="' + parent + '"]');
        //parentNode.next('ul').prepend(newNode).prev('a').click().click();
        parentNode.click();
    }
}




/*---------------------------------------------------------
  Functions to Retrieve File and Folder Details
---------------------------------------------------------*/

// Decides whether to retrieve file or folder info based on
// the path provided.
var getDetailView = function(path){
	if(path.lastIndexOf('/') == path.length - 1){
		getFolderInfo(path);
		$('#filetree').find('a[rel="' + path + '"]').click();
	} else {
		getFileInfo(path);
	}
}

// Binds contextual menus to items in list and grid views.
var setMenus = function(action, path){
	$.getJSON(fileConnector + '?mode=getinfo&path=' + path, function(data){
		if($('#fileinfo').data('view') == 'grid'){
			var item = $('#fileinfo').find('img[alt="' + data['Path'] + '"]').parent();
		} else {
			var item = $('#fileinfo').find('td[title="' + data['Path'] + '"]').parent();
		}
	
		switch(action){
			case 'select':
				selectItem(data);
				break;
			
			case 'download':
				window.location = data['Path'];
				break;
				
			case 'rename':
				var newName = renameItem(data);
				break;
				
			case 'delete':
				// TODO: When selected, the file is deleted and the
				// file tree is updated, but the grid/list view is not.
				if(deleteItem(data)) item.fadeOut('slow', function(){
				    $(this).remove();
				});
				break;
		}
	});
}

// Retrieves information about the specified file as a JSON
// object and uses that data to populate a template for
// detail views. Binds the toolbar for that detail view to
// enable specific actions. Called whenever an item is
// clicked in the file tree or list views.
var getFileInfo = function(file){
	// Update location for status, upload, & new folder functions.
	var currentpath = file.substr(0, file.lastIndexOf('/') + 1);
	setUploader(currentpath);
	// Include the template.
	var template = '<div id="preview"><img /><h1></h1><dl></dl></div>';
	template += '<form id="toolbar">';
	template += '<button id="select" name="select" type="button" value="Select">Select</button>';
	//template +=  '<button id="thumbnail" name="thumbnail" type="button" value="thumbnail">Set as Thumbnail</button>';
	//template +=  '<button id="topimage" name="topimage" type="button" value="thumbnail">Set as Top Image</button>';
	template += '<button id="download" name="download" type="button" value="Download">Download</button>';
	template += '<button id="rename" name="rename" type="button" value="Rename">Rename</button>';
	template += '<button id="delete" name="delete" type="button" value="Delete">Delete</button>';
	template += '</form>';
	
	$('#fileinfo').html(template);
	
	// Retrieve the data & populate the template.
	$.getJSON(fileConnector + '?mode=getinfo&path=' + file, function(data){
                
		if(data['Code'] == 0){
			$('#fileinfo').find('h1').text(data['Filename']);
			$('#fileinfo').find('img').attr('src',data['Preview']);

			if(data['File Type'] == "Directory"){
				$('#download').css("display", "none");
				//$('#delete').css("display", "none");
				$('#select').css("display", "none");
				$('#thumbnail').css("display", "none");
			}else{
				$('#download').css("display", "inline");
				//$('#delete').css("display", "inline");
				$('#select').css("display", "inline");
				$('#thumbnail').css("display", "inline");
			}

			var properties = '';
			
			if(data['Properties']['Width'] && data['Properties']['Width'] != '') properties += '<dt>Dimensions</dt><dd>' + data['Properties']['Width'] + 'x' + data['Properties']['Height'] + '</dd>';
			if(data['Properties']['Date Created'] && data['Properties']['Date Created'] != '') properties += '<dt>Created</dt><dd>' + data['Properties']['Date Created'] + '</dd>';
			if(data['Properties']['Date Modified'] && data['Properties']['Date Modified'] != '') properties += '<dt>Modified</dt><dd>' + data['Properties']['Date Modified'] + '</dd>';
			if(data['Properties']['Size'] && data['Properties']['Size'] != '') properties += '<dt>Size</dt><dd>' + formatBytes(data['Properties']['Size']) + '</dd>';
			
			$('#fileinfo').find('dl').html(properties);
			
			// Bind toolbar functions.
			bindToolbar(data);
		} else {
			$.prompt(data['Error']);
		}
	});	
}

// Retrieves data for all items within the given folder and
// creates a list view. Binds contextual menu options.
// TODO: consider stylesheet switching to switch between grid
// and list views with sorting options.
var getFolderInfo = function(path){
	// Update location for status, upload, & new folder functions.
	setUploader(path);

	// Display an activity indicator.
	$('#fileinfo').html('<img id="activity" src="images/wait30trans.gif" width="30" height="30" />');

	// Retrieve the data and generate the markup.
    url = fileConnector + '?path=' + path + '&mode=getfolder&showThumbs=' + showThumbs
	$.getJSON(url, function(data){		
		var result = '';
		if(data){	
			if($('#fileinfo').data('view') == 'grid'){
				result += '<ul id="contents" class="grid">';
				
				for(key in data){
					
					var props = data[key]['Properties'];
					
					var scaledWidth = 64;
					var actualWidth = props['Width'];
					if(actualWidth > 1 && actualWidth < scaledWidth) scaledWidth = actualWidth;
					
					result += '<li><div class="clip"><img src="' + data[key]['Preview'] + '" width="' + scaledWidth + '" alt="' + data[key]['Path'] + '" /></div><p>' + data[key]['Filename'] + '</p>';
                                        
					if(props['Width'] && props['Width'] != '') result += '<span class="meta dimensions">' + props['Width'] + 'x' + props['Height'] + '</span><br />';
					if(props['Size'] && props['Size'] != '') result += '<span class="meta size">' + props['Size'] + '</span><br />';
					if(props['Date Created'] && props['Date Created'] != '') result += '<span class="meta created">' + props['Date Created'] + '</span><br />';
					if(props['Date Modified'] && props['Date Modified'] != '') result += '<span class="meta modified">' + props['Date Modified'] + '</span>';
					result += '</li>';
				}
				
				result += '</ul>';
			} else {
				result += '<table id="contents" class="list">';
				result += '<thead><tr><th class="headerSortDown"><span>Name</span></th><th><span>Dimensions</span></th><th><span>Size</span></th><th><span>Modified</span></th></tr></thead>';
				result += '<tbody>';
				
				for(key in data){
					var path = data[key]['Path'];
					var props = data[key]['Properties'];					
					result += '<tr>';
					result += '<td title="' + path + '">' + data[key]['Filename'] + '</td>';

					if(props['Width'] && props['Width'] != ''){
						result += ('<td>' + props['Width'] + 'x' + props['Height'] + '</td>');
					} else {
						result += '<td></td>';
					}
					
					if(props['Size'] && props['Size'] != ''){
						result += '<td><abbr title="' + props['Size'] + '">' + formatBytes(props['Size']) + '</abbr></td>';
					} else {
						result += '<td></td>';
					}
					
					if(props['Date Modified'] && props['Date Modified'] != ''){
						result += '<td>' + props['Date Modified'] + '</td>';
					} else {
						result += '<td></td>';
					}
				
					result += '</tr>';					
				}
								
				result += '</tbody>';
				result += '</table>';
			}			
		} else {
			result += '<h1>Could not retrieve folder contents.</h1>';
		}
		
		// Add the new markup to the DOM.
		$('#fileinfo').html(result);
		
		// Bind click events to create detail views and add
		// contextual menu options.
		if($('#fileinfo').data('view') == 'grid'){
			$('#fileinfo').find('#contents li').click(function(){
				var path = $(this).find('img').attr('alt');
				getDetailView(path);
			}).contextMenu({ menu: 'itemOptions' }, function(action, el, pos){
				var path = $(el).find('img').attr('alt');
				setMenus(action, path);
			});
		} else {
			$('#fileinfo').find('td:first-child').each(function(){
				var path = $(this).attr('title');
				var treenode = $('#filetree').find('a[rel="' + path + '"]').parent();
				$(this).css('background-image', treenode.css('background-image'));
			});
			
			$('#fileinfo tbody tr').click(function(){
				var path = $('td:first-child', this).attr('title');
				getDetailView(path);		
			}).contextMenu({ menu: 'itemOptions' }, function(action, el, pos){
				var path = $('td:first-child', el).attr('title');
				setMenus(action, path);
			});
			
			$('#fileinfo').find('table').tablesorter({
				textExtraction: function(node){					
					if($(node).find('abbr').size()){
						return $(node).find('abbr').attr('title');
					} else {					
						return node.innerHTML;
					}
				}
			});
		}
	});
}





/*---------------------------------------------------------
  Initialization
---------------------------------------------------------*/
function init_filetree(){
	// Creates file tree.
    $('#filetree').fileTree({
		root: fileRoot,
		script: treeConnector,
		multiFolder: false,
		folderCallback: function(path){
		    getFolderInfo(path);
		},
		after: function(data){
		    /*
			$('#filetree').find('li a').contextMenu(
				{ menu: 'itemOptions' },
				function(action, el, pos){
					var path = $(el).attr('rel');
					setMenus(action, path);
				}
			);
			*/
		}
	}, function(file){
		getFileInfo(file);
	});
}
$(function(){
    //$('#home').attr('rel', fileRoot);
    $('#home').text(fileRoot);
    $('#upload').change(function(){
        $('#uploader').submit();
    });
    $('#upload_dis').click(function(){
        $('#upload').click();
    });
	// Adjust layout.
	setDimensions();
	$(window).resize(setDimensions);

	// Provides support for adjustible columns.
	$('#splitter').splitter({
		initA: 200
	});

	// cosmetic tweak for buttons
	$('button').wrapInner('<span></span>');

	// Set initial view state.
	$('#fileinfo').data('view', 'grid');
	// Set buttons to switch between grid and list views.
	$('#grid').click(function(){
		$(this).addClass('ON');
		$('#list').removeClass('ON');
		$('#fileinfo').data('view', 'grid');
		getFolderInfo($('#currentpath').val());
	});
	
	$('#list').click(function(){
		$(this).addClass('ON');
		$('#grid').removeClass('ON');
		$('#fileinfo').data('view', 'list');
		getFolderInfo($('#currentpath').val());
	});

	// Provide initial values for upload form, status, etc.
	setUploader(fileRoot);
	getFolderInfo(fileRoot);
	$('#uploader').attr('action', fileConnector);
	$('#uploader').ajaxForm({
		target: '#uploadresponse',
		success: function(result){
			eval('var data = ' + $('#uploadresponse').text());

			if(data['Code'] == 0){
				// addNode(data['Path'], data['Name']);
				getFolderInfo(data['Path']);
			} else {
				$.prompt(data['Error']);
			}
		}
	});
	init_filetree();
});
