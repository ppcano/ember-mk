# Ember Mobile Kit

The project publishs Mobile UI components to be used on multiple touch devices.

The main idea behind: 

- Manage/Discuss the required features for a emberjs Mobile UIKit.
- Reuse Mobile UIs components to be improved on its daily use.

Initially, the project is not intented to be production ready, but a
way to avoid developers rewrite from scratch what other developers have already done.

# Features

  - Modal, Swipe and Tab Views.
  - Animation Manager.

# How to Run/Build

## Building Ember-mk

Install gems with _bundle install_ and execute _rake_ task, ember-mk  will be created on the _dist_ directory.
Import the file to your project, on the correct order.


##Examples

run __bundle exec rackup__ 

http://localhost:9292/examples

##Unit Tests

run __bundle exec rackup__ 

Test the whole suite  http://localhost:9292/examples/test.html

Test only a specific test file (add test param: test location without extension) http://localhost:9292/examples/test.html?test=system/view_test

If you want to test against other ember/jquery/ember-touchs version, deployed the js on the examples/assets directory.


# TODO

- Create own transform API to replace movejs.
- Not implemented require pattern
