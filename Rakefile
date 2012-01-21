require "bundler/setup"
require "sproutcore"
require "erb"
require "uglifier"

LICENSE = File.read("generators/license.js")

## Some SproutCore modules expect an exports object to exist. Until bpm exists,
## just mock this out for now.

module SproutCore
  module Compiler
    class Entry
      def body
        "\n(function(exports) {\n#{@raw_body}\n})({});\n"
      end
    end
  end
end

## HELPERS ##

def strip_require(file)
  result = File.read(file)
  result.gsub!(%r{^\s*require\(['"]([^'"])*['"]\);?\s*$}, "")
  result
end

def strip_sc_assert(file)
  result = File.read(file)
  result.gsub!(%r{^(\s)+sc_assert\((.*)\).*$}, "")
  result
end

def uglify(file)
  uglified = Uglifier.compile(File.read(file))
  "#{LICENSE}\n#{uglified}"
end

SproutCore::Compiler.intermediate = "tmp/intermediate"
SproutCore::Compiler.output       = "tmp/static"

def compile_package_task(package)
  js_tasks = SproutCore::Compiler::Preprocessors::JavaScriptTask.with_input "packages/#{package}/lib/**/*.js", "."
  SproutCore::Compiler::CombineTask.with_tasks js_tasks, "#{SproutCore::Compiler.intermediate}/#{package}"
end

namespace :ember do
    task :mk => compile_package_task("ember-mk")
end

task :build => ["ember:mk"]


mkdir_p "dist"

file "dist/ember-mk.js" => :build do
  puts "Generating ember-mk.js"

  File.open("dist/ember-mk.js", "w") do |file|
    file.puts strip_require("tmp/static/ember-mk.js")
  end

end

# Minify dist/ember-mk.js to dist/ember-mk.min.js
file "dist/ember-mk.min.js" => "dist/ember-mk.js" do
  puts "Generating ember-mk.min.js"
  
  File.open("dist/ember.prod.js", "w") do |file|
    file.puts strip_sc_assert("dist/ember-mk.js")
  end

  File.open("dist/ember-mk.min.js", "w") do |file|
    file.puts uglify("dist/ember-mk.js")
  end
end

cp_r "packages/ember-mk/css/ember-mk.css", "dist/ember-mk.css", :verbose => false
#cp_r "examples/assets/move.js", "dist/move.js", :verbose => false
cp_r "examples/assets/jquery.transit.js", "dist/jquery.transit.js", :verbose => false



desc "Clean build artifacts from previous builds"
task :clean do
  sh "rm -rf tmp && rm -rf dist"
end

task :default => ["dist/ember-mk.min.js"]
