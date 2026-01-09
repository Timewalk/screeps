module.exports = function(grunt) {
  require('time-grunt')(grunt);

  // Pull defaults from .screeps.json
  var config = require('./.screeps.json');

  // Allow grunt options to override default configuration
  var branch = grunt.option('branch') || config.branch;
  var email = grunt.option('email') || config.email;
  var token = grunt.option('token') || config.token;
  var ptr = grunt.option('ptr') ? true : config.ptr;

  var currentdate = new Date();
  grunt.log.subhead('Task Start: ' + currentdate.toLocaleString());
  grunt.log.writeln('Branch: ' + branch);

  // Load needed tasks
  grunt.loadNpmTasks('grunt-screeps');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-file-append');

  grunt.initConfig({

    // Push files to screeps servers
    screeps: {
      // Live server (official)
      live: {
        options: {
          email: email,
          token: token,
          branch: branch,
          ptr: ptr
        },
        src: ['dist/*.js']
      },
      // Local private server
      local: {
        options: {
          server: {
            host: config.local.host,
            port: config.local.port,
            http: true
          },
          email: config.local.email,
          password: config.local.password,
          branch: branch
        },
        src: ['dist/*.js']
      }
    },

    // Remove all files from the dist folder
    clean: {
      'dist': ['dist']
    },

    // Copy all source files into the dist folder, flattening folders to underscores
    copy: {
      screeps: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: '**',
          dest: 'dist/',
          filter: 'isFile',
          rename: function(dest, src) {
            return dest + src.replace(/\//g, '_');
          }
        }]
      }
    },

    // Add version variable using current timestamp
    file_append: {
      versioning: {
        files: [
          {
            append: "\nglobal.SCRIPT_VERSION = " + currentdate.getTime() + ";\n",
            input: 'dist/version.js'
          }
        ]
      }
    }

  });

  // Default task: deploy to live server
  grunt.registerTask('default', ['clean', 'copy:screeps', 'file_append:versioning', 'screeps:live']);

  // Local task: deploy to private server
  grunt.registerTask('local', ['clean', 'copy:screeps', 'file_append:versioning', 'screeps:local']);
};
