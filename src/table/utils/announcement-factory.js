/**
 * creates the function for announcement
 *
 * @param {Object} rootElement root element for getting the live aria from it
 * @param {Object} translator translator object
 * @param {number=} junkCharIdx for test reasons
 */

export default function announcementFactory(rootElement, translator, junkCharIdx) {
  let hasJunkChar = junkCharIdx || 0;
  let lastAnnounceElement = null;

  /**
   * the announce function
   *
   * @param {Object} announcementArgs required configuration object for announcement
   * @param {string|Array<string|Array<string|number>} announcementArgs.keys required translation keys, that could be a string, an array of strings (for concatenating multiple keys), or a 2-dimensional array with arguments for translations, e.g. `{ keys: ['some string key', ['some other string key', arg1, arg2, ...]] }`
   * @param {boolean=} announcementArgs.shouldBeAtomic defines the live element should be atomic or not
   * @param {(polite|assertive|off)=} announcementArgs.politeness the assertive level of the live element
   *
   * @returns {undefined} this function should not retuns anyhting, it will only make changes in the live element
   */
  return ({ keys, shouldBeAtomic = true, politeness = 'polite' }) => {
    const stringKeys = Array.isArray(keys) ? keys : [keys];

    let notation = stringKeys
      .map((key) => {
        if (Array.isArray(key)) {
          const [actualKey, ...rest] = key;
          return translator.get(actualKey, ...rest);
        }
        return translator.get(key);
      })
      .join(' ');

    if (hasJunkChar % 2) notation += ` ­`;
    hasJunkChar++;

    const announceElement_01 = rootElement.querySelector('#sn-table-announcer--01');
    const announceElement_02 = rootElement.querySelector('#sn-table-announcer--02');

    let announceElement = null;
    if (lastAnnounceElement === null) {
      announceElement = announceElement_01;
      lastAnnounceElement = announcerElements.first;
    } else if (lastAnnounceElement && lastAnnounceElement === announcerElements.first) {
      announceElement = announceElement_02;
      lastAnnounceElement = announcerElements.second;
    } else {
      announceElement = announceElement_01;
      lastAnnounceElement = announcerElements.first;
    }

    announceElement.innerHTML = notation;
    announceElement.setAttribute('aria-atomic', shouldBeAtomic);
    announceElement.setAttribute('aria-live', politeness);
  };
}

const announcerElements = {
  first: 'first-announcer-element',
  second: 'second-announcer-element',
};
