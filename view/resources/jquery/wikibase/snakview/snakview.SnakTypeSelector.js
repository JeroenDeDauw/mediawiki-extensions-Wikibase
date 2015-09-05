( function( mw, $ ) {
	'use strict';

	var PARENT = $.Widget;

	/**
	 * Selector for choosing a `Snak` type offering to select from a list of all `Snak` types which
	 * a `jQuery.snakview.variations.Variation` is registered for and, thus, can be displayed by a
	 * `jQuery.wikibase.snakview`.
	 * Because of being tightly bound to the `jQuery.wikibase.snakview.variations`, the widget is
	 * considered part of the `jQuery.wikibase.snakview` rather than being a stand-alone widget.
	 * @see jQuery.wikibase.snakview
	 * @see jQuery.wikibase.snakview.variations
	 * @see jQuery.wikibase.snakview.variations.Variation
	 * @see wikibase.datamodel.Snak
	 * @class jQuery.wikibase.snakview.SnakTypeSelector
	 * @extends jQuery.Widget
	 * @since 0.4
	 * @licence GNU GPL v2+
	 * @author H. Snater < mediawiki@snater.com >
	 * @author Daniel Werner < daniel.werner@wikimedia.de >
	 *
	 * @constructor
	 */
	/**
	 * @event change
	 * Triggered when the `Snak` type changed.
	 * @param {jQuery.Event} event
	 */
	$.widget( 'wikibase.SnakTypeSelector', PARENT, {
		/**
		 * @property {jQuery}
		 * @private
		 */
		_$icon: null,

		/**
		 * @property {jQuery.ui.menu}
		 * @private
		 */
		_menu: null,

		/**
		 * The function for removing global event listeners, if there are any. Empty function if
		 * no gloabel event listeners are registered.
		 * @property {Function}
		 * @private
		 */
		_unbindGlobalListenersFn: $.noop,

		/**
		 * @see jQuery.Widget._create
		 * @protected
		 */
		_create: function() {
			var self = this,
				widgetName = this.widgetName,
				$menu = this._buildMenu().appendTo( 'body' ).hide();

			this._menu = $menu.data( 'menu' );

			this._hoverable( this.element );

			// TODO: add a title message
			this.element
			.addClass( 'ui-state-default ' + this.widgetBaseClass )
			.on( 'click.' + widgetName, function( event ) {
				// don't show menu if selector is disabled!
				// otherwise, simply toggle menu's visibility
				if( self.options.disabled || $menu.is( ':visible' ) ) {
					$menu.hide();
					return;
				}

				$menu.show();
				self.repositionMenu();

				self.element.addClass( 'ui-state-active' );

				// close the menu when clicking, regardless of whether the click is performed on the
				// menu itself or outside of it:
				var degrade = function( event ) {
					if ( event.target !== self.element[0] ) {
						$menu.hide();
						self.element.removeClass( 'ui-state-active' );
					}
					self._unbindGlobalListenersFn();
				};
				var repositionMenu = function( event ) { self.repositionMenu(); };
				// also make this available for destroy() function!
				self._unbindGlobalListenersFn = function() {
					// unbind event after closing menu, explicitly unbind specific handler to
					// support instantiation of multiple snaktypeselector widgets.
					$( document ).off( 'mouseup.' + widgetName, degrade );
					$( window ).off( 'resize.' + widgetName, repositionMenu );
					self._unbindGlobalListenersFn = $.noop;
				};
				$( document ).on( 'mouseup.' + widgetName, degrade );
				$( window ).on( 'resize.' + widgetName, repositionMenu );
			} );

			this._$icon = $( '<span/>' )
				.addClass( 'ui-icon ui-icon-snaktypeselector' )
				.appendTo( this.element );

			// listen to clicks; after click on a menu item, select its type as active:
			$menu.on( 'click', function( event ) {
				var $li = $( event.target ).closest( 'li' ),
					type = $li.data( 'snaktypeselector-menuitem-type' );

				if( type ) {
					self._setSnakType( type );
				}
			} );
		},

		/**
		 * @see jQuery.Widget.destroy
		 */
		destroy: function() {
			var $menu = this._menu.element;
			this._menu.destroy();
			$menu.remove();

			this._$icon.remove();

			this.element.removeClass( 'ui-state-default ' + this.widgetBaseClass );

			// remove event listeners responsible for closing this instance's menu:
			this._unbindGlobalListenersFn();

			PARENT.prototype.destroy.call( this );
		},

		/**
		 * @see jQuery.Widget._setOption
		 * @protected
		 *
		 * @param {string} key
		 * @param {*} value
		 * @return {jQuery.Widget}
		 */
		_setOption: function( key, value ) {
			if( key === 'disabled' && value ) {
				this._menu.element.hide();
				this.element.removeClass( 'ui-state-active' );
			}
			return PARENT.prototype._setOption.apply( this, arguments );
		},

		/**
		 * Returns a DOM structure for the selector's menu the `Snak` type can be chosen from.
		 * @private
		 *
		 * @return jQuery
		 */
		_buildMenu: function() {
			var classPrefix = this.widgetBaseClass + '-menuitem-',
				$menu = $( '<ul/>' ).addClass( this.widgetBaseClass + '-menu' ),
				snakTypes = $.wikibase.snakview.variations.getCoveredSnakTypes();

			$.each( snakTypes, function( i, type ) {
				$menu.append(
					$( '<li/>' )
					.addClass( classPrefix + type ) // type should only be lower case string anyhow!
					.data( 'snaktypeselector-menuitem-type', type )
					.append(
						$( '<a/>' )
						.text( mw.msg( 'wikibase-snakview-snaktypeselector-' + type ) )
						.on( 'click.' + this.widgetName, function( event ) {
							event.preventDefault();
						} )
					)
				);
			} );

			return $menu.menu();
		},

		/**
		 * Gets the current `Snak` type or sets a new `Snak` type.
		 *
		 * @param {string|null} [snakType]
		 * @return {string|null|undefined}
		 */
		snakType: function( snakType ) {
			if( snakType === undefined ) {
				var $snakTypeLi = this._menu.element.children( '.ui-state-active' ).first();
				return $snakTypeLi.length
					? $snakTypeLi.data( 'snaktypeselector-menuitem-type' )
					: null;
			}
			this._setSnakType( snakType );
		},

		/**
		 * Activates a `Snak` type in the menu.
		 * @private
		 *
		 * @param {string|null} snakType
		 */
		_setSnakType: function( snakType ) {
			if( this.snakType() === snakType ) {
				return;
			}

			this._menu.element.children( '.ui-state-active' ).removeClass( 'ui-state-active' );

			if( snakType !== null ) {
				this._menu.element.children( '.' + this.widgetBaseClass + '-menuitem-' + snakType )
					.addClass( 'ui-state-active' );
			}

			this._trigger( 'change' );
		},

		/**
		 * (Re-)aligns the menu.
		 */
		repositionMenu: function() {
			var isRtl = $( 'body' ).hasClass( 'rtl' );

			this._menu.element.position( {
				of: this._$icon,
				my: ( isRtl ? 'right' : 'left' ) + ' top',
				at: ( isRtl ? 'left' : 'right' ) + ' bottom',
				offset: '0 1',
				collision: 'none'
			} );
		}
	} );

	$.wikibase.snakview.SnakTypeSelector = $.wikibase.SnakTypeSelector;

	// We have to override this here because $.widget sets it no matter what's in
	// the prototype
	$.wikibase.snakview.SnakTypeSelector.prototype.widgetBaseClass = 'wikibase-snaktypeselector';

}( mediaWiki, jQuery ) );