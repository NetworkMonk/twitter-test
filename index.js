
(function() {
    'use strict';

    if (typeof(TwitterTest) === 'function') {
        new TwitterTest({
            profile: 'RobertDowneyJr',
            applicationPath: './php/endpoints/',
            element: document.getElementsByClassName('twitter-container-medium').item(0),
            size: 'medium',
        });
    }
})();
