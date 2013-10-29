/**
 * Grunt build file.
 */

'use strict';

module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: ['build/'],

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      },
      // continuous integration mode: run tests once in PhantomJS browser.
      continuous: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: [
          'PhantomJS'
        ]
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'src/*.js'
      ]
    }

  });

  // Load clean task
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load Karma Plugin that provides "karma" task
  grunt.loadNpmTasks('grunt-karma');

  // Load JsHint Plugin
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', [
    'karma'
  ]);

  // Default task(s).
  grunt.registerTask('build', [
    'clean',
    'jshint',
    'karma:continuous',
    'uglify'
  ]);

  grunt.registerTask('default', ['build']);
};