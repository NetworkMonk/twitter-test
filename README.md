# twitter-test

A PHP / JavaScript based twitter widget.

## Useage

Include the css, php and js folders in your project. Include the css and js file on your page.

Initialize the widget with the following command.

```JavaScript
new TwitterTest({
    profile: 'ScreenName',
    applicationPath: './php/endpoints/',
    element: document.getElementsByClassName('target-element').item(0),
    size: 'medium',
});
```

## Test Build

For testing a docker file is included which can be used to build a test docker image.
Run a container using the following command.

```ps
docker run -p 8001:80 twitter-test
```

The test will now be available on http://localhost:8001