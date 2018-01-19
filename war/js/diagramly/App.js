/**
 * Copyright (c) 2006-2018, JGraph Ltd
 * Copyright (c) 2006-2018, Gaudenz Alder
 */
/**
 * Constructs a new point for the optional x and y coordinates. If no
 * coordinates are given, then the default values for <x> and <y> are used.
 * @constructor
 * @class Implements a basic 2D point. Known subclassers = {@link mxRectangle}.
 * @param {number} x X-coordinate of the point.
 * @param {number} y Y-coordinate of the point.
 */
App = function(editor, container, lightbox)
{
	EditorUi.call(this, editor, container, (lightbox != null) ? lightbox : urlParams['lightbox'] == '1');

	// Pre-fetches images
	if (mxClient.IS_SVG)
	{
		mxGraph.prototype.warningImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAE7SURBVHjaYvz//z8DJQAggBjwGXDuHMP/tWuD/uPTCxBAOA0AaQRK/f/+XeJ/cbHlf1wGAAQQTgPu3QNLgfHSpZo4DQAIIKwGwGyH4e/fFbG6AiQJEEAs2Ew2NFzH8OOHBMO6dT/A/KCg7wxGRh+wuhQggDBcALMdFIAcHBxgDGJjcwVIIUAAYbhAUXEdVos4OO4DXcGBIQ4QQCguQPY7sgtgAYruCpAgQACx4LJdU1OCwctLEcyWlLwPJF+AXQE0EMUBAAEEdwF6yMOiD4RRY0QT7gqQAEAAseDzu6XldYYPH9DD4joQa8L5AAEENgWb7SBcXa0JDQMBrK4AcQACiAlfyOMCEFdAnAYQQEz4FLa0XGf4/v0H0IIPONUABBAjyBmMjIwMS5cK/L927QORbtBkaG29DtYLEGAAH6f7oq3Zc+kAAAAASUVORK5CYII=';
	}
	else
	{
		var img = new Image();
		img.src = mxGraph.prototype.warningImage.src;
	}
	
	// Global helper method to deal with popup blockers
	window.openWindow = mxUtils.bind(this, function(url, pre, fallback)
	{
		var wnd = null;
		
		try
		{
			wnd = window.open(url);
		}
		catch (e)
		{
			// ignore
		}
		
		if (wnd == null || wnd === undefined)
		{
			this.showDialog(new PopupDialog(this, url, pre, fallback).container, 320, 140, true, true);
		}
		else if (pre != null)
		{
			pre();
		}
	});
	
	// Initial state for toolbar items is disabled
	this.updateDocumentTitle();
	this.updateUi();

	// Global helper method to display error messages
	window.showOpenAlert = mxUtils.bind(this, function(message)
	{
		// Cancel must be called before showing error message
		if (window.openFile != null)
		{
			window.openFile.cancel(true);
		}
		
		this.handleError(message);
	});
	
	// Sets help link for placeholders
	if (!this.isOffline())
	{
		EditDataDialog.placeholderHelpLink = 'https://desk.draw.io/support/solutions/articles/16000051979';
	}

	// Handles opening files via drag and drop
	if (!this.editor.chromeless || this.editor.editable)
	{
		this.addFileDropHandler([document]);
	}
	
	// Process the queue for waiting plugins
	if (App.DrawPlugins != null)
	{
		for (var i = 0; i < App.DrawPlugins.length; i++)
		{
			try
			{
				App.DrawPlugins[i](this);
			}
			catch (e)
			{
				if (window.console != null)
				{
					console.log('Plugin Error:', e, App.DrawPlugins[i]);
				}
			}
		}
		
		// Installs global callback for plugins
		window.Draw.loadPlugin = mxUtils.bind(this, function(callback)
		{
			callback(this);
		});
	}

	this.load();
};

/**
 * Executes the first step for connecting to Google Drive.
 */
App.ERROR_TIMEOUT = 'timeout';

/**
 * Executes the first step for connecting to Google Drive.
 */
App.ERROR_BUSY = 'busy';

/**
 * Executes the first step for connecting to Google Drive.
 */
App.ERROR_UNKNOWN = 'unknown';

/**
 * Sets the delay for autosave in milliseconds. Default is 2000.
 */
App.MODE_GOOGLE = 'google';

/**
 * Sets the delay for autosave in milliseconds. Default is 2000.
 */
App.MODE_DROPBOX = 'dropbox';

/**
 * Sets the delay for autosave in milliseconds. Default is 2000.
 */
App.MODE_ONEDRIVE = 'onedrive';

/**
 * Sets the delay for autosave in milliseconds. Default is 2000.
 */
App.MODE_GITHUB = 'github';

/**
 * Sets the delay for autosave in milliseconds. Default is 2000.
 */
App.MODE_DEVICE = 'device';

/**
 * Sets the delay for autosave in milliseconds. Default is 2000.
 */
App.MODE_BROWSER = 'browser';

/**
 * Trello App Mode
 */
App.MODE_TRELLO = 'trello';

/**
 * Sets the delay for autosave in milliseconds. Default is 2000.
 */
App.DROPBOX_APPKEY = 'libwls2fa9szdji';

/**
 * Sets URL to load the Dropbox SDK from
 */
App.DROPBOX_URL = 'https://unpkg.com/dropbox/dist/Dropbox-sdk.min.js';

/**
 * Sets the delay for autosave in milliseconds. Default is 2000.
 * cease it ,Lyn  2018-1-9 13:54:05
 */
//App.DROPINS_URL = 'https://www.dropbox.com/static/api/2/dropins.js';

/**
 * Sets the delay for autosave in milliseconds. Default is 2000.
 */
App.ONEDRIVE_URL = 'https://js.live.net/v7.2/OneDrive.js';

/**
 * Trello URL
 */
App.TRELLO_URL = 'https://api.trello.com/1/client.js';

/**
 * Trello JQuery dependency
 */
App.TRELLO_JQUERY_URL = 'https://code.jquery.com/jquery-1.7.1.min.js';

/**
 * Trello JQuery dependency
 */
App.FOOTER_PLUGIN_URL = 'https://www.jgraph.com/drawio-footer.js';

/**
 * Defines plugin IDs for loading via p URL parameter. Update the table at
 * https://desk.draw.io/solution/articles/16000042546
 */
App.pluginRegistry = {'4xAKTrabTpTzahoLthkwPNUn': '/plugins/explore.js',
	'ex': '/plugins/explore.js', 'p1': '/plugins/p1.js', 'ac': '/plugins/connect.js',
	'acj': '/plugins/connectJira.js', 'voice': '/plugins/voice.js',
	'tips': '/plugins/tooltips.js', 'svgdata': '/plugins/svgdata.js',
	'doors': '/plugins/doors.js', 'electron': 'plugins/electron.js',
	'number': '/plugins/number.js', 'sql': '/plugins/sql.js',
	'props': '/plugins/props.js', 'text': '/plugins/text.js',
	'anim': '/plugins/animation.js', 'update': '/plugins/update.js',
	'trees': '/plugins/trees/trees.js', 'import': '/plugins/import.js',
	'replay': '/plugins/replay.js', 'anon': '/plugins/anonymize.js',
	'tr': '/plugins/trello.js'};

/**
 * Function: authorize
 * 
 * Authorizes the client, gets the userId and calls <open>.
 */
App.getStoredMode = function()
{
	var mode = null;
	
	if (mode == null && isLocalStorage)
	{
		mode = localStorage.getItem('.mode');
	}
	
	if (mode == null && typeof(Storage) != 'undefined')
	{
		var cookies = document.cookie.split(";");
		
		for (var i = 0; i < cookies.length; i++)
		{
			// Removes spaces around cookie
			var cookie = mxUtils.trim(cookies[i]);
			
			if (cookie.substring(0, 5) == 'MODE=')
			{
				mode = cookie.substring(5);
				break;
			}
		}
		
		if (mode != null && isLocalStorage)
		{
			// Moves to local storage
			var expiry = new Date();
			expiry.setYear(expiry.getFullYear() - 1);
			document.cookie = 'MODE=; expires=' + expiry.toUTCString();
			localStorage.setItem('.mode', mode);
		}
	}
	
	return mode;
};

/**
 * Static Application initializer executed at load-time.
 */
(function()
{
	if (!mxClient.IS_CHROMEAPP)
	{
		if (urlParams['offline'] != '1')
		{
			// Switches to dropbox mode for db.draw.io
			if (window.location.hostname == 'db.draw.io' && urlParams['mode'] == null)
			{
				urlParams['mode'] = 'dropbox';
			}
			
			App.mode = urlParams['mode'];
			
			if (App.mode == null)
			{
				// Stored mode overrides preferred mode
				App.mode = App.getStoredMode();
			}
		}

		/**
		 * Lazy loading backends.
		 */
		if (window.mxscript != null)
		{
			// Loads gapi for all browsers but IE8 and below if not disabled or if enabled and in embed mode
			if (urlParams['embed'] != '1')
			{
				if (typeof window.DriveClient === 'function')
				{
					if (urlParams['gapi'] != '0' && isSvgBrowser &&
						(document.documentMode == null || document.documentMode >= 10))
					{
						// Immediately loads client
						if (App.mode == App.MODE_GOOGLE || (urlParams['state'] != null &&
							window.location.hash == '') || (window.location.hash != null &&
							window.location.hash.substring(0, 2) == '#G'))
						{
							mxscript('https://apis.google.com/js/api.js');
						}
						// Keeps lazy loading for fallback to authenticated Google file if not public in loadFile
						else if (urlParams['chrome'] == '0' && (window.location.hash == null ||
							window.location.hash.substring(0, 45) !== '#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D'))
						{
							// Disables loading of client
							window.DriveClient = null;
						}
					}
					else
					{
						// Disables loading of client
						window.DriveClient = null;
					}
				}
	
				// Loads dropbox for all browsers but IE8 and below (no CORS) if not disabled or if enabled and in embed mode
				// KNOWN: Picker does not work in IE11 (https://dropbox.zendesk.com/requests/1650781)
				if (typeof window.DropboxClient === 'function')
				{
					if (urlParams['db'] != '0' && isSvgBrowser &&
						(document.documentMode == null || document.documentMode > 9))
					{
						// Immediately loads client
						if (App.mode == App.MODE_DROPBOX || (window.location.hash != null &&
							window.location.hash.substring(0, 2) == '#D'))
						{
							/**Lyn  2018-1-9 11:38:08*/
							//mxscript(App.DROPBOX_URL);
							
							// Must load this after the dropbox SDK since they use the same namespace
							//mxscript(App.DROPINS_URL, null, 'dropboxjs', App.DROPBOX_APPKEY);
						}
						else if (urlParams['chrome'] == '0')
						{
							window.DropboxClient = null;
						}
					}
					else
					{
						// Disables loading of client
						window.DropboxClient = null;
					}
				}
				
				// Loads OneDrive for all browsers but IE6/IOS if not disabled or if enabled and in embed mode
				if (typeof window.OneDriveClient === 'function')
				{
					if (urlParams['od'] != '0' && (navigator.userAgent.indexOf('MSIE') < 0 || document.documentMode >= 10))
					{
						// Immediately loads client
						if (App.mode == App.MODE_ONEDRIVE || (window.location.hash != null &&
							window.location.hash.substring(0, 2) == '#W'))
						{
							mxscript(App.ONEDRIVE_URL);
						}
						else if (urlParams['chrome'] == '0')
						{
							window.OneDriveClient = null;
						}
					}
					else
					{
						// Disables loading of client
						window.OneDriveClient = null;
					}
				}
				
				// Loads Trello for all browsers but < IE10 if not disabled or if enabled and in embed mode
				if (typeof window.TrelloClient === 'function')
				{
					if (urlParams['tr'] != '0' && isSvgBrowser &&
							(document.documentMode == null || document.documentMode >= 10))
					{
						// Immediately loads client
						if (App.mode == App.MODE_TRELLO || (window.location.hash != null &&
							window.location.hash.substring(0, 2) == '#T'))
						{
							mxscript(App.TRELLO_JQUERY_URL);
							mxscript(App.TRELLO_URL);
						}
						else if (urlParams['chrome'] == '0')
						{
							window.TrelloClient = null;
						}
					}
					else
					{
						// Disables loading of client
						window.TrelloClient = null;
					}
				}
			}
			
			// Loads JSON for older browsers
			if (typeof(JSON) == 'undefined')
			{
				mxscript('js/json/json2.min.js');
			}
		}
	}
})();

/**
 * Program flow starts here.
 * 
 * Optional callback is called with the app instance.
 */
App.main = function(callback, createUi)
{
	var lastErrorMessage = null;
	
	// Changes top level error handling
	if (EditorUi.enableLogging)
	{
		window.onerror = function(message, url, linenumber, colno, err)
		{
			try
			{
				if (message == lastErrorMessage || (message != null && url != null &&
					((message.indexOf('Script error') != -1) || (message.indexOf('extension') != -1))))
				{
					// TODO log external domain script failure "Script error." is
					// reported when the error occurs in a script that is hosted
					// on a domain other than the domain of the current page
				}
				// DocumentClosedError seems to be an FF bug an can be ignored for now
				else if (message != null && message.indexOf('DocumentClosedError') < 0)
				{
					lastErrorMessage = message;
					var img = new Image();
					var severity = (message.indexOf('NetworkError') >= 0 || message.indexOf('SecurityError') >= 0 ||
						message.indexOf('NS_ERROR_FAILURE') >= 0 || message.indexOf('out of memory') >= 0) ?
						'CONFIG' : 'SEVERE';
					var logDomain = window.DRAWIO_LOG_URL != null ? window.DRAWIO_LOG_URL : '';
			    		img.src = logDomain + '/log?severity=' + severity + '&v=' + encodeURIComponent(EditorUi.VERSION) +
			    			'&msg=clientError:' + encodeURIComponent(message) + ':url:' + encodeURIComponent(window.location.href) +
			    			':lnum:' + encodeURIComponent(linenumber) + 
			    			((colno != null) ? ':colno:' + encodeURIComponent(colno) : '') +
			    			((err != null && err.stack != null) ? '&stack=' + encodeURIComponent(err.stack) : '');
				}
			}
			catch (err)
			{
				// do nothing
			}
		};
	}

	/**
	 * Lazy loading of additional CSS for atlas theme.
	 */
	if (uiTheme == 'atlas')
	{
		mxClient.link('stylesheet', 'styles/atlas.css');
	}
	
	if (window.mxscript != null)
	{
		/**
		 * Injects offline dependencies
		 */
		if (urlParams['offline'] == '1')
		{
			mxscript('js/shapes.min.js');
			
			var frame = document.createElement('iframe');
			frame.setAttribute('width', '0');
			frame.setAttribute('height', '0');
			frame.setAttribute('src', 'offline.html');
			document.body.appendChild(frame);
		}
		
		/**
		 * Loading plugins.
		 */
		if (urlParams['plugins'] != '0' && urlParams['offline'] != '1')
		{
			var plugins = mxSettings.getPlugins();
			var temp = urlParams['p'];
			App.initPluginCallback();

			if (temp != null)
			{
				// Used to request draw.io sources in dev mode
				var drawDevUrl = '';

				if (urlParams['drawdev'] == '1')
				{
					drawDevUrl = document.location.protocol + '//drawhost.jgraph.com/';
				}
				
				// Mapping from key to URL in App.plugins
				var t = temp.split(';');
				
				for (var i = 0; i < t.length; i++)
				{
					var url = App.pluginRegistry[t[i]];
					
					if (url != null)
					{
						mxscript(drawDevUrl + url);
					}
					else if (window.console != null)
					{
						console.log('Unknown plugin:', t[i]);
					}
				}
			}
			else if (urlParams['chrome'] != '0' && !EditorUi.isElectronApp)
			{
				//mxscript(App.FOOTER_PLUGIN_URL);
			}
			
			if (plugins != null && plugins.length > 0 && urlParams['plugins'] != '0')
			{
				// Loading plugins inside the asynchronous block below stops the page from loading so a 
				// hardcoded message for the warning dialog is used since the resources are loadd below
				var warning = 'The page has requested to load the following plugin(s):\n \n {1}\n \n Would you like to load these plugin(s) now?\n \n NOTE : Only allow plugins to run if you fully understand the security implications of doing so.\n';
				var tmp = window.location.protocol + '//' + window.location.host;
				var local = true;
				
				for (var i = 0; i < plugins.length && local; i++)
				{
					if (plugins[i].charAt(0) != '/' && plugins[i].substring(0, tmp.length) != tmp)
					{
						local = false;
					}
				}
				
				if (local || mxUtils.confirm(mxResources.replacePlaceholders(warning, [plugins.join('\n')]).replace(/\\n/g, '\n')))
				{
					for (var i = 0; i < plugins.length; i++)
					{
						try
						{
							mxscript(plugins[i]);
						}
						catch (e)
						{
							// ignore
						}
					}
				}
			}
		}
		
		// Loads gapi for all browsers but IE8 and below if not disabled or if enabled and in embed mode
		// Special case: Cannot load in asynchronous code below
		if (typeof window.DriveClient === 'function' &&
			(typeof gapi === 'undefined' && (((urlParams['embed'] != '1' && urlParams['gapi'] != '0') ||
			(urlParams['embed'] == '1' && urlParams['gapi'] == '1')) && isSvgBrowser &&
			isLocalStorage && (document.documentMode == null || document.documentMode >= 10))))
		{
			/**Lyn  2018-1-9 11:35:06*/
			//mxscript('https://apis.google.com/js/api.js?onload=DrawGapiClientCallback');
		}
		// Disables client
		else if (typeof window.gapi === 'undefined')
		{
			window.DriveClient = null;
		}
	}
	
	/**
	 * Asynchronous MathJax extension.
	 */
	if (urlParams['math'] != '0')
	{
		Editor.initMath();
	}

	// Adds required resources (disables loading of fallback properties, this can only
	// be used if we know that all keys are defined in the language specific file)
	mxResources.loadDefaultBundle = false;
	var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) ||
		mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

	// Prefetches asynchronous requests so that below code runs synchronous
	// Loading the correct bundle (one file) via the fallback system in mxResources. The stylesheet
	// is compiled into JS in the build process and is only needed for local development.
	mxUtils.getAll((urlParams['dev'] != '1') ? [bundle] : [bundle, STYLE_PATH + '/default.xml'], function(xhr)
	{
		// Adds bundle text to resources
		mxResources.parse(xhr[0].getText());
		
		// Prepares themes with mapping from old default-style to old XML file
		if (xhr.length > 1)
		{
 			Graph.prototype.defaultThemes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();
		}

		// Main
		var ui = (createUi != null) ? createUi() : new App(new Editor(urlParams['chrome'] == '0'));
        /**
		 * 离线版不需要加载，注释掉。  gsx on 201801161536
         */
		/*if (window.mxscript != null)
		{
			// Loads dropbox for all browsers but IE8 and below (no CORS) if not disabled or if enabled and in embed mode
			// KNOWN: Picker does not work in IE11 (https://dropbox.zendesk.com/requests/1650781)
			if (typeof window.DropboxClient === 'function' &&
				(window.Dropbox == null && window.DrawDropboxClientCallback != null &&
				(((urlParams['embed'] != '1' && urlParams['db'] != '0') ||
				(urlParams['embed'] == '1' && urlParams['db'] == '1')) &&
				isSvgBrowser && (document.documentMode == null || document.documentMode > 9))))
			{
				/!**Lyn 2018-1-9 13:48:13*!/
				/!*mxscript(App.DROPBOX_URL, function()
				{
					// Must load this after the dropbox SDK since they use the same namespace
					//mxscript(App.DROPINS_URL, function()
					{
						//DrawDropboxClientCallback();
					}, 'dropboxjs', App.DROPBOX_APPKEY);
				});*!/
			}
			// Disables client
			else if (typeof window.Dropbox === 'undefined' || typeof window.Dropbox.choose === 'undefined')
			{
				window.DropboxClient = null;
			}
				
			// Loads OneDrive for all browsers but IE6/IOS if not disabled or if enabled and in embed mode
			if (typeof window.OneDriveClient === 'function' &&
				(typeof OneDrive === 'undefined' && window.DrawOneDriveClientCallback != null &&
				(((urlParams['embed'] != '1' && urlParams['od'] != '0') || (urlParams['embed'] == '1' &&
				urlParams['od'] == '1')) && (navigator.userAgent.indexOf('MSIE') < 0 || document.documentMode >= 10))))
			{
				mxscript(App.ONEDRIVE_URL, window.DrawOneDriveClientCallback);
			}
			// Disables client
			else if (typeof window.OneDrive === 'undefined')
			{
				window.OneDriveClient = null;
			}
			
			// Loads Trello for all browsers but < IE10 if not disabled or if enabled and in embed mode
			if (typeof window.TrelloClient === 'function' &&
				(typeof window.Trello === 'undefined' && window.DrawTrelloClientCallback != null &&
				(((urlParams['embed'] != '1' && urlParams['tr'] != '0') || (urlParams['embed'] == '1' &&
				urlParams['tr'] == '1')) && (navigator.userAgent.indexOf('MSIE') < 0 || document.documentMode >= 10))))
			{
				mxscript(App.TRELLO_JQUERY_URL, function()
				{
					// Must load this after the dropbox SDK since they use the same namespace
					mxscript(App.TRELLO_URL, function()
					{
						DrawTrelloClientCallback();
					});
				});
			}
			// Disables client
			else if (typeof window.Trello === 'undefined')
			{
				window.TrelloClient = null;
			}

		}*/
		
		if (callback != null)
		{
			callback(ui);
		}
		
		/**
		 * For developers only
		 */
		if (urlParams['chrome'] != '0' && urlParams['test'] == '1')
		{
			mxLog.show();
			mxLog.debug('Started in ' + (new Date().getTime() - t0.getTime()) + 'ms');
			mxLog.debug('Export:', EXPORT_URL);
			mxLog.debug('Development mode:', (urlParams['dev'] == '1') ? 'active' : 'inactive');
			mxLog.debug('Test mode:', (urlParams['test'] == '1') ? 'active' : 'inactive');
		}
	}, function()
	{
		document.getElementById('geStatus').innerHTML = 'Error loading page. <a href="javascript:void(0);" onclick="location.reload();">Please try refreshing.</a>';
	});
};

