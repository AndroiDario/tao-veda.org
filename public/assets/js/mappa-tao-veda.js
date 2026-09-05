(function (window, document) {
  'use strict';

  var ENDPOINT = '/.netlify/functions/submit-mappa';
  var steps = [
    {
      title: 'Primo orientamento',
      fields: [
        {
          id: 'motivoCompilazione',
          label: 'Perché stai compilando questa mappa?',
          type: 'checkbox',
          required: true,
          max: 2,
          options: [
            'Curiosità personale',
            'Vorrei capire meglio il mio corpo e la mia energia',
            'Mi incuriosisce il trattamento Tao Veda',
            'Sono operatrice/operatore e mi interessa uno scambio di pratica',
            'Sono interessata/o a un futuro percorso formativo Tao Veda',
            'Sto attraversando un periodo di cambiamento o tensione',
            'Altro'
          ],
          other: true
        },
        {
          id: 'conoscenzaTaoVeda',
          label: 'Quanto conosci già Tao Veda o pratiche simili?',
          type: 'radio',
          required: true,
          options: [
            'Non conosco Tao Veda e sono qui per curiosità',
            'Conosco massaggi o trattamenti olistici, ma non Tao Veda',
            'Ho già ricevuto trattamenti corporei, energetici o ayurvedici',
            'Sono praticante, operatrice o operatore in ambito corporeo/olistico',
            'Conosco già Tao Veda o ne ho parlato direttamente'
          ]
        },
        {
          id: 'tipoRestituzione',
          label: 'Che tipo di restituzione ti sarebbe più utile ricevere?',
          type: 'radio',
          required: true,
          options: [
            'Una lettura semplice e comprensibile del mio stato attuale',
            'Un’indicazione sul tipo di lavoro corporeo o trattamento più affine a me',
            'Uno spunto per lavorare meglio su di me',
            'Un orientamento per capire se Tao Veda fa per me',
            'Un primo contatto per scambio o formazione'
          ]
        }
      ]
    },
    {
      title: 'Stato attuale: corpo, energia, presenza',
      fields: [
        {
          id: 'corpoPeriodo',
          label: 'In questo periodo, come descriveresti il tuo corpo?',
          type: 'checkbox',
          required: true,
          max: 3,
          options: [
            'Teso',
            'Stanco',
            'Pesante',
            'Rigido',
            'Irrequieto',
            'Sensibile',
            'Scarico',
            'Contratto',
            'Abbastanza stabile',
            'In cambiamento',
            'Non saprei'
          ]
        },
        {
          id: 'energiaPeriodo',
          label: 'In questo periodo, come descriveresti la tua energia?',
          type: 'checkbox',
          required: true,
          max: 3,
          options: [
            'Alterna: sale e scende velocemente',
            'Intensa, mentale, direzionata',
            'Bassa o rallentata',
            'Instabile o dispersa',
            'Trattenuta',
            'Sovraccarica',
            'Calda, reattiva, impaziente',
            'Pesante, lenta, poco mobile',
            'Sottile, sensibile, facilmente influenzabile',
            'Abbastanza equilibrata'
          ]
        },
        {
          id: 'presenzeAttuali',
          label: 'In questo momento, quanto senti presente ciascuna di queste cose? (1 = per nulla, 5 = moltissimo)',
          type: 'scale',
          required: false,
          help: 'Puoi lasciare vuota questa domanda. Serve solo alla restituzione descrittiva e non viene usata per calcolare punteggi, profili o diagnosi.',
          options: [
            'Tensione fisica',
            'Stress mentale',
            'Emozioni trattenute',
            'Bisogno di riposo',
            'Bisogno di radicamento',
            'Bisogno di leggerezza',
            'Bisogno di chiarezza',
            'Bisogno di contatto con il corpo',
            'Bisogno di silenzio',
            'Bisogno di trasformazione'
          ]
        },
        {
          id: 'zoneTensione',
          label: 'Dove senti più spesso tensione, peso o blocco?',
          type: 'checkbox',
          required: false,
          help: 'Puoi lasciare vuota questa domanda. La chiediamo soltanto per descrivere con più precisione ciò che riferisci nel presente.',
          options: [
            'Testa / fronte / mandibola',
            'Collo / cervicale',
            'Spalle',
            'Torace / respiro',
            'Diaframma',
            'Addome',
            'Schiena alta',
            'Schiena lombare',
            'Bacino',
            'Gambe',
            'Piedi',
            'Non saprei',
            'Altro'
          ],
          other: true
        }
      ]
    },
    {
      title: 'Costituzione fisica orientativa',
      fields: [
        {
          id: 'corporatura',
          label: 'La tua corporatura tende a essere...',
          type: 'radio',
          required: true,
          options: [
            'Esile, leggera, con peso che cambia facilmente',
            'Media, proporzionata, abbastanza stabile',
            'Solida, robusta, con tendenza ad accumulare peso',
            'Non saprei / nessuna delle tre'
          ]
        },
        {
          id: 'pelle',
          label: 'La tua pelle tende più spesso a essere...',
          type: 'radio',
          required: true,
          options: [
            'Secca, fredda o sensibile',
            'Calda, arrossata o reattiva',
            'Spessa, morbida, oleosa o fredda',
            'Variabile / non saprei'
          ]
        },
        {
          id: 'temperatura',
          label: 'La tua temperatura corporea percepita è più spesso...',
          type: 'radio',
          required: true,
          options: [
            'Ho spesso freddo o estremità fredde',
            'Ho spesso caldo o soffro il caldo',
            'Sono abbastanza stabile ma posso sentirmi appesantita/o dall’umidità',
            'Variabile'
          ]
        },
        {
          id: 'appetito',
          label: 'Il tuo appetito tende a essere...',
          type: 'radio',
          required: true,
          options: [
            'Variabile o irregolare',
            'Intenso, netto, a volte impaziente',
            'Lento ma costante',
            'Non saprei'
          ]
        },
        {
          id: 'digestione',
          label: 'Come descriveresti la tua digestione, di solito?',
          type: 'radio',
          required: false,
          help: 'Dato potenzialmente relativo alla salute: la risposta è facoltativa e serve solo alla restituzione manuale.',
          options: [
            'Irregolare, con tendenza a secchezza o costipazione',
            'Rapida, intensa, a volte acida o irritabile',
            'Lenta, pesante, con senso di accumulo',
            'Regolare / preferisco non rispondere'
          ]
        },
        {
          id: 'sonno',
          label: 'Il tuo sonno tende a essere...',
          type: 'radio',
          required: false,
          help: 'Dato potenzialmente relativo alla salute: la risposta è facoltativa e serve solo alla restituzione manuale.',
          options: [
            'Leggero, interrotto o variabile',
            'Breve ma abbastanza profondo',
            'Lungo, pesante o con fatica a svegliarti',
            'Regolare / non saprei'
          ]
        },
        {
          id: 'movimentoAttivita',
          label: 'Quando ti muovi o fai attività, tendi a essere...',
          type: 'radio',
          required: true,
          options: [
            'Veloce, mobile, con bisogno di cambiare',
            'Intensa/o, focalizzata/o, competitiva/o',
            'Lenta/o, costante, resistente',
            'Dipende molto dal periodo'
          ]
        },
        {
          id: 'mente',
          label: 'La tua mente tende più spesso a essere...',
          type: 'radio',
          required: true,
          options: [
            'Rapida, curiosa, talvolta dispersa',
            'Lucida, analitica, talvolta critica',
            'Calma, riflessiva, talvolta lenta ad avviarsi',
            'Alterna / non saprei'
          ]
        },
        {
          id: 'stress',
          label: 'Sotto stress, cosa emerge più facilmente?',
          type: 'radio',
          required: false,
          help: 'Puoi lasciare vuota questa domanda. Non viene usata per valutare il tuo stato psicologico o formulare inferenze cliniche.',
          options: [
            'Ansia, paura, instabilità, agitazione',
            'Irritazione, controllo, impazienza, giudizio',
            'Chiusura, pesantezza, attaccamento, inerzia',
            'Altro / non saprei'
          ]
        },
        {
          id: 'comunicazione',
          label: 'Il tuo modo di parlare o comunicare tende a essere...',
          type: 'radio',
          required: true,
          options: [
            'Veloce, ricco, a volte caotico',
            'Chiaro, diretto, tagliente',
            'Calmo, lento, misurato',
            'Molto variabile'
          ]
        },
        {
          id: 'cambiamento',
          label: 'Il tuo rapporto con il cambiamento è più vicino a...',
          type: 'radio',
          required: true,
          options: [
            'Mi attiva, ma può destabilizzarmi',
            'Lo affronto se vedo una direzione chiara',
            'Lo digerisco lentamente e ho bisogno di tempo',
            'Dipende dal tipo di cambiamento'
          ]
        }
      ]
    },
    {
      title: 'Le cinque qualità in movimento (e lo spazio)',
      fields: [
        {
          id: 'qualitaMovimenti',
          label: 'Quanto riconosci in te queste qualità in questo periodo? (1 = non la riconosco, 5 = molto presente)',
          type: 'scale',
          required: true,
          options: [
            'Movimento, desiderio di agire, bisogno di cambiare',
            'Calore, intensità, direzione, trasformazione',
            'Nutrimento, cura, bisogno di stabilità',
            'Apertura, respiro, lasciare andare',
            'Profondità, paura/fiducia, forza interiore',
            'Silenzio, ascolto, spazio, osservazione'
          ]
        },
        {
          id: 'fraseVicina',
          label: 'Quale frase senti più vicina oggi?',
          type: 'radio',
          required: true,
          options: [
            'Ho bisogno di muovermi, scegliere, uscire da una stasi',
            'Ho bisogno di ammorbidire intensità, controllo o pressione',
            'Ho bisogno di sentirmi sostenuta/o e radicata/o',
            'Ho bisogno di lasciare andare qualcosa',
            'Ho bisogno di ritrovare fiducia e forza interiore',
            'Ho bisogno di silenzio, ascolto e presenza'
          ]
        }
      ]
    },
    {
      title: 'Livello di lavoro desiderato',
      fields: [
        {
          id: 'livelloAscolto',
          label: 'Su quale livello senti più bisogno di ascolto o riequilibrio?',
          type: 'radio',
          required: true,
          options: [
            'Mentale / intellettuale: pensieri, controllo, analisi, sovraccarico',
            'Emotivo: emozioni trattenute, sensibilità, bisogno di lasciare scorrere',
            'Energetico / generativo: vitalità, desiderio, creatività, forza interiore, relazione con il corpo',
            'Fisico / fisiologico: tensioni, respiro, riposo, peso, presenza corporea',
            'Non saprei: vorrei scoprirlo attraverso l’ascolto'
          ]
        },
        {
          id: 'esperienzaUtile',
          label: 'Che tipo di esperienza immagini possa esserti utile?',
          type: 'checkbox',
          required: true,
          max: 3,
          options: [
            'Rilassamento profondo',
            'Radicamento',
            'Alleggerimento mentale',
            'Scioglimento delle tensioni',
            'Riconnessione al corpo',
            'Maggiore energia',
            'Maggiore calma',
            'Lasciare andare emozioni o pesi',
            'Sentire confini più chiari',
            'Recuperare fiducia',
            'Entrare in una pratica più consapevole'
          ]
        },
        {
          id: 'modalitaAccompagnamento',
          label: 'Quale modalità di accompagnamento senti più adatta?',
          type: 'radio',
          required: true,
          options: [
            'Delicata, lenta, contenitiva',
            'Profonda ma graduale',
            'Energizzante e riattivante',
            'Silenziosa e meditativa',
            'Con qualche parola di orientamento prima/dopo',
            'Non saprei, vorrei essere accompagnata/o nella scelta'
          ]
        }
      ]
    },
    {
      title: 'Confini, sicurezza, rispetto',
      fields: [
        {
          id: 'zoneEscluse',
          label: 'C\'è qualcosa che desideri segnalare già ora su come preferisci essere accompagnata/o? Zone, tipi di tocco, temi o limiti.',
          type: 'checkbox',
          required: false,
          options: [
            'Preferisco parlarne direttamente nel colloquio',
            'Nessun limite specifico da segnalare ora',
            'Non sto chiedendo un trattamento, sto solo compilando la mappa',
            'Altro'
          ],
          other: true,
          exclusiveOptions: [
            'Nessun limite specifico da segnalare ora',
            'Non sto chiedendo un trattamento, sto solo compilando la mappa'
          ],
          help: 'La risposta è facoltativa e potenzialmente delicata. Serve solo alla restituzione descrittiva, non costituisce una candidatura e non autorizza alcun contatto corporeo.'
        },
        {
          id: 'attenzioniFisiche',
          label: 'Ci sono condizioni fisiche, sensibilità o attenzioni che vuoi segnalare già ora?',
          type: 'textarea',
          required: false,
          help: 'La risposta è facoltativa. Non inserire diagnosi, referti o informazioni mediche dettagliate: per la Mappa non sono necessarie.'
        },
        {
          id: 'allergieSensibilita',
          label: 'Ci sono allergie o sensibilità a oli, profumi, lattice o materiali a contatto con la pelle?',
          type: 'radio',
          required: false,
          help: 'Dato potenzialmente relativo alla salute: puoi lasciarlo vuoto. Non serve a valutare l’accesso a uno scambio.',
          options: [
            'No',
            'Sì, preferisco segnalarle',
            'Non so',
            'Non rilevante: non sto chiedendo un trattamento'
          ]
        },
        {
          id: 'confermaNonDiagnosi',
          label: 'Confermi di aver compreso che questa mappa non è una diagnosi e non sostituisce figure mediche, psicologiche o terapeutiche?',
          type: 'single-checkbox',
          required: true,
          option: 'Sì, ho compreso'
        }
      ]
    },
    {
      title: 'Relazione con Tao Veda',
      fields: [
        {
          id: 'passoSuccessivo',
          label: 'Dopo aver ricevuto la tua mappa, quale passo potrebbe interessarti?',
          type: 'checkbox',
          required: true,
          options: [
            'Leggere un approfondimento su Tao Veda',
            'Capire, in futuro, come potrebbe essere per me un trattamento Tao Veda (senza alcun impegno)',
            'Fare una prima conversazione conoscitiva',
            'Proporre uno scambio tra operatrici/operatori',
            'Sapere quando partiranno incontri o percorsi formativi',
            'Ricevere materiali e aggiornamenti sul progetto',
            'Nessuno per ora: mi interessa solo il risultato'
          ]
        },
        {
          id: 'ambitoOperatore',
          label: 'Se sei operatrice, operatore o praticante, in quale ambito lavori o ti stai formando?',
          type: 'checkbox',
          required: false,
          condition: shouldShowOperatorField,
          options: [
            'Massaggio',
            'Discipline bionaturali',
            'Yoga / meditazione',
            'Shiatsu / MTC / riflessologia',
            'Ayurveda',
            'Counseling / relazione d’aiuto non clinica',
            'Ambito sanitario o psicologico',
            'Altro',
            'Non sono operatrice/operatore, ma sono interessata/o'
          ],
          other: true
        },
        {
          id: 'scambioCollaborazione',
          label: 'Che tipo di scambio o collaborazione immagini?',
          type: 'checkbox',
          required: false,
          condition: shouldShowCollaborationField,
          options: [
            'Scambio trattamento per trattamento',
            'Confronto sul metodo',
            'Formazione futura',
            'Collaborazione culturale/comunicativa',
            'Partecipazione a incontri di pratica',
            'Non so ancora'
          ]
        }
      ]
    },
    {
      title: 'Dati minimi di contatto',
      fields: [
        {
          id: 'nome',
          label: 'Nome',
          type: 'text',
          required: true,
          autocomplete: 'name'
        },
        {
          id: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          autocomplete: 'email'
        },
        {
          id: 'telefono',
          label: 'Numero di telefono',
          type: 'tel',
          required: false,
          condition: shouldShowContactDetails,
          help: 'Facoltativo. Compare solo perché hai chiesto un contatto successivo; per ricevere la Mappa basta l’email.',
          autocomplete: 'tel'
        },
        {
          id: 'preferenzaContatto',
          label: 'Come preferisci essere ricontattata/o, se necessario?',
          type: 'radio',
          required: false,
          condition: shouldShowContactDetails,
          options: [
            'Email',
            'WhatsApp',
            'Telegram',
            'Telefono',
            'Preferisco non essere contattata/o, salvo invio del risultato'
          ]
        },
        {
          id: 'consensoServizio',
          label: 'Ho letto l’informativa privacy e chiedo l’elaborazione della Mappa e l’invio della restituzione manuale via email.',
          type: 'single-checkbox',
          required: true,
          option: 'Acconsento all’elaborazione della Mappa',
          help: 'Questo consenso copre il servizio richiesto. Le risposte grezze vengono cancellate entro 90 giorni dalla ricezione.'
        },
        {
          id: 'consensoDatiParticolari',
          label: 'Alcune risposte possono rivelare dati relativi alla salute o altri dati particolarmente delicati. Acconsento esplicitamente al loro trattamento per preparare la restituzione.',
          type: 'single-checkbox',
          required: true,
          option: 'Acconsento esplicitamente al trattamento dei dati particolari',
          help: 'È un consenso distinto. Puoi evitare di compilare i campi delicati facoltativi e revocare il consenso scrivendo a info@tao-veda.org.'
        },
        {
          id: 'consensoAggiornamenti',
          label: 'Facoltativo: desidero ricevere in futuro aggiornamenti su contenuti e iniziative Tao Veda.',
          type: 'single-checkbox',
          required: false,
          option: 'Acconsento agli aggiornamenti futuri',
          help: 'Questo consenso è separato dalla Mappa, non condiziona la restituzione e può essere revocato in qualsiasi momento.'
        }
      ]
    }
  ];

  var stepIntroductions = [
    'Partiamo dalla tua curiosità: che cosa ti porta qui e quale restituzione desideri.',
    'Descrivi il momento presente. Le parole che scegli aiutano a formulare domande, senza attribuire cause alle sensazioni.',
    'Queste domande raccolgono il tuo modo di percepire ritmi e caratteristiche corporee. Le risposte restano descrittive, senza assegnarti una costituzione o una diagnosi.',
    'Le qualità sono immagini della ricerca Tao Veda: usale per osservarti, senza cercare una categoria in cui riconoscerti per sempre.',
    'Esplora ciò che desideri approfondire. Indicare una preferenza non equivale a richiedere una prestazione o prevedere un risultato.',
    'Scegli che cosa condividere sui tuoi limiti. Le domande delicate sono facoltative; le risposte non autorizzano alcun contatto corporeo.',
    'Puoi indicare se desideri studiare, conversare o proporre uno scambio. Queste preferenze restano distinte dalla restituzione della Mappa.',
    'Nome ed email permettono a Dario di scriverti. I consensi hanno scopi distinti; gli aggiornamenti futuri sono facoltativi.'
  ];
  var currentStep = 0;
  var state = {};
  var form = document.getElementById('mappa-form');
  var content = document.getElementById('mappa-step-content');
  var stepLabel = document.getElementById('mappa-step-label');
  var stepTitle = document.getElementById('mappa-step-title');
  var progressFill = document.getElementById('mappa-progressbar-fill');
  var prevButton = document.getElementById('mappa-prev');
  var nextButton = document.getElementById('mappa-next');
  var submitButton = document.getElementById('mappa-submit');
  var errorBox = document.getElementById('mappa-error');
  var statusBox = document.getElementById('mappa-status');
  var successBox = document.getElementById('mappa-success');

  if (!form || !content) {
    return;
  }

  function shouldShowOperatorField(values) {
    return hasAny(values.motivoCompilazione, [
      'Sono operatrice/operatore e mi interessa uno scambio di pratica',
      'Sono interessata/o a un futuro percorso formativo Tao Veda'
    ]) ||
      values.conoscenzaTaoVeda === 'Sono praticante, operatrice o operatore in ambito corporeo/olistico' ||
      hasAny(values.passoSuccessivo, [
        'Proporre uno scambio tra operatrici/operatori',
        'Sapere quando partiranno incontri o percorsi formativi'
      ]);
  }

  function shouldShowCollaborationField(values) {
    return hasAny(values.passoSuccessivo, [
      'Proporre uno scambio tra operatrici/operatori',
      'Sapere quando partiranno incontri o percorsi formativi'
    ]);
  }

  function shouldShowContactDetails(values) {
    return hasAny(values.passoSuccessivo, [
      'Fare una prima conversazione conoscitiva',
      'Proporre uno scambio tra operatrici/operatori'
    ]);
  }

  function hasAny(value, options) {
    if (!Array.isArray(value)) {
      return false;
    }

    return options.some(function (option) {
      return value.indexOf(option) !== -1;
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function slug(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function getVisibleFields(step) {
    return step.fields.filter(function (field) {
      return !field.condition || field.condition(state);
    });
  }

  function renderStep() {
    var step = steps[currentStep];
    var fields = getVisibleFields(step);

    stepLabel.textContent = 'Sezione ' + (currentStep + 1) + ' di ' + steps.length;
    stepTitle.textContent = step.title;
    document.getElementById('mappa-step-intro').textContent = stepIntroductions[currentStep];
    progressFill.style.width = (((currentStep + 1) / steps.length) * 100) + '%';
    content.innerHTML = fields.map(renderField).join('');

    prevButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep === steps.length - 1;
    submitButton.hidden = currentStep !== steps.length - 1;
    clearError();
  }

  function renderField(field) {
    var required = field.required ? '<span class="mappa-required">Obbligatorio</span>' : '<span class="mappa-optional">Facoltativo</span>';
    var max = field.max ? '<span class="mappa-limit">Massimo ' + field.max + ' selezioni</span>' : '';
    var help = field.help ? '<p class="mappa-help">' + escapeHtml(field.help) + '</p>' : '';

    return '<fieldset class="mappa-field" data-field="' + escapeHtml(field.id) + '">' +
      '<legend id="' + field.id + '-label">' + escapeHtml(field.label) + '</legend>' +
      '<div class="mappa-meta">' + required + max + '</div>' +
      renderControl(field) +
      help + '<p class="mappa-field-error" id="' + field.id + '-error" hidden></p>' +
      '</fieldset>';
  }

  function renderControl(field) {
    if (field.type === 'text' || field.type === 'email' || field.type === 'tel') {
      return '<input class="mappa-input" aria-labelledby="' + field.id + '-label" type="' + field.type + '" id="' + field.id + '" name="' + field.id + '" value="' + escapeHtml(state[field.id] || '') + '"' +
        (field.autocomplete ? ' autocomplete="' + field.autocomplete + '"' : '') + '>';
    }

    if (field.type === 'textarea') {
      return '<textarea class="mappa-input" aria-labelledby="' + field.id + '-label" id="' + field.id + '" name="' + field.id + '" rows="5">' + escapeHtml(state[field.id] || '') + '</textarea>';
    }

    if (field.type === 'single-checkbox') {
      return '<label class="mappa-choice mappa-choice-single">' +
        '<input type="checkbox" name="' + field.id + '" value="true"' + (state[field.id] ? ' checked' : '') + '>' +
        '<span>' + escapeHtml(field.option) + '</span>' +
        '</label>';
    }

    if (field.type === 'scale') {
      return '<div class="mappa-scale">' + field.options.map(function (option) {
        var itemValue = state[field.id] && state[field.id][option];

        return '<div class="mappa-scale-row">' +
          '<span>' + escapeHtml(option) + '</span>' +
          '<div class="mappa-scale-options" role="radiogroup" aria-label="' + escapeHtml(option) + '">' +
          [1, 2, 3, 4, 5].map(function (number) {
            return '<label><input type="radio" name="' + field.id + '__' + slug(option) + '" data-scale-field="' + field.id + '" data-scale-key="' + escapeHtml(option) + '" value="' + number + '"' + (Number(itemValue) === number ? ' checked' : '') + '><span>' + number + '</span></label>';
          }).join('') +
          '</div>' +
          '</div>';
      }).join('') + '</div>';
    }

    var optionsHtml = '<div class="mappa-options">' + field.options.map(function (option) {
      var checked = field.type === 'checkbox'
        ? Array.isArray(state[field.id]) && state[field.id].indexOf(option) !== -1
        : state[field.id] === option;

      return '<label class="mappa-choice">' +
        '<input type="' + field.type + '" name="' + field.id + '" value="' + escapeHtml(option) + '"' + (checked ? ' checked' : '') + '>' +
        '<span>' + escapeHtml(option) + '</span>' +
        '</label>';
    }).join('') + '</div>';

    if (field.other) {
      optionsHtml += renderOtherInput(field);
    }

    return optionsHtml;
  }

  function renderOtherInput(field) {
    var otherValue = state[field.id + 'Altro'] || '';
    var visible = isOtherSelected(field);

    return '<div class="mappa-other" data-other-for="' + escapeHtml(field.id) + '"' + (visible ? '' : ' hidden') + '>' +
      '<label class="mappa-other-label" for="' + field.id + '__altro">Specifica pure, se vuoi</label>' +
      '<input class="mappa-input" type="text" id="' + field.id + '__altro" name="' + field.id + '__altro" maxlength="200" value="' + escapeHtml(otherValue) + '">' +
      '</div>';
  }

  function isOtherSelected(field) {
    var value = state[field.id];

    if (Array.isArray(value)) {
      return value.indexOf('Altro') !== -1;
    }

    return value === 'Altro';
  }

  function toggleOtherInputs() {
    getVisibleFields(steps[currentStep]).forEach(function (field) {
      if (!field.other) {
        return;
      }

      var block = content.querySelector('.mappa-other[data-other-for="' + field.id + '"]');

      if (!block) {
        return;
      }

      var altroInput = form.querySelector('input[name="' + field.id + '"][value="Altro"]');
      block.hidden = !(altroInput && altroInput.checked);
    });
  }

  function saveCurrentStep() {
    getVisibleFields(steps[currentStep]).forEach(function (field) {
      var value;

      if (field.type === 'checkbox') {
        value = Array.prototype.slice.call(form.querySelectorAll('input[name="' + field.id + '"]:checked')).map(function (input) {
          return input.value;
        });
      } else if (field.type === 'radio') {
        value = form.querySelector('input[name="' + field.id + '"]:checked');
        value = value ? value.value : '';
      } else if (field.type === 'single-checkbox') {
        value = !!form.querySelector('input[name="' + field.id + '"]:checked');
      } else if (field.type === 'scale') {
        value = {};
        field.options.forEach(function (option) {
          var input = Array.prototype.slice.call(form.querySelectorAll('input[data-scale-field="' + field.id + '"]:checked')).find(function (item) {
            return item.getAttribute('data-scale-key') === option;
          });
          value[option] = input ? Number(input.value) : null;
        });
      } else {
        value = (form.elements[field.id] && form.elements[field.id].value || '').trim();
      }

      state[field.id] = value;

      if (field.other) {
        var altroInput = form.querySelector('input[name="' + field.id + '__altro"]');
        state[field.id + 'Altro'] = (isOtherSelected(field) && altroInput) ? altroInput.value.trim() : '';
      }
    });
  }

  function validateCurrentStep() {
    var fields = getVisibleFields(steps[currentStep]);
    var firstInvalid = null;
    var invalidMessage = '';

    saveCurrentStep();

    fields.forEach(function (field) {
      var isValid = validateField(field);
      var container = content.querySelector('[data-field="' + field.id + '"]');

      if (container) {
        container.classList.toggle('is-invalid', !isValid.valid);
        var fieldError = container.querySelector('.mappa-field-error');
        fieldError.textContent = isValid.message || '';
        fieldError.hidden = isValid.valid;
        container.querySelectorAll('input, textarea, select').forEach(function (input) {
          input.setAttribute('aria-invalid', String(!isValid.valid));
          if (!isValid.valid) input.setAttribute('aria-describedby', field.id + '-error');
          else input.removeAttribute('aria-describedby');
        });
      }

      if (!isValid.valid && !firstInvalid) {
        firstInvalid = container;
        invalidMessage = isValid.message;
      }
    });

    if (firstInvalid) {
      showError(invalidMessage || 'Controlla i campi obbligatori prima di continuare.');
      var invalidInput = firstInvalid.querySelector('input, textarea, select');
      if (invalidInput) invalidInput.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    clearError();
    return true;
  }

  function validateField(field) {
    var value = state[field.id];

    if (!field.required && field.type === 'scale' && value && field.options.every(function (option) { return !value[option]; })) {
      return { valid: true };
    }

    if (!field.required && (value === '' || value === false || value == null || (Array.isArray(value) && value.length === 0))) {
      return { valid: true };
    }

    if (field.type === 'checkbox') {
      if (!Array.isArray(value) || value.length === 0) {
        return { valid: false, message: 'Seleziona almeno una opzione.' };
      }

      if (field.max && value.length > field.max) {
        return { valid: false, message: 'Puoi selezionare al massimo ' + field.max + ' opzioni.' };
      }
    } else if (field.type === 'single-checkbox') {
      if (field.required && value !== true) {
        return { valid: false, message: 'Conferma il consenso richiesto per continuare.' };
      }
    } else if (field.type === 'scale') {
      if (!value || field.options.some(function (option) { return !value[option]; })) {
        return { valid: false, message: 'Completa tutti i valori da 1 a 5.' };
      }
    } else if (field.type === 'email') {
      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { valid: false, message: 'Inserisci un indirizzo email valido.' };
      }
    } else if (field.required && !value) {
      return { valid: false, message: 'Compila il campo obbligatorio.' };
    }

    return { valid: true };
  }

  function enforceCheckboxLimits(event) {
    var input = event.target;
    var field;
    var checked;

    if (!input.matches('input[type="checkbox"]')) {
      return;
    }

    field = getVisibleFields(steps[currentStep]).find(function (item) {
      return item.id === input.name;
    });

    if (!field) {
      return;
    }

    applyExclusiveCheckboxOptions(input, field);

    if (!field.max) {
      return;
    }

    checked = form.querySelectorAll('input[name="' + field.id + '"]:checked');

    if (checked.length > field.max) {
      input.checked = false;
      showError('Puoi selezionare al massimo ' + field.max + ' opzioni per questa domanda.');
    } else {
      clearError();
    }
  }

  function applyExclusiveCheckboxOptions(input, field) {
    var exclusiveOptions = field.exclusiveOptions || [];
    var selectedIsExclusive = exclusiveOptions.indexOf(input.value) !== -1;
    var inputs;

    if (!input.checked || !exclusiveOptions.length) {
      return;
    }

    inputs = Array.prototype.slice.call(form.querySelectorAll('input[name="' + field.id + '"]'));

    inputs.forEach(function (item) {
      if (item === input) {
        return;
      }

      if (selectedIsExclusive || exclusiveOptions.indexOf(item.value) !== -1) {
        item.checked = false;
      }
    });
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.textContent = '';
    errorBox.hidden = true;
  }

  function setStatus(message) {
    statusBox.textContent = message || '';
  }

  function buildPayload() {
    var honeypot = document.getElementById('mappa-check');

    return {
      website: honeypot ? honeypot.value : '',
      nome: state.nome || '',
      email: state.email || '',
      telefono: state.telefono || '',
      preferenzaContatto: state.preferenzaContatto || '',
      motivoCompilazione: state.motivoCompilazione || [],
      risposte: state,
      consensi: {
        servizio: !!state.consensoServizio,
        datiParticolari: !!state.consensoDatiParticolari,
        aggiornamenti: !!state.consensoAggiornamenti,
        nonDiagnosi: !!state.confermaNonDiagnosi
      }
    };
  }

  function submitForm(event) {
    event.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    submitButton.disabled = true;
    prevButton.disabled = true;
    setStatus('Invio in corso...');
    clearError();

    window.fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buildPayload())
    })
      .then(function (response) {
        return response.json().catch(function () {
          return { ok: false };
        }).then(function (body) {
          if (!response.ok || !body.ok) {
            throw new Error(body.error || 'Errore durante l’invio.');
          }

          return body;
        });
      })
      .then(function () {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'compilazione_mappa'
        });

        form.hidden = true;
        successBox.hidden = false;
        successBox.focus({ preventScroll: true });
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch(function (error) {
        showError(error && error.message ? error.message : 'Non è stato possibile inviare la mappa. Riprova tra poco o scrivi a info@tao-veda.org.');
        submitButton.disabled = false;
        prevButton.disabled = false;
      })
      .finally(function () {
        setStatus('');
      });
  }

  content.addEventListener('change', enforceCheckboxLimits);
  content.addEventListener('change', toggleOtherInputs);
  nextButton.addEventListener('click', function () {
    if (validateCurrentStep()) {
      currentStep += 1;
      renderStep();
      stepTitle.focus({ preventScroll: true });
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  prevButton.addEventListener('click', function () {
    saveCurrentStep();
    currentStep -= 1;
    renderStep();
    stepTitle.focus({ preventScroll: true });
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  form.addEventListener('submit', submitForm);

  renderStep();
}(window, document));
