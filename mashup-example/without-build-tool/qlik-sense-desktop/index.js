(function run() {
  function connect() {
    const schemaPromise = fetch('https://unpkg.com/enigma.js/schemas/3.2.json').then((response) => response.json());

    function openDoc(appId) {
      return schemaPromise.then((schema) =>
        window.enigma
          .create({
            schema,
            url: `ws://${window.location.hostname || 'localhost'}:9076/app/${encodeURIComponent(appId)}`,
          })
          .open()
          .then((qix) => qix.openDoc(appId))
      );
    }

    return openDoc;
  }

  connect()('/apps/Executive_Dashboard.qvf').then((app) => {
    // configure stardust
    const nuked = window.stardust.embed(app, {
      theme: 'dark',
      constraints: {
        active: true, // do not allow interactions
      },
      types: [
        {
          name: 'table',
          load: () => Promise.resolve(window['sn-table']),
        },
      ],
    });

    nuked.selections().then((selections) => selections.mount(document.querySelector('.toolbar')));

    // create a session object
    nuked.render({
      element: document.querySelector('.object'),
      type: 'table',
      fields: ['Sales Quantity', '=Sum([Sales Quantity])'],
    });

    // create another session object
    nuked.render({
      element: document.querySelectorAll('.object')[1],
      type: 'table',
      fields: ['Sales Price', '=Sum([Sales Quantity]*[Sales Price])'],
      options: {
        direction: 'rtl',
      },
    });
  });
})();
