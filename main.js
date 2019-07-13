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

// When _any_ <textarea> is modified, update the appropriate card
document.oninput = (e) => {
  const target = e.target;
  if (target.tagName !== 'TEXTAREA') {
    console.log(`ignoring input for element type ${target.tagName}`);
    return;
  }

  const content = target.value;

  const card_id = target.parentNode.dataset.id;

  card_state.cards[card_id].content = content;
};

// half-assed state exporter
$$('action-export').onclick = () => {
  alert(exporter());
};

function exporter() {
  return JSON.stringify(card_state, null, 2);
}

function importer(payload) {
  const temp = JSON.parse(payload);

  if (!temp.zones || !temp.cards) {
    throw new Error('invalid format');
  }

  for (let zone of zones) {
    const temp_list = temp.zones[zone.name];

    if (!temp_list || !temp_list.length) {
      // no cards imported in this zone
      continue;
    }

    for (let card_id of temp_list) {
      let card = temp.cards[card_id];
      // card_create(zone.name, sibling_id, card_type)
      // There's an assymetry when creating cards normally and importing
      // TODO: switch to Vue.js, don't let Dragula perform the element clones
      zone.el.insertAdjacentHTML(
        'beforeend',
        // TODO: need to escape card.content, card.type
        `<div class="card card-${card.type}" data-id="${card_id}" data-cardtype="${card.type}"><textarea>${card.content}</textarea></div>`
      );
    }
  }

  card_state.cards = temp.cards;
  card_state.zones = temp.zones;
}



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

  let card_id = el.dataset.id;
  let card_type = el.dataset.cardtype;

  if (zone.trash) {
    console.log('DESTROY', card_id);
    el.parentNode.removeChild(el);
    // if user is dropping a new card there will be no ID
    if (card_id) {
      card_destroy(card_id);
    }
    return;
  }

  let sibling_id = null;
  if (sibling) {
    sibling_id = sibling.dataset.id;
  }

  if (card_id) {
    // MOVE CARD
    card_move(zone.name, sibling_id, card_id);
  } else {
    // CREATE CARD
    card_id = card_create(zone.name, sibling_id, card_type);
    el.dataset.id = card_id;

    const hint = el.getElementsByClassName('hint')[0];
    hint.parentNode.removeChild(hint);
  }

  el.getElementsByTagName('textarea')[0].focus();
});

drake.on('over', (el, container, source) => {
  container.classList.add('hover');
});

drake.on('out', (el, container, source) => {
  container.classList.remove('hover');
});

// Dragula provides the next/right sibling ID, not the previous/left
function card_create(zone_name, sibling_id, card_type) {
  const zone = zonename_to_zone.get(zone_name);
  const id = uuid();

  const card = {
    content: '',
    type: card_type,
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

function card_move(new_zone_name, sibling_id, card_id) {
  console.log('MOVE', arguments);
  const card = card_state.cards[card_id];

  const old_zone_name = card.zone;
  card.zone = new_zone_name;

  console.log('old', old_zone_name);
  const index = card_state.zones[old_zone_name].indexOf(card_id);
  console.log('old move index', index);
  card_state.zones[old_zone_name].splice(index, 1); // remove from old

  if (sibling_id) {
    const sibling_index = card_state.zones[new_zone_name].indexOf(sibling_id);
    card_state.zones[new_zone_name].splice(sibling_index, 0, card_id);
  } else {
    if (!card_state.zones[new_zone_name]) {
      card_state.zones[new_zone_name] = [];
    }
    card_state.zones[new_zone_name].push(card_id);
  }
}

function uuid() {
  // http://www.ietf.org/rfc/rfc4122.txt
  const s = [];
  const HEX = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
      // TODO: Bad impl, requires 36 rand, should
      s[i] = HEX.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = HEX.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  return s.join("");
}
