/* eslint-disable no-undef */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import saveIcon from './save-solid.svg';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

/**
 * A plugin for converting editor data to docx file
 *
 * @export
 * @class SaveDocumentPlugin
 * @extends module:core/plugin~Plugin
 */
export default class SaveDocumentPlugin extends Plugin {
	/**
	 * Creates an instance of SaveDocumentPlugin. If fn is not provided, the editor data will
	 * be converted to docx file and downloaded immediatly. Otherwise, the fn function will
	 * be executed with the editor data in form of blob as parameter.
	 *
	 * @example <caption>Example of use with fn function</caption>
	 * DecoupledEditor.create( editorData,
		.then( editor => {
			...
			editor.plugins.get( 'SaveDocument' ).fn = function (blob) {
				// you can now use the blob
			}
		} )
		.catch( error => {
			console.error( 'There was a problem initializing the editor.', error );
		} );
	 *
	 * @param {*} editor
	 * @param {function(Blob) => void} [fn=undefined]
	 * @memberof SaveDocumentPlugin
	 */
	constructor( editor, fn = undefined ) {
		super( editor );
		this.fn = fn;
		this.editor = editor;
	}

	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'saveDocument', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Save document',
				icon: saveIcon,
				tooltip: true,
				isToggleable: true
			} );

			editor.on( 'change:isReadOnly', () => {
				view.set( 'isEnabled', !editor.isReadOnly );
			} );

			// Callback executed once the button is clicked.
			view.on( 'execute', () => {
				this.buildBlob( editor );
				if ( this.fn ) {
					this.fn( this.blob );
				} else {
					this.saveBlobToFile();
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

	saveBlobToFile() {
		const filename = 'document.docx';
		if ( navigator.msSaveOrOpenBlob ) {
			navigator.msSaveOrOpenBlob( this.blob, filename ); // IE10-11
		} else { // other browsers
			const source = 'data:' + this.mime + ';charset=utf-8,' + encodeURIComponent( this.sourceHTML );
			const fileDownload = document.createElement( 'a' );
			document.body.appendChild( fileDownload );
			fileDownload.href = source;
			fileDownload.download = filename;
			fileDownload.click();
			document.body.removeChild( fileDownload );
		}
	}

	static get pluginName() {
		return 'SaveDocument';
	}
}
