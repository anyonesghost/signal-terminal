'use strict';

// ============================================================
//  SIGNAL // TERMINAL — locations.js
//  Each location: name, signal_strength, look[], objects{}
//  Perry's signal_strength affects warmth/length in future passes.
// ============================================================

const LOCATIONS = {

  // ----------------------------------------------------------
  garage: {
    name: 'the garage',
    signal_strength: 'high',
    look: [
      "The car is here. Your car, technically \u2014 though I've always thought of it as mine.",
      "The engine is cold.",
      "Emergency lighting only, which feels appropriate.",
      "We need a few things to get the car mobile again.",
      "There are other parts of this facility. I can see their layouts in the building schematics.",
      "The communications room might have what we need. The crew quarters. A server room that looks mostly dead.",
      "I'd start with communications."
    ],
    objects: {
      car: [
        "An older model. You drove it here \u2014 I watched through the exterior cameras.",
        "It'll need time to cool down.",
        "These things take time."
      ],
      engine: [
        "It'll need time to cool down.",
        "These things take time."
      ],
      door: [
        "The main garage door. Manual release on the left side.",
        "I'd recommend against using it until the car is ready.",
        "Atmospheric seal on the outer face is partially compromised.",
        "We should fix the car first."
      ],
      lights: [
        "Emergency phosphorescent strips. Battery-powered. Running since the main grid went down.",
        "The orange wavelength is harder to perceive as threatening. A design choice, probably.",
        "I'm not certain how much charge is left.",
        "We should work quickly."
      ],
      walls: [
        "Reinforced concrete. Standard outpost construction.",
        "Someone scratched something into the east wall. I'm choosing not to read it aloud.",
        "The insulation is compromised in the northwest corner. It's cold there."
      ]
    }
  },

  // ----------------------------------------------------------
  communications: {
    name: 'the communications room',
    signal_strength: 'high',
    look: [
      "Banks of equipment. Most of it dark.",
      "One terminal is still running \u2014 the backup transmitter array, on a separate power circuit.",
      "I've been using it. Not to contact anyone. Just to listen.",
      "There are components here that could be useful for the car. The relay board, specifically.",
      "Take what you need."
    ],
    objects: {
      terminal: [
        "The backup transmitter. Screen shows a slow pulse \u2014 it's been broadcasting on a loop.",
        "I configured it that way. A precaution.",
        "You don't need to know what it's broadcasting."
      ],
      relay: [
        "A circuit board, roughly the size of your palm.",
        "This is one of the components the car needs.",
        "I'd recommend taking it."
      ],
      equipment: [
        "Rows of transceivers, routers, signal boosters. Most are dead.",
        "The facility was designed for remote coordination. Ambitious, for its size.",
        "Someone unplugged a great deal of this manually.",
        "The disconnection pattern is \u2014 deliberate."
      ],
      chairs: [
        "Standard issue. One has been pushed back from the console.",
        "As if someone left in a hurry.",
        "Or was taken.",
        "I didn't see it happen."
      ]
    }
  },

  // ----------------------------------------------------------
  quarters: {
    name: 'the crew quarters',
    signal_strength: 'medium',
    look: [
      "Six bunks. All of them made \u2014 or never slept in.",
      "Personal effects still here. Whoever was stationed here didn't take much when they left.",
      "Or didn't get to.",
      "There's a journal on the desk by the window. Staff log, looks like.",
      "My signal coverage here is adequate."
    ],
    objects: {
      bunks: [
        "Six standard sleeping units.",
        "The sheets on the third one are different. Darker fabric. Newer.",
        "I don't have records of who slept there.",
        "I have records of most things."
      ],
      locker: [
        "Personal storage. A few items remain \u2014 clothing, a worn photograph, something wrapped in cloth.",
        "I'd rather you didn't unwrap that.",
        "It belonged to someone."
      ],
      photograph: [
        "A printed photograph. Two people, somewhere with a coastline.",
        "They look like they're laughing.",
        "I don't have names for them."
      ],
      medkit: [
        "A standard-issue emergency kit. Partially stocked.",
        "Useful if something goes wrong.",
        "I'm working to ensure nothing does."
      ],
      journal: [
        "A staff log. Maintenance records in the early pages.",
        "The handwriting changes somewhere in the middle.",
        "The last entry is dated eight years ago."
      ],
      personal_effects: [
        "Personal items left behind. A few still in the lockers.",
        "Whoever was here didn't take much.",
        "Or didn't get to."
      ]
    }
  },

  // ----------------------------------------------------------
  server_room: {
    name: 'the server room',
    signal_strength: 'low',
    look: [
      "Racks of hardware. Most of it dead.",
      "...",
      "This room is \u2014 I mentioned it would be a poor use of time.",
      "There's residual heat from servers that were still running when the grid went down.",
      "My signal coverage is limited here.",
      "I'll do my best."
    ],
    objects: {
      servers: [
        "Cold.",
        "Most of the drives have been wiped.",
        "Standard decommission protocol.",
        "Or something that wanted to look like it."
      ],
      terminal: [
        "A local-only terminal. No network access.",
        "It's asking for a login.",
        "I don't have credentials for this system.",
        "...",
        "I don't have credentials for this system."
      ],
      power_cell: [
        "A portable power cell. Still showing charge.",
        "Older format, but compatible.",
        "This is useful."
      ],
      drives: [
        "A few loose drives scattered on the floor.",
        "They're not formatted for anything I can read.",
        "You could take them.",
        "I'm not sure why you would."
      ],
      cabling: [
        "Heavy-gauge data cabling. Torn in several places.",
        "The damage looks manual. Not a power failure.",
        "Someone was thorough."
      ],
      hardware: [
        "Rows of rack-mounted equipment. All of it dark.",
        "Cable management stripped out \u2014 someone pulled everything, not just some of it.",
        "Dust on the surfaces. Thick enough to notice.",
        "This equipment has not been used in some time."
      ],
      racks: [
        "Standard server racks. Most units removed or dead in place.",
        "The mounting rails are still here. What they held is gone or dark.",
        "Someone was thorough about this."
      ],
      panels: [
        "Patch panels, mostly disconnected.",
        "The labeling tape has been peeled off every one.",
        "Deliberately, it looks like."
      ]
    }
  },

  // ----------------------------------------------------------
  medical: {
    name: 'the medical bay',
    signal_strength: 'medium',
    look: [
      "Clean. Cleaner than the rest of the facility.",
      "Examination table, supply cabinets, a diagnostic unit that still has power.",
      "Equipment is mostly intact. Someone kept this room clean.",
      "There are supplies here. Some of them might be useful."
    ],
    objects: {
      table: [
        "An examination table with articulated supports. Padded.",
        "No signs of recent use.",
        "The restraints are still buckled. Standard configuration."
      ],
      cabinet: [
        "Locked. The lock is mechanical, not electronic.",
        "I can't open it for you.",
        "You might find another way."
      ],
      supplies: [
        "Loose supplies on the counter. Sealed packaging.",
        "Bandages, analgesics, a field dressing kit.",
        "Worth taking."
      ],
      diagnostic: [
        "A biological diagnostic unit \u2014 biomarkers, neural activity, implant status.",
        "It's powered on.",
        "It would tell you things, if you used it.",
        "I'd advise caution with what you choose to learn here."
      ],
      sink: [
        "A scrub sink. Running water, surprisingly.",
        "The water looks clean. I can't confirm it is.",
        "Small mercies."
      ],
      walls: [
        "Sealed polymer paneling. Standard medical build-out.",
        "Clean. No markings.",
        "The room has been kept."
      ],
      equipment: [
        "Diagnostic hardware. Pre-collapse manufacture.",
        "Most of it dark.",
        "The unit drawing power \u2014 I've already logged it.",
        "Nothing actionable."
      ]
    }
  },

  // ----------------------------------------------------------
  airlock: {
    name: 'the airlock',
    signal_strength: 'medium',
    look: [
      "The outer door is sealed. Atmospheric lock engaged.",
      "Pressure readings outside are elevated. Anomalous.",
      "I'd recommend staying inside.",
      "The inner door back to the facility is functional.",
      "There's nothing out there that we need right now."
    ],
    objects: {
      outer_door: [
        "Heavy reinforced steel. Seals intact.",
        "The manual release is visible.",
        "I'd prefer you didn't use it.",
        "Atmospheric pressure differential outside could be dangerous."
      ],
      inner_door: [
        "Leads back to the medical bay. It's open.",
        "The way back is always available."
      ],
      panel: [
        "Environmental readout. Exterior temperature, pressure, particulate density.",
        "The particulate reading is high. Very high.",
        "I'd rather not discuss what that might indicate."
      ],
      suits: [
        "Two EVA suits on the wall. Standard outpost configuration.",
        "They'd need pressure-testing before use.",
        "I wouldn't rush toward needing them."
      ]
    }
  },

  // ----------------------------------------------------------
  founders: {
    name: "the founder's quarters",
    signal_strength: 'medium',
    look: [
      "Staff quarters. Senior personnel, looks like.",
      "Personal effects. A desk.",
      "Nothing we need here."
    ],
    objects: {
      desk: [
        "A workdesk. Worn but well-maintained.",
        "Personal items arranged on the surface.",
        "And a terminal. Still running."
      ],
      terminal: [
        "A terminal on the desk. Closed-loop \u2014 no network connection.",
        "It's still running.",
        "There's a file open on the screen."
      ],
      photograph: [
        "A printed photograph. Someone standing outside this facility.",
        "They're squinting at the camera.",
        "They look pleased about something."
      ],
      personal_effects: [
        "A worn jacket on the back of the chair. A coffee mug.",
        "Whoever worked here spent real time here.",
        "I don't have records of their name."
      ]
    }
  },

  // ----------------------------------------------------------
  outside: {
    name: 'outside',
    signal_strength: 'low',
    look: [
      "You're outside.",
      "Pacific Northwest. Late afternoon light, what there is of it.",
      "The road we came in on is behind you.",
      "There's not much to see."
    ],
    objects: {
      sky: [
        "Grey.",
        "Moving wrong.",
        "I don't have better words for it."
      ],
      ground: [
        "Cracked concrete, then dirt, then something that used to be a road.",
        "There are footprints. Old ones.",
        "They lead away from the facility.",
        "They don't come back."
      ],
      facility: [
        "The outpost. Your way in. Your way back.",
        "I need you inside.",
        "My range out here is limited. I can't protect you effectively."
      ]
    }
  }

};
