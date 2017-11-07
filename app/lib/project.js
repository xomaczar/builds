import EmberObject from '@ember/object';
import { isNone } from '@ember/utils';

import EmberTagged from '../fixtures/ember/tagged';
import EmberCanary from '../fixtures/ember/canary';
import EmberBeta from '../fixtures/ember/beta';
import EmberRelease from '../fixtures/ember/release';
import EmberLTS from '../fixtures/ember/lts';

import EmberDataRelease from '../fixtures/ember-data/release';
import EmberDataTagged from '../fixtures/ember-data/tagged';
import EmberDataBeta from '../fixtures/ember-data/beta';
import EmberDataCanary from '../fixtures/ember-data/canary';


const FIXTURES = [
  EmberTagged,
  EmberDataTagged,
  EmberLTS,
  EmberRelease,
  EmberBeta,
  EmberDataRelease,
  EmberDataBeta,
  EmberCanary,
  EmberDataCanary
];

const Project = EmberObject.extend({});

Project.reopenClass({

  _fixtures: FIXTURES,

  load(npmRegistry) {
    if (isNone(npmRegistry)) {
      throw new Error("NPM registry was not provided");
    }

    return npmRegistry.fetch().then((projects) => {
      let fixtures = this._fixtures.filter((f) => !['beta', 'release', 'lts'].includes(f.channel));
      this._fixtures = fixtures.concat([projects.release, projects.beta, projects.lts]);
    });
  },

  all(channel) {
    let projects = this._fixtures;

    if (channel) {
      projects = this._fixtures.filterBy('channel', channel);
    }

    return projects.map(obj => Project.create(obj));
  },

  find(channel, name) {
    let allProjects = this.all(channel);

    if (!name) {
      return allProjects;
    }

    return allProjects.filterBy('projectName', name);
  },

  findOne(channel, name) {
    let results = this.find(channel, name);
    if (results.length > 1) {
      throw new Error(`Expected one result from \`find\`, got ${results.length}`);
    }

    return results[0];
  }
});

export default Project;