//Extends EditorUi
mxUtils.extend(App, EditorUi);

/**
 * Executes the first step for connecting to Google Drive.
 */
App.prototype.defaultUserPicture = 'https://lh3.googleusercontent.com/-HIzvXUy6QUY/AAAAAAAAAAI/AAAAAAAAAAA/giuR7PQyjEk/photo.jpg?sz=30';

/**
 * 
 */
App.prototype.shareImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowOTgwMTE3NDA3MjA2ODExODhDNkFGMDBEQkQ0RTgwOSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxMjU2NzdEMTcwRDIxMUUxQjc0MDkxRDhCNUQzOEFGRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxMjU2NzdEMDcwRDIxMUUxQjc0MDkxRDhCNUQzOEFGRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowNjgwMTE3NDA3MjA2ODExODcxRkM4MUY1OTFDMjQ5OCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowNzgwMTE3NDA3MjA2ODExODhDNkFGMDBEQkQ0RTgwOSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrM/fs0AAADgSURBVHjaYmDAA/7//88MwgzkAKDGFiD+BsQ/QWxSNaf9RwN37twpI8WAS+gGfP78+RpQSoRYA36iG/D379+vQClNdLVMOMz4gi7w79+/n0CKg1gD9qELvH379hzIHGK9oA508ieY8//8+fO5rq4uFCilRKwL1JmYmNhhHEZGRiZ+fn6Q2meEbDYG4u3/cYCfP38uA7kOm0ZOIJ7zn0jw48ePPiDFhmzArv8kgi9fvuwB+w5qwH9ykjswbFSZyM4sEMDPBDTlL5BxkFSd7969OwZ2BZKYGhDzkmjOJ4AAAwBhpRqGnEFb8QAAAABJRU5ErkJggg==';

/**
 *
 */
App.prototype.chevronUpImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/chevron-up.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDg2NEE3NUY1MUVBMTFFM0I3MUVEMTc0N0YyOUI4QzEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDg2NEE3NjA1MUVBMTFFM0I3MUVEMTc0N0YyOUI4QzEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0ODY0QTc1RDUxRUExMUUzQjcxRUQxNzQ3RjI5QjhDMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0ODY0QTc1RTUxRUExMUUzQjcxRUQxNzQ3RjI5QjhDMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pg+qUokAAAAMUExURQAAANnZ2b+/v////5bgre4AAAAEdFJOU////wBAKqn0AAAAL0lEQVR42mJgRgMMRAswMKAKMDDARBjg8lARBoR6KImkH0wTbygT6YaS4DmAAAMAYPkClOEDDD0AAAAASUVORK5CYII=';

/**
 *
 */
App.prototype.chevronDownImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/chevron-down.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDg2NEE3NUI1MUVBMTFFM0I3MUVEMTc0N0YyOUI4QzEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDg2NEE3NUM1MUVBMTFFM0I3MUVEMTc0N0YyOUI4QzEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0ODY0QTc1OTUxRUExMUUzQjcxRUQxNzQ3RjI5QjhDMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0ODY0QTc1QTUxRUExMUUzQjcxRUQxNzQ3RjI5QjhDMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsCtve8AAAAMUExURQAAANnZ2b+/v////5bgre4AAAAEdFJOU////wBAKqn0AAAALUlEQVR42mJgRgMMRAkwQEXBNAOcBSPhclB1cNVwfcxI+vEZykSpoSR6DiDAAF23ApT99bZ+AAAAAElFTkSuQmCC';

/**
 *
 */
App.prototype.formatShowImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/format-show.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODdCREY5REY1NkQ3MTFFNTkyNjNEMTA5NjgwODUyRTgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODdCREY5RTA1NkQ3MTFFNTkyNjNEMTA5NjgwODUyRTgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4N0JERjlERDU2RDcxMUU1OTI2M0QxMDk2ODA4NTJFOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4N0JERjlERTU2RDcxMUU1OTI2M0QxMDk2ODA4NTJFOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PlnMQ/8AAAAJUExURQAAAP///3FxcTfTiAsAAAACdFJOU/8A5bcwSgAAACFJREFUeNpiYEQDDEQJMMABTAAixcQ00ALoDiPRcwABBgB6DADly9Yx8wAAAABJRU5ErkJggg==';

/**
 *
 */
App.prototype.formatHideImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/format-hide.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODdCREY5REI1NkQ3MTFFNTkyNjNEMTA5NjgwODUyRTgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODdCREY5REM1NkQ3MTFFNTkyNjNEMTA5NjgwODUyRTgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4N0JERjlEOTU2RDcxMUU1OTI2M0QxMDk2ODA4NTJFOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4N0JERjlEQTU2RDcxMUU1OTI2M0QxMDk2ODA4NTJFOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqjT9SMAAAAGUExURQAAAP///6XZn90AAAACdFJOU/8A5bcwSgAAAB9JREFUeNpiYEQDDEQJMMABTAAmNdAC6A4j0XMAAQYAcbwA1Xvj1CgAAAAASUVORK5CYII=';

/**
 *
 */
App.prototype.fullscreenImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/fullscreen.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABpJREFUCNdjgAAbGxAy4AEh5gNwBBGByoIBAIueBd12TUjqAAAAAElFTkSuQmCC';

/**
 * Executes the first step for connecting to Google Drive.
 */
App.prototype.timeout = 25000;

/**
 * Overriden UI settings depending on mode.
 */
if (urlParams['embed'] != '1')
{
	App.prototype.menubarHeight = 60;
}
else
{
	App.prototype.footerHeight = 0;
}

/**
 * Queue for loading plugins and wait for UI instance
 */
