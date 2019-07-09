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



const card_state = {
  cards: {}, // card_id => {}
  zones: {}, // zone_id:string => [card_id:string]
};



const element_to_zone = new Map(); // DOMElement => {}
const zonename_to_zone = new Map(); // str => DOMElement

const el_all = [];
const el_sources = new Set();
const el_targets = new Set();
const el_trashes = new Set();
for (let zone of zones) {
  const el = zone.el;
  el_all.push(el);
  element_to_zone.set(el, zone);
  zonename_to_zone.set(zone.name, zone);

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
  console.log('drop', el, target, source, sibling);
  const zone = element_to_zone.get(target);
  if (!zone) {
    // card was dropped somewhere random, ignore it
    return;
  }

  if (zone.trash) {
    console.log('DESTROY');
    el.parentNode.removeChild(el);
    return;
  }

  const textarea = el.getElementsByTagName('textarea')[0];

  if (!textarea) {
    console.error("CANNOT FIND TEXTAREA", el);
    return;
  }

  // remove old value and focus for ease of editing
  // textarea.value = "";
  textarea.focus();

  const hint = el.getElementsByClassName('hint')[0];

  if (!hint) {
    // dropping between two fields, not cloning
    return;
  }

  hint.parentNode.removeChild(hint);

  let sibling_id = null;
  if (sibling) {
    sibling_id = sibling.dataset.id;
  }

  const card_id = card_create(zone.name, sibling_id);

  el.dataset.id = card_id;
});

drake.on('over', (el, container, source) => {
  container.classList.add('hover');
});

drake.on('out', (el, container, source) => {
  container.classList.remove('hover');
});

// Dragula provides the next/right sibling ID, not the previous/left
function card_create(zonename, sibling_id) {
  const zone = zonename_to_zone.get(zonename);
  const id = uuid();

  const card = {
    content: '',
    zone: zone.name
  };

  card_state.cards[id] = card;

  if (!card_state.zones[zone.name]) {
    card_state.zones[zone.name] = [];
  }

  const zone_list = card_state.zones[zone.name];

  if (sibling_id) {
    const sibling_index = zone_list.indexOf(sibling_id);
    zone_list.splice(sibling_index, 0, id);
  } else {
    // append to end of zone
    card_state.zones[zone.name].push(id);
  }

  return id;
}

function card_destroy(card_id) {
  const card = card_state.cards[card_id];

  if (!card) {
    throw new Error(`Card ${id} does not exist`);
  }

  const index = card_state.zones[card.zone].indexOf(card_id);

  if (index < 0) {
    throw new Error(`Card ${card_id} does not exist in zone`);
  }

  card_state.zones[card.zone].splice(index, 1);
  delete card_state.cards[card_id];
}

function card_move() {
}

function uuid() {
  // http://www.ietf.org/rfc/rfc4122.txt
  const s = [];
  const HEX = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
      s[i] = HEX.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = HEX.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  return s.join("");
}
