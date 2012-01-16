# Ember Mobile Kit

The project publishs Mobile UI components to be used on multiple touch devices.

The main idea behind: 

- Manage/Discuss the required features for a emberjs Mobile UIKit.
- Reuse Mobile UIs components to be improved on its daily use.

Initially, the project is not intented to be production ready, but a
way to avoid developers rewrite from scratch what other developers have already done.

# Features

  - Modal, Swipe, Scroll and Tab Views.
  - Animation Manager: using AnimatableMixin ( animates either default
    properties or own functions )

# How to Run/Build

## Building Ember-mk

Install gems with _bundle install_ and execute _rake_ task, ember-mk  will be created on the _dist_ directory.

Import the js and css files to your project. 
Also include move.js on your project.


##Examples

run __bundle exec rackup__ 

http://localhost:9292/examples

##Unit Tests

run __bundle exec rackup__ 

Test the whole suite  http://localhost:9292/examples/test.html

Test only a specific test file (add test param: test location without extension) http://localhost:9292/examples/test.html?test=system/view_test

If you want to test against other ember/jquery/ember-touchs version, deployed the js on the examples/assets directory.


# TODO

- Replace movejs dependency with own transform API. 
- Require pattern
- Rake command must concatenate css output
