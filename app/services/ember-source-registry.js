import Service, { inject } from '@ember/service';
import { assign } from '@ember/polyfills';
import moment from 'moment';
import semverUtils from 'npm:semver-utils';
import ENV from 'builds/config/environment';

import EmberBeta from '../fixtures/ember/beta';
import EmberRelease from '../fixtures/ember/release';
import EmberLTS from '../fixtures/ember/lts';

const { npmInfoURL } = ENV;

//beta, lts, release
export default Service.extend({

  ajax: inject(),

  init() {
    this._super(...arguments);
    this._esReleases = [];
  },

  fetch() {
    return this.get('ajax')
      .request(npmInfoURL)
      .then((data) => this._processResponse(data));
  },

  _processResponse(data) {
    let { 'dist-tags': version, time: releaseDates } = data;
    let { [version.beta]: betaDate } = releaseDates;

    betaDate = moment.utc(betaDate).startOf('day');

    //(FYI): -1 is used because beta.1 starts on the same day as prev. release
    let weeksLeft = 6 - (this._patchVersion(version.beta) * 1 - 1);

    // BETA
    let beta = assign({}, EmberBeta, {
      lastRelease: version.beta,
      futureVersion: this._nextRelease(version.beta),
      finalVersion: version.beta.replace(/-beta.*/, ''),
      date: betaDate.format('YYYY-MM-DD'),
      nextDate: betaDate.clone().add(7, 'day').format('YYYY-MM-DD'),
      cycleEstimatedFinishDate: betaDate.clone().add(weeksLeft, 'week').format('YYYY-MM-DD'),
    });

    let release = assign({}, EmberRelease, this._getProject('release', version.latest, releaseDates));
    let lts = assign({}, EmberLTS, this._getProject('lts', version.lts, releaseDates));
    return { beta, release, lts }
  },

  _getProject(channel, version, timedReleases) {
    let vParts = semverUtils.parse(version);
    let releases = {
      initial: semverUtils.stringify(assign({}, vParts, { patch: 0 })),
      latest: version,
      future: semverUtils.stringify(assign({}, vParts, { patch: vParts.patch*1 + 1 }))
    }

    let project = {
      initialVersion: releases.initial,
      lastRelease: releases.latest,
      futureVersion: releases.future,
      channel,
    };

    if (timedReleases[releases.latest]) {
      let m = moment.utc(timedReleases[releases.latest]).startOf('day');
      project['date'] = m.format('YYYY-MM-DD');
    }

    if (timedReleases[releases.initial]) {
      let m = moment.utc(timedReleases[releases.initial]).startOf('day');
      project['initialReleaseDate'] = m.format('YYYY-MM-DD');
    }

    return project;
  },

  _nextRelease(version) {
    let parts = version.split('.');
    let last = parts.splice(-1, 1);
    parts.push(1 * last + 1);
    return parts.join('.');
  },

  _patchVersion(version) {
    return version.split('.').pop() || 0;
  }



});


// export default {
//   lastRelease: "2.17.0-beta.1",
//   futureVersion: "2.17.0-beta.2",
//   finalVersion: '2.17.0',
//   channel: "beta",
//   cycleEstimatedFinishDate: '2017-11-20',
//  };


// export default {
//   initialVersion: "2.16.0",
//   initialReleaseDate: "2017-10-03",
//   lastRelease: "2.16.3",
//   futureVersion: "2.16.4",
//   channel: "release",
//   date: "2017-10-12",
// };

// export default {
//   initialVersion: "2.12.0",
//   initialReleaseDate: "2017-04-27",
//   lastRelease: "2.12.2",
//   futureVersion: "2.12.3",
//   channel: "lts",
//   date: "2017-04-27",
//  };
