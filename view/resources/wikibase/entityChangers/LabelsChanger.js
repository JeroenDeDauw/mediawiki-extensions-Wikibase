/**
 * @licence GNU GPL v2+
 * @author Adrian Lang <adrian.lang@wikimedia.de>
 */
( function( wb, $ ) {
	'use strict';

	var MODULE = wb.entityChangers;
	/**
	 * @param {wikibase.api.RepoApi}
	 * @param {wikibase.RevisionStore}
	 * @param {wikibase.datamodel.Entity}
	 */
	var SELF = MODULE.LabelsChanger = function WbEntityChangersLabelsChanger( api, revisionStore, entity ) {
		this._api = api;
		this._revisionStore = revisionStore;
		this._entity = entity;
	};

	$.extend( SELF.prototype, {
		/**
		 * @type {wikibase.datamodel.Entity}
		 */
		_entity: null,

		/**
		 * @type {wikibase.RevisionStore}
		 */
		_revisionStore: null,

		/**
		 * @type {wikibase.api.RepoApi}
		 */
		_api: null,

		/**
		 * @param {wikibase.datamodel.Term} label
		 * @return {jQuery.Promise}
		 *         Resolved parameters:
		 *         - {string} The saved label
		 *         Rejected parameters:
		 *         - {wikibase.api.RepoApiError}
		 */
		setLabel: function( label ) {
			var self = this,
				deferred = $.Deferred(),
				language = label.getLanguageCode();

			this._api.setLabel(
				this._entity.getId(),
				this._revisionStore.getLabelRevision(),
				label.getText(),
				language
			)
			.done( function( result ) {
				var savedLabel = result.entity.labels[language].value;

				// Update revision store:
				self._revisionStore.setLabelRevision( result.entity.lastrevid );

				// FIXME: Maybe check API's return value?

				// FIXME: Introduce Item.setLabels

				deferred.resolve( savedLabel );
			} )
			.fail( function( errorCode, error ) {
				deferred.reject( wb.api.RepoApiError.newFromApiResponse( error, 'save' ) );
			} );

			return deferred.promise();
		}
	} );
}( wikibase, jQuery ) );
