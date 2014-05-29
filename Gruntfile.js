/**
 * Grunt build file.
 */

'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: ['build/'],
      dist: ['dist/']
    },

    concat: {
      options: {
        stripBanners: true,
        banner: grunt.file.read('header.js'),
        footer: grunt.file.read('footer.js')
      },
      dist: {
        src: [
          'src/settings.js',
          'src/safe-sync.js',
          'src/model.js',
          'src/collection.js',
          'src/view.js',
          'src/mediator.js',
          'src/inline-template-manager.js',
          'src/dom-template-manager.js',
          'src/remote-template-manager.js',
          'src/app.js',
          'src/router.js',
          'src/composite-view.js'
        ],
        dest: 'build/bb-strap.js',
      },
    },

    uglify: {
      build: {
        src: 'build/bb-strap.js',
        dest: 'build/bb-strap.min.js'
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      },
      // Continuous integration mode: run tests once in PhantomJS browser.
      continuous: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: [
          'PhantomJS'
        ]
      },
      // Check concatened file
      dist: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: [
          'PhantomJS'
        ],
        files: [
          {
            pattern: 'components/jquery/dist/jquery.js',
            watched: false,
            served: true,
            included: true
          },
          {
            pattern: 'components/jquery/jquery.js',
            watched: false,
            served: true,
            included: true
          },
          {
            pattern: 'components/underscore/underscore.js',
            watched: false,
            served: true,
            included: true
          },
          {
            pattern: 'components/backbone/backbone.js',
            watched: false,
            served: true,
            included: true
          },
          {
            pattern: 'build/bb-strap.js',
            watched: true,
            served: true,
            included: true
          },
          {
            pattern: 'test/*spec.js',
            watched: true,
            served: true,
            included: true
          }
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
    },

    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json', 'dist'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false
      }
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'build/',
            src: ['**'],
            dest: 'dist/'
          }
        ]
      }
    },

    exec: {
      dist: {
        command: 'git add -f dist',
        stdout: true
      }
    }
  });

  grunt.registerTask('test', [
    'karma'
  ]);

  grunt.registerTask('dist', [
    'clean:dist',
    'copy:dist',
    'exec:dist'
  ]);

  // Default task(s).
  grunt.registerTask('build', [
    'clean:build',
    'jshint',
    'karma:continuous',
    'concat:dist',
    'uglify',
    'karma:dist'
  ]);

  grunt.registerTask('release', function(level) {
    var lvl = level || 'minor';
    grunt.task.run('build');
    grunt.task.run('dist');
    grunt.task.run('bump:' + lvl);
  });

  grunt.registerTask('default', ['build']);
};