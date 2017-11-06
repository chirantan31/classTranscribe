// var router = express.Router();
var fs = require('fs');
var client = require('./../../modules/redis');
var readline = require('readline');
var sys = require('sys');
var exec = require('child_process').exec;
var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './videos');
  },
  filename: function(req, file, callback) {
    callback(null, file.originalname);
  }
});
/**var storage = multer.diskStorage({
  dest: './videos',
  rename: function(fieldname, filename) {
    var split = filename.split(/(?:.mp4|.avi|.flv|.wmv|.mov|.wav|.ogv|.mpg|.m4v)/);
    console.log(filename);
    if(split.length != 2) {
      return "bad_file";
    }
    return split[0]+".mp4";
  },
  onFileUploadStart: function(file) {
    if(file.name == "bad_file") {
      return false;
    }
    console.log(file.name + " upload is starting...");
  }
});**/

var manageCoursePage = fs.readFileSync(mustachePath + 'manageCourse.mustache').toString();
router.get('/manageCourse', function (request, response) {
console.log("Got ROUTE", manageCoursePage)
  response.writeHead(200, {
    'Content-Type': 'text/html'
  });

  renderWithPartial(manageCoursePage, request, response);
});

router.get('/getUserCourses', function (request, response) {

   client.smembers("ClassTranscribe::CourseList", function(err, results) {
   	 if(err) console.log(err);
   	 console.log(results);
     response.send(results);
   });
});

router.post('/addInstructors', function (request, response) {

   var data = request.body.instructors;
   var instructors = data.split(/[\s,;:\n]+/);
   var toadd = [];
   for(instructor in instructors) {
    if(instructor.match(/\^w+@[a-z]+?\.edu$/)) {
      toadd.push(instructor);
    }
   }
   console.log(instructors);
   console.log(toadd);
   client.sadd("instructors", toadd, function(err, res) {
      if(err) console.log(err);
   		console.log("added instructors");
   });
   response.send(instructors);
});

router.post('/addStudents', function (request, response) {
   var data = request.body.students;
   var students = data.split(/[\s,;:\n]+/);
   client.sadd("students", students, function(err, res) {
   		console.log("added students");
   });
   response.send(students);
});

//var upload = multer({ storage : storage}).single('studentsFile');
router.post('/addStudentsFiles', function (request, response) {
  var upload = multer({ storage : storage}).single('studentsFile');
  upload(request, response, function(err) {
    console.log(request.file.path);
    var interface = readline.createInterface({
      input: fs.createReadStream(request.file.path)
    });
    interface.on('line', function (line) {
      client.sadd("students", line, function(err) {
        console.log("added student: " + line);
      })
    }); 
    response.end();
  });
});

router.post('/uploadLectureVideos', function(request, response) {
  var upload = multer({ storage : storage}).any();
  //console.log(response.status(200).send(request.file));
  console.log("uploading...");
  upload(request, response, function(err) {
    console.log("still uploading...");
    });
    console.log("done");
    response.end();
});

module.exports = router;