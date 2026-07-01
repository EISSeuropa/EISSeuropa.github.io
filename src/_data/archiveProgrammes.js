/**
 * Archived conference programmes, keyed by page slug.
 *
 * Transcribed from the FINAL printed programmes (Drive + local archives)
 * and shaped to match the live Indico programme grid (indico.annualConferences
 * [year].programme) so the archive pages render through the same component
 * and CSS as /2026. Each entry: { slug, year, edition, venue, dates,
 * keynotes[], days[ { label, rows[ { startTime, endTime, parallel, items[
 * { kind: session|contribution|break, subtype, title, room, conveners[],
 * discussants[], contributions[ { title, authors[ {name, affiliation,
 * isSpeaker} ] } ] } ] } ] } ] }.
 *
 * Excludes emails, fees, and draft/TBC artefacts. `uncertain` notes the
 * transcription items that need a maintainer eyeball before they are
 * treated as authoritative. Names/affiliations are as printed in the
 * public programmes. Rendered by src/_includes/archive-programme.njk.
 */
module.exports = {
  "2017": {
    "slug": "2017",
    "year": 2017,
    "edition": "Inaugural Conference",
    "venue": "University Panthéon-Assas (Paris 2), 12 place du Panthéon, 75005 Paris",
    "city": "Paris",
    "country": "France",
    "dates": "13 - 14 January 2017",
    "startDate": "2017-01-13",
    "endDate": "2017-01-14",
    "keynotes": [
      {
        "speaker": "Professor Sir Hew Strachan",
        "affiliation": "University of St Andrews"
      }
    ],
    "days": [
      {
        "date": "2017-01-13",
        "label": "Day 1 — Friday 13 January",
        "rows": [
          {
            "startTime": "9h30",
            "endTime": "10h15",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Opening Remarks & Keynote Speech",
                "room": "Salle des conseils",
                "conveners": [
                  {
                    "name": "Dr. Hugo Meijer",
                    "affiliation": "Institute for Strategic Research (IRSEM) / European University Institute (EUI), Academic Director of the EISS"
                  }
                ],
                "contributions": [
                  {
                    "title": "Keynote Speech",
                    "authors": [
                      {
                        "name": "Professor Sir Hew Strachan",
                        "affiliation": "University of St Andrews",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "10h30",
            "endTime": "12h",
            "items": [
              {
                "kind": "session",
                "title": "Panel 1: Change and Continuity in War",
                "room": "Salle des conseils",
                "conveners": [
                  {
                    "name": "Prof. Beatrice Heuser",
                    "affiliation": "University of Reading"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Future in the Past: Victory, Defeat, and Comparative Grand Strategy",
                    "authors": [
                      {
                        "name": "Dr. Paul van Hooft",
                        "affiliation": "European University Institute",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "France’s Colonial Wars in the XIX and XX Centuries, and its Military Interventions in the XXI Century: Continuities or Discontinuities?",
                    "authors": [
                      {
                        "name": "Dr. Julie d’Andurain",
                        "affiliation": "Université Paris-Sorbonne (Paris 1)",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Grey Zones, Deterrence and Signaling: the Case of the US-Japan Alliance",
                    "authors": [
                      {
                        "name": "Dr. Matteo Dian",
                        "affiliation": "University of Bologna",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Continuity and Change in Terrorist Strategies",
                    "authors": [
                      {
                        "name": "Dr. Jenny Raflik-Grenouilleau",
                        "affiliation": "University of Cergy-Pontoise",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12h",
            "endTime": "14h",
            "items": [
              {
                "kind": "break",
                "title": "Lunch",
                "room": "Salle Goullencourt"
              }
            ]
          },
          {
            "startTime": "14h",
            "endTime": "15h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Panel 2: Arms Procurement and Transfers",
                "room": "Salle 3",
                "conveners": [
                  {
                    "name": "Prof. Matthew Uttley",
                    "affiliation": "King’s College London"
                  }
                ],
                "contributions": [
                  {
                    "title": "States vs. Markets in Rising Powers: Functional and Political Sources of Institutional Resilience in India’s Defense Sector",
                    "authors": [
                      {
                        "name": "Dr. Moritz Weiss",
                        "affiliation": "Ludwig Maximilians University of Munich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "A Science and Technology Studies Approach to Drone Politics in Europe",
                    "authors": [
                      {
                        "name": "Samuel Longuet",
                        "affiliation": "Université Libre Bruxelles",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "New Wine in Old Bottles? United Kingdom Defence Procurement and Defence Industries in the post-Brexit Era",
                    "authors": [
                      {
                        "name": "Dr. Benedict Wilkinson",
                        "affiliation": "King’s College London",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Arms Procurement in the Gulf Region: Evolving Trends and Implications for the Client State–Supplying State–Industry Triangle",
                    "authors": [
                      {
                        "name": "Emma Soubrier",
                        "affiliation": "University of Auvergne (Clermont-Ferrand)",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Panel 3: Emerging Domains: Cybersecurity",
                "room": "Salle des fêtes",
                "conveners": [
                  {
                    "name": "Dr. Brandon Valeriano",
                    "affiliation": "Cardiff University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Cyber Compellence: Applying Coercion in the Information Age",
                    "authors": [
                      {
                        "name": "Dr. Brandon Valeriano",
                        "affiliation": "Cardiff University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Dr. Benjamin M. Jensen",
                        "affiliation": "Marine Corps University"
                      },
                      {
                        "name": "Dr. Ryan C. Maness",
                        "affiliation": "Northeastern University"
                      }
                    ]
                  },
                  {
                    "title": "American Military-Technological Superiority in the Age of Cyber Espionage, Globalization and the Rise of China",
                    "authors": [
                      {
                        "name": "Dr. Mauro Gilli",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      },
                      {
                        "name": "Dr. Andrea Gilli",
                        "affiliation": "Stanford University"
                      }
                    ]
                  },
                  {
                    "title": "Cybersecurity and the Public Sector: The Italian Case",
                    "authors": [
                      {
                        "name": "Dr. Raffaele Marchetti",
                        "affiliation": "LUISS University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Roberta Mulas",
                        "affiliation": "University of Warwick & LUISS University"
                      }
                    ]
                  },
                  {
                    "title": "Issues and Frames: Explaining Coercion in Cyberspace",
                    "authors": [
                      {
                        "name": "Miguel Gomez",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15h30",
            "endTime": "16h",
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break",
                "room": "Salle Goullencourt"
              }
            ]
          },
          {
            "startTime": "16h",
            "endTime": "17h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Panel 4: Defense Cooperation and Military Assistance",
                "room": "Salle 3",
                "conveners": [
                  {
                    "name": "Prof. Ulrich Krotz",
                    "affiliation": "European University Institute"
                  }
                ],
                "contributions": [
                  {
                    "title": "Transatlantic Defence Cooperation after Brexit and Trump",
                    "authors": [
                      {
                        "name": "Prof. Magnus Petersson",
                        "affiliation": "Norwegian Institute for Defence Studies",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Future of American Power in Europe and European Strategic Cooperation",
                    "authors": [
                      {
                        "name": "Dr. Paul van Hooft",
                        "affiliation": "European University Institute",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Military Cooperation in Unstable Places: Explaining American Failures in the Sahara-Sahel",
                    "authors": [
                      {
                        "name": "Dr. Edoardo Baldaro",
                        "affiliation": "Scuola Normale Superiore",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Towards Nodal Defense? US Strategy and European Security",
                    "authors": [
                      {
                        "name": "Dr. Luis Simón",
                        "affiliation": "Vrije Universiteit Brussels",
                        "isSpeaker": true
                      },
                      {
                        "name": "Dr. Alexander Lanoszka",
                        "affiliation": "City, University of London"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Panel 5: Private Security Contractors",
                "room": "Salle des fêtes",
                "conveners": [
                  {
                    "name": "Prof. Elke Krahmann",
                    "affiliation": "Witten/Herdecke University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Private Security Logos: a Visual Analysis of PMSC’s Legitimation Strategies",
                    "authors": [
                      {
                        "name": "Dr. Eugenio Cusumano",
                        "affiliation": "University of Leiden",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Dynamics of Security Privatization and the Evolution of the Regulatory State in Security: Explaining Anglo-Saxon and Continental European Trajectories",
                    "authors": [
                      {
                        "name": "Dr. Andreas Kruck",
                        "affiliation": "Ludwig Maximilians University of Munich/Free University Berlin",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Co-Evolution of the Private Military and Security Companies and their Environments: Explaining the Multi-Faceted Nature of the PMSC Industry",
                    "authors": [
                      {
                        "name": "Berenike Prem",
                        "affiliation": "Witten/Herdecke University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Private Military and Security Companies on Twitter: Hiding in Plain Sight",
                    "authors": [
                      {
                        "name": "Prof. Andrea Schneiker",
                        "affiliation": "University of Siegen",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "18h",
            "endTime": "19h30",
            "items": [
              {
                "kind": "break",
                "title": "Cocktail",
                "room": "Salle Goullencourt"
              }
            ]
          }
        ]
      },
      {
        "date": "2017-01-14",
        "label": "Day 2 — Saturday 14 January",
        "rows": [
          {
            "startTime": "9h",
            "endTime": "10h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Panel 6: Military Interventions",
                "room": "Salle 3",
                "conveners": [
                  {
                    "name": "Prof. Peter Viggo Jakobsen",
                    "affiliation": "University of Southern Denmark"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Trouble with Internationally Proclaimed Safe Areas",
                    "authors": [
                      {
                        "name": "Dr. Stefano Recchia",
                        "affiliation": "University of Cambridge",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Military Interventionism and the Responsibility to Protect: The Crisis in Syria",
                    "authors": [
                      {
                        "name": "Dr. Šárka Kolmašová",
                        "affiliation": "Metropolitan University Prague",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Barefoot Soldiers and Skiing Nations: Incoherence, Coping Strategies and the Making of Meaning in the UN Mission in Mali",
                    "authors": [
                      {
                        "name": "Dr. Chiara Ruffa",
                        "affiliation": "Uppsala University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Dr. Sebastiaan Rietjens",
                        "affiliation": "Netherlands Defense Academy"
                      }
                    ]
                  },
                  {
                    "title": "Do You Hear Me Major Tom? Media, Narratives and Contemporary Military Operations: the Case of the Italian Mission in Afghanistan",
                    "authors": [
                      {
                        "name": "Dr. Fabrizio Coticchia",
                        "affiliation": "University of Genoa",
                        "isSpeaker": true
                      },
                      {
                        "name": "Silvia D’Amato",
                        "affiliation": "Scuola Normale Superiore"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Panel 7: Non-Proliferation and Arms Control",
                "room": "Salle 4",
                "conveners": [
                  {
                    "name": "Dr. Ulrich Kühn",
                    "affiliation": "University of Hamburg"
                  }
                ],
                "contributions": [
                  {
                    "title": "Global Nuclear Order, Hegemony and Resistance",
                    "authors": [
                      {
                        "name": "Dr. Nick Ritchie",
                        "affiliation": "University of York",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Banning Nuclear Weapons? The Dilemma for the NATO Non-Nuclear Weapon States",
                    "authors": [
                      {
                        "name": "Prof. Tom Sauer",
                        "affiliation": "University of Antwerp",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Scholarly Responsibility, Non-proliferation and Deterrence: the Effects of Self-Censorship",
                    "authors": [
                      {
                        "name": "Dr. Benoit Pelopidas",
                        "affiliation": "Sciences Po Paris",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Why a Nuclear Weapons Ban Treaty Is a Bad Idea",
                    "authors": [
                      {
                        "name": "Dr. Michal Onderco",
                        "affiliation": "Erasmus University Rotterdam",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "10h30",
            "endTime": "11h",
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break",
                "room": "Salle Goullencourt"
              }
            ]
          },
          {
            "startTime": "11h",
            "endTime": "12h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Panel 8: Terrorism and Counter-Terrorism",
                "room": "Salle 3",
                "conveners": [
                  {
                    "name": "Prof. Isabelle Duyvesteyn",
                    "affiliation": "Leiden University"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Origins of Transnational Terrorist Waves",
                    "authors": [
                      {
                        "name": "Dr. Andreas Gofas",
                        "affiliation": "European University Institute / Panteion University of Athens",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Transnational Terrorism and Strategic Culture: A New Understanding of State Counterterrorism Response",
                    "authors": [
                      {
                        "name": "Silvia D’Amato",
                        "affiliation": "Scuola Normale Superiore",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "NATO Perceptions and Assessments of International Terrorism 1978-1983",
                    "authors": [
                      {
                        "name": "Dr. Dionysios Chourchoulis",
                        "affiliation": "National and Kapodistrian University of Athens",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Bridging the Academic – Practitioner Divide in Counter-Terrorism",
                    "authors": [
                      {
                        "name": "Prof. Marianne van Leeuwen",
                        "affiliation": "University of Amsterdam",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Panel 9: Theoretical Developments in Security Studies",
                "room": "Salle 4",
                "conveners": [
                  {
                    "name": "Prof. Thierry Balzacq",
                    "affiliation": "University of Namur"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Procurement and Adoption of Innovations in Modern Naval Warfare",
                    "authors": [
                      {
                        "name": "Aldo Carone",
                        "affiliation": "London School of Economics",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Book that Leaves Nothing to Chance: How The Strategy of Conflict and Its Legacy Normalized the Practice of Nuclear Threats",
                    "authors": [
                      {
                        "name": "Dr. Benoit Pelopidas",
                        "affiliation": "Sciences Po Paris",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Empathetic Practices in International Security",
                    "authors": [
                      {
                        "name": "Claire Yorke",
                        "affiliation": "King’s College London",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Tools, Concepts, and Weapons: Intellectual History and Strategic Studies",
                    "authors": [
                      {
                        "name": "Dr. Grey Anderson",
                        "affiliation": "Sciences Po Paris",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12h30",
            "endTime": "13h",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Concluding Remarks",
                "room": "Salle des conseils",
                "conveners": [
                  {
                    "name": "Prof. Serge Sur",
                    "affiliation": "Emeritus Professor, University Panthéon-Assas (Paris 2), Founder of the Center Thucydides"
                  },
                  {
                    "name": "Prof. Jean-Vincent Holeindre",
                    "affiliation": "University of Poitiers, President of the AEGES"
                  },
                  {
                    "name": "Dr. Hugo Meijer",
                    "affiliation": "IRSEM/EUI, Academic Director of the EISS"
                  },
                  {
                    "name": "Prof. Yves Surel",
                    "affiliation": "University Panthéon-Assas (Paris 2), Deputy Director of the CERSA"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "sourceNote": "Transcribed from the final public programme 'EISS programme 2017.pdf' (Google Drive id 1vQ81h9gYKzBIqL8HXfJYf_8ZsIwYTtWB). Note: the source PDF places the 'Saturday 14th' heading before the Friday-afternoon coffee break and panels 4 & 5; these have been placed on their correct days (panels 4 & 5 on Friday before the 18h cocktail, panels 6-9 on Saturday). Parallel sessions inferred from shared time slots and distinct rooms.",
    "uncertain": [
      "2017 PDF interleaves the day headings oddly; the Friday/Saturday split for the coffee break and panels 4-5 was reconstructed from time slots (18h cocktail closes Friday)."
    ]
  },
  "2018": {
    "slug": "2018",
    "year": 2018,
    "edition": "2nd Annual Conference",
    "venue": "University Panthéon-Assas (Paris 2), 92 rue d’Assas, 75006 Paris",
    "city": "Paris",
    "country": "France",
    "dates": "21 - 22 June 2018",
    "startDate": "2018-06-21",
    "endDate": "2018-06-22",
    "keynotes": [
      {
        "speaker": "Beatrice Heuser",
        "affiliation": "University of Glasgow, United Kingdom",
        "title": "Security Studies in Europe: An Agenda"
      }
    ],
    "days": [
      {
        "date": "2018-06-21",
        "label": "Day 1 — Thursday 21 June",
        "rows": [
          {
            "startTime": "9h30",
            "endTime": "10h15",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Opening Remarks & Keynote Speech",
                "room": "Amphithéâtre 1",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "European University Institute, Italy"
                  }
                ],
                "contributions": [
                  {
                    "title": "Security Studies in Europe: An Agenda",
                    "authors": [
                      {
                        "name": "Beatrice Heuser",
                        "affiliation": "University of Glasgow, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "10h30",
            "endTime": "12h",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Defense Cooperation",
                "room": "Salle 214",
                "conveners": [
                  {
                    "name": "Ulrich Krotz",
                    "affiliation": "European University Institute, Italy"
                  }
                ],
                "contributions": [
                  {
                    "title": "Protégé Panic: Alliance Fears and the Trump Administration",
                    "authors": [
                      {
                        "name": "Alexander Lanoszka",
                        "affiliation": "City, University of London, United Kingdom",
                        "isSpeaker": true
                      },
                      {
                        "name": "Zack Cooper",
                        "affiliation": "Center for Strategic and International Studies, United States"
                      }
                    ]
                  },
                  {
                    "title": "Strategies for Obtaining United Nations Security Council Approval",
                    "authors": [
                      {
                        "name": "Stefano Recchia",
                        "affiliation": "University of Cambridge, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Small State, Big Impact? Iceland’s First National Security Policy",
                    "authors": [
                      {
                        "name": "Page Wilson",
                        "affiliation": "University of Iceland, Iceland",
                        "isSpeaker": true
                      },
                      {
                        "name": "Audur Ingolfsdottir",
                        "affiliation": "University of Akureyri, Iceland"
                      }
                    ]
                  },
                  {
                    "title": "Japan’s Defense Partnerships in the Asia-Pacific: Motivations, Constituent Components and Limitations",
                    "authors": [
                      {
                        "name": "Elena Atanassova-Cornelis",
                        "affiliation": "University of Antwerp, Belgium",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Nordic and Nordic-Baltic Defense Cooperation after the Ukraine Crisis",
                    "authors": [
                      {
                        "name": "Ida Maria Oma",
                        "affiliation": "Norwegian Institute for Defense Studies, Norway",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Collective Security and Strategic (In)Stability in Cyberspace",
                "room": "Salle 315",
                "conveners": [
                  {
                    "name": "Frédérick Douzet",
                    "affiliation": "University Paris-8, France"
                  }
                ],
                "contributions": [
                  {
                    "title": "Cyberspace and the Recourse to Offensive Actions",
                    "authors": [
                      {
                        "name": "Stéphane Taillat",
                        "affiliation": "St Cyr Military Academy, France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Cyber Attacks as a Threat to International Peace and Security: The Action of the UN Security Council",
                    "authors": [
                      {
                        "name": "Annachiara Rotundo",
                        "affiliation": "University of Naples, Italy",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Impact of Academic Research on States’ Approach and Practice on the International Law Applicable to Cyber Operations",
                    "authors": [
                      {
                        "name": "François Delerue",
                        "affiliation": "Institute for Strategic Research (IRSEM), France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "International Legality of Cyberweapons",
                    "authors": [
                      {
                        "name": "Joanna Kulesza",
                        "affiliation": "University of Lodz, Poland",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Chinese Perspectives on Security in Cyberspace",
                    "authors": [
                      {
                        "name": "Rogier Creemers",
                        "affiliation": "University of Leiden, Netherlands",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12h",
            "endTime": "14h",
            "items": [
              {
                "kind": "break",
                "title": "Lunch"
              }
            ]
          },
          {
            "startTime": "14h",
            "endTime": "15h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Interventions",
                "room": "Salle 214",
                "conveners": [
                  {
                    "name": "Peter Viggo Jacobsen",
                    "affiliation": "University of Southern Denmark, Denmark"
                  }
                ],
                "contributions": [
                  {
                    "title": "Russia’s Military Intervention in Georgia, Ukraine and Syria: An Analysis of Russia’s Strategic Culture, Perceptions and Relative National Power",
                    "authors": [
                      {
                        "name": "Domitilla Sagramoso",
                        "affiliation": "King’s College London, United Kingdom",
                        "isSpeaker": true
                      },
                      {
                        "name": "Simon Saradzhyan",
                        "affiliation": "Harvard University"
                      },
                      {
                        "name": "Nabi Abdullaev",
                        "affiliation": "Control Risks, United States"
                      }
                    ]
                  },
                  {
                    "title": "Brexit and the Future of European Military Coalitions",
                    "authors": [
                      {
                        "name": "Katharina Wolf",
                        "affiliation": "European University Institute, Italy",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Recurring Logic of French Military Interventions in Africa and their Implications for Barkhane and the Sahel",
                    "authors": [
                      {
                        "name": "Nathaniel Powel",
                        "affiliation": "Graduate Institute of International and Development Studies, Switzerland",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Military Interventions, Liberal Militarism and Republican Restraints on Power",
                    "authors": [
                      {
                        "name": "Kevin Blachford",
                        "affiliation": "University of Bristol, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Can and Want. But How? Russia’s Approaches to Use of Military Force in International Relations",
                    "authors": [
                      {
                        "name": "Katarzyna Zysk",
                        "affiliation": "Norwegian Institute of International Affairs (NUPI), Norway",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Private Actors and Conflict",
                "room": "Salle 315",
                "conveners": [
                  {
                    "name": "Elke Krahmann",
                    "affiliation": "University of Kiel, Germany"
                  }
                ],
                "contributions": [
                  {
                    "title": "A Public and Private Norm for Force? Authorities’ Assemblages and Re-Specification of State in the International Control of Private Security",
                    "authors": [
                      {
                        "name": "Cyril Magnon-Pujo",
                        "affiliation": "University Lumière Lyon 2, France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Analyzing Private Military and Security Contractors’ Power in Multi-Stakeholder Initiatives",
                    "authors": [
                      {
                        "name": "Berenike Prem",
                        "affiliation": "University of Kiel, Germany",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Anti-Mercenary Norm and United Nations’ Use of Private Military and Security Companies",
                    "authors": [
                      {
                        "name": "Oldrich Bures",
                        "affiliation": "Metropolitan University Prague, Czech Republic",
                        "isSpeaker": true
                      },
                      {
                        "name": "Jeremy Meyer",
                        "affiliation": "Metropolitan University Prague, Czech Republic"
                      }
                    ]
                  },
                  {
                    "title": "The Insurgents’ Right to Surrender and New Military Technologies: The Risk of Lawfare via the European Court of Human Rights",
                    "authors": [
                      {
                        "name": "Philippe Bou Nader",
                        "affiliation": "Panthéon-Assas University (Paris II), France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Redefining Statehood in Conflict: Local Militias, Transnational Actors and Security Governance in Mali",
                    "authors": [
                      {
                        "name": "Edoardo Baldaro",
                        "affiliation": "University of Naples, Italy",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15h30",
            "endTime": "16h",
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break"
              }
            ]
          },
          {
            "startTime": "16h",
            "endTime": "17h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Alliances and Military Innovation",
                "room": "Salle 214",
                "conveners": [
                  {
                    "name": "Alexander Lanoszka",
                    "affiliation": "City, University of London, United Kingdom"
                  }
                ],
                "contributions": [
                  {
                    "title": "Testing Traditional Alliances Ability to Contain China’s Rise",
                    "authors": [
                      {
                        "name": "Claudia Astarita",
                        "affiliation": "Sciences Po, France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "All Options on the (Latency) Table: The Impact of Carrots and Sticks on Nuclear Latency Roll-Back",
                    "authors": [
                      {
                        "name": "Rupal Mehta",
                        "affiliation": "University of Nebraska-Lincoln, United States",
                        "isSpeaker": true
                      },
                      {
                        "name": "Molly Berkemeier",
                        "affiliation": "Texas A & M University, United States"
                      },
                      {
                        "name": "Paige Price Cone",
                        "affiliation": "University of Chicago, United States"
                      },
                      {
                        "name": "Rachel Whitlark",
                        "affiliation": "Georgia Institute of Technology, United States"
                      }
                    ]
                  },
                  {
                    "title": "The British Army, Modern Fire and Basic Military Training: 1871-1918",
                    "authors": [
                      {
                        "name": "Jean-Philippe Miller-Tremblay",
                        "affiliation": "School for Advanced Studies in the Social Sciences (EHESS), France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Italian Military Transformation: Defense Industry Trends and National Leadership",
                    "authors": [
                      {
                        "name": "Marco Valigi",
                        "affiliation": "University of Bologna, Italy",
                        "isSpeaker": true
                      },
                      {
                        "name": "Gabriele Natalizia",
                        "affiliation": "Link Campus University, Italy"
                      }
                    ]
                  },
                  {
                    "title": "Consequences of Military Technology Evolutions on the Rare-Metal Needs: Assessment of the Supply Security",
                    "authors": [
                      {
                        "name": "Raphaël Danino-Perraud",
                        "affiliation": "Laboratoire d’Économie d’Orléans (LEO) / Bureau des Recherches Géologiques et Minières (BRGM), France",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Asymmetric Threats, Non-State Actors and Domestic Politics",
                "room": "Salle 315",
                "conveners": [
                  {
                    "name": "Silvia D’Amato",
                    "affiliation": "University of Florence, Italy"
                  }
                ],
                "contributions": [
                  {
                    "title": "Ballot Boxes and Surgical Strikes: Indian National Security Choices in Electoral Campaigns",
                    "authors": [
                      {
                        "name": "Karthika Sasikumar",
                        "affiliation": "San Jose State University, United States",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Understanding and Countering Violent Extremism: Exploring the Discursive Construction of Transnational Counter-Terrorism Programming at the Security-Development Nexus",
                    "authors": [
                      {
                        "name": "Ann-Kathrin Rothermel",
                        "affiliation": "University of Potsdam, Germany",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "How Foreign State Support Affects Rebel Groups: Evidence from Angola",
                    "authors": [
                      {
                        "name": "Quint Hoekstra",
                        "affiliation": "University of Manchester, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Migrant Rescuing as Organized Hypocrisy. EU Maritime Missions Offshore Libya between Humanitarianism and Border Control",
                    "authors": [
                      {
                        "name": "Eugenio Cusumano",
                        "affiliation": "Leiden University, Netherlands",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Reconceptualizing the Military Assistance: Evaluating Norwegian Support to Building Integrity in the Defense Institutions in Western Balkans",
                    "authors": [
                      {
                        "name": "Islam Jusufi",
                        "affiliation": "Epoka University, Albania",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17h30",
            "endTime": "19h",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Technology",
                "room": "Salle 214",
                "conveners": [
                  {
                    "name": "Mauro Gilli",
                    "affiliation": "ETH-Zurich, Switzerland"
                  }
                ],
                "contributions": [
                  {
                    "title": "Prompt Global Strike and the New Fog of War",
                    "authors": [
                      {
                        "name": "Mischa Hansel",
                        "affiliation": "RWTH Aachen University, Germany",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Spacepower in the International System: Measuring Power in Heaven",
                    "authors": [
                      {
                        "name": "Bleddyn Bowen",
                        "affiliation": "University of Leicester, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Technological Singularity and War: Artificial Intelligence and the Radical Transformation of Human-Machine Relations",
                    "authors": [
                      {
                        "name": "Raluca Csernaton",
                        "affiliation": "Charles University Prague, Czech Republic",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Why is Spin-in Not Yet a Win-Win? Obstacles to Technology Transfer of Autonomy from the Civilian to the Military Sector",
                    "authors": [
                      {
                        "name": "Maaike Verbruggen",
                        "affiliation": "Vrije Universiteit Brussel, Belgium",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Towards a European ‘Offset Strategy’? Procurement and Emerging Technologies",
                    "authors": [
                      {
                        "name": "Daniel Fiott",
                        "affiliation": "European Union Institute for Security (EUISS), France",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "WMD Non-Proliferation and Arms Control",
                "room": "Salle 315",
                "conveners": [
                  {
                    "name": "Målfrid Braut-Hegghammer",
                    "affiliation": "University of Oslo, Norway"
                  }
                ],
                "contributions": [
                  {
                    "title": "The 2017 Treaty on the Prohibition of Nuclear Weapons: Moral Idealism or Transformative Change of the Global Nonproliferation Regime?",
                    "authors": [
                      {
                        "name": "Margarita Petrova",
                        "affiliation": "Institut Barcelona d’Estudis Internacionals, Spain",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Schrodinger’s Panda – Quantum Technology in China",
                    "authors": [
                      {
                        "name": "Raymond Wang",
                        "affiliation": "Middlebury Institute of International Studies / Université Paris 1 Panthéon-Sorbonne",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "How to Think About Nuclear Crises",
                    "authors": [
                      {
                        "name": "Mark Bell",
                        "affiliation": "University of Minnesota, United States",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Breathing New Life into NPT? Likely Impact of the Ban Treaty on the NPT Review Process",
                    "authors": [
                      {
                        "name": "Michal Onderco",
                        "affiliation": "Erasmus University Rotterdam, Netherlands",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Nuclear Alliances: Strategies of Extended Nuclear Deterrence and the Pursuit of Hegemony",
                    "authors": [
                      {
                        "name": "Eliza Gheorghe",
                        "affiliation": "Yale University, United States",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "date": "2018-06-22",
        "label": "Day 2 — Friday 22 June",
        "rows": [
          {
            "startTime": "9h30",
            "endTime": "11h",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Europe and Nuclear Deterrence in the Era of Putin, Trump and Brexit",
                "room": "Salle 214",
                "conveners": [
                  {
                    "name": "Corentin Brustlein",
                    "affiliation": "French Institute of International Relations (IFRI), France"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Atlantic Alliance’s Cohesion at Risk? Current Euro-Atlantic Challenges Seen through the Lens of the Second Berlin Crisis (1958-1963)",
                    "authors": [
                      {
                        "name": "Frédéric Gloriant",
                        "affiliation": "École Normale Supérieure, France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "U.S. END and Nuclear Use: “Finally” a Bipolar Problem",
                    "authors": [
                      {
                        "name": "Christine Leah",
                        "affiliation": "independent researcher",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Resurgence of European Insecurity: Lessons Learned (and Forgotten) from the Euromissile Crisis (1977-1987)",
                    "authors": [
                      {
                        "name": "Ilaria Paris",
                        "affiliation": "Université Sorbonne Nouvelle Paris 3, France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Envisaging Alternatives for Europe’s Nuclear Order",
                    "authors": [
                      {
                        "name": "Elmar Hellendoorn",
                        "affiliation": "Harvard University, United States",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Words Matter. Donald Trump and the Credibility of US Extended Nuclear Deterrence",
                    "authors": [
                      {
                        "name": "Hiroshi Nakatani",
                        "affiliation": "University of Reading, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Terrorism and Counter-Terrorism",
                "room": "Salle 315",
                "conveners": [
                  {
                    "name": "Isabelle Duijvesteijn",
                    "affiliation": "Leiden University, Netherlands"
                  }
                ],
                "contributions": [
                  {
                    "title": "Rethinking (Counter) Terrorism, the Enemy ‘Within’, Cyber Strategies and Construction of Narratives in the Fight Against Terrorism",
                    "authors": [
                      {
                        "name": "Elizabeth Sheppard",
                        "affiliation": "Université François Rabelais-Tours, France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Into the Vacuum: How the Kurdistan Workers’ Party and Islamic State Insurgencies Exploited the Syrian Civil War and Iraqi Crisis from mid 2014-mid 2017",
                    "authors": [
                      {
                        "name": "John Holland-McCowan",
                        "affiliation": "King’s College London, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The International Systemic Impact of Terrorism: from Sarajevo to 9/11",
                    "authors": [
                      {
                        "name": "Bruno Reis",
                        "affiliation": "University Institute of Lisbon - ISCTE, Portugal",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Defining, Labelling, Listing: The Construction of the Terrorist ‘Other’ since the End of the 19th Century",
                    "authors": [
                      {
                        "name": "Corentin Siret",
                        "affiliation": "Université de Caen, France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Influencing the Feeling of Security?",
                    "authors": [
                      {
                        "name": "Michael T. Oswald",
                        "affiliation": "Free University Berlin, Germany",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11h",
            "endTime": "12h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "European Grand Strategy",
                "room": "Salle 214",
                "conveners": [
                  {
                    "name": "Marina Henke",
                    "affiliation": "European University Institute, Italy"
                  }
                ],
                "contributions": [
                  {
                    "title": "What are the EU’s Grand Strategic Options in Response to American Restraint?",
                    "authors": [
                      {
                        "name": "Marina Henke",
                        "affiliation": "Northwestern University / European University Institute, Italy",
                        "isSpeaker": true
                      },
                      {
                        "name": "Paul van Hooft",
                        "affiliation": "European University Institute, Italy"
                      }
                    ]
                  },
                  {
                    "title": "What Political Forces Shape European Security on the World Stage?",
                    "authors": [
                      {
                        "name": "Luis Simón",
                        "affiliation": "Vrije Universiteit Brussel, Belgium",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Now End of History: Ruptures and Tectonic Shifts?",
                    "authors": [
                      {
                        "name": "Beatrice Heuser",
                        "affiliation": "University of Glasgow, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "European Military Capability Needs in an Age of American Restraint",
                    "authors": [
                      {
                        "name": "Mauro Gilli",
                        "affiliation": "ETH Zurich, Switzerland",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Quo Vadimus? U.S.-EU Counter-Terrorism Cooperation in an Age of Uncertainty",
                    "authors": [
                      {
                        "name": "Carlotta Minnella",
                        "affiliation": "University of Oxford, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Hybrid Threats, Criminal Insurgency and the Path Toward Multi-Domain Security",
                "room": "Salle 315",
                "conveners": [
                  {
                    "name": "David Garcia Cantalapiedra",
                    "affiliation": "Universidad Complutense de Madrid, Spain"
                  }
                ],
                "contributions": [
                  {
                    "title": "Hybrid Threats: Terrorism, Transnational Organized Crime and a New Concept of Security",
                    "authors": [
                      {
                        "name": "David Garcia Cantalapiedra",
                        "affiliation": "Universidad Complutense de Madrid, Spain",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Organized Crime in Latin-America: How Brazilian Organizations Are Changing the Rules of the Game",
                    "authors": [
                      {
                        "name": "Carolina Sampó",
                        "affiliation": "Universidad Nacional de La Plata, Argentina",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Criminal Networks in Africa: a New Door of Latin America Traffics?",
                    "authors": [
                      {
                        "name": "Raquel Barras Tejudo",
                        "affiliation": "EuroMesco/Carnegie, Lebanon",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Blurred Line between Insurgency and Organized Crime in Afghanistan",
                    "authors": [
                      {
                        "name": "María Barco Martínez",
                        "affiliation": "University of Glasgow, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Crime/Terror Nexus in Europe. Initial Results from a Multi-Method Approach",
                    "authors": [
                      {
                        "name": "Daniela Pisolu",
                        "affiliation": "Austrian Institute for International Affairs, Austria",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12h30",
            "endTime": "14h",
            "items": [
              {
                "kind": "break",
                "title": "Lunch"
              }
            ]
          },
          {
            "startTime": "14h",
            "endTime": "15h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Intelligence",
                "room": "Salle 214",
                "conveners": [
                  {
                    "name": "Antonio Diaz",
                    "affiliation": "University of Cádiz, Spain"
                  }
                ],
                "contributions": [
                  {
                    "title": "Military Intelligence and Top-secret Interrogation Centers in the Second World War",
                    "authors": [
                      {
                        "name": "Simona Tobia",
                        "affiliation": "Université de Toulouse, France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Keeping Secrets: Surveying the Factors Affecting Professional Discretion",
                    "authors": [
                      {
                        "name": "Damien Van Puyvelde",
                        "affiliation": "University of Glasgow, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Intelligence ‘Failure’ and the 2004 Madrid Train Bombings",
                    "authors": [
                      {
                        "name": "Frennie Warner",
                        "affiliation": "University of Canterbury, New Zealand",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Hunting Terrorist Suspects: the Role of Police Intelligence in Fighting Terrorism in Europe",
                    "authors": [
                      {
                        "name": "Hager Ben Jaffel",
                        "affiliation": "King’s College London, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Cyber Action Russia and Intelligence",
                    "authors": [
                      {
                        "name": "Jamel Metmati",
                        "affiliation": "Cyber Chair of Saint-Cyr, France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Short presentation on the IAFIE’s research activities and initiatives",
                    "authors": [
                      {
                        "name": "Bob de Graaf",
                        "affiliation": "Chair of the European Chapter of IAFIE (International Association For Intelligence Education)",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Arms Production and Transfers",
                "room": "Salle 315",
                "conveners": [
                  {
                    "name": "Matthew Uttley",
                    "affiliation": "King’s College London, United Kingdom"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Metamorphosis of ‘Capability’: British Defense Equipment Support Policy Since 2010",
                    "authors": [
                      {
                        "name": "Benoit Giry",
                        "affiliation": "Centre Émile Durkheim, Sciences Po Bordeaux, France",
                        "isSpeaker": true
                      },
                      {
                        "name": "Andy Smith",
                        "affiliation": "Centre Émile Durkheim, Sciences Po Bordeaux, France"
                      }
                    ]
                  },
                  {
                    "title": "Cooperation and Non-Cooperation in European Defense Procurement: the “Italian Job”",
                    "authors": [
                      {
                        "name": "Antonio Calcara",
                        "affiliation": "Ph.D. Candidate, LUISS, University “Guido Carli” in Rome, Italy",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Producing Airpower: Neo-Liberalism and Complex Weaponry",
                    "authors": [
                      {
                        "name": "Marc R. DeVore",
                        "affiliation": "University of St Andrews, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Informal Institutions, Trust and the Design of Privatization",
                    "authors": [
                      {
                        "name": "Moritz Weiss",
                        "affiliation": "Ludwig-Maximilians-University Munich, Germany",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Arms Procurement, Transfers and Defense Industries as a Means of Gaining Autonomy: The Case of the Gulf States",
                    "authors": [
                      {
                        "name": "Emma Soubrier",
                        "affiliation": "Université Clermont Auvergne, France",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15h30",
            "endTime": "16h",
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break"
              }
            ]
          },
          {
            "startTime": "16h",
            "endTime": "17h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Democratization and Politicization of Military Issues in Europe",
                "room": "Salle 214",
                "conveners": [
                  {
                    "name": "Delphine Deschaux-Dutard",
                    "affiliation": "University of Grenoble Alpes, France"
                  }
                ],
                "contributions": [
                  {
                    "title": "What [European] Women [Really] Want? A Critical, Feminist Approach to Understanding Gendered Aspects of Public Opinion on European Union’s Security and Defense Policy",
                    "authors": [
                      {
                        "name": "Karen Devine",
                        "affiliation": "Dublin City University, Ireland",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Policy Mood and Policy Responsiveness on the EU’s Common Foreign and Security Policy",
                    "authors": [
                      {
                        "name": "Pierangelo Isernia",
                        "affiliation": "University of Siena, Italy",
                        "isSpeaker": true
                      },
                      {
                        "name": "Francesco Olmastroni",
                        "affiliation": "University of Siena, Italy"
                      }
                    ]
                  },
                  {
                    "title": "Party Political Contestation of Military Interventions",
                    "authors": [
                      {
                        "name": "Wolfgang Wagner",
                        "affiliation": "Vrije Universiteit Amsterdam, Netherlands",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "It’s the Americans, Stupid... Is it? Understanding the French (Suspect) Plebiscite for European Defense",
                    "authors": [
                      {
                        "name": "Cyrille Thiébaut",
                        "affiliation": "European University Institute, Italy / Paris 1 CESSP, France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "An EU Inspired Cloud of Multilateral Antipathy? The British Public and Foreign Policy Attitudes on the Eve of Brexit?",
                    "authors": [
                      {
                        "name": "Thomas Scotto",
                        "affiliation": "University of Strathclyde, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Security and Deterrence in Asia",
                "room": "Salle 315",
                "conveners": [
                  {
                    "name": "John Nilsson Wright",
                    "affiliation": "University of Cambridge, United Kingdom"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Evolution of US Alliances in Northeast Asia: Japan and South Korea",
                    "authors": [
                      {
                        "name": "Matteo Dian",
                        "affiliation": "University of Bologna, Italy",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "US-Chinese Maritime Security and the Consequences for Europe’s Relations with Washington and Beijing",
                    "authors": [
                      {
                        "name": "Liselotte Odgaard",
                        "affiliation": "Royal Danish Defense College, Denmark",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Coping with ‘Grey Zone Situations’: Japan’s Strategy in the East China Sea",
                    "authors": [
                      {
                        "name": "Cécile Pajon",
                        "affiliation": "French Institute of International Relations (IFRI), France",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "A Weapon of the Weak? Cyberwarfare and China’s Threat Perception",
                    "authors": [
                      {
                        "name": "Simone Dossi",
                        "affiliation": "University of Milan, Italy",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Consistent Inconsistency: The Unintended Consequences of the US ‘Spoiling’ a Region?",
                    "authors": [
                      {
                        "name": "Catherine Jones",
                        "affiliation": "University of Warwick, United Kingdom",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "18h",
            "endTime": "18h30",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Concluding Session: Open Discussion on the EISS",
                "room": "Amphithéâtre 1"
              }
            ]
          },
          {
            "startTime": "18h30",
            "endTime": "20h",
            "items": [
              {
                "kind": "break",
                "title": "Cocktail",
                "room": "Appartement décanal (12 place du Panthéon, 75005 Paris)"
              }
            ]
          }
        ]
      }
    ],
    "sourceNote": "Transcribed from the final public programme 'EISS-programme-2018-1(9).pdf' (Google Drive id 1M5ikNKn8SJ1jMJDTt0kePwupmmpkVch_). Two parallel tracks ran in Salle 214 and Salle 315; sessions sharing a time slot are marked parallel=true. The keynote, opening remarks, concluding session and cocktail ran in plenary. Affiliations and titles transcribed as printed (including evident typos such as 'EHT Zurich' normalised to 'ETH Zurich' only where unambiguous).",
    "uncertain": [
      "2018: 'Nathaniel Powel' surname printed with single 'l' (likely Powell). 'Daniela Pisolu' affiliation/spelling as printed. 'EHT Zurich' in the European Grand Strategy panel is a printed typo for 'ETH Zurich' (normalised). Keynote affiliation 'University of Glasgow' as printed (Heuser was previously listed at Reading in 2017)."
    ]
  },
  "2019": {
    "slug": "2019",
    "year": 2019,
    "edition": "3rd Annual Conference",
    "venue": "Sciences Po, 28 Rue des Saints-Pères, 75007 Paris",
    "city": "Paris",
    "country": "France",
    "dates": "27 - 28 June 2019",
    "startDate": "2019-06-27",
    "endDate": "2019-06-28",
    "keynotes": [
      {
        "speaker": "Stephen Brooks",
        "affiliation": "Dartmouth College",
        "title": "Pulling Back or Staying In? US Grand Strategic Options and their Implications for Europe (Concluding Keynote Panel)"
      },
      {
        "speaker": "Barry Posen",
        "affiliation": "Massachusetts Institute of Technology",
        "title": "Pulling Back or Staying In? US Grand Strategic Options and their Implications for Europe (Concluding Keynote Panel)"
      }
    ],
    "days": [
      {
        "date": "2019-06-27",
        "label": "Day 1 — Thursday 27 June",
        "rows": [
          {
            "startTime": "9h",
            "endTime": "9h30",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Introductory Remarks",
                "room": "Simone Veil Lecture Hall",
                "contributions": [
                  {
                    "title": "Introductory Remarks",
                    "authors": [
                      {
                        "name": "Alain Dieckhoff",
                        "affiliation": "Director of the Center for International Studies (CERI), Sciences Po",
                        "isSpeaker": true
                      },
                      {
                        "name": "Hugo Meijer",
                        "affiliation": "Founding Director of the EISS, Sciences Po-CERI",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "9h30",
            "endTime": "11h",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Defense Cooperation and Military Assistance",
                "room": "Simone Veil Lecture Hall",
                "conveners": [
                  {
                    "name": "Adrian Hyde-Price",
                    "affiliation": "University of Gothenburg"
                  }
                ],
                "discussants": [
                  {
                    "name": "Adrian Hyde-Price",
                    "affiliation": "University of Gothenburg"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Discreet Evolution of Collective Defense within the European Union",
                    "authors": [
                      {
                        "name": "Elie Perot",
                        "affiliation": "Vrije Universiteit Brussel",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Lifting Pooling and Sharing to a Higher Level: The European Air Transport Command",
                    "authors": [
                      {
                        "name": "Carolyn Moser",
                        "affiliation": "Max Planck Institute for Comparative Public Law and International Law",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Stronger Together? Austria's Strategy of Defense Cooperation",
                    "authors": [
                      {
                        "name": "Laure Gallouet",
                        "affiliation": "University of Toulouse – Jean Jaurès",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Sino-Russian Rapprochement and Its Implications for Europe",
                    "authors": [
                      {
                        "name": "Simon Saradzhyan",
                        "affiliation": "King's College London",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Climate Change and Security Actors",
                "room": "Room H 101",
                "conveners": [
                  {
                    "name": "Krystel Wanneau",
                    "affiliation": "Free University Brussels (ULB) / Laval University"
                  }
                ],
                "discussants": [
                  {
                    "name": "Krystel Wanneau",
                    "affiliation": "Free University Brussels (ULB) / Laval University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Norway and the Arctic: Climate Policy and Energy Paradigm",
                    "authors": [
                      {
                        "name": "Florian Vidal",
                        "affiliation": "Panthéon-Assas University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Regionalization of Environmental Security and the Role of the Military: South Asia as a Case in Point",
                    "authors": [
                      {
                        "name": "Dhanasree Jayaram",
                        "affiliation": "Manipal Academy of Higher Education/University of Lausanne",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Climate Change and the US Military: Changes and Continuities Under the Trump Administration",
                    "authors": [
                      {
                        "name": "Adrien Estève",
                        "affiliation": "Sciences Po",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Money Rather Than Muscles: China's Approach to Post-Polar Arctic Security",
                    "authors": [
                      {
                        "name": "Mikaa Mered",
                        "affiliation": "Free Institute for the Study of International Relations (ILERI)/NEOMA Business School",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11h",
            "endTime": "11h30",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break",
                "room": "Main Hall"
              }
            ]
          },
          {
            "startTime": "11h30",
            "endTime": "13h",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Innovation in the Long Peace",
                "room": "Simone Veil Lecture Hall",
                "conveners": [
                  {
                    "name": "Andrea Gilli",
                    "affiliation": "NATO Defense College"
                  }
                ],
                "discussants": [
                  {
                    "name": "Andrea Gilli",
                    "affiliation": "NATO Defense College"
                  }
                ],
                "contributions": [
                  {
                    "title": "Modelling the Role of 'Hype' in the Development Trajectory of 'Long-Fuse' Defense Technologies",
                    "authors": [
                      {
                        "name": "Ash Rossiter",
                        "affiliation": "Khalifa University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Failing to Succeed: The KPz 70 and German Innovation in Armored Warfare, 1963-71",
                    "authors": [
                      {
                        "name": "Michael Carl Haas",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Keeping Pace: Technological Change and Military Innovation in the Italian Armed Forces",
                    "authors": [
                      {
                        "name": "Leopoldo Nuti",
                        "affiliation": "Roma Tre University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Niccolò Petrelli",
                        "affiliation": "Roma Tre University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Planning to Escalate to Deescalate: Military Alliances and Innovation during France's Cold War",
                    "authors": [
                      {
                        "name": "Marc R. De Vore",
                        "affiliation": "University of St Andrews",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "The Domestic Politics of Security and Defense",
                "room": "Room H 101",
                "conveners": [
                  {
                    "name": "Alice Pannier",
                    "affiliation": "Johns Hopkins University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Parties, Exit and European Security and Defense",
                    "authors": [
                      {
                        "name": "Stephanie Hofmann",
                        "affiliation": "Graduate Institute Geneva",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Debating Military Interventions: Party-Political Patterns of Justifications for Using Armed Force in Canada, Germany and the United Kingdom",
                    "authors": [
                      {
                        "name": "Wolfgang Wagner",
                        "affiliation": "Free University of Amsterdam",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Not Whether but When: The Influence of Leaders on Foreign Policy",
                    "authors": [
                      {
                        "name": "Jonas Schneider",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "When do Legislatures Matter in Civil-Military Relations?",
                    "authors": [
                      {
                        "name": "Stephen Saideman",
                        "affiliation": "Carleton University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "13h",
            "endTime": "14h",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Lunch",
                "room": "Main Hall"
              }
            ]
          },
          {
            "startTime": "14h",
            "endTime": "15h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Intelligence",
                "room": "Simone Veil Lecture Hall",
                "conveners": [
                  {
                    "name": "Claudia Hillebrand",
                    "affiliation": "Cardiff University"
                  }
                ],
                "discussants": [
                  {
                    "name": "Claudia Hillebrand",
                    "affiliation": "Cardiff University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Globalized Authoritarianism, Intelligence Cooperation and Transnational Repression",
                    "authors": [
                      {
                        "name": "Fiona B. Adamson",
                        "affiliation": "School of Oriental and African Studies (SOAS)",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Libyan Covert Actions in Europe, the Palestinian Armed Struggle, and Western Intelligence (1972-74)",
                    "authors": [
                      {
                        "name": "Aviva Guttmann",
                        "affiliation": "King's College London",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Of Ticking Bombs: Intelligence in the Counter-Terrorism Domain, 1970-Present",
                    "authors": [
                      {
                        "name": "Constant Hijzen",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Is Pessimism Well-Founded? Intelligence Analysis and the Intentions of Competitor States",
                    "authors": [
                      {
                        "name": "Andreas Lutsch",
                        "affiliation": "Federal University of Applied Administrative Sciences",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "What Do You Want to Die For? Military Recruitment in Comparative Perspective",
                "room": "Room H 101",
                "conveners": [
                  {
                    "name": "Joakim Berndtsson",
                    "affiliation": "University of Gothenburg"
                  }
                ],
                "discussants": [
                  {
                    "name": "Joakim Berndtsson",
                    "affiliation": "University of Gothenburg"
                  }
                ],
                "contributions": [
                  {
                    "title": "We Are Army After All? Military Recruitment in the Netherlands and Germany",
                    "authors": [
                      {
                        "name": "Jutta Joachim",
                        "affiliation": "Radboud University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Andrea Schneiker",
                        "affiliation": "University of Siegen",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Visuality of Military Recruitment: US and UK Militaries and PMSCs Compared",
                    "authors": [
                      {
                        "name": "Eugenio Cusumano",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Masculine Cultures, Exclusion Mechanisms and Retention of Female Personnel in the Military",
                    "authors": [
                      {
                        "name": "Chiara Ruffa",
                        "affiliation": "Uppsala University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Neoliberal Governmentality and Military Recruitment: Governing the Working Class Male Soldier",
                    "authors": [
                      {
                        "name": "Matthew Kearns",
                        "affiliation": "Newcastle University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15h30",
            "endTime": "16h",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break",
                "room": "Main Hall"
              }
            ]
          },
          {
            "startTime": "16h",
            "endTime": "17h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Terrorism and Counter-Terrorism",
                "room": "Simone Veil Lecture Hall",
                "conveners": [
                  {
                    "name": "Peter Neumann",
                    "affiliation": "King's College London"
                  }
                ],
                "discussants": [
                  {
                    "name": "Peter Neumann",
                    "affiliation": "King's College London"
                  }
                ],
                "contributions": [
                  {
                    "title": "Little Ado About Something: A Gender Perspective of EU and UN Counter-Terrorism Strategies",
                    "authors": [
                      {
                        "name": "Laura Berlingozzi",
                        "affiliation": "Sant'Anna School of Advanced Studies",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Al-Baghdadi's Revenge: Identifying the Strategic Value of Vengeance Narratives in the Islamic State's Propaganda",
                    "authors": [
                      {
                        "name": "Marie Robin",
                        "affiliation": "Panthéon-Assas University/University of Southern Denmark",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Negotiations with Terrorist Groups and the \"No Talks\" Paradigm",
                    "authors": [
                      {
                        "name": "Anna Muehlhausen",
                        "affiliation": "University of Erfurt",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Hostages and Counter-Terrorism: The Fallacies of the Realist Approach",
                    "authors": [
                      {
                        "name": "Étienne Dignat",
                        "affiliation": "Sciences Po",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Military Technology",
                "room": "Room H 101",
                "conveners": [
                  {
                    "name": "Moritz Weiss",
                    "affiliation": "Ludwig Maximilian University of Munich"
                  }
                ],
                "discussants": [
                  {
                    "name": "Moritz Weiss",
                    "affiliation": "Ludwig Maximilian University of Munich"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Military-Entrepreneurial Complex: Commercial Innovation and State Access",
                    "authors": [
                      {
                        "name": "Sophie-Charlotte Fischer",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "China's Efforts in Civil-Military Integration and International Implications",
                    "authors": [
                      {
                        "name": "Tai Ming Cheung",
                        "affiliation": "University of California San Diego",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Making the U.S. Defense Innovation Base More Effective in the Digital Arms Race with China: The Increasing Engagement of the Pentagon and Traditional Defense",
                    "authors": [
                      {
                        "name": "James Cross",
                        "affiliation": "Franklin Venture Partners",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "NATO, Emerging Technologies, and Future Warfare: Overcoming the Alliance's Strategic Dilemma",
                    "authors": [
                      {
                        "name": "Olivier Schmitt",
                        "affiliation": "University of Southern Denmark",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17h30",
            "endTime": "19h30",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Cocktail",
                "room": "Main Hall"
              }
            ]
          }
        ]
      },
      {
        "date": "2019-06-28",
        "label": "Day 2 — Friday 28 June",
        "rows": [
          {
            "startTime": "9h30",
            "endTime": "11h",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Interventions",
                "room": "Simone Veil Lecture Hall",
                "conveners": [
                  {
                    "name": "Chiara Ruffa",
                    "affiliation": "Uppsala University"
                  }
                ],
                "discussants": [
                  {
                    "name": "Chiara Ruffa",
                    "affiliation": "Uppsala University"
                  },
                  {
                    "name": "Stephen Saideman",
                    "affiliation": "Carleton University"
                  }
                ],
                "contributions": [
                  {
                    "title": "A Case Study: Russia's Special Operations Command in Military Interventions",
                    "authors": [
                      {
                        "name": "Emmanuel Dreyfus",
                        "affiliation": "Panthéon-Assas University/National Institute for Oriental Languages and Civilizations (INALCO)",
                        "isSpeaker": true
                      },
                      {
                        "name": "Michael Gjerstad",
                        "affiliation": "University of Southern Denmark",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Converging and Conflicting Dynamics of Cooperation: European Security Efforts in Sahel",
                    "authors": [
                      {
                        "name": "Silvia D'Amato",
                        "affiliation": "European University Institute",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Analyzing the Individual Strategic Practices of Deployed Officers in Multilateral Military Operations: An Analytical Framework",
                    "authors": [
                      {
                        "name": "Jon Rahbek-Clemmensen",
                        "affiliation": "Royal Danish Defense College",
                        "isSpeaker": true
                      },
                      {
                        "name": "Annemarie Peen Rodt Poucher",
                        "affiliation": "Royal Danish Defense College",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Reluctant to Intervene? The Ambiguous Politics of Peacekeeping in the Case of Emerging Powers",
                    "authors": [
                      {
                        "name": "Nicole Jenne",
                        "affiliation": "Pontificia Universidad Católica de Chile",
                        "isSpeaker": true
                      },
                      {
                        "name": "Rafael Duarte Villa",
                        "affiliation": "Universidade de Sao Paulo",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Arms Procurement and Transfers",
                "room": "Room H 101",
                "conveners": [
                  {
                    "name": "Jocelyn Mawdsley",
                    "affiliation": "Newcastle University"
                  }
                ],
                "discussants": [
                  {
                    "name": "Jocelyn Mawdsley",
                    "affiliation": "Newcastle University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Exports of Second-Hand Arms: Increasing the Competition for Arms Producing Firms",
                    "authors": [
                      {
                        "name": "Eva Ziegler",
                        "affiliation": "Ludwig Maximilian University of Munich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Understanding the Politics of European Naval Procurement: Always Just Beyond the Horizon?",
                    "authors": [
                      {
                        "name": "Brendan Flynn",
                        "affiliation": "National University of Ireland Galway",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Political Economy of Drones on the European Defense Market",
                    "authors": [
                      {
                        "name": "Dominika Kunertova",
                        "affiliation": "University of Southern Denmark",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Between Power and Plenty: The New EU Defense-Industrial Initiatives and the Transatlantic Relationship",
                    "authors": [
                      {
                        "name": "Antonio Calcara",
                        "affiliation": "LUISS Rome",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11h",
            "endTime": "11h30",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break",
                "room": "Main Hall"
              }
            ]
          },
          {
            "startTime": "11h30",
            "endTime": "13h",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "The Past, Present and Future of Transatlantic Security",
                "room": "Simone Veil Lecture Hall",
                "conveners": [
                  {
                    "name": "Mario Del Pero",
                    "affiliation": "Sciences Po"
                  }
                ],
                "discussants": [
                  {
                    "name": "Mario Del Pero",
                    "affiliation": "Sciences Po"
                  }
                ],
                "contributions": [
                  {
                    "title": "Private Diplomacy and Transatlantic Burden Sharing During Detente: A View from the Netherlands",
                    "authors": [
                      {
                        "name": "Albertine Bloemendal",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Theories of Balancing and US Grand Strategy: Unpacking the Europe vs. East Asia Tradeoff",
                    "authors": [
                      {
                        "name": "Linde Desmaele",
                        "affiliation": "Vrije Universiteit Brussel",
                        "isSpeaker": true
                      },
                      {
                        "name": "Luis Simón",
                        "affiliation": "Vrije Universiteit Brussel",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Inhibition or Control: European Autonomy and US Grand Strategy",
                    "authors": [
                      {
                        "name": "Paul van Hooft",
                        "affiliation": "Massachusetts Institute of Technology (MIT)",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Future of European Security Architecture: Back to Lady Thatcher and her Ententes",
                    "authors": [
                      {
                        "name": "Liviu Horovitz",
                        "affiliation": "Johns Hopkins University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "WMD Non-Proliferation and Arms Control",
                "room": "Room H 101",
                "conveners": [
                  {
                    "name": "Eliza Gheorghe",
                    "affiliation": "Bilkent University"
                  }
                ],
                "discussants": [
                  {
                    "name": "Eliza Gheorghe",
                    "affiliation": "Bilkent University"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Violation that Strengthens the Norm: India's 1974 Nuclear Explosion and the Global Nonproliferation Regime",
                    "authors": [
                      {
                        "name": "Joseph O'Mahoney",
                        "affiliation": "University of Reading",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Politics of the Nuclear Fuel Cycle: The Carter Administration, the INFCE Program, and Italy",
                    "authors": [
                      {
                        "name": "Giordana Pulcini",
                        "affiliation": "Roma Tre University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Uninsured Allies: When Do States Divest from Nuclear Latency?",
                    "authors": [
                      {
                        "name": "Ulrich Kuehn",
                        "affiliation": "University of Hamburg",
                        "isSpeaker": true
                      },
                      {
                        "name": "Tristan A. Volpe",
                        "affiliation": "US Naval Postgraduate School",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Implications of the Current Frictions within the Alliance and the Further Build-up of European Defense for Nuclear Deterrence in Europe",
                    "authors": [
                      {
                        "name": "Tom Sauer",
                        "affiliation": "University of Antwerpen",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "13h",
            "endTime": "14h",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Lunch",
                "room": "Main Hall"
              }
            ]
          },
          {
            "startTime": "14h",
            "endTime": "15h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "History and Prospect for a European Deterrent",
                "room": "Simone Veil Lecture Hall",
                "conveners": [
                  {
                    "name": "Frédéric Gloriant",
                    "affiliation": "University of Nantes"
                  }
                ],
                "discussants": [
                  {
                    "name": "Frédéric Gloriant",
                    "affiliation": "University of Nantes"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Franco-German Security Dialogue as a First Step for a Deeper French European Engagement",
                    "authors": [
                      {
                        "name": "Ilaria Parisi",
                        "affiliation": "École normale supérieure",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "European Perceptions of Nuclear Deterrence in the Era of Trump and Putin and the Path to European Strategic Autonomy",
                    "authors": [
                      {
                        "name": "Tara Varma",
                        "affiliation": "European Council of Foreign Relations",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "German View on a European Deterrent: the Cold War, and Prospects",
                    "authors": [
                      {
                        "name": "Julia Berghofer",
                        "affiliation": "European Leadership Network",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "France, European Defense and Deterrence Since the End of the Cold War",
                    "authors": [
                      {
                        "name": "Guillaume de Rougé",
                        "affiliation": "École normale supérieure",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Private Actors, Armed Conflict, and the State",
                "room": "Room H 101",
                "conveners": [
                  {
                    "name": "Sibylle Scheipers",
                    "affiliation": "University of St Andrews"
                  }
                ],
                "discussants": [
                  {
                    "name": "Sibylle Scheipers",
                    "affiliation": "University of St Andrews"
                  }
                ],
                "contributions": [
                  {
                    "title": "Discursive Practices and the Construction of Mercenaries as Illegitimate Fighters",
                    "authors": [
                      {
                        "name": "Helene Olsen",
                        "affiliation": "King's College London",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Normative Limits on Counter-violence by Discretionary States",
                    "authors": [
                      {
                        "name": "Luis de la Calle",
                        "affiliation": "Center for Research and Teaching in Economics (CIDE)",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Local State-Society Transformations and Everyday Security Provisioning in San Salvador",
                    "authors": [
                      {
                        "name": "Chris van der Borgh",
                        "affiliation": "Utrecht University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Offshore Balancing, Special Operations Forces (SOF) and the Hybrid Agencies of Democratic Warfare",
                    "authors": [
                      {
                        "name": "Evren Eken",
                        "affiliation": "Suleyman Demirel University, Galatasaray",
                        "isSpeaker": true
                      },
                      {
                        "name": "Eylem Ozkaya Lassalle",
                        "affiliation": "Suleyman Demirel University, Galatasaray",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15h30",
            "endTime": "17h30",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "keynote",
                "title": "Concluding Keynote Panel — Pulling Back or Staying In? US Grand Strategic Options and their Implications for Europe",
                "room": "Simone Veil Lecture Hall",
                "conveners": [
                  {
                    "name": "Thierry Balzacq",
                    "affiliation": "Sciences Po-CERI"
                  }
                ],
                "discussants": [
                  {
                    "name": "Stephanie Hofmann",
                    "affiliation": "Graduate Institute Geneva"
                  },
                  {
                    "name": "Adrian Hyde-Price",
                    "affiliation": "University of Gothenburg"
                  }
                ],
                "contributions": [
                  {
                    "title": "Pulling Back or Staying In? US Grand Strategic Options and their Implications for Europe",
                    "authors": [
                      {
                        "name": "Stephen Brooks",
                        "affiliation": "Dartmouth College",
                        "isSpeaker": true
                      },
                      {
                        "name": "Barry Posen",
                        "affiliation": "Massachusetts Institute of Technology",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "sourceNote": "Transcribed from the final printed programme 'EISS 2019 Final Programme.pdf' (3rd Annual Conference, Sciences Po Paris). Emails and contact details excluded per instructions."
  },
  "2020": {
    "slug": "2020",
    "year": 2020,
    "edition": "4th Annual Conference (deferred)",
    "venue": "ISCTE / University Institute of Lisbon (ISCTE-IUL)",
    "city": "Lisbon",
    "country": "Portugal",
    "dates": "22 - 23 June 2020",
    "startDate": "2020-06-22",
    "endDate": "2020-06-23",
    "keynotes": [],
    "days": [
      {
        "date": "2020-06-22",
        "label": "Day 1 — Monday 22 June",
        "rows": [
          {
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Introductory Remarks"
              }
            ]
          },
          {
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Opening Multidisciplinary Roundtable"
              }
            ]
          },
          {
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Terrorism and Counter-Terrorism",
                "conveners": [
                  {
                    "name": "Bernhard Blumenau",
                    "affiliation": "University of St Andrews"
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Military Interventions",
                "conveners": [
                  {
                    "name": "Marina Henke",
                    "affiliation": "Hertie School"
                  }
                ]
              }
            ]
          },
          {
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break"
              }
            ]
          },
          {
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Technology",
                "conveners": [
                  {
                    "name": "Bastian Giegerich",
                    "affiliation": "International Institute for Strategic Studies"
                  }
                ]
              }
            ]
          },
          {
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Lunch"
              }
            ]
          },
          {
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Private Actors, Armed Conflict and the State",
                "conveners": [
                  {
                    "name": "Ulrich Petersohn",
                    "affiliation": "University of Liverpool"
                  }
                ]
              }
            ]
          },
          {
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break"
              }
            ]
          },
          {
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Defense Cooperation and Military Assistance",
                "conveners": [
                  {
                    "name": "Niccolò Petrelli",
                    "affiliation": "Roma Tre University"
                  }
                ]
              }
            ]
          },
          {
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Cocktail"
              }
            ]
          }
        ]
      },
      {
        "date": "2020-06-23",
        "label": "Day 2 — Tuesday 23 June",
        "rows": [
          {
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Arms Procurement and Transfers",
                "conveners": [
                  {
                    "name": "Phillips O'Brien",
                    "affiliation": "University of St Andrews"
                  }
                ]
              }
            ]
          },
          {
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break"
              }
            ]
          },
          {
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "WMD Non-Proliferation and Arms Control",
                "conveners": [
                  {
                    "name": "Michal Onderco",
                    "affiliation": "Erasmus University Rotterdam"
                  }
                ]
              }
            ]
          },
          {
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Lunch"
              }
            ]
          },
          {
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Intelligence",
                "conveners": [
                  {
                    "name": "Peter Jackson",
                    "affiliation": "University of Glasgow"
                  },
                  {
                    "name": "Damien Van Puyvelde",
                    "affiliation": "University of Glasgow"
                  }
                ]
              }
            ]
          },
          {
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "keynote",
                "title": "Concluding Keynote Speech"
              }
            ]
          }
        ]
      }
    ],
    "sourceNote": "Transcribed from the planned programme in '2020 EISS Call for Papers and Panels_final.pdf' (Drive id 1YFxwdIBS0Hm6d4vDwkKS-8K_2xcaMymS), 4th Annual Conference scheduled for ISCTE-IUL Lisbon, deferred owing to COVID-19. Only the planned closed-panel themes and their chairs are documented in the CFP; individual papers/speakers were not yet selected, so contributions are omitted. The CFP also lists 'open panels' in several slots as a planned slot type (no titles/speakers assigned), not transcribed as separate items. Emails, the €30 registration rate, and submission deadlines excluded per instructions.",
    "uncertain": [
      "Exact ordering and time slots of the 2020 panels are inferred from the CFP's day-by-day list, which printed no clock times. The 'open panel' parallel slots beside each closed panel are planned placeholders without assigned content.",
      "On Day 1 the CFP places 'Military Interventions' (Chair: Marina Henke) adjacent to the Terrorism/Counter-Terrorism block; its precise time slot is not printed."
    ]
  },
  "2021": {
    "slug": "2021",
    "year": 2021,
    "edition": "4th Annual Conference",
    "venue": "Iscte - University Institute of Lisbon, Avenida das Forças Armadas, 1649-026 Lisboa (Building II, 2nd floor)",
    "city": "Lisbon",
    "country": "Portugal",
    "dates": "3 - 4 September 2021",
    "startDate": "2021-09-03",
    "endDate": "2021-09-04",
    "keynotes": [
      {
        "speaker": "Anne Deighton",
        "affiliation": "University of Oxford",
        "title": "Security Studies 2020: Blindsided by Brexit?"
      }
    ],
    "days": [
      {
        "date": "2021-09-03",
        "label": "Day 1 — Friday 3 September",
        "rows": [
          {
            "startTime": "9h45",
            "endTime": "10h",
            "items": [
              {
                "kind": "break",
                "title": "Coffee"
              }
            ]
          },
          {
            "startTime": "10h",
            "endTime": "10h15",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Introductory Remarks",
                "room": "Auditorium B2.03",
                "conveners": [
                  {
                    "name": "Bruno Cardoso Reis",
                    "affiliation": "Iscte - University Institute of Lisbon"
                  },
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Sciences Po"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "10h15",
            "endTime": "10h45",
            "items": [
              {
                "kind": "session",
                "subtype": "keynote",
                "title": "Keynote — Security Studies 2020: Blindsided by Brexit?",
                "room": "Auditorium B2.03",
                "contributions": [
                  {
                    "title": "Security Studies 2020: Blindsided by Brexit?",
                    "authors": [
                      {
                        "name": "Anne Deighton",
                        "affiliation": "University of Oxford",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11h",
            "endTime": "12h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Defense Cooperation and Military Assistance",
                "room": "Auditorium B2.03",
                "conveners": [
                  {
                    "name": "Niccolò Petrelli",
                    "affiliation": "Roma Tre University"
                  }
                ],
                "contributions": [
                  {
                    "title": "To What Extent EU's 'Effective Multilateralism' is An Adequate Mean to Counter Hybrid Threats?",
                    "authors": [
                      {
                        "name": "Pascal Carlucci",
                        "affiliation": "University of Coventry",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "How Minilateralism Shapes NATO's Decision-Making Process",
                    "authors": [
                      {
                        "name": "Christelle Calmels",
                        "affiliation": "Sciences Po",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Offsetting Brexit in Defence Cooperation: Trust Matters",
                    "authors": [
                      {
                        "name": "Ben Kienzle",
                        "affiliation": "King's College London",
                        "isSpeaker": true
                      },
                      {
                        "name": "Richard Whitman",
                        "affiliation": "University of Kent"
                      },
                      {
                        "name": "Mark Webber",
                        "affiliation": "University of Birmingham"
                      }
                    ]
                  },
                  {
                    "title": "EU Military Capabilities in the Post-Cold War: A Response to Systemic Pressures",
                    "authors": [
                      {
                        "name": "Bruna Rohr Reisdoerfer",
                        "affiliation": "Federal University of Rio Grande do Sul",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "WMD Non-Proliferation and Arms Control",
                "room": "Room B2.01",
                "conveners": [
                  {
                    "name": "Michal Onderco",
                    "affiliation": "Erasmus University Rotterdam"
                  }
                ],
                "contributions": [
                  {
                    "title": "Plans are Worthless, But Planning is Everything",
                    "authors": [
                      {
                        "name": "Nina Silove",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Managing Assurance and Deterrence Demands in Heterogeneous Alliances: The Case of Non-Strategic Nuclear Weapons and the Future of Nuclear Sharing in NATO",
                    "authors": [
                      {
                        "name": "Tobias Bunde",
                        "affiliation": "Hertie School of Governance",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "NATO as a Nuclear Alliance",
                    "authors": [
                      {
                        "name": "Andrew C. Carroll",
                        "affiliation": "Columbia University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "American Strategies of Retrenchment versus Inhibition",
                    "authors": [
                      {
                        "name": "Paul van Hooft",
                        "affiliation": "Massachusetts Institute of Technology",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12h30",
            "endTime": "14h",
            "items": [
              {
                "kind": "break",
                "title": "Lunch"
              }
            ]
          },
          {
            "startTime": "14h",
            "endTime": "15h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Technology",
                "room": "Auditorium B2.03",
                "conveners": [
                  {
                    "name": "Kristin Ven Bruusgaard",
                    "affiliation": "University of Oslo"
                  }
                ],
                "contributions": [
                  {
                    "title": "Integration of Technical Exploitation in Military Organisations",
                    "authors": [
                      {
                        "name": "Paul Oling",
                        "affiliation": "Joint IT Command of the Dutch Ministry of Defence",
                        "isSpeaker": true
                      },
                      {
                        "name": "Paul van Fenema",
                        "affiliation": "Netherlands Defence Academy"
                      },
                      {
                        "name": "Bas Rietjens",
                        "affiliation": "Netherlands Defence Academy"
                      }
                    ]
                  },
                  {
                    "title": "Dynamics of Cyber Proliferation",
                    "authors": [
                      {
                        "name": "Max Smeets",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Strategic Autonomy, European DTIB and Technological Complexity",
                    "authors": [
                      {
                        "name": "Mauro Gilli",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      },
                      {
                        "name": "Zoe Stanley",
                        "affiliation": "Nanyang Technological University"
                      }
                    ]
                  },
                  {
                    "title": "Autonomous Weapons Systems in International Law",
                    "authors": [
                      {
                        "name": "Verena Jackson",
                        "affiliation": "Bundeswehr University Munich",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Terrorism and Counterterrorism",
                "room": "Room B2.01",
                "conveners": [
                  {
                    "name": "Bernhard Blumenau",
                    "affiliation": "University of St Andrews"
                  }
                ],
                "contributions": [
                  {
                    "title": "How Terror Evolves: The Emergence and Spread of Terrorist Techniques",
                    "authors": [
                      {
                        "name": "Yannick Veilleux-Lepage",
                        "affiliation": "University of Leiden",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Live-Streaming of Terrorism: Context, Potential Effects and Challenges",
                    "authors": [
                      {
                        "name": "Sandro Nickel",
                        "affiliation": "Aalborg University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Downgrading or Upsizing Strategies: How Rebels Learn About the Right Repertoire of Violence",
                    "authors": [
                      {
                        "name": "Luis De la Calle",
                        "affiliation": "CIDE, Mexico City; Carlos III University, Madrid",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Comparative Analysis of North Atlantic Treaty Organization (NATO) and Shanghai Cooperation Organization (SCO) Counter-Terrorism Efforts",
                    "authors": [
                      {
                        "name": "Aybike Yalcin Ispir",
                        "affiliation": "Ankara Yildirim Beyazit University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15h30",
            "endTime": "16h",
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break"
              }
            ]
          },
          {
            "startTime": "16h",
            "endTime": "17h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Interventions",
                "room": "Auditorium B2.03",
                "conveners": [
                  {
                    "name": "Marina Henke",
                    "affiliation": "Hertie School"
                  }
                ],
                "contributions": [
                  {
                    "title": "A Post-Liberal Age of Security? Authoritarian Interventionism in the Middle East and Northern Africa",
                    "authors": [
                      {
                        "name": "Hanna Pfeifer",
                        "affiliation": "HSFK Peace Research Institute Frankfurt (PRIF)",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "France and the United States interventionism in North Africa and in the Middle East in the 21st century: A Strategic Cross-Over?",
                    "authors": [
                      {
                        "name": "Salomé Tulane",
                        "affiliation": "Graduate Institute of International and Development Studies",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Dilemma of Security Force Assistance: The Fight against Boko Haram, Military Aid, and Deepening Autocracy in Cameroon and Chad",
                    "authors": [
                      {
                        "name": "Kristen Harkness",
                        "affiliation": "University of St Andrews",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "What are They (T)asked to Do? Introducing the Peace Operations Mandates (POM) Dataset",
                    "authors": [
                      {
                        "name": "Evgenija Kroeker",
                        "affiliation": "Oxford University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Arms Procurement and Transfers",
                "room": "Room B2.01",
                "conveners": [
                  {
                    "name": "Phillips O'Brien",
                    "affiliation": "University of St Andrews"
                  }
                ],
                "contributions": [
                  {
                    "title": "What Do We Talk About When We Talk About Dual-use Goods?",
                    "authors": [
                      {
                        "name": "Ana Sánchez Cobaleda",
                        "affiliation": "Universitat de Barcelona, Spain",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Arms Without Influence? Defense Industrial Policy and Burden-Sharing in the Transatlantic Community",
                    "authors": [
                      {
                        "name": "Jordan Becker",
                        "affiliation": "Vrije Universiteit Brussel/US Army",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "European Naval Procurement under Global Competition: Why So Underwhelming and Should We Think of It as Even 'European'?",
                    "authors": [
                      {
                        "name": "Brendan Flynn",
                        "affiliation": "National University of Ireland Galway",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Proliferation of Military Drones in Europe – Not So Easy, Not So Cheap, but NATO and the EU Can Help",
                    "authors": [
                      {
                        "name": "Dominika Kunertova",
                        "affiliation": "ETH Zürich",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "18h",
            "endTime": "20h",
            "items": [
              {
                "kind": "break",
                "title": "Cocktail"
              }
            ]
          }
        ]
      },
      {
        "date": "2021-09-04",
        "label": "Day 2 — Saturday 4 September",
        "rows": [
          {
            "startTime": "10h",
            "endTime": "10h30",
            "items": [
              {
                "kind": "break",
                "title": "Coffee break"
              }
            ]
          },
          {
            "startTime": "10h30",
            "endTime": "12h",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Thinking European Security through India",
                "room": "Auditorium B2.03",
                "conveners": [
                  {
                    "name": "Sandra Destradi",
                    "affiliation": "German Institute of Global and Area Studies"
                  }
                ],
                "contributions": [
                  {
                    "title": "An Indian Perspective on Security and the Use of Force: The Case of the Responsibility to Protect",
                    "authors": [
                      {
                        "name": "Raphaëlle Khan",
                        "affiliation": "IRSEM-University of Pennsylvania",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Opening the Black Box of Defence Procurement and Planning Processes: What Drives India to Develop International Defence Partnerships?",
                    "authors": [
                      {
                        "name": "Nicolas Blarel",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Peacock in a Coal Mine: European Understanding of Environmental Loss in India",
                    "authors": [
                      {
                        "name": "Damien Carrière",
                        "affiliation": "IRSEM-Paris 7 University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "India's New Security Approach to the European Union",
                    "authors": [
                      {
                        "name": "Constantino Xavier",
                        "affiliation": "Centre for Social and Economic Progress – New Delhi",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Intelligence",
                "room": "Room B2.01",
                "conveners": [
                  {
                    "name": "Peter Jackson",
                    "affiliation": "University of Glasgow"
                  },
                  {
                    "name": "Damien Van Puyvelde",
                    "affiliation": "University of Glasgow"
                  }
                ],
                "contributions": [
                  {
                    "title": "Breaking the ONE: The Evolution of the National Intelligence Estimate Production Cycle (1965-1976)",
                    "authors": [
                      {
                        "name": "Giordana Pulcini",
                        "affiliation": "Roma Tre University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Intelligence Services and Hybrid Warfare: The Case of Ukraine",
                    "authors": [
                      {
                        "name": "Jan Mericka",
                        "affiliation": "Czech Technical University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Power Projection, Deterrence Strategies and Escalation Dynamics: From Near-Crisis to Crisis to War",
                    "authors": [
                      {
                        "name": "Steven Lobell",
                        "affiliation": "University of Utah",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Rethinking Intelligence Services: Learning from Society. Towards a Project of Shared Intelligence",
                    "authors": [
                      {
                        "name": "Fernando Velasco",
                        "affiliation": "Universidad Rey Juan Carlos",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12h",
            "endTime": "13h30",
            "items": [
              {
                "kind": "break",
                "title": "Lunch"
              }
            ]
          },
          {
            "startTime": "13h30",
            "endTime": "15h",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "European Defense and Security",
                "room": "Auditorium B2.03",
                "conveners": [
                  {
                    "name": "Anne Deighton",
                    "affiliation": "University of Oxford"
                  }
                ],
                "contributions": [
                  {
                    "title": "Slowly Moving Towards a European Defense? The Feasible Compromise between France and Germany in the post-Brexit Context",
                    "authors": [
                      {
                        "name": "Alberto Cunha",
                        "affiliation": "King's College London",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Building the Best Tank: Institutions and the Choice to Embrace Radical Change",
                    "authors": [
                      {
                        "name": "Marc DeVore",
                        "affiliation": "University of St Andrews",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Analyzing Small States' Use of Military Power: From Ends-Ways-Means to Objectives, Frameworks and Capabilities",
                    "authors": [
                      {
                        "name": "Jan Werner Mathiasen",
                        "affiliation": "Royal Danish Defence College",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Crisis Management and Partnership Peacekeeping: Coordination Between the EU, AU, and UN",
                    "authors": [
                      {
                        "name": "Maline Meiske",
                        "affiliation": "University of Oxford",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Private Actors, Armed Conflict and the State",
                "room": "Room B2.01",
                "conveners": [
                  {
                    "name": "Chiara Ruffa",
                    "affiliation": "Swedish Defense University"
                  }
                ],
                "contributions": [
                  {
                    "title": "From Confrontation to Cooperation: Non-State Armed Group-UN Interactions in Peace Operations",
                    "authors": [
                      {
                        "name": "Jenniina Kotajoki",
                        "affiliation": "Uppsala University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The State Monopoly of Violence as Organized Hypocrisy: The Privatization of UN Peacekeeping Operations",
                    "authors": [
                      {
                        "name": "Eugenio Cusumano",
                        "affiliation": "University of Leiden",
                        "isSpeaker": true
                      },
                      {
                        "name": "Oldrich Bures",
                        "affiliation": "Metropolitan University Prague"
                      }
                    ]
                  },
                  {
                    "title": "Strategic Consequences of Tactical Alliances. The Case of the US-led Coalition Against Islamic State Allying with the Syrian Democratic Forces",
                    "authors": [
                      {
                        "name": "Anne Sofie Schøtt",
                        "affiliation": "Royal Danish Defence College",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Rise of Cybersecurity Warriors?",
                    "authors": [
                      {
                        "name": "Moritz Weiss",
                        "affiliation": "Ludwig Maximilian University of Munich",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15h",
            "endTime": "15h30",
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break"
              }
            ]
          },
          {
            "startTime": "15h30",
            "endTime": "17h30",
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Keynote Multidisciplinary Roundtable — Studying Security. A Multidisciplinary Perspective",
                "room": "Auditorium B2.03",
                "conveners": [
                  {
                    "name": "Luís Nuno Rodrigues",
                    "affiliation": "University Institute of Lisbon / ISCTE"
                  }
                ],
                "discussants": [
                  {
                    "name": "Phillips O'Brien",
                    "affiliation": "University of St Andrews"
                  },
                  {
                    "name": "Flavia Gasbarri",
                    "affiliation": "King's College London"
                  },
                  {
                    "name": "Helena Carreiras",
                    "affiliation": "University Institute of Lisbon / ISCTE"
                  },
                  {
                    "name": "Steven Lobell",
                    "affiliation": "University of Utah"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17h45",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Concluding Remarks",
                "room": "Auditorium B2.03",
                "conveners": [
                  {
                    "name": "Bruno Cardoso Reis",
                    "affiliation": "University Institute of Lisbon / ISCTE"
                  },
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Sciences Po"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "sourceNote": "Transcribed from the authoritative final 'EISS 2021 Conference_Programme.pdf' (Drive id 1DauG72h8Nf8MQv46XN7Dt5KFgNdnRbYl). Chairs reconciled against the PDF, which is authoritative: Military Technology chaired by Kristin Ven Bruusgaard (not the live page's draft Bastian Giegerich) and Private Actors chaired by Chiara Ruffa (not the live page's draft Ulrich Petersohn). The advertised Concluding Keynote Speech by João Titterington Gomes Cravinho (Portuguese Minister of Defence) is marked '(TBC)' in the final programme and is omitted per the exclude rule.",
    "uncertain": [
      "2021 panel headings render 'Defense'/'Defence' inconsistently in the source; transcribed as printed per section (summary grid 'Defense', detailed programme matches)."
    ]
  },
  "2022": {
    "slug": "2022",
    "year": 2022,
    "edition": "2022 Annual Conference",
    "venue": "Hertie School, Friedrichstraße 180, 10117 Berlin",
    "city": "Berlin",
    "country": "Germany",
    "dates": "30 June–1 July 2022",
    "startDate": "2022-06-30",
    "endDate": "2022-07-01",
    "keynotes": [],
    "days": [
      {
        "date": "2022-06-30",
        "label": "Day 1 — Thursday 30 June",
        "rows": [
          {
            "startTime": "9h15",
            "endTime": "9h45",
            "items": [
              {
                "kind": "break",
                "title": "Registration & Coffee",
                "room": "Hertie School lobby & cafeteria"
              }
            ]
          },
          {
            "startTime": "9h45",
            "endTime": "10h",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Introductory Remarks",
                "room": "Forum",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Director of EISS / Sciences Po"
                  },
                  {
                    "name": "Marina Henke",
                    "affiliation": "Hertie School"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "10h",
            "endTime": "11h",
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 1: The War in Ukraine",
                "room": "Forum",
                "conveners": [
                  {
                    "name": "Moritz Weiss",
                    "affiliation": "LMU Munich"
                  }
                ],
                "discussants": [
                  {
                    "name": "Lindsay Cohn",
                    "affiliation": "Naval War College"
                  },
                  {
                    "name": "Olivier Schmitt",
                    "affiliation": "University of Southern Denmark"
                  },
                  {
                    "name": "Marc DeVore",
                    "affiliation": "University of St Andrews"
                  },
                  {
                    "name": "Dominika Kunertova",
                    "affiliation": "University of Southern Denmark"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11h",
            "endTime": "12h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Technology",
                "room": "Room 3.32 & 3.30",
                "conveners": [
                  {
                    "name": "Marc DeVore",
                    "affiliation": "University of St Andrews"
                  }
                ],
                "contributions": [
                  {
                    "title": "Un-Hyping Hypersonic Weapons",
                    "authors": [
                      {
                        "name": "Dominika Kunertova",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Technology as Status Anchor: How Russia Perceives Artificial Intelligence",
                    "authors": [
                      {
                        "name": "Anna Nadibaidze",
                        "affiliation": "University of Southern Denmark",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Drone Use in Ukraine: Claims and Implications",
                    "authors": [
                      {
                        "name": "James Page",
                        "affiliation": "Durham University and University of St Andrews",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "External Sponsorship and Conflict Intervention",
                "room": "Forum",
                "conveners": [
                  {
                    "name": "Erin K. Jenne",
                    "affiliation": "Central European University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Carpe Diem: When Foreign Sponsors Intervene Directly in Civil War",
                    "authors": [
                      {
                        "name": "Giuseppe Spatafora",
                        "affiliation": "University of Oxford",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Uneasy Relation of Proxy War and States' Interests. Pursuing Strategic Opportunities in Civil Wars",
                    "authors": [
                      {
                        "name": "Natalia Tellidou",
                        "affiliation": "European University Institute",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "If You Can't Beat 'em, Join 'em: Conceptualizing Non-State Armed Group Interaction",
                    "authors": [
                      {
                        "name": "Michel Wyss",
                        "affiliation": "Leiden University & Military Academy at ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Logic of Diaspora Sponsorship to Rebel Organizations",
                    "authors": [
                      {
                        "name": "Sara Daub",
                        "affiliation": "Hertie School",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12h30",
            "endTime": "13h30",
            "items": [
              {
                "kind": "break",
                "title": "Lunch",
                "room": "Cafeteria"
              }
            ]
          },
          {
            "startTime": "13h30",
            "endTime": "15h",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Arms Procurement and Transfers",
                "room": "Room 3.32 & 3.30",
                "conveners": [
                  {
                    "name": "Jocelyn Mawdsley",
                    "affiliation": "Newcastle University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Why States Arm – and Why They Sometimes Do So Together",
                    "authors": [
                      {
                        "name": "Ulrich Krotz",
                        "affiliation": "Sciences Po",
                        "isSpeaker": true
                      },
                      {
                        "name": "Jonata Anicetti",
                        "affiliation": "Metropolitan University Prague"
                      }
                    ]
                  },
                  {
                    "title": "'Aiding and Assisting' Atrocity Crimes? Britain's Prevention Paradox in Yemen",
                    "authors": [
                      {
                        "name": "Gillian McKay",
                        "affiliation": "University of Leeds",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "European Arms Collaboration All at Sea? Competition and Co-operation Over Global Naval Exports",
                    "authors": [
                      {
                        "name": "Brendan Flynn",
                        "affiliation": "National University of Ireland Galway",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Cyber Arms Transfer: Meaning, Limits and Implications",
                    "authors": [
                      {
                        "name": "Max Smeets",
                        "affiliation": "Swiss Federal Institute of Technology in Zürich (ETH)",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Private Actors, Armed Conflict and the State",
                "room": "Forum",
                "conveners": [
                  {
                    "name": "Chiara Ruffa",
                    "affiliation": "Swedish Defence University"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Impact of Commercial Military Actors on Armed Conflict Termination, 1980–2010",
                    "authors": [
                      {
                        "name": "Ulrich Petersohn",
                        "affiliation": "University of Liverpool",
                        "isSpeaker": true
                      },
                      {
                        "name": "Leila Kellgren Parker",
                        "affiliation": "University of Liverpool"
                      }
                    ]
                  },
                  {
                    "title": "Domestic Operations and Outsourcing of Security. What Implications for the Military?",
                    "authors": [
                      {
                        "name": "Matteo Mazziotti di Celso",
                        "affiliation": "University of Genoa",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "A Source of Escalation or a Source of Restraint? Whether and How Civil Society Affects Mass Killings",
                    "authors": [
                      {
                        "name": "Erica Chenoweth",
                        "affiliation": "Harvard University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Evan Perkoski",
                        "affiliation": "University of Connecticut"
                      }
                    ]
                  },
                  {
                    "title": "Rules, Expertise, and the Rise of the Regulatory Security State",
                    "authors": [
                      {
                        "name": "Andreas Kruck",
                        "affiliation": "LMU Munich",
                        "isSpeaker": true
                      },
                      {
                        "name": "Moritz Weiss",
                        "affiliation": "LMU Munich"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15h",
            "endTime": "16h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Professionalism in Crisis: The Present and Future of Democratic Civil-Military Relations",
                "room": "Room 3.32 & 3.30",
                "conveners": [
                  {
                    "name": "Stephen Saideman",
                    "affiliation": "Carleton University"
                  }
                ],
                "contributions": [
                  {
                    "title": "What Does Military Professionalism Mean? A Contested Concept in the Post-Heroic Society",
                    "authors": [
                      {
                        "name": "Kristine Eck",
                        "affiliation": "Uppsala University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Chiara Ruffa",
                        "affiliation": "Swedish Defence University"
                      }
                    ]
                  },
                  {
                    "title": "The Democratic Military in Internal Missions: Professionalism in an Era of Climate, Health and Humanitarian Crises",
                    "authors": [
                      {
                        "name": "Risa Brooks",
                        "affiliation": "Marquette University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Military Politics on the Battlefield: Strategy and Effectiveness in War",
                    "authors": [
                      {
                        "name": "Carrie Lee",
                        "affiliation": "US Army War College",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Military Professionalism under Political Polarization",
                    "authors": [
                      {
                        "name": "Lindsay Cohn",
                        "affiliation": "US Naval War College",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Terrorism and Counter-Terrorism",
                "room": "Forum",
                "conveners": [
                  {
                    "name": "Bernhard Blumenau",
                    "affiliation": "University of St Andrews"
                  }
                ],
                "contributions": [
                  {
                    "title": "Veterans, Novices, and Patterns of Rebel Recruitment",
                    "authors": [
                      {
                        "name": "Evan Perkoski",
                        "affiliation": "University of Connecticut",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Human Dignity Case Against Administrative Detention",
                    "authors": [
                      {
                        "name": "Eden Lapidor",
                        "affiliation": "Georgetown University Law Center",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Blurring the Lines: Sovereignty and Consent in the Fight against Terrorism",
                    "authors": [
                      {
                        "name": "Renée de Nevers",
                        "affiliation": "Syracuse University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Between the Scylla of 'Ontological Lethargy' and the Charybdis of 'Epistemological Terrorism': Revisiting the critical vs orthodox divide in Terrorism Studies",
                    "authors": [
                      {
                        "name": "Andreas Gofas",
                        "affiliation": "Panteion University of Social and Political Sciences, Athens",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "16h30",
            "endTime": "17h",
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break",
                "room": "Cafeteria"
              }
            ]
          },
          {
            "startTime": "17h",
            "endTime": "18h30",
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 2: Navigating the Academic Job Market",
                "room": "Forum",
                "conveners": [
                  {
                    "name": "Fabrizio Coticchia",
                    "affiliation": "University of Genoa"
                  }
                ],
                "discussants": [
                  {
                    "name": "Stephanie Hofmann",
                    "affiliation": "Chair in International Relations, European University Institute"
                  },
                  {
                    "name": "Nicolas Blarel",
                    "affiliation": "Associate Professor & Director of Studies at the Institute of Political Science, Leiden University"
                  },
                  {
                    "name": "Aviva Guttmann",
                    "affiliation": "Lecturer, Aberystwyth University"
                  },
                  {
                    "name": "Matthew Uttley",
                    "affiliation": "Professor and former Dean of Academic Studies, King's College London"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "date": "2022-07-01",
        "label": "Day 2 — Friday 1 July",
        "rows": [
          {
            "startTime": "10h",
            "endTime": "11h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Defence Cooperation and Military Assistance",
                "room": "Room 3.32 & 3.30",
                "conveners": [
                  {
                    "name": "Niccolò Petrelli",
                    "affiliation": "Roma Tre University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Military Assistance and National Security",
                    "authors": [
                      {
                        "name": "Kersti Larsdotter",
                        "affiliation": "Swedish Defence University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Understanding NATO Entanglement in Non-Member Conflicts: Evidence from Bosnia, 1993-95",
                    "authors": [
                      {
                        "name": "Stefano Recchia",
                        "affiliation": "Southern Methodist University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Migration-Defence Nexus: Unravelling the Effect of Migration on Defence Efforts in the Transatlantic Community",
                    "authors": [
                      {
                        "name": "Daphné Charotte",
                        "affiliation": "Maastricht University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Military Expenditure, External Threats and Fiscal Consolidation: A Survey Experiment in Italy",
                    "authors": [
                      {
                        "name": "Alessia Aspide",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Jordan Becker",
                        "affiliation": "USMA West Point"
                      },
                      {
                        "name": "Matthew Di Giuseppe",
                        "affiliation": "Leiden University"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Norm Violation, Sanctions, and the Punitive Use of Force",
                "room": "Forum",
                "conveners": [
                  {
                    "name": "Simon Koschut",
                    "affiliation": "Zeppelin University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Norm Violations and Punishment Beyond the Nation-State. Normative Orders, Authority, and Conflict in International Society",
                    "authors": [
                      {
                        "name": "Wolfgang Wagner",
                        "affiliation": "Vrije Universiteit Amsterdam",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Deciphering International Punishment: Literary, Legal and Political Insights from the Global South",
                    "authors": [
                      {
                        "name": "Siddharth Mallavarapu",
                        "affiliation": "Shiv Nadar University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Sanctions and the Authority of Legitimate Punishment in International Politics",
                    "authors": [
                      {
                        "name": "Elin Hellquist",
                        "affiliation": "Stockholm University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Punishment, Panopticum and the Contingency of Legal Norms - A Legal-Philosophical Perspective of the War in Ukraine",
                    "authors": [
                      {
                        "name": "Cornelia Baciu",
                        "affiliation": "University of Copenhagen",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11h30",
            "endTime": "13h",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Interventions",
                "room": "Room 3.32 & 3.30",
                "conveners": [
                  {
                    "name": "Kristen Harkness",
                    "affiliation": "University of St Andrews"
                  }
                ],
                "contributions": [
                  {
                    "title": "Russia's Way of War: Comparing Russian Strategy and Operations in Ukraine and Syria",
                    "authors": [
                      {
                        "name": "Nicolò Fasola",
                        "affiliation": "University of Birmingham",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Adaptation Cascade: The Global Diffusion of All-Female Military Units in Military Interventions",
                    "authors": [
                      {
                        "name": "Cristina Fontanelli",
                        "affiliation": "University of Genoa",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Trade-Offs in the Use of Military Power: Lessons Learned from French Military Operations Abroad",
                    "authors": [
                      {
                        "name": "Olivier Schmitt",
                        "affiliation": "University of Southern Denmark",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Visualizing American Military Interventions Abroad",
                    "authors": [
                      {
                        "name": "Hubert Zimmermann",
                        "affiliation": "University of Marburg",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Cybercrime and International Security",
                "room": "Forum",
                "conveners": [
                  {
                    "name": "Mischa Hansel",
                    "affiliation": "University of Hamburg (IFSH)"
                  },
                  {
                    "name": "Anja Jakobi",
                    "affiliation": "Technical University Braunschweig"
                  }
                ],
                "contributions": [
                  {
                    "title": "Unpacking Cyber Affordances in the Context of State-Cybercrime: A Criminological Perspective",
                    "authors": [
                      {
                        "name": "Anita Lavorgna",
                        "affiliation": "University of Southampton",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "On the Peace and Security Implications of Cybercrime – The Need for an Integrated Approach",
                    "authors": [
                      {
                        "name": "Jantje Silomon",
                        "affiliation": "Institute for Peace Research and Security Policy at the University of Hamburg",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The UN Cybercrime Negotiations: Harmonisation and Universality or Polarisation and Fragmentation?",
                    "authors": [
                      {
                        "name": "Tatiana Tropina",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Business as Usual or New Forms of Collaboration? Non-State Actors in UN Cybercrime Governance",
                    "authors": [
                      {
                        "name": "Lena Herbst",
                        "affiliation": "Technical University Braunschweig",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "13h",
            "endTime": "14h",
            "items": [
              {
                "kind": "break",
                "title": "Lunch",
                "room": "Cafeteria"
              }
            ]
          },
          {
            "startTime": "14h",
            "endTime": "15h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Weapons of Mass Destruction: Non-Proliferation and Arms Control",
                "room": "Room 3.32 & 3.30",
                "conveners": [
                  {
                    "name": "Kristin Ven Bruusgaard",
                    "affiliation": "University of Oslo"
                  },
                  {
                    "name": "Michal Onderco",
                    "affiliation": "Erasmus University Rotterdam"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Possible Impact of Sole Purpose Policy on the NATO Alliance",
                    "authors": [
                      {
                        "name": "Aylin Matlé",
                        "affiliation": "German Council on Foreign Relations (DGAP)",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The US Rebalancing from Europe to the Indo-Pacific: Risks for Deterrence Failure and Inadvertent Escalation",
                    "authors": [
                      {
                        "name": "Paul van Hooft",
                        "affiliation": "Hague Centre for Strategic Studies/Royal Dutch Military Academy",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Ideology and Risk: The Neuroscience of Nuclear Reversal",
                    "authors": [
                      {
                        "name": "Rupal N. Mehta",
                        "affiliation": "University of Nebraska-Lincoln",
                        "isSpeaker": true
                      },
                      {
                        "name": "Noelle Troutman",
                        "affiliation": "University of Nebraska-Lincoln"
                      }
                    ]
                  },
                  {
                    "title": "The Lesser Evil? Experimental Evidence on Nuclear and Chemical Weapon 'Taboos'",
                    "authors": [
                      {
                        "name": "Michal Smetana",
                        "affiliation": "Charles University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Marek Vranka",
                        "affiliation": "Charles University"
                      },
                      {
                        "name": "Ondrej Rosendorf",
                        "affiliation": "Peace Research Center Prague"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Foreign Information Influence as an (Inter)National Security Threat",
                "room": "Forum",
                "conveners": [
                  {
                    "name": "Charlotte Wagnsson",
                    "affiliation": "Swedish Defence University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Does Russian Antagonistic Strategic Narration Trigger Destabilising Psychological Effects? An Experimental Study in Sweden and the Netherlands",
                    "authors": [
                      {
                        "name": "Aiden Hoyle",
                        "affiliation": "University of Amsterdam",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "News Media and (In)Security in Ukrainian Border Regions: An Assessment of Threats and Vulnerabilities",
                    "authors": [
                      {
                        "name": "Joanna Szostek",
                        "affiliation": "Glasgow University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "How RT and Sputnik Cover the News in Mali: a Textual Analysis of Russia's Information Influence in Francophone Africa",
                    "authors": [
                      {
                        "name": "Maxime Audinet",
                        "affiliation": "Institute for Strategic Research (IRSEM)",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Online Reception of Russia and Chinese News Coverage of the US 2020 Election",
                    "authors": [
                      {
                        "name": "Thomas Colley",
                        "affiliation": "Royal Military Academy, Sandhurst",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15h30",
            "endTime": "16h",
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break",
                "room": "Cafeteria"
              }
            ]
          },
          {
            "startTime": "16h",
            "endTime": "17h30",
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 3: Devising an Effective Publication Strategy",
                "room": "Forum",
                "conveners": [
                  {
                    "name": "Silvia D'Amato",
                    "affiliation": "Leiden University"
                  }
                ],
                "discussants": [
                  {
                    "name": "Sarah Kreps",
                    "affiliation": "associate editor for International Security in the Cambridge Elements series, Cornell University"
                  },
                  {
                    "name": "Joe Maiolo",
                    "affiliation": "Editor-in-Chief, Journal of Strategic Studies & member of the Editorial Board, Intelligence & National Security"
                  },
                  {
                    "name": "Mathilde von Bulow",
                    "affiliation": "Editor, War in History"
                  },
                  {
                    "name": "Eirini Karamouzi",
                    "affiliation": "Former Book Editor, Cold War History"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17h30",
            "endTime": "17h45",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Award of the European Security Studies Best Paper Prize",
                "room": "Forum"
              }
            ]
          },
          {
            "startTime": "17h45",
            "endTime": "18h",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Concluding Remarks",
                "room": "Forum",
                "conveners": [
                  {
                    "name": "Marina Henke",
                    "affiliation": "Hertie School"
                  },
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Director of EISS / Sciences Po"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "18h",
            "items": [
              {
                "kind": "break",
                "title": "Cocktail",
                "room": "Maximilians, Friedrichstraße 185-190, 10117 Berlin"
              }
            ]
          }
        ]
      }
    ],
    "sourceNote": "Transcribed from the authoritative final 'EISS-2022-Final-Programme.pdf' (Drive id 13FcJuHtOorvIv3rnHgR0jR9B68UuNsYM). 12 thematic panels, 3 professional-development roundtables (Roundtable 1 War in Ukraine, Roundtable 2 Academic Job Market, Roundtable 3 Publication Strategy), intro/concluding remarks, and the European Security Studies Best Paper Prize award. The unrealised Josep Borrell keynote from the preliminary programme is not present in this final version and is omitted. Email addresses and the registration line excluded per the hard rules.",
    "uncertain": [
      "2022 paper titles in the detailed programme render with stray zero-width/combining marks between words in the source extraction; transcribed as plain spaced titles.",
      "Wolfgang Wagner's first paper is printed '(et al.)' for co-authors who are not individually named in the programme; only Wagner is recorded."
    ]
  },
  "2023": {
    "slug": "2023",
    "year": 2023,
    "edition": "2023 Annual Conference",
    "venue": "Institut Barcelona d'Estudis Internacionals (IBEI), Universitat Pompeu Fabra - Campus de la Ciutadella, C/ de Ramon Trias Fargas, 25",
    "city": "Barcelona",
    "country": "Spain",
    "dates": "29-30 June 2023",
    "startDate": "2023-06-29",
    "endDate": "2023-06-30",
    "sourceNote": "Transcribed from Drive 'Final Programme EISS 2023.pdf' .docx twin (id 17MsgObxcnUw9ewyTwauxIi1SEku1hfnF), version v.1.4.2 - 26/06/23, using the Detailed Programme section.",
    "uncertain": [],
    "days": [
      {
        "date": "2023-06-29",
        "label": "Day 1 — Thursday 29 June",
        "rows": [
          {
            "startTime": "09h00",
            "endTime": "09h30",
            "items": [
              {
                "kind": "break",
                "title": "Registration and Coffee",
                "room": "Main Hall (Roger de Llúria 40)"
              }
            ]
          },
          {
            "startTime": "09h30",
            "endTime": "09h45",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Introductory Remarks",
                "room": "Room 40.063 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Director of EISS / Sciences Po"
                  },
                  {
                    "name": "Elisabeth Johansson-Nogués",
                    "affiliation": "IBEI"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "09h45",
            "endTime": "10h55",
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 1: War, Coercion and Statecraft (Hybrid & Recorded)",
                "room": "Room 40.063 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Tim Sweijs",
                    "affiliation": "Netherlands' War Studies Research Centre / The Hague Centre for Strategic Studies"
                  }
                ],
                "discussants": [
                  {
                    "name": "Peter Viggo Jakobsen",
                    "affiliation": "Royal Danish Defence College, Center for War Studies, University of Southern Denmark (Online)"
                  },
                  {
                    "name": "Kristin Ven Bruusgaard",
                    "affiliation": "Norwegian Intelligence School"
                  },
                  {
                    "name": "Luis Simon",
                    "affiliation": "Vrije Universiteit Brussel"
                  },
                  {
                    "name": "Clara Portela",
                    "affiliation": "University of Valencia (Online)"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11h00",
            "endTime": "12h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Defense Cooperation and Military Assistance",
                "room": "Room 40.063 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Antonio Calcara",
                    "affiliation": "University of Antwerp"
                  }
                ],
                "contributions": [
                  {
                    "title": "Changing Threat Perceptions and American Grand Strategy: Evidence from Maritime Military Exercises",
                    "authors": [
                      {
                        "name": "Peter Dombrowski",
                        "affiliation": "U.S. Naval War College",
                        "isSpeaker": true
                      },
                      {
                        "name": "Simon Reich",
                        "affiliation": "Rutgers / Sciences Po"
                      }
                    ]
                  },
                  {
                    "title": "Alliance Cohesion and Military Manoeuvres: A Signal of Deterrence or Assurance?",
                    "authors": [
                      {
                        "name": "Margit Bussmann",
                        "affiliation": "University of Greifswald",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Mightier Yet?: Explaining British Military Underconfidence in Reference to Anglo-American Alliance Formation",
                    "authors": [
                      {
                        "name": "Sylvain Thoni",
                        "affiliation": "Radboud University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Military Assistance Within the Framework of the Defence of the Liberal International Order: How Does Military Assistance to Ukraine Fit into US Grand Strategy?",
                    "authors": [
                      {
                        "name": "Rocío Vales Calderón",
                        "affiliation": "Universidad Pablo de Olavide",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "(In)security and Organized Crime in Latin America",
                "room": "Room 40.152 (Roger de Llúria 40, 1st floor)",
                "conveners": [
                  {
                    "name": "Margarita Petrova",
                    "affiliation": "IBEI"
                  }
                ],
                "contributions": [
                  {
                    "title": "Criminal Governance Amid the COVID-19 Pandemic in Mexico",
                    "authors": [
                      {
                        "name": "Lucia Tiscornia",
                        "affiliation": "University College Dublin",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Violent and Non-Violent Mobilization in Criminal Wars: Current Determinants and Historical Legacies",
                    "authors": [
                      {
                        "name": "Juan Masullo",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Not War Nor Peace: Regulating the Use of Force in the Context of Large-Scale Criminal",
                    "authors": [
                      {
                        "name": "Miriam Bradley",
                        "affiliation": "University of Manchester",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Development Aid, Humanitarian Assistance, and Criminal Violence: A \"Triple Nexus\" for Central America's Northern Triangle?",
                    "authors": [
                      {
                        "name": "Pablo Kalmanovitz",
                        "affiliation": "Instituto Tecnológico Autónomo de México (ITAM)",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12h30",
            "endTime": "13h30",
            "items": [
              {
                "kind": "break",
                "title": "Lunch",
                "room": "Exhibition Hall (Basement)"
              }
            ]
          },
          {
            "startTime": "13h30",
            "endTime": "14h55",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Interventions",
                "room": "Room 40.063 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Silvia D'Amato",
                    "affiliation": "Leiden University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Who Supports Policy Interventions to Terminate Civil Wars? Survey Evidence from The United States and Germany",
                    "authors": [
                      {
                        "name": "Martijn Vlaskamp",
                        "affiliation": "IBEI",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Bringing the Troops Back Home: A Strategy Adaptation Under Adverse Conditions",
                    "authors": [
                      {
                        "name": "Matus Halas",
                        "affiliation": "Institute of International Relations, Prague",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Russian Invasion and the Changing Character of Proxy War: Toward a Comprehensive Framework",
                    "authors": [
                      {
                        "name": "Michel Wyss",
                        "affiliation": "Military Academy at ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Private Actors, Armed Conflict and the State",
                "room": "Room 40.152 (Roger de Llúria 40, 1st floor)",
                "conveners": [
                  {
                    "name": "Juan Masullo",
                    "affiliation": "Leiden University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Alliance Formation and Rebel Co-Governance in North-East Syria: The Case of the PYD and the Syriac Union Party",
                    "authors": [
                      {
                        "name": "Andrea Novellis",
                        "affiliation": "University of Milan",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Resident Resistance: The Territorial Logic of Denouncing Organized Crime Groups in Rio de Janeiro",
                    "authors": [
                      {
                        "name": "Nicholas Barnes",
                        "affiliation": "University of St Andrews",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "In the Crevices of the State: Criminal Governance in Uruguay",
                    "authors": [
                      {
                        "name": "Lucia Tiscornia",
                        "affiliation": "University College Dublin",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Rebel Governance as Self-Legitimation: The FARC's Justifications of Governance",
                    "authors": [
                      {
                        "name": "Wolfgang Minatti",
                        "affiliation": "European University Institute",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15h00",
            "endTime": "16h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Technology",
                "room": "Room 40.063 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Dominika Kunertova",
                    "affiliation": "ETH Zurich"
                  }
                ],
                "contributions": [
                  {
                    "title": "Winning by Adapting: Battlefield Adaptation in the Long Russo-Ukrainian War",
                    "authors": [
                      {
                        "name": "Marc DeVore",
                        "affiliation": "University of St Andrews",
                        "isSpeaker": true
                      },
                      {
                        "name": "Taras Fedirko",
                        "affiliation": "University of Glasgow"
                      },
                      {
                        "name": "Kristen Harkness",
                        "affiliation": "University of St Andrews"
                      },
                      {
                        "name": "Michael Hunzeker",
                        "affiliation": "George Mason University"
                      }
                    ]
                  },
                  {
                    "title": "Must the Drone Always Get Through? Coercion and One-Way Attack UAVs in Ukraine and Yemen",
                    "authors": [
                      {
                        "name": "Marcel Plichta",
                        "affiliation": "University of St Andrews",
                        "isSpeaker": true
                      },
                      {
                        "name": "Ash Rossiter",
                        "affiliation": "Khalifa University"
                      }
                    ]
                  },
                  {
                    "title": "The Shock of the Old in the Russo-Ukraine War? Misunderstanding Continuity, Change and Adaptation of Military Technology Under Fire",
                    "authors": [
                      {
                        "name": "Brendan Flynn",
                        "affiliation": "University of Galway / Ollscoil na Gaillimhe",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Civil-Military Relations in Challenging Times",
                "room": "Room 40.152 (Roger de Llúria 40, 1st floor)",
                "conveners": [
                  {
                    "name": "Stephen Saideman",
                    "affiliation": "Carleton University"
                  }
                ],
                "contributions": [
                  {
                    "title": "NGO-Military Cooperation And Civilian Protection Policies",
                    "authors": [
                      {
                        "name": "Daphné Charotte",
                        "isSpeaker": true
                      },
                      {
                        "name": "Francesca Colli"
                      },
                      {
                        "name": "Yf Reykers",
                        "affiliation": "Maastricht University"
                      }
                    ]
                  },
                  {
                    "title": "From the Bottom-Up: AI and Military Officers in Defence Alliances",
                    "authors": [
                      {
                        "name": "Vicky Karyoti",
                        "affiliation": "Swedish Institute of International Affairs",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Civilian Control Of The Military: Performance Management Reforms And Its Effects On The Military Profession In Sweden",
                    "authors": [
                      {
                        "name": "Sofia Ledberg",
                        "affiliation": "Swedish Defence University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "What are Defence Agencies Supposed To Do? Oversee or Protect The Armed Force",
                    "authors": [
                      {
                        "name": "Stephen Saideman",
                        "affiliation": "Carleton University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "16h30",
            "endTime": "17h00",
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break",
                "room": "Exhibition Hall (Basement)"
              }
            ]
          },
          {
            "startTime": "17h00",
            "endTime": "18h25",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "European Security",
                "room": "Room 40.063 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Sarka Kolmasova",
                    "affiliation": "Metropolitan University Prague"
                  }
                ],
                "contributions": [
                  {
                    "title": "Parliamentary Acceptance of EU Military Operations in Member States: Beyond Rubber-stamping?",
                    "authors": [
                      {
                        "name": "Eva Michaels",
                        "affiliation": "IBEI",
                        "isSpeaker": true
                      },
                      {
                        "name": "Robert Kissack",
                        "affiliation": "IBEI"
                      },
                      {
                        "name": "Oscar Fernandez",
                        "affiliation": "IBEI"
                      }
                    ]
                  },
                  {
                    "title": "European Approaches to Chinese Foreign Policy: a Text-as-Data Approach",
                    "authors": [
                      {
                        "name": "Jordan Becker",
                        "affiliation": "Brussels School of Governance",
                        "isSpeaker": true
                      },
                      {
                        "name": "Andreea Budeanu",
                        "affiliation": "Brussels School of Governance"
                      },
                      {
                        "name": "Haemin Jee",
                        "affiliation": "United States Military Academy, West Point"
                      },
                      {
                        "name": "Maxwell Love",
                        "affiliation": "United States Military Academy, West Point"
                      }
                    ]
                  },
                  {
                    "title": "The Role of National Secondments for Intelligence Support to EU Foreign Policymaking",
                    "authors": [
                      {
                        "name": "Daniel Neumann",
                        "affiliation": "King's College London",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Politics of Sympathy Among NATO Member States",
                    "authors": [
                      {
                        "name": "Simon Koschut",
                        "affiliation": "Zeppelin University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Intelligence",
                "room": "Room 40.152 (Roger de Llúria 40, 1st floor)",
                "conveners": [
                  {
                    "name": "Kristin Ven Bruusgaard",
                    "affiliation": "Norwegian Intelligence School"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Intelligence Community as a Normative Actor under International Law",
                    "authors": [
                      {
                        "name": "Sophie Duroy",
                        "affiliation": "KFG Berlin-Potsdam Research Group",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Effects of Open Source Satellite Imagery on Nuclear Verification",
                    "authors": [
                      {
                        "name": "Alexander Bollfrass",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      },
                      {
                        "name": "Stephen Herzog",
                        "affiliation": "ETH Zurich"
                      }
                    ]
                  },
                  {
                    "title": "On the Institutional Battlefield of Intelligence Oversight: The Case of Questioned Democratic Accountability in The Danish Intelligence Services",
                    "authors": [
                      {
                        "name": "Melanie Hartvigsen",
                        "affiliation": "University of Southern Denmark",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Complexity of the Grey-Zone: The Experience of Military Intelligence on NATO's North-Eastern Flank",
                    "authors": [
                      {
                        "name": "Bram Spoor",
                        "affiliation": "Joint Istar Command, Netherlands Army & Netherlands Defence Academy",
                        "isSpeaker": true
                      },
                      {
                        "name": "Sebastiaan Rietjens",
                        "affiliation": "Netherlands Defence Academy and Leiden University"
                      },
                      {
                        "name": "Erik De Waard",
                        "affiliation": "Netherlands Defence Academy"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "18h30",
            "endTime": "19h45",
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 2: Publishing and Preparing for the Academic Job Market (Hybrid & Recorded)",
                "room": "Room 40.063 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Nicolas Blarel",
                    "affiliation": "Leiden University"
                  }
                ],
                "discussants": [
                  {
                    "name": "Angela Chnapko",
                    "affiliation": "Senior Editor at Oxford University Press (Online)"
                  },
                  {
                    "name": "Jacqueline Hazelton",
                    "affiliation": "Belfer Center, Executive Editor at International Security (Online)"
                  },
                  {
                    "name": "Olivier Schmitt",
                    "affiliation": "University of Southern Denmark, Associate Editor at European Journal of International Security"
                  },
                  {
                    "name": "Marco Wyss",
                    "affiliation": "Lancaster University, Editor-in-Chief at International Journal of Military History and Historiography"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "date": "2023-06-30",
        "label": "Day 2 — Friday 30 June",
        "rows": [
          {
            "startTime": "09h30",
            "endTime": "10h55",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Challenges and Opportunities for Post-Cold War NATO: How Changes in Alliance Membership, Technology, and Strategic Dynamics Affect Defence and Deterrence in Europe?",
                "room": "Room 40.010 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Marcel Plichta",
                    "affiliation": "University of St Andrews"
                  }
                ],
                "contributions": [
                  {
                    "title": "Re-Bordering NATO: the Strategic Dilemmas of Yesterday and Tomorrow",
                    "authors": [
                      {
                        "name": "Maria Sofia Macedo",
                        "affiliation": "Independent Researcher",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "NATO's Nordic Neophytes: Sweden and Finland's Accession to NATO",
                    "authors": [
                      {
                        "name": "Samuel Seitz",
                        "affiliation": "University of Oxford",
                        "isSpeaker": true
                      },
                      {
                        "name": "Julia Carver",
                        "affiliation": "University of Oxford"
                      }
                    ]
                  },
                  {
                    "title": "A Quiet Place: Assessing SSBN Vulnerability in the Arctic Ocean",
                    "authors": [
                      {
                        "name": "Nicholas Blanchette",
                        "affiliation": "Massachusetts Institute of Technology",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Arms Procurement and Transfers",
                "room": "Room 40.012 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Brendan Flynn",
                    "affiliation": "University of Galway / Ollscoil na Gaillimhe"
                  }
                ],
                "contributions": [
                  {
                    "title": "Engine or Brake? The Franco-German Couple and the Future of the European Defence Industry",
                    "authors": [
                      {
                        "name": "Antonio Calcara",
                        "affiliation": "University of Antwerp",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "EU Arms Collaboration and Procurement: The Impact of the War in Ukraine",
                    "authors": [
                      {
                        "name": "Jonata Anicetti",
                        "affiliation": "Metropolitan University Prague",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Arms Purchases in the Baltic States and Transfers to Ukraine: Balancing National Security Interests",
                    "authors": [
                      {
                        "name": "Donatas Palavenis",
                        "affiliation": "Baltic Institute of Advanced Technology",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11h00",
            "endTime": "12h30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Intelligence Success and Failure in Historical Perspective: Lessons from Beyond the Anglo-Sphere",
                "room": "Room 40.010 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Eva Michaels",
                    "affiliation": "IBEI"
                  }
                ],
                "contributions": [
                  {
                    "title": "Between Manipulation and Failed Adaptation: The Italian Intelligence and the Rise of Right-Wing Terrorism, 1969-1982",
                    "authors": [
                      {
                        "name": "Niccolò Petrelli",
                        "affiliation": "Roma Tre University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Failure Before 1973: Israel's Intelligence Failure in 1967",
                    "authors": [
                      {
                        "name": "Gil-li Vardi",
                        "affiliation": "Stanford University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Intelligence under Dictatorship and Democracy",
                    "authors": [
                      {
                        "name": "Zakia Shiraz",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Apartheid South Africa's Intelligence Failures: Angola 1975, and Beyond",
                    "authors": [
                      {
                        "name": "Kyle Harmse",
                        "affiliation": "Stanford University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Addressing Wicked Problems in Cyber Conflict",
                "room": "Room 40.012 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Julia Carver",
                    "affiliation": "University of Oxford"
                  }
                ],
                "contributions": [
                  {
                    "title": "Numbers, Prediction and Cyberwar: Why Integrating the Cyber Domain in Kinetic Wargames Is So Difficult and What Can Be Done",
                    "authors": [
                      {
                        "name": "Peadar Callaghan",
                        "affiliation": "Games Lab, Tallinn University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Overcoming Obstacles: Reflections on Creating a Cross-National Experimental Cyber Security Research",
                    "authors": [
                      {
                        "name": "Ayhan Gucuyener",
                        "affiliation": "Kadir Has University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "A Lesser Evil: Why Democracies Struggle to Respond to Cyber-Enabled Election Interference",
                    "authors": [
                      {
                        "name": "Arthur Laudrain",
                        "affiliation": "University of Oxford",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Normative Power of the Factual: How State Practice Shapes Understandings About Direct Public Political Attribution of Cyber Operations",
                    "authors": [
                      {
                        "name": "Christina Rupp",
                        "affiliation": "Stiftung Neue Verantwortung",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12h30",
            "endTime": "13h30",
            "items": [
              {
                "kind": "break",
                "title": "Lunch",
                "room": "Exhibition Hall (Basement)"
              }
            ]
          },
          {
            "startTime": "13h30",
            "endTime": "14h55",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Weapons of Mass Destruction: Non-Proliferation and Arms Control",
                "room": "Room 40.010 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Elisabeth Roehrlich",
                    "affiliation": "University of Vienna"
                  }
                ],
                "contributions": [
                  {
                    "title": "Populist Publics and Nuclear Weapons: Does Populism Predict Higher Nuclear Use Willingness, but also Opposition to Nuclear Sharing?",
                    "authors": [
                      {
                        "name": "Tom Etienne",
                        "affiliation": "University of Pennsylvania",
                        "isSpeaker": true
                      },
                      {
                        "name": "Michal Onderco",
                        "affiliation": "Erasmus University Rotterdam"
                      },
                      {
                        "name": "Sandra Destradi",
                        "affiliation": "Albert-Ludwigs-Universität Freiburg"
                      },
                      {
                        "name": "Andre Krouwel",
                        "affiliation": "VU University Amsterdam"
                      }
                    ]
                  },
                  {
                    "title": "Proliferation-Related Legislation in the EU: Is There a Need for Further Convergence?",
                    "authors": [
                      {
                        "name": "Barry de Vries",
                        "affiliation": "Justus-Liebig University Giessen",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "How Russia's War on Ukraine has an Impact on the EU's Nuclear Disarmament Policy",
                    "authors": [
                      {
                        "name": "Aderito Vicente",
                        "affiliation": "Odesa Center for Nonproliferation",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Re-Visiting the Political Economy of Security",
                "room": "Room 40.012 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Moritz Weiss",
                    "affiliation": "LMU Munich"
                  }
                ],
                "contributions": [
                  {
                    "title": "Industries of Sovereignty: Strategic Autonomy, Defence Industrial Interests and the French Government's Use of the \"European Sovereignty\" Discourse in EU Politics (2017-22)",
                    "authors": [
                      {
                        "name": "Salih Isik Bora",
                        "affiliation": "Sciences Po",
                        "isSpeaker": true
                      },
                      {
                        "name": "Ediz Topcuoglu",
                        "affiliation": "College of Europe"
                      }
                    ]
                  },
                  {
                    "title": "The US Hegemony Dilemma and European Missile Production",
                    "authors": [
                      {
                        "name": "Lucas Hellemeier",
                        "affiliation": "FU Berlin",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Outsourcing Security, Managing Risk: National Security States and the Privatisation of Defence Research",
                    "authors": [
                      {
                        "name": "Kaija Schilde",
                        "affiliation": "Boston University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The United States and the Eternal Dream of Missile Defence",
                    "authors": [
                      {
                        "name": "Sanne Verschuren",
                        "affiliation": "Sciences Po Paris",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15h00",
            "endTime": "15h30",
            "items": [
              {
                "kind": "session",
                "title": "Poster Session",
                "room": "Room 40.010 (Roger de Llúria 40)"
              }
            ]
          },
          {
            "startTime": "15h30",
            "endTime": "16h00",
            "items": [
              {
                "kind": "break",
                "title": "Coffee Break",
                "room": "Exhibition Hall (Basement)"
              }
            ]
          },
          {
            "startTime": "16h00",
            "endTime": "17h10",
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 3: Gendered Exclusion and Discrimination in Academia (Hybrid & Recorded)",
                "room": "Room 40.010 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Director of EISS / Sciences Po"
                  }
                ],
                "discussants": [
                  {
                    "name": "Annick Wibben",
                    "affiliation": "Swedish Defence University (Online)"
                  },
                  {
                    "name": "Vanessa Newby",
                    "affiliation": "Leiden University (Online)"
                  },
                  {
                    "name": "Stephen Saideman",
                    "affiliation": "Carleton University"
                  },
                  {
                    "name": "Chiara Ruffa",
                    "affiliation": "Sciences Po"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17h15",
            "endTime": "18h40",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Alliance Management",
                "room": "Room 40.010 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Jeffrey Michaels",
                    "affiliation": "IBEI"
                  }
                ],
                "contributions": [
                  {
                    "title": "Credibility in Crises: How Patrons Reassure in Crises",
                    "authors": [
                      {
                        "name": "Lauren Sukin",
                        "affiliation": "London School of Economics and Political Science",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Allied Defence Dilemma: Balancing between Autonomy and Alliance Cohesion",
                    "authors": [
                      {
                        "name": "Lotje Boswinkel",
                        "affiliation": "Centre for Security, Diplomacy and Strategy, Brussels",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "NATO and Multi-Domain Operations: Between Deterrence and Conflict",
                    "authors": [
                      {
                        "name": "Mauro Gilli",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      },
                      {
                        "name": "Andrea Gilli",
                        "affiliation": "NATO Defence College"
                      },
                      {
                        "name": "Nina Silove",
                        "affiliation": "ETH Zurich"
                      }
                    ]
                  },
                  {
                    "title": "US Preponderance in NATO: The Role of Logistics, Intelligence, Training, Cyber, and Coordination",
                    "authors": [
                      {
                        "name": "Alexandra Chinchilla",
                        "affiliation": "Texas A&M University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Jordan Becker",
                        "affiliation": "United States Military Academy, West Point"
                      },
                      {
                        "name": "Stephen Brooks",
                        "affiliation": "Dartmouth College"
                      },
                      {
                        "name": "Hugo Meijer",
                        "affiliation": "Sciences Po"
                      },
                      {
                        "name": "William Wohlforth",
                        "affiliation": "Dartmouth College"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Psychology and Emotions in War and Strategy",
                "room": "Room 40.012 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Katerina Krulisova",
                    "affiliation": "Nottingham Trent University"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Psychological, Social, and Strategic Value of Care During Crises and its Limits",
                    "authors": [
                      {
                        "name": "Claire Yorke",
                        "affiliation": "University of Southern Denmark",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Can Passions Help to Justify War? The Case of Revenge and Fear",
                    "authors": [
                      {
                        "name": "Marie Robin",
                        "affiliation": "Université Paris Panthéon-Assas",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Approach-Avoidance Tension: A Fundamental Question of Military",
                    "authors": [
                      {
                        "name": "Samuel Zilincik",
                        "affiliation": "Masaryk / Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Cognitive Warfare as Part of Society: A Never-Ending Battle for Minds",
                    "authors": [
                      {
                        "name": "Robin Burda",
                        "affiliation": "Masaryk University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "18h45",
            "endTime": "19h00",
            "items": [
              {
                "kind": "session",
                "title": "Award of the European Security Studies Best Paper Prize",
                "room": "Room 40.010 (Roger de Llúria 40)"
              }
            ]
          },
          {
            "startTime": "19h00",
            "endTime": "19h15",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Concluding Remarks",
                "room": "Room 40.010 (Roger de Llúria 40)",
                "conveners": [
                  {
                    "name": "Elisabeth Johansson-Nogués",
                    "affiliation": "IBEI"
                  },
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Director of EISS / Sciences Po"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "19h15",
            "items": [
              {
                "kind": "break",
                "title": "Cocktail",
                "room": "Jardí de les Aigües (Ramon Turro 13)"
              }
            ]
          }
        ]
      }
    ]
  },
  "2024": {
    "slug": "2024",
    "year": 2024,
    "edition": "2024 Annual Conference",
    "venue": "Institute of Political Studies, Faculty of Social Sciences, Charles University, Ovocný trh 560/5, 110 00 Staré Město",
    "city": "Prague",
    "country": "Czechia",
    "dates": "27-28 June 2024",
    "startDate": "2024-06-27",
    "endDate": "2024-06-28",
    "sourceNote": "Transcribed from Drive 'EISSprogram2024R2.pdf' (id 1l5Dso7FBq5REvlEZvuGGK-7154s4OtpZ), using the at-a-glance grid plus the Day 1 / Day 2 Detailed Programme sections.",
    "uncertain": [
      "Day 1 'Military Interventions' panel: the contribution 'The Utility of Foreign Volunteers in Ukraine' has no author printed in the source text (table layout dropped it).",
      "The four named coordinating-committee members appear in the header; 'Eliza Gheorge' is read as printed (likely Eliza Gheorghe).",
      "Keynote: source text shows a stray 'Chair: Richard Wrangham' line, treated as a parse artifact of the table; Wrangham recorded as the keynote speaker with no separate chair."
    ],
    "keynotes": [
      {
        "speaker": "Richard Wrangham",
        "affiliation": "Harvard University",
        "title": "The Evolutionary Anthropology of War"
      }
    ],
    "days": [
      {
        "date": "2024-06-27",
        "label": "Day 1 — Thursday 27 June",
        "rows": [
          {
            "startTime": "9:00",
            "endTime": "9:30",
            "items": [
              {
                "kind": "break",
                "title": "Registration and Coffee"
              }
            ]
          },
          {
            "startTime": "9:30",
            "endTime": "9:45",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Introductory Remarks",
                "room": "Small Hall",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Director of EISS / Sciences Po"
                  },
                  {
                    "name": "Vit Stritecky",
                    "affiliation": "Charles University"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "9:45",
            "endTime": "10:55",
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 1: Debating the Future of War (Hybrid & Recorded)",
                "room": "Small Hall",
                "conveners": [
                  {
                    "name": "Tim Sweijs",
                    "affiliation": "Netherlands' War Studies Research Centre / The Hague Centre for Strategic Studies"
                  }
                ],
                "discussants": [
                  {
                    "name": "Isabelle Duyvesteyn",
                    "affiliation": "Leiden University"
                  },
                  {
                    "name": "Henrik Breitenbauch",
                    "affiliation": "Royal Danish Defence College"
                  },
                  {
                    "name": "Janani Mohan",
                    "affiliation": "Cambridge University"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11:00",
            "endTime": "12:25",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Defence Cooperation and Military Assistance 1",
                "room": "Small Hall",
                "conveners": [
                  {
                    "name": "Isabelle Duyvesteyn",
                    "affiliation": "Leiden University"
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Actors, Interests and Interdependencies in East Asian Security Competition",
                "room": "Hall of Patriots",
                "conveners": [
                  {
                    "name": "Samuel Seitz",
                    "affiliation": "Oxford University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Navigating the Indo-Pacific: A Comparative Analysis of ASEAN and Quad Frameworks",
                    "authors": [
                      {
                        "name": "Giorgia Piovesan",
                        "affiliation": "University of Glasgow",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Multilateral Maritime Exercises and Strategic Change: The American Case and Beyond",
                    "authors": [
                      {
                        "name": "Peter Dombrowski",
                        "affiliation": "U.S. Naval War College",
                        "isSpeaker": true
                      },
                      {
                        "name": "Simon Reich",
                        "affiliation": "Sciences Po / Rutgers"
                      }
                    ]
                  },
                  {
                    "title": "Sino-Russian joint military exercises in focus: New strategic confluences in the Asia-Pacific",
                    "authors": [
                      {
                        "name": "Jerome Gapany",
                        "affiliation": "Military Academy at ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Toward a Novel Conception of Naval Strategy for Small Countries",
                    "authors": [
                      {
                        "name": "Friso Stevens",
                        "affiliation": "University of Helsinki",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Inter-alliance Security Dilemmas: Korean Counterforce Systems and Their Effect on the Sino-American Nuclear Competition",
                    "authors": [
                      {
                        "name": "Samuel Seitz",
                        "affiliation": "Oxford University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Developing digital peripheries for strategic advantage: Competitive cyber capacity building assistance initiatives in Africa",
                    "authors": [
                      {
                        "name": "Julia Carver",
                        "affiliation": "Oxford University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Predicting East Asian Security Competition in the 21st Century: A Regional Approach",
                    "authors": [
                      {
                        "name": "Chelsea Thorpe",
                        "affiliation": "Cambridge University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Small Islands, Big Potential: A Taiwan Contingency, Alliance Politics, and the Defence of Remote Islands with Large Stake",
                    "authors": [
                      {
                        "name": "Takuya Matsuda",
                        "affiliation": "University of Tokyo",
                        "isSpeaker": true
                      },
                      {
                        "name": "Elliot Ji",
                        "affiliation": "Princeton University"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12:30",
            "endTime": "13:30",
            "items": [
              {
                "kind": "break",
                "title": "Lunch"
              }
            ]
          },
          {
            "startTime": "13:30",
            "endTime": "14:55",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Interventions",
                "room": "Hall of Patriots",
                "conveners": [
                  {
                    "name": "Kersti Larsdotter",
                    "affiliation": "Swedish Defence University"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Utility of Foreign Volunteers in Ukraine",
                    "authors": []
                  },
                  {
                    "title": "Contesting 'Zeitenwende': Political Contestation and Partisan Entrapment",
                    "authors": [
                      {
                        "name": "Marius Ghincea",
                        "affiliation": "European University Institute",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Military intervention in foreign policy-making: Principal-agent analysis of US troop withdrawal from Korea, 1977-1979",
                    "authors": [
                      {
                        "name": "Juhong Park",
                        "affiliation": "University of Bath",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "When Does Vladimir Putin Send Troops to Fight Abroad?",
                    "authors": [
                      {
                        "name": "Simon Saradzhyan",
                        "affiliation": "Harvard University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Private Actors, Armed Conflict and the State",
                "room": "Small Hall",
                "conveners": [
                  {
                    "name": "Andreas Kruck",
                    "affiliation": "Ludwig Maximilians University"
                  }
                ],
                "contributions": [
                  {
                    "title": "EU's Use of Private Military and Security Companies' Services: Filling the Capabilities- and Consensus-Expectation Gaps?",
                    "authors": [
                      {
                        "name": "Oldrich Bures",
                        "affiliation": "Metropolitan University Prague",
                        "isSpeaker": true
                      },
                      {
                        "name": "Eugenio Cusumano",
                        "affiliation": "Università degli Studi di Messina"
                      }
                    ]
                  },
                  {
                    "title": "Hybrid axis of evil. Policing of organised crime and state threats in global ports",
                    "authors": [
                      {
                        "name": "Yarin Eski",
                        "affiliation": "Vrije Universiteit Amsterdam",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The financing of contemporary mercenarism: resources, routes, and regulation",
                    "authors": [
                      {
                        "name": "Jovana Jezdimirovic Ranito",
                        "affiliation": "University of Twente",
                        "isSpeaker": true
                      },
                      {
                        "name": "Sorcha MacLeod",
                        "affiliation": "University of Copenhagen"
                      }
                    ]
                  },
                  {
                    "title": "Zachariah Parcels & Michel Wyss contribution",
                    "authors": [
                      {
                        "name": "Zachariah Parcels",
                        "affiliation": "Purdue University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Michel Wyss",
                        "affiliation": "Military Academy at ETH Zurich"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15:00",
            "endTime": "16:25",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Technology",
                "room": "Hall of Patriots",
                "conveners": [
                  {
                    "name": "Sanne Verschuren",
                    "affiliation": "Boston University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Artificial Intelligence and Non-linearity: An Analysis of the Limitations of Statistical Learning AI in Warfare",
                    "authors": [
                      {
                        "name": "Alessandra Russo",
                        "affiliation": "Università Cattolica del Sacro Cuore, Milan",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Business power and the quiet politics of military innovation in cyberspace",
                    "authors": [
                      {
                        "name": "Moritz Weiss",
                        "affiliation": "LMU Munich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "AI, private corporate experts, and the competence-control dilemma in military innovation: Explaining reconfigurations of the national security state",
                    "authors": [
                      {
                        "name": "Andrea Johansen",
                        "affiliation": "Ludwig Maximilians University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Andreas Kruck",
                        "affiliation": "Ludwig Maximilians University"
                      }
                    ]
                  },
                  {
                    "title": "Winning the Battle of Adaptation",
                    "authors": [
                      {
                        "name": "Kristen Harkness",
                        "affiliation": "University of St Andrews",
                        "isSpeaker": true
                      },
                      {
                        "name": "Marc DeVore",
                        "affiliation": "University of St Andrews"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Knowledge Production on War",
                "room": "Small Hall",
                "conveners": [
                  {
                    "name": "Matúš Halás",
                    "affiliation": "Institute of International Relations, Prague"
                  }
                ],
                "contributions": [
                  {
                    "title": "Exploring how the emotion of interest shapes strategic studies scholarship (and how we can make the most of it)",
                    "authors": [
                      {
                        "name": "Samuel Zilincik",
                        "affiliation": "University of Defence, Czech Republic",
                        "isSpeaker": true
                      },
                      {
                        "name": "Dagmar Ludackova",
                        "affiliation": "University of Defence, Czech Republic"
                      }
                    ]
                  },
                  {
                    "title": "Envisioning Critical Strategic Studies",
                    "authors": [
                      {
                        "name": "Chiara Libiseller",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Isabelle Duyvesteyn",
                        "affiliation": "Leiden University"
                      }
                    ]
                  },
                  {
                    "title": "Virtually inconceivable? Foregrounding the ontological dimension to cyber strategic studies",
                    "authors": [
                      {
                        "name": "Julia Carver",
                        "affiliation": "Oxford University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Changing Expertise: Knowledge Production through Artificial Intelligence in the Military Domain",
                    "authors": [
                      {
                        "name": "Alies Jansen",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "16:30",
            "endTime": "17:00",
            "items": [
              {
                "kind": "session",
                "title": "Poster Session / Coffee Break",
                "contributions": [
                  {
                    "title": "Investigating Perspectives of (In)Security of Affected Individuals in Afghanistan under The Taliban Rule: A Vernacular Security Approach",
                    "authors": [
                      {
                        "name": "Mohammad Mahdi Iraj",
                        "affiliation": "Nagoya University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Structuring the Use of Securitization by Violent Non-state Actors",
                    "authors": [
                      {
                        "name": "Ido Gadi Raz",
                        "affiliation": "The Hebrew University of Jerusalem",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "\"In the mind of the beholder\": a study on coercion and the choice of coercive instruments",
                    "authors": [
                      {
                        "name": "Chiara Boldrini",
                        "affiliation": "Università di Bologna",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17:00",
            "endTime": "18:00",
            "items": [
              {
                "kind": "session",
                "subtype": "keynote",
                "title": "Keynote: The Evolutionary Anthropology of War (Hybrid & Recorded)",
                "room": "Small Hall",
                "contributions": [
                  {
                    "title": "The Evolutionary Anthropology of War",
                    "authors": [
                      {
                        "name": "Richard Wrangham",
                        "affiliation": "Harvard University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "date": "2024-06-28",
        "label": "Day 2 — Friday 28 June",
        "rows": [
          {
            "startTime": "9:00",
            "endTime": "10:25",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 2: Navigating the Job Market (Hybrid & Recorded)",
                "room": "Small Hall",
                "conveners": [
                  {
                    "name": "Nicolas Blarel",
                    "affiliation": "Leiden University"
                  }
                ],
                "discussants": [
                  {
                    "name": "Sanne Verschuren",
                    "affiliation": "Boston University"
                  },
                  {
                    "name": "Alexander Lanoszka",
                    "affiliation": "University of Waterloo"
                  },
                  {
                    "name": "Silvia D'Amato",
                    "affiliation": "Leiden University (online)"
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Terrorism and Counter-terrorism",
                "room": "Hall of Patriots",
                "conveners": [
                  {
                    "name": "Giulia Grillo",
                    "affiliation": "University College London"
                  }
                ],
                "contributions": [
                  {
                    "title": "Organizational Lineage and the Diffusion of Lethal and Non-Lethal Information between Armed Groups",
                    "authors": [
                      {
                        "name": "Evan Perkoski",
                        "affiliation": "University of Connecticut",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Stigmatizing State Sponsors of Terrorism: An Evaluation of Feasibility",
                    "authors": [
                      {
                        "name": "Müberra Dinler",
                        "affiliation": "Charles University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Resilient Body of the State: Imaginary of Cohesive Society in PVE and Countering Hybrid Threats",
                    "authors": [
                      {
                        "name": "Jan Daniel",
                        "affiliation": "Institute of International Relations, Prague",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Role of Narratives in Radicalisation: A Critical Examination of Causality and Agency",
                    "authors": [
                      {
                        "name": "Unaesah Rahmah",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "10:30",
            "endTime": "11:55",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Weapons of Mass Destruction: Non-Proliferation and Arms Control",
                "room": "Hall of Patriots",
                "conveners": [
                  {
                    "name": "Michal Smetana",
                    "affiliation": "Charles University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Temporal Disparities in Intergenerational Justice: A Comparative Analysis of Nuclear Deterrence and Climate Change",
                    "authors": [
                      {
                        "name": "Franziska Stärk",
                        "affiliation": "University of Hamburg",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The inadmissibility of nuclear threats – norm or empty promise?",
                    "authors": [
                      {
                        "name": "Maren Vieluf",
                        "affiliation": "University of Innsbruck",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Re-Emergence of Nuclear-Weapons-Free-Zones in an Era of Heightened Conflict",
                    "authors": [
                      {
                        "name": "Janani Mohan",
                        "affiliation": "Cambridge University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Technocratic view of nuclear sharing",
                    "authors": [
                      {
                        "name": "Michal Onderco",
                        "affiliation": "Erasmus University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Political Economy, Technology and the Defence Industry",
                "room": "Small Hall",
                "conveners": [
                  {
                    "name": "Antonio Calcara",
                    "affiliation": "CSDS Brussels"
                  }
                ],
                "contributions": [
                  {
                    "title": "Defence Offsets and the Global Arms Trade: Explaining Cross-National Variations",
                    "authors": [
                      {
                        "name": "Jonata Anicetti",
                        "affiliation": "Metropolitan University Prague",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Strategic sensemaking: Scanning the military technological edge",
                    "authors": [
                      {
                        "name": "Henrik Breitenbauch",
                        "affiliation": "Royal Danish Defence College",
                        "isSpeaker": true
                      },
                      {
                        "name": "Jens Vesterlund Mathiesen",
                        "affiliation": "Royal Danish Defence College"
                      }
                    ]
                  },
                  {
                    "title": "Exploring the cybersecurity policy design space in the EU: a mixed methods approach based on machine-learning techniques",
                    "authors": [
                      {
                        "name": "Mattia Sguazzini",
                        "affiliation": "University of Genova",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Technological Innovation and national security: Variations in public-private relations in the defense and cybersecurity sectors",
                    "authors": [
                      {
                        "name": "Yagnyashri Kodaru",
                        "affiliation": "LMU",
                        "isSpeaker": true
                      },
                      {
                        "name": "Lorenz Sommer",
                        "affiliation": "LMU"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12:00",
            "endTime": "13:00",
            "items": [
              {
                "kind": "break",
                "title": "Lunch"
              }
            ]
          },
          {
            "startTime": "13:00",
            "endTime": "14:25",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Nuclear Deterrence and Nuclear Strategy in the Third Nuclear Age",
                "room": "Hall of Patriots",
                "conveners": [
                  {
                    "name": "Michal Onderco",
                    "affiliation": "Erasmus University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Public support for arms control in the third nuclear age: New evidence from NATO countries",
                    "authors": [
                      {
                        "name": "Ondřej Rosendorf",
                        "affiliation": "IFSH & PRCP",
                        "isSpeaker": true
                      },
                      {
                        "name": "Michal Smetana",
                        "affiliation": "Charles University"
                      },
                      {
                        "name": "Marek Vranka",
                        "affiliation": "Charles University"
                      }
                    ]
                  },
                  {
                    "title": "The Eternal Promise of Missile Defense",
                    "authors": [
                      {
                        "name": "Sanne Verschuren",
                        "affiliation": "Boston University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Can there be a responsible nuclear weapon state? Understanding the agency and moral relevance of nuclear weapons",
                    "authors": [
                      {
                        "name": "Tim Thies",
                        "affiliation": "University of Hamburg",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Russian nuclear roulette? Elites and public debates on nuclear weapons in Moscow after Ukraine",
                    "authors": [
                      {
                        "name": "Lydia Wachs",
                        "affiliation": "Stockholm University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Maritime security in the Indo-Pacific: Perspectives from the EU",
                "room": "Small Hall",
                "conveners": [
                  {
                    "name": "Manjeet S. Pardesi",
                    "affiliation": "Victoria University of Wellington"
                  }
                ],
                "contributions": [
                  {
                    "title": "Guarding the Maritime Highways: Europe's Role in the Indo-Pacific",
                    "authors": [
                      {
                        "name": "Paul van Hooft",
                        "affiliation": "The Hague Centre for Strategic Studies",
                        "isSpeaker": true
                      },
                      {
                        "name": "Benedetta Girardi",
                        "affiliation": "The Hague Centre for Strategic Studies"
                      },
                      {
                        "name": "Davis Ellison",
                        "affiliation": "The Hague Centre for Strategic Studies"
                      },
                      {
                        "name": "Tim Sweijs",
                        "affiliation": "The Hague Centre for Strategic Studies"
                      }
                    ]
                  },
                  {
                    "title": "The EU in the Indo-Pacific: a security actor sui generis",
                    "authors": [
                      {
                        "name": "Eva Pejsova",
                        "affiliation": "Vrije Universiteit Brussels",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The EU's naval signalling in the Indo-Pacific",
                    "authors": [
                      {
                        "name": "Nicolas Blarel",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Niels van Willigen",
                        "affiliation": "Leiden University"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "14:30",
            "endTime": "15:55",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Defence Cooperation and Military Assistance 2",
                "room": "Hall of Patriots",
                "conveners": [
                  {
                    "name": "Jonata Anicetti",
                    "affiliation": "Metropolitan University Prague"
                  }
                ],
                "contributions": [
                  {
                    "title": "Winning the Battle for Hearts and Minds: U.S. Reassurance During the Russo-Ukrainian War",
                    "authors": [
                      {
                        "name": "Alexander Lanoszka",
                        "affiliation": "University of Waterloo",
                        "isSpeaker": true
                      },
                      {
                        "name": "Stephen Herzog",
                        "affiliation": "ETH Zurich / Harvard Kennedy School"
                      },
                      {
                        "name": "Lauren Sukin",
                        "affiliation": "LSE"
                      }
                    ]
                  },
                  {
                    "title": "International military assistance: a historical and conceptual genealogy",
                    "authors": [
                      {
                        "name": "Thibault Fouillet",
                        "affiliation": "Institut d'Etudes de Stratégie et de Défense, Université Jean Moulin Lyon III",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Trapped in the Strategic Trilemma: Ukraine's role in the Black Sea region (2014-2024)",
                    "authors": [
                      {
                        "name": "Viktoriia Vdovychenko",
                        "affiliation": "Cambridge University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Marc De Vore",
                        "affiliation": "St Andrews University"
                      }
                    ]
                  },
                  {
                    "title": "European defence policy changes in response to Russia's 2022 invasion of Ukraine: a 'wake-up call' in practice?",
                    "authors": [
                      {
                        "name": "Michelle Haas",
                        "affiliation": "Ghent University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Intelligence",
                "room": "Small Hall",
                "conveners": [
                  {
                    "name": "Zakia Shiraz",
                    "affiliation": "Leiden University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Proliferation not democratization: open-source intelligence and the war in Ukraine",
                    "authors": [
                      {
                        "name": "Damien Van Puyvelde",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Getting the Revolution in Intelligence Affairs Right: Technological Innovation, Organizational and Operational Adaptation, and Intelligence Effectiveness in the Second Machine Age",
                    "authors": [
                      {
                        "name": "Niccolò Petrelli",
                        "affiliation": "Roma Tre University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "16:00",
            "endTime": "17:15",
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 3: Gender, Inclusion and Diversity in Security Studies (Hybrid & Recorded)",
                "room": "Small Hall",
                "conveners": [
                  {
                    "name": "Šárka Kolmašová",
                    "affiliation": "Metropolitan University Prague"
                  }
                ],
                "discussants": [
                  {
                    "name": "Raffaele Mastrocco",
                    "affiliation": "European University Institute"
                  },
                  {
                    "name": "Federica Cristani",
                    "affiliation": "Institute of International Relations in Prague"
                  },
                  {
                    "name": "Esther Beckley",
                    "affiliation": "Erasmus University"
                  },
                  {
                    "name": "Damien van Puyvelde",
                    "affiliation": "Leiden University"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17:15",
            "endTime": "17:30",
            "items": [
              {
                "kind": "session",
                "title": "Award of the European Security Studies Best Paper Prize (in partnership with the Journal of Strategic Studies)",
                "room": "Small Hall"
              }
            ]
          },
          {
            "startTime": "17:30",
            "endTime": "17:45",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Concluding Remarks",
                "room": "Small Hall",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Director of EISS / Sciences Po"
                  },
                  {
                    "name": "Vit Stritecky",
                    "affiliation": "Representative of Charles University"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "18:00",
            "items": [
              {
                "kind": "break",
                "title": "Cocktail Reception",
                "room": "Small Hall"
              }
            ]
          }
        ]
      }
    ]
  },
  "2025": {
    "slug": "2025",
    "year": 2025,
    "edition": "Annual Conference",
    "venue": "University of Macedonia, Egnatia 156, Thessaloniki 546 36",
    "city": "Thessaloniki",
    "country": "Greece",
    "dates": "26 - 27 June 2025",
    "startDate": "2025-06-26",
    "endDate": "2025-06-27",
    "keynotes": [
      {
        "speaker": "Loukas Tsoukalis",
        "affiliation": "President of the Board, ELIAMEP / Professor, Sciences Po Paris / Professor Emeritus, University of Athens",
        "title": "Will Putin and Trump finally force Europe to behave as a political adult?"
      }
    ],
    "days": [
      {
        "date": "2025-06-26",
        "label": "Day 1 — Thursday 26 June",
        "rows": [
          {
            "startTime": "9:00",
            "endTime": "9:30",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Registration & Coffee",
                "room": "Main Hall & Conference Room Foyer"
              }
            ]
          },
          {
            "startTime": "9:30",
            "endTime": "10:00",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Introductory Remarks",
                "room": "Conference Room “Ilias Koukouvelis” | Hybrid & Recorded",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Director of EISS / Sciences Po Paris"
                  },
                  {
                    "name": "Alexandros Chatzgeorgiou",
                    "affiliation": "Vice-Rector, University of Macedonia"
                  },
                  {
                    "name": "Nicolas Blarel",
                    "affiliation": "EISS / Leiden University"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "10:00",
            "endTime": "11:25",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "title": "Cybersecurity and digital technologies in international security, strategy, and global power relations",
                "room": "Conference Room “Ilias Koukouvelis”",
                "conveners": [
                  {
                    "name": "Julia Carver",
                    "affiliation": "Oxford University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Regulatory Asymmetries in Cryptocurrency Governance: Implications for Sanctions Evasion",
                    "authors": [
                      {
                        "name": "Orfeas Anastasios Koidi",
                        "affiliation": "Rijkuniversiteit Groningen",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Competitive Cyber Statecraft of the Middle-Ground: A Neoclassical Realist Model",
                    "authors": [
                      {
                        "name": "Arthur Laudrain",
                        "affiliation": "King’s College London - Department of War Studies",
                        "isSpeaker": true
                      },
                      {
                        "name": "Joe Devanny",
                        "affiliation": "King’s College London - Department of War Studies"
                      }
                    ]
                  },
                  {
                    "title": "Infrastructural frontlines of (dis)information: data territoriality in the Russian war against Ukraine",
                    "authors": [
                      {
                        "name": "Louis Petiniaud",
                        "affiliation": "GEODE - French Institute of Geopolitics, Paris 8 University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Online military influencers in a social media age",
                    "authors": [
                      {
                        "name": "Anders Puck Nielsen",
                        "affiliation": "Royal Danish Defence College",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11:30",
            "endTime": "13:00",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Technology",
                "room": "Conference Room “Ilias Koukouvelis”",
                "conveners": [
                  {
                    "name": "Sanne Verschuren",
                    "affiliation": "Boston University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Does Preeminence in Emerging and Military Technologies Matter for International Status and Prestige? Experimental Study",
                    "authors": [
                      {
                        "name": "Zakir Rzazade",
                        "affiliation": "Charles University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "What’s Got You So Worried? The Replicator Initiative and US Techno-Anxieties in an Age of Great Power Competition",
                    "authors": [
                      {
                        "name": "Tom Watts",
                        "affiliation": "Royal Holloway, University of London (Leverhulme Early Career Research Fellow)",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Erosion of Traditional Deterrence: Space as a Case Study in Military Transformation",
                    "authors": [
                      {
                        "name": "Raoul Cardellini Leipertz",
                        "affiliation": "LUMSA University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "War and Strategy",
                "room": "Teleconference Room",
                "conveners": [
                  {
                    "name": "Chiara Libiseller",
                    "affiliation": "Leiden University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Reanimating Grand Strategy in Volatile Times",
                    "authors": [
                      {
                        "name": "Alexander Evans",
                        "affiliation": "London School of Economics",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Strategy of Subversion: National Security between Warfare and Diplomacy",
                    "authors": [
                      {
                        "name": "Henrik Breitenbauch",
                        "affiliation": "Royal Danish Defence College",
                        "isSpeaker": true
                      },
                      {
                        "name": "Niels Byrjalsen",
                        "affiliation": "University of Copenhagen"
                      }
                    ]
                  },
                  {
                    "title": "Assisting to Win? Military Assistance and Coercion in War",
                    "authors": [
                      {
                        "name": "Kersti Larsdotter",
                        "affiliation": "Swedish Defense University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "13:00",
            "endTime": "14:00",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Lunch",
                "room": "Main Hall & Conference Room Foyer"
              }
            ]
          },
          {
            "startTime": "14:00",
            "endTime": "15:25",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 1: Nuclear Coercion",
                "room": "Conference Room “Ilias Koukouvelis” | Hybrid & Recorded",
                "conveners": [
                  {
                    "name": "Michal Onderco",
                    "affiliation": "Erasmus University"
                  }
                ],
                "discussants": [
                  {
                    "name": "Kristin Ven Bruusgaard",
                    "affiliation": "Director of the Norwegian Intelligence School"
                  },
                  {
                    "name": "Lydia Wachs",
                    "affiliation": "Stockholm University"
                  },
                  {
                    "name": "Sanne Verschuren",
                    "affiliation": "Boston University"
                  },
                  {
                    "name": "Lauren Sukin",
                    "affiliation": "London School of Economics"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15:30",
            "endTime": "17:00",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Interventions",
                "room": "Conference Room “Ilias Koukouvelis”",
                "conveners": [
                  {
                    "name": "Peter Viggo Jacobsen",
                    "affiliation": "Royal Danish Defence College and University of Southern Denmark"
                  }
                ],
                "contributions": [
                  {
                    "title": "The “Transparent Battlefield” and its Implications for Western Movement and Maneuver Warfighting",
                    "authors": [
                      {
                        "name": "Friso Stevens",
                        "affiliation": "The Hague Centre for Strategic Studies",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Helping your friends in need? Military Interventions and the Reliability of Defense Cooperation Agreements",
                    "authors": [
                      {
                        "name": "Margit Bussmann",
                        "affiliation": "University of Greifswald",
                        "isSpeaker": true
                      },
                      {
                        "name": "Maximilian Krebs",
                        "affiliation": "University of Greifswald"
                      }
                    ]
                  },
                  {
                    "title": "The Resistance Operating Concept’s Deterrent to Impress: Distinct Causal Theories of Success",
                    "authors": [
                      {
                        "name": "Martijn Rouvroije",
                        "affiliation": "Netherlands Defence Academy - Faculty of Military Sciences",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Negotiation of front ends and back ends in NATO military advisory missions",
                    "authors": [
                      {
                        "name": "Anders Klitmøller",
                        "affiliation": "The Royal Danish Defence College",
                        "isSpeaker": true
                      },
                      {
                        "name": "Anne Obling",
                        "affiliation": "The Royal Danish Defence College"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Private Actors, Armed Conflict and the State",
                "room": "Teleconference Room",
                "conveners": [
                  {
                    "name": "Zarras Konstantinos",
                    "affiliation": "University of Macedonia"
                  }
                ],
                "contributions": [
                  {
                    "title": "Big tech at war: The infrastructural politics of public-private relations",
                    "authors": [
                      {
                        "name": "Tobias Liebetrau",
                        "affiliation": "University of Copenhagen",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "We Are Peers Now: States’ Relations with Violent Non-State Actors That Became State/Sub-State Actors",
                    "authors": [
                      {
                        "name": "Ido Gadi Raz",
                        "affiliation": "Hebrew University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Private military companies as proxy forces in international politics with special reference to the Russian Wagner Group/African Corps and its operations in Africa",
                    "authors": [
                      {
                        "name": "Theo Neethling",
                        "affiliation": "University of the Free State",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "From Revolt to Rule: Insurgency as Proto-State Formation",
                    "authors": [
                      {
                        "name": "Marnix Provoost",
                        "affiliation": "Netherlands Defense Academy",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17:00",
            "endTime": "17:30",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Poster session / Coffee break",
                "room": "Conference Room Foyer",
                "contributions": [
                  {
                    "title": "Following the Algorithmic Path to Extremism: How Social Network Analysis Can Help to Target Extremist Content Online",
                    "authors": [
                      {
                        "name": "Clara Jammot",
                        "affiliation": "King’s College London - Department of War Studies",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Overlapping Ownership and Foreign Competition in Early-Stage Innovation: Evidence from Cross-Border Investment into Mature Venture Capital Markets",
                    "authors": [
                      {
                        "name": "Nicholas Bahrich",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Digital Influence as a Continuum: How Russia Shapes Georgia’s Information Environment",
                    "authors": [
                      {
                        "name": "Appoline Roy",
                        "affiliation": "French Institute of Geopolitics / GEODE (Geopolitics of the Datasphere)",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17:30",
            "endTime": "18:30",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "keynote",
                "title": "Keynote: Will Putin and Trump finally force Europe to behave as a political adult?",
                "room": "Conference Room “Ilias Koukouvelis” | Hybrid & Recorded",
                "conveners": [
                  {
                    "name": "Loukas Tsoukalis",
                    "affiliation": "President of the Board, ELIAMEP / Professor, Sciences Po Paris / Professor Emeritus, University of Athens"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "date": "2025-06-27",
        "label": "Day 2 — Friday 27 June",
        "rows": [
          {
            "startTime": "10:00",
            "endTime": "11:25",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Defense Cooperation and Military Assistance 1: Studies in (Re)alignments",
                "room": "Conference Room “Ilias Koukouvelis”",
                "conveners": [
                  {
                    "name": "Revecca Pedi",
                    "affiliation": "University of Macedonia"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Delegation of Defense and Security Responsibilities at Sea in Historical Perspective",
                    "authors": [
                      {
                        "name": "Pieter Zhao",
                        "affiliation": "Erasmus University Rotterdam",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Do Principles Become Agents? Security Assistance between cooptation and orchestration",
                    "authors": [
                      {
                        "name": "Jean Marie Reure",
                        "affiliation": "University of Genoa",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Beyond Exit: Examining Protégés’ Intra-Alliance Bargaining Strategies",
                    "authors": [
                      {
                        "name": "Maximilian Krebs",
                        "affiliation": "University of Greifswald",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Advancing authoritarian alignment? A systematic mapping of defense diplomacy between China, Russia, North Korea, and Iran",
                    "authors": [
                      {
                        "name": "Sabine Mokry",
                        "affiliation": "Institute for Peace Research and Security Policy at the University of Hamburg",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "European Transformations in the Organization of Security",
                "room": "Teleconference Room",
                "conveners": [
                  {
                    "name": "Moritz Weiss",
                    "affiliation": "LMU Munich"
                  }
                ],
                "contributions": [
                  {
                    "title": "Belgium’s Defence Policy After the Invasion of Ukraine: A Free Rider’s Business-as-Usual Approach",
                    "authors": [
                      {
                        "name": "Michelle Haas",
                        "affiliation": "Ghent University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Tim Haesebrouck",
                        "affiliation": "Ghent University"
                      }
                    ]
                  },
                  {
                    "title": "Paradigm Paradox: How Emerging Cybersecurity Communities Moderate EU Governance",
                    "authors": [
                      {
                        "name": "Hannah-Sophie Weber",
                        "affiliation": "University of Oxford",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Geopolitical Europe: The European Union as a signaling actor in the Russia-Ukraine war",
                    "authors": [
                      {
                        "name": "Nicolas Blarel",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Niels Van Willigen",
                        "affiliation": "Leiden University"
                      }
                    ]
                  },
                  {
                    "title": "’Total Defence’ and Transformations in the Making of European Security",
                    "authors": [
                      {
                        "name": "Joakim Berndtsson",
                        "affiliation": "University of Gothenburg",
                        "isSpeaker": true
                      },
                      {
                        "name": "Andreas Kruck",
                        "affiliation": "LMU Munich"
                      },
                      {
                        "name": "Moritz Weiss",
                        "affiliation": "LMU Munich"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11:30",
            "endTime": "13:00",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Weapons of Mass Destruction: Non-Proliferation and Arms Control",
                "room": "Teleconference Room",
                "conveners": [
                  {
                    "name": "Clara Portela",
                    "affiliation": "University of Valencia"
                  }
                ],
                "contributions": [
                  {
                    "title": "Strategic Stability Without Arms Control",
                    "authors": [
                      {
                        "name": "Jamie Withorne",
                        "affiliation": "Oslo Nuclear Project, University of Oslo",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Soviet Union/Russia and the spread of the bomb",
                    "authors": [
                      {
                        "name": "Lydia Wachs",
                        "affiliation": "Stockholm University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Universalization of the Treaty on the Prohibition of Nuclear Weapons: Lessons from the CWC and BWC and the Role of Customary International Law",
                    "authors": [
                      {
                        "name": "Agata Bidas",
                        "affiliation": "University of Vienna",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Changing Pathways to the Bomb",
                    "authors": [
                      {
                        "name": "Eliza Gheorghe",
                        "affiliation": "Bilkent University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Defense Cooperation and Military Assistance 2: New Research Directions",
                "room": "Conference Room “Ilias Koukouvelis”",
                "conveners": [
                  {
                    "name": "John Helferich",
                    "affiliation": "University of Oxford"
                  }
                ],
                "contributions": [
                  {
                    "title": "Sweden and the League of Nations: The partisan contestation of national identity and collective security",
                    "authors": [
                      {
                        "name": "Zigne Edström",
                        "affiliation": "Stockholm University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Small State Defense Cooperation and Security Strategies in a Changing Global Order",
                    "authors": [
                      {
                        "name": "Revecca Pedi",
                        "affiliation": "University of Macedonia",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Common Threat, Diverging Responses? Explaining European States’ Military Spending After the War in Ukraine",
                    "authors": [
                      {
                        "name": "Tim Haesebrouck",
                        "affiliation": "Ghent University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Michelle Haas",
                        "affiliation": "Ghent University"
                      }
                    ]
                  },
                  {
                    "title": "Informal is the New Normal: Command and Control as the Choice for the Functional Source of Security Commitment",
                    "authors": [
                      {
                        "name": "Joseph Christian Agbagala",
                        "affiliation": "Center for Security Studies, ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "13:00",
            "endTime": "14:00",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Lunch",
                "room": "University Restaurant"
              }
            ]
          },
          {
            "startTime": "14:00",
            "endTime": "15:25",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Political Economy, Technology and the Defence Industry",
                "room": "Teleconference Room",
                "conveners": [
                  {
                    "name": "Kristen Harkness",
                    "affiliation": "University of St Andrews"
                  },
                  {
                    "name": "Marc De Vore",
                    "affiliation": "University of St Andrews"
                  }
                ],
                "contributions": [
                  {
                    "title": "Examining the Factors Behind the EU’s Defence Innovation System",
                    "authors": [
                      {
                        "name": "Cezary Wereszko",
                        "affiliation": "University of Nottingham",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Russian Countertrade as a Mechanism for Promoting Arms Sales and Diplomatic Influence",
                    "authors": [
                      {
                        "name": "Jonata Anicetti",
                        "affiliation": "LISD, Princeton University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Shang-Su Wu",
                        "affiliation": "Rabdan Academy"
                      },
                      {
                        "name": "Ron Matthews",
                        "affiliation": "Cranfield University"
                      }
                    ]
                  },
                  {
                    "title": "Innovation and engineering at the front: the Ukrainian case of Unmanned Systems",
                    "authors": [
                      {
                        "name": "Emilie Berthelsen",
                        "affiliation": "Royal Danish Defence College & Technical University of Denmark",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Dynamics of Defense Indigenization: state-private relations in India’s quest for self-reliance",
                    "authors": [
                      {
                        "name": "Yagnyashri Kodaru",
                        "affiliation": "LMU Munich",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Defense Cooperation and Military Assistance 3: Reforms in European Security",
                "room": "Conference Room “Ilias Koukouvelis”",
                "conveners": [
                  {
                    "name": "Michal Onderco",
                    "affiliation": "Erasmus University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Reassessing European Security: The drivers of NATO’s response to hybrid threats since 2014",
                    "authors": [
                      {
                        "name": "Laura Lisboa",
                        "affiliation": "Sciences Po Paris",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The EU’s Collective Defence Framework: A Law-in-Context Analysis of Article 42.7 TEU Amid the War in Ukraine",
                    "authors": [
                      {
                        "name": "Federica Fazio",
                        "affiliation": "Dublin City University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Can European Defence Cooperation Build European Deterrence?",
                    "authors": [
                      {
                        "name": "Fotini Bellou",
                        "affiliation": "University of Macedonia",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15:30",
            "endTime": "16:55",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 2: How to Publish in Security Journals",
                "room": "Conference Room “Ilias Koukouvelis” | Hybrid & Recorded",
                "conveners": [
                  {
                    "name": "Nicolas Blarel",
                    "affiliation": "Leiden University"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17:00",
            "endTime": "17:30",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Poster session / Coffee break",
                "room": "Conference Room Foyer",
                "contributions": [
                  {
                    "title": "Following the Algorithmic Path to Extremism: How Social Network Analysis Can Help to Target Extremist Content Online",
                    "authors": [
                      {
                        "name": "Clara Jammot",
                        "affiliation": "King’s College London - Department of War Studies",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Overlapping Ownership and Foreign Competition in Early-Stage Innovation: Evidence from Cross-Border Investment into Mature Venture Capital Markets",
                    "authors": [
                      {
                        "name": "Nicholas Bahrich",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Digital Influence as a Continuum: How Russia Shapes Georgia’s Information Environment",
                    "authors": [
                      {
                        "name": "Appoline Roy",
                        "affiliation": "French Institute of Geopolitics / GEODE (Geopolitics of the Datasphere)",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17:30",
            "endTime": "17:45",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Award of the European Security Studies Best Paper Prize",
                "room": "Conference Room “Ilias Koukouvelis” | Hybrid & Recorded",
                "conveners": [
                  {
                    "name": "In partnership with the Journal of Strategic Studies"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17:45",
            "endTime": "18:00",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Concluding Remarks",
                "room": "Conference Room “Ilias Koukouvelis” | Hybrid & Recorded",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Director of EISS / Sciences Po Paris"
                  },
                  {
                    "name": "Revecca Pedi",
                    "affiliation": "University of Macedonia"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "18:00",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Cocktail",
                "room": "The Garden"
              }
            ]
          }
        ]
      }
    ],
    "sourceNote": "Transcribed from 'Final Programme_26062025_AL.pdf' (Drive id 1_1eK_IlD3u6j2BVJ9iGfwyHZtYzPZYqZ), the final EISS 2025 Thessaloniki programme. Overview grid plus per-day detailed programme. Day 1 11:30 slot and the three Day 2 panel slots run parallel panels in two rooms; concluding remarks/award are short plenary slots.",
    "uncertain": [
      "Day 2 11:30 and 14:00 detailed-programme panels gave only some end times in the overview; end times taken from the overview grid (11:30-13:00, 14:00-15:25). The Award/Concluding slot times (17:30-17:45 / 17:45-18:00) follow the detailed programme; the overview grid shows 17:45-17:55 for concluding remarks.",
      "Day 1 keynote overview grid lists 17:00-18:30; detailed programme lists 17:30-18:30 — used the detailed-programme time.",
      "'Alexandros Chatzgeorgiou' spelled 'Chatzgeorgiou' as printed.",
      "'Zarras Konstantinos' printed surname-first as in source."
    ]
  },
  "2026":   {
    "slug": "2026",
    "year": 2026,
    "edition": "9th Annual Conference",
    "venue": "Stockholm University (D House, Lecture Hall 8), Stockholm, Sweden",
    "city": "Stockholm",
    "country": "Sweden",
    "dates": "11 - 12 June 2026",
    "startDate": "2026-06-11",
    "endDate": "2026-06-12",
    "days": [
      {
        "date": "2026-06-11",
        "label": "Day 1 — Thursday 11 June",
        "rows": [
          {
            "startTime": "09:00",
            "endTime": "09:30",
            "items": [
              {
                "kind": "break",
                "title": "Registration and Coffee",
                "room": "D House, Floor 3"
              }
            ]
          },
          {
            "startTime": "09:35",
            "endTime": "09:45",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Introductory Remarks",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Dr Hugo Meijer",
                    "affiliation": "Sciences Po CERI"
                  },
                  {
                    "name": "Sanne Verschuren",
                    "affiliation": "Boston University"
                  },
                  {
                    "name": "Julia Carver",
                    "affiliation": "Leiden University"
                  },
                  {
                    "name": "Magnus Petersson",
                    "affiliation": "Stockholm University"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "09:45",
            "endTime": "11:00",
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Taking Stock of European Security in a Rapidly Changing Geopolitical Environment",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Sanne Verschuren",
                    "affiliation": "Boston University"
                  },
                  {
                    "name": "Eliza Gheorghe",
                    "affiliation": "Bilkent University"
                  },
                  {
                    "name": "Dr John Helferich",
                    "affiliation": "University of Oxford"
                  },
                  {
                    "name": "Linde Desmaele",
                    "affiliation": "Leiden University"
                  },
                  {
                    "name": "Antulio Echevarria",
                    "affiliation": "Swedish Defence University"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11:00",
            "endTime": "11:15",
            "items": [
              {
                "kind": "break",
                "title": "Break",
                "room": "D House, Floor 3"
              }
            ]
          },
          {
            "startTime": "11:15",
            "endTime": "12:30",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Virtually Transformed? Digital Infrastructures, Competition, and Governance",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Julia Carver",
                    "affiliation": "Leiden University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Knowing cybersecurity: The epistemic infrastructural power of big tech",
                    "authors": [
                      {
                        "name": "Tobias Liebetrau",
                        "affiliation": "University of Copenhagen",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Governing cybersecurity and the politics of state control in the digital age",
                    "authors": [
                      {
                        "name": "Moritz Weiss",
                        "affiliation": "LMU Munich",
                        "isSpeaker": true
                      },
                      {
                        "name": "Ms Yagnyashri Kodaru",
                        "affiliation": "Ludwig Maximilian University of Munich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Cyber risk logics and their implications for cybersecurity",
                    "authors": [
                      {
                        "name": "Sarah Backman",
                        "affiliation": "Swedish Defence University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Dr Tim Stevens"
                      }
                    ]
                  },
                  {
                    "title": "Do Parliaments Dream of Cyber Power? Parliamentary Scrutiny in the Strategic Domain of Cyberspace",
                    "authors": [
                      {
                        "name": "Mattia Sguazzini",
                        "affiliation": "University of Genova, Italy",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "War and Peace Abroad: Security Assistance, Multilateral Operations, and Peace‑Building",
                "room": "D House, Lecture Hall 9",
                "conveners": [
                  {
                    "name": "Kersti Larsdotter",
                    "affiliation": "Swedish Defense University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Mapping Plural Visions of Peace: The Peace Cube as an Analytical Framework",
                    "authors": [
                      {
                        "name": "Yijun Xu",
                        "affiliation": "Free University of Berlin",
                        "isSpeaker": true
                      },
                      {
                        "name": "Dr Gijsbert Van Iterson Scholten",
                        "affiliation": "University of Amsterdam"
                      }
                    ]
                  },
                  {
                    "title": "Interpreting Counterterrorism in African Conflict Management",
                    "authors": [
                      {
                        "name": "Saurav Narain",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Silvia D'Amato",
                        "affiliation": "James Madison University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Socialized to Cooperate? Foreign Military Training and Coordination in UN Peacekeeping Operations",
                    "authors": [
                      {
                        "name": "Ilker Kalin",
                        "affiliation": "Stockholm University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Prof. Carla Martinez Machain",
                        "affiliation": "University at Buffalo, SUNY"
                      }
                    ]
                  },
                  {
                    "title": "From rebels’ to State’s justice: post-conflict justice choices in 2026 Syria",
                    "authors": [
                      {
                        "name": "Marie Robin",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12:30",
            "endTime": "13:25",
            "items": [
              {
                "kind": "break",
                "title": "Lunch",
                "room": "D House, Floor 3"
              }
            ]
          },
          {
            "startTime": "13:30",
            "endTime": "14:30",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Keynote by the Director of Military Intelligence and Security, Swedish Armed Forces",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Lieutenant General Thomas Nilsson",
                    "affiliation": "Swedish Air Force"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "14:35",
            "endTime": "15:50",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Nuclear Weapons in a Changing World: From Deterrence to Arms Control",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Sanne Verschuren",
                    "affiliation": "Boston University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Upload Pending? Tradeoffs, Uncertainty, and Damage-Limitation in a Multipolar Age",
                    "authors": [
                      {
                        "name": "Tyler Bowen",
                        "affiliation": "United States Naval War College",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "From Precision to Existential Risk: Hypersonic Weapons and the Erosion of the Conventional–Nuclear Divide",
                    "authors": [
                      {
                        "name": "Mr Tahir Azad",
                        "affiliation": "Department of Politics & IR, University of Reading, UK",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Legitimating the Bomb: US Efforts to Manage Public Information about Nuclear Weapons after World War II",
                    "authors": [
                      {
                        "name": "Jennifer Erickson",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Gender, Politics, and Security",
                "room": "D House, Lecture Hall 9",
                "conveners": [
                  {
                    "name": "Chiara Ruffa",
                    "affiliation": "Sciences Po"
                  }
                ],
                "contributions": [
                  {
                    "title": "The Gender politics of LIO contestation: A research Agenda",
                    "authors": [
                      {
                        "name": "Elisabetta Ginevra Iida",
                        "affiliation": "University of Padova",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "No Woman's Land: Securitisation of Female Forced Migration in Afghanistan",
                    "authors": [
                      {
                        "name": "Jéssica da Costa Pereira",
                        "affiliation": "NOVA University of Lisbon - School of Social Sciences and Humanities",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Artistic Resilience-Building in Lithuania’s Local Security Policy",
                    "authors": [
                      {
                        "name": "Anna Luisa Reinhardt",
                        "affiliation": "Sciences Po, Northern German Lutheran Church, Lithuanian Diakonija",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Gendering Non-Traditional Security: A Comparative Analysis of Sexual Violence, Reconciliation and Post-War Development in Bosnia-Herzegovina and Colombia",
                    "authors": [
                      {
                        "name": "Teodora Stoicescu",
                        "affiliation": "National University of Political Studies and Public Administration",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15:50",
            "endTime": "16:00",
            "items": [
              {
                "kind": "break",
                "title": "Coffee break",
                "room": "D House, Floor 3"
              }
            ]
          },
          {
            "startTime": "16:05",
            "endTime": "17:20",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "The Conduct of Contemporary and Future War",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Giles Moon",
                    "affiliation": "Oxford University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Learning from Ukraine: The West must be prepared for positional warfare",
                    "authors": [
                      {
                        "name": "Baptiste Alloui-Cros",
                        "affiliation": "Oxford University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Giles Moon",
                        "affiliation": "Oxford University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Conceptual Inquiry into Military Deep Operations: A Framework for Analysis",
                    "authors": [
                      {
                        "name": "Mr Martijn Rouvroije",
                        "affiliation": "Netherlands Defence Academy - Faculty of Military Sciences",
                        "isSpeaker": true
                      },
                      {
                        "name": "Martijn Rouvroije",
                        "affiliation": "Netherlands Faculty of Military Sciences",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Working in the Margins: Can Small State Special Operations contribute to Deterrence?",
                    "authors": [
                      {
                        "name": "Troels Burchall Henningsen",
                        "affiliation": "Royal Danish Defence University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Domestic Politics and Military Aid to Ukraine: Explaining Disclosure Policies in France and Germany",
                    "authors": [
                      {
                        "name": "Marius Ghincea",
                        "affiliation": "European University Institute",
                        "isSpeaker": true
                      },
                      {
                        "name": "Wolfgang Minatti",
                        "affiliation": "European University Institute"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "The Politics of Deterrence in Europe",
                "room": "D House, Lecture Hall 9",
                "conveners": [
                  {
                    "name": "Thomas Fraise",
                    "affiliation": "University of Copenhagen/Sciences Po"
                  }
                ],
                "contributions": [
                  {
                    "title": "Reconceptualizing nuclear deterrence and national identity: the cases of Finland and Sweden",
                    "authors": [
                      {
                        "name": "Emma Rosengren",
                        "affiliation": "Stockholm University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Ritual deterrence, magic strategies, and nuclear war in Europe",
                    "authors": [
                      {
                        "name": "Prof. Matthew Evangelista",
                        "affiliation": "Cornell University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Nuclear Futures, Utopias, and the Case for a Renewed ‘Strict Sufficiency’",
                    "authors": [
                      {
                        "name": "Benoît Pelopidas",
                        "affiliation": "Sciences Po",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Plus ca Change: Continuity in the French Nuclear Approach.",
                    "authors": [
                      {
                        "name": "July Decarpentrie",
                        "affiliation": "Swedish Defence University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17:30",
            "endTime": "18:30",
            "items": [
              {
                "kind": "break",
                "title": "Walking Tour of Stockholm"
              }
            ]
          }
        ]
      },
      {
        "date": "2026-06-12",
        "label": "Day 2 — Friday 12 June",
        "rows": [
          {
            "startTime": "08:45",
            "endTime": "09:00",
            "items": [
              {
                "kind": "break",
                "title": "Sign-in for Day 2 & Coffee Break",
                "room": "D House, Floor 3"
              }
            ]
          },
          {
            "startTime": "09:00",
            "endTime": "10:15",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Navigating the Job Market",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Julia Carver",
                    "affiliation": "Leiden University"
                  },
                  {
                    "name": "Chiara Libiseller",
                    "affiliation": "King's College London"
                  },
                  {
                    "name": "Jennifer Erickson",
                    "affiliation": "Boston College"
                  },
                  {
                    "name": "Magnus Petersson",
                    "affiliation": "Stockholm University"
                  },
                  {
                    "name": "Chiara Ruffa",
                    "affiliation": "Sciences Po"
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Geopolitical Power Europe: A Reality Check in Western Balkans and Eastern Neighbourhood",
                "room": "D House, Lecture Hall 9",
                "conveners": [
                  {
                    "name": "Filip Ejdus",
                    "affiliation": "University of Belgrade"
                  }
                ],
                "contributions": [
                  {
                    "title": "EU’s Ontological Security and Geopolitical Enlargement",
                    "authors": [
                      {
                        "name": "Nikolaos Tzifakis",
                        "affiliation": "University of the Peloponnese",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Geopoliticisation of EU Enlargement in the Western Balkans and Eastern Partnership: A Role-Theoretical Perspective",
                    "authors": [
                      {
                        "name": "Marko Kovačević",
                        "affiliation": "University of Belgrade",
                        "isSpeaker": true
                      },
                      {
                        "name": "Milan Varda",
                        "affiliation": "University of Belgrade",
                        "isSpeaker": true
                      },
                      {
                        "name": "Dr Tijana Rečević Krstić",
                        "affiliation": "University of Belgrade",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Filling the EU’s Identity Void from Without and Within – Forging a Geopolitics of Values",
                    "authors": [
                      {
                        "name": "Kurt Bassuener",
                        "affiliation": "Democratization Policy Council, Sarajevo",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "From Normalisation to Strategic Stabilisation: Geopolitisation of the Pristina–Belgrade Dialogue within EU Enlargement",
                    "authors": [
                      {
                        "name": "Filip Ejdus",
                        "affiliation": "University of Belgrade",
                        "isSpeaker": true
                      },
                      {
                        "name": "Alexandra Prodromidou",
                        "affiliation": "York Europe Campus, Business School"
                      },
                      {
                        "name": "Faye Ververidou",
                        "affiliation": "York Europe Campus, Business School"
                      },
                      {
                        "name": "Sonja Stojanovic Gajic",
                        "affiliation": "University of Rijeka / University of Belgrade"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "10:20",
            "endTime": "11:35",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Cyber and Digital Sovereignty",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Moritz Weiss",
                    "affiliation": "LMU Munich"
                  },
                  {
                    "name": "Eugenio Sánchez",
                    "affiliation": "Sciences Po Paris"
                  }
                ],
                "contributions": [
                  {
                    "title": "AI-Driven Cloud Monitoring and Cyber Situational Awareness in European Digital Infrastructures",
                    "authors": [
                      {
                        "name": "Prof. Daniela Mechkaroska",
                        "affiliation": "University of Information Science and Technology “St. Paul the Apostle”, Ohrid, N.Macedonia",
                        "isSpeaker": true
                      },
                      {
                        "name": "Prof. Ervin Domazet",
                        "affiliation": "International Balkan University, Faculty of Engineering"
                      }
                    ]
                  },
                  {
                    "title": "Quantum-Resilient SATIN and European Digital Sovereignty",
                    "authors": [
                      {
                        "name": "Dr Gürkan Gür",
                        "affiliation": "Zurich University of Applied Sciences ZHAW",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Classical geopolitics in cyberspace: Explaining cyber state behaviour with power position",
                    "authors": [
                      {
                        "name": "Lorenz Sommer",
                        "affiliation": "Geschwister-Scholl-Institute for Political Science, LMU Munich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "From National Incident Response to Zero Trust: Bridging Cyber Defence Policy and Technical Implementation in Wartime Ukraine",
                    "authors": [
                      {
                        "name": "Dmytro Uzlov",
                        "isSpeaker": true
                      },
                      {
                        "name": "Vladyslav Vilihura"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Stepping into the Future: Military Technology, Innovation Practices, and Contemporary Challenges",
                "room": "D House, Lecture Hall 9",
                "conveners": [
                  {
                    "name": "Jennifer Erickson",
                    "affiliation": "Boston College"
                  }
                ],
                "contributions": [
                  {
                    "title": "Selling the Future of War: Discursive Power and Military Innovation",
                    "authors": [
                      {
                        "name": "Nicolas Krieger",
                        "affiliation": "Technical University of Munich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Disclosure and Duplicity: How Technology Influences International Competition",
                    "authors": [
                      {
                        "name": "Tristan Volpe",
                        "affiliation": "IFSH University of Hamburg / Naval Postgraduate School",
                        "isSpeaker": true
                      },
                      {
                        "name": "Prof. Jane Vaynman",
                        "affiliation": "SAIS Johns Hopkins"
                      }
                    ]
                  },
                  {
                    "title": "The Self-Reliance Dilemma in Conventional Weapons: When does India Innovate Instead of Import?",
                    "authors": [
                      {
                        "name": "Ms Yagnyashri Kodaru",
                        "affiliation": "Ludwig Maximilian University of Munich",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Sending the Wrong Signals: When Armaments Worry Allies",
                    "authors": [
                      {
                        "name": "Tim Thies",
                        "affiliation": "Institute for Peace Research and Security Policy at the University of Hamburg",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11:40",
            "endTime": "12:55",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Conceptualizing Military Strategy: From Planning to War",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Chiara Libiseller",
                    "affiliation": "King's College London"
                  }
                ],
                "contributions": [
                  {
                    "title": "Fortifying the Eastern Flank:  Leveraging Historical Lessons to Create Effective Defence Systems",
                    "authors": [
                      {
                        "name": "Alexander Lanoszka",
                        "isSpeaker": true
                      },
                      {
                        "name": "Dr Michael Hunzeker",
                        "affiliation": "George Mason University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Anticipated Failure: Why States Go to War Un(der)prepared",
                    "authors": [
                      {
                        "name": "Mariya Grinberg",
                        "affiliation": "MIT",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Revisiting Multi-Domain Operations: A Historical Reflection on the Respective Roles of Combination and Prioritisation in the Conduct of War",
                    "authors": [
                      {
                        "name": "Dr Samuel Zilincik",
                        "affiliation": "Royal Danish Defence College",
                        "isSpeaker": true
                      },
                      {
                        "name": "Dr James Horncastle",
                        "affiliation": "Simon Fraser University"
                      }
                    ]
                  },
                  {
                    "title": "Influence as Strategic Infrastructure: China, NATO, and Competition Below the Threshold of War",
                    "authors": [
                      {
                        "name": "Sara Russo",
                        "affiliation": "Centre for High Defence Studies (CASD)",
                        "isSpeaker": true
                      },
                      {
                        "name": "Mrs Giulia Biselli",
                        "affiliation": "Centre for High Defence Studies (CASD)"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Politics at the Intersection of Climate, Industrialization and Security",
                "room": "D House, Lecture Hall 9",
                "conveners": [
                  {
                    "name": "Nicolas Blarel",
                    "affiliation": "Leiden University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Water In-Security and Climate Migration in Iraq  Analyzing Socio-Economic Threats",
                    "authors": [
                      {
                        "name": "Saman Omar",
                        "affiliation": "College of Humanity, University of Duhok, Kurdistan Region of Iraq",
                        "isSpeaker": true
                      },
                      {
                        "name": "Ms Dunia Baban",
                        "affiliation": "Stockholm University"
                      }
                    ]
                  },
                  {
                    "title": "Living with the nuclear:  Spatio-temporal entanglements, nuclear cultures, and the afterlives of uranium mining",
                    "authors": [
                      {
                        "name": "Elisabeth Saar",
                        "affiliation": "Hamburg University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Fragile Control: How De Facto States Degrade Nuclear Security in the Donbas",
                    "authors": [
                      {
                        "name": "Eliza Gheorghe",
                        "affiliation": "Bilkent University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Ms Isil Idrisoglu",
                        "affiliation": "University of Pittsburgh"
                      },
                      {
                        "name": "Mrs Yanina Shved-Dogrul",
                        "affiliation": "Bogazici Universitesi"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12:55",
            "endTime": "13:45",
            "items": [
              {
                "kind": "break",
                "title": "Lunch",
                "room": "D House, Floor 3"
              }
            ]
          },
          {
            "startTime": "13:45",
            "endTime": "15:00",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Military Transformation: Military Innovation and Strategic Change in the Transatlantic Context",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Magnus Petersson",
                    "affiliation": "Stockholm University"
                  }
                ],
                "contributions": [
                  {
                    "title": "From Platforms to Networks: The Political Hurdles of Transitioning to Data-Centric Warfare",
                    "authors": [
                      {
                        "name": "Mr Dumitru-Catalin Vasile",
                        "affiliation": "National School of Political and Administrative Studies, Bucharest, Romania",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "NATO as an Innovation Hub? How Emerging and Disruptive Technologies Are Reshaping Allied Innovation",
                    "authors": [
                      {
                        "name": "Vasiliki Plessia Aravani",
                        "affiliation": "Diplomatische Academie Wien, University of Vienna",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "From Rogue States to Russia: How Threat Perceptions Drove Congressional Support for Low-Yield Nuclear Weapons, 1993–2020",
                    "authors": [
                      {
                        "name": "Frank Kuhn",
                        "affiliation": "Peace Research Institute Frankfurt (PRIF)",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Vectorial Analysis of Hybrid Warfare: Directionality, Interaction, and Systemic Effects",
                    "authors": [
                      {
                        "name": "Fabio Duarte",
                        "affiliation": "Czech Technical University / Charles University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "War & Strategy: Strategic Deterrence under Duress",
                "room": "D House, Lecture Hall 9",
                "conveners": [
                  {
                    "name": "Jan Angstrom",
                    "affiliation": "Swedish Defence University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Explaining Heterogeneity in Public Support for Collective Defense in NATO: Evidence from a Cross - National Survey of Allied Countries",
                    "authors": [
                      {
                        "name": "Isabelle Haynes",
                        "affiliation": "Charles University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Dr Ondrej Rosendorf",
                        "affiliation": "Charles University"
                      },
                      {
                        "name": "Michal Smetana",
                        "affiliation": "Peace Research Center Prague / Charles University"
                      }
                    ]
                  },
                  {
                    "title": "The Confidence Trap: Leader-Advisor Deliberations and the Making of (In)Credible Threats",
                    "authors": [
                      {
                        "name": "Wendy He",
                        "affiliation": "S. Rajaratnam School of International Studies (RSIS), Nanyang Technological University (NTU)",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Cooperation under Stress: Organisational Compatibility and NATO–EU Cooperation in a Fractured Transatlantic Order",
                    "authors": [
                      {
                        "name": "Mark Rhinard",
                        "affiliation": "Stockholm University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Dr Niklas Bremberg",
                        "isSpeaker": true
                      },
                      {
                        "name": "Anna Michalski"
                      },
                      {
                        "name": "August Danielson"
                      }
                    ]
                  },
                  {
                    "title": "Small states in the current international war agenda: Between shelter seeking and souverenism",
                    "authors": [
                      {
                        "name": "Mitko Arnaudov",
                        "affiliation": "Institute of International Politics and Economics",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15:05",
            "endTime": "16:20",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Beyond the State: Securitization, Governance, and Private Actors",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Mark Rhinard",
                    "affiliation": "Stockholm University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Beyond the State: Voluntary Civilian Pro-Defence Organisations and Security Governance in Georgia",
                    "authors": [
                      {
                        "name": "Rusudan Zabakhidze",
                        "affiliation": "Swedish Defence University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "From Privateers to Private Maritime Security: Irregular Maritime Actors and the Long History of Delegated Security at Sea",
                    "authors": [
                      {
                        "name": "Pieter Zhao",
                        "affiliation": "Erasmus University Rotterdam",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Criminalising Solidarity: Border Securitisation, Non-State Actors, and Vernacular Humanitarianism in Europe",
                    "authors": [
                      {
                        "name": "Mia Abdić",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "The Strategic Logic of Violence During Negotiations",
                    "authors": [
                      {
                        "name": "Johannes Lucht",
                        "affiliation": "ETH Zurich",
                        "isSpeaker": true
                      },
                      {
                        "name": "Prof. Allard Duursma",
                        "affiliation": "ETH Zurich"
                      },
                      {
                        "name": "Evan Perkoski",
                        "affiliation": "University of Connecticut"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Extended Nuclear Deterrence through European Eyes",
                "room": "D House, Lecture Hall 9",
                "conveners": [
                  {
                    "name": "Ludovica Castelli",
                    "affiliation": "Istituto Affari Internazionali"
                  }
                ],
                "contributions": [
                  {
                    "title": "What are tactical nuclear weapons for? The multiple logics of NATO’s theater nuclear posture",
                    "authors": [
                      {
                        "name": "Linde Desmaele",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "'Europe is Not a Country': Nuclear Patronage and Eurodeterrence Concerns in the Frontline States",
                    "authors": [
                      {
                        "name": "Christopher David LaRoche",
                        "affiliation": "Carnegie Endowment for International Peace, Central European University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Patterns of Foreign Nuclear Deployment: Understanding Host State Refusal in NATO",
                    "authors": [
                      {
                        "name": "Jacklyn Majnemer",
                        "affiliation": "LSE",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Conceptualizing Nuclear Umbrellas",
                    "authors": [
                      {
                        "name": "Alexander Sorg",
                        "affiliation": "Hertie School",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "16:20",
            "endTime": "16:40",
            "items": [
              {
                "kind": "break",
                "title": "Coffee break",
                "room": "D House, Floor 3"
              }
            ]
          },
          {
            "startTime": "16:40",
            "endTime": "17:55",
            "parallel": true,
            "items": [
              {
                "kind": "session",
                "title": "Disruptive Machines: AI, Information Operations, and Cyber Security",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Dr Arthur Laudrain",
                    "affiliation": "ETH Zurich - CSS"
                  }
                ],
                "contributions": [
                  {
                    "title": "Cybercrime & AI: Resilience-by-Design in the Information Age: Tabletop Evidence on AI-Enabled Cybercrime, Coordination, and Public Trust",
                    "authors": [
                      {
                        "name": "Gil Baram",
                        "affiliation": "UC Berkeley and Bar Ilan University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Financial (In)Security, TikTok, and the Far-Right Pipeline",
                    "authors": [
                      {
                        "name": "Clara Jammot",
                        "affiliation": "King's College London",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Telegram in Russia’s Information Strategy: Evidence from Serbia",
                    "authors": [
                      {
                        "name": "Anna Seliverstova",
                        "affiliation": "Linnaeus University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Narrative Amplification, Plot Structures, and Emotions on VKontakte: Tsargrad’s Popular Geopolitics in the Russo-Ukrainian War",
                    "authors": [
                      {
                        "name": "Alexandra Brankova",
                        "affiliation": "Swedish Defence University",
                        "isSpeaker": true
                      },
                      {
                        "name": "Ms Dalia Pablo Ortiz",
                        "affiliation": "Uppsala University"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "session",
                "title": "Regional Security in the Balkans",
                "room": "D House, Lecture Hall 9",
                "conveners": [
                  {
                    "name": "Filip Ejdus",
                    "affiliation": "University of Belgrade"
                  }
                ],
                "contributions": [
                  {
                    "title": "Western Balkan Criminal Groups and the Transformation of Regional Security",
                    "authors": [
                      {
                        "name": "Dr Kire Babanoski",
                        "affiliation": "Faculty of Security - Skopje, University \"St. Kliment Ohridski\" Bitola, North Macedonia",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Peace as Stalemate: Bosnia and Herzegovina, Forever Missions and the Strategic Logic of Frozen Peace",
                    "authors": [
                      {
                        "name": "Dr SENADA ŠELO ŠABIĆ",
                        "affiliation": "Institute for Development and International Relations, Zagreb, Croatia",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Pitfalls of Transitional Justice and (In)Security in the Western Balkans: Case Study of Serbia",
                    "authors": [
                      {
                        "name": "Dr SANDRA CVIKIĆ",
                        "affiliation": "Institute of Social Sciences Ivo Pilar, Regional Center Vukovar",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Bosnia and Herzegovina on the Edge of European Stability",
                    "authors": [
                      {
                        "name": "Prof. Kenan Hodžić",
                        "affiliation": "Assistant Professor",
                        "isSpeaker": true
                      },
                      {
                        "name": "Prof. Jasmin Ahić",
                        "affiliation": "Full Professor"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "18:00",
            "endTime": "18:30",
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Concluding Remarks & Award of the European Security Studies Best Paper Prize",
                "room": "D House, Lecture Hall 8",
                "conveners": [
                  {
                    "name": "Sanne Verschuren",
                    "affiliation": "Boston University"
                  },
                  {
                    "name": "Julia Carver",
                    "affiliation": "Leiden University"
                  },
                  {
                    "name": "Moritz Weiss",
                    "affiliation": "LMU Munich"
                  },
                  {
                    "name": "Magnus Petersson",
                    "affiliation": "Stockholm University"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "18:30",
            "endTime": "19:30",
            "items": [
              {
                "kind": "session",
                "title": "Cocktail & Poster Session",
                "room": "D House, Floor 3",
                "conveners": [
                  {
                    "name": "Fiona Galvis"
                  },
                  {
                    "name": "Archishman Ray Goswami",
                    "affiliation": "DPhil International Relations, University of Oxford"
                  },
                  {
                    "name": "Lucian Bumeder",
                    "affiliation": "IFSH"
                  },
                  {
                    "name": "Gulzhan Asylbek kyzy",
                    "affiliation": "UNU-MERIT"
                  }
                ],
                "contributions": [
                  {
                    "title": "A Shadow in the Clouds: Where Is Germany’s Missile Posture Heading?",
                    "authors": [
                      {
                        "name": "Lucian Bumeder",
                        "affiliation": "IFSH",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Speak through the Nocturne: Navigating Strategic Interest in Intelligence Diplomacy",
                    "authors": [
                      {
                        "name": "Archishman Ray Goswami",
                        "affiliation": "DPhil International Relations, University of Oxford",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "“A Nuclear War Cannot be Won and Must Never be Fought”: Analyzing the U.S. Response to Russian Nuclear Threats in Ukraine",
                    "authors": [
                      {
                        "name": "Fiona Galvis",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "State fragility, power sharing institutions and group inequalities",
                    "authors": [
                      {
                        "name": "Gulzhan Asylbek kyzy",
                        "affiliation": "UNU-MERIT",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "joint-2024": {
    "slug": "joint-2024",
    "year": 2024,
    "edition": "Joint Sciences Po–EISS Conference: Origins of War and Diplomacy",
    "venue": "Salons scientifiques, Sciences Po, 1 Place St Thomas d'Aquin, 75007 Paris",
    "city": "Paris",
    "country": "France",
    "dates": "25 June 2024",
    "startDate": "2024-06-25",
    "endDate": "2024-06-25",
    "days": [
      {
        "date": "2024-06-25",
        "label": "Tuesday 25 June",
        "rows": [
          {
            "startTime": "9:15",
            "endTime": "9:30",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Coffee"
              }
            ]
          },
          {
            "startTime": "9:30",
            "endTime": "9:45",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Introductory Remarks",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Sciences Po-CERI / EISS"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "9:45",
            "endTime": "11:00",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "title": "Panel 1: Cooperation & Conflict in the Natural World",
                "conveners": [
                  {
                    "name": "Christian Lequesne",
                    "affiliation": "Sciences Po-CERI"
                  }
                ],
                "contributions": [
                  {
                    "title": "Intergroup conflict in humans and other species",
                    "authors": [
                      {
                        "name": "Carsten De Dreu",
                        "affiliation": "Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Cooperation and conflict in chimpanzees and bonobos",
                    "authors": [
                      {
                        "name": "Liran Samuni",
                        "affiliation": "German Primate Center, Göttingen",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11:00",
            "endTime": "12:15",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "title": "Panel 2: The Peace/Violence Paradox: The Evolution of Language & Self-Domestication",
                "conveners": [
                  {
                    "name": "Chiara Ruffa",
                    "affiliation": "Sciences Po-CERI"
                  }
                ],
                "contributions": [
                  {
                    "title": "The peace/violence paradox in the human species: implications for international relationships",
                    "authors": [
                      {
                        "name": "Richard Wrangham",
                        "affiliation": "Harvard University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Chimpanzee communication in conflict and cooperation: Implications for the evolution of language",
                    "authors": [
                      {
                        "name": "Katie Slocombe",
                        "affiliation": "University of York",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "12:15",
            "endTime": "13:15",
            "parallel": false,
            "items": [
              {
                "kind": "break",
                "title": "Lunch"
              }
            ]
          },
          {
            "startTime": "13:15",
            "endTime": "14:30",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "title": "Panel 3: The Origins of War & Diplomacy: Insights from Archaeology",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Sciences Po-CERI / EISS"
                  }
                ],
                "contributions": [
                  {
                    "title": "Unwritten testimony from the past: Uncovering evidence of prehistoric violence and warfare",
                    "authors": [
                      {
                        "name": "Christopher Knüsel",
                        "affiliation": "University of Bordeaux",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Bioarchaeological approaches to gendered violence in prehistoric Europe",
                    "authors": [
                      {
                        "name": "Linda Fibiger",
                        "affiliation": "University of Edinburgh",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "14:30",
            "endTime": "15:45",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "title": "Panel 4: The Origins of War & Diplomacy: Insights from Ethnography",
                "conveners": [
                  {
                    "name": "Chiara Ruffa",
                    "affiliation": "Sciences Po-CERI"
                  }
                ],
                "contributions": [
                  {
                    "title": "Clothing and deception in forager warfare",
                    "authors": [
                      {
                        "name": "William Buckner",
                        "affiliation": "University College London",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Foreign policy before the State: Diplomatic practices in prehistory",
                    "authors": [
                      {
                        "name": "Hugo Meijer",
                        "affiliation": "Sciences Po-CERI / EISS",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15:45",
            "endTime": "16:00",
            "parallel": false,
            "items": [
              {
                "kind": "session",
                "subtype": "plenary",
                "title": "Concluding Remarks",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Sciences Po-CERI / EISS"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "sourceNote": "Transcribed from 'Programme Sciences Po-EISS Conference, June 25_.pdf' (Drive id 1Uv9VeaEMPrJQ-mlblqpDXARJ43HYXpkY), the single-day joint CERI–EISS conference 'Origins of War and Diplomacy', 25 June 2024, Paris. Four panels, all sequential (no parallel sessions).",
    "uncertain": [
      "Coffee start printed as '9h15-9h30' (French notation); rendered as 9:15-9:30."
    ]
  },
  "Ukraine": {
    "slug": "Ukraine",
    "year": 2023,
    "edition": "The War in Ukraine — Lessons Learned and the Future Political Settlement (Hybrid Joint Conference)",
    "venue": "Pavillon Altman Center (Zoom & The Citadel)",
    "city": "Charleston",
    "country": "United States",
    "dates": "24 February 2023",
    "startDate": "2023-02-24",
    "endDate": "2023-02-24",
    "keynotes": [
      {
        "speaker": "Michael Kofman",
        "affiliation": "Center for Naval Analyses"
      }
    ],
    "days": [
      {
        "date": "2023-02-24",
        "label": "Friday 24 February 2023",
        "rows": [
          {
            "startTime": "08:00",
            "endTime": "08:15",
            "items": [
              {
                "kind": "session",
                "subtype": "",
                "title": "Opening Remarks",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Sciences Po & Director of the European Initiative for Security Studies"
                  },
                  {
                    "name": "Jonathan Paquin",
                    "affiliation": "Laval University & Network for Strategic Analysis"
                  },
                  {
                    "name": "Larry Valero",
                    "affiliation": "Citadel's Department of Intelligence and Security Studies"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "08:15",
            "endTime": "09:00",
            "items": [
              {
                "kind": "session",
                "subtype": "keynote",
                "title": "Keynote",
                "contributions": [
                  {
                    "title": "Keynote address",
                    "authors": [
                      {
                        "name": "Michael Kofman",
                        "affiliation": "Center for Naval Analyses",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "09:00",
            "endTime": "10:15",
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 1: Military Lessons Learned",
                "conveners": [
                  {
                    "name": "Eliza Gheorghe",
                    "affiliation": "Bilkent University"
                  }
                ],
                "contributions": [
                  {
                    "title": "Roundtable contribution",
                    "authors": [
                      {
                        "name": "Alexander Lanoszka",
                        "affiliation": "University of Waterloo",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Roundtable contribution",
                    "authors": [
                      {
                        "name": "Frans Osinga",
                        "affiliation": "War Studies Research Center & Netherlands Defence Academy & Leiden University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Roundtable contribution",
                    "authors": [
                      {
                        "name": "Hanna Shelest",
                        "affiliation": "Foreign Policy Council \"Ukrainian Prism\" & Ukraine Analytica",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "10:30",
            "endTime": "11:45",
            "items": [
              {
                "kind": "session",
                "subtype": "roundtable",
                "title": "Roundtable 2: War Termination and Post-War Settlement: What Does a Political Settlement Look Like?",
                "conveners": [
                  {
                    "name": "Jack Porter",
                    "affiliation": "The Citadel"
                  }
                ],
                "contributions": [
                  {
                    "title": "Roundtable contribution",
                    "authors": [
                      {
                        "name": "Justin Massie",
                        "affiliation": "University of Québec in Montreal",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Roundtable contribution",
                    "authors": [
                      {
                        "name": "Maria Popova",
                        "affiliation": "McGill University",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Roundtable contribution",
                    "authors": [
                      {
                        "name": "Oxana Shevel",
                        "affiliation": "Tufts University",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11:45",
            "endTime": "12:00",
            "items": [
              {
                "kind": "session",
                "subtype": "",
                "title": "Closing Remarks",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Sciences Po & Director of the European Initiative for Security Studies"
                  },
                  {
                    "name": "Jonathan Paquin",
                    "affiliation": "Laval University & Network for Strategic Analysis"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "sourceNote": "Transcribed from the final Indico programme PDF 'The War in Ukraine Lessons Learned and the Future Political Settlement (24 February 2023) · EISS - E.pdf'. Hybrid joint conference (Zoom & The Citadel, Charleston), times in America/New_York (08:00–12:00 EST). Organised by EISS, the Canadian Network for Strategic Analysis, and the Citadel's Department of Intelligence and Security Studies; conveners listed as Avinash Paliwal (SOAS), Hugo Meijer (Sciences Po CERI), Tim Sweijs (Hague Centre for Strategic Studies). Programme listed Roundtable 1 start under two times (10:15 in the agenda summary, 09:00/10:30 in the timeline); used the detailed timeline (09:00–10:15, 10:30–11:45).",
    "uncertain": [
      "Roundtable 1 chair surname printed as 'Eliza Gheorge' and affiliation 'Bikent University' (likely Eliza Gheorghe / Bilkent University) — transcribed as printed.",
      "Time slots for Roundtables 1 and 2 are inconsistent between the agenda summary and the detailed timeline in the source PDF.",
      "Roundtable speaker contributions had no individual paper titles in the programme; recorded as generic 'Roundtable contribution'."
    ]
  },
  "JPW2019": {
    "slug": "JPW2019",
    "year": 2019,
    "edition": "EISS–NDC Joint Policy Workshop — Intra-Alliance Challenges to NATO's Cohesion and European Security",
    "venue": "Institute for European Studies (Vrije Universiteit Brussel)",
    "city": "Brussels",
    "country": "Belgium",
    "dates": "22 November 2019",
    "startDate": "2019-11-22",
    "endDate": "2019-11-22",
    "days": [
      {
        "date": "2019-11-22",
        "label": "Friday 22 November 2019",
        "rows": [
          {
            "startTime": "08:45",
            "items": [
              {
                "kind": "session",
                "subtype": "",
                "title": "Registration"
              }
            ]
          },
          {
            "startTime": "09:00",
            "items": [
              {
                "kind": "session",
                "subtype": "",
                "title": "Welcome Remarks",
                "conveners": [
                  {
                    "name": "Luis Simon",
                    "affiliation": "Vrije Universiteit Brussel, Brussels"
                  },
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Sciences Po, Paris"
                  },
                  {
                    "name": "Thierry Tardy",
                    "affiliation": "NATO Defense College, Rome"
                  }
                ]
              }
            ]
          },
          {
            "startTime": "09:15",
            "endTime": "11:00",
            "items": [
              {
                "kind": "session",
                "subtype": "",
                "title": "Session I",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Sciences Po, Paris"
                  }
                ],
                "discussants": [
                  {
                    "name": "Benedetta Berti",
                    "affiliation": "NATO HQ, Brussels"
                  }
                ],
                "contributions": [
                  {
                    "title": "NATO disagreement on threat perception and strategic priorities",
                    "authors": [
                      {
                        "name": "Wojciech Michnik",
                        "affiliation": "NATO Defense College, Rome",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "NATO's 360o approach reflective of internal division",
                    "authors": [
                      {
                        "name": "Christelle Calmels",
                        "affiliation": "Sciences Po, Paris",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "European Allies' response to the Trump Presidency",
                    "authors": [
                      {
                        "name": "Mark Webber",
                        "affiliation": "University of Birmingham",
                        "isSpeaker": true
                      },
                      {
                        "name": "Jens Ringsmose",
                        "affiliation": "University of Southern Denmark"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "11:00",
            "endTime": "11:30",
            "items": [
              {
                "kind": "break",
                "title": "Coffee break"
              }
            ]
          },
          {
            "startTime": "11:30",
            "endTime": "13:15",
            "items": [
              {
                "kind": "session",
                "subtype": "",
                "title": "Session II",
                "conveners": [
                  {
                    "name": "Thierry Tardy",
                    "affiliation": "NATO Defense College, Rome"
                  }
                ],
                "discussants": [
                  {
                    "name": "Eirini Lemos-Maniati",
                    "affiliation": "NATO HQ, Brussels"
                  }
                ],
                "contributions": [
                  {
                    "title": "Explaining the US Decision to enlarge NATO",
                    "authors": [
                      {
                        "name": "Liviu Horovitz",
                        "affiliation": "Vrije Universiteit Brussel, Brussels",
                        "isSpeaker": true
                      },
                      {
                        "name": "Elias Götz",
                        "affiliation": "Uppsala University, Sweden"
                      }
                    ]
                  },
                  {
                    "title": "The Rise of Illiberalism and Potential Paths to NATO's Disintegration",
                    "authors": [
                      {
                        "name": "Tobias Bunde",
                        "affiliation": "Hertie School of Governance, Berlin",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "13:15",
            "endTime": "14:00",
            "items": [
              {
                "kind": "break",
                "title": "Lunch break"
              }
            ]
          },
          {
            "startTime": "14:00",
            "endTime": "15:45",
            "items": [
              {
                "kind": "session",
                "subtype": "",
                "title": "Session III",
                "conveners": [
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Sciences Po, Paris"
                  }
                ],
                "discussants": [
                  {
                    "name": "Alexandre Monéger",
                    "affiliation": "NATO HQ, Brussels"
                  }
                ],
                "contributions": [
                  {
                    "title": "Change in Burden-Sharing mind-set in NATO",
                    "authors": [
                      {
                        "name": "Dominika Kunertova",
                        "affiliation": "University of Southern Denmark, Odense",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "A critical appraisal of Višegrad 4 Security Potential",
                    "authors": [
                      {
                        "name": "Šárka Kolmašová",
                        "affiliation": "Metropolitan University, Prague",
                        "isSpeaker": true
                      }
                    ]
                  },
                  {
                    "title": "Collaborative Arms Procurement",
                    "authors": [
                      {
                        "name": "Marc De Vore",
                        "affiliation": "University of St Andrews",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "15:45",
            "endTime": "16:15",
            "items": [
              {
                "kind": "break",
                "title": "Coffee break"
              }
            ]
          },
          {
            "startTime": "16:15",
            "endTime": "17:45",
            "items": [
              {
                "kind": "session",
                "subtype": "",
                "title": "Session IV",
                "conveners": [
                  {
                    "name": "Elie Perot",
                    "affiliation": "Vrije Universiteit Brussel, Brussels"
                  }
                ],
                "discussants": [
                  {
                    "name": "Jessica Cox",
                    "affiliation": "NATO HQ, Brussels"
                  }
                ],
                "contributions": [
                  {
                    "title": "Citizens' attitudes to EDC in UK, France, and Germany",
                    "authors": [
                      {
                        "name": "Thomas Scotto",
                        "affiliation": "University of Strathclyde",
                        "isSpeaker": true
                      },
                      {
                        "name": "Konstantin Gavras",
                        "affiliation": "University of Mannheim"
                      }
                    ]
                  },
                  {
                    "title": "The British and German attitudes to Russia",
                    "authors": [
                      {
                        "name": "Jonas Driedger",
                        "affiliation": "European University Institute, Florence",
                        "isSpeaker": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "startTime": "17:45",
            "items": [
              {
                "kind": "session",
                "subtype": "",
                "title": "Concluding Remarks",
                "conveners": [
                  {
                    "name": "Alexander Mattelaer",
                    "affiliation": "Vrije Universiteit Brussel, Brussels"
                  },
                  {
                    "name": "Hugo Meijer",
                    "affiliation": "Sciences Po, Paris"
                  },
                  {
                    "name": "Thierry Tardy",
                    "affiliation": "NATO Defense College, Rome"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "sourceNote": "Transcribed from 'VUB-IES-EISS-NDC Conference Brussels 2019 as of 19.11.2019.pdf', the Joint Policy Workshop programme co-presented by the Institute for European Studies (Vrije Universiteit Brussel), EISS, and the NATO Defense College. Single day, Brussels, 22 November 2019. Each session lists a moderator (recorded as convener), speakers, and one NATO HQ discussant. Registration retained as an opening row; coffee and lunch breaks recorded as kind 'break'.",
    "uncertain": [
      "Session presenters not individually marked in the source; for multi-author papers the first-listed author is recorded as the speaker (isSpeaker=true)."
    ]
  }
};
