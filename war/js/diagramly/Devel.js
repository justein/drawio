/*
 * $Id: Devel.js,v 1.27 2014/01/08 16:38:06 gaudenz Exp $
 * Copyright (c) 2006-2013, JGraph Ltd
 */
// This provides an indirection to make sure the mxClient.js
// loads before the dependent classes below are loaded. This
// is used for development mode where the JS is in separate
// files and the mxClient.js loads other files.
// Adds external dependencies
mxscript(mxDevUrl + 'js/spin/spin.min.js');
mxscript(mxDevUrl + 'js/deflate/pako.min.js');
mxscript(mxDevUrl + 'js/deflate/base64.js');
mxscript(mxDevUrl + 'js/jscolor/jscolor.js');
mxscript(mxDevUrl + 'js/sanitizer/sanitizer.min.js');

// Uses grapheditor from devhost
mxscript(geBasePath +'/Init.js');
mxscript(geBasePath +'/Editor.js');
mxscript(geBasePath +'/EditorUi.js');
mxscript(geBasePath +'/Sidebar.js');
mxscript(geBasePath +'/Graph.js');
mxscript(geBasePath +'/Shapes.js');
mxscript(geBasePath +'/Actions.js');
mxscript(geBasePath +'/Menus.js');
mxscript(geBasePath +'/Format.js');
mxscript(geBasePath +'/Toolbar.js');
mxscript(geBasePath +'/Dialogs.js');

// Loads main classes
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Advanced.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Android.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-ArchiMate.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-ArchiMate3.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Arrows2.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Atlassian.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-AWS.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-AWS3.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-AWS3D.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Azure.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Basic.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Bootstrap.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-BPMN.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Cabinet.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Citrix.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-EIP.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Electrical.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-ER.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Floorplan.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Flowchart.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-GCP.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Gmdl.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-IBM.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Ios.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Ios7.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-LeanMapping.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Mockup.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-MSCAE.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Network.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Office.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-PID.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Rack.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Sitemap.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Sysml.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-Veeam.js');
mxscript(mxDevUrl + 'js/diagramly/sidebar/Sidebar-WebIcons.js');

mxscript(mxDevUrl + 'js/diagramly/util/mxJsCanvas.js');
mxscript(mxDevUrl + 'js/diagramly/util/mxAsyncCanvas.js');

mxscript(mxDevUrl + 'js/diagramly/DrawioFile.js');
mxscript(mxDevUrl + 'js/diagramly/LocalFile.js');
mxscript(mxDevUrl + 'js/diagramly/LocalLibrary.js');
mxscript(mxDevUrl + 'js/diagramly/StorageFile.js');
mxscript(mxDevUrl + 'js/diagramly/StorageLibrary.js');
mxscript(mxDevUrl + 'js/diagramly/Dialogs.js');
mxscript(mxDevUrl + 'js/diagramly/Editor.js');
mxscript(mxDevUrl + 'js/diagramly/EditorUi.js');
mxscript(mxDevUrl + 'js/diagramly/Settings.js');

// Excluded in base.min.js
mxscript(mxDevUrl + 'js/diagramly/DrawioClient.js');
mxscript(mxDevUrl + 'js/diagramly/DrawioUser.js');
mxscript(mxDevUrl + 'js/diagramly/UrlLibrary.js');
mxscript(mxDevUrl + 'js/diagramly/DriveRealtime.js');
mxscript(mxDevUrl + 'js/diagramly/RealtimeMapping.js');
mxscript(mxDevUrl + 'js/diagramly/DriveFile.js');
mxscript(mxDevUrl + 'js/diagramly/DriveLibrary.js');
mxscript(mxDevUrl + 'js/diagramly/DriveClient.js');
mxscript(mxDevUrl + 'js/diagramly/DropboxFile.js');
mxscript(mxDevUrl + 'js/diagramly/DropboxLibrary.js');
mxscript(mxDevUrl + 'js/diagramly/DropboxClient.js');
mxscript(mxDevUrl + 'js/diagramly/GitHubFile.js');
mxscript(mxDevUrl + 'js/diagramly/GitHubLibrary.js');
mxscript(mxDevUrl + 'js/diagramly/GitHubClient.js');
mxscript(mxDevUrl + 'js/diagramly/OneDriveFile.js');
mxscript(mxDevUrl + 'js/diagramly/OneDriveLibrary.js');
mxscript(mxDevUrl + 'js/diagramly/OneDriveClient.js');
mxscript(mxDevUrl + 'js/diagramly/TrelloFile.js');
mxscript(mxDevUrl + 'js/diagramly/TrelloLibrary.js');
mxscript(mxDevUrl + 'js/diagramly/TrelloClient.js');
mxscript(mxDevUrl + 'js/diagramly/ChatWindow.js');

mxscript(mxDevUrl + 'js/diagramly/App.js');
mxscript(mxDevUrl + 'js/diagramly/Menus.js');
mxscript(mxDevUrl + 'js/diagramly/Pages.js');
mxscript(mxDevUrl + 'js/diagramly/Trees.js');
mxscript(mxDevUrl + 'js/diagramly/DevTools.js');

// Vsdx Export
mxscript(mxDevUrl + 'js/diagramly/vsdx/VsdxExport.js');
mxscript(mxDevUrl + 'js/diagramly/vsdx/mxVsdxCanvas2D.js');
mxscript(mxDevUrl + 'js/jszip/jszip.min.js');

// mxRuler
mxscript(mxDevUrl + 'js/diagramly/ruler/mxRuler.js');

//EquiSpaced Guides
if (urlParams['distanceGuides'] == '1')
{
	mxscript(mxDevUrl + 'js/diagramly/DistanceGuides.js');
}

//Vsdx Import
//mxscript(drawDevUrl + 'js/jszip/jszip.min.js');
mxscript(mxDevUrl + 'js/vsdx/bmpDecoder.js');
mxscript(mxDevUrl + 'js/vsdx/importer.js');

//GraphMl Import
mxscript(mxDevUrl + 'js/diagramly/graphml/mxGraphMlCodec.js');