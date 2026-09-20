/* Last Whistle — the story, in order, in plain language.

You are Ren Vale. You live in Bunkhouse 4C at Blackwater Docks.
Your sibling Juno Vale has been missing for six days.

Juno left a cassette. On it they say: don't take the night fight.
If they don't come back, the ledger is in the — then a horn, then static.

What happens if you keep going:

1. Eat Juno's leftover noodles. Rent is due in seven days. You need money.
2. Foreman Brant makes you cover Juno's shift. He tells you not to look at Bay C.
3. A Bin Alley fight flyer slides under the door. You can fight for cash.
4. Kade Ruiz will coach you at the Rust Bucket for $15 a week.
5. Mae Okonkwo at the union canteen tells you Juno filed a safety complaint
   the morning they vanished. The file disappeared.
6. Oz Pell at the diner saw Juno that last night. They paid with a Harbor
   Commission chip. Juno said the Quiet Ledger is a boat, not a book.
7. Dockhand Rui points you at Juno's locker in Bay C.
8. Inside: handwraps, a photo of you both on Crane 4, and half a ledger:
   Pier 9. Quiet Ledger. Fighters used as cover. Night bell.
9. If you memorized the horn on the tape, you hear the same horn at night
   from the water. Someone is still signaling Pier 9.
10. Neon Lila fought Juno. After Juno won, Silas Crowe whispered something,
    and Crane Vargas walked Juno toward the water.
11. A shortwave radio at Oz's diner: Juno is alive on the Quiet Ledger.
    Commission moves prisoners when the arena is full. Crowe's title fight
    is a trap. Mae has a launch boat.
12. You choose: raid Pier 9 with Mae during the title fight, or take Crowe
    yourself. Beat Vargas to reach Crowe.

Endings: champ and Juno gone; Mae saves Juno; both; you get captured;
you get evicted; you get too hurt; you quit asking.

Every line below is a complete sentence a player can follow. */
(function (root) {
  const EVENTS = [
    {
      id: "intro",
      once: true,
      when: (s) => s.day === 1 && !s.flags.intro,
      set: { intro: true },
      journal: "Juno has been missing for six days. Their tape cuts off on the word ledger. Rent is due in seven days.",
      chain: [
        {
          who: "BUNKHOUSE 4C",
          text: "The alarm goes off. You are alone in the bunk. Juno has been gone for six days.",
        },
        {
          who: "TAPE",
          text: "Juno: \"Ren— don't take the night bout. If I don't come back, the ledger is in the—\"",
        },
        {
          who: "TAPE",
          text: "The tape dies. You hear static, then a horn, then someone swearing. Juno never finishes the sentence.",
        },
        {
          who: "YOU",
          text: "Six days. No badge. No barge log. Brant still has your name on Juno's shift. You have to clock in or lose the bunk.",
          choices: [
            {
              id: "up",
              label: "Get dressed and go to work.",
              set: { grit: true },
              reply: {
                who: "YOU",
                text: "You leave the tape on the blanket, pull on your boots, and get ready for the docks. If you miss the shift, you lose the bunk.",
              },
            },
            {
              id: "again",
              label: "Play the tape again. Listen to the horn.",
              set: { hornEar: true },
              journal: "The horn on the tape is Pier 9's old fog note — not the main channel.",
              reply: {
                who: "TAPE",
                text: "You play it again. The horn is longer than the main channel. You file the interval in your head and get up anyway.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "day1_nudge",
      once: true,
      when: (s) => s.day === 1 && s.flags.intro && !s.flags.ateStart,
      set: { day1Nudge: true },
      journal: "Juno left leftover noodles in the fridge. Eat those first, then go to the docks.",
      chain: [
        {
          who: "FRIDGE",
          text: "Juno left a box of noodles in the fridge. They always bought extra when a shift ran long, in case you came home hungry.",
        },
        {
          who: "YOU",
          text: "Brant will not pay a person who faints on the quay. Eat the noodles. Then walk to work.",
        },
      ],
    },
    {
      id: "flyer",
      once: true,
      when: (s) => s.flags.intro && (s.flags.ateStart || s.day > 1),
      set: { flyer: true },
      unlock: ["alley", "rustgym"],
      journal: "A Bin Alley fight card slid under the door. Cash fights. Purse goes in a hat.",
      chain: [
        {
          who: "CARD",
          text: "Someone slid a card under the door while you were eating.\nBIN ALLEY CIRCUIT — TONIGHT AND ALWAYS\nWinner takes the cash in the hat. Seagulls welcome.",
        },
        {
          who: "YOU",
          text: "Juno used to laugh at alley fight cards. Then they stopped laughing at anything with a Harbor Commission stamp. The alley still pays. Rent is still due.",
          choices: [
            {
              id: "keep",
              label: "Put the card in your jacket.",
              set: { flyerKeep: true },
              reply: { who: "YOU", text: "You pocket the card. If the docks will not pay enough, you can fight for the rest." },
            },
            {
              id: "leave",
              label: "Leave the card on the table.",
              set: { flyerLeave: true },
              reply: {
                who: "YOU",
                text: "You leave the card on the table. The alley will still be there tonight. So will the rent.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "brant_d1",
      once: true,
      when: (s) => s.loc === "docks" && s.day === 1 && s.flags.intro,
      set: { brant: true },
      chain: [
        {
          who: "FOREMAN BRANT",
          text: "Vale. You cover Juno's shift. Extra crate, extra coin. Cry on your own time.",
        },
        {
          need: (s) => s.flags.grit,
          who: "FOREMAN BRANT",
          text: "You showed up on time. That's the one thing I like about you.",
        },
        {
          who: "FOREMAN BRANT",
          text: "If Harbor Commission walks through, you saw crates. That is the job. That is the only answer.",
          choices: [
            {
              id: "nod",
              label: "I saw crates.",
              set: { brantQuiet: true },
              reply: { who: "FOREMAN BRANT", text: "Good. Stay out of Bay C. There is nothing in there for you." },
            },
            {
              id: "ask",
              label: "Where did Juno clock out?",
              set: { brantAsk: true },
              reply: {
                who: "FOREMAN BRANT",
                text: "You do not have a locker question. You have a haul. Stay out of Bay C.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "meet_kade",
      once: true,
      when: (s) => (s.wins >= 1 || s.loc === "rustgym") && !s.flags.kadeMet,
      set: { kadeMet: true },
      unlock: ["rustgym"],
      journal: "Kade Ruiz will coach you at the Rust Bucket for fifteen dollars a week. He sells timing, not hope.",
      chain: [
        {
          who: "KADE RUIZ",
          text: "You punch like a crane that got stuck. I used to be dock champ. That means I got old in public. I can still teach you how to time a punch.",
        },
        {
          need: (s) => s.flags.flyerLeave,
          who: "KADE RUIZ",
          text: "You left the alley card on a table. You still found the gym. Fine.",
        },
        {
          who: "KADE RUIZ",
          text: "Fifteen a week for the board. I do not sell hope. I sell timing.",
          choices: [
            {
              id: "yes",
              label: "I'll pay. Teach me timing.",
              set: { kadeYes: true },
              rel: { kade: 8 },
              reply: { who: "KADE RUIZ", text: "Pay the board. Then hit the pads. Do not be late." },
            },
            {
              id: "fight",
              label: "I'll learn in the alley first.",
              set: { kadeAlley: true },
              rel: { kade: 2 },
              reply: {
                who: "KADE RUIZ",
                text: "The alley will teach you. It will also bill you. Come back when your chin hurts.",
              },
            },
            {
              id: "no",
              label: "I don't need a babysitter.",
              set: { kadeNo: true },
              rel: { kade: -4 },
              reply: {
                who: "KADE RUIZ",
                text: "Babysitter. Cute. The board still costs fifteen when someone knocks you down.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "oz_intro",
      once: true,
      when: (s) => s.loc === "diner",
      set: { ozMet: true },
      journal: "Oz Pell: Juno sat at the last stool the night they vanished. They left half a waffle.",
      chain: [
        {
          who: "OZ PELL",
          text: "Other Vale. Sit down. The coffee is terrible. You already knew that.",
        },
        {
          who: "OZ PELL",
          text: "Juno sat at the last stool the night they vanished. They left half a waffle. They paid with something ugly.",
          choices: [
            {
              id: "chip",
              label: "Paid with what?",
              set: { ozChipAsk: true },
              clues: 1,
              reply: { who: "OZ PELL", text: "A Harbor Commission chip. Like a tip from a building, not a person." },
            },
            {
              id: "said",
              label: "What did they say?",
              set: { ozSaidAsk: true },
              clues: 1,
              journal: "Juno told Oz the Quiet Ledger was a boat, not a book.",
              reply: {
                who: "OZ PELL",
                text: "They said the Quiet Ledger was a boat. Then they stopped talking and left.",
              },
            },
            {
              id: "eat",
              label: "Just bring me a plate.",
              set: { ozQuiet: true },
              reply: { who: "OZ PELL", text: "Fine. Food first. I can tell you the rest later. Waffles go cold." },
            },
          ],
        },
      ],
    },
    {
      id: "mae_intro",
      once: true,
      when: (s) => s.loc === "canteen" && (s.flags.brant || s.flags.flyer),
      set: { maeMet: true },
      journal: "Mae Okonkwo: Juno filed a safety complaint the morning they vanished. The file is gone.",
      chain: [
        {
          who: "MAE OKONKWO",
          text: "Sit. Eat the stew. Then we can talk about your sibling.",
        },
        {
          need: (s) => (s.maeMeals || 0) > 0,
          who: "MAE OKONKWO",
          text: "You already found the free bowl. Good. Hungry people make bad plans.",
        },
        {
          who: "MAE OKONKWO",
          text: "Juno filed a safety complaint that morning. The file is gone. I still know where they used to keep those papers.",
          choices: [
            {
              id: "ally",
              label: "Help me find Juno.",
              set: { maeAlly: true },
              rel: { mae: 10 },
              reply: {
                who: "MAE OKONKWO",
                text: "Then we do it together. I will find the paper. You stay alive long enough to read it.",
              },
            },
            {
              id: "file",
              label: "I want the complaint file.",
              set: { maeFile: true },
              rel: { mae: 6 },
              reply: {
                who: "MAE OKONKWO",
                text: "The file is supposed to be gone. I will write down the closet address anyway. Check the docks.",
              },
            },
            {
              id: "solo",
              label: "I'll deal with Commission myself.",
              set: { maeSolo: true },
              rel: { mae: -2 },
              reply: {
                who: "MAE OKONKWO",
                text: "Handle it, then. The stew is still here when that plan fails.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "heard_locker",
      once: true,
      when: (s) => s.flags.brant && s.loc === "docks" && (s.flags.hauled || s.wins >= 1),
      set: { heardLocker: true },
      chain: [
        {
          who: "DOCKHAND RUI",
          text: "Bay C still has Juno's sticker on a locker. Brant said not to look. Brant says that about things he does not want found.",
        },
        {
          need: (s) => s.flags.brantAsk,
          who: "DOCKHAND RUI",
          text: "He told me you asked where Juno clocked out. That is how people get night shifts that do not end.",
        },
        {
          who: "DOCKHAND RUI",
          text: "I am going to stand over there and not watch you. The locker is third from the horn.",
          choices: [
            {
              id: "thanks",
              label: "I didn't hear you.",
              set: { ruiCover: true },
              rel: { mae: 1 },
              reply: { who: "DOCKHAND RUI", text: "Good. I like being unheard." },
            },
            {
              id: "press",
              label: "Who else uses Bay C?",
              set: { ruiPress: true },
              clues: 1,
              reply: {
                who: "DOCKHAND RUI",
                text: "Vargas. After dark. That is the whole rumor. Do not put my name on it.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "open_locker",
      once: true,
      when: (s) => s.flags.openedLocker,
      journal: "Juno's locker: handwraps, a photo of you both on Crane 4, and half a ledger. Pier 9 is circled.",
      chain: [
        {
          who: "LOCKER",
          text: "Juno's handwraps are knotted the way they always knot them. There is a photo of the two of you on Crane 4, grinning like idiots.",
        },
        {
          who: "LEDGER",
          text: "Half a ledger page. It says: PIER 9 — Q.L. — FIGHTERS AS COVER — NIGHT BELL. There is a smear that might be oil.",
        },
        {
          who: "YOU",
          text: "This is enough to know Juno was looking at Pier 9. It is not enough to know where they are. Take the paper or copy it.",
          choices: [
            {
              id: "take",
              label: "Take the half-ledger.",
              set: { ledgerTook: true },
              reply: { who: "YOU", text: "You put the page in your jacket. If Brant searches the locker, the paper is gone." },
            },
            {
              id: "copy",
              label: "Copy the line. Leave the paper.",
              set: { ledgerCopy: true },
              reply: {
                who: "YOU",
                text: "You write the line on your palm: Pier 9, Quiet Ledger, fighters as cover, night bell. The locker keeps the page.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "horn_echo",
      once: true,
      when: (s) => s.flags.hornEar && s.loc === "docks" && (s.hour || 8) >= 18,
      set: { hornEcho: true },
      clues: 1,
      journal: "At night on the docks you heard the same horn as the tape. It is coming from the water, not the main channel.",
      chain: [
        {
          who: "YOU",
          text: "There it is. Not the main channel. The same interval you kept from the tape. Someone is still using Pier 9's old horn.",
        },
      ],
    },
    {
      id: "lila_after",
      once: true,
      when: (s) => s.flags.beat_lila,
      set: { lilaTalk: true },
      unlock: ["crane"],
      journal: "Lila: Juno won, then went quiet. Vargas walked them toward the water.",
      rel: { lila: 12 },
      chain: [
        {
          who: "NEON LILA",
          text: "Your sibling beat me clean. Then Silas Crowe said something in their ear, and Juno went quiet like the lights had gone out.",
        },
        {
          who: "NEON LILA",
          text: "Vargas walked them toward the water after that. I do not draw maps. I can point.",
          choices: [
            {
              id: "thanks",
              label: "That's enough. Thank you.",
              set: { lilaSoft: true },
              rel: { lila: 4 },
              reply: { who: "NEON LILA", text: "It is not enough. It is what I saw." },
            },
            {
              id: "press",
              label: "Point harder. Where?",
              set: { lilaPress: true },
              clues: 1,
              reply: {
                who: "NEON LILA",
                text: "Pier 9. Hungry fighters sign papers they should not sign. Do not be one of them.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "radio",
      once: true,
      when: (s) =>
        !s.flags.radio &&
        s.flags.openedLocker &&
        (s.flags.ozOpenRadio || s.flags.ozCoil || s.clues >= 2),
      set: { radio: true },
      unlock: ["barge"],
      journal: "Shortwave: Juno is alive on the Quiet Ledger. Crowe's title fight is a trap. Mae has a launch.",
      chain: [
        {
          who: "SHORTWAVE",
          text: "Ren. It's Juno. I am on a boat called the Quiet Ledger. They move us when the arena fills up. Do not take the whistle. The title fight is a net.",
        },
        {
          who: "SHORTWAVE",
          text: "Mae knows a launch. Make noise in the lights and we can slip the hull. If you chase the title alone, they keep me as leverage.",
        },
        {
          who: "YOU",
          text: "The tape was a warning. This is a choice. Raid with Mae, or walk into Crowe's fight alone.",
          choices: [
            {
              id: "plan_mae",
              label: "We do this with Mae.",
              set: { planMae: true },
              rel: { mae: 8 },
              reply: {
                who: "YOU",
                text: "Mae takes the water. You keep Crowe busy in the lights. Split the night so they cannot hold Juno and watch you at the same time.",
              },
            },
            {
              id: "plan_solo",
              label: "I take Crowe myself.",
              set: { planSolo: true },
              reply: {
                who: "YOU",
                text: "You hang up. The plan is to win the title and force their hand. Juno said that is how the net works.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "vargas_offer",
      once: true,
      when: (s) =>
        s.fame >= 16 &&
        s.wins >= 3 &&
        (s.flags.openedLocker || s.flags.radio) &&
        !s.flags.vargasOffer,
      set: { vargasOffer: true, vargasUnlocked: true },
      unlock: ["arena"],
      chain: [
        {
          who: "CRANE VARGAS",
          text: "Crowe liked your last finish. Exhibition at the Harbor Arena. You win, you get closer to him. You lose, you still put on a show.",
        },
        {
          need: (s) => s.flags.ruiPress,
          who: "CRANE VARGAS",
          text: "Dockhands talk. I do not.",
        },
        {
          who: "CRANE VARGAS",
          text: "Juno? Inventory. Inventory does not get visitors.",
          choices: [
            {
              id: "take",
              label: "Put me on the card.",
              set: { takeVargas: true },
              reply: { who: "CRANE VARGAS", text: "Good. Show up clean. Do not ask about cargo." },
            },
            {
              id: "spit",
              label: "Where is my sibling?",
              set: { spitVargas: true },
              reply: {
                who: "CRANE VARGAS",
                text: "Cargo. Cargo does not get a loading number from me.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "mae_raid",
      once: true,
      when: (s) => s.flags.planMae && s.flags.beat_vargas,
      set: { raidReady: true },
      unlock: ["barge"],
      journal: "Mae will run a launch to Pier 9 during the title fight. You stay in the lights and keep Crowe busy.",
      chain: [
        {
          who: "MAE OKONKWO",
          text: "You want a fairy tale: we storm a barge and you still fight Crowe. I can steal a launch. I cannot make you be in two places.",
        },
        {
          need: (s) => s.flags.maeAlly,
          who: "MAE OKONKWO",
          text: "You asked for help. This is the help. I take the water. You take the lights.",
        },
        {
          need: (s) => s.flags.maeSolo,
          who: "MAE OKONKWO",
          text: "You were going to handle Commission alone. Fine. Handle the lights. I will handle the water anyway.",
        },
        {
          who: "MAE OKONKWO",
          text: "When the title bell starts, I go to Pier 9. You keep Crowe talking with your fists. After the fight, you run to the pier.",
        },
      ],
    },
    {
      id: "crowe_invite",
      once: true,
      when: (s) => (s.flags.beat_vargas || s.flags.beat_sophie) && s.fame >= 22,
      set: { croweInvite: true, croweUnlocked: true },
      chain: [
        {
          who: "SILAS CROWE",
          text: "The harbor needs a champion. You have a missing-person story. Crowds love those. Fight me. We will sell the night.",
        },
        {
          need: (s) => s.flags.spitVargas,
          who: "SILAS CROWE",
          text: "You asked Vargas a name. He does not keep those. I do.",
        },
        {
          need: (s) => s.flags.planSolo,
          who: "SILAS CROWE",
          text: "Coming alone. Good. Traps work better on people who think they are the hole in the net.",
        },
        {
          who: "SILAS CROWE",
          text: "Juno sends regards.",
        },
      ],
    },
    {
      id: "kade_style",
      once: true,
      when: (s) => s.gym === "rust" && s.rel.kade >= 12 && s.wins >= 2,
      set: { kadeStyle: true },
      journal: "Kade taught you a counter hook. Use it when they rush you.",
      chain: [
        {
          who: "KADE RUIZ",
          text: "Better. Here is a counter hook. When they rush, you tax the rush. Do not throw it every round like it is your whole personality.",
        },
        {
          need: (s) => s.flags.kadeNo,
          who: "KADE RUIZ",
          text: "Babysitter still works. You can keep the word. I keep the hook.",
        },
        {
          need: (s) => s.flags.kadeYes,
          who: "KADE RUIZ",
          text: "You paid. You showed up. That is the whole compliment.",
        },
      ],
    },
    {
      id: "rent_warn",
      once: false,
      when: (s) => s.day === s.rentDueOn - 1 && !s.flags["rentWarn" + s.rentDueOn],
      setDynamic: (s) => ({ ["rentWarn" + s.rentDueOn]: true }),
      chain: [
        {
          who: "SLIP",
          text: "Rent is due tomorrow. The bunkhouse will change the lock if you miss it twice.",
        },
      ],
    },
    {
      id: "flat_offer",
      once: true,
      when: (s) => s.money >= 80 && s.fame >= 8,
      set: { flatOffer: true },
      chain: [
        {
          who: "NOTICE",
          text: "A wharf flat is open. Seventy a week. A door that closes. You can take it from the bunk menu if you have the money.",
        },
      ],
    },
    {
      id: "temple_unlock",
      once: true,
      when: (s) => s.fame >= 18 && s.gym === "rust",
      set: { templeSeen: true },
      unlock: ["temple"],
      chain: [
        {
          who: "KADE RUIZ",
          text: "Iron Temple will take you now. Better bags. Worse politics. I will not cry. I might drink tea about it.",
        },
      ],
    },
    {
      id: "juno_tape2",
      once: true,
      when: (s) => s.flags.replayTape,
      journal: "Second listen: a laugh under the horn. That laugh is Crane Vargas.",
      chain: [
        {
          who: "TAPE",
          text: "Under the horn you hear a laugh, like a chain slipping on a winch.",
        },
        {
          who: "YOU",
          text: "You have heard that laugh since. Crane Vargas. Crowe's enforcer. He laughs when cargo moves.",
        },
      ],
    },
  ];

  const TALK = {
    mae: [
      {
        need: (s) => !s.flags.maeMet,
        who: "MAE",
        text: "Eat first. Then we can talk about your sibling.",
      },
      {
        need: (s) => s.flags.maeAlly && !s.flags.radio,
        who: "MAE OKONKWO",
        text: "Commission cards spike when Pier 9 loads after dark. I write down the times. That is not a coincidence list. That is a schedule.",
      },
      {
        need: (s) => s.flags.maeFile && !s.flags.radio,
        who: "MAE OKONKWO",
        text: "The complaint closet is behind the union board on the docks. Dust, and a stamp that says received. Nobody received it.",
      },
      {
        need: (s) => s.flags.maeSolo && !s.flags.planMae,
        who: "MAE OKONKWO",
        text: "Still handling Commission alone? File the complaint you can live with. I file the ones people die of.",
      },
      {
        need: (s) => s.flags.planMae,
        who: "MAE OKONKWO",
        text: "The launch is gassed. You keep the lights busy. I keep the water honest.",
      },
      {
        need: (s) => s.flags.planSolo,
        who: "MAE OKONKWO",
        text: "You picked the title fight. I will still have a launch, in case that plan fails.",
      },
      {
        need: () => true,
        who: "MAE OKONKWO",
        text: "The stew is the same. The docks are not. Eat, then go do the next thing on your list.",
      },
    ],
    kade: [
      {
        need: (s) => s.flags.kadeNo && s.gym !== "rust" && s.gym !== "temple",
        who: "KADE RUIZ",
        text: "Babysitter is still here. The board is still fifteen. Your chin is still going to need both.",
      },
      {
        need: (s) => s.gym !== "rust" && s.gym !== "temple",
        who: "KADE RUIZ",
        text: "Pay the board. I do not coach tourists. Fifteen a week, then we work.",
      },
      {
        need: (s) => s.flags.kadeStyle,
        who: "KADE RUIZ",
        text: "Counter when they press. Press when they pose. Drink the tea when I say.",
      },
      {
        need: (s) => s.flags.kadeAlley && s.wins < 1,
        who: "KADE RUIZ",
        text: "Alley first. Fine. Do not bring me a broken face and call it homework.",
      },
      {
        need: (s) => s.padsDay !== s.day,
        who: "KADE RUIZ",
        text: "Pads. Eight dollars. Once a day. I hold. You hit. That is how you learn timing.",
      },
      {
        need: (s) => s.flags.kadeYes,
        who: "KADE RUIZ",
        text: "You paid. Show up and hit the pads. Do not make the dues a personality.",
      },
      {
        need: () => true,
        who: "KADE RUIZ",
        text: "Your footwork is better than a workplace accident now. That is progress. Hit the bag.",
      },
    ],
    oz: [
      {
        need: (s) => !s.flags.ozMet,
        who: "OZ",
        text: "Menu is on the board. If you want to talk about Juno, sit down first.",
      },
      {
        need: (s) => s.flags.ozQuiet && !s.flags.ozSaidAsk && !s.flags.radio,
        who: "OZ PELL",
        text: "You wanted the plate. Fine. Juno said the Quiet Ledger was a boat. Now you have food and the fact.",
        set: { ozSaidAsk: true },
        clues: 1,
      },
      {
        need: (s) => s.flags.ozMet && !s.flags.ozRadioHint && !s.flags.radio,
        who: "OZ PELL",
        text: "I keep a shortwave in the storeroom for weather. Lately the weather has been saying names.",
        set: { ozRadioHint: true },
        clues: 1,
      },
      {
        need: (s) => s.flags.ozRadioHint && s.flags.openedLocker && !s.flags.radio,
        who: "OZ PELL",
        text: "Storeroom. Five minutes. If Brant asks, we were fighting about pickles.",
        set: { ozOpenRadio: true },
        clues: 1,
      },
      {
        need: (s) => s.flags.ledgerTook,
        who: "OZ PELL",
        text: "You smell like old paper. Do not put a ledger next to my syrup.",
      },
      {
        need: () => true,
        who: "OZ PELL",
        text: "Protein pile is for people who plan to get hit on purpose. That is a lifestyle. The waffle is still here.",
      },
    ],
    lila: [
      {
        need: (s) => !s.flags.beat_lila && !s.flags.lilaMet,
        who: "NEON LILA",
        text: "Juno's sibling. Put your name on the board or get out of my light.",
        set: { lilaMet: true },
      },
      {
        need: (s) => s.flags.lilaPress,
        who: "NEON LILA",
        text: "I already pointed. Pier 9. I am not going to say it a third time.",
      },
      {
        need: (s) => s.flags.beat_lila,
        who: "NEON LILA",
        text: "I already told you what I saw. Vargas walked Juno toward the water. Saying it twice does not make me a map.",
      },
      {
        need: () => true,
        who: "NEON LILA",
        text: "Crowe collects hungry fighters. Stay expensive. Do not sign the first paper they hand you.",
      },
    ],
  };

  const ENDINGS = {
    evicted: {
      title: "NO FIXED WHISTLE",
      text: "You missed rent twice. The bunkhouse changed the lock. You look for Juno from bus stops and rumors. The fight circuit forgets your name in a week. The docks do not send mail.",
    },
    broken: {
      title: "THE BELL STOPS",
      text: "The canteen doctor says stop. Juno stays a voice on a tape. You keep the tape anyway.",
    },
    glory: {
      title: "A WHISTLE OF YOUR OWN",
      text: "You beat Crowe under the Harbor lights. The crowd says your name. The barge leaves with Juno still on it. You are famous, paid, and alone. The whistle is just metal.",
    },
    rescue: {
      title: "QUIET LEDGER, LOUD DOCKS",
      text: "Mae's launch hits Pier 9 while you keep Crowe in the lights. Juno is thinner, furious, and alive. Copies of the ledger go up on every union board on the coast. Crowe's whistle looks silly in a bag. Oz keeps pouring coffee until the sun comes up.",
    },
    both: {
      title: "DOUBLE BELL",
      text: "You drop Crowe and still make the pier. Juno's laugh comes back. Harbor Commission will tell the story wrong. You will be around to correct them.",
    },
    fade: {
      title: "SHIFT CHANGE",
      text: "Too many losses. The alley board prints your name smaller. You take a full crane slot and stop asking the water questions. Some nights the horn still sounds like Pier 9.",
    },
    net: {
      title: "THE NIGHT BOUT",
      text: "The title fight was a trap, exactly as Juno said. You wake in a hull that smells like rust and liniment. The ledger gains a line with your name. Above you, a horn sounds like a tape ending.",
    },
  };

  const CINE = [
    {
      img: "cine_02_juno",
      video: "cine_02_juno",
      who: "SIX DAYS AGO",
      text: "Juno Vale stands on a gangway in a rust shirt, radio in hand. They try to warn you and do not finish the sentence.",
    },
    {
      img: "cine_tape_msg",
      video: "cine_tape_msg",
      who: "THE TAPE",
      text: "\"Ren— don't take the night bout. If I don't come back, the ledger is in the—\" Static. A horn.",
    },
    {
      img: "cine_gone",
      video: "cine_gone",
      who: "AFTER",
      text: "Six days later. Juno's badge is gone. There is no barge log. The gangway is empty. The light is still on.",
    },
    {
      img: "cine_01_harbor",
      video: "cine_01_harbor",
      who: "NOW",
      text: "You cover Juno's shift. Foreman Brant still wants two people on Crane 4. He will get you.",
    },
    {
      img: "cine_03_tape",
      video: "cine_03_tape",
      who: "BUNKHOUSE 4C",
      text: "The cassette is still on the blanket. You play it until you know the horn by heart.",
    },
    {
      img: "cine_06_home",
      video: "cine_06_home",
      who: "MORNING — DAY 1",
      text: "Rent is due in seven days. The alarm goes off. You get up.",
    },
  ];

  function boutChain(state, o) {
    const id = o && o.id;
    if (id === "tommy") {
      return [
        { who: "BIN RAT TOMMY", text: "The seagull is my cutman. You got one?" },
        {
          who: "BIN RAT TOMMY",
          text: state.flags.flyerLeave
            ? "You left the card on a table. You still came. You look like rent."
            : "The card said tonight. You look like you need the rent.",
          choices: [
            { id: "gloves", label: "Touch gloves.", set: { tommyGloves: true }, reply: { who: "TOMMY", text: "Polite. The bird hates polite." } },
            { id: "go", label: "Just ring the bell.", set: { tommyGo: true }, reply: { who: "TOMMY", text: "Fine. The hat is the purse." } },
          ],
        },
      ];
    }
    if (id === "wren") {
      return [
        { who: "PIPE WREN", text: "I used to fit pipes. Your ribs are a measurement." },
        {
          who: "PIPE WREN",
          text: "Don't take it personal. Stay on your feet.",
          choices: [
            { id: "stand", label: "I'm standing.", set: { wrenStand: true }, reply: { who: "WREN", text: "We'll see." } },
            { id: "quiet", label: "…", silent: true, set: { wrenQuiet: true }, reply: { who: "WREN", text: "Quiet. Fine. The pipe doesn't need a speech." } },
          ],
        },
      ];
    }
    if (id === "sal") {
      return [
        {
          who: "HOOK-HAND SAL",
          text: state.flags.openedLocker
            ? "You smell like Bay C paper. That is Juno's knot. The docks still bite."
            : "Hook is a nickname. The hands are real.",
          choices: [
            { id: "juno", label: "You knew Juno.", set: { salJuno: true }, reply: { who: "SAL", text: "Everybody knew Juno. Knowing them is not a map." } },
            { id: "ring", label: "Ring the bell.", set: { salRing: true }, reply: { who: "SAL", text: "That's the whole conversation." } },
          ],
        },
      ];
    }
    if (id === "nunzio") {
      return [
        {
          who: "BRICK NUNZIO",
          text: state.flags.kadeNo
            ? "Kade's babysitter sent a tourist. Cute."
            : state.flags.kadeYes
            ? "Kade's pet. This corner is still my house."
            : "This corner is my house. Don't visit.",
        },
        { who: "KADE RUIZ", text: "Don't let him walk you to the corner. That's the whole tip." },
      ];
    }
    if (id === "lila") {
      return [
        {
          who: "NEON LILA",
          text: "Pink light. You're the echo. Try not to vanish mid-round like your sibling did.",
          choices: [
            { id: "echo", label: "I'm not an echo.", set: { lilaEcho: true }, reply: { who: "NEON LILA", text: "Prove it in the light. I already did." } },
            { id: "quiet", label: "Just the round.", silent: true, set: { lilaQuiet: true }, reply: { who: "NEON LILA", text: "Good. Hungry people talk. Don't." } },
          ],
        },
      ];
    }
    if (id === "perry") {
      return [{ who: "GLASSJAW PERRY", text: "They say I have a glass chin. I say I have timing. We'll find out which is true." }];
    }
    if (id === "vargas") {
      return [
        {
          who: "CRANE VARGAS",
          text: state.flags.spitVargas
            ? "You asked a name. Inventory does not get names. You get a round."
            : "Exhibition. You win, you advertise. You lose, you still advertise.",
          choices: [
            { id: "name", label: "Say Juno's name.", set: { vargasName: true }, reply: { who: "CRANE VARGAS", text: "Cargo. Cargo moves." } },
            { id: "bell", label: "Ring the bell.", set: { vargasBell: true }, reply: { who: "CRANE VARGAS", text: "Good inventory." } },
          ],
        },
      ];
    }
    if (id === "sophie") {
      return [{ who: "IRON SOPHIE", text: "I'll file you under Later. Unless you make me rewrite the folder." }];
    }
    if (id === "crowe") {
      return [
        {
          who: "SILAS CROWE",
          text: state.flags.planSolo
            ? "Coming alone. Nets love that."
            : state.flags.planMae
            ? "You look like a person splitting a night. Crowds hate splits. I don't."
            : "Missing-person story. Crowds love those. We'll sell the night.",
          choices: [
            { id: "juno", label: "This is for Juno.", set: { croweForJuno: true }, reply: { who: "SILAS CROWE", text: "Juno sends regards." } },
            { id: "whistle", label: "This is for the title.", set: { croweForBelt: true }, reply: { who: "SILAS CROWE", text: "Honest. Honesty looks good on a poster." } },
          ],
        },
      ];
    }
    return [{ who: o.name, text: o.intro }];
  }

  function boutResult(state, o, win) {
    const id = o.id;
    if (id === "tommy") {
      if (win) return state.flags.tommyGloves ? "Tommy taps gloves again. The seagull takes the sandwich anyway." : "The purse is in the hat. The seagull stares at you until you leave.";
      return "You wake next to a bin. Tommy says rent is still due. The seagull agrees.";
    }
    if (id === "wren") {
      return win ? "Wren shakes your hand like a fitting that held." : "Your ribs have a new bruise. Wren files it under done.";
    }
    if (id === "sal") {
      if (win) return state.flags.salJuno ? "Sal says tell the locker the docks still bite. He means tell Juno, if you find them." : "Sal grins. That's the whole review.";
      return "Sal taps your cheek. Come back when the ledger is heavier.";
    }
    if (id === "nunzio") {
      return win ? (state.flags.kadeNo ? "Nunzio, through a nosebleed: the babysitter's pet has teeth." : "Nunzio says Kade's pet has teeth.") : "The corner was his house. You were the guest who left on the floor.";
    }
    if (id === "lila") {
      if (win) return state.flags.lilaEcho ? "Lila touches gloves. Not an echo. Your sibling hit like that. Then they got quiet." : "Lila touches gloves. Your sibling hit like that. Then they got quiet.";
      return "She helps you up. That is worse than the round.";
    }
    if (id === "perry") {
      return win ? "Perry sits down like a man remembering gravity." : "Chin. Timing. Tonight it was chin.";
    }
    if (id === "vargas") {
      if (win) return state.flags.vargasName || state.flags.spitVargas ? "Vargas is on the canvas. Cargo moves, he says. He still will not say Juno's name." : "Vargas hits the canvas. For a minute the inventory is you.";
      return "The lights are honest. You are not winning this fight.";
    }
    if (id === "sophie") {
      return win ? "Sophie: if you take Crowe's whistle, don't swallow it." : "A clinic. You were the demonstration.";
    }
    if (id === "crowe") {
      if (win) return state.flags.croweForJuno ? "The whistle is metal. Juno is still a person. The crowd does not know the difference." : "The whistle is metal. The man was the trap. The crowd says your name anyway.";
      return "He does not knock you out. He catalogues you.";
    }
    return win ? o.win : o.lose;
  }

  function boutBell(state, o) {
    const bells = {
      tommy: "Tommy: the hat is live.",
      wren: "Wren: stand or don't.",
      sal: "Sal: that's the conversation.",
      nunzio: "Nunzio: this corner is my house.",
      lila: "Lila: stay in the light.",
      perry: "Perry: timing.",
      vargas: "Vargas: inventory. Bell.",
      sophie: "Sophie: later starts now.",
      crowe: "Crowe: sell the night.",
    };
    return bells[o.id] || o.intro;
  }

  root.LW_STORY = { EVENTS, TALK, ENDINGS, CINE, boutChain, boutResult, boutBell };
})(typeof window !== "undefined" ? window : global);
