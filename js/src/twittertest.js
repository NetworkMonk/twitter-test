
function TwitterTest(config) {
    this.config = {
        profile: '',
        applicationPath: '',
        element: false,
        size: 'medium',
    };

    this.data = {
        maxTweet: 0,
        minTweet: 0,
        loadingMore: false,
        loadingNew: false,
        loadedAll: false,
    };

    if (typeof(config) === 'object') {
        if (typeof(config.profile) === 'string') {
            this.config.profile = config.profile;
        }
        if (typeof(config.applicationPath) === 'string') {
            this.config.applicationPath = config.applicationPath;
        }
        if (typeof(config.element) === 'object') {
            this.config.element = config.element;
        }
        if (typeof(config.element) === 'object') {
            this.config.size = config.size;
        }
    }

    this.build();
    return this;
}

TwitterTest.prototype.serialize = function(obj) {
    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
    }
    return str.join('&');
};

TwitterTest.prototype.requestGet = function(path, data) {
    var obj = this;
    return new Promise(function(resolve, reject) {
        var reqPath = path;
        var reqData = data;
        if (typeof(reqPath) !== 'string') {
            reqPath = '';
        }
        if (typeof(reqData) !== 'object') {
            reqData = {};
        }

        reqPath += '?' + obj.serialize(reqData);

        fetch(obj.config.applicationPath + reqPath, {
            method: 'GET',
            cache: 'no-cache',
        })
        .then(function(response) {
            if (response.status === 200) {
                resolve(response.json());
                return;
            } else {
                reject(Error("Server request failed"));
            }
        })
        .catch(function() {
            reject(Error("Server request failed"));
        });
    });
};

TwitterTest.prototype.getProfile = function() {
    var obj = this;
    return new Promise(function(resolve, reject) {
        obj.requestGet('getProfile.php', {
            'screen_name': obj.config.profile,
        })
        .then(function(data) {
            resolve(data);
        })
        .catch(function(error) {
            reject(error);
        });
    });
};

TwitterTest.prototype.build = function() {
    this.config.element.classList.add('twittertest-container');
    this.config.element.classList.add(this.config.size);
    this.buildProfileHeader();
    this.buildFeed();
};

TwitterTest.prototype.buildProfileHeader = function() {
    var newHeader = document.createElement('div');
    newHeader.classList.add('twittertest-profile-header');
    this.config.element.appendChild(newHeader);
    var obj = this;

    this.getProfile()
    .then(function(data) {
        obj.displayProfileHeader(newHeader, data.result);
    })
    .catch(function(err) {

        newHeader.innerHTML = '';

        var profileError = document.createElement('div');
        profileError.classList.add('twittertest-error');
        profileError.innerText = 'Failed to retrieve profile';

        newHeader.appendChild(profileError);
    });
};

TwitterTest.prototype.displayProfileHeader = function(element, data) {
    var obj = this;
    var proImage = document.createElement('img');
    var imgPath = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_200x200.png';
    if (data.default_profile_image === false) {
        if (typeof(data.profile_image_url_https) === 'string') {
            imgPath = data.profile_image_url_https.replace('_normal.jpg', '_200x200.jpg');
        }
    }
    proImage.src = imgPath;
    proImage.classList.add('profile-image');

    var proName = document.createElement('p');
    proName.innerText = data.name;
    proName.classList.add('profile-name');

    proName.addEventListener('click', function() {
        window.open('https://twitter.com/' + obj.config.profile + '/', '_new');
    });


    var proDescription = document.createElement('p');
    proDescription.innerText = data.description;
    proDescription.classList.add('profile-description');

    element.innerHTML = '';
    element.appendChild(proImage);
    element.appendChild(proName);
    element.appendChild(proDescription);
};

TwitterTest.prototype.buildFeed = function() {
    var obj = this;
    var feedContainer = document.createElement('div');
    feedContainer.classList.add('twittertest-feed');
    feedContainer.innerHTML = '';

    var feedRefreshing = document.createElement('div');
    feedRefreshing.classList.add('feed-refreshing');
    feedRefreshing.innerText = 'Checking for new tweets';

    var feedList = document.createElement('div');
    feedList.classList.add('feed-list');

    var feedLoading = document.createElement('div');
    feedLoading.classList.add('feed-loading');

    var loader = document.createElement('div');
    loader.classList.add('loader');
    var loaderText = document.createElement('div');
    loaderText.classList.add('loader-text');
    loaderText.innerText = 'Loading More Tweets';

    feedLoading.appendChild(loader);
    feedLoading.appendChild(loaderText);

    feedContainer.appendChild(feedRefreshing);
    feedContainer.appendChild(feedList);
    feedContainer.appendChild(feedLoading);

    this.config.element.appendChild(feedContainer);

    this.loadMore(feedContainer)
    .then(function() {
        setInterval(function() {
            obj.refreshFeed(feedContainer);
        }, 15 * 1000);
    });

    feedContainer.addEventListener('scroll', function() {
        obj.scrollHandler(feedContainer);
    });
};

