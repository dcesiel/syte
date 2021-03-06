function setupLastfm(url, el) {
  var href = el.href;

  if ($('#lastfm-profile').length > 0) {
    window.location = href;
    return;
  }

  var params = url.attr('path').split('/').filter(function(w) {
      if (w.length)
          return true;
      return false;
  })

  if (params.length == 2) {
     var username = params[1];

     var spinner = new Spinner(spin_opts).spin();
     $('#lastfm-link').append(spinner.el);

    /* Add extra helper to parse out the #text fields in context passed to
     * handlebars.  The '#' character is reserved by the handlebars templating
     * language itself so cannot reference '#text' easily in the template. */
     Handlebars.registerHelper('text', function(obj) {
        try {
          return obj['#text'];
        } catch (err) {
            return '';
        }
     });

     Handlebars.registerHelper('image_url', function(obj) {
        return obj[0]['#text'];
     });

     Handlebars.registerHelper('avatar_url', function(obj) {
        return obj[1]['#text'];
     });

     require(["json!/lastfm/" + username, "text!templates/lastfm-profile.html"],
        function(lastfm_data, lastfm_view) {
            if (lastfm_data.error || lastfm_data.length == 0) {
                window.location = href;
                return;
            }

            var template = Handlebars.compile(lastfm_view);
            
            lastfm_data.user_info.user.formatted_plays = numberWithCommas(lastfm_data.user_info.user.playcount);
            lastfm_data.user_info.user.formatted_playlists = numberWithCommas(lastfm_data.user_info.user.playlists);
            lastfm_data.user_info.user.formatted_register_date = moment(lastfm_data.user_info.user.registered['#text'], 'YYYY-MM-DD HH:mm').format('MM/DD/YYYY');
            
            $.each(lastfm_data.recenttracks.recenttracks.track, function(i, t) {
                t.formatted_date = moment.utc(t.date['#text'], 'DD MMM YYYY, HH:mm').fromNow();
            });

            $(template(lastfm_data)).modal().on('hidden', function () {
                $(this).remove();
                adjustSelection('home-link');
            })

            spinner.stop();

        });

     return;
  }

  window.location = href;
}
