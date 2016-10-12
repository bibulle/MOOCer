
import {Paragraph} from "./paragraph";

export class Course {

  // Course stuff
  id: string;
  name: string;
  description: string;
  note: number;
  noteCount: number;
  parts: CoursePart[];

  created: Date;
  update: Date;


  // User stuff
  isFavorite: boolean;
  interest: number;
  dateSeen: Date;
  new: boolean;
  dateFollowed: Date;
  dateFollowedEnd: Date;
  done: boolean;
  percentFollowed: number;
  inProgress: boolean;




}

export class CoursePart {

  title: string;

  parts: CoursePart[];

  contents: Paragraph[];

  constructor(option) {
    this.title = option.title;
    this.parts = option.parts;
    this.contents = option.contents;
  }
}

