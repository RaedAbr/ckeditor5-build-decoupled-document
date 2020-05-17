/* eslint-disable no-undef */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import newIcon from './file-alt-solid.svg';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

/**
 * A plugin for cleaning editor data
 *
 * @export
 * @class NewDocumentPlugin
 * @extends module:core/plugin~Plugin
 */
export default class NewDocumentPlugin extends Plugin {
	/**
	 * Creates an instance of NewDocumentPlugin. If action is not provided, the editor data will
	 * be removed. Otherwise, the action function will
	 * be executed with the editor data in form of blob as parameter. If it returns true, then
	 * the editor data will be cleaned.
	 *
	 * @example <caption>Example of use with fn function</caption>
	 * DecoupledEditor.create( editorData,
		.then( editor => {
			...
			editor.plugins.get( 'NewDocument' ).action = function (blob) {
				// you can now use the blob
			}
		} )
		.catch( error => {
			console.error( 'There was a problem initializing the editor.', error );
		} );
	 *
	 * @param {*} editor
	 * @param {function(Blob) => bool} [action=undefined]
	 * @memberof NewDocumentPlugin
	 */
	constructor( editor, action = undefined ) {
		super();
		this.action = action;
		this.editor = editor;
	}

	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'newDocument', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'New document',
				icon: newIcon,
				tooltip: true
			} );

			// Callback executed once the button is clicked.
			view.on( 'execute', () => {
				let confirm = true;
				if ( this.action ) {
					this.buildBlob( editor );
					confirm = this.action( this.blob );
				}
				if ( confirm ) {
					editor.setData( '' );
				}
			} );

			return view;
		} );
	}

	buildBlob( editor ) {
		const header = '<html xmlns:o=\'urn:schemas-microsoft-com:office:office\'' +
				'xmlns:w=\'urn:schemas-microsoft-com:office:word\'' +
				'xmlns=\'http://www.w3.org/TR/REC-html40\'>' +
				'<head>' +
				'<meta charset=\'utf-8\'>' +
				'<title>Export HTML to Word Document with JavaScript</title>' +
				'</head><body>';
		const footer = '</body></html>';
		this.sourceHTML = header + editor.getData() + footer;
		this.mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
		this.blob = new Blob( [ '\ufeff', this.sourceHTML ], { type: this.mime } );
	}

	static get pluginName() {
		return 'NewDocument';
	}
}
