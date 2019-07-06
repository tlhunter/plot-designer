const $$ = (id) => document.getElementById(id);
const $ = (selector) => document.querySelectorAll(selector);

const zones = [
  {
    name: 'toolbar',
    el: $$('zone-toolbar'),
    source: true,
    target: false,
    size: 0,
    trash: false,
  },
  {
    name: 'trash',
    el: $$('zone-trash'),
    source: false,
    target: true,
    size: 0,
    trash: true,
  },
  {
    name: 'setup',
    el: $$('zone-setup'),
    source: false,
    target: true,
    size: 0.1,
    trash: false,
  },
  {
    name: 'debate',
    el: $$('zone-debate'),
    source: false,
    target: true,
    size: 0.1,
    trash: false,
  },
  {
    name: 'rise',
    el: $$('zone-rise'),
    source: false,
    target: true,
    size: 0.3,
    trash: false,
  },
  {
    name: 'fall',
    el: $$('zone-fall'),
    source: false,
    target: true,
    size: 0.15,
    trash: false,
  },
  {
    name: 'dark',
    el: $$('zone-dark'),
    source: false,
    target: true,
    size: 0.15,
    trash: false,
  },
  {
    name: 'finale-1',
    el: $$('zone-finale-1'),
    source: false,
    target: true,
    size: 0.04,
    trash: false,
  },
  {
    name: 'finale-2',
    el: $$('zone-finale-2'),
    source: false,
    target: true,
    size: 0.04,
    trash: false,
  },
  {
    name: 'finale-3',
    el: $$('zone-finale-3'),
    source: false,
    target: true,
    size: 0.04,
    trash: false,
  },
  {
    name: 'finale-4',
    el: $$('zone-finale-4'),
    source: false,
    target: true,
    size: 0.04,
    trash: false,
  },
  {
    name: 'finale-5',
    el: $$('zone-finale-5'),
    source: false,
    target: true,
    size: 0.04,
    trash: false,
  },
];

const element_to_zone = new Map();

const el_all = [];
const el_sources = new Set();
const el_targets = new Set();
const el_trashes = new Set();
for (let zone of zones) {
  const el = zone.el;
  el_all.push(el);
  element_to_zone.set(el, zone);

  if (zone.source) el_sources.add(el);
  if (zone.target) el_targets.add(el);
  if (zone.trash) el_trashes.add(el);
}

const drake = dragula(el_all, {
  copy(el, source) {
    return el_sources.has(source);
  },

  accepts(el, target) {
    return el_targets.has(target);
  },
});

drake.on('drop', (el, target, source, sibling) => {
  const zone = element_to_zone.get(target);
  if (!zone) {
    console.error("CANNOT FIND ZONE", el, target, source);
    return;
  }

  if (zone.trash) {
    console.log('DESTROY');
    el.parentNode.removeChild(el);
    return;
  }

  el.getElementsByTagName('textarea')[0].focus();
});

console.log('hey');