App.initPluginCallback = function()
{
	if (App.DrawPlugins == null)
	{
		// Workaround for need to load plugins now but wait for UI instance
		App.DrawPlugins = [];
		
		// Global entry point for plugins is Draw.loadPlugin. This is the only
		// long-term supported solution for access to the EditorUi instance.
		window.Draw = new Object();
		window.Draw.loadPlugin = function(callback)
		{
			App.DrawPlugins.push(callback);
		};
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.init = function()
{
	EditorUi.prototype.init.apply(this, arguments);
    this.mode="device";
	/**
	 * Specifies the default filename.
	 */
	this.defaultLibraryName = mxResources.get('untitledLibrary');

	/**
	 * Holds the listener for description changes.
	 */	
	this.descriptorChangedListener = mxUtils.bind(this, this.descriptorChanged);

	/**
	 * Creates github client.
	 * 离线版不需要，注释掉。  gsx on 201801160923
	 */
	/*this.gitHub = (!mxClient.IS_IE || document.documentMode == 10 ||
			mxClient.IS_IE11 || mxClient.IS_EDGE) &&
			(urlParams['gh'] != '0' && (urlParams['embed'] != '1' ||
			urlParams['gh'] == '1')) ? new GitHubClient(this) : null;
	
	if (this.gitHub != null)
	{
		this.gitHub.addListener('userChanged', mxUtils.bind(this, function()
		{
			this.updateUserElement();
			this.restoreLibraries();
		}))
	}*/

	/**
	 * Lazy-loading for individual backends
	 * 离线版不需要，注释掉。  gsx on 201801160927
	 */
	/*if (urlParams['embed'] != '1' || urlParams['od'] == '1')
	{
		/!**
		 * Creates onedrive client if all required libraries are available.
		 *!/
		var initOneDriveClient = mxUtils.bind(this, function()
		{
			if (typeof OneDrive !== 'undefined')
			{
				/!**
				 * Holds the x-coordinate of the point.
				 *!/
				this.oneDrive = new OneDriveClient(this);
				
				this.oneDrive.addListener('userChanged', mxUtils.bind(this, function()
				{
					this.updateUserElement();
					this.restoreLibraries();
				}));
				
				// Notifies listeners of new client
				this.fireEvent(new mxEventObject('clientLoaded', 'client', this.oneDrive));
			}
			else if (window.DrawOneDriveClientCallback == null)
			{
				window.DrawOneDriveClientCallback = initOneDriveClient;
			}
		});

		initOneDriveClient();
	}*/

	/**
	 * Lazy-loading for Trello
	 * 离线版不需要，注释掉。  gsx on 201801160924
	 */
	/*if (urlParams['embed'] != '1' || urlParams['tr'] == '1')
	{
		/!**
		 * Creates Trello client if all required libraries are available.
		 *!/
		var initTrelloClient = mxUtils.bind(this, function()
		{
			if (typeof window.Trello !== 'undefined')
			{
				this.trello = new TrelloClient(this);
				
				//TODO we have no user info from Trello so we don't set a user
				this.trello.addListener('userChanged', mxUtils.bind(this, function()
				{
					this.updateUserElement();
					this.restoreLibraries();
				}));
				
				// Notifies listeners of new client
				this.fireEvent(new mxEventObject('clientLoaded', 'client', this.trello));
			}
			else if (window.DrawTrelloClientCallback == null)
			{
				window.DrawTrelloClientCallback = initTrelloClient;
			}
		});

		initTrelloClient();
	}*/

	/**
	 * Creates drive client with all required libraries are available.
	 * 离线版不需要，注释掉。  gsx on 201801160927
	 */
	/*if (urlParams['embed'] != '1' || urlParams['gapi'] == '1')
	{
		var initDriveClient = mxUtils.bind(this, function()
		{
			/!**
			 * Creates google drive client if all required libraries are available.
			 *!/
			if (typeof gapi !== 'undefined')
			{
				var doInit = mxUtils.bind(this, function()
				{
					/!**
					 * Holds the x-coordinate of the point.
					 *!/
					this.drive = new DriveClient(this);
					
					/!**
					 * Adds important notice for new app if drive file is loaded in old app.
					 *!/
					if (this.drive.appId == '420247213240')
					{
						this.editor.addListener('fileLoaded', mxUtils.bind(this, function()
						{
							var file = this.getCurrentFile();
							
							if (file != null && file.constructor == DriveFile)
							{
								var td = document.getElementById('geFooterItem2');
								
								if (td != null)
								{
									td.innerHTML = '<a href="https://support.draw.io/display/DO/2014/11/27/Switching+application+in+Google+Drive" ' +
										'target="_blank" title="IMPORTANT NOTICE" >IMPORTANT NOTICE</a>';
								}
							}
						}));
					}
					
					this.drive.addListener('userChanged', mxUtils.bind(this, function()
					{
						this.updateUserElement();
						this.restoreLibraries();
						this.checkLicense();
					}))
					
					// Notifies listeners of new client
					this.fireEvent(new mxEventObject('clientLoaded', 'client', this.drive));
				});
				
				if (window.DrawGapiClientCallback != null)
				{
					gapi.load(((urlParams['picker'] != '0') ? 'picker,': '') + 'auth:client,drive-realtime,drive-share', mxUtils.bind(this, function(resp)
					{
						// Starts the app without the Google Option if the API fails to load
						if (gapi.drive != null && gapi.drive.realtime != null)
						{
							gapi.client.load('drive', 'v2', mxUtils.bind(this, function()
							{
								this.defineCustomObjects();
								
								// Needed to avoid popup blocking for non-immediate authentication
								gapi.auth.init(mxUtils.bind(this, function()
								{
									if (gapi.client.drive != null)
									{
										doInit();
									}
								}));
							}));
						}
					}));
					
					/!**
					 * Clears any callbacks.
					 *!/
					window.DrawGapiClientCallback = null;
				}
				else
				{
					doInit();
				}
			}
			else if (window.DrawGapiClientCallback == null)
			{
				window.DrawGapiClientCallback = initDriveClient;
			}
		});
		
		initDriveClient();
	}*/

    /**
	 * 离线版不需要，注释掉。  gsx on 201801160927
     */
	/*if (urlParams['embed'] != '1' || urlParams['db'] == '1')
	{
		/!**
		 * Creates dropbox client if all required libraries are available.
		 *!/
		var initDropboxClient = mxUtils.bind(this, function()
		{
			if (typeof Dropbox === 'function' && typeof Dropbox.choose !== 'undefined')
			{
				/!**
				 * Clears dropbox client callback.
				 *!/
				window.DrawDropboxClientCallback = null;
				
				/!**
				 * Holds the x-coordinate of the point.
				 *!/
				this.dropbox = new DropboxClient(this);
				
				this.dropbox.addListener('userChanged', mxUtils.bind(this, function()
				{
					this.updateUserElement();
					this.restoreLibraries();
				}));
				
				// Notifies listeners of new client
				this.fireEvent(new mxEventObject('clientLoaded', 'client', this.dropbox));
			}
			else if (window.DrawDropboxClientCallback == null)
			{
				window.DrawDropboxClientCallback = initDropboxClient;
			}
		});

		initDropboxClient();
	}*/

	if (urlParams['embed'] != '1')
	{
		/**
		 * Holds the background element.
		 */
		this.bg = this.createBackground();
		document.body.appendChild(this.bg);
		this.diagramContainer.style.visibility = 'hidden';
		this.formatContainer.style.visibility = 'hidden';
		this.hsplit.style.display = 'none';
		this.sidebarContainer.style.display = 'none';
		this.sidebarFooterContainer.style.display = 'none';

		// Sets the initial mode
		if (urlParams['local'] == '1')
		{
			this.setMode(App.MODE_DEVICE);
		}
		else
		{
			this.mode = App.mode;
		}
	}
	else if (this.menubar != null)
	{
		this.menubar.container.style.paddingTop = '0px';
	}

	this.updateHeader();

	if (this.menubar != null)
	{
		this.buttonContainer = document.createElement('div');
		this.buttonContainer.style.display = 'inline-block';
		this.buttonContainer.style.paddingRight = '48px';
		this.buttonContainer.style.position = 'absolute';
		this.buttonContainer.style.right = '0px';
		
		this.menubar.container.appendChild(this.buttonContainer);
	}

	if (uiTheme == 'atlas' && this.menubar != null)
	{
		if (this.toggleElement != null)
		{
			this.toggleElement.click();
			this.toggleElement.style.display = 'none';
		}
		
		this.icon = document.createElement('img');
		this.icon.setAttribute('src', IMAGE_PATH + '/logo-flat-small.png');
		this.icon.setAttribute('title', mxResources.get('draw.io'));
		this.icon.style.paddingTop = '11px';
		this.icon.style.marginLeft = '4px';
		this.icon.style.marginRight = '6px';
		
		if (mxClient.IS_QUIRKS)
		{
			this.icon.style.marginTop = '12px';
		}
		
		this.menubar.container.insertBefore(this.icon, this.menubar.container.firstChild);
	}

};

/**
 * Returns true if the current domain is for the new drive app.
 */
App.prototype.isDriveDomain = function()
{
	return urlParams['drive'] != '0' &&
		(window.location.hostname == 'test.draw.io' ||
		window.location.hostname == 'cdn.draw.io' ||
		window.location.hostname == 'www.draw.io' ||
		window.location.hostname == 'drive.draw.io' ||
		window.location.hostname == 'jgraph.github.io');
};

/**
 * Returns true if the current domain is for the old drive app.
 */
App.prototype.isLegacyDriveDomain = function()
{
	return urlParams['drive'] == 0 || window.location.hostname == 'legacy.draw.io';
};

/**
 * 
 */
App.prototype.checkLicense = function()
{
	var driveUser = this.drive.getUser();
	var email = ((urlParams['dev'] == '1') ? urlParams['lic'] : null) ||
		((driveUser != null) ? driveUser.email : null);
	
	if (!this.isOffline() && !this.editor.chromeless && email != null)
	{
		// Anonymises the local part of the email address
		var at = email.lastIndexOf('@');
		var domain = email;
		
		if (at >= 0)
		{
			domain = email.substring(at + 1);
			//email = this.crc32(email.substring(0, at)) + '@' + domain;
		}
		
		// Timestamp is workaround for cached response in certain environments
		mxUtils.post('/license', 'domain=' + encodeURIComponent(domain) + '&email=' + encodeURIComponent(email) + 
				'&ds=' + encodeURIComponent(driveUser.displayName) + '&lc=' + encodeURIComponent(driveUser.locale) + 
				'&ts=' + new Date().getTime(),
			mxUtils.bind(this, function(req)
			{
				var registered = false;
				var exp = null;
				
				try
				{
					if (req.getStatus() >= 200 && req.getStatus() <= 299)
					{
						var value = req.getText();
						registered = true;
						
						if (value.length > 0)
						{
							var lic = JSON.parse(value);
							
							if (lic != null)
							{
								exp = this.handleLicense(lic, domain);
							}
						}
					}
				}
				catch (e)
				{
					// ignore
				}
			}));
	}
};

/**
 * Returns true if the current domain is for the new drive app.
 */
App.prototype.handleLicense = function(lic, domain)
{
	var footer = document.getElementById('geFooter');
	var expiry = null;

	if (footer != null && lic != null)
	{
		expiry = lic.expiry;
		
		if (lic.footer != null)
		{
			footer.innerHTML = decodeURIComponent(lic.footer);
		}
		else
		{
			this.hideFooter();
		
			if (expiry != null && expiry != 'never')
			{
				var exp = new Date(Date.parse(expiry));
				var diff = Math.round((exp - Date.now()) / (1000 * 60 * 60 * 24));
		
				if (diff < 90)
				{
		    		var link = 'https://support.draw.io/display/DKB/draw.io+footer+state+that+license+is+expiring+on+Google+For+Work+account?domain=' + encodeURIComponent(domain);
		    		footer.style.height = '100%';
		    		footer.style.margin = '0px';
		    		footer.style.display = '';
		    		
		    		if (diff < 0)
		    		{
			    		this.footerHeight = 80;
		    			footer.innerHTML = '<table height="100%"><tr><td valign="middle" align="center" class="geStatusAlert geBlink">' +
		    				'<a href="' + link + '" style="padding-top:16px;" target="_blank">' + 
		    				'<img border="0" src="' + mxGraph.prototype.warningImage.src + '" align="top" style="margin-right:6px">' +
		    				mxResources.get('licenseHasExpired', [domain, exp.toLocaleDateString()]) + '</a></td></tr></table>';
		    		}
		    		else
		    		{
			    		this.footerHeight = 46;
		    			footer.innerHTML = '<table height="100%"><tr><td valign="middle" align="center" class="geStatusAlert">' +
		    				'<a href="' + link + '" target="_blank">' +
		    				'<img border="0" src="' + mxGraph.prototype.warningImage.src + '" align="top" style="margin-right:6px">' +
		    				mxResources.get('licenseWillExpire', [domain, exp.toLocaleDateString()]) + '</a></td></tr></table>';
		    		}
		    		
		    		this.refresh();
				}
			}
		}
	}
	
	return expiry;
};

/**
 * 
 */
App.prototype.getEditBlankXml = function()
{
	var file = this.getCurrentFile();
	
	if (file != null && this.editor.chromeless && this.editor.graph.lightbox && file.realtime == null)
	{
		return file.getData();
	}
	else
	{
		return this.getFileData(true);
	}
};

/**
 * Updates action states depending on the selection.
 */
App.prototype.updateActionStates = function()
{
	EditorUi.prototype.updateActionStates.apply(this, arguments);

	var file = this.getCurrentFile();
	this.actions.get('revisionHistory').setEnabled(file != null && ((file.constructor == DriveFile &&
			file.isEditable()) || file.constructor == DropboxFile));
};

/**
 * Updates draft in local storage
 */
App.prototype.updateDraft = function()
{
	if (isLocalStorage && localStorage != null)
	{
		localStorage.setItem('.draft', JSON.stringify({modified: new Date().getTime(), data: this.getFileData()}));
	}
};

/**
 * Returns the draft in local storage
 */
App.prototype.getDraft = function()
{
	// FIXME: Handle multiple tabs
//	if (isLocalStorage && localStorage != null)
//	{
//		try
//		{
//			var draft = localStorage.getItem('.draft');
//			
//			if (draft != null)
//			{
//				return JSON.parse(draft);
//			}
//		}
//		catch (e)
//		{
//			// ignore quota etc
//		}
//	}

	return null;
};

/**
 * Adds the specified entry to the recent file list in local storage
 */
App.prototype.addRecent = function(entry)
{
	if (isLocalStorage && localStorage != null)
	{
		var recent = this.getRecent();
		
		if (recent == null)
		{
			recent = [];
		}
		else
		{
			for (var i = 0; i < recent.length; i++)
			{
				if (recent[i].id == entry.id)
				{
					recent.splice(i, 1);
				}
			}
		}
		
		if (recent != null)
		{
			recent.unshift(entry);
			recent = recent.slice(0, 5);
			localStorage.setItem('.recent', JSON.stringify(recent));
		}
	}
};

/**
 * Returns the recent file list from local storage
 */
App.prototype.getRecent = function()
{
	if (isLocalStorage && localStorage != null)
	{
		try
		{
			var recent = localStorage.getItem('.recent');
			
			if (recent != null)
			{
				return JSON.parse(recent);
			}
		}
		catch (e)
		{
			// ignore
		}
		
		return null;
	}
};

/**
 * Clears the recent file list in local storage
 */
App.prototype.resetRecent = function(entry)
{
	if (isLocalStorage && localStorage != null)
	{
		try
		{
			localStorage.removeItem('.recent');
		}
		catch (e)
		{
			// ignore
		}
	}
};

/**
 * Clears the draft save in local storage
 */
App.prototype.removeDraft = function()
{
	if (isLocalStorage && localStorage != null && urlParams['splash'] == '0')
	{
		try
		{
			localStorage.removeItem('.draft');
		}
		catch (e)
		{
			// ignore quota etc
		}
	}
};

/**
 * Sets the onbeforeunload for the application
 */
App.prototype.onBeforeUnload = function()
{
	if (urlParams['embed'] == '1' && this.editor.modified)
	{
		return mxResources.get('allChangesLost');
	}
	else
	{
		var file = this.getCurrentFile();
		
		if (file != null)
		{
			// KNOWN: Message is ignored by most browsers
			if (file.constructor == LocalFile && file.getHash() == '' && !file.isModified() &&
				urlParams['nowarn'] != '1' && !this.isDiagramEmpty() && urlParams['url'] == null &&
				!this.editor.chromeless)
			{
				return mxResources.get('ensureDataSaved');
			}
			else if (file.constructor != DriveFile && file.isModified())
			{
				return mxResources.get('allChangesLost');
			}
			else
			{
				file.close(true);
			}
		}
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.updateDocumentTitle = function()
{
	if (!this.editor.graph.lightbox)
	{
		var title = this.editor.appName;
		var file = this.getCurrentFile();
		
		if (this.isOfflineApp())
		{
			title += ' app';
		}
		
		if (file != null)
		{
			var filename = (file.getTitle() != null) ? file.getTitle() : this.defaultFilename;
			title = filename + ' - ' + title;
		}
		
		document.title = title;
	}
};

/**
 * Authorizes the client, gets the userId and calls <open>.
 */
App.prototype.createCrcTable = function()
{
    var crcTable = [];
    var c;

	for (var n = 0; n < 256; n++)
	{
        c = n;
        
        for (var k = 0; k < 8; k++)
        {
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
	        
        crcTable[n] = c;
    }
	
    return crcTable;
};

/**
 * Authorizes the client, gets the userId and calls <open>.
 */
App.prototype.crc32 = function(str)
{
	this.crcTable = this.crcTable || this.createCrcTable();
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ )
    {
        crc = (crc >>> 8) ^ this.crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

/**
 * Returns a thumbnail of the current file.
 */
App.prototype.getThumbnail = function(width, success)
{
	var result = false;
	
	try
	{
		if (this.thumbImageCache == null)
		{
			this.thumbImageCache = new Object();
		}
		
		var graph = this.editor.graph;
		
		// Exports PNG for first page while other page is visible by creating a graph
		// LATER: Add caching for the graph or SVG while not on first page
		if (this.pages != null && this.currentPage != this.pages[0])
		{
			graph = this.createTemporaryGraph(graph.getStylesheet());
			var graphGetGlobalVariable = graph.getGlobalVariable;
			var page = this.pages[0];
	
			graph.getGlobalVariable = function(name)
			{
				if (name == 'page')
				{
					return page.getName();
				}
				else if (name == 'pagenumber')
				{
					return 1;
				}
				
				return graphGetGlobalVariable.apply(this, arguments);
			};
	
			document.body.appendChild(graph.container);
			graph.model.setRoot(page.root);
		}
		
		// Uses client-side canvas export
		if (mxClient.IS_CHROMEAPP || (!graph.mathEnabled && this.useCanvasForExport))
		{
		   	this.exportToCanvas(mxUtils.bind(this, function(canvas)
		   	{
		   		// Removes temporary graph from DOM
   	   	    	if (graph != this.editor.graph)
				{
					graph.container.parentNode.removeChild(graph.container);
				}
		   		
		   		success(canvas);
		   	}), width, this.thumbImageCache, '#ffffff', function()
		   	{
		   		// Continues with null in error case
		   		success();
		   	}, null, null, null, null, null, null, graph);
		   	
		   	result = true;
		}
		else if (this.canvasSupported && this.getCurrentFile() != null)
		{
			var canvas = document.createElement('canvas');
			var bounds = graph.getGraphBounds();
			var scale = width / bounds.width;
			
			// Limits scale to 1 or 2 * width / height
			scale = Math.min(1, Math.min((width * 3) / (bounds.height * 4), scale));
			
			var x0 = Math.floor(bounds.x);
			var y0 = Math.floor(bounds.y);
			
			canvas.setAttribute('width', Math.ceil(scale * (bounds.width + 4)));
			canvas.setAttribute('height', Math.ceil(scale * (bounds.height + 4)));
			
			var ctx = canvas.getContext('2d');
			
			// Configures the canvas
			ctx.scale(scale, scale);
			ctx.translate(-x0, -y0);
			
			// Paint white background instead of transparent
			var bg = graph.background;
			
			if (bg == null || bg == '' || bg == mxConstants.NONE)
			{
				bg = '#ffffff';
			}
	
			// Paints background
			ctx.save();
			ctx.fillStyle = bg;
			ctx.fillRect(x0, y0, Math.ceil(bounds.width + 4), Math.ceil(bounds.height + 4));
			ctx.restore();
			
			var htmlCanvas = new mxJsCanvas(canvas);
			
			// NOTE: htmlCanvas passed into async canvas is only used for image
			// and canvas caching (canvas caching not used in this case as we do
			// not render text). To reuse that cache via the thumbImageCache we
			// pass that into the async canvas and override the image cache in
			// the newly created html canvas with that of the thumbImageCache.
			// LATER: Is clear thumbImageCache needed if file changes?
			var asynCanvas = new mxAsyncCanvas(this.thumbImageCache);
			htmlCanvas.images = this.thumbImageCache.images;
			
			// Render graph
			var imgExport = new mxImageExport();
			
			imgExport.drawShape = function(state, canvas)
			{
				if (state.shape instanceof mxShape && state.shape.checkBounds())
				{
					canvas.save();
					canvas.translate(0.5, 0.5);
					state.shape.paint(canvas);
					canvas.translate(-0.5, -0.5);
					canvas.restore();
				}
			};
			
			imgExport.drawText = function(state, canvas)
			{
				// No text output for thumbnails
			};
	
			imgExport.drawState(graph.getView().getState(graph.model.root), asynCanvas);
	
			asynCanvas.finish(mxUtils.bind(this, function()
			{
				imgExport.drawState(graph.getView().getState(graph.model.root), htmlCanvas);
				
		   		// Removes temporary graph from DOM
   	   	    	if (graph != this.editor.graph)
				{
					graph.container.parentNode.removeChild(graph.container);
				}
				
				success(canvas);
			}));
			
			result = true;
		}
	}
	catch (e)
	{
		// ignore and use placeholder
		// Removes temporary graph from DOM
  	    if (graph != this.editor.graph)
		{
			graph.container.parentNode.removeChild(graph.container);
		}
	}
	
	return result;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.createBackground = function()
{
	var bg = this.createDiv('background');
	bg.style.position = 'absolute';
	bg.style.background = 'white';
	bg.style.left = '0px';
	bg.style.top = '0px';
	bg.style.bottom = '0px';
	bg.style.right = '0px';
	
	mxUtils.setOpacity(bg, 100);
	
	if (mxClient.IS_QUIRKS)
	{
		new mxDivResizer(bg);
	}

	return bg;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
(function()
{
	var editorUiSetMode = EditorUi.prototype.setMode;
	
	App.prototype.setMode = function(mode, remember)
	{
		editorUiSetMode.apply(this, arguments);
		
		// Note: UseLocalStorage affects the file dialogs
		// and should not be modified if mode is undefined
		if (this.mode != null)
		{
			Editor.useLocalStorage = this.mode == App.MODE_BROWSER;
		}
		
		if (remember)
		{
			if (isLocalStorage)
			{
				localStorage.setItem('.mode', mode);
			}
			else if (typeof(Storage) != 'undefined')
			{
				var expiry = new Date();
				expiry.setYear(expiry.getFullYear() + 1);
				document.cookie = 'MODE=' + mode + '; expires=' + expiry.toUTCString();
			}
		}
		
		if (this.appIcon != null)
		{
			var file = this.getCurrentFile();
			var mode = (file != null) ? file.getMode() : null;
			
			if (mode == App.MODE_GOOGLE)
			{
				this.appIcon.setAttribute('title', mxResources.get('openIt', [mxResources.get('googleDrive')]));
				this.appIcon.style.cursor = 'pointer';
			}
			else if (mode == App.MODE_DROPBOX)
			{
				this.appIcon.setAttribute('title', mxResources.get('openIt', [mxResources.get('dropbox')]));
				this.appIcon.style.cursor = 'pointer';
			}
			else if (mode == App.MODE_ONEDRIVE)
			{
				this.appIcon.setAttribute('title', mxResources.get('openIt', [mxResources.get('oneDrive')]));
				this.appIcon.style.cursor = 'pointer';
			}
			else
			{
				this.appIcon.removeAttribute('title');
				this.appIcon.style.cursor = 'default';
			}
		}
	};
})();

/**
 * Function: authorize
 * 
 * Authorizes the client, gets the userId and calls <open>.
 */
App.prototype.appIconClicked = function(evt)
{
	if (mxEvent.isAltDown(evt))
	{
		this.showSplash(true);
	}
	else
	{
		var file = this.getCurrentFile();
		var mode = (file != null) ? file.getMode() : null;
		
		if (mode == App.MODE_GOOGLE)
		{
			if (file.desc.parents.length > 0)
			{
				this.openLink('https://drive.google.com/drive/folders/' + file.desc.parents[0].id);
			}
			else
			{
				this.openLink('https://drive.google.com/?authuser=0');
			}
		}
		else if (mode == App.MODE_DROPBOX)
		{
			this.openLink('https://www.dropbox.com/');
		}
		else if (mode == App.MODE_ONEDRIVE)
		{
			this.openLink('https://onedrive.live.com/');
		}
		else if (mode == App.MODE_TRELLO)
		{
			this.openLink('https://trello.com/');
		}
		else if (mode == App.MODE_GITHUB)
		{
			if (file != null && file.constructor == GitHubFile)
			{
				this.openLink(file.meta.html_url);
			}
			else
			{
				this.openLink('https://github.com/');
			}
		}
	}
	
	mxEvent.consume(evt);
};

/**
 * Function: authorize
 * 
 * Authorizes the client, gets the userId and calls <open>.
 */
App.prototype.clearMode = function()
{
	if (isLocalStorage)
	{
		localStorage.removeItem('.mode');
	}
	else if (typeof(Storage) != 'undefined')
	{
		var expiry = new Date();
		expiry.setYear(expiry.getFullYear() - 1);
		document.cookie = 'MODE=; expires=' + expiry.toUTCString();
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.getDiagramId = function()
{
	var id = window.location.hash;
	
	// Strips the hash sign
	if (id != null && id.length > 0)
	{
		id = id.substring(1);
	}
	
	return id;
};

/**
 * Opens any file specified in the URL parameters.
 */
App.prototype.open = function()
{
	// Cross-domain window access is not allowed in FF, so if we
	// were opened from another domain then this will fail.
	try
	{
		// If the create URL param is used in embed mode then
		// we try to open the XML from window.opener[value].
		// Use this for embedding via tab to bypass the timing
		// issues when passing messages without onload event.
		if (window.opener != null)
		{
			var value = urlParams['create'];
			
			if (value != null)
			{
				value = decodeURIComponent(value);
			}
			
			if (value != null && value.length > 0 && value.substring(0, 7) != 'http://' &&
				value.substring(0, 8) != 'https://')
			{
				var doc = mxUtils.parseXml(window.opener[value]);
				this.editor.setGraphXml(doc.documentElement);
			}
			else if (window.opener.openFile != null)
			{
				window.opener.openFile.setConsumer(mxUtils.bind(this, function(xml, filename, temp)
				{
					this.spinner.stop();
					
					if (filename == null)
					{
						var title = urlParams['title'];
						temp = true;
						
						if (title != null)
						{
							filename = decodeURIComponent(title);
						}
						else
						{
							filename = this.defaultFilename;
						}
					}
					
					// Replaces PNG with XML extension
					var dot = (!this.useCanvasForExport) ? filename.substring(filename.length - 4) == '.png' : -1;
					
					if (dot > 0)
					{
						filename = filename.substring(0, filename.length - 4) + '.xml';
					}
					
					this.fileLoaded((mxClient.IS_IOS) ?
						new StorageFile(this, xml, filename) :
						new LocalFile(this, xml, filename, temp));
				}));
			}
		}
	}
	catch(e)
	{
		// ignore
	}
};

App.prototype.loadGapi = function(then)
{
	if (typeof gapi !== 'undefined')
	{
		gapi.load(((urlParams['picker'] != '0') ? 'picker,': '') + 'auth:client,drive-realtime,drive-share', mxUtils.bind(this, function(resp)
		{
			// Starts the app without the Google Option if the API fails to load
			if (gapi.drive == null || gapi.drive.realtime == null)
			{
				this.mode = null;
				this.drive = null;
				then();
			}
			else
			{
				gapi.client.load('drive', 'v2', mxUtils.bind(this, function()
				{
					// Needed to avoid popup blocking for non-immediate authentication
					gapi.auth.init(mxUtils.bind(this, function()
					{
						if (gapi.client.drive == null)
						{
							this.mode = null;
							this.drive = null;
						}
						
						then();
					}));
				}));
			}
		}));
	}
};

/**
 * Main function. Program starts here.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.load = function()
{
	// Checks if we're running in embedded mode
	if (urlParams['embed'] != '1')
	{
		if (this.spinner.spin(document.body, mxResources.get('starting')))
		{
			try
			{
				this.stateArg = (urlParams['state'] != null && this.drive != null) ? JSON.parse(decodeURIComponent(urlParams['state'])) : null;
			}
			catch (e)
			{
				// ignores invalid state args
			}
			
			this.editor.graph.setEnabled(this.getCurrentFile() != null);
			
			// Passes the userId from the state parameter to the client
			if ((window.location.hash == null || window.location.hash.length == 0) &&
				this.drive != null && this.stateArg != null && this.stateArg.userId != null)
			{
				this.drive.setUserId(this.stateArg.userId);
			}

			// Legacy support for fileId parameter which is moved to the hash tag
			if (urlParams['fileId'] != null)
			{
				window.location.hash = 'G' + urlParams['fileId'];
				window.location.search = this.getSearch(['fileId']);
			}
			else
			{
				// Asynchronous or disabled loading of client
				if (this.drive == null)
				{
					if (this.mode == App.MODE_GOOGLE)
					{
						this.mode = null;
					}
					
					this.start();
				}
				else
				{
					this.loadGapi(mxUtils.bind(this, function()
					{
						this.start();
					}));
				}
			}
		}
	}
	else
	{
		this.restoreLibraries();
		
		if (urlParams['gapi'] == '1')
		{
			this.loadGapi(function() {});
		}
	}
};

/**
 * Called in start after the spinner stops.
 */
App.prototype.showAlert = function(message)
{
	if (message != null && message.length > 0)
	{
		var div = document.createElement('div');
		div.className = 'geAlert';
		div.style.zIndex = 2e9; 
		div.style.left = '50%';
		div.style.top = '-100%';
		mxUtils.setPrefixedStyle(div.style, 'transform', 'translate(-50%,0%)');
		mxUtils.setPrefixedStyle(div.style, 'transition', 'all 1s ease');
		
		div.innerHTML = message;
		
		var close = document.createElement('a');
		close.className = 'geAlertLink';
		close.style.textAlign = 'right';
		close.style.marginTop = '20px';
		close.style.display = 'block';
		close.setAttribute('href', 'javascript:void(0);');
		close.setAttribute('title', mxResources.get('close'));
		close.innerHTML = mxResources.get('close');
		div.appendChild(close);
		
		mxEvent.addListener(close, 'click', function(evt)
		{
			if (div.parentNode != null)
			{
				div.parentNode.removeChild(div);
				mxEvent.consume(evt);
			}
		});
		
		document.body.appendChild(div);
		
		// Delayed to get smoother animation after DOM rendering
		window.setTimeout(function()
		{
			div.style.top = '30px';
		}, 10);
		
		// Fades out the alert after 15 secs
		window.setTimeout(function()
		{
			mxUtils.setPrefixedStyle(div.style, 'transition', 'all 2s ease');
			div.style.opacity = '0';
			
			window.setTimeout(function()
			{
				if (div.parentNode != null)
				{
					div.parentNode.removeChild(div);
				}
			}, 2000);
		}, 15000);
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.start = function()
{
	this.bg.parentNode.removeChild(this.bg);
	this.restoreLibraries();
	this.spinner.stop();
	
	try
	{
		// Listens to changes of the hash if not in embed or client mode
		if (urlParams['client'] != '1' && urlParams['embed'] != '1')
		{
			// KNOWN: Does not work in quirks mode
			mxEvent.addListener(window, 'hashchange', mxUtils.bind(this, function(evt)
			{
				try
				{
					var id = this.getDiagramId();
					var file = this.getCurrentFile();
					
					if (file == null || file.getHash() != id)
					{
						this.loadFile(id, true);
					}
				}
				catch (e)
				{
					// Workaround for possible scrollWidth of null in Dialog ctor
					if (document.body != null)
					{
						this.handleError(e, mxResources.get('errorLoadingFile'), mxUtils.bind(this, function()
						{
							var file = this.getCurrentFile();
							window.location.hash = (file != null) ? file.getHash() : '';
						}));
					}
				}
			}));
		}
		
		// Redirects old url URL parameter to new #U format
		if ((window.location.hash == null || window.location.hash.length <= 1) && urlParams['url'] != null)
		{
			this.loadFile('U' + urlParams['url'], true);
		}
		else if (this.getCurrentFile() == null)
		{
			var done = mxUtils.bind(this, function()
			{
				// Starts in client mode and waits for data
				if (urlParams['client'] == '1' && (window.location.hash == null ||
					window.location.hash.length == 0 || window.location.hash.substring(0, 2) == '#P'))
				{
					var doLoadFile = mxUtils.bind(this, function(xml)
					{
						// Extracts graph model from PNG
						if (xml.substring(0, 22) == 'data:image/png;base64,')
						{
							xml = this.extractGraphModelFromPng(xml);
						}
						
						var title = urlParams['title'];
						
						if (title != null)
						{
							title = decodeURIComponent(title);
						}
						else
						{
							title = this.defaultFilename;
						}
						
						var file = new LocalFile(this, xml, title, true);
						
						if (window.location.hash != null && window.location.hash.substring(0, 2) == '#P')
						{
							file.getHash = function()
							{
								return window.location.hash.substring(1);
							};
						}
						
						this.fileLoaded(file);
						this.getCurrentFile().setModified(!this.editor.chromeless);
					});

					var parent = window.opener || window.parent;
					
					if (parent != window)
					{
						var value = urlParams['create'];
						
						if (value != null)
						{
							doLoadFile(parent[decodeURIComponent(value)]);
						}
						else
						{
							value = urlParams['data'];
							
							if (value != null)
							{
								doLoadFile(decodeURIComponent(value));
							}
							else
							{
								this.installMessageHandler(mxUtils.bind(this, function(xml, evt)
								{
									// Ignores messages from other windows
									if (evt.source == parent)
									{
										doLoadFile(xml);
									}
								}));
							}
						}
					}
				}
				// Checks if no earlier loading errors are showing
				else if (this.dialog == null)
				{
					if (urlParams['demo'] == '1')
					{
						var prev = Editor.useLocalStorage;
						this.createFile(this.defaultFilename, null, null, null, null, null, null, true);
						Editor.useLocalStorage = prev;
					}
					else
					{
						var waiting = false;
						
						// Checks if we're waiting for some asynchronous file to be loaded
						// Cross-domain window access is not allowed in FF, so if we
						// were opened from another domain then this will fail.
						try
						{
							waiting = window.opener != null && window.opener.openFile != null;
						}
						catch(e)
						{
							// ignore
						}
						
						if (waiting)
						{
							// Spinner is stopped in App.open
							this.spinner.spin(document.body, mxResources.get('loading'))
						}
						else
						{
							var id = this.getDiagramId();
							
							if (urlParams['splash'] == '0' && (id == null || id.length == 0))
							{
								var draft = this.getDraft();
								var fileData = (draft != null) ? draft.data : this.getFileData();
								var prev = Editor.useLocalStorage;
								this.createFile(this.defaultFilename, fileData, null, null, null, null, null, true);
								Editor.useLocalStorage = prev;
								
								// Draft was used so the user should save the file
								if (draft != null)
								{
									var file = this.getCurrentFile();
									
									if (file != null)
									{
										file.addUnsavedStatus();
									}
								}
							}
							else
							{
								this.loadFile(this.getDiagramId());
							}
						}
					}
				}
			});
	
			// Defines custom classes for realtime in Google Drive
			if (this.drive != null)
			{
				this.defineCustomObjects();
			}
			
			var value = decodeURIComponent(urlParams['create'] || '');
			
			if ((window.location.hash == null || window.location.hash.length <= 1) &&
				value != null && value.length > 0 && this.spinner.spin(document.body, mxResources.get('loading')))
			{
				var reconnect = mxUtils.bind(this, function()
				{
					// Removes URL parameter and reloads the page
					if (this.spinner.spin(document.body, mxResources.get('reconnecting')))
					{
						window.location.search = this.getSearch(['create', 'title']);
					};
				});
	
				var showCreateDialog = mxUtils.bind(this, function(xml)
				{
					this.spinner.stop();
	
					// Resets mode for dialog - local file is only for preview
					if (urlParams['splash'] != '0')
					{
						this.fileLoaded(new LocalFile(this, xml, null));
						
						this.editor.graph.setEnabled(false);
						this.mode = urlParams['mode'];
						var title = urlParams['title'];
		
						if (title != null)
						{
							title = decodeURIComponent(title);
						}
						else
						{
							title = this.defaultFilename;
						}
						
						var serviceCount = this.getServiceCount(true);
						var rowLimit = (serviceCount <= 4) ? 4 : 3;
						
						var dlg = new CreateDialog(this, title, mxUtils.bind(this, function(filename, mode)
						{
							if (mode == null)
							{
								this.hideDialog();
								var prev = Editor.useLocalStorage;
								this.createFile((filename.length > 0) ? filename : this.defaultFilename,
									this.getFileData(), null, null, null, null, null, true);
								Editor.useLocalStorage = prev;
							}
							else
							{
								this.createFile(filename, this.getFileData(true), null, mode);
							}
						}), null, null, null, null, urlParams['browser'] == '1', null, null, true, rowLimit);
						this.showDialog(dlg.container, 380, (serviceCount > rowLimit) ? 390 : 270,
							true, false, mxUtils.bind(this, function(cancel)
						{
							if (cancel && this.getCurrentFile() == null)
							{
								this.showSplash();
							}
						}));
						dlg.init();
					}
				});
				
				value = decodeURIComponent(value);
				
				if (value.substring(0, 7) != 'http://' && value.substring(0, 8) != 'https://')
				{
					// Cross-domain window access is not allowed in FF, so if we
					// were opened from another domain then this will fail.
					try
					{
						if (window.opener != null && window.opener[value] != null)
						{
							showCreateDialog(window.opener[value]);
						}
						else
						{
							this.handleError(null, mxResources.get('errorLoadingFile'));
						}
					}
					catch (e)
					{
						this.handleError(e, mxResources.get('errorLoadingFile'));
					}
				}
				else
				{
					this.loadTemplate(value, function(text)
					{
						showCreateDialog(text);
					}, mxUtils.bind(this, function()
					{
						this.handleError(null, mxResources.get('errorLoadingFile'), reconnect);
					}));
				}
			}
			else
			{
				// Passes the fileId from the state parameter to the hash tag and reloads
				// the page without the state parameter
				if ((window.location.hash == null || window.location.hash.length <= 1) &&
					urlParams['state'] != null && this.stateArg != null && this.stateArg.action == 'open')
				{
					if (this.stateArg.ids != null)
					{
						window.location.hash = 'G' + this.stateArg.ids[0];
					}
				}
		
				if ((window.location.hash == null || window.location.hash.length <= 1) &&
					this.drive != null && this.stateArg != null && this.stateArg.action == 'create')
				{
					this.setMode(App.MODE_GOOGLE);
					this.actions.get('new').funct();
				}
				else
				{
					done();
				}
			}
		}
	}
	catch (e)
	{
		this.handleError(e);
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.showSplash = function(force)
{
	var serviceCount = this.getServiceCount(false) + 1;
	
	var showSecondDialog = mxUtils.bind(this, function()
	{
		/**去掉开始部分弹框 Lyn  2018年1月11日 11:46:57*/
		/*var dlg = new SplashDialog(this);
		
		this.showDialog(dlg.container, 340, (serviceCount < 2 ||
			mxClient.IS_CHROMEAPP || EditorUi.isElectronApp) ? 200 : 260, true, true,
			mxUtils.bind(this, function(cancel)
			{
				// Creates a blank diagram if the dialog is closed
				if (cancel && !mxClient.IS_CHROMEAPP)
				{*/
					var prev = Editor.useLocalStorage;
					this.createFile(this.defaultFilename, null, null, null, null, null, null,
						urlParams['local'] != '1');
					Editor.useLocalStorage = prev;
			//	}
		//	}));
	});
	
	if (this.editor.chromeless)
	{
		this.handleError({message: mxResources.get('noFileSelected')},
			mxResources.get('errorLoadingFile'), mxUtils.bind(this, function()
		{
			this.showSplash();
		}));
	}
	else if (this.mode == null || force)
	{
        /**
		 * 指定默认的文件保存模式，取消弹窗。  gsx on 201801161742
         */
		/*var rowLimit = (serviceCount <= 4) ? 2 : 3;
		
		var dlg = new StorageDialog(this, mxUtils.bind(this, function()
		{
			this.hideDialog();
			showSecondDialog();
		}), rowLimit);
		
		this.showDialog(dlg.container, (rowLimit < 3) ? 260 : 300,
			(serviceCount > rowLimit) ? 420 : 300, true, false);
		dlg.init();*/
        this.mode="device";
        showSecondDialog();
	}
	else if (urlParams['create'] == null)
	{
		showSecondDialog();
	}
};


/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.defineCustomObjects = function()
{
	if (gapi.drive.realtime != null && gapi.drive.realtime.custom != null)
	{
		gapi.drive.realtime.custom.registerType(mxRtCell, 'Cell');
		
		mxRtCell.prototype.cellId = gapi.drive.realtime.custom.collaborativeField('cellId');
		mxRtCell.prototype.type = gapi.drive.realtime.custom.collaborativeField('type');
		mxRtCell.prototype.value = gapi.drive.realtime.custom.collaborativeField('value');
		mxRtCell.prototype.xmlValue = gapi.drive.realtime.custom.collaborativeField('xmlValue');
		mxRtCell.prototype.style = gapi.drive.realtime.custom.collaborativeField('style');
		mxRtCell.prototype.geometry = gapi.drive.realtime.custom.collaborativeField('geometry');
		mxRtCell.prototype.visible = gapi.drive.realtime.custom.collaborativeField('visible');
		mxRtCell.prototype.collapsed = gapi.drive.realtime.custom.collaborativeField('collapsed');
		mxRtCell.prototype.connectable = gapi.drive.realtime.custom.collaborativeField('connectable');
		mxRtCell.prototype.parent = gapi.drive.realtime.custom.collaborativeField('parent');
		mxRtCell.prototype.children = gapi.drive.realtime.custom.collaborativeField('children');
		mxRtCell.prototype.source = gapi.drive.realtime.custom.collaborativeField('source');
		mxRtCell.prototype.target = gapi.drive.realtime.custom.collaborativeField('target');
	}
};

mxRtCell = function() {};

// Ignores rtCell property in codec and cloning
mxCodecRegistry.getCodec(mxCell).exclude.push('rtCell');
mxCell.prototype.mxTransient.push('rtCell');

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.pickFile = function(mode)
{
	mode = (mode != null) ? mode : this.mode;
	
	if (mode == App.MODE_GOOGLE)
	{
		if (this.drive != null && typeof(google) != 'undefined' && typeof(google.picker) != 'undefined')
		{
			this.drive.pickFile();
		}
		else
		{
			this.openLink('https://drive.google.com');
		}
	}
	else
	{
		var peer = this.getPeerForMode(mode);
		
		if (peer != null)
		{
			peer.pickFile();
		}
		else if (mode == App.MODE_DEVICE && Graph.fileSupport && !mxClient.IS_IE && !mxClient.IS_IE11)
		{
			var input = document.createElement('input');
			input.setAttribute('type', 'file');
			
			mxEvent.addListener(input, 'change', mxUtils.bind(this, function()
			{
				if (input.files != null)
				{
					this.openFiles(input.files);
				}
			}));
	
			input.click();
		}
		else
		{
			this.hideDialog();
			window.openNew = this.getCurrentFile() != null && !this.isDiagramEmpty();
			window.baseUrl = this.getUrl();
			window.openKey = 'open';
			var prevValue = Editor.useLocalStorage;
			Editor.useLocalStorage = (mode == App.MODE_BROWSER);
			this.openFile();
			
			// Installs local handler for opened files in same window
			window.openFile.setConsumer(mxUtils.bind(this, function(xml, filename)
			{
				// Replaces PNG with XML extension
				var dot = !this.useCanvasForExport && filename.substring(filename.length - 4) == '.png';
				
				if (dot)
				{
					filename = filename.substring(0, filename.length - 4) + '.xml';
				}
				
				this.fileLoaded((mode == App.MODE_BROWSER) ?
						new StorageFile(this, xml, filename) :
						new LocalFile(this, xml, filename));
			}));
			
			// Extends dialog close to show splash screen
			var dlg = this.dialog;
			var dlgClose = dlg.close;
			
			this.dialog.close = mxUtils.bind(this, function(cancel)
			{
				Editor.useLocalStorage = prevValue;
				dlgClose.apply(dlg, arguments);
	
				if (this.getCurrentFile() == null)
				{
					this.showSplash();
				}
			});
		}
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.pickLibrary = function(mode)
{
	mode = (mode != null) ? mode : this.mode;
	
	if (mode == App.MODE_GOOGLE || mode == App.MODE_DROPBOX || mode == App.MODE_ONEDRIVE || mode == App.MODE_GITHUB || mode == App.MODE_TRELLO)
	{
		var peer = (mode == App.MODE_GOOGLE) ? this.drive :
			((mode == App.MODE_ONEDRIVE) ? this.oneDrive :
			((mode == App.MODE_GITHUB) ? this.gitHub :
			((mode == App.MODE_TRELLO) ? this.trello :
			this.dropbox)));
		
		if (peer != null)
		{
			peer.pickLibrary(mxUtils.bind(this, function(id, optionalFile)
			{
				if (optionalFile != null)
				{
					try
					{
						this.loadLibrary(optionalFile);
					}
					catch (e)
					{
						this.handleError(e, mxResources.get('errorLoadingFile'));
					}
				}
				else
				{
					if (this.spinner.spin(document.body, mxResources.get('loading')))
					{
						peer.getLibrary(id, mxUtils.bind(this, function(file)
						{
							this.spinner.stop();
							
							try
							{
								this.loadLibrary(file);
							}
							catch (e)
							{
								this.handleError(e, mxResources.get('errorLoadingFile'));
							}
						}), mxUtils.bind(this, function(resp)
						{
							this.handleError(resp, (resp != null) ? mxResources.get('errorLoadingFile') : null);
						}));
					}
				}
			}));
		}
	}
	else if (mode == App.MODE_DEVICE && Graph.fileSupport && !mxClient.IS_IE && !mxClient.IS_IE11)
	{
		var input = document.createElement('input');
		input.setAttribute('type', 'file');
		
		mxEvent.addListener(input, 'change', mxUtils.bind(this, function()
		{
			if (input.files != null)
			{
				for (var i = 0; i < input.files.length; i++)
				{
					(mxUtils.bind(this, function(file)
					{
						var reader = new FileReader();
					
						reader.onload = mxUtils.bind(this, function(e)
						{
							try
							{
								this.loadLibrary(new LocalLibrary(this, e.target.result, file.name));
							}
							catch (e)
							{
								this.handleError(e, mxResources.get('errorLoadingFile'));
							}
						});

						reader.readAsText(file);
					}))(input.files[i]);
				}
			}
		}));

		input.click();
	}
	else
	{
		window.openNew = false;
		window.openKey = 'open';
		
		var prevValue = Editor.useLocalStorage;
		Editor.useLocalStorage = mode == App.MODE_BROWSER;
		
		// Closes dialog after open
		window.openFile = new OpenFile(mxUtils.bind(this, function(cancel)
		{
			this.hideDialog(cancel);
		}));
		
		window.openFile.setConsumer(mxUtils.bind(this, function(xml, filename)
		{
			try
			{
				this.loadLibrary((mode == App.MODE_BROWSER) ? new StorageLibrary(this, xml, filename) :
					new LocalLibrary(this, xml, filename));
			}
			catch (e)
			{
				this.handleError(e, mxResources.get('errorLoadingFile'));
			}
		}));

		// Removes openFile if dialog is closed
		this.showDialog(new OpenDialog(this).container, (Editor.useLocalStorage) ? 640 : 360,
			(Editor.useLocalStorage) ? 480 : 220, true, true, function()
		{
			Editor.useLocalStorage = prevValue;
			window.openFile = null;
		});
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.saveLibrary = function(name, images, file, mode, noSpin, noReload, fn)
{
	mode = (mode != null) ? mode : this.mode;
	noSpin = (noSpin != null) ? noSpin : false;
	noReload = (noReload != null) ? noReload : false;
	var xml = this.createLibraryDataFromImages(images);
	
	var error = mxUtils.bind(this, function(resp)
	{
		this.spinner.stop();
		
		if (fn != null)
		{
			fn();
		}
		
		this.handleError(resp, (resp != null) ? mxResources.get('errorSavingFile') : null);
	});

	// Handles special case for local libraries
	if (file == null && mode == App.MODE_DEVICE)
	{
		file = new LocalLibrary(this, xml, name);
	}
	
	if (file == null)
	{
		this.pickFolder(mode, mxUtils.bind(this, function(folderId)
		{
			if (mode == App.MODE_GOOGLE && this.drive != null && this.spinner.spin(document.body, mxResources.get('inserting')))
			{
				this.drive.insertFile(name, xml, folderId, mxUtils.bind(this, function(newFile)
				{
					this.spinner.stop();
					this.hideDialog(true);
					this.libraryLoaded(newFile, images);
				}), error, this.drive.libraryMimeType);
			}
			else if (mode == App.MODE_GITHUB && this.gitHub != null && this.spinner.spin(document.body, mxResources.get('inserting')))
			{
				this.gitHub.insertLibrary(name, xml, mxUtils.bind(this, function(newFile)
				{
					this.spinner.stop();
					this.hideDialog(true);
					this.libraryLoaded(newFile, images);
				}), error, folderId);
			}
			else if (mode == App.MODE_TRELLO && this.trello != null && this.spinner.spin(document.body, mxResources.get('inserting')))
			{
				this.trello.insertLibrary(name, xml, mxUtils.bind(this, function(newFile)
				{
					this.spinner.stop();
					this.hideDialog(true);
					this.libraryLoaded(newFile, images);
				}), error, folderId);
			}
			else if (mode == App.MODE_DROPBOX && this.dropbox != null && this.spinner.spin(document.body, mxResources.get('inserting')))
			{
				this.dropbox.insertLibrary(name, xml, mxUtils.bind(this, function(newFile)
				{
					this.spinner.stop();
					this.hideDialog(true);
					this.libraryLoaded(newFile, images);
				}), error, folderId);
			}
			else if (mode == App.MODE_ONEDRIVE && this.oneDrive != null && this.spinner.spin(document.body, mxResources.get('inserting')))
			{
				this.oneDrive.insertLibrary(name, xml, mxUtils.bind(this, function(newFile)
				{
					this.spinner.stop();
					this.hideDialog(true);
					this.libraryLoaded(newFile, images);
				}), error, folderId);
			}
			else if (mode == App.MODE_BROWSER)
			{
				var fn = mxUtils.bind(this, function()
				{
					var file = new StorageLibrary(this, xml, name);
					
					// Inserts data into local storage
					file.saveFile(name, false, mxUtils.bind(this, function()
					{
						this.hideDialog(true);
						this.libraryLoaded(file, images);
					}), error);
				});
				
				if (localStorage.getItem(name) == null)
				{
					fn();
				}
				else
				{
					this.confirm(mxResources.get('replaceIt', [name]), fn);
				}
			}
			else
			{
				this.handleError({message: mxResources.get('serviceUnavailableOrBlocked')});
			}
		}));
	}
	else if (noSpin || this.spinner.spin(document.body, mxResources.get('saving')))
	{
		file.setData(xml);
		
		var doSave = mxUtils.bind(this, function()
		{
			file.save(true, mxUtils.bind(this, function(resp)
			{
				this.spinner.stop();
				this.hideDialog(true);
				
				if (!noReload)
				{
					this.libraryLoaded(file, images);
				}
				
				if (fn != null)
				{
					fn();
				}
			}), error);
		});
		
		if (name != file.getTitle())
		{
			var oldHash = file.getHash();
			
			file.rename(name, mxUtils.bind(this, function(resp)
			{
				// Change hash in stored settings
				if (file.constructor != LocalLibrary && oldHash != file.getHash())
				{
					mxSettings.removeCustomLibrary(oldHash);
					mxSettings.addCustomLibrary(file.getHash());
				}

				// Workaround for library files changing hash so
				// the old library cannot be removed from the
				// sidebar using the updated file in libraryLoaded
				this.removeLibrarySidebar(oldHash);

				doSave();
			}), error)
		}
		else
		{
			doSave();
		}
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
App.prototype.saveFile = function(forceDialog)
{
	var file = this.getCurrentFile();
	
	if (file != null)
	{
		// FIXME: Invoke for local files
		var done = mxUtils.bind(this, function()
		{
			this.removeDraft();
			
			// Workaround for possible status update while save as dialog is showing
			// is to show no saved status for device files
			if (file.getMode() != App.MODE_DEVICE)
			{
				this.editor.setStatus(mxUtils.htmlEntities(mxResources.get('allChangesSaved')));
			}
			else
			{
				this.editor.setStatus('');
			}
		});
		
		if (!forceDialog && file.getTitle() != null && this.mode != null)
		{
			this.save(file.getTitle(), done);
		}
		else
		{
			var filename = (file.getTitle() != null) ? file.getTitle() : this.defaultFilename;
			var allowTab = !mxClient.IS_IOS || !navigator.standalone;
			var prev = this.mode;
			var serviceCount = this.getServiceCount(true);
			
			if (isLocalStorage)
			{
				serviceCount++;
			}
			
			var rowLimit = (serviceCount <= 4) ? 2 : (serviceCount > 6 ? 4 : 3);
			
			var dlg = new CreateDialog(this, filename, mxUtils.bind(this, function(name, mode)
			{
				if (name != null && name.length > 0)
				{
					if (prev == null && mode == App.MODE_DEVICE)
					{
						this.setMode(App.MODE_DEVICE);
						this.save(name, done);
					}
					else if (mode == 'download')
					{
						var tmp = new LocalFile(this, null, name);
						tmp.save();
					}
					else if (mode == '_blank')
					{
						window.openFile = new OpenFile(function()
						{
							window.openFile = null;
						});
						
						// Do not use a filename to use undefined mode
						window.openFile.setData(this.getFileData(true));
						this.openLink(this.getUrl(window.location.pathname));
					}
					else if (prev != mode)
					{
						this.pickFolder(mode, mxUtils.bind(this, function(folderId)
						{
							this.createFile(name, this.getFileData(/(\.xml)$/i.test(name) ||
								name.indexOf('.') < 0, /(\.svg)$/i.test(name),
								/(\.html)$/i.test(name)), null, mode, done,
								this.mode == null, folderId);
						}), mode !== App.MODE_GITHUB);
					}
					else if (mode != null)
					{
						this.save(name, done);
					}
				}
			}), mxUtils.bind(this, function()
			{
				this.hideDialog();
			}), mxResources.get('saveAs'), mxResources.get('download'), null, null, allowTab,
				(this.isOffline()) ? null :
				'https://desk.draw.io/support/solutions/articles/16000042485',
				true, rowLimit);
			this.showDialog(dlg.container, 460, (serviceCount > rowLimit) ? 390 : 270, true, true);
			dlg.init();
		}
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
EditorUi.prototype.loadTemplate = function(url, onload, onerror)
{
	var realUrl = url;
	
	if (!this.isCorsEnabledForUrl(realUrl))
	{
		var nocache = 't=' + new Date().getTime();
		realUrl = PROXY_URL + '?url=' + encodeURIComponent(url) + '&' + nocache;
	}
	
	this.loadUrl(realUrl, mxUtils.bind(this, function(data)
	{
		if (!this.isOffline() && new XMLHttpRequest().upload && this.isRemoteFileFormat(data, url))
		{
			// Asynchronous parsing via server
			this.parseFile(new Blob([data], {type: 'application/octet-stream'}), mxUtils.bind(this, function(xhr)
			{
				if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status <= 299 &&
					xhr.responseText.substring(0, 13) == '<mxGraphModel')
				{
					onload(xhr.responseText);
				}
			}), url);
		}
		else
		{
			if (/(\.png)($|\?)/i.test(url))
			{
				data = this.extractGraphModelFromPng(data);
			}
			
			onload(data);
		}
	}), onerror, /(\.png)($|\?)/i.test(url));
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.getPeerForMode = function(mode)
{
	if (mode == App.MODE_GOOGLE)
	{
		return this.drive;
	}
	else if (mode == App.MODE_GITHUB)
	{
		return this.gitHub;
	}
	else if (mode == App.MODE_DROPBOX)
	{
		return this.dropbox;
	}
	else if (mode == App.MODE_ONEDRIVE)
	{
		return this.oneDrive;
	}
	else if (mode == App.MODE_TRELLO)
	{
		return this.trello;
	} 
	else
	{
		return null;
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.createFile = function(title, data, libs, mode, done, replace, folderId, tempFile)
{
	mode = (tempFile) ? null : ((mode != null) ? mode : this.mode);

	if (title != null && this.spinner.spin(document.body, mxResources.get('inserting')))
	{
		data = (data != null) ? data : this.emptyDiagramXml;
		
		var complete = mxUtils.bind(this, function()
		{
			this.spinner.stop();
		});
		
		var error = mxUtils.bind(this, function(resp)
		{
			complete();
			
			if (resp == null && this.getCurrentFile() == null && this.dialog == null)
			{
				this.showSplash();
			}
			else if (resp != null)
			{
				this.handleError(resp);
			}
		});
		
		if (mode == App.MODE_GOOGLE && this.drive != null)
		{
			folderId = (this.stateArg != null) ? this.stateArg.folderId : folderId;

			this.drive.insertFile(title, data, folderId, mxUtils.bind(this, function(file)
			{
				complete();
				this.fileCreated(file, libs, replace, done);
			}), error);
		}
		else if (mode == App.MODE_GITHUB && this.gitHub != null)
		{
			this.pickFolder(mode, mxUtils.bind(this, function(folderId)
			{
				this.gitHub.insertFile(title, data, mxUtils.bind(this, function(file)
				{
					complete();
					this.fileCreated(file, libs, replace, done);
				}), error, false, folderId);
			}));
		}
		else if (mode == App.MODE_TRELLO && this.trello != null)
		{
			this.trello.insertFile(title, data, mxUtils.bind(this, function(file)
			{
				complete();
				this.fileCreated(file, libs, replace, done);
			}), error, false, folderId);
		}
		else if (mode == App.MODE_DROPBOX && this.dropbox != null)
		{
			this.dropbox.insertFile(title, data, mxUtils.bind(this, function(file)
			{
				complete();
				this.fileCreated(file, libs, replace, done);
			}), error);
		}
		else if (mode == App.MODE_ONEDRIVE && this.oneDrive != null)
		{
			this.oneDrive.insertFile(title, data, mxUtils.bind(this, function(file)
			{
				complete();
				this.fileCreated(file, libs, replace, done);
			}), error, false, folderId);
		}
		else if (mode == App.MODE_BROWSER)
		{
			complete();
			
			var fn = mxUtils.bind(this, function()
			{
				var file = new StorageFile(this, data, title);
				
				// Inserts data into local storage
				file.saveFile(title, false, mxUtils.bind(this, function()
				{
					this.fileCreated(file, libs, replace, done);
				}), error);
			});
			
			if (localStorage.getItem(title) == null)
			{
				fn();
			}
			else
			{
				this.confirm(mxResources.get('replaceIt', [title]), fn, mxUtils.bind(this, function()
				{
					if (this.getCurrentFile() == null && this.dialog == null)
					{
						this.showSplash();
					}
				}));
			}
		}
		else
		{
			complete();
			this.fileCreated(new LocalFile(this, data, title, mode == null), libs, replace, done);
		}
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.fileCreated = function(file, libs, replace, done)
{
	var url = window.location.pathname;
	
	if (libs != null && libs.length > 0)
	{
		url += '?libs=' + libs;
	}
	
	url = this.getUrl(url);

	// Always opens a new tab for local files to avoid losing changes
	if (file.getMode() != App.MODE_DEVICE)
	{
		url += '#' + file.getHash();
	}
	
	// Makes sure to produce consistent output with finalized files via createFileData this needs
	// to save the file again since it needs the newly created file ID for redirecting in HTML
	if (this.spinner.spin(document.body, mxResources.get('inserting')))
	{
		var data = file.getData();
		var dataNode = (data.length > 0) ? this.editor.extractGraphModel(
			mxUtils.parseXml(data).documentElement, true) : null;
		var redirect = window.location.protocol + '//' + window.location.hostname + url;
		var node = dataNode;
		var graph = null;
		
		// Handles special case where SVG files need a rendered graph to be saved
		if (dataNode != null && /\.svg$/i.test(file.getTitle()))
		{
			graph = this.createTemporaryGraph(this.editor.graph.getStylesheet());
			document.body.appendChild(graph.container);
			node = this.decodeNodeIntoGraph(node, graph);
		}
		
		file.setData(this.createFileData(dataNode, graph, file, redirect));

		if (graph != null)
		{
			graph.container.parentNode.removeChild(graph.container);
		}

		var complete = mxUtils.bind(this, function()
		{
			this.spinner.stop();
		});
		
		var fn = mxUtils.bind(this, function()
		{
			complete();
			
			var currentFile = this.getCurrentFile();
			
			if (replace == null && currentFile != null)
			{
				replace = !currentFile.isModified() && currentFile.getMode() == null;
			}
			
			var fn3 = mxUtils.bind(this, function()
			{
				window.openFile = null;
				this.fileLoaded(file);
				
				if (replace)
				{
					this.editor.setStatus(mxUtils.htmlEntities(mxResources.get('allChangesSaved')));
				}
				
				if (libs != null)
				{
					this.sidebar.showEntries(libs);
				}
			});

			var fn2 = mxUtils.bind(this, function()
			{
				if (replace || currentFile == null || !currentFile.isModified())
				{
					fn3();
				}
				else
				{
					this.confirm(mxResources.get('allChangesLost'), null, fn3,
						mxResources.get('cancel'), mxResources.get('discardChanges'));
				}
			});

			if (done != null)
			{
				done();
			}
			
			// Opens the file in a new window
			if (replace != null && !replace)
			{
				// Opens local file in a new window
				if (file.constructor == LocalFile)
				{
					window.openFile = new OpenFile(function()
					{
						window.openFile = null;
					});
						
					window.openFile.setData(file.getData(), file.getTitle(), file.getMode() == null);
				}

				if (done != null)
				{
					done();
				}
				
				window.openWindow(url, null, fn2);
			}
			else
			{
				fn2();
			}
		});
		
		// Updates data in memory for local files and save is implicit
		// via start of realtime for DriveFiles
		if (file.constructor == LocalFile || file.constructor == DriveFile)
		{
			fn();
		}
		else
		{
			file.saveFile(file.getTitle(), false, mxUtils.bind(this, function()
			{
				fn();
			}), mxUtils.bind(this, function(resp)
			{
				complete();
				this.handleError(resp);
			}));
		}
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.loadFile = function(id, sameWindow, file)
{
	this.hideDialog();
	
	var fn2 = mxUtils.bind(this, function()
	{
		if (id == null || id.length == 0)
		{
			this.editor.setStatus('');
			this.fileLoaded(null);
		}
		else if (this.spinner.spin(document.body, mxResources.get('loading')))
		{
			// Handles files from localStorage
			if (id.charAt(0) == 'L')
			{
				this.spinner.stop();

				if (!isLocalStorage)
				{
					this.handleError({message: mxResources.get('serviceUnavailableOrBlocked')}, mxResources.get('errorLoadingFile'), mxUtils.bind(this, function()
					{
						var tempFile = this.getCurrentFile();
						window.location.hash = (tempFile != null) ? tempFile.getHash() : '';
					}));
				}
				else
				{
					try
					{
						id = decodeURIComponent(id.substring(1));
						var data = localStorage.getItem(id);
						
						if (data != null)
						{
							this.fileLoaded(new StorageFile(this, data, id));
						}
						else
						{
							throw {message: mxResources.get('fileNotFound')};
						}
					}
					catch (e)
					{
						this.handleError(e, mxResources.get('errorLoadingFile'), mxUtils.bind(this, function()
						{
							var tempFile = this.getCurrentFile();
							window.location.hash = (tempFile != null) ? tempFile.getHash() : '';
						}));
					}
				}
			}
			else if (file != null)
			{
				// File already loaded
				this.spinner.stop();
				this.fileLoaded(file);
			}
			else if (id.charAt(0) == 'R')
			{
				// Raw file encoded into URL
				this.spinner.stop();
				var data = decodeURIComponent(id.substring(1));
				
				if (data.charAt(0) != '<')
				{
					data = this.editor.graph.decompress(data);
				}
				
				var tempFile = new LocalFile(this, data, (urlParams['title'] != null) ?
					decodeURIComponent(urlParams['title']) : this.defaultFilename, true);
				tempFile.getHash = function()
				{
					return id;
				};
				this.fileLoaded(tempFile);
			}
			else if (id.charAt(0) == 'U')
			{
				var url = decodeURIComponent(id.substring(1));
				
				this.loadTemplate(url, mxUtils.bind(this, function(text)
				{
					this.spinner.stop();
					
					if (text != null && text.length > 0)
					{
						var filename = this.defaultFilename;
						
						// Tries to find name from URL with valid extensions
						if (urlParams['title'] == null && urlParams['notitle'] != '1')
						{
							var tmp = url;
							var dot = url.lastIndexOf('.');
							var slash = tmp.lastIndexOf('/');
							
							if (dot > slash && slash > 0)
							{
								tmp = tmp.substring(slash + 1, dot);
								var ext = url.substring(dot);
								
								if (!this.useCanvasForExport && ext == '.png')
								{
									ext = '.xml';
								}

								if (ext === '.svg' || ext === '.xml' ||
									ext === '.html' || ext === '.png')
								{
									filename = tmp + ext;
								}
							}
						}
						
						var tempFile = new LocalFile(this, text, (urlParams['title'] != null) ?
							decodeURIComponent(urlParams['title']) : filename, true);
						tempFile.getHash = function()
						{
							return id;
						};
						
						if (!this.fileLoaded(tempFile))
						{
							// Fallback for non-public Google Drive diagrams
							if (url.substring(0, 31) == 'https://drive.google.com/uc?id=' &&
								(this.drive != null || typeof window.DriveClient === 'function'))
							{
								this.hideDialog();
								
								var fallback = mxUtils.bind(this, function()
								{
									if (this.drive != null)
									{
										this.spinner.stop();
										this.loadFile('G' + url.substring(31, url.lastIndexOf('&')), sameWindow);
										
										return true;
									}
									else
									{
										return false;
									}
								});
								
								if (!fallback() && this.spinner.spin(document.body, mxResources.get('loading')))
								{
									this.addListener('clientLoaded', fallback);
								}
							}
						}
					}
				}), mxUtils.bind(this, function()
				{
					this.spinner.stop();
					this.handleError({message: mxResources.get('fileNotFound')}, mxResources.get('errorLoadingFile'));
				}));
			}
			else
			{
				// Google Drive files are handled as default file types
				var peer = null;
				
				if (id.charAt(0) == 'G')
				{
					peer = this.drive;
				}
				else if (id.charAt(0) == 'D')
				{
					peer = this.dropbox;
				}
				else if (id.charAt(0) == 'W')
				{
					peer = this.oneDrive;
				}
				else if (id.charAt(0) == 'H')
				{
					peer = this.gitHub;
				}
				else if (id.charAt(0) == 'T')
				{
					peer = this.trello;
				}
				
				if (peer == null)
				{
					this.handleError({message: mxResources.get('serviceUnavailableOrBlocked')}, mxResources.get('errorLoadingFile'), mxUtils.bind(this, function()
					{
						var file = this.getCurrentFile();
						window.location.hash = (file != null) ? file.getHash() : '';
					}));
				}
				else
				{
					id = decodeURIComponent(id.substring(1));
					
					peer.getFile(id, mxUtils.bind(this, function(file)
					{
						this.spinner.stop();
						this.fileLoaded(file);
					}), mxUtils.bind(this, function(resp)
					{
						// Makes sure the file does not save the invalid UI model and overwrites anything important
						if (window.console != null && resp != null)
						{
							console.log('error in loadFile:', id, resp);
						}
						
						this.handleError(resp, (resp != null) ? mxResources.get('errorLoadingFile') : null, mxUtils.bind(this, function()
						{
							var file = this.getCurrentFile();
							
							if (file == null)
							{
								window.location.hash = '';
								this.showSplash();
							}
							else
							{
								window.location.hash = file.getHash();	
							}
						}));
					}));
				}
			}
		}
	});
	
	var currentFile = this.getCurrentFile();
	
	var fn = mxUtils.bind(this, function()
	{
		if (currentFile == null || !currentFile.isModified())
		{
			fn2();
		}
		else
		{
			this.confirm(mxResources.get('allChangesLost'), mxUtils.bind(this, function()
			{
				if (currentFile != null)
				{
					window.location.hash = currentFile.getHash();
				}
			}), fn2, mxResources.get('cancel'), mxResources.get('discardChanges'));
		}
	});
	
	if (id == null || id.length == 0)
	{
		fn();
	}
	else if (currentFile != null && currentFile.isModified() && !sameWindow)
	{
		window.openWindow(this.getUrl() + '#' + id, null, fn);
	}
	else
	{
		fn();
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.getLibraryStorageHint = function(file)
{
	var tip = file.getTitle();
	
	if (file.constructor != LocalLibrary)
	{
		tip += '\n' + file.getHash();
	}
	
	if (file.constructor == DriveLibrary)
	{
		tip += ' (' + mxResources.get('googleDrive') + ')';
	}
	else if (file.constructor == GitHubLibrary)
	{
		tip += ' (' + mxResources.get('github') + ')';
	}
	else if (file.constructor == TrelloLibrary)
	{
		tip += ' (' + mxResources.get('trello') + ')';
	}
	else if (file.constructor == DropboxLibrary)
	{
		tip += ' (' + mxResources.get('dropbox') + ')';
	}
	else if (file.constructor == OneDriveLibrary)
	{
		tip += ' (' + mxResources.get('oneDrive') + ')';
	}
	else if (file.constructor == StorageLibrary)
	{
		tip += ' (' + mxResources.get('browser') + ')';
	}
	else if (file.constructor == LocalLibrary)
	{
		tip += ' (' + mxResources.get('device') + ')';
	}

	return tip;
};

/**
 * Updates action states depending on the selection.
 */
App.prototype.restoreLibraries = function()
{
	if (this.sidebar != null)
	{
		if (this.pendingLibraries == null)
		{
			this.pendingLibraries = new Object();
		}
		
		// Ignores this library next time
		var ignore = mxUtils.bind(this, function(id)
		{
			mxSettings.removeCustomLibrary(id);	
			delete this.pendingLibraries[id];
		});
				
		var load = mxUtils.bind(this, function(libs)
		{
			if (libs != null)
			{
				for (var i = 0; i < libs.length; i++)
				{
					var name = encodeURIComponent(decodeURIComponent(libs[i]));
					
					(mxUtils.bind(this, function(id)
					{
						if (id != null && id.length > 0 && this.pendingLibraries[id] == null &&
							this.sidebar.palettes[id] == null)
						{
							this.pendingLibraries[id] = true;
							var service = id.substring(0, 1);
							
							if (service == 'L')
							{
								if (isLocalStorage || mxClient.IS_CHROMEAPP)
								{
									try
									{
										var name = decodeURIComponent(id.substring(1));
										var xml = this.getLocalData(name, mxUtils.bind(this, function(xml)
										{
											if (name == '.scratchpad' && xml == null)
											{
												xml = this.emptyLibraryXml;
											}
											
											if (xml != null)
											{
												this.loadLibrary(new StorageLibrary(this, xml, name));
											}
											else
											{
												ignore(id);
											}
										}));
									}
									catch (e)
									{
										ignore(id);
									}
								}
							}
							else if (service == 'U')
							{
								var url = decodeURIComponent(id.substring(1));
								
								if (!this.isOffline())
								{
									var realUrl = url;
									
									if (!this.isCorsEnabledForUrl(realUrl))
									{
										var nocache = 't=' + new Date().getTime();
										realUrl = PROXY_URL + '?url=' + encodeURIComponent(url) + '&' + nocache;
									}
									
									// Uses proxy to avoid CORS issues
									mxUtils.get(realUrl, mxUtils.bind(this, function(req)
									{
										if (req.getStatus() >= 200 && req.getStatus() <= 299)
										{
											try
											{
												this.loadLibrary(new UrlLibrary(this, req.getText(), url));
												delete this.pendingLibraries[id];
											}
											catch (e)
											{
												ignore(id);
											}
										}
										else
										{
											ignore(id);
										}
									}), function()
									{
										ignore(id);
									});
								}
							}
							else
							{
								var peer = null;
								
								if (service == 'G')
								{
									if (this.drive != null && this.drive.user != null)
									{
										peer = this.drive;
									}
								}
								else if (service == 'H')
								{
									if (this.gitHub != null && this.gitHub.getUser() != null)
									{
										peer = this.gitHub;
									}
								}
								else if (service == 'T')
								{
									if (this.trello != null && this.trello.isAuthorized())
									{
										peer = this.trello;
									}
								}
								else if (service == 'D')
								{
									if (this.dropbox != null && this.dropbox.getUser() != null)
									{
										peer = this.dropbox;
									}
								}
								else if (service == 'W')
								{
									if (this.oneDrive != null && this.oneDrive.getUser() != null)
									{
										peer = this.oneDrive;
									}
								}
								
								if (peer != null)
								{
									peer.getLibrary(decodeURIComponent(id.substring(1)), mxUtils.bind(this, function(file)
									{
										try
										{
											this.loadLibrary(file);
											delete this.pendingLibraries[id];
										}
										catch (e)
										{
											ignore(id);
										}
									}), function(resp)
									{
										ignore(id);
									});
								}
								else
								{
									delete this.pendingLibraries[id];
								}
							}
						}
					}))(name);
				}
			}
		});
		
		load(mxSettings.getCustomLibraries());
		load((urlParams['clibs'] || '').split(';'));
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.updateButtonContainer = function()
{
	if (this.buttonContainer != null)
	{
		var file = this.getCurrentFile();
		
		if (file != null && file.constructor == DriveFile)
		{
			// Adds Share button
			if (this.shareButton == null)
			{
				this.shareButton = document.createElement('div');
				this.shareButton.className = 'geBtn gePrimaryBtn';
				this.shareButton.style.display = 'inline-block';
				this.shareButton.style.padding = '0 10px 0 10px';
				this.shareButton.style.marginTop = '-4px';
				this.shareButton.style.height = '28px';
				this.shareButton.style.lineHeight = '28px';
				this.shareButton.style.minWidth = '0px';
				this.shareButton.style.cssFloat = 'right';
				
				var icon = document.createElement('img');
				icon.setAttribute('src', this.shareImage);
				icon.setAttribute('align', 'absmiddle');
				icon.style.marginRight = '4px';
				icon.style.marginTop = '-3px';
				this.shareButton.appendChild(icon);
				
				mxUtils.write(this.shareButton, mxResources.get('share'));
				
				mxEvent.addListener(this.shareButton, 'click', mxUtils.bind(this, function()
				{
					this.actions.get('share').funct();
				}));
				
				this.buttonContainer.appendChild(this.shareButton);
			} 
		}
		else if (this.shareButton != null)
		{
			this.shareButton.parentNode.removeChild(this.shareButton);
			this.shareButton = null;
		}
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.save = function(name, done)
{
	var file = this.getCurrentFile();
	var msg = mxResources.get('saving');
	
	if (file != null && file.constructor == DriveFile)
	{
		msg = mxResources.get('createRevision');
	}
	
	if (file != null && this.spinner.spin(document.body, msg))
	{
		this.editor.setStatus('');
		
		if (this.editor.graph.isEditing())
		{
			this.editor.graph.stopEditing();
		}
		
		var success = mxUtils.bind(this, function(resp)
		{
			this.spinner.stop();
			
			if (this.getCurrentFile() == file)
			{
				if (file.isModified())
				{
					if (!file.isAutosave())
					{
						file.addUnsavedStatus();
					}
				}
				else
				{
					this.editor.setStatus(mxUtils.htmlEntities(mxResources.get('allChangesSaved')));
				}
			}
			
			if (done != null)
			{
				done();
			}
		});
		
		var error = mxUtils.bind(this, function(resp)
		{
			// Spinner is paused and resumed in handleError
			this.handleError(resp, (resp != null) ? mxResources.get('errorSavingFile') : null);
		});
		
		if (name == file.getTitle())
		{
			file.save(true, success, error);
		}
		else
		{
			file.saveAs(name, success, error)
		}
	}
};

/**
 * Invokes callback with null if mode does not support folder or not null
 * if a valid folder was chosen for a mode that supports it. No callback
 * is made if no folder was chosen for a mode that supports it.
 */
App.prototype.pickFolder = function(mode, fn, enabled)
{
	enabled = (enabled != null) ? enabled : true;
	var resume = this.spinner.pause();
	
	if (enabled && mode == App.MODE_GOOGLE && this.drive != null)
	{
		// Shows a save dialog
		this.drive.pickFolder(mxUtils.bind(this, function(evt)
		{
			resume();
			
			if (evt.action == google.picker.Action.PICKED)
			{
				var folderId = null;
				
				if (evt.docs != null && evt.docs.length > 0 && evt.docs[0].type == 'folder')
				{
					folderId = evt.docs[0].id;
				}
				
				fn(folderId);
			}
		}));
	}
	else if (enabled && mode == App.MODE_ONEDRIVE && this.oneDrive != null)
	{
		this.oneDrive.pickFolder(mxUtils.bind(this, function(files)
		{
			var folderId = null;
			resume();
			
			if (files != null && files.value != null && files.value.length > 0)
			{
				folderId = files.value[0].id;
        		fn(folderId);
			}
		}));
	}
	else if (enabled && mode == App.MODE_GITHUB && this.gitHub != null)
	{
		this.gitHub.pickFolder(mxUtils.bind(this, function(folderPath)
		{
			resume();
			fn(folderPath);
		}));
	}
	else if (enabled && mode == App.MODE_TRELLO && this.trello != null)
	{
		this.trello.pickFolder(mxUtils.bind(this, function(cardId)
		{
			resume();
			fn(cardId);
		}));
	}
	else
	{
		EditorUi.prototype.pickFolder.apply(this, arguments);
	}
};

/**
 * 
 */
App.prototype.exportFile = function(data, filename, mimeType, base64Encoded, mode, folderId)
{
	if (mode == App.MODE_DROPBOX)
	{
		if (this.dropbox != null && this.spinner.spin(document.body, mxResources.get('saving')))
		{
			// LATER: Add folder picker
			this.dropbox.insertFile(filename, (base64Encoded) ? this.base64ToBlob(data, mimeType) :
				data, mxUtils.bind(this, function()
			{
				this.spinner.stop();
			}), mxUtils.bind(this, function(resp)
			{
				this.spinner.stop();
				this.handleError(resp);
			}));
		}
	}
	else if (mode == App.MODE_GOOGLE)
	{
		if (this.drive != null && this.spinner.spin(document.body, mxResources.get('saving')))
		{
			this.drive.insertFile(filename, data, folderId, mxUtils.bind(this, function(resp)
			{
				// TODO: Add callback with url param for clickable status message
				// "File exported. Click here to open folder."
//				this.editor.setStatus('<div class="geStatusMessage" style="cursor:pointer;">' +
//					mxResources.get('saved') + '</div>');
//				
//				// Installs click handler for opening
//				if (this.statusContainer != null)
//				{
//					var links = this.statusContainer.getElementsByTagName('div');
//					
//					if (links.length > 0)
//					{
//						mxEvent.addListener(links[0], 'click', mxUtils.bind(this, function()
//						{
//							if (resp != null && resp.parents != null && resp.parents.length > 0)
//							{
//								var id = resp.parents[0].id;
//								
//								if (id != null)
//								{
//									window.open('https://drive.google.com/drive/folders/' + id);
//								}
//							}
//						}));
//					}
//				}
					
				this.spinner.stop();
			}), mxUtils.bind(this, function(resp)
			{
				this.spinner.stop();
				this.handleError(resp);
			}), mimeType, base64Encoded, false);
		}
	}
	else if (mode == App.MODE_ONEDRIVE)
	{
		if (this.oneDrive != null && this.spinner.spin(document.body, mxResources.get('saving')))
		{
			// KNOWN: OneDrive does not show .svg extension
			this.oneDrive.insertFile(filename, (base64Encoded) ? this.base64ToBlob(data, mimeType) :
				data, mxUtils.bind(this, function()
			{
				this.spinner.stop();
			}), mxUtils.bind(this, function(resp)
			{
				this.spinner.stop();
				this.handleError(resp);
			}), false, folderId);
		}
	}
	else if (mode == App.MODE_GITHUB)
	{
		if (this.gitHub != null && this.spinner.spin(document.body, mxResources.get('saving')))
		{
			// Must insert file as library to force the file to be written
			this.gitHub.insertFile(filename, data, mxUtils.bind(this, function()
			{
				this.spinner.stop();
			}), mxUtils.bind(this, function(resp)
			{
				this.spinner.stop();
				this.handleError(resp);
			}), true, folderId, base64Encoded);
		}
	}
	else if (mode == App.MODE_TRELLO)
	{
		if (this.trello != null && this.spinner.spin(document.body, mxResources.get('saving')))
		{
			this.trello.insertFile(filename, (base64Encoded) ? this.base64ToBlob(data, mimeType) :
				data, mxUtils.bind(this, function()
			{
				this.spinner.stop();
			}), mxUtils.bind(this, function(resp)
			{
				this.spinner.stop();
				this.handleError(resp);
			}), false, folderId);
		}
	}
	else if (mode == App.MODE_BROWSER)
	{
		var fn = mxUtils.bind(this, function()
		{
			localStorage.setItem(filename, data);
		});
		
		if (localStorage.getItem(filename) == null)
		{
			fn();
		}
		else
		{
			this.confirm(mxResources.get('replaceIt', [filename]), fn);
		}
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.descriptorChanged = function()
{
	var file = this.getCurrentFile();
	
	if (file != null)
	{
		if (this.fname != null)
		{
			this.fnameWrapper.style.display = 'block';
			this.fname.innerHTML = '';
			var filename = (file.getTitle() != null) ? file.getTitle() : this.defaultFilename;
			mxUtils.write(this.fname, filename);
			this.fname.setAttribute('title', filename + ' - ' + mxResources.get('rename'));
		}
		
		this.editor.graph.setEnabled(file.isEditable());
		
		// Ignores title and hash for revisions
		if (urlParams['rev'] == null)
		{
			this.updateDocumentTitle();
			var newHash = file.getHash();
			
			if (newHash.length > 0)
			{
				window.location.hash = newHash;
			}
			else if (window.location.hash.length > 0)
			{
				window.location.hash = '';
			}
		}
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.toggleChat = function()
{
	var file = this.getCurrentFile();
	
	if (file != null)
	{
		if (file.chatWindow == null)
		{
			var cwLeft = document.body.offsetWidth - 300;
			file.chatWindow = new ChatWindow(this, mxResources.get('chatWindowTitle'), document.getElementById('geChat'), cwLeft , 80, 250, 350, file.realtime);
			file.chatWindow.window.setVisible(false);
		}
		
		file.chatWindow.window.setVisible(!file.chatWindow.window.isVisible());
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
App.prototype.showAuthDialog = function(peer, showRememberOption, fn, closeFn)
{
	var resume = this.spinner.pause();
	
	this.showDialog(new AuthDialog(this, peer, showRememberOption, mxUtils.bind(this, function(remember)
	{
		try
		{
			if (fn != null)
			{
				fn(remember, mxUtils.bind(this, function()
				{
					this.hideDialog();
					resume();
				}));
			}
		}
		catch (e)
		{
			this.editor.setStatus(mxUtils.htmlEntities(e.message));
		}
	})).container, 300, (showRememberOption) ? 180 : 140, true, true, mxUtils.bind(this, function(cancel)
	{
		if (closeFn != null)
		{
			closeFn();
		}
		
		if (cancel && this.getCurrentFile() == null && this.dialog == null)
		{
			this.showSplash();
		}
	}));
};

/**
 * Checks if the client is authorized and calls the next step. The optional
 * readXml argument is used for import. Default is false. The optional
 * readLibrary argument is used for reading libraries. Default is false.
 */
App.prototype.convertFile = function(url, filename, mimeType, extension, success, error)
{
	var name = filename;
	
	// SVG file extensions are valid and needed for image import
	if (!/\.svg$/i.test(name))
	{
		name = name.substring(0, filename.lastIndexOf('.')) + extension;
	}
	
	var gitHubUrl = false;
	
	if (this.gitHub != null && url.substring(0, this.gitHub.baseUrl.length) == this.gitHub.baseUrl)
	{
		gitHubUrl = true;
	}
	
	// Workaround for wrong binary response with VSDX files
	if (/\.vsdx$/i.test(filename) && Graph.fileSupport && new XMLHttpRequest().upload &&
		typeof new XMLHttpRequest().responseType === 'string')
	{
		var req = new XMLHttpRequest();
		req.open('GET', url, true);
		
		if (!gitHubUrl)
		{
			req.responseType = 'blob';
		}

		req.onload = mxUtils.bind(this, function()
		{
			var blob = null;
			
			if (gitHubUrl)
			{
				var file = JSON.parse(req.responseText);
				blob = this.base64ToBlob(file.content, 'application/octet-stream');
			}
			else
			{
				blob = new Blob([req.response], {type: 'application/octet-stream'});
			}

			this.parseFile(blob, mxUtils.bind(this, function(xhr)
			{
				if (xhr.readyState == 4)
				{
					if (xhr.status >= 200 && xhr.status <= 299)
					{
						success(new LocalFile(this, xhr.responseText, name, true));
					}
					else if (error != null)
					{
						error({message: mxResources.get('errorLoadingFile')});
					}
				}
			}), filename);
		});

		req.send();
	}
	else
	{
		var handleData = mxUtils.bind(this, function(data)
		{
			try
			{
				if (/\.png$/i.test(filename))
				{
					temp = this.extractGraphModelFromPng(data);
					
					if (temp != null)
					{
						success(new LocalFile(this, temp, name, true));
					}
					else
					{
						success(new LocalFile(this, data, filename, true));
					}
				}
				else if (Graph.fileSupport && new XMLHttpRequest().upload && this.isRemoteFileFormat(data, url))
				{
					this.parseFile(new Blob([data], {type: 'application/octet-stream'}), mxUtils.bind(this, function(xhr)
					{
						if (xhr.readyState == 4)
						{
							if (xhr.status >= 200 && xhr.status <= 299)
							{
								success(new LocalFile(this, xhr.responseText, name, true));
							}
							else if (error != null)
							{
								error({message: mxResources.get('errorLoadingFile')});
							}
						}
					}), filename);
				}
				else
				{
					success(new LocalFile(this, data, name, true));
				}
			}
			catch (e)
			{
				if (error != null)
				{
					error(e);
				}
			}
		});

		var binary = /\.png$/i.test(filename) || /\.jpe?g$/i.test(filename) || (mimeType != null &&
			mimeType.substring(0, 6) == 'image/');
		
		// NOTE: Cannot force non-binary request via loadUrl so needs separate
		// code as decoding twice on content with binary data did not work
		if (gitHubUrl)
		{
			mxUtils.get(url, mxUtils.bind(this, function(req)
			{
				if (req.getStatus() >= 200 && req.getStatus() <= 299)
				{
			    	if (success != null)
			    	{
				    	var file = JSON.parse(req.getText());
				    	var data = file.content;
				    	
				    	if (file.encoding === 'base64')
				    	{
				    		if (/\.png$/i.test(filename))
					    	{
					    		data = 'data:image/png;base64,' + data;	
					    	}
					    	else
					    	{
					    		// Workaround for character encoding issues in IE10/11
					    		data = (window.atob && !mxClient.IS_IE && !mxClient.IS_IE11) ? atob(data) : Base64.decode(data);
					    	}
				    	}
				    	
				    	handleData(data);
			    	}
				}
				else if (error != null)
		    	{
		    		error({code: App.ERROR_UNKNOWN});
		    	}
			}), function()
			{
		    	if (error != null)
		    	{
		    		error({code: App.ERROR_UNKNOWN});
		    	}
			}, false, this.timeout, function()
		    {
		    	if (error != null)
				{
					error({code: App.ERROR_TIMEOUT, retry: fn});
				}
		    });
		}
		else
		{
			this.loadUrl(url, handleData, error, binary);
		}
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */ 
App.prototype.updateHeader = function()
{
	if (this.menubar != null)
	{
		this.appIcon = document.createElement('a');
		this.appIcon.style.display = 'block';
		this.appIcon.style.position = 'absolute';
		this.appIcon.style.width = '40px';
		this.appIcon.style.backgroundColor = '#fff';
		this.appIcon.style.height = this.menubarHeight + 'px';
		
		mxEvent.disableContextMenu(this.appIcon);
		
		mxEvent.addListener(this.appIcon, 'click', mxUtils.bind(this, function(evt)
		{
			this.appIconClicked(evt);
		}));
		
		// LATER: Use Alpha image loader in IE6
		// NOTE: This uses the diagram bit of the old logo as it looks better in this case
		//this.appIcon.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=' + IMAGE_PATH + '/logo-white.png,sizingMethod=\'scale\')';
		// var logo = (!mxClient.IS_SVG) ? 'url(\'' + IMAGE_PATH + '/logo-white.png\')' :
		// 	'url(data:image/png;base64,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)';
		var logo = 'url(\'' + IMAGE_PATH + '/design.png\')';
		this.appIcon.style.backgroundImage = logo;
		this.appIcon.style.backgroundPosition = 'center center';
		this.appIcon.style.backgroundRepeat = 'no-repeat';
		
		mxUtils.setPrefixedStyle(this.appIcon.style, 'transition', 'all 125ms linear');
	
		mxEvent.addListener(this.appIcon, 'mouseover', mxUtils.bind(this, function()
		{
			var file = this.getCurrentFile();
			
			if (file != null)
			{
				var mode = file.getMode();
				
				if (mode == App.MODE_GOOGLE)
				{
					this.appIcon.style.backgroundImage = 'url(' + IMAGE_PATH + '/google-drive-logo-white.svg)';
				}
				else if (mode == App.MODE_DROPBOX)
				{
					this.appIcon.style.backgroundImage = 'url(' + IMAGE_PATH + '/dropbox-logo-white.svg)';
				}
				else if (mode == App.MODE_ONEDRIVE)
				{
					this.appIcon.style.backgroundImage = 'url(' + IMAGE_PATH + '/onedrive-logo-white.svg)';
				}
				else if (mode == App.MODE_GITHUB)
				{
					this.appIcon.style.backgroundImage = 'url(' + IMAGE_PATH + '/github-logo-white.svg)';
				}
				else if (mode == App.MODE_TRELLO)
				{
					this.appIcon.style.backgroundImage = 'url(' + IMAGE_PATH + '/trello-logo-white-orange.svg)';
				}
			}
		}));
		
		mxEvent.addListener(this.appIcon, 'mouseout', mxUtils.bind(this, function()
		{
			this.appIcon.style.backgroundImage = logo;
		}));
		
		if (urlParams['embed'] != '1')
		{
			this.menubarContainer.appendChild(this.appIcon);
		}
	
		this.fnameWrapper = document.createElement('div');
		this.fnameWrapper.style.position = 'absolute';
		this.fnameWrapper.style.right = '120px';
		this.fnameWrapper.style.left = '50px';
		this.fnameWrapper.style.top = '6px';
		this.fnameWrapper.style.height = '26px';
		this.fnameWrapper.style.display = 'none';
		this.fnameWrapper.style.overflow = 'hidden';
		this.fnameWrapper.style.textOverflow = 'ellipsis';
		
		this.fname = document.createElement('a');
		this.fname.setAttribute('href', 'javascript:void(0);');
		this.fname.setAttribute('title', mxResources.get('rename'));
		this.fname.className = 'geItem';
		this.fname.style.padding = '2px 8px 2px 8px';
		this.fname.style.display = 'inline';
		this.fname.style.fontSize = '18px';
		this.fname.style.whiteSpace = 'nowrap';
		
		mxEvent.addListener(this.fname, 'click', mxUtils.bind(this, function(evt)
		{
			var file = this.getCurrentFile();
			
			if (file != null && file.isRenamable())
			{
				this.actions.get('rename').funct();
			}
			
			mxEvent.consume(evt);
		}));
		
		this.fnameWrapper.appendChild(this.fname);
		
		if (urlParams['embed'] != '1')
		{
			this.menubarContainer.appendChild(this.fnameWrapper);
		
			this.menubar.container.style.position = 'absolute';
			this.menubar.container.style.paddingLeft = '52px';
			this.menubar.container.style.boxSizing = 'border-box';
			this.menubar.container.style.top = '29px';
			
			this.toolbar.container.style.paddingLeft = '56px';
		}
		
		/**
		 * Adds format panel toggle.
		 */
		this.toggleFormatElement = document.createElement('a');
		this.toggleFormatElement.setAttribute('href', 'javascript:void(0);');
		this.toggleFormatElement.setAttribute('title', mxResources.get('formatPanel') + ' (' + Editor.ctrlKey + '+Shift+P)');
		this.toggleFormatElement.style.position = 'absolute';
		this.toggleFormatElement.style.display = 'inline-block';
		this.toggleFormatElement.style.top = '5px';
		this.toggleFormatElement.style.right = (uiTheme != 'atlas' && urlParams['embed'] != '1') ? '26px' : '10px';
		this.toggleFormatElement.style.padding = '2px';
		this.toggleFormatElement.style.fontSize = '14px';
		this.toggleFormatElement.className = (uiTheme != 'atlas') ? 'geButton' : '';
		this.toggleFormatElement.style.width = '16px';
		this.toggleFormatElement.style.height = '16px';
		this.toggleFormatElement.style.backgroundPosition = '50% 50%';
		this.toggleFormatElement.style.backgroundRepeat = 'no-repeat';
		this.toolbarContainer.appendChild(this.toggleFormatElement);

		mxEvent.addListener(this.toggleFormatElement, 'click', mxUtils.bind(this, function(evt)
		{
			this.actions.get('formatPanel').funct();
			mxEvent.consume(evt);
		}));

		var toggleFormatPanel = mxUtils.bind(this, function()
		{
			if (this.formatWidth > 0)
			{
				this.toggleFormatElement.style.backgroundImage = 'url(\'' + this.formatShowImage + '\')';
			}
			else
			{
				this.toggleFormatElement.style.backgroundImage = 'url(\'' + this.formatHideImage + '\')';
			}
		});
		
		this.addListener('formatWidthChanged', toggleFormatPanel);
		toggleFormatPanel();

		this.fullscreenElement = document.createElement('a');
		this.fullscreenElement.setAttribute('href', 'javascript:void(0);');
		this.fullscreenElement.setAttribute('title', mxResources.get('fullscreen'));
		this.fullscreenElement.style.position = 'absolute';
		this.fullscreenElement.style.display = 'inline-block';
		this.fullscreenElement.style.top = '5px';
		this.fullscreenElement.style.right = (uiTheme != 'atlas' && urlParams['embed'] != '1') ? '42px' : '26px';
		this.fullscreenElement.style.padding = '2px';
		this.fullscreenElement.style.fontSize = '14px';
		this.fullscreenElement.className = (uiTheme != 'atlas') ? 'geButton' : '';
		this.fullscreenElement.style.width = '16px';
		this.fullscreenElement.style.height = '16px';
		this.fullscreenElement.style.backgroundPosition = '50% 50%';
		this.fullscreenElement.style.backgroundRepeat = 'no-repeat';
		this.fullscreenElement.style.backgroundImage = 'url(\'' + this.fullscreenImage + '\')';
		this.toolbarContainer.appendChild(this.fullscreenElement);
		
		var initialPosition = this.hsplitPosition;
		var collapsed = false;

		mxEvent.addListener(this.fullscreenElement, 'click', mxUtils.bind(this, function(evt)
		{
			if (uiTheme != 'atlas' && urlParams['embed'] != '1')
			{
				this.toggleCompactMode(!collapsed);
			}

			this.toggleFormatPanel(!collapsed);
			this.hsplitPosition = (!collapsed) ? 0 : initialPosition;
			this.hideFooter();
			collapsed = !collapsed;
			mxEvent.consume(evt);
		}));
		
		// Some style changes in Atlas theme
		if (uiTheme == 'atlas')
		{
			mxUtils.setOpacity(this.toggleFormatElement, 70);
			mxUtils.setOpacity(this.fullscreenElement, 70);
			this.toggleFormatElement.style.right = '6px';
			this.fullscreenElement.style.right = '22px';
			this.toggleFormatElement.style.top = '8px';
			this.fullscreenElement.style.top = '8px';
		}
		
		/**
		 * Adds compact UI toggle.
		 */
		if (urlParams['embed'] != '1')
		{
			this.toggleElement = document.createElement('a');
			this.toggleElement.setAttribute('href', 'javascript:void(0);');
			this.toggleElement.setAttribute('title', mxResources.get('collapseExpand'));
			this.toggleElement.className = 'geButton';
			this.toggleElement.style.position = 'absolute';
			this.toggleElement.style.display = 'inline-block';
			this.toggleElement.style.width = '16px';
			this.toggleElement.style.height = '16px';
			this.toggleElement.style.color = '#666';
			this.toggleElement.style.top = '5px';
			this.toggleElement.style.right = '10px';
			this.toggleElement.style.padding = '2px';
			this.toggleElement.style.fontSize = '14px';
			this.toggleElement.style.textDecoration = 'none';
			this.toggleElement.style.backgroundImage = 'url(\'' + this.chevronUpImage + '\')';
				
			this.toggleElement.style.backgroundPosition = '50% 50%';
			this.toggleElement.style.backgroundRepeat = 'no-repeat';
			
			// Toggles compact mode
			mxEvent.addListener(this.toggleElement, 'click', mxUtils.bind(this, function(evt)
			{
				this.toggleCompactMode();
				mxEvent.consume(evt);
			}));
		
			if (uiTheme != 'atlas')
			{
				this.toolbarContainer.appendChild(this.toggleElement);
			}
			
			// Enable compact mode for small screens
			if (screen.height <= 740 && typeof this.toggleElement.click !== 'undefined')
			{
				window.setTimeout(mxUtils.bind(this, function()
				{
					this.toggleElement.click();
				}), 0);
			}
		}
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
App.prototype.toggleCompactMode = function(forceHide)
{
	if (!forceHide && this.appIcon.style.display == 'none')
	{
		this.menubar.container.style.position = 'absolute';
		this.menubar.container.style.paddingLeft = '52px';
		this.menubar.container.style.paddingTop = '';
		this.menubar.container.style.paddingBottom = '';
		this.menubar.container.style.top = '29px';
		this.toolbar.container.style.paddingLeft = '56px';
		this.buttonContainer.style.visibility = 'visible';
		this.appIcon.style.display = 'block';
		this.fnameWrapper.style.display = 'block';
		this.fnameWrapper.style.visibility = 'visible';
		this.menubarHeight = App.prototype.menubarHeight;
		this.refresh();
		this.toggleElement.style.backgroundImage = 'url(\'' + this.chevronUpImage + '\')';
	}
	else
	{
		this.menubar.container.style.position = 'relative';
		this.menubar.container.style.paddingLeft = '4px';
		this.menubar.container.style.paddingTop = '0px';
		this.menubar.container.style.paddingBottom = '0px';
		this.menubar.container.style.top = '0px';
		this.toolbar.container.style.paddingLeft = '4px';
		this.buttonContainer.style.visibility = 'hidden';
		this.appIcon.style.display = 'none';
		this.fnameWrapper.style.display = 'none';
		this.fnameWrapper.style.visibility = 'hidden';
		this.menubarHeight = EditorUi.prototype.menubarHeight;
		this.refresh();
		this.toggleElement.style.backgroundImage = 'url(\'' + this.chevronDownImage + '\')';
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
App.prototype.updateUserElement = function()
{
	if ((this.drive == null || this.drive.getUser() == null) &&
		(this.oneDrive == null || this.oneDrive.getUser() == null) &&
		(this.dropbox == null || this.dropbox.getUser() == null) &&
		(this.gitHub == null || this.gitHub.getUser() == null) &&
		(this.trello == null || !this.trello.isAuthorized())) //TODO Trello no user issue
	{
		if (this.userElement != null)
		{
			this.userElement.parentNode.removeChild(this.userElement);
			this.userElement = null;
		}
	}
	else
	{
		if (this.userElement == null)
		{
			this.userElement = document.createElement('a');
			this.userElement.setAttribute('href', 'javascript:void(0);');
			this.userElement.className = 'geItem';
			this.userElement.style.position = 'absolute';
			this.userElement.style.fontSize = '8pt';
			this.userElement.style.top = '4px';
			this.userElement.style.right = '30px';
			this.userElement.style.color = '#666';
			this.userElement.style.margin = '4px';
			this.userElement.style.padding = '2px';
			this.userElement.style.paddingRight = '16px';
			this.userElement.style.verticalAlign = 'middle';
			this.userElement.style.backgroundImage =  'url(' + IMAGE_PATH + '/expanded.gif)';
			this.userElement.style.backgroundPosition = '100% 60%';
			this.userElement.style.backgroundRepeat = 'no-repeat';
			
			this.menubarContainer.appendChild(this.userElement);

			mxEvent.addListener(this.userElement, 'click', mxUtils.bind(this, function(evt)
			{
				if (this.userPanel == null)
				{
					var div = document.createElement('div');
					div.className = 'geDialog';
					div.style.position = 'absolute';
					div.style.top = (this.userElement.clientTop + this.userElement.clientHeight + 6) + 'px';
					div.style.right = '36px';
					div.style.padding = '0px';

					this.userPanel = div;
				}
				
				if (this.userPanel.parentNode != null)
				{
					this.userPanel.parentNode.removeChild(this.userPanel);
				}
				else
				{
					var connected = false;
					this.userPanel.innerHTML = '';
					
					var img = document.createElement('img');

					img.setAttribute('src', Dialog.prototype.closeImage);
					img.setAttribute('title', mxResources.get('close'));
					img.className = 'geDialogClose';
					img.style.top = '8px';
					img.style.right = '8px';
					
					mxEvent.addListener(img, 'click', mxUtils.bind(this, function()
					{
						if (this.userPanel.parentNode != null)
						{
							this.userPanel.parentNode.removeChild(this.userPanel);
						}
					}));
					
					this.userPanel.appendChild(img);
										
					if (this.drive != null)
					{
						var driveUser = this.drive.getUser();
						
						if (driveUser != null)
						{
							connected = true;
							this.userPanel.innerHTML += '<table title="User ID: ' + driveUser.id +
								'" style="font-size:10pt;padding:20px 20px 10px 10px;">' +
								'<tr><td valign="top">' +
								((driveUser.pictureUrl != null) ?
									'<img style="margin-right:10px;border-radius:50%;" src="' + driveUser.pictureUrl + '"/>' :
									'<img style="margin-right:4px;margin-top:2px;" src="' + this.defaultUserPicture + '"/>') +
								'</td><td valign="top" style="white-space:nowrap;' +
								((driveUser.pictureUrl != null) ? 'padding-top:14px;' : '') +
								'"><b>' + mxUtils.htmlEntities(driveUser.displayName) + '</b><br>' +
								'<small>' + mxUtils.htmlEntities(driveUser.email) + '</small></tr></table>';
							var div = document.createElement('div');
							div.style.textAlign = 'center';
							div.style.padding = '12px';
							div.style.background = 'whiteSmoke';
							div.style.borderTop = '1px solid #e0e0e0';
							div.style.whiteSpace = 'nowrap';

							// LATER: Cannot change user while file is open since close will not work with new
							// credentials and closing the file using fileLoaded(null) will show splash dialog.
							div.appendChild(mxUtils.button(mxResources.get('signOut'), mxUtils.bind(this, function()
							{
								var file = this.getCurrentFile();

								if (file != null && file.constructor == DriveFile)
								{
									this.confirm(mxResources.get('areYouSure'), mxUtils.bind(this, function()
									{
										this.spinner.spin(document.body, mxResources.get('signOut'));
										
										this.diagramContainer.style.display = 'none';
										this.formatContainer.style.display = 'none';
										this.hsplit.style.display = 'none';
										this.sidebarContainer.style.display = 'none';
										this.sidebarFooterContainer.style.display = 'none';
										
										if (this.tabContainer != null)
										{
											this.tabContainer.style.display = 'none';
										}
											
										file.close();
	
										// LATER: Use callback to wait for thumbnail update
										window.setTimeout(mxUtils.bind(this, function()
										{
											// Workaround to disable the splash screen before reload
											this.showDialog = function() {};
											window.location.hash = '';
											this.drive.clearUserId();
											gapi.auth.signOut();
											
											// Reload page to reset client auth
											window.location.reload();
										}), (file != null && file.constructor == DriveFile) ? 2000 : 0);
									}));
								}
								else
								{
									this.drive.clearUserId();
									this.drive.setUser(null);
									gapi.auth.signOut();
								}
							})));
							
							this.userPanel.appendChild(div);
						}
					}
					
					var addUser = mxUtils.bind(this, function(user, logo, logout)
					{
						if (user != null)
						{
							if (connected)
							{
								this.userPanel.appendChild(document.createElement('hr'));
							}
							
							connected = true;
							this.userPanel.innerHTML += '<table style="font-size:10pt;padding:20px 20px 10px 10px;"><tr><td valign="top">' +
								((logo != null) ? '<img style="margin-right:10px;" src="' + logo + '" width="40" height="40"/></td>' : '') +
								'<td valign="middle" style="white-space:nowrap;"><b>' + mxUtils.htmlEntities(user.displayName) + '</b>' +
								((user.email != null) ? '<br><font color="gray">' + mxUtils.htmlEntities(user.email) + '</font></td>' : '') +
								'</tr></table>';
							var div = document.createElement('div');
							div.style.textAlign = 'center';
							div.style.padding = '12px';
							div.style.background = 'whiteSmoke';
							div.style.borderTop = '1px solid #e0e0e0';
							div.style.whiteSpace = 'nowrap';
							
							if (logout != null)
							{
								div.appendChild(mxUtils.button(mxResources.get('signOut'), logout));
							}
							
							this.userPanel.appendChild(div);
						}
					});
					
					if (this.dropbox != null)
					{
						addUser(this.dropbox.getUser(), IMAGE_PATH + '/dropbox-logo.svg', mxUtils.bind(this, function()
						{
							var file = this.getCurrentFile();

							if (file != null && file.constructor == DropboxFile)
							{
								var doLogout = mxUtils.bind(this, function()
								{
									this.dropbox.logout();
									window.location.hash = '';
								});
								
								if (!file.isModified())
								{
									doLogout();
								}
								else
								{
									this.confirm(mxResources.get('allChangesLost'), null, doLogout,
										mxResources.get('cancel'), mxResources.get('discardChanges'));
								}
							}
							else
							{
								this.dropbox.logout();
							}
						}));
					}

					if (this.oneDrive != null)
					{
						addUser(this.oneDrive.getUser(), IMAGE_PATH + '/onedrive-logo.svg', mxUtils.bind(this, function()
						{
							var file = this.getCurrentFile();

							if (file != null && file.constructor == OneDriveFile)
							{
								var doLogout = mxUtils.bind(this, function()
								{
									this.oneDrive.logout();
									window.location.hash = '';
								});
								
								if (!file.isModified())
								{
									doLogout();
								}
								else
								{
									this.confirm(mxResources.get('allChangesLost'), null, doLogout,
										mxResources.get('cancel'), mxResources.get('discardChanges'));
								}
							}
							else
							{
								this.oneDrive.logout();
							}
						}));
					}

					if (this.gitHub != null)
					{
						addUser(this.gitHub.getUser(), IMAGE_PATH + '/github-logo.svg', mxUtils.bind(this, function()
						{
							var file = this.getCurrentFile();

							if (file != null && file.constructor == GitHubFile)
							{
								var doLogout = mxUtils.bind(this, function()
								{
									this.gitHub.logout();
									window.location.hash = '';
								});
								
								if (!file.isModified())
								{
									doLogout();
								}
								else
								{
									this.confirm(mxResources.get('allChangesLost'), null, doLogout,
										mxResources.get('cancel'), mxResources.get('discardChanges'));
								}
							}
							else
							{
								this.gitHub.logout();
							}
						}));
					}
					
					//TODO We have no user info from Trello, how we can create a user?
					if (this.trello != null)
					{
						addUser(this.trello.getUser(), IMAGE_PATH + '/trello-logo.svg', mxUtils.bind(this, function()
						{
							var file = this.getCurrentFile();

							if (file != null && file.constructor == TrelloFile)
							{
								var doLogout = mxUtils.bind(this, function()
								{
									this.trello.logout();
									window.location.hash = '';
								});
								
								if (!file.isModified())
								{
									doLogout();
								}
								else
								{
									this.confirm(mxResources.get('allChangesLost'), null, doLogout,
										mxResources.get('cancel'), mxResources.get('discardChanges'));
								}
							}
							else
							{
								this.trello.logout();
							}
						}));
					}
					
					if (!connected)
					{
						var div = document.createElement('div');
						div.style.textAlign = 'center';
						div.style.padding = '20px 20px 10px 10px';
						div.innerHTML = mxResources.get('notConnected');
						
						this.userPanel.appendChild(div);
					}

					document.body.appendChild(this.userPanel);
				}
				
				mxEvent.consume(evt);
			}));
			
			mxEvent.addListener(document.body, 'click', mxUtils.bind(this, function(evt)
			{
				if (!mxEvent.isConsumed(evt) && this.userPanel != null && this.userPanel.parentNode != null)
				{
					this.userPanel.parentNode.removeChild(this.userPanel);
				}
			}));
		}
		
		var user = null;
		
		if (this.drive != null && this.drive.getUser() != null)
		{
			user = this.drive.getUser();
		}
		else if (this.oneDrive != null && this.oneDrive.getUser() != null)
		{
			user = this.oneDrive.getUser();
		}
		else if (this.dropbox != null && this.dropbox.getUser() != null)
		{
			user = this.dropbox.getUser();
		}
		else if (this.gitHub != null && this.gitHub.getUser() != null)
		{
			user = this.gitHub.getUser();
		}
		//TODO Trello no user issue
		
		if (user != null)
		{
			this.userElement.innerHTML = '';
			
			if (screen.width > 560)
			{
				mxUtils.write(this.userElement, user.displayName);
				this.userElement.style.display = 'block';
			}
		}
		else
		{
			this.userElement.style.display = 'none';
		}
	}
};

/**
 * Override depends on mxSettings which is not defined in the minified viewer.
 */
var editorResetGraph = Editor.prototype.resetGraph;	
Editor.prototype.resetGraph = function()
{
	editorResetGraph.apply(this, arguments);
	
	// Overrides default with persisted value
	this.graph.pageFormat = mxSettings.getPageFormat();
};