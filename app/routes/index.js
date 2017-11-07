import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import Project from '../lib/project';
import S3Bucket from '../lib/s3-bucket';

export default Route.extend({

  esRegistry: inject('ember-source-registry'),

  beforeModel() {
    return Project.load(this.get('esRegistry'));
  },

  model() {
    return hash({
      releaseSteps: S3Bucket.create({
        title: 'Beta Builds',
        prefix: 'beta/'
      }),
      release: Project.findOne('release', 'Ember'),
      beta: Project.findOne('beta', 'Ember'),
      canary: Project.findOne('canary', 'Ember'),
      lts: Project.findOne('lts', 'Ember')
    });
  }
});