TwitterTest.prototype.refreshFeed = function(feedContainer) {
    if (this.data.loadingNew === true) {
        return;
    }
    this.data.loadingNew = true;
    feedContainer.getElementsByClassName('feed-refreshing').item(0).style.opacity = '1';
    feedContainer.getElementsByClassName('feed-refreshing').item(0).innerText = 'Checking for new tweets';

    var obj = this;
    return new Promise(function(resolve, reject) {
        obj.requestGet('getMore.php', {
            'screen_name': obj.config.profile,
            since: obj.data.maxTweet,
        })
        .then(function(data) {
            if ((typeof(data.result) === 'object') && (Array.isArray(data.result))) {
                if (data.result.length === 0) {
                    feedContainer.getElementsByClassName('feed-refreshing').item(0).innerText = 'No new tweets';
                } else {
                    for (var i = 0; i < data.result.length; i++) {
                        obj.addTweet(feedContainer, data.result[i]);
                    }
                    feedContainer.getElementsByClassName('feed-refreshing').item(0).innerText = 'New tweets loaded';
                }
            }
            resolve();
        })
        .catch(function(error) {
            reject(error);
        })
        .then(function() {
            obj.data.loadingNew = false;
            setTimeout(function() {
                feedContainer.getElementsByClassName('feed-refreshing').item(0).style.opacity = '0';
            }, 2000);
        });
    });
};

TwitterTest.prototype.loadMore = function(feedContainer) {
    if ((this.data.loadingMore === true) || (this.data.loadedAll === true)) {
        return;
    }
    this.data.loadingMore = true;
    feedContainer.getElementsByClassName('feed-loading').item(0).style.opacity = 1;

    var obj = this;
    return new Promise(function(resolve, reject) {
        var requestData = {
            'screen_name': obj.config.profile,
        };

        if (obj.data.minTweet > 0) {
            requestData.max = obj.data.minTweet;
        }

        obj.requestGet('getMore.php', requestData)
        .then(function(data) {
            if ((typeof(data.result) === 'object') && (Array.isArray(data.result))) {
                if (data.result.length === 0) {
                    this.data.loadedAll = true;
                    resolve();
                    return;
                }
                for (var i = 0; i < data.result.length; i++) {
                    obj.addTweet(feedContainer, data.result[i]);
                }
            }
            resolve();
        })
        .catch(function(error) {
            reject(error);
        })
        .then(function() {
            obj.data.loadingMore = false;
            feedContainer.getElementsByClassName('feed-loading').item(0).style.opacity = 0;
        });
    });
};

TwitterTest.prototype.scrollHandler = function(feedContainer) {
    var scrollPos = feedContainer.scrollTop + feedContainer.offsetHeight;
    if (scrollPos > (feedContainer.scrollHeight - 100)) {
        this.loadMore(feedContainer);
    }
};

TwitterTest.prototype.addTweet = function(feedContainer, tweet) {
    var obj = this;
    var newTweet = document.createElement('div');
    newTweet.classList.add('tweet');

    var tweetId = document.createElement('input');
    tweetId.classList.add('tweet-id');
    tweetId.setAttribute('type', 'hidden');
    tweetId.value = tweet.id;

    if ((tweet.id === this.data.maxTweet) || (tweet.id === this.data.minTweet)) {
        return;
    }

    if (tweet.id > this.data.maxTweet) {
        this.data.maxTweet = tweet.id;
    }
    if ((tweet.id < this.data.minTweet) || (this.data.minTweet === 0)) {
        this.data.minTweet = tweet.id;
    }

    var tweetText = document.createElement('p');
    tweetText.classList.add('content');
    tweetText.innerHTML = tweet.text;

    newTweet.appendChild(tweetId);
    newTweet.appendChild(tweetText);

    newTweet.addEventListener('click', function() {
        window.open('https://twitter.com/' + obj.config.profile + '/status/' + tweet.id_str, '_new');
    });

    var feedList = feedContainer.getElementsByClassName('feed-list').item(0);
    for (var i = 0; i < feedList.getElementsByClassName('feed-list').length; i++) {
        if (tweetId > feedList.getElementsByClassName('feed-list').item(i).getElementsByClassName('tweet-id').item(0).value) {
            feedList.insertBefore(newTweet, feedList.getElementsByClassName('feed-list').item(i));
            return;
        }
    }

    feedList.appendChild(newTweet);
};
