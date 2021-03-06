import Mongoose = require("mongoose");
import * as _ from 'lodash';
var Schema = Mongoose.Schema;

import IUserChoices = require("./iUserChoices");
import IUserParts = require("./iUserParts");

var debug = require('debug')('server:model:user-course');

class IUserCourse {

  userId: string;
  courseId: string;

  isFavorite: boolean;
  interest: number;
  dateSeen: Date;
  'new': boolean;
  dateFollowed: Date;
  dateFollowedEnd: Date;
  percentFollowed: number;

  userChoices: { [id: string]: IUserChoices };
  userParts: { [id: string]: IUserParts };

  /**
   * Constructor
   * @param document
   */
  constructor(document: {}) {
    _.merge(this, document);
  }
}

interface IUserCourseModel extends IUserCourse, Mongoose.Document {
}

/**
 * MongooseSchema
 * @type {"mongoose".Schema}
 * @private
 */
var _schema: Mongoose.Schema = new Mongoose.Schema({
  userId: {
    type: String,
    require: true
  },
  courseId: {
    type: String,
    require: true
  },
  isFavorite: {
    type: Boolean,
    'default': false
  },
  interest: {
    type: Number,
    'default': 0
  },
  dateSeen: {
    type: Date,
    'default': null
  },
  'new': {
    type: Boolean,
    'default': true
  },
  dateFollowed: {
    type: Date,
    'default': null
  },
  dateFollowedEnd: {
    type: Date,
    'default': null
  },
  percentFollowed: {
    type: Number,
    'default': 0
  },
  created: {
    type: Date,
    'default': Date.now
  },
  updated: {
    type: Date,
    'default': Date.now
  },
  userChoices: {
    type: Schema.Types.Mixed,
    require: false
  },
  userParts: {
    type: Schema.Types.Mixed,
    require: false
  }
})
  .pre('save', function (next) {
    this.updated = new Date();
    next();
  });

/**
 * Mongoose.Model
 * @type {Model<IUser>}
 * @private
 */
var _model = Mongoose.model < IUserCourseModel >('UserCourse', _schema);

class UserCourse extends IUserCourse {

  /**
   * Constructor
   * @param document
   */
  constructor(document: {}) {
    super(document);
  }

  static count(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      _model.count(
        {},
        (err, count) => {
          err ? reject(err) : resolve(count);
        });
    })
  };

  static findByUserId(userId: string): Promise < { [id: string]: UserCourse } > {
    return new Promise < { [id: string]: UserCourse } >((resolve, reject) => {
      _model.find({userId: userId})
        .lean()
        .exec()
        .then(
          (userCourses: UserCourse[]) => {

            var result = {};

            userCourses.forEach(uc => {
              uc['id'] = uc['_id'].toString();

              result[uc.courseId] = uc;
            });

            resolve(result);
          },
          err => {
            reject(err);
          });
    })
  }

  static findByUserIdCourseId(userId: string, courseId: string): Promise < UserCourse > {
    return new Promise < IUserCourse >((resolve, reject) => {
      _model.findOne({userId: userId, courseId: courseId})
        .lean()
        .exec()
        .then(
          (user: IUserCourse) => {
            //debug(user);
            if (user) {
              user['id'] = user['_id'].toString();
            }
            resolve(user);
          },
          err => {
            reject(err);
          });
    })
  }

  static updateOrCreate(userCourse: UserCourse): Promise < UserCourse > {
    return new Promise<IUserCourse>((resolve, reject) => {
      var obj = {};
      _.assign(obj, userCourse);
      _model.findOneAndUpdate(
        {userId: userCourse.userId, courseId: userCourse.courseId},
        {$set: obj},
        {upsert: true, 'new': true},
        //{upsert: true, 'new': true, setDefaultsOnInsert: true},
        function (error, result) {
          if (error) {
            reject(error);
          } else {
            result = result['_doc'];
            result['id'] = result._id.toString();
            resolve(result);
          }
        }
      )
    });
  }

  /**
   * Delete all userCourses for a course
   * @returns {Promise<void>}
   * @param courseId
   */
  static removeByCourseId(courseId: string): Promise < void > {
    //debug("remove");
    return new Promise < void >((resolve, reject) => {

      // Do the search
      _model.remove({courseId: courseId})
                 .lean()
                 .exec()
                 .then(
                   () => {
                     resolve();
                   },
                   err => {
                     debug("remove " + err);
                     reject(err);
                   })
      ;
    })
  }


}


export = UserCourse;
