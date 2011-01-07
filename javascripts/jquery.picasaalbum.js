/*
 * picasaAlbum - jQuery Plugin
 * Simple plugin for displaying a Picasa Web Album
 * 
 * Version: 0.1 (30/12/2010)
 * Build on v1.4 but may work on older jQuery releases
 * 
 * Copyright (c) 2010 Koen Punt - http://www.koenpunt.nl/projects/jquery-picasaalbum
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

(function( $ ){
	
	var albumList, photoView, thumbnailList, nextButton, previousButton,
	selectedOptions,
	albumUrl = 'http://picasaweb.google.com/data/feed/api/user/',
	
	/*
	 *	Private methods
	 */
	
	picasaalbum_init = function(target){
		target.addClass('picasaAlbumWrap').append(
				albumList = $('<div class="picasaAlbum picasaAlbumList"></div>'),
			thumbnailList = $('<div class="picasaAlbum picasaThumbnailList"></div>'),
				photoView = $('<div class="picasaAlbum picasaPhotoView"></div>'),
			   nextButton = $('<div class="picasaAlbum picasaNextButton"></div>'),
		   previousButton = $('<div class="picasaAlbum picasaPreviousButton"></div>')
		);
		
		picasaalbum_load_albums();
		
	},
	
	picasaalbum_load_albums = function(){
		albumList.addClass('progress');
		$.getJSON(albumUrl + selectedOptions.username + '?callback=?', {alt: 'json'}, function(data,textStatus,xhr){
			var feed = data.feed, 
				entries = feed.entry || [],
				ul = $('<ul></ul>').hide(),
				li, entry,photocount,thumbnail,type,title;
			
			ul.css('width', entries.length * 160);
			
			for (var i = 0; i < entries.length; ++i) {
				entry = entries[i];
				photocount = entry.gphoto$numphotos.$t;
				thumbnail = entry.media$group.media$thumbnail[0];
				type = thumbnail.type;
				title = entry.title.$t;
				
				ul.append(li = $('<li><img src="' + thumbnail.url + '" alt="' + title + '" /><span class="picasaAlbumTitle">' + title + '</span></li>'));
				
				li.data('picasaAlbumId', entry.gphoto$id.$t).click(picasaalbum_load_thumbnails);
			}
			
			albumList.append(ul);
			ul.fadeIn();
		});
	},
	
	picasaalbum_load_thumbnails = function(){
		
		var albumId = $(this).data('picasaAlbumId');
		thumbnailList.addClass('progress').find('ul').fadeOut();
		
		$.getJSON(albumUrl + selectedOptions.username + '/albumid/' + albumId + '?callback=?', {alt: 'json', imgmax: $.fn.picasaAlbum.defaults.maxWidth}, function(data,textStatus,xhr){
			var feed = data.feed, 
				entries = feed.entry || [],
				ul = $('<ul></ul>').hide(),
				li,entry,thumbnail,type,title;
				
			ul.css('width', entries.length * (selectedOptions.thumbnailWidth + 5));
			
			for (var i = 0; i < entries.length; ++i) {
				entry = entries[i];
				console.log(entry);
				thumbnail = entry.media$group.media$thumbnail[0];
				type = thumbnail.type;
				title = entry.title.$t;
				img = $('<img src="' + thumbnail.url + '" alt="' + title + '" />');
				img.css({
					'marginTop' : -( thumbnail.height/2 ),
					'marginLeft' : -( thumbnail.width/2 ),
				});
				ul.append(li = $('<li></li>'));
				li.append(img);
				
				li.data('picasaPhotoData', entry.media$group.media$content[0]).click(picasaalbum_load_photo);
			}
			thumbnailList.empty().append(ul).removeClass('progress');
			ul.fadeIn();
		});
		
	},
	
	
	picasaalbum_load_photo = function(){
		var photoData = $(this).data('picasaPhotoData');
		
		photoView.addClass('progress').find('img').fadeOut(function(){
			$(this).remove();
		});
		
				
		var img = $('<img src="' + photoData.url + '" />').hide();
		
		var load_complete = function(){
			photoView.append(img).animate({height: photoData.height}, {
				complete: function(){
					$(img).fadeIn(function(){
						photoView.removeClass('progress');
					});
				}
			});
		};
		
		if(!img.get(0).complete){
			img.bind('load', load_complete);
		}else{
			load_complete();
		}
	};
	
	$.fn.picasaAlbum = function(o){
		selectedOptions = $.extend({}, $.fn.picasaAlbum.defaults, o);
		
		return this.each(function(){
			$this = $(this);
			picasaalbum_init($this);
		});
	};
	
	$.fn.picasaAlbum.defaults = {
		username: '',
		maxWidth: 800,
		thumbnailWidth: 82
	};

})( jQuery );